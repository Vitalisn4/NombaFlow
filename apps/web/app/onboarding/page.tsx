'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const onboardingSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  accountId: z.string().min(1, 'Account ID is required'),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If merchant already connected, redirect to dashboard
    fetch('/api/merchants/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.nombaConnected) {
          router.replace('/dashboard');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: OnboardingForm) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/merchants/me/nomba-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(
          result.error?.message || 'Invalid credentials. Please check and try again.'
        );
        return;
      }
      router.push('/dashboard?connected=true');
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard?skipped=true');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1a1a18] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#1a1a18] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NF</span>
            </div>
            <span className="text-xl font-semibold text-[#1a1a18]">NombaFlow</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#1a1a18] text-white text-xs flex items-center justify-center font-medium">✓</div>
              <span className="text-xs text-[#888]">Account</span>
            </div>
            <div className="w-8 h-px bg-[#e5e5e0]" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white text-xs flex items-center justify-center font-medium">2</div>
              <span className="text-xs text-[#2563eb] font-medium">Connect Nomba</span>
            </div>
            <div className="w-8 h-px bg-[#e5e5e0]" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#e5e5e0] text-[#888] text-xs flex items-center justify-center font-medium">3</div>
              <span className="text-xs text-[#888]">Dashboard</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1a1a18]">Connect your Nomba account</h1>
          <p className="text-sm text-[#888] mt-1">
            Enter your Nomba API credentials to start collecting payments
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e5e0] shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#2563eb] to-[#1a1a18]" />

          <div className="p-8">
            {/* Info box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-blue-800 mb-0.5">Where to find these</p>
                <p className="text-xs text-blue-700">
                  Log into your Nomba dashboard → Settings → Developer → API Keys
                </p>
              </div>
            </div>

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
                  Client ID
                </label>
                <input
                  {...register('clientId')}
                  type="text"
                  placeholder="Your Nomba Client ID"
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-mono ${
                    errors.clientId
                      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-[#e5e5e0] bg-[#fafafa] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-50 focus:bg-white'
                  }`}
                />
                {errors.clientId && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.clientId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a18] mb-1.5">
                  Client Secret
                </label>
                <input
                  {...register('clientSecret')}
                  type="password"
                  placeholder="Your Nomba Client Secret"
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-mono ${
                    errors.clientSecret
                      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-[#e5e5e0] bg-[#fafafa] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-50 focus:bg-white'
                  }`}
                />
                {errors.clientSecret && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.clientSecret.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a18] mb-1.5">
                  Account ID
                </label>
                <input
                  {...register('accountId')}
                  type="text"
                  placeholder="Your Nomba Account ID"
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-mono ${
                    errors.accountId
                      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-[#e5e5e0] bg-[#fafafa] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-50 focus:bg-white'
                  }`}
                />
                {errors.accountId && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.accountId.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1a18] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2a2a28] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Validating credentials...
                  </span>
                ) : (
                  'Connect Nomba account →'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-[#888] hover:text-[#555] transition-colors"
              >
                Skip for now →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-[#aaa]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Credentials encrypted at rest
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#aaa]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Nomba sandbox safe
          </div>
        </div>
      </div>
    </div>
  );
}
