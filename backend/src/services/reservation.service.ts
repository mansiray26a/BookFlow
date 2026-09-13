import { prisma } from '../config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

export class ReservationService {
  static async createReservation(bookId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify User status
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError('User not found.');
      if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
        throw new ForbiddenError('Account status restricted. Unable to reserve books.');
      }

      // 2. Check if user already has an active issue of this book
      const activeIssue = await tx.issueRecord.findFirst({
        where: { userId, copy: { bookId }, status: { in: ['ISSUED', 'OVERDUE'] } },
      });
      if (activeIssue) {
        throw new BadRequestError('You currently have an active issue of this book.');
      }

      // 3. Check if user already has a pending reservation for this book
      const existingRes = await tx.reservationRecord.findFirst({
        where: { userId, bookId, status: { in: ['PENDING', 'NOTIFIED'] } },
      });
      if (existingRes) {
        throw new BadRequestError('You already have an active reservation for this book.');
      }

      // 4. Determine queue position
      const currentPendingCount = await tx.reservationRecord.count({
        where: { bookId, status: 'PENDING' },
      });

      const queuePosition = currentPendingCount + 1;

      // 5. Create Reservation
      const reservation = await tx.reservationRecord.create({
        data: {
          userId,
          bookId,
          queuePosition,
          status: 'PENDING',
        },
        include: { book: true },
      });

      await tx.notification.create({
        data: {
          userId,
          title: 'Book Reserved',
          message: `Your reservation for "${reservation.book.title}" is placed. Queue Position: #${queuePosition}.`,
          type: 'RESERVATION',
        },
      });

      return reservation;
    });
  }

  static async cancelReservation(reservationId: string, userId: string, isStaff: boolean) {
    const reservation = await prisma.reservationRecord.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) throw new NotFoundError('Reservation not found.');

    if (!isStaff && reservation.userId !== userId) {
      throw new ForbiddenError('You can only cancel your own reservations.');
    }

    const updated = await prisma.reservationRecord.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });

    // Re-index queue positions for remaining pending reservations on this book
    const remaining = await prisma.reservationRecord.findMany({
      where: { bookId: reservation.bookId, status: 'PENDING' },
      orderBy: { reservedAt: 'asc' },
    });

    for (let i = 0; i < remaining.length; i++) {
      await prisma.reservationRecord.update({
        where: { id: remaining[i].id },
        data: { queuePosition: i + 1 },
      });
    }

    return updated;
  }

  static async getUserReservations(userId: string) {
    return await prisma.reservationRecord.findMany({
      where: { userId },
      include: { book: { include: { category: true } }, copy: true },
      orderBy: { reservedAt: 'desc' },
    });
  }

  static async getAllReservations() {
    return await prisma.reservationRecord.findMany({
      include: {
        user: { select: { fullName: true, email: true, role: true } },
        book: { select: { title: true, isbn: true } },
        copy: { select: { barcode: true } },
      },
      orderBy: { reservedAt: 'desc' },
    });
  }
}
