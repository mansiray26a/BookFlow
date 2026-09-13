import { prisma } from '../config/db';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export class CirculationService {
  /**
   * Issue a book copy to a user with strict transactional safety
   */
  static async issueBook(copyBarcode: string, userId: string, adminUserId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify User existence & status
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true, facultyProfile: true },
      });

      if (!user) throw new NotFoundError('User not found.');
      if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
        throw new ForbiddenError(`Cannot issue book. Account status is '${user.status}'.`);
      }

      // 2. Fetch Library Policy settings
      const settings = await tx.librarySetting.findFirst() || {
        studentMaxLoans: 3,
        facultyMaxLoans: 10,
        studentLoanDays: 14,
        facultyLoanDays: 30,
      };

      const maxLoans = user.role === 'FACULTY' ? settings.facultyMaxLoans : settings.studentMaxLoans;
      const loanDays = user.role === 'FACULTY' ? settings.facultyLoanDays : settings.studentLoanDays;

      // 3. Verify Active Loans Count
      const activeLoansCount = await tx.issueRecord.count({
        where: { userId: user.id, status: { in: ['ISSUED', 'OVERDUE'] } },
      });

      if (activeLoansCount >= maxLoans) {
        throw new BadRequestError(`Borrowing limit reached. Maximum allowed loans for ${user.role}: ${maxLoans}.`);
      }

      // 4. Verify Unpaid Fines Threshold
      const unpaidFines = await tx.fine.aggregate({
        where: { userId: user.id, status: 'UNPAID' },
        _sum: { fineAmount: true },
      });

      if ((unpaidFines._sum.fineAmount || 0) > 100) {
        throw new ForbiddenError(`User has unpaid fines totaling $${unpaidFines._sum.fineAmount}. Fines must be resolved before borrowing.`);
      }

      // 5. Verify Copy availability
      const copy = await tx.bookCopy.findUnique({
        where: { barcode: copyBarcode },
        include: { book: true },
      });

      if (!copy) throw new NotFoundError(`Book copy barcode '${copyBarcode}' not found.`);
      if (copy.status !== 'AVAILABLE') {
        throw new BadRequestError(`Copy barcode '${copyBarcode}' is currently '${copy.status}' and cannot be issued.`);
      }

      // 6. Calculate Due Date
      const issueDate = new Date();
      const dueDate = new Date(issueDate.getTime() + loanDays * 24 * 60 * 60 * 1000);

      // 7. Update Copy Status to ISSUED
      await tx.bookCopy.update({
        where: { id: copy.id },
        data: { status: 'ISSUED' },
      });

      // 8. Create Issue Record
      const issue = await tx.issueRecord.create({
        data: {
          userId: user.id,
          copyId: copy.id,
          issueDate,
          dueDate,
          status: 'ISSUED',
          issuedBy: adminUserId,
        },
        include: { copy: { include: { book: true } }, user: true },
      });

      // 9. Notify User
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Book Issued',
          message: `You have issued "${copy.book.title}". Due date: ${dueDate.toLocaleDateString()}.`,
          type: 'ISSUE',
        },
      });

      // 10. Audit Log
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'ISSUE_BOOK',
          entity: 'IssueRecord',
          entityId: issue.id,
          details: `Issued "${copy.book.title}" (Barcode: ${copyBarcode}) to ${user.fullName}`,
        },
      });

      return issue;
    });
  }

  /**
   * Return a physical book copy, calculate fines, and advance waitlists
   */
  static async returnBook(copyBarcode: string, adminUserId: string, condition?: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Find physical copy and active issue
      const copy = await tx.bookCopy.findUnique({
        where: { barcode: copyBarcode },
        include: { book: true },
      });

      if (!copy) throw new NotFoundError(`Book copy barcode '${copyBarcode}' not found.`);

      const activeIssue = await tx.issueRecord.findFirst({
        where: { copyId: copy.id, status: { in: ['ISSUED', 'OVERDUE'] } },
        include: { user: true },
      });

      if (!activeIssue) {
        throw new BadRequestError(`No active issue record found for copy barcode '${copyBarcode}'.`);
      }

      const returnDate = new Date();
      const settings = (await tx.librarySetting.findFirst()) || { finePerDay: 5.0, gracePeriodDays: 2, reservationExpiryHours: 48 };

      // 2. Check for Overdue Fine
      let overdueDays = 0;
      let fineAmount = 0;

      if (returnDate > activeIssue.dueDate) {
        const diffMs = returnDate.getTime() - activeIssue.dueDate.getTime();
        overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (overdueDays > settings.gracePeriodDays) {
          const billableDays = overdueDays - settings.gracePeriodDays;
          fineAmount = billableDays * settings.finePerDay;
        }
      }

      // 3. Update Issue Record
      const updatedIssue = await tx.issueRecord.update({
        where: { id: activeIssue.id },
        data: {
          returnDate,
          status: 'RETURNED',
          returnedBy: adminUserId,
        },
      });

      // 4. Create Fine Record if Overdue
      if (fineAmount > 0) {
        await tx.fine.create({
          data: {
            userId: activeIssue.userId,
            issueId: activeIssue.id,
            overdueDays,
            fineAmount,
            status: 'UNPAID',
            reason: `Returned ${overdueDays} days late (${settings.gracePeriodDays} days grace applied).`,
          },
        });

        await tx.notification.create({
          data: {
            userId: activeIssue.userId,
            title: 'Overdue Fine Assessed',
            message: `Your return of "${copy.book.title}" was ${overdueDays} days late. A fine of $${fineAmount.toFixed(2)} has been assessed.`,
            type: 'FINE',
          },
        });
      }

      // 5. Check Waitlist / Reservation Queue for the Book Title
      const topReservation = await tx.reservationRecord.findFirst({
        where: { bookId: copy.bookId, status: 'PENDING' },
        orderBy: { queuePosition: 'asc' },
        include: { user: true },
      });

      let nextStatus = 'AVAILABLE';
      if (topReservation) {
        nextStatus = 'RESERVED';
        const expiryHours = settings.reservationExpiryHours || 48;
        const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

        await tx.reservationRecord.update({
          where: { id: topReservation.id },
          data: {
            status: 'NOTIFIED',
            copyId: copy.id,
            notifiedAt: new Date(),
            expiresAt,
          },
        });

        await tx.notification.create({
          data: {
            userId: topReservation.userId,
            title: 'Reserved Book Ready for Collection',
            message: `"${copy.book.title}" is now reserved for you at the front desk until ${expiresAt.toLocaleString()}.`,
            type: 'RESERVATION',
          },
        });
      }

      // 6. Update Copy Status
      await tx.bookCopy.update({
        where: { id: copy.id },
        data: {
          status: nextStatus,
          condition: condition || copy.condition,
        },
      });

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'RETURN_BOOK',
          entity: 'IssueRecord',
          entityId: activeIssue.id,
          details: `Processed return for "${copy.book.title}" (Barcode: ${copyBarcode}). Fine: $${fineAmount}`,
        },
      });

      return {
        issue: updatedIssue,
        fineAmount,
        overdueDays,
        waitlistNotified: !!topReservation,
      };
    });
  }

  /**
   * Renew an active book loan
   */
  static async renewBook(issueId: string, currentUserId: string, isStaff: boolean) {
    return await prisma.$transaction(async (tx) => {
      const issue = await tx.issueRecord.findUnique({
        where: { id: issueId },
        include: { copy: { include: { book: true } }, user: true },
      });

      if (!issue) throw new NotFoundError('Issue record not found.');

      if (!isStaff && issue.userId !== currentUserId) {
        throw new ForbiddenError('You can only renew your own issued books.');
      }

      if (issue.status !== 'ISSUED') {
        throw new BadRequestError(`Cannot renew book issue with status '${issue.status}'.`);
      }

      const settings = (await tx.librarySetting.findFirst()) || {
        maxRenewals: 2,
        studentLoanDays: 14,
        facultyLoanDays: 30,
      };

      if (issue.renewalsCount >= settings.maxRenewals) {
        throw new BadRequestError(`Maximum renewal limit (${settings.maxRenewals}) reached for this book.`);
      }

      // Check if book has active reservations by other users
      const pendingReservations = await tx.reservationRecord.count({
        where: { bookId: issue.copy.bookId, status: 'PENDING' },
      });

      if (pendingReservations > 0) {
        throw new ForbiddenError('Cannot renew book because another user has reserved it.');
      }

      const extensionDays = issue.user.role === 'FACULTY' ? settings.facultyLoanDays : settings.studentLoanDays;
      const previousDue = issue.dueDate;
      const newDueDate = new Date(previousDue.getTime() + extensionDays * 24 * 60 * 60 * 1000);

      const updatedIssue = await tx.issueRecord.update({
        where: { id: issue.id },
        data: {
          dueDate: newDueDate,
          renewalsCount: issue.renewalsCount + 1,
        },
      });

      await tx.renewalRecord.create({
        data: {
          issueId: issue.id,
          previousDue,
          newDueDate,
        },
      });

      await tx.notification.create({
        data: {
          userId: issue.userId,
          title: 'Book Renewal Successful',
          message: `"${issue.copy.book.title}" renewed. New due date is ${newDueDate.toLocaleDateString()}.`,
          type: 'ISSUE',
        },
      });

      return updatedIssue;
    });
  }

  static async getUserIssues(userId: string) {
    return await prisma.issueRecord.findMany({
      where: { userId },
      include: {
        copy: {
          include: {
            book: { include: { category: true, authors: { include: { author: true } } } },
          },
        },
        fine: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  static async getAllIssues(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 15, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { user: { fullName: { contains: query.search } } },
        { user: { email: { contains: query.search } } },
        { copy: { barcode: { contains: query.search } } },
        { copy: { book: { title: { contains: query.search } } } },
      ];
    }

    const [issues, total] = await Promise.all([
      prisma.issueRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, role: true } },
          copy: { include: { book: { select: { title: true, isbn: true, coverImage: true } } } },
          fine: true,
        },
      }),
      prisma.issueRecord.count({ where }),
    ]);

    return { issues, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
