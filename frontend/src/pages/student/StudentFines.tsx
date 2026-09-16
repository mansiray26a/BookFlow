import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../../api/client';
import { Fine } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const StudentFines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/fines/my-fines');
      setFines(res.data || []);
    } catch (err) {
      console.error('Failed to fetch fines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePay = async (fine: Fine) => {
    setPayingId(fine.id);
    try {
      const remainingAmount = fine.fineAmount - fine.paidAmount;
      await api.post(`/fines/${fine.id}/pay`, {
        amount: remainingAmount,
        paymentMethod: 'ONLINE',
        transactionRef: `TXN-MOCK-${Date.now()}`,
      });
      await fetchFines();
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed.');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-extrabold">Fines & Financial Liabilities</h1>
        <p className="text-xs text-slate-500 mt-1">Review overdue library fines and execute online digital clearance.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : fines.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-heading font-bold text-lg">No Fines Assessed</h3>
          <p className="text-xs text-slate-500">Your account is clear of any overdue liabilities.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {fines.map((fine) => {
            const dueBalance = fine.fineAmount - fine.paidAmount;
            return (
              <Card key={fine.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={fine.status === 'PAID' ? 'success' : fine.status === 'WAIVED' ? 'info' : 'danger'}>
                      {fine.status}
                    </Badge>
                    <span className="text-xs font-mono text-slate-600">ID: {fine.id.substring(0, 8)}...</span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    {fine.issue?.copy?.book?.title || 'Library Overdue Charge'}
                  </h3>
                  <p className="text-xs text-slate-500">{fine.reason || 'Overdue return liability'}</p>
                  <p className="text-[11px] text-slate-600">Assessed Date: {new Date(fine.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center space-x-6 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Total Fine</span>
                    <span className="text-xl font-heading font-extrabold text-slate-900">
                      ₹{fine.fineAmount.toFixed(2)}
                    </span>
                    {fine.paidAmount > 0 && (
                      <span className="text-[11px] text-emerald-500 block">Paid: ₹{fine.paidAmount.toFixed(2)}</span>
                    )}
                  </div>

                  {fine.status !== 'PAID' && fine.status !== 'WAIVED' && (
                    <Button
                      onClick={() => handlePay(fine)}
                      isLoading={payingId === fine.id}
                      variant="primary"
                      size="sm"
                    >
                      <CreditCard className="w-4 h-4 mr-1.5" /> Pay ₹{dueBalance.toFixed(2)}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
