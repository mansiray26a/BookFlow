# Product Requirement Document (PRD)
## Smart College Library Management System (BookFlow LMS)

---

## 1. Executive Summary & Vision

**BookFlow LMS** is an enterprise-grade, full-stack Smart College Library Management System engineered specifically for higher education institutions (colleges and universities). The platform bridges physical library operations with modern digital workflows—streamlining book discovery, automated circulation (issues, returns, renewals), waitlist queue management, multi-role borrowing policies, real-time fine tracking, transaction-safe inventory control, and administrative analytics.

The system replaces legacy library software with a high-performance, responsive React UI, secure Node.js/Express REST APIs, PostgreSQL relational storage managed via Prisma ORM, and comprehensive role-based access controls (RBAC) across Students, Faculty, and Library Administrators.

---

## 2. User Roles & Access Control (RBAC)

The system enforces strict Role-Based Access Control across three core actor types:

### 2.1 Student User
* **Target Audience**: Enrolled undergraduate and graduate students.
* **Core Objectives**: Search book catalog, check copy availability, place and monitor reservations, track issued books and due dates, self-service eligible book renewals, view and pay overdue fines, maintain wishlists, submit book reviews, and receive automated notifications.
* **Privileges & Constraints**:
  * Default borrowing limit: Configurable (default: 3 books).
  * Default loan duration: Configurable (default: 14 days).
  * Renewal limit: Configurable (default: max 2 renewals per issue, provided no active waitlist reservations exist).
  * Restricted from administrative functions, physical barcode generation, user management, and manual override of fines or collection statuses.

### 2.2 Faculty User
* **Target Audience**: Teaching faculty, professors, and academic researchers.
* **Core Objectives**: Extended borrowing duration, higher concurrent loan capacity, priority reservation processing, course reference material tracking, historical borrowing logs, and notifications.
* **Privileges & Constraints**:
  * Extended borrowing limit: Configurable (default: 10 books).
  * Extended loan duration: Configurable (default: 30 days).
  * Renewal limit: Configurable (default: max 3 renewals per issue).
  * Reduced fine rate or configurable faculty grace periods.

### 2.3 Librarian / Admin User
* **Target Audience**: Head Librarian, Assistant Librarians, and System Administrators.
* **Core Objectives**: Full lifecycle oversight of physical copies, circulation overrides, user account lifecycle management, catalog cataloging (books, authors, categories, publishers, bulk CSV import), issue/return scan workflows via barcode/QR code, fine processing (collection, partial payment, waiver), system configuration, audit logs, and operational reports/analytics.
* **Privileges & Constraints**:
  * Read/Write/Execute access across all platform data structures.
  * Capability to manually adjust fine amounts, issue manual overrides for blocked accounts, configure institutional policies, and view complete system audit logs.

---

## 3. Comprehensive Business Logic & Rules Matrix

| Rule Domain | Policy / Constraint | System Enforcement Behavior |
| :--- | :--- | :--- |
| **Book Copy Statuses** | `AVAILABLE`, `ISSUED`, `RESERVED`, `LOST`, `DAMAGED`, `MAINTENANCE` | Only copies marked `AVAILABLE` can be issued. Copies marked `ISSUED` can be reserved. |
| **Max Borrowing Limit** | Configurable per role (`studentMaxLoans`, `facultyMaxLoans`) | Issue requests blocked if `active_issued_count >= max_limit`. |
| **Loan Durations** | Configurable per role (`studentLoanDays`, `facultyLoanDays`) | `due_date = issue_date + loan_days` (adjusted for library holidays). |
| **Renewals** | Configurable max renewals (`maxRenewals`) | Blocked if `renewals_count >= maxRenewals`, if account is blocked, if book is overdue beyond grace period, or if an active `RESERVATION` waitlist exists for the book. |
| **Reservations / Waitlist** | First-Come, First-Served Queue (FIFO) | When a copy is returned, if active waitlist exists, status becomes `RESERVED` for top queue user; notification sent with collection expiry timer (e.g., 48 hours). |
| **Fine Calculation** | Server-side execution only: `Overdue Days * Fine Per Day` | Calculated dynamically on return or daily cron task; excludes library holidays; accounts with unpaid fines > threshold get restricted from new issues/renewals. |
| **Account Restriction** | Auto-block on threshold breach or manual flag | User status set to `BLOCKED`/`SUSPENDED`; prohibits new issues, renewals, or reservations. |
| **Concurrency Control** | Database transaction isolation (`$transaction`) | Prevents double-booking or double-issuance of the exact physical copy ID (`BookCopy`). |

---

## 4. Key Functional Modules

### 4.1 Authentication & Profile Management
* **Public & Auth Routes**: `/login`, `/register/student`, `/register/faculty`, `/forgot-password`, `/reset-password`, `/verify-email`.
* **Security Standards**: JWT access tokens (short-lived 15m), HTTP-only refresh tokens (7d), password hashing using `bcrypt` (12 rounds) or `argon2id`, rate-limited auth endpoints.
* **Profile System**: Avatar upload, institutional ID mapping (Roll Number for students, Employee ID for faculty), phone/department updates, and password change.

### 4.2 Book Catalog & Search Engine
* **Catalog Browsing**: Rich grid/list layout, real-time debounced multi-field search (title, author, ISBN, category, publisher, subject tags).
* **Faceted Filtering**: Filter by category, author, language, publication year range, availability status (`Available Now`, `All`).
* **Sorting**: Relevance, title (A-Z, Z-A), publication year (newest first), popularity (most borrowed).
* **Book Details Page**: Dynamic availability counters (e.g., "3 of 5 copies available"), physical shelf location (e.g., "Floor 2, Shelf B-14"), reservation status, related books slider, community reviews, and wishlist toggles.

### 4.3 Circulation Engine (Issue, Return, Renewal)
* **Issue Processing**: Admin scans or selects User ID + Book Copy Barcode. System validates user standing (fines, active limits, status) and copy status, creating `IssueRecord` and setting copy status to `ISSUED`.
* **Return Processing**: Admin scans Copy Barcode. System calculates return date, overdue days, fine liability (if any), updates copy to `AVAILABLE` (or `RESERVED` if waitlisted), records return, and triggers notification.
* **Self & Admin Renewal**: Checks renewal eligibility (reservation lock, policy counts), extends `due_date`, increments `renewals_count`.

### 4.4 Reservation & Queue System
* Automated queue placement when zero copies are available.
* Cancel reservation anytime by student/faculty.
* Automatic assignment of returned copy to the oldest pending reservation (`PENDING` -> `FULFILLED`/`NOTIFIED`).
* Time-bound collection window (e.g., 48-hour reservation hold). Expired holds auto-advance to next user in queue.

### 4.5 Fine & Payment System
* Automatic fine computation on return or scheduled daily background updates.
* Partial payment recording, full payment closure, and librarian fine waiver capability with audited reason logging.
* Payment history tracking with mock digital payment gateway support (Razorpay/Stripe mock workflow) or cashier receipt entry.

### 4.6 Notifications & Announcements
* In-app Notification Center (Unread counter, Mark as Read, Filtering).
* Automated system notifications for: Book Issued, Book Due Soon (3 days prior), Book Overdue, Reservation Available, Fine Generated, Account Standing Update.
* Email service interface (SMTP driver ready).

### 4.7 Barcode & QR Code Management
* Unique barcode string and QR payload for every physical copy (`BookCopy`).
* On-screen SVG/Canvas barcode/QR rendering for physical tagging.
* Keyboard-wedge scanner support (auto-submitting search inputs on barcode scanner newline signal).

### 4.8 Administration & Inventory Management
* CRUD for Books, Copies, Authors, Categories, Publishers.
* Bulk CSV import for book inventory with validation preview.
* Copy maintenance logging (Condition tracking: `Good`, `Damaged`, `Under Maintenance`).
* Library settings portal (policy configuration, institutional details, holiday calendar setup).

### 4.9 Reports, Analytics & Audit Logging
* **Executive Dashboard**: Key stats (Total Books, Total Copies, Issued, Reserved, Overdue, Active Users, Unpaid Fines).
* **Interactive Charts**: Monthly circulation trends, top-borrowed books bar chart, department-wise usage pie chart, overdue fine revenue trend lines.
* **Exporting**: PDF, CSV report export for Issued Books, Overdue Registers, Fine Collections, and Inventory Valuation.
* **Audit Log**: Non-repudiable audit trails recording user ID, target entity, action string (`CREATE_BOOK`, `WAIVE_FINE`, `UPDATE_POLICY`), timestamp, and IP address.

---

## 5. Non-Functional Requirements (NFRs)

* **Performance**: API response times < 150ms for normal queries, < 300ms for analytics aggregation. Dynamic index usage on search keys.
* **Scalability**: Stateless Express JWT backend architecture capable of horizontal scaling behind Nginx/Docker swarm.
* **Usability & Aesthetics**: Modern clean typography (Inter / Outfit), accessible color contrast (WCAG AA), glassmorphism highlights, smooth transitions, instant client feedback, light/dark mode persistence.
* **Data Integrity**: Acid-compliant PostgreSQL transactions for inventory updates. FK CASCADE/SET NULL rules carefully bounded.
* **Reliability & Error Resilience**: Global client-side error boundary, toast notifications for API failures, structured JSON logging for backend diagnostics.
