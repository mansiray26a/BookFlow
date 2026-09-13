import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  BookMarked,
  Clock,
  DollarSign,
  Heart,
  Bell,
  UserCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Barcode,
  RotateCcw,
  FileText,
  ShieldAlert,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (user.role === 'ADMIN' || user.role === 'LIBRARIAN') {
      return [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Book Catalog', path: '/admin/books', icon: BookMarked },
        { label: 'Physical Copies', path: '/admin/copies', icon: Barcode },
        { label: 'Issue Books', path: '/admin/issues', icon: Clock },
        { label: 'Return Scanner', path: '/admin/returns', icon: RotateCcw },
        { label: 'Waitlists', path: '/admin/reservations', icon: BookMarked },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Fines & Payments', path: '/admin/fines', icon: DollarSign },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ];
    }
    if (user.role === 'FACULTY') {
      return [
        { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
        { label: 'Browse Catalog', path: '/faculty/books', icon: BookMarked },
        { label: 'Reservations', path: '/faculty/reservations', icon: Clock },
        { label: 'Loan History', path: '/faculty/history', icon: FileText },
        { label: 'Fines', path: '/faculty/fines', icon: DollarSign },
        { label: 'Notifications', path: '/faculty/notifications', icon: Bell },
        { label: 'My Profile', path: '/faculty/profile', icon: UserCheck },
      ];
    }
    return [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Search Books', path: '/student/books', icon: BookMarked },
      { label: 'My Reservations', path: '/student/reservations', icon: Clock },
      { label: 'Saved Books', path: '/student/wishlist', icon: Heart },
      { label: 'Borrowing History', path: '/student/history', icon: FileText },
      { label: 'Fines', path: '/student/fines', icon: DollarSign },
      { label: 'Notifications', path: '/student/notifications', icon: Bell },
      { label: 'My Profile', path: '/student/profile', icon: UserCheck },
    ];
  };

  const navLinks = getNavLinks();
  const currentLabel = navLinks.find((l) => l.path === location.pathname)?.label || 'Portal';

  const roleBadgeVariant = user.role === 'ADMIN' ? 'danger' : user.role === 'FACULTY' ? 'info' : 'success';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <Link to="/" className="flex items-center gap-2 overflow-hidden" onClick={() => setMobileOpen(false)}>
          <div className="w-7 h-7 bg-primary-600 rounded flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-heading font-semibold text-base text-gray-900 truncate">
              Book<span className="text-primary-600">Flow</span>
            </span>
          )}
        </Link>
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Pill */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <Badge variant={roleBadgeVariant} size="sm" className="mt-0.5">{user.role}</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Sidebar navigation">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5 shrink-0">
        <Link
          to="/catalog"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Public Catalog</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 sticky top-0 h-screen shrink-0 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-200 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-heading font-semibold text-base text-gray-900 truncate">
              {currentLabel}
            </h1>
          </div>
          {/* Avatar */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-500">{user.email}</span>
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
