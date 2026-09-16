import React, { useState, useEffect } from 'react';
import { Barcode, UserCheck, CheckCircle2, AlertTriangle, IndianRupee, X, Info } from 'lucide-react';
import api from '../../api/client';
import { User, BookCopy, IssueRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

// ── Fine Warning Modal ────────────────────────────────────────────────────────
interface FineModalProps {
  borrowerName: string;
  bookTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const FineWarningModal: React.FC<FineModalProps> = ({ borrowerName, bookTitle, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      {/* Header */}
      <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Confirm Book Issue</h2>
          <p className="text-xs text-gray-500 mt-0.5">Please review the fine policy before issuing</p>
        </div>
        <button onClick={onCancel} className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">Borrower:</span>
            <span className="font-semibold text-gray-900">{borrowerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Book:</span>
            <span className="font-semibold text-gray-900 text-right max-w-[220px] line-clamp-1">{bookTitle}</span>
          </div>
        </div>

        {/* Fine Policy box */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Fine Policy</p>
            <p className="text-sm font-bold text-red-900 mt-0.5">₹5 per day after due date</p>
            <p className="text-xs text-red-600 mt-1">
              The borrower is responsible for returning the book on time. Late returns will incur a daily fine of ₹5 automatically.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
          <span>The borrower will be notified of the due date and fine policy via their student account.</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Confirm &amp; Issue
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const AdminCirculation: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [scannedCopy, setScannedCopy] = useState<BookCopy | null>(null);
  const [scanError, setScanError] = useState('');
  const [issueSuccess, setIssueSuccess] = useState<IssueRecord | null>(null);
  const [showFineModal, setShowFineModal] = useState(false);

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
    // Show styled fine warning modal
    setShowFineModal(true);
  };

  const handleConfirmedIssue = async () => {
    setShowFineModal(false);
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
      setUserId('');
    } catch (err: any) {
      alert(err.message || 'Failed to issue book copy.');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === userId);
  const bookTitle = scannedCopy?.book?.title || barcode;

  return (
    <>
      {/* Fine Warning Modal */}
      {showFineModal && (
        <FineWarningModal
          borrowerName={selectedUser?.fullName || 'Selected Borrower'}
          bookTitle={bookTitle}
          onConfirm={handleConfirmedIssue}
          onCancel={() => setShowFineModal(false)}
        />
      )}

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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Assign to Student / Faculty Member
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Fine reminder strip */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
                <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                <span>Fine policy: <strong>₹5 per day</strong> for overdue returns</span>
              </div>

              <Button type="submit" isLoading={loading} variant="primary" className="w-full">
                Confirm &amp; Issue Book Copy
              </Button>
            </form>

            {issueSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Issue Successful!</span>
                </div>
                <p>Due Date: <strong>{new Date(issueSuccess.dueDate).toLocaleDateString('en-IN')}</strong></p>
                <p className="text-amber-600">Reminder: ₹5 fine per day applies after the due date.</p>
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
                  <span className="text-slate-300 block text-[10px] uppercase font-bold">Book Title</span>
                  <h4 className="font-bold text-base text-white">{scannedCopy.book?.title}</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-300 block text-[10px] uppercase font-bold">Barcode</span>
                    <span className="font-mono text-blue-400 font-bold">{scannedCopy.barcode}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block text-[10px] uppercase font-bold">Shelf Location</span>
                    <span className="text-white">{scannedCopy.shelfLocation}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-300 block text-[10px] uppercase font-bold">Status</span>
                  <Badge variant={scannedCopy.status === 'AVAILABLE' ? 'success' : 'danger'}>
                    {scannedCopy.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-300 text-xs">
                Scan or enter a barcode above to inspect physical copy availability.
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};
