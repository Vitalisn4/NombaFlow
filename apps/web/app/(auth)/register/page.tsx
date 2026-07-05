'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error?.message || 'Registration failed. Please try again.');
        return;
      }
      router.push('/onboarding');
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e0] p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1a1a18]">Create your account</h1>
        <p className="text-sm text-[#888] mt-1">
          Start collecting recurring payments in minutes
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a18] mb-1.5">
            Business name
          </label>
          <input
            {...register('businessName')}
            type="text"
            placeholder="e.g. Greenfield Academy"
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
              errors.businessName
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : 'border-[#e5e5e0] focus:border-[#1a1a18]'
            }`}
          />
          {errors.businessName && (
            <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1a18] mb-1.5">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@business.com"
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
              errors.email
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : 'border-[#e5e5e0] focus:border-[#1a1a18]'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1a18] mb-1.5">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            placeholder="Minimum 8 characters"
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
              errors.password
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : 'border-[#e5e5e0] focus:border-[#1a1a18]'
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a1a18] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a2a28] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-[#888] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#2563eb] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
