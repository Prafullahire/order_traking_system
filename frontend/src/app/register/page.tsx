'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../lib/types';
import { Package, Lock, Mail, User, ArrowRight, Loader2, ShieldCheck, Boxes } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        role,
      });

      success(`Account created successfully! Welcome, ${user.name}`);
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      const strMsg = Array.isArray(msg) ? msg.join(', ') : msg;
      setErrorMessage(strMsg);
      error(strMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left Side - Visuals / Branding */}
      <div className="md:w-[45%] bg-gradient-to-br from-brand-500 to-brand-700 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden min-h-[30vh] md:min-h-screen">
        {/* Abstract Background Patterns */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-900 opacity-20 blur-2xl mix-blend-overlay"></div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight">Order Tracking </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 py-12 md:py-0 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Start managing <br className="hidden md:block" /> with precision.
          </h1>
          <p className="text-brand-100 max-w-md text-sm md:text-base leading-relaxed">
            Join Order Tracking  to order items, track shipments in real time, and experience seamless inventory operations.
          </p>
        </div>

        <div className="relative z-10 text-xs font-medium text-brand-200 hidden md:block">
          © {new Date().getFullYear()} Order Tracking  Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="md:w-[55%] flex items-center justify-center p-6 md:p-12 lg:p-24 bg-white dark:bg-slate-950 relative z-20 shadow-2xl md:shadow-none rounded-t-3xl md:rounded-none -mt-8 md:mt-0">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create an Account
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Join the platform and start ordering today
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-600 font-medium flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password (min 6 chars) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${role === 'CUSTOMER'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                >
                  <User className={`w-4 h-4 ${role === 'CUSTOMER' ? 'text-brand-600' : ''}`} />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${role === 'ADMIN'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${role === 'ADMIN' ? 'text-brand-600' : ''}`} />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-xl shadow-brand-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 font-medium pt-4">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-brand-600 hover:text-brand-700 transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
