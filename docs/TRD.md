# Technical Requirement Document (TRD)
## Smart College Library Management System (BookFlow LMS)

---

## 1. System Architecture Overview

BookFlow LMS is built as a decoupled Client-Server web platform using TypeScript end-to-end.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER CLIENT                                │
│   React 18 + Vite + TypeScript + Tailwind CSS + Radix UI / Lucide Icons │
│       React Router v6 + TanStack Query v5 + React Hook Form + Zod       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / REST JSON
┌────────────────────────────────────▼────────────────────────────────────┐
│                             EXPRESS BACKEND                             │
│                  Node.js + Express + TypeScript (Strict)                │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Middleware Layer                                                    │ │
│ │ Helmet • CORS • Morgan • Rate Limiting • JWT Auth • RBAC Guard       │ │
│ └──────────────────────────────────┬──────────────────────────────────┘ │
│                                    │                                    │
│ ┌──────────────────────────────────▼──────────────────────────────────┐ │
│ │ Controller Layer (Input validation via Zod schemas)                 │ │
│ └──────────────────────────────────┬──────────────────────────────────┘ │
│                                    │                                    │
│ ┌──────────────────────────────────▼──────────────────────────────────┐ │
│ │ Service Layer (Business logic, calculations, transaction bounds)    │ │
│ └──────────────────────────────────┬──────────────────────────────────┘ │
│                                    │                                    │
│ ┌──────────────────────────────────▼──────────────────────────────────┐ │
│ │ Data Access Layer (Prisma Client ORM)                               │ │
│ └──────────────────────────────────┬──────────────────────────────────┘ │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │ SQL Queries (Pooled connection)
┌────────────────────────────────────▼────────────────────────────────────┐
│                           POSTGRESQL DATABASE                           │
│     Normalized Relational Schema • FK Constraints • Indexes • UUIDs    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack & Tooling

### 2.1 Frontend Stack
* **Framework**: React 18 with Vite (Ultra-fast build & HMR).
* **Language**: TypeScript 5.x (Strict mode enabled).
* **Styling**: Vanilla CSS design tokens + Tailwind CSS 3.x for utility layout styling.
* **Component Primitives**: Custom accessible UI primitives inspired by Radix UI & shadcn/ui design patterns.
* **Routing**: `react-router-dom` v6 with layout wrapping and role-guarded route components.
* **State Management & Data Fetching**: TanStack Query (React Query) v5 for server state caching, invalidation, and optimistic UI updates.
* **Forms & Validation**: `react-hook-form` with `@hookform/resolvers/zod` and `zod` client schemas.
* **Charts & Data Viz**: `recharts` for administrative dashboards and circulation reports.
* **Icons & UI FX**: `lucide-react`, `framer-motion` for smooth layout transitions, `clsx` + `tailwind-merge` (`cn` helper).

### 2.2 Backend Stack
* **Runtime**: Node.js v20 LTS.
* **Framework**: Express.js with TypeScript (`ts-node-dev` for local development, `tsc` for production builds).
* **ORM & Database Client**: Prisma ORM v5 with type-safe query generation and migration management.
* **Authentication**: `jsonwebtoken` (JWT), `bcryptjs` (password hashing with salt factor 12).
* **Security & Middleware**: `helmet` (HTTP headers), `cors` (origin lockdown), `express-rate-limit` (brute-force protection), `morgan` (HTTP logging), `multer` (multipart file uploads/avatars).
* **API Documentation**: `swagger-ui-express` with OpenAPI 3.0 specification.
* **Testing Framework**: Jest + `supertest` for API integration testing.

### 2.3 Database & Infrastructure
* **Database**: SQLite (Zero-dependency local development) / PostgreSQL 16 ready.
* **Architecture**: Stateless Express REST server with Prisma ORM client layer.

---

## 3. Directory & Repository Structure

```
BookFlow/
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   ├── UI_UX_DESIGN.md
│   └── BACKEND_SCHEMA.md
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/          # Environment variables, database client, constants
│   │   ├── controllers/     # HTTP request/response handlers
│   │   ├── middleware/      # Auth, RBAC, error handler, validation
│   │   ├── routes/          # Express route declarations
│   │   ├── services/        # Business logic & Prisma operations
│   │   ├── utils/           # JWT, hashing, pagination helpers, formatters
│   │   ├── validators/      # Zod request validation schemas
│   │   ├── types/           # TypeScript interfaces & custom express declarations
│   │   └── app.ts           # Express application initialization
│   ├── tests/               # Unit & integration tests
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── api/             # Axios/Fetch clients and API endpoint functions
    │   ├── assets/          # Static logos, images, placeholders
    │   ├── components/      # Reusable UI components (buttons, inputs, dialogs, tables)
    │   ├── contexts/        # Auth context, Theme context (light/dark)
    │   ├── hooks/           # Custom React hooks (useAuth, useDebounce, etc.)
    │   ├── layouts/         # Base layout wrappers (AdminLayout, StudentLayout, MainLayout)
    │   ├── pages/           # Page view components
    │   ├── routes/          # ProtectedRoute, AppRoutes declaration
    │   ├── types/           # Shared API contracts & TypeScript types
    │   ├── utils/           # Formatting utilities (currency, date, cn helper)
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## 4. API Specification & Endpoint Structure

Base API Endpoint Prefix: `/api/v1`

### 4.1 Authentication (`/auth`)
* `POST /auth/register/student` — Public registration for students
* `POST /auth/register/faculty` — Public registration for faculty
* `POST /auth/login` — Authenticate credentials, return JWT access token & set HTTP-only cookie
* `POST /auth/logout` — Clear session tokens
* `GET /auth/me` — Fetch currently authenticated user profile & permissions
* `POST /auth/forgot-password` — Initiate password reset email request
* `POST /auth/reset-password` — Complete password reset with token

### 4.2 User Management (`/users`)
* `GET /users` — Admin filterable list of all registered users (Pagination, Role filter, Search)
* `GET /users/:id` — Detailed user profile, active loans, borrowing history, fines
* `PUT /users/:id` — Update user profile details
* `PATCH /users/:id/status` — Activate/Deactivate user account
* `POST /users/librarians` — Admin-only: Create new Librarian/Admin account

### 4.3 Catalog & Book Management (`/books`)
* `GET /books` — Public search catalog with query parameters (`search`, `category`, `author`, `publisher`, `status`, `page`, `limit`, `sort`)
* `GET /books/:id` — Complete book details, author info, copy counts, ratings, and shelf location
* `POST /books` — Admin: Add new title to catalog
* `PUT /books/:id` — Admin: Update book catalog entry
* `DELETE /books/:id` — Admin: Soft delete / deactivate book title
* `POST /books/bulk-import` — Admin: Bulk import books via CSV upload

### 4.4 Book Copies & Barcodes (`/copies`)
* `GET /books/:bookId/copies` — View physical copy register for a book
* `POST /books/:bookId/copies` — Admin: Register physical copy (Barcode, QR, Shelf location)
* `PUT /copies/:id` — Admin: Update copy status (`AVAILABLE`, `MAINTENANCE`, `DAMAGED`, `LOST`)
* `GET /copies/scan/:barcode` — Admin lookup physical copy by scanned barcode/QR payload

### 4.5 Issue & Return Engine (`/issues`)
* `POST /issues` — Admin: Issue an available copy to a valid user (`copyBarcode`, `userId`)
* `POST /issues/:id/return` — Admin: Process return of issued copy (Calculates fine, updates copy status)
* `POST /issues/:id/renew` — Self/Admin: Renew eligible active issue record
* `GET /issues/my-issues` — Student/Faculty: View active loans & loan history
* `GET /issues` — Admin: Filterable master list of all active/historical issues

### 4.6 Reservations & Waitlists (`/reservations`)
* `POST /reservations` — Student/Faculty: Place waitlist reservation on unavailable book
* `GET /reservations/my-reservations` — View user active reservations & queue positions
* `DELETE /reservations/:id` — Cancel active reservation
* `GET /reservations` — Admin: Manage master reservation queue

### 4.7 Fines & Payments (`/fines`)
* `GET /fines/my-fines` — User view personal fine breakdown & status
* `GET /fines` — Admin register of outstanding & collected fines
* `POST /fines/:id/pay` — Record fine payment (Full / Partial)
* `POST /fines/:id/waive` — Admin fine waiver with documented justification

### 4.8 Reports, Analytics & Settings (`/admin`)
* `GET /admin/analytics/dashboard` — Summary metrics, monthly borrowing charts, top books
* `GET /admin/reports/issues` — Exportable circulation register
* `GET /admin/reports/fines` — Exportable revenue register
* `GET /admin/audit-logs` — System activity trail
* `GET /admin/settings` — Get current library configuration policies
* `PUT /admin/settings` — Update institutional loan limits, grace period, and fine rates

---

## 5. Security & Transaction Integrity Architecture

### 5.1 Concurrency & Inventory Lock Strategy
To eliminate race conditions where two concurrent administrative sessions attempt to issue the same physical book copy or two users place simultaneous reservations:
```typescript
// Prisma Transaction Example for Book Issue Workflow
await prisma.$transaction(async (tx) => {
  const copy = await tx.bookCopy.findUnique({
    where: { barcode: copyBarcode },
  });

  if (!copy || copy.status !== 'AVAILABLE') {
    throw new BadRequestError('Physical copy is not available for issue.');
  }

  const activeLoansCount = await tx.issueRecord.count({
    where: { userId, status: 'ISSUED' },
  });

  if (activeLoansCount >= maxLoansAllowed) {
    throw new BadRequestError('User borrowing limit exceeded.');
  }

  // Atomically update copy state and create issue record
  await tx.bookCopy.update({
    where: { id: copy.id },
    data: { status: 'ISSUED' },
  });

  const issue = await tx.issueRecord.create({
    data: {
      userId,
      copyId: copy.id,
      issueDate: new Date(),
      dueDate: calculatedDueDate,
      status: 'ISSUED',
    },
  });

  return issue;
});
```

### 5.2 Security Measures
1. **Password Hashing**: `bcryptjs` with salt factor of 12.
2. **JWT Authorization**: Transmitted via HTTP Headers (`Authorization: Bearer <token>`). Tokens encode `userId`, `role`, and expiration timestamp (`exp`).
3. **RBAC Guard**: Express middleware verifying token role payload against route permissions (`requireRole(['ADMIN', 'LIBRARIAN'])`).
4. **Input Sanitization & Schema Validation**: Strict input boundary validation using Zod on every payload before reaching controllers.
5. **Rate Limiting**: IP-based rate limiting on sensitive routes (`/auth/login`, `/auth/register`).
