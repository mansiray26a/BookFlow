# Backend Schema & Database Specification
## Smart College Library Management System (BookFlow LMS)

---

## 1. Database Architecture & ER Diagram Overview

The database uses PostgreSQL 16 managed via Prisma ORM.

```
┌──────────────┐       1:1      ┌──────────────────┐
│     User     ├────────────────┤  StudentProfile  │
│ (id, role...)│                └──────────────────┘
└──────┬───────┘       1:1      ┌──────────────────┐
       ├────────────────────────┤  FacultyProfile  │
       │                        └──────────────────┘
       │ 1:N                    ┌──────────────────┐
       ├─── IssueRecord         │ LibrarianProfile │
       │                        └──────────────────┘
       │ 1:N
       ├─── ReservationRecord
       │
       │ 1:N
       ├─── Fine ──────────── 1:N ─── FinePayment
       │
       │ 1:N
       ├─── Notification
       │
       │ 1:N
       └─── AuditLog

┌──────────────┐       1:N      ┌──────────────────┐
│   Category   ├────────────────┤       Book       │
└──────────────┘                │(id, isbn, title) │
                                └────────┬─────────┘
┌──────────────┐       1:N               │
│  Publisher   ├─────────────────────────┤
└──────────────┘                         │
                                         │ 1:N
┌──────────────┐     N:M via             ├─── BookAuthor ─── M:1 ─── Author
│     Book     │─ BookAuthor ────────────┤
└──────────────┘                         │ 1:N
                                         ├─── BookCopy (barcode, shelf, status)
                                         │       │
                                         │       ├── 1:N ── IssueRecord
                                         │       └── 1:N ── ReservationRecord
                                         │
                                         ├── 1:N ── Wishlist
                                         └── 1:N ── Review
```

---

## 2. Complete Database Entities & Enums

### 2.1 Enums

```prisma
enum Role {
  STUDENT
  FACULTY
  LIBRARIAN
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BLOCKED
  SUSPENDED
}

enum CopyStatus {
  AVAILABLE
  ISSUED
  RESERVED
  LOST
  DAMAGED
  MAINTENANCE
}

enum CopyCondition {
  NEW
  GOOD
  FAIR
  POOR
  DAMAGED
}

enum IssueStatus {
  ISSUED
  RETURNED
  OVERDUE
  LOST
}

enum ReservationStatus {
  PENDING
  NOTIFIED
  FULFILLED
  CANCELLED
  EXPIRED
}

enum FineStatus {
  UNPAID
  PARTIALLY_PAID
  PAID
  WAIVED
}

enum PaymentMethod {
  CASH
  ONLINE
  UPI
  CARD
  WAIVER
}
```

---

## 3. Full Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ------------------------------------------------------
// USER & ROLE MANAGEMENT
// ------------------------------------------------------

model User {
  id               String       @id @default(uuid())
  email            String       @unique
  passwordHash     String
  fullName         String
  phone            String?
  avatarUrl        String?
  role             Role         @default(STUDENT)
  status           UserStatus   @default(ACTIVE)
  emailVerified    Boolean      @default(false)
  verificationToken String?
  resetToken       String?
  resetTokenExpiry DateTime?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  studentProfile   StudentProfile?
  facultyProfile   FacultyProfile?
  librarianProfile LibrarianProfile?

  issues           IssueRecord[]
  reservations     ReservationRecord[]
  fines            Fine[]
  notifications    Notification[]
  auditLogs        AuditLog[]
  reviews          Review[]
  wishlists        Wishlist[]

  @@index([email])
  @@index([role, status])
}

model StudentProfile {
  id           String   @id @default(uuid())
  userId       String   @unique
  rollNumber   String   @unique
  department   String
  course       String
  semester     Int
  academicYear String
  dateOfBirth  DateTime?
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model FacultyProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  employeeId  String   @unique
  department  String
  designation String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LibrarianProfile {
  id         String   @id @default(uuid())
  userId     String   @unique
  employeeId String   @unique
  department String   @default("Library Administration")
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ------------------------------------------------------
// CATALOG & CATALOG METADATA
// ------------------------------------------------------

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  code        String   @unique
  description String?
  books       Book[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Publisher {
  id        String   @id @default(uuid())
  name      String   @unique
  address   String?
  website   String?
  books     Book[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Author {
  id        String       @id @default(uuid())
  name      String
  bio       String?
  books     BookAuthor[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@index([name])
}

model Book {
  id              String       @id @default(uuid())
  isbn            String       @unique
  title           String
  subtitle        String?
  description     String?
  coverImage      String?
  publicationYear Int
  edition         String?
  language        String       @default("English")
  pages           Int?
  categoryId      String
  publisherId     String
  isActive        Boolean      @default(true)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  category        Category     @relation(fields: [categoryId], references: [id])
  publisher       Publisher    @relation(fields: [publisherId], references: [id])
  authors         BookAuthor[]
  copies          BookCopy[]
  reservations    ReservationRecord[]
  reviews         Review[]
  wishlists       Wishlist[]

  @@index([title])
  @@index([isbn])
  @@index([categoryId])
}

model BookAuthor {
  bookId   String
  authorId String

  book   Book   @relation(fields: [bookId], references: [id], onDelete: Cascade)
  author Author @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@id([bookId, authorId])
}

model BookCopy {
  id            String        @id @default(uuid())
  bookId        String
  barcode       String        @unique
  qrCodePayload String        @unique
  copyNumber    Int
  shelfLocation String
  status        CopyStatus    @default(AVAILABLE)
  condition     CopyCondition @default(GOOD)
  price         Float?
  purchaseDate  DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  book         Book                @relation(fields: [bookId], references: [id], onDelete: Cascade)
  issues       IssueRecord[]
  reservations ReservationRecord[]

  @@index([barcode])
  @@index([status])
  @@index([bookId])
}

// ------------------------------------------------------
// CIRCULATION ENGINE (ISSUES, RETURNS, RENEWALS)
// ------------------------------------------------------

model IssueRecord {
  id            String      @id @default(uuid())
  userId        String
  copyId        String
  issueDate     DateTime    @default(now())
  dueDate       DateTime
  returnDate    DateTime?
  renewalsCount Int         @default(0)
  status        IssueStatus @default(ISSUED)
  issuedBy      String?
  returnedBy    String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user          User            @relation(fields: [userId], references: [id])
  copy          BookCopy        @relation(fields: [copyId], references: [id])
  renewals      RenewalRecord[]
  fine          Fine?

  @@index([userId])
  @@index([copyId])
  @@index([status])
  @@index([dueDate])
}

model RenewalRecord {
  id          String   @id @default(uuid())
  issueId     String
  renewedAt   DateTime @default(now())
  previousDue DateTime
  newDueDate  DateTime

  issue IssueRecord @relation(fields: [issueId], references: [id], onDelete: Cascade)
}

// ------------------------------------------------------
// RESERVATIONS & WAITLISTS
// ------------------------------------------------------

model ReservationRecord {
  id          String            @id @default(uuid())
  userId      String
  bookId      String
  copyId      String?
  reservedAt  DateTime          @default(now())
  notifiedAt  DateTime?
  expiresAt   DateTime?
  queuePosition Int             @default(1)
  status      ReservationStatus @default(PENDING)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user User      @relation(fields: [userId], references: [id])
  book Book      @relation(fields: [bookId], references: [id])
  copy BookCopy? @relation(fields: [copyId], references: [id])

  @@index([userId])
  @@index([bookId, status])
}

// ------------------------------------------------------
// FINES & PAYMENTS
// ------------------------------------------------------

model Fine {
  id          String     @id @default(uuid())
  userId      String
  issueId     String     @unique
  overdueDays Int
  fineAmount  Float
  paidAmount  Float      @default(0)
  status      FineStatus @default(UNPAID)
  reason      String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user     User          @relation(fields: [userId], references: [id])
  issue    IssueRecord   @relation(fields: [issueId], references: [id])
  payments FinePayment[]

  @@index([userId])
  @@index([status])
}

model FinePayment {
  id            String        @id @default(uuid())
  fineId        String
  amountPaid    Float
  paymentDate   DateTime      @default(now())
  paymentMethod PaymentMethod @default(CASH)
  transactionRef String?
  collectedBy   String?
  remarks       String?

  fine Fine @relation(fields: [fineId], references: [id], onDelete: Cascade)
}

// ------------------------------------------------------
// NOTIFICATIONS, REVIEWS, WISHLIST, AUDIT & SETTINGS
// ------------------------------------------------------

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  message   String
  type      String   @default("GENERAL") // ISSUE, OVERDUE, RESERVATION, FINE, SYSTEM
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
}

model Review {
  id        String   @id @default(uuid())
  userId    String
  bookId    String
  rating    Int      // 1 to 5
  comment   String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  book Book @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId])
}

model Wishlist {
  id        String   @id @default(uuid())
  userId    String
  bookId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  book Book @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId])
}

model LibrarySetting {
  id                String   @id @default("default")
  libraryName       String   @default("Smart College Library")
  libraryEmail      String   @default("library@college.edu")
  libraryPhone      String   @default("+1-800-555-0199")
  address           String   @default("100 University Avenue, Academic Block A")
  studentMaxLoans   Int      @default(3)
  facultyMaxLoans   Int      @default(10)
  studentLoanDays   Int      @default(14)
  facultyLoanDays   Int      @default(30)
  maxRenewals       Int      @default(2)
  finePerDay        Float    @default(5.0)
  gracePeriodDays   Int      @default(2)
  maxFineAmount     Float    @default(500.0)
  reservationExpiryHours Int @default(48)
  updatedAt         DateTime @updatedAt
}

model LibraryHoliday {
  id          String   @id @default(uuid())
  holidayDate DateTime @unique
  description String
  createdAt   DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  entity    String
  entityId  String?
  details   String?
  ipAddress String?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([createdAt])
  @@index([action])
}
```
