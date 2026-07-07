'use client';

import { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InsightsWidget } from '../../components/insights-widget';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  danger?: boolean;
  loading?: boolean;
}

function StatCard({ title, value, subtitle, trend, trendUp, danger, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e5e5e0] p-5 animate-pulse">
        <div className="h-3 bg-[#f0f0ec] rounded w-24 mb-3" />
        <div className="h-7 bg-[#f0f0ec] rounded w-32 mb-2" />
        <div className="h-3 bg-[#f0f0ec] rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e0] p-5">
      <p className="text-xs font-semibold text-[#888] uppercase tracking-wide mb-2">{title}</p>
      <p className={`text-2xl font-bold mb-1 ${danger ? 'text-red-500' : 'text-[#1a1a18]'}`}>{value}</p>
      {trend && (
        <p className={`text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      )}
      {subtitle && <p className="text-xs text-[#888]">{subtitle}</p>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-8 h-8 bg-[#f0f0ec] rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-[#f0f0ec] rounded w-32 mb-1.5" />
        <div className="h-2.5 bg-[#f0f0ec] rounded w-20" />
      </div>
      <div className="h-3 bg-[#f0f0ec] rounded w-16" />
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAST_DUE: 'bg-amber-100 text-amber-700',
  DUNNING: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-gray-100 text-gray-600',
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSkipped(params.get('skipped') === 'true');
    setConnected(params.get('connected') === 'true');
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [ovRes, subRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/subscriptions?limit=10'),
      ]);
      if (ovRes.ok) setOverview(await ovRes.json());
      if (subRes.ok) {
        const data = await subRes.json();
        setActivity(data.subscriptions || []);
      }
    } catch {
      // silent fail — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatNaira = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₦${num.toLocaleString('en-NG')}`;
  };

  const chartData = forecast?.chartData?.map((d: any) => ({
    date: d.date,
    Expected: parseFloat(d.expected),
    Collected: d.collected ? parseFloat(d.collected) : null,
  })) || [];

  const hasNoData = !loading && !overview?.activeSubscribers;

  return (
    <div className="min-h-screen bg-[#f5f5f3]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-60 bg-[#1a1a18] flex flex-col z-40">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#1a1a18] font-bold text-xs">NF</span>
            </div>
            <span className="text-white font-semibold text-sm">NombaFlow</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: 'Dashboard', href: '/dashboard', active: true },
            { label: 'Plans', href: '/dashboard/plans' },
            { label: 'Subscriptions', href: '/dashboard/subscriptions' },
            { label: 'Ajo Groups', href: '/dashboard/ajo' },
            { label: 'Settings', href: '/dashboard/settings' },
          ].map((item) => (
            
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-white/40 text-xs">Support</p>
          <a href="/logout" className="text-white/60 text-xs hover:text-white mt-1 block">Sign out</a>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-60 p-8">
        {/* Banners */}
        {skipped && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Nomba account not connected</p>
              <p className="text-xs text-amber-700">Connect your credentials to start collecting payments.</p>
            </div>
            <a href="/onboarding" className="text-xs font-medium text-amber-800 underline">Connect now</a>
          </div>
        )}

        {connected && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-green-800">Nomba account connected successfully!</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a18]">Dashboard</h1>
            <p className="text-sm text-[#888] mt-0.5">Overview of your recurring revenue and subscription health</p>
          </div>
          
            href="/dashboard/plans/new"
            className="px-4 py-2.5 bg-[#1a1a18] text-white text-sm font-medium rounded-xl hover:bg-[#2a2a28] transition-colors"
          >
            + New Plan
          </a>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            title="MRR"
            value={overview ? formatNaira(overview.mrr) : '₦0'}
            trend={overview?.revenueThisMonth && overview?.revenueLastMonth
              ? `${Math.round(((parseFloat(overview.revenueThisMonth) - parseFloat(overview.revenueLastMonth)) / parseFloat(overview.revenueLastMonth)) * 100)}% vs last month`
              : undefined}
            trendUp={overview?.revenueThisMonth > overview?.revenueLastMonth}
            loading={loading}
          />
          <StatCard
            title="Active Subscribers"
            value={overview ? String(overview.activeSubscribers) : '0'}
            subtitle="Full-time active users"
            loading={loading}
          />
          <StatCard
            title="Failed Payments"
            value={overview ? formatNaira(overview.failedPaymentsAmount) : '₦0'}
            subtitle={overview ? `${overview.failedPaymentsCount} failed` : '0 failed'}
            danger={overview?.failedPaymentsCount > 0}
            loading={loading}
          />
          <StatCard
            title="Upcoming 7 Days"
            value={overview ? formatNaira(overview.upcomingCharges?.next7Days || 0) : '₦0'}
            subtitle="Expected revenue"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <div className="col-span-2 bg-white rounded-xl border border-[#e5e5e0] p-6">
            <h2 className="text-sm font-semibold text-[#1a1a18] mb-1">Revenue forecast — next 90 days</h2>
            <p className="text-xs text-[#888] mb-4">Predictive growth based on current churn and sign-ups</p>
            {loading ? (
              <div className="h-48 bg-[#f5f5f3] rounded-lg animate-pulse" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ec" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => formatNaira(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="Collected" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Expected" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#888] text-sm">
                No forecast data yet
              </div>
            )}
          </div>

          {/* AI Insights */}
          <InsightsWidget merchantId="me" context={overview || {}} />
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-[#e5e5e0] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a18]">Recent activity</h2>
              <p className="text-xs text-[#888]">Latest subscription lifecycle events</p>
            </div>
            <a href="/dashboard/subscriptions" className="text-xs text-[#2563eb] hover:underline">View all</a>
          </div>

          {loading ? (
            <div className="divide-y divide-[#f0f0ec]">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : hasNoData ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-[#f5f5f3] rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#1a1a18] mb-1">No subscriptions yet</p>
              <p className="text-xs text-[#888] mb-4">Create a plan and share the enrollment link to get started</p>
              <a href="/dashboard/plans/new" className="text-xs font-medium text-[#2563eb] hover:underline">Create your first plan →</a>
            </div>
          ) : (
            <div className="divide-y divide-[#f0f0ec]">
              {activity.map((sub: any) => (
                <div key={sub.id} className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 bg-[#f5f5f3] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[#555]">
                    {sub.customerName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a18] truncate">{sub.customerName}</p>
                    <p className="text-xs text-[#888]">{sub.planName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#1a1a18]">{formatNaira(sub.totalPaid || 0)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[sub.status] || 'bg-gray-100 text-gray-600'}`}>
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
