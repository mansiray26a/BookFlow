import React from 'react';
import { BookOpen, ShieldCheck, Clock, Award, Users, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold rounded-full uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" /> Institutional Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900">
          About BookFlow Library System
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          BookFlow LMS is the central digital library infrastructure designed to streamline academic book discovery, borrowing workflows, and research access for students, faculty, and administrators.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-gray-900">Seamless Borrowing</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Real-time catalog search, instant waitlist reservation queues, and barcode-driven circulation counters for high efficiency.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-gray-900">Role-Tailored Quotas</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Specific loan policies customized for Undergraduate Students (3 books / 14 days) and Faculty Members (10 books / 30 days).
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-gray-900">Transparent Fines</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Automated low-cost daily fine calculations with clear itemized tracking and cashier waiver options for academic fairness.
          </p>
        </Card>
      </div>

      {/* Library Policy Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-heading font-bold text-gray-900">Library Policy & Borrowing Regulations</h2>
          <p className="text-sm text-gray-500 mt-1">Official guidelines governing circulation services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-600" /> Student Privileges
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Maximum Active Borrowed Books:</span>
                <span className="font-semibold text-gray-900">3 Books</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Standard Borrow Duration:</span>
                <span className="font-semibold text-gray-900">14 Days</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Maximum Allowed Renewals:</span>
                <span className="font-semibold text-gray-900">2 Times</span>
              </li>
              <li className="flex justify-between">
                <span>Overdue Daily Fine Rate:</span>
                <span className="font-semibold text-gray-900">₹5.00 / day</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Faculty Privileges
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Maximum Active Borrowed Books:</span>
                <span className="font-semibold text-gray-900">10 Books</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Standard Borrow Duration:</span>
                <span className="font-semibold text-gray-900">30 Days</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Maximum Allowed Renewals:</span>
                <span className="font-semibold text-gray-900">3 Times</span>
              </li>
              <li className="flex justify-between">
                <span>Overdue Daily Fine Rate:</span>
                <span className="font-semibold text-gray-900">₹5.00 / day</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
