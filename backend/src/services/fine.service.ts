import { prisma } from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class FineService {
  static async getUserFines(userId: string) {
    return await prisma.fine.findMany({
      where: { userId },
      include: {
        issue: {
          include: { copy: { include: { book: { select: { title: true, isbn: true } } } } },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAllFines(query: { status?: string; search?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { user: { fullName: { contains: query.search } } },
        { user: { email: { contains: query.search } } },
      ];
    }

    return await prisma.fine.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
        issue: { include: { copy: { include: { book: { select: { title: true } } } } } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async payFine(fineId: string, amount: number, paymentMethod: string, transactionRef?: string, collectedBy?: string) {
    return await prisma.$transaction(async (tx) => {
      const fine = await tx.fine.findUnique({ where: { id: fineId } });
      if (!fine) throw new NotFoundError('Fine record not found.');

      if (fine.status === 'PAID' || fine.status === 'WAIVED') {
        throw new BadRequestError(`Fine is already '${fine.status}'.`);
      }

      const newPaidAmount = fine.paidAmount + amount;
      let newStatus = 'PARTIALLY_PAID';
      if (newPaidAmount >= fine.fineAmount) {
        newStatus = 'PAID';
      }

      const updatedFine = await tx.fine.update({
        where: { id: fineId },
        data: {
          paidAmount: Math.min(newPaidAmount, fine.fineAmount),
          status: newStatus,
        },
      });

      await tx.finePayment.create({
        data: {
          fineId: fine.id,
          amountPaid: amount,
          paymentMethod,
          transactionRef,
          collectedBy,
        },
      });

      await tx.notification.create({
        data: {
          userId: fine.userId,
          title: 'Fine Payment Recorded',
          message: `Payment of $${amount.toFixed(2)} received. Outstanding balance: $${(fine.fineAmount - newPaidAmount > 0 ? fine.fineAmount - newPaidAmount : 0).toFixed(2)}.`,
          type: 'FINE',
        },
      });

      return updatedFine;
    });
  }

  static async waiveFine(fineId: string, reason: string, adminUserId: string) {
    const fine = await prisma.fine.findUnique({ where: { id: fineId } });
    if (!fine) throw new NotFoundError('Fine not found.');

    const updated = await prisma.fine.update({
      where: { id: fineId },
      data: { status: 'WAIVED', reason: `WAIVED by admin: ${reason}` },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'WAIVE_FINE',
        entity: 'Fine',
        entityId: fine.id,
        details: `Waived fine of $${fine.fineAmount}. Reason: ${reason}`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: fine.userId,
        title: 'Fine Waived',
        message: `Your fine liability of $${fine.fineAmount.toFixed(2)} has been waived by the library administration.`,
        type: 'FINE',
      },
    });

    return updated;
  }
}
