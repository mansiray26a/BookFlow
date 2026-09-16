import React from 'react';
import { UserCheck, Mail, Phone, IdCard, GraduationCap, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-extrabold">Student Member Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Verified institutional identity and borrowing quota parameters.</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-200 pb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold">{user.fullName}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="info">{user.role}</Badge>
              <Badge variant="success">Account {user.status}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-600 font-semibold uppercase flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Email Address</span>
            </span>
            <p className="font-medium text-slate-900">{user.email}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-600 font-semibold uppercase flex items-center space-x-1.5">
              <IdCard className="w-3.5 h-3.5 text-blue-500" />
              <span>Roll Number / ID</span>
            </span>
            <p className="font-mono font-bold text-slate-900">{user.studentProfile?.rollNumber || 'CS2024001'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-600 font-semibold uppercase flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              <span>Department</span>
            </span>
            <p className="font-medium text-slate-900">{user.studentProfile?.department || 'Computer Science'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-600 font-semibold uppercase flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              <span>Course & Semester</span>
            </span>
            <p className="font-medium text-slate-900">
              {user.studentProfile?.course} (Sem {user.studentProfile?.semester})
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-700">Borrowing Policy Quota:</span>
          <p className="text-slate-600">Maximum concurrent loans: 3 books | Default loan duration: 14 days | Max renewals: 2</p>
        </div>
      </Card>
    </div>
  );
};
