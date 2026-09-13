import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    libraryName: 'Smart College Library',
    libraryEmail: 'library@college.edu',
    studentMaxLoans: 3,
    facultyMaxLoans: 10,
    studentLoanDays: 14,
    facultyLoanDays: 30,
    maxRenewals: 2,
    finePerDay: 5.0,
    gracePeriodDays: 2,
    reservationExpiryHours: 48,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res: any = await api.get('/admin/settings');
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.put('/admin/settings', settings);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-extrabold flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-500" />
          <span>Institutional Library Settings & Policy</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure institutional borrowing limits, loan durations, and overdue fine rates.</p>
      </div>

      <Card className="p-6 space-y-6">
        {success && (
          <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Library policies successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Library Institutional Name"
              value={settings.libraryName}
              onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
              required
            />
            <Input
              label="Official Contact Email"
              value={settings.libraryEmail}
              onChange={(e) => setSettings({ ...settings, libraryEmail: e.target.value })}
              required
            />
            <Input
              label="Student Borrowing Limit (Max Books)"
              type="number"
              value={settings.studentMaxLoans}
              onChange={(e) => setSettings({ ...settings, studentMaxLoans: Number(e.target.value) })}
              required
            />
            <Input
              label="Faculty Borrowing Limit (Max Books)"
              type="number"
              value={settings.facultyMaxLoans}
              onChange={(e) => setSettings({ ...settings, facultyMaxLoans: Number(e.target.value) })}
              required
            />
            <Input
              label="Student Loan Duration (Days)"
              type="number"
              value={settings.studentLoanDays}
              onChange={(e) => setSettings({ ...settings, studentLoanDays: Number(e.target.value) })}
              required
            />
            <Input
              label="Faculty Loan Duration (Days)"
              type="number"
              value={settings.facultyLoanDays}
              onChange={(e) => setSettings({ ...settings, facultyLoanDays: Number(e.target.value) })}
              required
            />
            <Input
              label="Max Allowed Renewals"
              type="number"
              value={settings.maxRenewals}
              onChange={(e) => setSettings({ ...settings, maxRenewals: Number(e.target.value) })}
              required
            />
            <Input
              label="Fine Per Overdue Day ($)"
              type="number"
              step="0.5"
              value={settings.finePerDay}
              onChange={(e) => setSettings({ ...settings, finePerDay: Number(e.target.value) })}
              required
            />
            <Input
              label="Grace Period (Days)"
              type="number"
              value={settings.gracePeriodDays}
              onChange={(e) => setSettings({ ...settings, gracePeriodDays: Number(e.target.value) })}
              required
            />
            <Input
              label="Waitlist Hold Duration (Hours)"
              type="number"
              value={settings.reservationExpiryHours}
              onChange={(e) => setSettings({ ...settings, reservationExpiryHours: Number(e.target.value) })}
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" isLoading={saving} variant="primary">
              <Save className="w-4 h-4 mr-1.5" /> Save Policy Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
