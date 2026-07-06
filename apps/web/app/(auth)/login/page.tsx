'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error?.message || 'Invalid email or password');
        return;
      }
      router.push('/dashboard');
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a18] tracking-tight">
          Welcome back
        </h1>
        <p className="text-[#888] mt-2 text-sm">
          Sign in to your merchant account
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e5e0] shadow-sm overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#2563eb] to-[#1a1a18]" />

        <div className="p-8">
          {serverError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2.5">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1a1a18] mb-1.5">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@business.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                  errors.email
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-[#e5e5e0] bg-[#fafafa] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-50 focus:bg-white'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#1a1a18]">
                  Password
                </label>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                  errors.password
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-[#e5e5e0] bg-[#fafafa] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-50 focus:bg-white'
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a18] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2a2a28] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#f0f0ec] text-center">
            <p className="text-sm text-[#888]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#2563eb] hover:underline font-medium">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-1.5 text-xs text-[#aaa]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          256-bit encryption
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#aaa]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Powered by Nomba
        </div>
      </div>
    </div>
  );
}
