import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, RotateCcw } from 'lucide-react';
import api from '../api/client';
import { Book, Category } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const availabilityFilter = searchParams.get('availability') || '';
  const sortOption = searchParams.get('sort') || 'newest';

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res: any = await api.get('/admin/categories');
        setCategories(res.data || []);
      } catch { /* silent */ }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (searchQuery) q.set('search', searchQuery);
        if (selectedCategory) q.set('category', selectedCategory);
        if (availabilityFilter) q.set('availability', availabilityFilter);
        q.set('sort', sortOption);
        q.set('page', String(meta.page));
        q.set('limit', '12');
        const res: any = await api.get(`/books?${q.toString()}`);
        setBooks(res.data || []);
        if (res.meta) setMeta(res.meta);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, [searchQuery, selectedCategory, availabilityFilter, sortOption, meta.page]);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());
  const hasFilters = !!(searchQuery || selectedCategory || availabilityFilter);

  const selectClass = 'w-full border border-gray-300 bg-white rounded-md text-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-heading font-semibold text-gray-900">Library Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse and search across all book collections.</p>
        </div>
        <Badge variant="info">{meta.total} titles found</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="space-y-4">
          <Card className="p-4 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-gray-400" />
                Filters
              </span>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cat-filter" className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Category</label>
              <select id="cat-filter" value={selectedCategory} onChange={(e) => updateParam('category', e.target.value)} className={selectClass}>
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c._count?.books || 0})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Availability</label>
              <div className="space-y-2 text-sm text-gray-700">
                {[
                  { label: 'All Books', val: '' },
                  { label: 'Available Now', val: 'available' },
                ].map(({ label, val }) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availabilityFilter === val}
                      onChange={() => updateParam('availability', val)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sort-filter" className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Sort By</label>
              <select id="sort-filter" value={sortOption} onChange={(e) => updateParam('sort', e.target.value)} className={selectClass}>
                <option value="newest">Newest First</option>
                <option value="title_asc">Title (A → Z)</option>
                <option value="title_desc">Title (Z → A)</option>
                <option value="year_desc">Publication Year (Newest)</option>
              </select>
            </div>
          </Card>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5">
          {/* Search Input */}
          <Input
            id="catalog-search"
            placeholder="Search by title, author, or ISBN…"
            value={searchQuery}
            onChange={(e) => updateParam('search', e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="space-y-2">
                  <Skeleton className="h-44 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <Card>
              <EmptyState
                icon={BookOpen}
                title="No books found"
                description="Try clearing your filters or searching with different keywords."
                action={
                  hasFilters ? (
                    <Button onClick={clearFilters} variant="outline" size="sm">Clear Filters</Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {books.map((book) => (
                <Card
                  key={book.id}
                  onClick={() => navigate(`/book/${book.id}`)}
                  className="flex flex-col overflow-hidden group"
                >
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=70'}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={book.isAvailable ? 'success' : 'warning'} size="sm">
                        {book.isAvailable ? `${book.availableCopies} Available` : 'Waitlisted'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 space-y-1">
                    <Badge variant="default" size="sm" className="w-fit">{book.category?.name || 'General'}</Badge>
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {book.authors?.map((a) => a.author.name).join(', ') || 'Unknown Author'}
                    </p>
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                      <span className="font-mono truncate">{book.isbn}</span>
                      <span className="text-primary-600 font-medium shrink-0 ml-2">Details →</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <Button
                disabled={meta.page <= 1}
                onClick={() => setSearchParams((p) => { p.set('page', String(meta.page - 1)); return p; })}
                variant="outline"
                size="sm"
              >
                ← Previous
              </Button>
              <span className="text-sm text-gray-600 font-medium">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                disabled={meta.page >= meta.totalPages}
                onClick={() => setSearchParams((p) => { p.set('page', String(meta.page + 1)); return p; })}
                variant="outline"
                size="sm"
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
