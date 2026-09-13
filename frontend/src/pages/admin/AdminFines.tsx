import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../api/client';
import { Fine } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminFines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [waivingFineId, setWaivingFineId] = useState<string | null>(null);
  const [waiverReason, setWaiverReason] = useState('');

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/fines');
      setFines(res.data || []);
    } catch (err) {
      console.error('Failed to load fines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleWaiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waivingFineId || !waiverReason.trim()) return;
    try {
      await api.post(`/fines/${waivingFineId}/waive`, { reason: waiverReason.trim() });
      setWaivingFineId(null);
      setWaiverReason('');
      fetchFines();
    } catch (err: any) {
      alert(err.message || 'Waive fine failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-extrabold">Master Fine Register & Collection</h1>
        <p className="text-xs text-slate-500 mt-1">Monitor outstanding overdue liabilities, record payments, and execute waivers.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <Card className="overflow-hidden p-0 border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Borrower Name</th>
                  <th className="p-4">Book Copy</th>
                  <th className="p-4">Overdue Days</th>
                  <th className="p-4">Fine Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{f.user?.fullName}</div>
                      <div className="text-[11px] text-slate-400">{f.user?.email}</div>
                    </td>
                    <td className="p-4 font-bold max-w-xs truncate">{f.issue?.copy?.book?.title}</td>
                    <td className="p-4 font-bold text-amber-600 dark:text-amber-400">{f.overdueDays} Days</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">₹{f.fineAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge variant={f.status === 'PAID' ? 'success' : f.status === 'WAIVED' ? 'info' : 'danger'}>
                        {f.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {f.status === 'UNPAID' && (
                        <Button onClick={() => setWaivingFineId(f.id)} variant="outline" size="sm">
                          Waive Fine
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Waive Fine Modal */}
      <Modal isOpen={!!waivingFineId} onClose={() => setWaivingFineId(null)} title="Waive Overdue Fine">
        <form onSubmit={handleWaiveSubmit} className="space-y-4 text-xs">
          <p className="text-slate-500">Provide official administrative justification for waiving this fine liability.</p>
          <input
            type="text"
            placeholder="e.g. Medical emergency exception approved by Dean"
            value={waiverReason}
            onChange={(e) => setWaiverReason(e.target.value)}
            className="w-full p-2.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 text-xs"
            required
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button onClick={() => setWaivingFineId(null)} type="button" variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Waiver
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
