import { prisma } from '../config/db';

export class AdminService {
  static async getDashboardAnalytics() {
    const [
      totalBooks,
      totalCopies,
      availableCopies,
      issuedCopies,
      totalStudents,
      totalFaculty,
      overdueCount,
      pendingReservations,
      unpaidFinesSummary,
      monthlyCirculation,
      categoryDistribution,
      topBorrowedBooks,
    ] = await Promise.all([
      prisma.book.count({ where: { isActive: true } }),
      prisma.bookCopy.count(),
      prisma.bookCopy.count({ where: { status: 'AVAILABLE' } }),
      prisma.bookCopy.count({ where: { status: 'ISSUED' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
      prisma.issueRecord.count({ where: { status: 'OVERDUE' } }),
      prisma.reservationRecord.count({ where: { status: 'PENDING' } }),
      prisma.fine.aggregate({ where: { status: 'UNPAID' }, _sum: { fineAmount: true } }),
      prisma.issueRecord.findMany({
        take: 30,
        orderBy: { issueDate: 'desc' },
        select: { issueDate: true, status: true },
      }),
      prisma.category.findMany({
        select: { name: true, _count: { select: { books: true } } },
      }),
      prisma.book.findMany({
        take: 5,
        orderBy: { copies: { _count: 'desc' } },
        select: { id: true, title: true, isbn: true, coverImage: true, _count: { select: { copies: true } } },
      }),
    ]);

    return {
      metrics: {
        totalBooks,
        totalCopies,
        availableCopies,
        issuedCopies,
        totalStudents,
        totalFaculty,
        overdueCount,
        pendingReservations,
        unpaidFinesTotal: unpaidFinesSummary._sum.fineAmount || 0,
      },
      categoryDistribution: categoryDistribution.map((c) => ({ name: c.name, count: c._count.books })),
      topBooks: topBorrowedBooks,
    };
  }

  static async getSettings() {
    return (await prisma.librarySetting.findFirst()) || (await prisma.librarySetting.create({ data: {} }));
  }

  static async updateSettings(data: any, adminUserId: string) {
    const setting = await this.getSettings();
    const updated = await prisma.librarySetting.update({
      where: { id: setting.id },
      data,
    });

    await prisma.auditLog.create({
      data: { userId: adminUserId, action: 'UPDATE_LIBRARY_SETTINGS', entity: 'LibrarySetting', details: 'Updated library borrowing and fine policies' },
    });

    return updated;
  }

  static async getAuditLogs(limit = 50) {
    return await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, role: true, email: true } } },
    });
  }

  // Categories, Authors, Publishers
  static async getCategories() {
    return await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { books: true } } } });
  }

  static async createCategory(data: { name: string; code: string; description?: string }) {
    return await prisma.category.create({ data });
  }

  static async getAuthors() {
    return await prisma.author.findMany({ orderBy: { name: 'asc' } });
  }

  static async createAuthor(data: { name: string; bio?: string }) {
    return await prisma.author.create({ data });
  }

  static async getPublishers() {
    return await prisma.publisher.findMany({ orderBy: { name: 'asc' } });
  }

  static async createPublisher(data: { name: string; address?: string; website?: string }) {
    return await prisma.publisher.create({ data });
  }
}
