import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Users, Clock, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../api/client';
import { Book } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res: any = await api.get('/books?limit=4');
        setFeaturedBooks(res.data || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/catalog?search=${encodeURIComponent(searchTerm.trim())}` : '/catalog');
  };

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-7">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-200 bg-primary-600 border border-primary-500 rounded-full px-4 py-1">
            College Library Management Portal
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white leading-tight">
            Discover, Borrow & Manage<br className="hidden sm:block" /> Academic Books
          </h1>
          <p className="text-primary-100 max-w-2xl mx-auto text-sm sm:text-base">
            Search the catalog, manage reservations, track your loans, and handle fines — all from one portal for students, faculty, and librarians.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center bg-white rounded-md shadow-md overflow-hidden">
            <Search className="w-5 h-5 text-gray-400 ml-4 mr-2 shrink-0" />
            <input
              type="search"
              placeholder="Search by title, author, ISBN, or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none focus:outline-none"
              aria-label="Search books"
            />
            <Button type="submit" variant="primary" size="md" className="rounded-none m-0 py-3 px-5">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: BookOpen, value: '10,000+', label: 'Book Titles', color: 'text-primary-600' },
              { icon: Users, value: '2,500+', label: 'Active Students', color: 'text-green-600' },
              { icon: Clock, value: '300+', label: 'Faculty Members', color: 'text-amber-600' },
              { icon: ShieldCheck, value: '50+', label: 'Departments', color: 'text-indigo-600' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="space-y-1">
                <Icon className={`w-6 h-6 mx-auto ${color}`} />
                <p className={`text-2xl font-heading font-bold text-gray-900`}>{value}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Books ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-gray-900">Featured Books</h2>
            <p className="text-sm text-gray-500 mt-0.5">Handpicked academic references from our catalog.</p>
          </div>
          <Button onClick={() => navigate('/catalog')} variant="outline" size="sm">
            View All <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-72 rounded-lg" />)}
          </div>
        ) : featuredBooks.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No books found"
            description="Start adding books to the catalog."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {featuredBooks.map((book) => (
              <Card
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="flex flex-col overflow-hidden group"
              >
                <div className="h-44 bg-gray-100 relative overflow-hidden">
                  <img
                    src={book.coverImage || `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=70`}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={book.isAvailable ? 'success' : 'warning'}>
                      {book.isAvailable ? 'Available' : 'Waitlisted'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {book.authors?.map((a) => a.author.name).join(', ') || 'Unknown Author'}
                  </p>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span className="font-mono truncate">{book.isbn?.substring(0, 13)}</span>
                    <span className="text-primary-600 font-medium">Details →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── Services ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-heading font-semibold text-gray-900">Library Services</h2>
            <p className="text-sm text-gray-500 mt-1">Everything you need, in one system.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: 'Smart Book Search',
                desc: 'Filter by title, author, ISBN, category, language, and real-time availability.',
              },
              {
                icon: Clock,
                title: 'Reservation & Waitlists',
                desc: 'Reserve books and get automatically notified when a copy becomes available.',
              },
              {
                icon: CheckCircle,
                title: 'Barcode Circulation',
                desc: 'Librarians can issue and return books using barcode and QR code scanners.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-5 space-y-3">
                <div className="w-9 h-9 bg-primary-50 rounded-md flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center space-y-5">
          <h2 className="text-xl font-heading font-semibold text-gray-900">Get Started Today</h2>
          <p className="text-sm text-gray-500">
            Create your account to start borrowing books, making reservations, and tracking your reading history.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate('/register/student')} variant="primary">
              Register as Student
            </Button>
            <Button onClick={() => navigate('/register/faculty')} variant="outline">
              Register as Faculty
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
