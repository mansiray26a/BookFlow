import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Layers, Barcode, CheckCircle } from 'lucide-react';
import api from '../../api/client';
import { Book, Category, Publisher, Author } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    isbn: '',
    description: '',
    coverImage: '',
    publicationYear: 2024,
    edition: '1st Edition',
    language: 'English',
    pages: 400,
    categoryId: '',
    publisherId: '',
    authorIds: [] as string[],
  });

  const [copyFormData, setCopyFormData] = useState({
    barcode: '',
    shelfLocation: 'Floor 2, Shelf A-01',
    copyNumber: 1,
    condition: 'GOOD',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes, pRes, aRes]: any = await Promise.all([
        api.get(`/books?search=${encodeURIComponent(search)}`),
        api.get('/admin/categories'),
        api.get('/admin/publishers'),
        api.get('/admin/authors'),
      ]);
      setBooks(bRes.data || []);
      setCategories(cRes.data || []);
      setPublishers(pRes.data || []);
      setAuthors(aRes.data || []);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/books', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create book');
    }
  };

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCopyModalOpen) return;
    try {
      await api.post(`/books/${isCopyModalOpen}/copies`, copyFormData);
      setIsCopyModalOpen(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add physical copy');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold">Master Book Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Manage catalog titles, metadata, authors, and physical barcode copies.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Title
        </Button>
      </div>

      {/* Search Input */}
      <Input
        placeholder="Filter catalog by Title, ISBN, Author..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="w-4 h-4" />}
      />

      {/* Catalog Table */}
      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <Card className="overflow-hidden p-0 border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4">Book Title</th>
                  <th className="p-4">ISBN</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Copies Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {books.map((b) => (
                  <tr key={b.id} className="bg-white hover:bg-blue-50 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'}
                          alt={b.title}
                          className="w-10 h-14 object-cover rounded bg-slate-800 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 line-clamp-1">{b.title}</h4>
                          <p className="text-[11px] text-slate-600">
                            {b.authors?.map((a) => a.author.name).join(', ') || 'Unknown Author'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-700">{b.isbn}</td>
                    <td className="p-4">
                      <Badge variant="default" size="sm">{b.category?.name || 'General'}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={b.isAvailable ? 'success' : 'warning'}>
                        {b.availableCopies} of {b.totalCopies} Available
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        onClick={() => {
                          setCopyFormData((p) => ({ ...p, barcode: `BC-${Date.now().toString().slice(-6)}` }));
                          setIsCopyModalOpen(b.id);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Barcode className="w-3.5 h-3.5 mr-1" /> Add Copy
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add New Book Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Book Title to Catalog">
        <form onSubmit={handleCreateBook} className="space-y-4 text-xs">
          <Input
            label="Book Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="ISBN Number"
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-semibold">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block font-semibold">Publisher</label>
              <select
                value={formData.publisherId}
                onChange={(e) => setFormData({ ...formData, publisherId: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
                required
              >
                <option value="">Select Publisher</option>
                {publishers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block font-semibold">Primary Author</label>
            <select
              onChange={(e) => setFormData({ ...formData, authorIds: [e.target.value] })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
              required
            >
              <option value="">Select Author</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => setIsModalOpen(false)} type="button" variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Book Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Register Physical Copy Modal */}
      <Modal isOpen={!!isCopyModalOpen} onClose={() => setIsCopyModalOpen(null)} title="Register Physical Copy (Barcode Tag)">
        <form onSubmit={handleAddCopy} className="space-y-4 text-xs">
          <Input
            label="Copy Barcode String"
            value={copyFormData.barcode}
            onChange={(e) => setCopyFormData({ ...copyFormData, barcode: e.target.value })}
            required
          />
          <Input
            label="Shelf Location (Floor, Rack, Shelf)"
            value={copyFormData.shelfLocation}
            onChange={(e) => setCopyFormData({ ...copyFormData, shelfLocation: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => setIsCopyModalOpen(null)} type="button" variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register Physical Copy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
