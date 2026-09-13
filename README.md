# Smart College Library Management System (BookFlow LMS)

Enterprise-grade, full-stack Smart College Library Management System built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **Prisma ORM**.

---

## 🌟 Key Features & Role-Based Workflows

### 👑 Administrator & Librarian Portal (`/admin/*`)
* **Real-Time Analytics Dashboard**: Live metrics for Total Books, Active Loans, Overdue Registrations, Pending Waitlists, Unpaid Fines, and Recharts Category Distribution charts.
* **Master Catalog Management**: Create, edit, and deactivate titles; bulk tag authors, categories, and publishers.
* **Physical Copy Register**: Register physical book copies with unique Barcodes, QR code payloads, Condition ratings (`NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`), and Shelf Locations.
* **Barcode Circulation & Return Scanner**: Dedicated hardware barcode scanning interfaces for instantaneous book issues and returns with automated fine calculation and queue advancement.
* **Fine & Payment Processing**: Record partial or full cash payments, or issue formal waivers with documented justification.
* **Audit Trail**: Non-repudiable audit logging tracking every administrative action, timestamp, and entity ID.
* **Institutional Policy Settings**: Configure loan limits (Student max 3, Faculty max 10), durations, fine rates per day, grace periods, and waitlist hold hours.

### 🎓 Faculty Portal (`/faculty/*`)
* **Privileged Borrowing Quota**: Extended borrowing capacity (up to 10 books) and 30-day loan durations.
* **Priority Waitlist Placement**: Priority queuing on checked-out research references.
* **Active Loans & Renewal Tracking**: Self-service 1-click renewal on eligible active loans.

### 🎒 Student Portal (`/student/*`)
* **Student Dashboard**: Welcome view showing active loans, due date warnings, waitlist queue status, and outstanding fine balances.
* **Faceted Catalog Browser**: Multi-field real-time search (Title, Author, ISBN, Category) with availability status chips (`In-Stock Available` vs. `Waitlisted`).
* **Waitlist Reservations**: 1-click waitlist reservation placement on unavailable titles with position indicator.
* **Digital Fine Clearance**: View overdue line items and execute simulated 1-click digital fine payments.

---

## 🔑 Default Credentials for Instant Testing

The system comes pre-seeded with realistic institutional accounts:

| Role | Email | Password | Institutional ID | Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `Admin@123456` | `EMP-ADM-001` | Complete system oversight, policy settings, audit logs |
| **Librarian** | `librarian@college.edu` | `Librarian@123456` | `EMP-LIB-002` | Issue/Return barcode scanner, user management, fine waivers |
| **Faculty** | `professor.smith@college.edu` | `Faculty@123456` | `EMP-FAC-101` | 10 books / 30-day loan quota, course reference tracking |
| **Student** | `student.alex@college.edu` | `Student@123456` | `CS2023001` | 3 books / 14-day loan quota, catalog search, fine payments |

> 💡 **Quick 1-Click Login**: The `/login` page includes quick-fill buttons for instant 1-click credential loading!

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
* **Backend**: Node.js v20, Express, TypeScript, JWT Auth, Zod Validation, Helmet, Morgan.
* **Database & ORM**: Prisma ORM v5 with SQLite zero-config local development database.

---

## 🚀 How to Run locally

### 1. Run Backend API Server (`http://localhost:5000`)
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```

### 2. Run Frontend Web Portal (`http://localhost:5173`)
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 Project Documentation

Additional architectural documentation is saved in the `/docs` folder:
* [PRD.md](file:///c:/Users/priya/OneDrive/Desktop/BookFlow/docs/PRD.md) — Product Requirement Document
* [TRD.md](file:///c:/Users/priya/OneDrive/Desktop/BookFlow/docs/TRD.md) — Technical Requirement Document
* [UI_UX_DESIGN.md](file:///c:/Users/priya/OneDrive/Desktop/BookFlow/docs/UI_UX_DESIGN.md) — UI/UX Design System Specification
* [BACKEND_SCHEMA.md](file:///c:/Users/priya/OneDrive/Desktop/BookFlow/docs/BACKEND_SCHEMA.md) — Relational Entity Model & Prisma Schema
