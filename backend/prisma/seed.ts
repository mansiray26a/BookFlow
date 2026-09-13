import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed process...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.finePayment.deleteMany();
  await prisma.fine.deleteMany();
  await prisma.renewalRecord.deleteMany();
  await prisma.issueRecord.deleteMany();
  await prisma.reservationRecord.deleteMany();
  await prisma.bookCopy.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.category.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.librarianProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.libraryHoliday.deleteMany();
  await prisma.librarySetting.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 2. Library Settings
  await prisma.librarySetting.create({
    data: {
      id: 'default',
      libraryName: 'Central Academic Library - Tech University',
      libraryEmail: 'library@techuniv.edu',
      libraryPhone: '+1 (800) 555-8742',
      address: 'Knowledge Tower, Campus Center, 100 University Blvd',
      studentMaxLoans: 3,
      facultyMaxLoans: 10,
      studentLoanDays: 14,
      facultyLoanDays: 30,
      maxRenewals: 2,
      finePerDay: 5.0,
      gracePeriodDays: 2,
      maxFineAmount: 500.0,
      reservationExpiryHours: 48,
    },
  });
  console.log('⚙️ Default library settings seeded.');

  // 3. User Passwords
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const librarianPassword = await bcrypt.hash('Librarian@123456', 10);
  const facultyPassword = await bcrypt.hash('Faculty@123456', 10);
  const studentPassword = await bcrypt.hash('Student@123456', 10);

  // 4. Create Admin & Librarian
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      passwordHash: adminPassword,
      fullName: 'Dr. Arthur Pendelton',
      phone: '+1 555 010 9988',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      librarianProfile: {
        create: {
          employeeId: 'EMP-ADM-001',
          department: 'Library System Administration',
        },
      },
    },
  });

  const librarianUser = await prisma.user.create({
    data: {
      email: 'librarian@college.edu',
      passwordHash: librarianPassword,
      fullName: 'Sarah Jenkins',
      phone: '+1 555 010 4455',
      role: 'LIBRARIAN',
      status: 'ACTIVE',
      emailVerified: true,
      librarianProfile: {
        create: {
          employeeId: 'EMP-LIB-002',
          department: 'Circulation Desk',
        },
      },
    },
  });

  // 5. Create Faculty
  const facultyUser1 = await prisma.user.create({
    data: {
      email: 'professor.smith@college.edu',
      passwordHash: facultyPassword,
      fullName: 'Prof. Alan Smith',
      phone: '+1 555 011 2233',
      role: 'FACULTY',
      status: 'ACTIVE',
      emailVerified: true,
      facultyProfile: {
        create: {
          employeeId: 'EMP-FAC-101',
          department: 'Computer Science & Engineering',
          designation: 'Professor & HOD',
        },
      },
    },
  });

  const facultyUser2 = await prisma.user.create({
    data: {
      email: 'dr.davis@college.edu',
      passwordHash: facultyPassword,
      fullName: 'Dr. Clara Davis',
      phone: '+1 555 011 7788',
      role: 'FACULTY',
      status: 'ACTIVE',
      emailVerified: true,
      facultyProfile: {
        create: {
          employeeId: 'EMP-FAC-102',
          department: 'Electrical Engineering',
          designation: 'Associate Professor',
        },
      },
    },
  });

  // 6. Create Students
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student.alex@college.edu',
      passwordHash: studentPassword,
      fullName: 'Alex Rivera',
      phone: '+1 555 012 3456',
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: true,
      studentProfile: {
        create: {
          rollNumber: 'CS2023001',
          department: 'Computer Science',
          course: 'B.Tech CS',
          semester: 5,
          academicYear: '2023-2027',
        },
      },
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'student.emma@college.edu',
      passwordHash: studentPassword,
      fullName: 'Emma Watson',
      phone: '+1 555 012 8899',
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: true,
      studentProfile: {
        create: {
          rollNumber: 'IT2023042',
          department: 'Information Technology',
          course: 'B.Tech IT',
          semester: 3,
          academicYear: '2024-2028',
        },
      },
    },
  });

  console.log('👤 Seeded Admin, Librarian, Faculty, and Student users.');

  // 7. Categories
  const csCat = await prisma.category.create({
    data: { name: 'Computer Science', code: 'CS', description: 'Algorithms, Software Engineering & Systems' },
  });
  const eeCat = await prisma.category.create({
    data: { name: 'Electrical & Electronics', code: 'EE', description: 'Circuits, Signals & Embedded Systems' },
  });
  const mathCat = await prisma.category.create({
    data: { name: 'Mathematics & Statistics', code: 'MATH', description: 'Linear Algebra, Discrete Math & Calculus' },
  });
  const bizCat = await prisma.category.create({
    data: { name: 'Business & Management', code: 'BIZ', description: 'Economics, Management & Finance' },
  });

  // 8. Publishers
  const oreilly = await prisma.publisher.create({ data: { name: "O'Reilly Media", website: 'https://oreilly.com' } });
  const pearson = await prisma.publisher.create({ data: { name: 'Pearson Education', website: 'https://pearson.com' } });
  const mcgraw = await prisma.publisher.create({ data: { name: 'McGraw-Hill Education', website: 'https://mheducation.com' } });
  const mitPress = await prisma.publisher.create({ data: { name: 'MIT Press', website: 'https://mitpress.mit.edu' } });

  // 9. Authors
  const rMartin = await prisma.author.create({ data: { name: 'Robert C. Martin', bio: 'Author of Clean Code and Agile Software Development.' } });
  const tanenbaum = await prisma.author.create({ data: { name: 'Andrew S. Tanenbaum', bio: 'Renowned computer scientist and author of Computer Networks.' } });
  const cormen = await prisma.author.create({ data: { name: 'Thomas H. Cormen', bio: 'Co-author of Introduction to Algorithms (CLRS).' } });
  const russell = await prisma.author.create({ data: { name: 'Stuart Russell', bio: 'Co-author of Artificial Intelligence: A Modern Approach.' } });

  console.log('📚 Seeded categories, publishers, and authors.');

  // 10. Books & Book Copies
  const book1 = await prisma.book.create({
    data: {
      isbn: '9780132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      subtitle: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
      description: 'A comprehensive guide to code craftsmanship, refactoring, code smells, and software design principles.',
      publicationYear: 2008,
      edition: '1st Edition',
      language: 'English',
      pages: 464,
      categoryId: csCat.id,
      publisherId: pearson.id,
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=80',
      authors: { create: [{ authorId: rMartin.id }] },
      copies: {
        create: [
          { barcode: 'BC-CC-001', qrCodePayload: 'QR-CC-001', copyNumber: 1, shelfLocation: 'Floor 2, Shelf A-10', status: 'AVAILABLE', condition: 'GOOD' },
          { barcode: 'BC-CC-002', qrCodePayload: 'QR-CC-002', copyNumber: 2, shelfLocation: 'Floor 2, Shelf A-10', status: 'ISSUED', condition: 'GOOD' },
          { barcode: 'BC-CC-003', qrCodePayload: 'QR-CC-003', copyNumber: 3, shelfLocation: 'Floor 2, Shelf A-10', status: 'AVAILABLE', condition: 'NEW' },
        ],
      },
    },
    include: { copies: true },
  });

  const book2 = await prisma.book.create({
    data: {
      isbn: '9780132126953',
      title: 'Computer Networks',
      subtitle: 'Fifth Edition',
      description: 'The standard textbook on networking protocols, wireless communication, network security, and internet architecture.',
      publicationYear: 2010,
      edition: '5th Edition',
      language: 'English',
      pages: 960,
      categoryId: csCat.id,
      publisherId: pearson.id,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
      authors: { create: [{ authorId: tanenbaum.id }] },
      copies: {
        create: [
          { barcode: 'BC-CN-001', qrCodePayload: 'QR-CN-001', copyNumber: 1, shelfLocation: 'Floor 2, Shelf B-05', status: 'ISSUED', condition: 'GOOD' },
          { barcode: 'BC-CN-002', qrCodePayload: 'QR-CN-002', copyNumber: 2, shelfLocation: 'Floor 2, Shelf B-05', status: 'AVAILABLE', condition: 'GOOD' },
        ],
      },
    },
    include: { copies: true },
  });

  const book3 = await prisma.book.create({
    data: {
      isbn: '9780262033848',
      title: 'Introduction to Algorithms',
      subtitle: 'CLRS 3rd Edition',
      description: 'Essential reference covering algorithms, data structures, graph theory, dynamic programming, and complexity analysis.',
      publicationYear: 2009,
      edition: '3rd Edition',
      language: 'English',
      pages: 1312,
      categoryId: csCat.id,
      publisherId: mitPress.id,
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
      authors: { create: [{ authorId: cormen.id }] },
      copies: {
        create: [
          { barcode: 'BC-CLRS-001', qrCodePayload: 'QR-CLRS-001', copyNumber: 1, shelfLocation: 'Floor 3, Shelf C-01', status: 'ISSUED', condition: 'GOOD' },
          { barcode: 'BC-CLRS-002', qrCodePayload: 'QR-CLRS-002', copyNumber: 2, shelfLocation: 'Floor 3, Shelf C-01', status: 'AVAILABLE', condition: 'FAIR' },
        ],
      },
    },
    include: { copies: true },
  });

  const book4 = await prisma.book.create({
    data: {
      isbn: '9780134610993',
      title: 'Artificial Intelligence: A Modern Approach',
      subtitle: '4th Edition',
      description: 'Comprehensive introduction to artificial intelligence, machine learning, neural networks, and automated reasoning.',
      publicationYear: 2020,
      edition: '4th Edition',
      language: 'English',
      pages: 1168,
      categoryId: csCat.id,
      publisherId: pearson.id,
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80',
      authors: { create: [{ authorId: russell.id }] },
      copies: {
        create: [
          { barcode: 'BC-AI-001', qrCodePayload: 'QR-AI-001', copyNumber: 1, shelfLocation: 'Floor 3, Shelf C-12', status: 'AVAILABLE', condition: 'NEW' },
        ],
      },
    },
    include: { copies: true },
  });

  console.log('📖 Seeded 4 books with physical copies.');

  // 11. Seed Issues, Overdues, Fines & Notifications
  const now = new Date();
  const pastDueDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days overdue
  const futureDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // due in 7 days

  // Issued to Alex Rivera (Clean Code copy 2) - Active loan
  await prisma.issueRecord.create({
    data: {
      userId: studentUser1.id,
      copyId: book1.copies[1].id,
      issueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      dueDate: futureDueDate,
      status: 'ISSUED',
      issuedBy: librarianUser.id,
    },
  });

  // Issued to Emma Watson (Computer Networks copy 1) - Overdue with Fine
  const overdueIssue = await prisma.issueRecord.create({
    data: {
      userId: studentUser2.id,
      copyId: book2.copies[0].id,
      issueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      dueDate: pastDueDate,
      status: 'OVERDUE',
      issuedBy: librarianUser.id,
    },
  });

  await prisma.fine.create({
    data: {
      userId: studentUser2.id,
      issueId: overdueIssue.id,
      overdueDays: 5,
      fineAmount: 25.0,
      paidAmount: 0.0,
      status: 'UNPAID',
      reason: 'Book returned/held 5 days past due date',
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser1.id,
        title: 'Book Issued Successfully',
        message: 'You have issued "Clean Code". Due date is ' + futureDueDate.toLocaleDateString(),
        type: 'ISSUE',
        isRead: false,
      },
      {
        userId: studentUser2.id,
        title: 'OVERDUE NOTICE & FINE',
        message: 'Your loan for "Computer Networks" is 5 days overdue. Current fine liability: $25.00',
        type: 'OVERDUE',
        isRead: false,
      },
    ],
  });

  // Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { action: 'SEED_DATABASE', entity: 'SYSTEM', details: 'Database initialized with demo catalog and credentials', ipAddress: '127.0.0.1' },
      { userId: librarianUser.id, action: 'ISSUE_BOOK', entity: 'BookCopy', entityId: book1.copies[1].id, details: 'Issued to student Alex Rivera' },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n🔑 DEFAULT USER CREDENTIALS FOR TESTING:');
  console.log('----------------------------------------------------');
  console.log('👑 Admin:     admin@college.edu       / Admin@123456');
  console.log('📚 Librarian: librarian@college.edu   / Librarian@123456');
  console.log('🎓 Faculty:   professor.smith@college.edu / Faculty@123456');
  console.log('🎒 Student:   student.alex@college.edu / Student@123456');
  console.log('----------------------------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
