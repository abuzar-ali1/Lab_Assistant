'use client';

import { useState } from 'react';
import { useAuth } from '@/Context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', username: '', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || 'Registration failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
            Join LabSaathi
          </h1>
          <p className="text-sm text-slate-500 mt-2">Start keeping track of your family's health parameters</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Username</label>
            <input
              name="username"
              type="text"
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-slate-800"
              placeholder="johndoe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-slate-800"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-slate-800"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Confirm Password</label>
            <input
              name="password_confirm"
              type="password"
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-slate-800"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium py-3 rounded-xl hover:opacity-95 shadow-md shadow-teal-100 transition disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-teal-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}