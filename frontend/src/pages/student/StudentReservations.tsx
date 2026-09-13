import React, { useState, useEffect } from 'react';
import { Clock, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { ReservationRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const StudentReservations: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/reservations/my-reservations');
      setReservations(res.data || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await api.delete(`/reservations/${id}`);
      await fetchReservations();
    } catch (err: any) {
      alert(err.message || 'Cancel reservation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-extrabold">Active Book Reservations & Waitlists</h1>
        <p className="text-xs text-slate-500 mt-1">Track your placement queue positions for high-demand titles.</p>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : reservations.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Clock className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-heading font-bold text-base">No Active Reservations</h3>
          <p className="text-xs text-slate-500">You currently have no active waitlist reservations.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <Card key={res.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant={res.status === 'NOTIFIED' ? 'success' : res.status === 'PENDING' ? 'warning' : 'default'}>
                    {res.status}
                  </Badge>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Queue Position #{res.queuePosition}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base">{res.book?.title}</h3>
                <p className="text-xs text-slate-500">Reserved on: {new Date(res.reservedAt).toLocaleDateString()}</p>
              </div>

              {res.status === 'PENDING' && (
                <Button
                  onClick={() => handleCancel(res.id)}
                  isLoading={cancellingId === res.id}
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Cancel Reservation
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
