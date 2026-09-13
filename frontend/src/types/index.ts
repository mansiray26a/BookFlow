export type Role = 'STUDENT' | 'FACULTY' | 'LIBRARIAN' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';
export type CopyStatus = 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'MAINTENANCE';
export type CopyCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
export type IssueStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST';
export type ReservationStatus = 'PENDING' | 'NOTIFIED' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
export type FineStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  studentProfile?: {
    rollNumber: string;
    department: string;
    course: string;
    semester: number;
    academicYear: string;
  };
  facultyProfile?: {
    employeeId: string;
    department: string;
    designation: string;
  };
  librarianProfile?: {
    employeeId: string;
    department: string;
  };
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  _count?: { books: number };
}

export interface Publisher {
  id: string;
  name: string;
  website?: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
}

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string;
  qrCodePayload: string;
  copyNumber: number;
  shelfLocation: string;
  status: CopyStatus;
  condition: CopyCondition;
  price?: number;
  purchaseDate?: string;
  book?: Book;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  publicationYear: number;
  edition?: string;
  language: string;
  pages?: number;
  categoryId: string;
  publisherId: string;
  category?: Category;
  publisher?: Publisher;
  authors?: { author: Author }[];
  copies?: BookCopy[];
  totalCopies?: number;
  availableCopies?: number;
  isAvailable?: boolean;
  _count?: { copies?: number; reviews?: number; reservations?: number };
}

export interface IssueRecord {
  id: string;
  userId: string;
  copyId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  renewalsCount: number;
  status: IssueStatus;
  user?: User;
  copy?: BookCopy;
  fine?: Fine;
}

export interface ReservationRecord {
  id: string;
  userId: string;
  bookId: string;
  copyId?: string;
  reservedAt: string;
  queuePosition: number;
  status: ReservationStatus;
  book?: Book;
  copy?: BookCopy;
  user?: User;
}

export interface Fine {
  id: string;
  userId: string;
  issueId: string;
  overdueDays: number;
  fineAmount: number;
  paidAmount: number;
  status: FineStatus;
  reason?: string;
  createdAt: string;
  issue?: IssueRecord;
  user?: User;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  metrics: {
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    issuedCopies: number;
    totalStudents: number;
    totalFaculty: number;
    overdueCount: number;
    pendingReservations: number;
    unpaidFinesTotal: number;
  };
  categoryDistribution: { name: string; count: number }[];
  topBooks: Book[];
}
