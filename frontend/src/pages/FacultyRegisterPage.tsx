import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, User, Mail, Lock, Phone, IdCard, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const FacultyRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    employeeId: '',
    department: 'Electrical Engineering',
    designation: 'Professor',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerFaculty } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await registerFaculty({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        employeeId: formData.employeeId,
        department: formData.department,
        designation: formData.designation,
      });
      setSuccess('Faculty account created! Redirecting…');
      setTimeout(() => navigate('/faculty/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Faculty registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-2xl space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Faculty Registration</h1>
          <p className="text-sm text-gray-500">Extended loan limits and durations for faculty members.</p>
        </div>

        <Card className="p-6 space-y-5">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="freg-name" label="Full Name" name="fullName" placeholder="Dr. Clara Davis"
                value={formData.fullName} onChange={handleChange} icon={<User className="w-4 h-4" />} required />
              <Input id="freg-email" label="Official Email" name="email" type="email"
                placeholder="faculty@college.edu" value={formData.email} onChange={handleChange}
                icon={<Mail className="w-4 h-4" />} required />
              <Input id="freg-empid" label="Employee ID" name="employeeId" placeholder="EMP-FAC-999"
                value={formData.employeeId} onChange={handleChange} icon={<IdCard className="w-4 h-4" />} required />
              <Input id="freg-phone" label="Phone Number" name="phone" placeholder="+1 555 000 8899"
                value={formData.phone} onChange={handleChange} icon={<Phone className="w-4 h-4" />} />
              <Input id="freg-dept" label="Department" name="department" placeholder="Electrical Engineering"
                value={formData.department} onChange={handleChange} icon={<Building className="w-4 h-4" />} required />
              <Input id="freg-desig" label="Designation" name="designation" placeholder="Professor / Associate Prof"
                value={formData.designation} onChange={handleChange} required />
              <Input id="freg-pwd" label="Password" name="password" type="password" placeholder="Min. 8 characters"
                value={formData.password} onChange={handleChange} icon={<Lock className="w-4 h-4" />}
                helpText="At least 8 characters" required />
              <Input id="freg-cpwd" label="Confirm Password" name="confirmPassword" type="password"
                placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange}
                icon={<Lock className="w-4 h-4" />} required />
            </div>

            <Button id="freg-submit" type="submit" isLoading={loading} variant="primary" className="w-full" size="md">
              Create Faculty Account
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign In</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
