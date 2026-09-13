import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  DollarSign,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../../api/client';
import { AnalyticsData } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res: any = await api.get('/admin/analytics/dashboard');
        setData(res.data);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-14 w-full rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-24 rounded-md" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalBooks: 0, totalCopies: 0, availableCopies: 0, issuedCopies: 0,
    totalStudents: 0, totalFaculty: 0, overdueCount: 0,
    pendingReservations: 0, unpaidFinesTotal: 0,
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-4 shadow-card">
        <div>
          <h2 className="font-heading font-semibold text-gray-900">Administrative Console</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage circulation, inventory, and users</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/admin/issues')} variant="primary" size="sm">
            <Clock className="w-4 h-4 mr-1.5" /> Issue Book
          </Button>
          <Button onClick={() => navigate('/admin/returns')} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-1.5" /> Return Scanner
          </Button>
          <Button onClick={() => navigate('/admin/books')} variant="ghost" size="sm">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Add Book
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Titles',
            value: metrics.totalBooks,
            sub: `${metrics.totalCopies} physical copies`,
            icon: BookOpen,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
          },
          {
            label: 'Active Loans',
            value: metrics.issuedCopies,
            sub: `${metrics.availableCopies} available`,
            icon: Clock,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: 'Overdue Items',
            value: metrics.overdueCount,
            sub: `${metrics.pendingReservations} on waitlist`,
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Unpaid Fines',
            value: `₹${metrics.unpaidFinesTotal.toFixed(2)}`,
            sub: `${metrics.totalStudents + metrics.totalFaculty} members`,
            icon: DollarSign,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-md flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-2xl font-heading font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Distribution */}
        <Card className="p-5">
          <h3 className="font-heading font-semibold text-sm text-gray-900 mb-4">Books by Category</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryDistribution || []} margin={{ left: -10 }}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tick={{ fill: '#6b7280' }} />
                <YAxis stroke="#9ca3af" fontSize={10} tick={{ fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', color: '#374151' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Books */}
        <Card className="p-5">
          <h3 className="font-heading font-semibold text-sm text-gray-900 mb-4">Most Active Books</h3>
          {!data?.topBooks?.length ? (
            <EmptyState icon={BookOpen} title="No activity yet" description="Book activity will appear here." />
          ) : (
            <div className="space-y-2">
              {data.topBooks.slice(0, 5).map((b, idx) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-gray-400 font-mono w-4 shrink-0">#{idx + 1}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{b.title}</p>
                      <p className="text-gray-400 font-mono">{b.isbn}</p>
                    </div>
                  </div>
                  <Badge variant="info" className="shrink-0 ml-2">
                    {b._count?.copies || 1} copies
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Members Summary */}
      <Card className="p-5">
        <h3 className="font-heading font-semibold text-sm text-gray-900 mb-3">Member Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50">
            <Users className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{metrics.totalStudents}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50">
            <Users className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{metrics.totalFaculty}</p>
              <p className="text-xs text-gray-500">Faculty Members</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
