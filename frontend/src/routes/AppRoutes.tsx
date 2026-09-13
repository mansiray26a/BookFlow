import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { NotFoundPage } from '../pages/NotFoundPage';

import { HomePage } from '../pages/HomePage';
import { CatalogPage } from '../pages/CatalogPage';
import { BookDetailsPage } from '../pages/BookDetailsPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/LoginPage';
import { StudentRegisterPage } from '../pages/StudentRegisterPage';
import { FacultyRegisterPage } from '../pages/FacultyRegisterPage';

import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentReservations } from '../pages/student/StudentReservations';
import { StudentHistory } from '../pages/student/StudentHistory';
import { StudentFines } from '../pages/student/StudentFines';
import { StudentProfile } from '../pages/student/StudentProfile';

import { FacultyDashboard } from '../pages/faculty/FacultyDashboard';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminBooks } from '../pages/admin/AdminBooks';
import { AdminCirculation } from '../pages/admin/AdminCirculation';
import { AdminReturnsScanner } from '../pages/admin/AdminReturnsScanner';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminFines } from '../pages/admin/AdminFines';
import { AdminAuditLogs } from '../pages/admin/AdminAuditLogs';
import { AdminSettings } from '../pages/admin/AdminSettings';

const ProtectedRoute: React.FC<{ roles?: string[]; children: React.ReactNode }> = ({
  roles,
  children,
}) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/book/:id" element={<BookDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/register/faculty" element={<FacultyRegisterPage />} />
      </Route>

      {/* Student Protected Portal */}
      <Route
        element={
          <ProtectedRoute roles={['STUDENT']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/books" element={<CatalogPage />} />
        <Route path="/student/reservations" element={<StudentReservations />} />
        <Route path="/student/history" element={<StudentHistory />} />
        <Route path="/student/fines" element={<StudentFines />} />
        <Route path="/student/wishlist" element={<CatalogPage />} />
        <Route path="/student/notifications" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      {/* Faculty Protected Portal */}
      <Route
        element={
          <ProtectedRoute roles={['FACULTY']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/books" element={<CatalogPage />} />
        <Route path="/faculty/reservations" element={<StudentReservations />} />
        <Route path="/faculty/history" element={<StudentHistory />} />
        <Route path="/faculty/fines" element={<StudentFines />} />
        <Route path="/faculty/notifications" element={<FacultyDashboard />} />
        <Route path="/faculty/profile" element={<StudentProfile />} />
      </Route>

      {/* Admin / Librarian Protected Portal */}
      <Route
        element={
          <ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/copies" element={<AdminBooks />} />
        <Route path="/admin/issues" element={<AdminCirculation />} />
        <Route path="/admin/returns" element={<AdminReturnsScanner />} />
        <Route path="/admin/reservations" element={<StudentReservations />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/fines" element={<AdminFines />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* 404 Not Found */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
