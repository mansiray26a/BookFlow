import React, { useState, useEffect } from 'react';
import { Users, Search, UserCheck, ShieldAlert, Plus } from 'lucide-react';
import api from '../../api/client';
import { User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isLibrarianModalOpen, setIsLibrarianModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'Library Operations',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const toggleStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.patch(`/users/${user.id}/status`, { status: nextStatus });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleCreateLibrarian = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/librarians', formData);
      setIsLibrarianModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create librarian account.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold">User Account Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage registered Students, Faculty members, and Library staff.</p>
        </div>
        <Button onClick={() => setIsLibrarianModalOpen(true)} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Create Librarian Account
        </Button>
      </div>

      <Input
        placeholder="Filter users by name, email, roll number, employee ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="w-4 h-4" />}
      />

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <Card className="overflow-hidden p-0 border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4">User Name & Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Institutional ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="bg-white hover:bg-blue-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-600">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'FACULTY' ? 'info' : 'success'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-slate-700">
                      {u.studentProfile?.rollNumber || u.facultyProfile?.employeeId || u.librarianProfile?.employeeId || '—'}
                    </td>
                    <td className="p-4">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status}</Badge>
                    </td>
                    <td className="p-4">
                      {u.role !== 'ADMIN' && (
                        <Button onClick={() => toggleStatus(u)} variant="outline" size="sm">
                          {u.status === 'ACTIVE' ? 'Block User' : 'Activate User'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Librarian Modal */}
      <Modal isOpen={isLibrarianModalOpen} onClose={() => setIsLibrarianModalOpen(false)} title="Create Librarian Account">
        <form onSubmit={handleCreateLibrarian} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Official Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Employee ID"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => setIsLibrarianModalOpen(false)} type="button" variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
