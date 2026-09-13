import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Layers, MapPin, CheckCircle, AlertTriangle, Clock, Heart, ArrowLeft, Barcode } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Book } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [modalMsg, setModalMsg] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res: any = await api.get(`/books/${id}`);
        setBook(res.data);
      } catch (err) {
        console.error('Failed to fetch book details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setReserving(true);
    try {
      const res: any = await api.post('/reservations', { bookId: book?.id });
      setModalMsg({
        title: 'Reservation Confirmed',
        body: `You are placed in the waitlist queue at position #${res.data.queuePosition}. We will notify you when a copy becomes available!`,
      });
    } catch (err: any) {
      setModalMsg({
        title: 'Reservation Failed',
        body: err.message || 'Unable to place reservation at this time.',
      });
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold">Book Not Found</h2>
        <Button onClick={() => navigate('/catalog')} variant="outline" size="sm">
          Return to Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Cover Thumbnail & Quick Action Box */}
        <div className="space-y-6">
          <div className="h-96 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 relative">
            <img
              src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3">
              <Badge variant={book.isAvailable ? 'success' : 'warning'} className="text-xs px-3 py-1">
                {book.isAvailable ? `${book.availableCopies} Available` : 'Waitlist Only'}
              </Badge>
            </div>
          </div>

          <Card className="p-5 space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Circulation Standing</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {book.isAvailable ? `${book.availableCopies} of ${book.totalCopies} copies in shelf` : 'All physical copies currently issued'}
              </p>
            </div>

            {user?.role === 'STUDENT' || user?.role === 'FACULTY' ? (
              <Button
                onClick={handleReserve}
                disabled={book.isAvailable}
                isLoading={reserving}
                variant={book.isAvailable ? 'secondary' : 'primary'}
                className="w-full"
              >
                {book.isAvailable ? 'Available at Front Desk' : 'Place Waitlist Reservation'}
              </Button>
            ) : !user ? (
              <Button onClick={() => navigate('/login')} variant="primary" className="w-full">
                Login to Reserve
              </Button>
            ) : (
              <Button onClick={() => navigate('/admin/issues')} variant="outline" className="w-full">
                Issue via Admin Portal
              </Button>
            )}
          </Card>
        </div>

        {/* Book Metadata & Description */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <Badge variant="info">{book.category?.name || 'General Academic'}</Badge>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white">
              {book.title}
            </h1>
            {book.subtitle && <p className="text-base text-slate-500">{book.subtitle}</p>}
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 pt-1">
              By {book.authors?.map((a) => a.author.name).join(', ') || 'Unknown Author'}
            </p>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">ISBN Number</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{book.isbn}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Publication Year</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{book.publicationYear}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Publisher</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{book.publisher?.name || 'Academic'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Edition / Pages</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{book.edition || '1st Ed'} ({book.pages || 400}p)</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-lg">Synopsis & Overview</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {book.description || 'No detailed description available for this catalog record.'}
            </p>
          </div>

          {/* Physical Copies Register */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-heading font-bold text-lg flex items-center space-x-2">
              <Barcode className="w-5 h-5 text-blue-500" />
              <span>Physical Inventory Register</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {book.copies?.map((copy) => (
                <div
                  key={copy.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{copy.barcode}</span>
                    <p className="text-slate-500 flex items-center space-x-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{copy.shelfLocation}</span>
                    </p>
                  </div>
                  <Badge variant={copy.status === 'AVAILABLE' ? 'success' : copy.status === 'ISSUED' ? 'warning' : 'danger'}>
                    {copy.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalMsg && (
        <Modal isOpen={!!modalMsg} onClose={() => setModalMsg(null)} title={modalMsg.title}>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{modalMsg.body}</p>
          <div className="flex justify-end">
            <Button onClick={() => setModalMsg(null)} variant="primary" size="sm">
              Understood
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
