import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { config } from '../config';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';

export class AuthService {
  static async registerStudent(data: any) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictError('User with this email already exists.');

    const existingRoll = await prisma.studentProfile.findUnique({ where: { rollNumber: data.rollNumber } });
    if (existingRoll) throw new ConflictError('Student with this Roll Number is already registered.');

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerified: true,
        studentProfile: {
          create: {
            rollNumber: data.rollNumber,
            department: data.department,
            course: data.course,
            semester: data.semester,
            academicYear: data.academicYear,
          },
        },
      },
      include: { studentProfile: true },
    });

    const token = this.generateToken(user.id, user.email, user.role, user.status);

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'USER_REGISTER_STUDENT', entity: 'User', entityId: user.id, details: `Student ${user.fullName} registered` },
    });

    return { user: this.sanitizeUser(user), token };
  }

  static async registerFaculty(data: any) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictError('User with this email already exists.');

    const existingEmp = await prisma.facultyProfile.findUnique({ where: { employeeId: data.employeeId } });
    if (existingEmp) throw new ConflictError('Faculty member with this Employee ID is already registered.');

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: 'FACULTY',
        status: 'ACTIVE',
        emailVerified: true,
        facultyProfile: {
          create: {
            employeeId: data.employeeId,
            department: data.department,
            designation: data.designation,
          },
        },
      },
      include: { facultyProfile: true },
    });

    const token = this.generateToken(user.id, user.email, user.role, user.status);

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'USER_REGISTER_FACULTY', entity: 'User', entityId: user.id, details: `Faculty ${user.fullName} registered` },
    });

    return { user: this.sanitizeUser(user), token };
  }

  static async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true, facultyProfile: true, librarianProfile: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account is restricted. Please contact library administrator.');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = this.generateToken(user.id, user.email, user.role, user.status);

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'USER_LOGIN', entity: 'User', entityId: user.id, details: `User logged in from web portal` },
    });

    return { user: this.sanitizeUser(user), token };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, facultyProfile: true, librarianProfile: true },
    });
    if (!user) throw new BadRequestError('User not found.');
    return this.sanitizeUser(user);
  }

  private static generateToken(userId: string, email: string, role: string, status: string) {
    return jwt.sign({ userId, email, role, status }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }

  private static sanitizeUser(user: any) {
    const { passwordHash, resetToken, verificationToken, ...safeUser } = user;
    return safeUser;
  }
}
