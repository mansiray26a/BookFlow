import React, { useState, useEffect } from 'react';
import { Clock, Barcode, UserCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../api/client';
import { User, BookCopy, IssueRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminCirculation: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [scannedCopy, setScannedCopy] = useState<BookCopy | null>(null);
  const [scanError, setScanError] = useState('');
  const [issueSuccess, setIssueSuccess] = useState<IssueRecord | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res: any = await api.get('/users?limit=50');
        setUsers(res.data || []);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    }
    loadUsers();
  }, []);

  const handleScanLookup = async () => {
    if (!barcode.trim()) return;
    setScanError('');
    try {
      const res: any = await api.get(`/books/copies/scan/${barcode.trim()}`);
      setScannedCopy(res.data);
    } catch (err: any) {
      setScanError(err.message || 'Copy barcode not found.');
      setScannedCopy(null);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !userId) return;
    setLoading(true);
    setIssueSuccess(null);
    try {
      const res: any = await api.post('/issues/issue', {
        copyBarcode: barcode.trim(),
        userId,
      });
      setIssueSuccess(res.data);
      setBarcode('');
      setScannedCopy(null);
    } catch (err: any) {
      alert(err.message || 'Failed to issue book copy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-extrabold">Circulation Desk — Issue Book Copy</h1>
        <p className="text-xs text-slate-500 mt-1">Scan or type physical barcode to assign book loan to student or faculty.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issue Form */}
        <Card className="p-6 space-y-4">
          <form onSubmit={handleIssueSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Input
                label="Physical Copy Barcode"
                placeholder="Scan or enter BC-CC-001..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onBlur={handleScanLookup}
                icon={<Barcode className="w-4 h-4" />}
                required
              />
              <Button onClick={handleScanLookup} type="button" variant="ghost" size="sm" className="text-xs text-blue-500 p-0">
                Verify Barcode Copy →
              </Button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Assign to Student / Faculty Member
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Borrower Account</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role}) — {u.email}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" isLoading={loading} variant="primary" className="w-full">
              Confirm & Issue Book Copy
            </Button>
          </form>

          {issueSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Issue Successful!</span>
              </div>
              <p>Due Date: <strong>{new Date(issueSuccess.dueDate).toLocaleDateString()}</strong></p>
            </div>
          )}
        </Card>

        {/* Live Barcode Scanned Copy Info */}
        <Card className="p-6 space-y-4 bg-slate-900 text-white border-slate-800">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Barcode className="w-5 h-5 text-blue-400" />
            <h3 className="font-heading font-bold text-sm">Scanned Copy Inspector</h3>
          </div>

          {scanError ? (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
              {scanError}
            </div>
          ) : scannedCopy ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Book Title</span>
                <h4 className="font-bold text-base text-white">{scannedCopy.book?.title}</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Barcode</span>
                  <span className="font-mono text-blue-400 font-bold">{scannedCopy.barcode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Shelf Location</span>
                  <span className="text-white">{scannedCopy.shelfLocation}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <Badge variant={scannedCopy.status === 'AVAILABLE' ? 'success' : 'danger'}>
                  {scannedCopy.status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Scan or enter a barcode above to inspect physical copy availability.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
