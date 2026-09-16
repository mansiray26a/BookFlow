import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

interface DemoUser {
  label: string;
  email: string;
  password: string;
  role: string;
}

const DEMO_USERS: DemoUser[] = [
  { label: 'Admin', email: 'admin@college.edu', password: 'Admin@123456', role: 'Admin' },
  { label: 'Librarian', email: 'librarian@college.edu', password: 'Librarian@123456', role: 'Librarian' },
  { label: 'Faculty', email: 'professor.smith@college.edu', password: 'Faculty@123456', role: 'Faculty' },
  { label: 'Student', email: 'student.alex@college.edu', password: 'Student@123456', role: 'Student' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'ADMIN' || user.role === 'LIBRARIAN') navigate('/admin/dashboard');
      else if (user.role === 'FACULTY') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demo: DemoUser) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md space-y-5">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Sign In to BookFlow</h1>
          <p className="text-sm text-gray-500">Academic Library Portal — Students, Faculty & Administrators</p>
        </div>

        {/* Form Card */}
        <Card className="p-6 space-y-5">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

          <form id="login-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <div className="space-y-1">
              <Input
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            </div>

            <Button id="login-submit" type="submit" isLoading={loading} variant="primary" className="w-full" size="md">
              Sign In
            </Button>
          </form>

          {/* Register Links */}
          <div className="pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>Don't have an account?</p>
            <div className="flex justify-center gap-4 mt-1.5 font-medium text-primary-600">
              <Link to="/register/student" className="hover:underline">Student Registration</Link>
              <span className="text-gray-300">|</span>
              <Link to="/register/faculty" className="hover:underline">Faculty Registration</Link>
            </div>
          </div>
        </Card>

        {/* Demo Credentials */}
        <Card className="p-4 bg-gray-50 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => fillDemo(demo)}
                className="p-2.5 rounded border border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-200 text-left transition group"
              >
                <p className="text-xs font-semibold text-gray-800 group-hover:text-primary-700">{demo.role}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{demo.email}</p>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-center text-gray-400">Click any card to auto-fill credentials</p>
        </Card>
      </div>
    </div>
  );
};
