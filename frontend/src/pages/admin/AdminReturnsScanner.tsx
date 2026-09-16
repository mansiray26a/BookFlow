import React, { useState } from 'react';
import { RotateCcw, Barcode, CheckCircle2, AlertTriangle, User, DollarSign } from 'lucide-react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminReturnsScanner: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [loading, setLoading] = useState(false);
  const [returnResult, setReturnResult] = useState<any | null>(null);

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    setLoading(true);
    setReturnResult(null);
    try {
      const res: any = await api.post('/issues/return', {
        copyBarcode: barcode.trim(),
        condition,
      });
      setReturnResult(res.data);
      setBarcode('');
    } catch (err: any) {
      alert(err.message || 'Return processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-extrabold flex items-center space-x-2">
          <RotateCcw className="w-6 h-6 text-emerald-500" />
          <span>Barcode Scanner Return Station</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Instant hardware barcode scanning station for processing returned book copies.</p>
      </div>

      <Card className="p-8 space-y-6 border-emerald-500/30 bg-emerald-500/5">
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <Input
            label="Scan Book Copy Barcode"
            placeholder="Scan barcode with hardware scanner (e.g. BC-CN-001)..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            icon={<Barcode className="w-5 h-5 text-emerald-500" />}
            className="text-base py-3 font-mono"
            autoFocus
            required
          />

          <div className="flex items-center space-x-4">
            <label className="text-xs font-semibold uppercase text-slate-700">
              Returned Copy Condition:
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs"
            >
              <option value="GOOD">GOOD Condition</option>
              <option value="NEW">NEW Condition</option>
              <option value="FAIR">FAIR Wear</option>
              <option value="POOR">POOR Condition</option>
              <option value="DAMAGED">DAMAGED (Requires Maintenance)</option>
            </select>
          </div>

          <Button type="submit" isLoading={loading} variant="primary" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
            Complete Return Transaction
          </Button>
        </form>
      </Card>

      {/* Return Outcome Card */}
      {returnResult && (
        <Card className="p-6 space-y-4 bg-slate-900 text-white border-slate-800 animate-fadeIn">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h3 className="font-heading font-bold text-lg text-emerald-400">Return Processed Successfully</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-300 block font-bold uppercase text-[10px]">Overdue Days</span>
              <span className="text-lg font-bold text-white">{returnResult.overdueDays} Days</span>
            </div>

            <div>
              <span className="text-slate-300 block font-bold uppercase text-[10px]">Fine Assessed</span>
              <span className={`text-lg font-bold ${returnResult.fineAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                ₹{returnResult.fineAmount.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-slate-300 block font-bold uppercase text-[10px]">Waitlist Auto-Advancement</span>
              <Badge variant={returnResult.waitlistNotified ? 'warning' : 'success'}>
                {returnResult.waitlistNotified ? 'Top Reserved User Notified' : 'Set to Available Shelf'}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
