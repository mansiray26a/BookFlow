import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Clock, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { IssueRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res: any = await api.get('/issues/my-issues');
        setIssues(res.data || []);
      } catch (err) {
        console.error('Failed to load faculty loans:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchIssues();
  }, []);

  const activeLoans = issues.filter((i) => i.status === 'ISSUED' || i.status === 'OVERDUE');

  return (
    <div className="space-y-8">
      {/* Faculty Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="info" className="text-[10px] bg-purple-500/20 text-purple-200 border-purple-400/30">
            Faculty Privileged Account • {user?.facultyProfile?.designation || 'Professor'}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold">
            Welcome, {user?.fullName}
          </h1>
          <p className="text-xs text-purple-200">
            Employee ID: <span className="font-mono font-bold text-white">{user?.facultyProfile?.employeeId}</span> | Dept: {user?.facultyProfile?.department}
          </p>
        </div>
        <Button onClick={() => navigate('/catalog')} variant="primary" size="md" className="bg-white text-purple-900 hover:bg-slate-100 shrink-0">
          <BookOpen className="w-4 h-4 mr-2" /> Search Catalog
        </Button>
      </div>

      {/* Privileged Quota Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center space-x-4 border-purple-500/30 bg-purple-500/5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Extended Capacity</span>
            <h3 className="text-2xl font-heading font-bold">{activeLoans.length} / 10 Books</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-blue-500/30 bg-blue-500/5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loan Duration</span>
            <h3 className="text-2xl font-heading font-bold">30 Days</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-emerald-500/30 bg-emerald-500/5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Renewals Allowed</span>
            <h3 className="text-2xl font-heading font-bold">Max 3</h3>
          </div>
        </Card>
      </div>

      {/* Active Loans Register */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-bold">Active Academic Loans</h2>
        {loading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : activeLoans.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-heading font-bold text-base">No Active Loans</h3>
            <p className="text-xs text-slate-500">You currently have no checked-out reference material.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((issue) => (
              <Card key={issue.id} className="p-5 flex gap-4 items-start">
                <img
                  src={issue.copy?.book?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'}
                  alt={issue.copy?.book?.title}
                  className="w-16 h-24 object-cover rounded-lg bg-slate-800 shrink-0"
                />
                <div className="flex-1 space-y-2 min-w-0">
                  <h3 className="font-heading font-bold text-sm truncate">{issue.copy?.book?.title}</h3>
                  <p className="text-xs text-slate-500 font-mono">Barcode: {issue.copy?.barcode}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Due Date: <strong>{new Date(issue.dueDate).toLocaleDateString()}</strong>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
