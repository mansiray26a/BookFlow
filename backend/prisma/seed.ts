/// <reference types="node" />
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
  const categoryData = [
    // Engineering - Computer Science
    { name: 'Artificial Intelligence', code: 'CS-AI', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Data Science & Big Data', code: 'CS-DS', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Software Engineering', code: 'CS-SE', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Computer Networks', code: 'CS-NW', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Cybersecurity', code: 'CS-CY', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Web Development', code: 'CS-WEB', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Mobile App Development', code: 'CS-MOB', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Cloud Computing', code: 'CS-CC', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Database Systems', code: 'CS-DB', branch: 'Engineering', department: 'Computer Science' },
    { name: 'Human-Computer Interaction', code: 'CS-HCI', branch: 'Engineering', department: 'Computer Science' },
    // Engineering - Electrical
    { name: 'Power Systems', code: 'EE-PS', branch: 'Engineering', department: 'Electrical Engineering' },
    { name: 'Control Systems', code: 'EE-CS', branch: 'Engineering', department: 'Electrical Engineering' },
    { name: 'Microelectronics', code: 'EE-ME', branch: 'Engineering', department: 'Electrical Engineering' },
    { name: 'Signal Processing', code: 'EE-SP', branch: 'Engineering', department: 'Electrical Engineering' },
    { name: 'Telecommunications', code: 'EE-TC', branch: 'Engineering', department: 'Electrical Engineering' },
    // Engineering - Mechanical
    { name: 'Thermodynamics', code: 'ME-TH', branch: 'Engineering', department: 'Mechanical Engineering' },
    { name: 'Fluid Mechanics', code: 'ME-FM', branch: 'Engineering', department: 'Mechanical Engineering' },
    { name: 'Robotics', code: 'ME-RB', branch: 'Engineering', department: 'Mechanical Engineering' },
    { name: 'Automotive Engineering', code: 'ME-AE', branch: 'Engineering', department: 'Mechanical Engineering' },
    { name: 'Materials Science', code: 'ME-MS', branch: 'Engineering', department: 'Mechanical Engineering' },
    // Sciences - Physics
    { name: 'Quantum Mechanics', code: 'PHY-QM', branch: 'Sciences', department: 'Physics' },
    { name: 'Astrophysics', code: 'PHY-AP', branch: 'Sciences', department: 'Physics' },
    { name: 'Nuclear Physics', code: 'PHY-NP', branch: 'Sciences', department: 'Physics' },
    { name: 'Optics', code: 'PHY-OP', branch: 'Sciences', department: 'Physics' },
    { name: 'Electromagnetism', code: 'PHY-EM', branch: 'Sciences', department: 'Physics' },
    // Sciences - Mathematics
    { name: 'Calculus', code: 'MATH-CAL', branch: 'Sciences', department: 'Mathematics' },
    { name: 'Linear Algebra', code: 'MATH-LA', branch: 'Sciences', department: 'Mathematics' },
    { name: 'Discrete Mathematics', code: 'MATH-DM', branch: 'Sciences', department: 'Mathematics' },
    { name: 'Probability & Statistics', code: 'MATH-PS', branch: 'Sciences', department: 'Mathematics' },
    { name: 'Topology', code: 'MATH-TOP', branch: 'Sciences', department: 'Mathematics' },
    // Business - Management
    { name: 'Human Resources', code: 'BIZ-HR', branch: 'Business', department: 'Management' },
    { name: 'Marketing', code: 'BIZ-MKT', branch: 'Business', department: 'Management' },
    { name: 'Operations Management', code: 'BIZ-OM', branch: 'Business', department: 'Management' },
    { name: 'Strategic Management', code: 'BIZ-SM', branch: 'Business', department: 'Management' },
    { name: 'Project Management', code: 'BIZ-PM', branch: 'Business', department: 'Management' },
    // Business - Finance
    { name: 'Corporate Finance', code: 'FIN-CF', branch: 'Business', department: 'Finance' },
    { name: 'Investment Banking', code: 'FIN-IB', branch: 'Business', department: 'Finance' },
    { name: 'Financial Accounting', code: 'FIN-FA', branch: 'Business', department: 'Finance' },
    { name: 'Taxation', code: 'FIN-TAX', branch: 'Business', department: 'Finance' },
    { name: 'Behavioral Finance', code: 'FIN-BF', branch: 'Business', department: 'Finance' },
    // Humanities - Literature
    { name: 'Classic Literature', code: 'LIT-CL', branch: 'Humanities', department: 'Literature' },
    { name: 'Modern Poetry', code: 'LIT-MP', branch: 'Humanities', department: 'Literature' },
    { name: 'World Literature', code: 'LIT-WL', branch: 'Humanities', department: 'Literature' },
    { name: 'Literary Theory', code: 'LIT-LT', branch: 'Humanities', department: 'Literature' },
    { name: 'Creative Writing', code: 'LIT-CW', branch: 'Humanities', department: 'Literature' },
    // Humanities - History
    { name: 'Ancient History', code: 'HIS-AH', branch: 'Humanities', department: 'History' },
    { name: 'Modern History', code: 'HIS-MH', branch: 'Humanities', department: 'History' },
    { name: 'World War Studies', code: 'HIS-WW', branch: 'Humanities', department: 'History' },
    { name: 'Economic History', code: 'HIS-EH', branch: 'Humanities', department: 'History' },
    { name: 'Cultural History', code: 'HIS-CH', branch: 'Humanities', department: 'History' },
  ];

  await prisma.category.createMany({ data: categoryData });
  const csCat = await prisma.category.findFirst({ where: { name: 'Software Engineering' } });
  if (!csCat) throw new Error('Could not find seeded Software Engineering category.');

  // 8. Publishers
  const oreilly = await prisma.publisher.create({ data: { name: "O'Reilly Media", website: 'https://oreilly.com' } });
  const pearson = await prisma.publisher.create({ data: { name: 'Pearson Education', website: 'https://pearson.com' } });
  const mcgraw = await prisma.publisher.create({ data: { name: 'McGraw-Hill Education', website: 'https://mheducation.com' } });
  const mitPress = await prisma.publisher.create({ data: { name: 'MIT Press', website: 'https://mitpress.mit.edu' } });
  const phiLearning = await prisma.publisher.create({ data: { name: 'PHI Learning', website: 'https://www.phindia.com' } });
  const sChand = await prisma.publisher.create({ data: { name: 'S. Chand Publishing', website: 'https://www.schandpublishing.com' } });
  const tataMcGraw = await prisma.publisher.create({ data: { name: 'Tata McGraw-Hill', website: 'https://www.mheducation.co.in' } });
  const bpbPub = await prisma.publisher.create({ data: { name: 'BPB Publications', website: 'https://bpbonline.com' } });

  // 9. Authors
  const rMartin = await prisma.author.create({ data: { name: 'Robert C. Martin', bio: 'Author of Clean Code and Agile Software Development.' } });
  const tanenbaum = await prisma.author.create({ data: { name: 'Andrew S. Tanenbaum', bio: 'Renowned computer scientist and author of Computer Networks.' } });
  const cormen = await prisma.author.create({ data: { name: 'Thomas H. Cormen', bio: 'Co-author of Introduction to Algorithms (CLRS).' } });
  const russell = await prisma.author.create({ data: { name: 'Stuart Russell', bio: 'Co-author of Artificial Intelligence: A Modern Approach.' } });
  const eBalagurusamy = await prisma.author.create({ data: { name: 'E. Balagurusamy', bio: 'Indian educator and engineer known for books on programming languages like C and C++.' } });
  const yKanetkar = await prisma.author.create({ data: { name: 'Yashavant Kanetkar', bio: 'Author of Let Us C and several other popular computer science books in India.' } });
  const rsAggarwal = await prisma.author.create({ data: { name: 'R.S. Aggarwal', bio: 'Renowned author of mathematics textbooks for school and competitive exams in India.' } });
  const hcVerma = await prisma.author.create({ data: { name: 'H.C. Verma', bio: 'Indian experimental physicist and author of the popular Concepts of Physics textbook.' } });
  const apjKalam = await prisma.author.create({ data: { name: 'A.P.J. Abdul Kalam', bio: 'Former President of India and aerospace scientist, author of Wings of Fire and Ignited Minds.' } });

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

  console.log('📖 Seeded 4 manual books with physical copies.');

  console.log('📖 Generating 100+ additional books...');
  const allCategories = await prisma.category.findMany();
  const allPublishers = await prisma.publisher.findMany();
  const allAuthors = await prisma.author.findMany();

  const subjects = [
    'Software Engineering', 'Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks',
    'Database Management', 'Artificial Intelligence', 'Machine Learning', 'Cyber Security', 'Cloud Computing',
    'Thermodynamics', 'Fluid Mechanics', 'Heat Transfer', 'Manufacturing Processes', 'Automobile Engineering',
    'Circuit Theory', 'Digital Electronics', 'Microprocessors', 'Control Systems', 'Power Systems',
    'Quantum Mechanics', 'Electromagnetism', 'Optics', 'Solid State Physics', 'Nuclear Physics',
    'Calculus', 'Linear Algebra', 'Differential Equations', 'Probability and Statistics', 'Discrete Mathematics',
    'Financial Accounting', 'Marketing Management', 'Human Resource Management', 'Business Ethics', 'Corporate Finance',
    'Microeconomics', 'Macroeconomics', 'International Trade', 'Public Finance', 'Econometrics'
  ];
  const modifiers = ['Advanced', 'Applied', 'Fundamentals of', 'Introduction to', 'Principles of', 'Modern', 'Essentials of', 'Mastering', 'A Comprehensive Guide to', 'Handbook of'];
  const coverImages = [
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555662137-f0c3ebf551c6?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&auto=format&fit=crop&q=80'
  ];

  for (let i = 1; i <= 100; i++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    const title = `${modifier} ${subject}`;
    const category = allCategories[Math.floor(Math.random() * allCategories.length)];
    const publisher = allPublishers[Math.floor(Math.random() * allPublishers.length)];
    const author = allAuthors[Math.floor(Math.random() * allAuthors.length)];
    const coverImage = coverImages[Math.floor(Math.random() * coverImages.length)];
    const isbn = `978${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const barcode = `BC-GEN-${1000 + i}`;

    await prisma.book.create({
      data: {
        isbn,
        title,
        description: `An in-depth look at ${subject.toLowerCase()} for college students.`,
        publicationYear: 2010 + Math.floor(Math.random() * 14),
        language: 'English',
        pages: 300 + Math.floor(Math.random() * 500),
        categoryId: category.id,
        publisherId: publisher.id,
        coverImage,
        authors: { create: [{ authorId: author.id }] },
        copies: {
          create: [
            { barcode: barcode + '-1', qrCodePayload: 'QR-' + barcode + '-1', copyNumber: 1, shelfLocation: 'Floor 1, Stack A', status: 'AVAILABLE', condition: 'GOOD' },
            { barcode: barcode + '-2', qrCodePayload: 'QR-' + barcode + '-2', copyNumber: 2, shelfLocation: 'Floor 1, Stack A', status: Math.random() > 0.5 ? 'AVAILABLE' : 'ISSUED', condition: 'GOOD' }
          ]
        }
      }
    });
  }
  console.log('📖 Generated and seeded 100 additional books.');

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
