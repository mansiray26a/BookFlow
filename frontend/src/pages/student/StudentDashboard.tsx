import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, AlertCircle, DollarSign, Calendar, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { IssueRecord, ReservationRecord, Fine } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issuesRes, resRes, finesRes]: any = await Promise.all([
        api.get('/issues/my-issues'),
        api.get('/reservations/my-reservations'),
        api.get('/fines/my-fines'),
      ]);
      setIssues(issuesRes.data || []);
      setReservations(resRes.data || []);
      setFines(finesRes.data || []);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenew = async (issueId: string) => {
    setRenewingId(issueId);
    try {
      await api.post(`/issues/${issueId}/renew`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Renewal failed.');
    } finally {
      setRenewingId(null);
    }
  };

  const activeIssues = issues.filter((i) => i.status === 'ISSUED' || i.status === 'OVERDUE');
  const totalUnpaidFines = fines
    .filter((f) => f.status === 'UNPAID' || f.status === 'PARTIALLY_PAID')
    .reduce((sum, f) => sum + (f.fineAmount - f.paidAmount), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="info" className="text-[10px] bg-blue-500/20 text-blue-200 border-blue-400/30">
            Student Portal • {user?.studentProfile?.department || 'Engineering'}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold">
            Welcome Back, {user?.fullName}!
          </h1>
          <p className="text-xs text-blue-200">
            Roll No: <span className="font-mono font-bold text-white">{user?.studentProfile?.rollNumber}</span> | Course: {user?.studentProfile?.course} (Sem {user?.studentProfile?.semester})
          </p>
        </div>
        <Button onClick={() => navigate('/student/books')} variant="primary" size="md" className="bg-white text-blue-900 hover:bg-slate-100 shrink-0">
          <BookOpen className="w-4 h-4 mr-2" /> Search Catalog
        </Button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center space-x-4 border-blue-500/30 bg-blue-500/5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Loans</span>
            <h3 className="text-2xl font-heading font-bold">{activeIssues.length} / 3 Books</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-amber-500/30 bg-amber-500/5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Waitlist Queue</span>
            <h3 className="text-2xl font-heading font-bold">{reservations.filter((r) => r.status === 'PENDING').length} Active</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-red-500/30 bg-red-500/5">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Unpaid Fines</span>
            <h3 className="text-2xl font-heading font-bold text-red-600 dark:text-red-400">
              ₹{totalUnpaidFines.toFixed(2)}
            </h3>
          </div>
        </Card>
      </div>

      {/* Currently Issued Books Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Currently Issued Books</h2>
          <Button onClick={() => navigate('/student/history')} variant="ghost" size="sm">
            View All History →
          </Button>
        </div>

        {loading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : activeIssues.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-heading font-bold text-base">No Active Loans</h3>
            <p className="text-xs text-slate-500">You currently have no physical books checked out.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIssues.map((issue) => (
              <Card key={issue.id} className="p-5 flex gap-4 items-start">
                <img
                  src={issue.copy?.book?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'}
                  alt={issue.copy?.book?.title}
                  className="w-16 h-24 object-cover rounded-lg bg-slate-800 shrink-0"
                />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-sm truncate">{issue.copy?.book?.title}</h3>
                    <Badge variant={issue.status === 'OVERDUE' ? 'danger' : 'success'} size="sm">
                      {issue.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">Barcode: {issue.copy?.barcode}</p>

                    <div className="text-xs text-slate-700 space-y-0.5 pt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>Due: <strong>{new Date(issue.dueDate).toLocaleDateString()}</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-600">Renewals used: {issue.renewalsCount} / 2</div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => handleRenew(issue.id)}
                      isLoading={renewingId === issue.id}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Renew Book Loan
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
