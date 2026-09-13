import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, User } from 'lucide-react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        const res: any = await api.get('/admin/audit-logs');
        setLogs(res.data || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-extrabold flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-blue-500" />
          <span>System Audit Trail Log</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Non-repudiable security log of administrative and circulation operations.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <Card className="overflow-hidden p-0 border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    <td className="p-4 font-mono text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-bold">
                      <Badge variant="info" size="sm">{log.action}</Badge>
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {log.user ? `${log.user.fullName} (${log.user.role})` : 'SYSTEM'}
                    </td>
                    <td className="p-4 font-mono text-slate-400">{log.entity}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 max-w-sm truncate">{log.details}</td>
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
