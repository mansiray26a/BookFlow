import React, { useState, useEffect } from 'react';
import { FileText, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { IssueRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const StudentHistory: React.FC = () => {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res: any = await api.get('/issues/my-issues');
        setIssues(res.data || []);
      } catch (err) {
        console.error('Failed to load borrowing history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-extrabold">Complete Borrowing History</h1>
        <p className="text-xs text-slate-500 mt-1">Audit log of all past and current physical book loans.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : issues.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-heading font-bold text-base">No History Found</h3>
          <p className="text-xs text-slate-500">You have no recorded book issues yet.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Book Title</th>
                  <th className="p-4">Barcode</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Return Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {issue.copy?.book?.title}
                    </td>
                    <td className="p-4 font-mono text-slate-500">{issue.copy?.barcode}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{new Date(issue.issueDate).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{new Date(issue.dueDate).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4">
                      <Badge variant={issue.status === 'RETURNED' ? 'success' : issue.status === 'ISSUED' ? 'info' : 'danger'}>
                        {issue.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
