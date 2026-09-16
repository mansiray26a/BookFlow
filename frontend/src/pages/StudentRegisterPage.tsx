import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, Phone, IdCard, GraduationCap, Building, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const StudentRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    rollNumber: '',
    department: 'Computer Science',
    course: 'B.Tech CS',
    semester: 1,
    academicYear: '2024-2028',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { setError('Full name is required.'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await registerStudent({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        rollNumber: formData.rollNumber,
        department: formData.department,
        course: formData.course,
        semester: Number(formData.semester),
        academicYear: formData.academicYear,
      });
      setSuccess('Account created successfully! Redirecting…');
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-2xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 bg-green-600 rounded-lg flex items-center justify-center mx-auto">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Student Registration</h1>
          <p className="text-sm text-gray-500">Create your library account to borrow books and make reservations.</p>
        </div>

        <Card className="p-6 space-y-5">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="reg-fullname" label="Full Name" name="fullName" placeholder="Alex Rivera"
                value={formData.fullName} onChange={handleChange} icon={<User className="w-4 h-4" />} required />
              <Input id="reg-email" label="Institutional Email" name="email" type="email"
                placeholder="student@college.edu" value={formData.email} onChange={handleChange}
                icon={<Mail className="w-4 h-4" />} required />
              <Input id="reg-rollno" label="Roll Number / Student ID" name="rollNumber" placeholder="CS2024099"
                value={formData.rollNumber} onChange={handleChange} icon={<IdCard className="w-4 h-4" />} required />
              <Input id="reg-phone" label="Phone Number" name="phone" placeholder="+1 555 000 1122"
                value={formData.phone} onChange={handleChange} icon={<Phone className="w-4 h-4" />} />
              <Input id="reg-dept" label="Department" name="department" placeholder="Computer Science"
                value={formData.department} onChange={handleChange} icon={<Building className="w-4 h-4" />} required />
              <Input id="reg-course" label="Course" name="course" placeholder="B.Tech CS"
                value={formData.course} onChange={handleChange} required />
              <Input id="reg-sem" label="Semester" name="semester" type="number" min={1} max={10}
                value={formData.semester} onChange={handleChange} required />
              <Input id="reg-year" label="Academic Year" name="academicYear" placeholder="2024-2028"
                value={formData.academicYear} onChange={handleChange} required />
              <Input id="reg-password" label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
                value={formData.password} onChange={handleChange} icon={<Lock className="w-4 h-4" />}
                endAdornment={<button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-gray-400 hover:text-primary-600 transition" aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
                helpText="At least 8 characters" required />
              <Input id="reg-confirm-password" label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange}
                icon={<Lock className="w-4 h-4" />} endAdornment={<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1 text-gray-400 hover:text-primary-600 transition" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} title={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} required />
            </div>

            <Button id="reg-submit" type="submit" isLoading={loading} variant="primary" className="w-full" size="md">
              Create Student Account
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
