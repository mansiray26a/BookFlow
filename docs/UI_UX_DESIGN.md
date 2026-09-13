# UI/UX Design Specification
## Smart College Library Management System (BookFlow LMS)

---

## 1. Design Philosophy & Visual Identity

The **BookFlow LMS** interface is designed to evoke a modern, high-end academic feel—combining clean typography, high readability, refined micro-interactions, dark/light theme support, and zero visual clutter.

* **Core Aesthetic**: Academic Elegance meets Modern SaaS (Deep Slate/Navy accents, warm subtle background tones, soft glassmorphic panels, clear status badges).
* **Typography Hierarchy**:
  * Body & UI Labels: `Inter`, sans-serif (Clean, readable at small font sizes).
  * Display & Headings: `Outfit` or `Plus Jakarta Sans` (Academic authority, strong geometric headers).
  * Monospace / Barcodes / Codes: `JetBrains Mono` or `Fira Code` (For ISBN, Barcode IDs, Call numbers).

---

## 2. Design System Tokens & Color Palette

### 2.1 Color Palette (CSS Custom Properties / Tailwind Config)

#### Light Theme Palette
* `--bg-main`: `#f8fafc` (Slate-50)
* `--bg-card`: `#ffffff` (Pure White)
* `--bg-sidebar`: `#0f172a` (Slate-900 / Deep Navy)
* `--text-primary`: `#0f172a` (Slate-900)
* `--text-secondary`: `#475569` (Slate-600)
* `--text-muted`: `#94a3b8` (Slate-400)
* `--border-color`: `#e2e8f0` (Slate-200)
* `--accent-primary`: `#2563eb` (Royal Academic Blue - Blue-600)
* `--accent-hover`: `#1d4ed8` (Blue-700)
* `--accent-secondary`: `#0d9488` (Emerald Teal - Teal-600)
* `--status-success`: `#16a34a` (Green-600)
* `--status-warning`: `#d97706` (Amber-600)
* `--status-danger`: `#dc2626` (Red-600)
* `--status-info`: `#0284c7` (Sky-600)

#### Dark Theme Palette
* `--bg-main`: `#0b0f19` (Ultra Dark Slate)
* `--bg-card`: `#1e293b` (Slate-800)
* `--bg-sidebar`: `#020617` (Slate-950)
* `--text-primary`: `#f8fafc` (Slate-50)
* `--text-secondary`: `#cbd5e1` (Slate-300)
* `--text-muted`: `#64748b` (Slate-500)
* `--border-color`: `#334155` (Slate-700)
* `--accent-primary`: `#3b82f6` (Blue-500)
* `--accent-hover`: `#60a5fa` (Blue-400)
* `--accent-secondary`: `#14b8a6` (Teal-500)

---

## 3. Navigation Architecture & Page Hierarchy

```
PUBLIC ROUTE TREE
├── / (Landing Page - Search Bar, Featured Books, Stats, Timings, Hero)
├── /catalog (Public Search & Faceted Filter Grid)
├── /book/:id (Public Book Details & Copy Availability)
├── /about (Library Infrastructure & Vision)
└── /contact (Location, Support, Desk Timings)

AUTHENTICATION ROUTES
├── /login (Multi-role single portal with role detection)
├── /register/student (Student onboarding wizard with Roll No & Dept)
├── /register/faculty (Faculty onboarding wizard with Employee ID)
├── /forgot-password (Email trigger for reset)
└── /reset-password (Secure token password updater)

STUDENT DASHBOARD TREE (/student/*)
├── /student/dashboard (Overview stats, active loans, due alerts, quick search)
├── /student/books (Catalog view with active reservation/borrow controls)
├── /student/reservations (Active waitlist items & queue progress)
├── /student/history (Complete borrowing history log with export option)
├── /student/fines (Unpaid & historical fines with payment action)
├── /student/wishlist (Saved books list)
├── /student/notifications (In-app notification center)
└── /student/profile (Edit details, avatar upload, password change)

FACULTY DASHBOARD TREE (/faculty/*)
├── /faculty/dashboard (Faculty metrics, active loans, priority renewals)
├── /faculty/books (Catalog & privilege requests)
├── /faculty/reservations (Priority waitlist items)
├── /faculty/history (Course reference loan history)
├── /faculty/fines (Fine status)
├── /faculty/notifications (Notifications)
└── /faculty/profile (Profile management)

ADMINISTRATOR DASHBOARD TREE (/admin/*)
├── /admin/dashboard (Real-time analytics, borrowing charts, quick issue/return scan widget)
├── /admin/books (Catalog master table, add/edit modal, bulk CSV upload)
├── /admin/copies (Physical inventory tracker, barcode/QR code printer preview)
├── /admin/issues (Active loan management, quick return modal, renewal trigger)
├── /admin/returns (Dedicated barcode scanner return entry point)
├── /admin/reservations (Queue manager & manual allocation override)
├── /admin/users (Master user table: Student/Faculty/Librarian status controls)
├── /admin/fines (Outstanding fines table, record payment, waive fine modal)
├── /admin/reports (Exportable PDF/CSV reports)
├── /admin/audit-logs (System event trail table)
└── /admin/settings (Institutional policies, max loans, holiday calendar setup)
```

---

## 4. Key Page Layouts & Component Wireframe Specs

### 4.1 Global Navbar & Sidebar Layout
* **Header Bar**: College Logo + Name, Global Search trigger (`Ctrl + K`), Light/Dark Theme toggle button, Notification Bell with live unread badge, User Avatar & Dropdown Menu (Profile, Settings, Logout).
* **Collapsible Sidebar**: Role-aware navigation links with active state indicator (left accent bar), badge counts for pending returns/due books.

### 4.2 Public Catalog & Search Page
* **Hero Search Banner**: Centered search bar with quick filters (`Title`, `Author`, `ISBN`, `Category`).
* **Sidebar Filters**: Category checkboxes, Availability toggle (`In Stock Only`), Publication Year slider, Language filter.
* **Book Cards Grid**: 
  * Book Cover Thumbnail with hover zoom effect.
  * Category Pill Badge (e.g., `Computer Science`).
  * Availability Chip (`Available: 4/5` in Green, or `Waitlisted` in Amber).
  * Title, Author, Publication Year.
  * Action Buttons: `View Details`, `Reserve` / `Add to Wishlist`.

### 4.3 Admin Barcode Issue & Return Quick Scanner
* **Barcode Mode Toggle**: `Issue Mode` vs. `Return Mode`.
* **Scanner Input Area**: Autofocused text input field optimized for hardware barcode scanners (detects `Enter` key signal to immediately fire API lookup).
* **Active Return/Issue Drawer**: Displays real-time fetched physical copy information, assigned user card, fine status, and one-click `Complete Transaction` trigger.

### 4.4 Responsive Table System
* Custom reusable data table with sorting headers, column toggle, bulk action bar, inline status badges (`ACTIVE`, `OVERDUE`, `RETURNED`, `BLOCKED`), and pagination controls.

---

## 5. Micro-Interactions, Feedback & Accessibility

* **Skeleton Loading**: Soft shimmer loading blocks for catalog cards, table rows, and dashboard metrics while TanStack Query fetches data.
* **Toast Notifications**: System-wide toast triggers on action success/failure (e.g., "Book successfully renewed for 14 days!").
* **Confirmation Dialogs**: Destructive actions (deactivating users, waiving fines, deleting titles) require explicit modal confirmation.
* **Accessibility (a11y)**:
  * Full keyboard accessibility (Focus rings visible on form fields and interactive elements).
  * ARIA roles (`role="dialog"`, `aria-expanded`, `aria-label`) on modals and dropdowns.
  * Color contrast ratios exceeding WCAG AA standards (4.5:1 ratio minimum).
