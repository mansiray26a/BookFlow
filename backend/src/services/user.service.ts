import { prisma } from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import bcrypt from 'bcryptjs';

export class UserService {
  static async getUsers(query: { role?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { email: { contains: query.search } },
        { studentProfile: { rollNumber: { contains: query.search } } },
        { facultyProfile: { employeeId: { contains: query.search } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          studentProfile: true,
          facultyProfile: true,
          librarianProfile: true,
          _count: {
            select: { issues: { where: { status: 'ISSUED' } }, fines: { where: { status: 'UNPAID' } } },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        facultyProfile: true,
        librarianProfile: true,
        issues: {
          include: { copy: { include: { book: true } } },
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
        fines: { orderBy: { createdAt: 'desc' } },
        reservations: { include: { book: true }, where: { status: 'PENDING' } },
      },
    });

    if (!user) throw new NotFoundError('User not found.');
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  static async updateUserStatus(userId: string, status: string, adminUserId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_USER_STATUS',
        entity: 'User',
        entityId: userId,
        details: `Account status changed to ${status}`,
      },
    });

    return user;
  }

  static async createLibrarian(data: any, adminUserId: string) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestError('User with this email already exists.');

    const passwordHash = await bcrypt.hash(data.password || 'Librarian@123456', 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: 'LIBRARIAN',
        status: 'ACTIVE',
        emailVerified: true,
        librarianProfile: {
          create: {
            employeeId: data.employeeId,
            department: data.department || 'Library Operations',
          },
        },
      },
      include: { librarianProfile: true },
    });

    await prisma.auditLog.create({
      data: { userId: adminUserId, action: 'CREATE_LIBRARIAN', entity: 'User', entityId: user.id, details: `Created librarian account ${user.fullName}` },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
