import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN' || user.role === 'LIBRARIAN') return '/admin/dashboard';
    if (user.role === 'FACULTY') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Book Catalog', path: '/catalog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="bg-gray-50 text-gray-900 font-sans overflow-x-hidden">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-semibold text-lg text-gray-900">
                Book<span className="text-primary-600">Flow</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                LMS
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <Button onClick={() => navigate(getDashboardLink())} variant="primary" size="sm">
                  My Dashboard
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate('/login')} variant="outline" size="sm">
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                    Login
                  </Button>
                  <Button onClick={() => navigate('/register/student')} variant="primary" size="sm">
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    Register
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <Button onClick={() => { navigate(getDashboardLink()); setMobileOpen(false); }} variant="primary" size="sm" className="w-full">
                  My Dashboard
                </Button>
              ) : (
                <>
                  <Button onClick={() => { navigate('/login'); setMobileOpen(false); }} variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                  <Button onClick={() => { navigate('/register/student'); setMobileOpen(false); }} variant="primary" size="sm" className="w-full">
                    Register as Student
                  </Button>
                  <Button onClick={() => { navigate('/register/faculty'); setMobileOpen(false); }} variant="ghost" size="sm" className="w-full">
                    Register as Faculty
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-800 text-gray-400 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-primary-400" />
                <span className="font-heading font-semibold text-base">BookFlow LMS</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                A complete College Library Management System for students, faculty, and librarians.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/catalog" className="hover:text-white transition">Book Catalog</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Portal Login</Link></li>
                <li><Link to="/register/student" className="hover:text-white transition">Student Registration</Link></li>
                <li><Link to="/register/faculty" className="hover:text-white transition">Faculty Registration</Link></li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Library Hours</h4>
              <ul className="space-y-1.5 text-sm">
                <li>Mon – Fri: 8:00 AM – 9:00 PM</li>
                <li>Saturday: 9:00 AM – 5:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Contact</h4>
              <ul className="space-y-1.5 text-sm">
                <li>Central Library Building, Block A</li>
                <li>
                  <a href="mailto:library@college.edu" className="hover:text-white transition">
                    library@college.edu
                  </a>
                </li>
                <li>
                  <a href="tel:+18005558742" className="hover:text-white transition">
                    +1 (800) 555-8742
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} BookFlow LMS — Smart College Library Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
