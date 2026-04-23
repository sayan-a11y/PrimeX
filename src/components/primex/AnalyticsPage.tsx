'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import { BarChart3, Eye, Heart, Clock, TrendingUp, Film, Play, Users, Zap, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  avgWatchTime: number;
  videoCount: number;
  reelCount: number;
  engagementRate: number;
}

/* ── Count-up animation hook ──────────────────────────── */
function useCountUp(target: number, duration: number = 1200) {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    const start = current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, current]);

  return current;
}

/* ── Stat card component with count-up ────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  bg,
  delay,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  bg: string;
  delay: number;
  trend?: 'up' | 'down';
}) {
  const animatedValue = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card-premium p-4 rounded-xl hover-lift card-shine"
    >
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold count-up primex-gradient-text">
          {animatedValue.toLocaleString()}{suffix || ''}
        </p>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-0.5 mb-1 ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend === 'up' ? '+12%' : '-3%'}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { user, token } = useAppStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    if (!token || !user) return;
    let cancelled = false;
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/analytics/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setAnalytics(data.data.analytics || data.data);
        }
      } catch {}
      if (!cancelled) setLoading(false);
    };
    fetchAnalytics();
    return () => { cancelled = true; };
  }, [token, user]);

  const statCards = [
    { icon: Eye, label: 'Total Views', value: analytics?.totalViews || 0, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 'up' as const },
    { icon: Heart, label: 'Total Likes', value: analytics?.totalLikes || 0, color: 'text-red-400', bg: 'bg-red-500/10', trend: 'up' as const },
    { icon: Clock, label: 'Avg Watch', value: analytics?.avgWatchTime || 0, suffix: 's', color: 'text-green-400', bg: 'bg-green-500/10', trend: 'up' as const },
    { icon: TrendingUp, label: 'Engagement', value: analytics?.engagementRate || 0, suffix: '%', color: 'text-primex', bg: 'bg-primex/10', trend: 'down' as const },
  ];

  // Chart bar data
  const chartBars = [35, 55, 42, 68, 78, 60, 85, 72, 90, 65, 80, 95];
  const chartBars30 = [20, 30, 25, 40, 35, 55, 50, 60, 45, 70, 65, 80];
  const chartBars90 = [15, 22, 18, 30, 28, 40, 35, 50, 42, 55, 48, 65];
  const bars = period === '7d' ? chartBars : period === '30d' ? chartBars30 : chartBars90;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="skeleton-pulse h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 rounded-xl">
              <div className="skeleton-pulse skeleton-circle w-10 h-10 mb-3" />
              <div className="skeleton-pulse h-7 w-20 mb-2" />
              <div className="skeleton-pulse h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="skeleton-pulse h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 bg-mesh min-h-screen relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb-primex top-10 -right-20 float-slow" />
      <div className="orb-primex-sm bottom-20 -left-16 float-medium" />
      <div className="orb-primex-sm top-1/3 right-10 opacity-30 float-slow" />
      <div className="orb-primex-sm top-0 left-1/4 opacity-20 float-medium" />
      <div className="orb-primex-sm bottom-0 right-1/4 opacity-20 float-slow" />

      {/* Header */}
      <div className="relative z-10 mb-6 page-header-premium">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-10 h-10 rounded-xl bg-primex/10 flex items-center justify-center"
            >
              <BarChart3 className="w-5 h-5 text-primex" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-shimmer">Analytics</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Track your content performance</p>
            </div>
          </div>
          {/* Period Selector */}
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(p => (
              <button
                key={p}
                className={period === p ? 'btn-primex btn-sm' : 'btn-outline-primex btn-sm'}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            suffix={stat.suffix}
            color={stat.color}
            bg={stat.bg}
            delay={i * 0.08}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="divider-primex mb-6 relative z-10" />

      {/* Content Summary */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Video Content Card */}
        <div className="glass-card-premium p-6 rounded-xl hover-lift card-shine gradient-border-primex">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primex/10 flex items-center justify-center">
              <Film className="w-5 h-5 text-primex" />
            </div>
            <h3 className="font-medium text-shimmer">Video Content</h3>
            <span className="tag-primex text-[10px] ml-auto">Videos</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Videos</span>
              <span className="font-medium count-up">{analytics?.videoCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Views</span>
              <span className="font-medium count-up">{analytics?.totalViews || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Likes</span>
              <span className="font-medium count-up">{analytics?.totalLikes || 0}</span>
            </div>
            <div className="progress-bar mt-2">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(((analytics?.totalViews || 0) / Math.max(analytics?.totalViews || 1, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reels Content Card */}
        <div className="glass-card-premium p-6 rounded-xl hover-lift card-shine gradient-border-primex">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-medium text-shimmer">Reels Content</h3>
            <span className="tag-success text-[10px] ml-auto">Reels</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Reels</span>
              <span className="font-medium count-up">{analytics?.reelCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Watch Time</span>
              <span className="font-medium count-up">{analytics?.avgWatchTime || 0}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
              <span className="font-medium count-up">{analytics?.engagementRate || 0}%</span>
            </div>
            <div className="progress-bar mt-2">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(analytics?.engagementRate || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="divider-primex mb-6 relative z-10" />

      {/* Performance Metrics */}
      <div className="relative z-10 glass-card-premium p-6 rounded-xl hover-lift card-shine gradient-border-primex mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primex-secondary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primex-secondary" />
          </div>
          <h3 className="font-medium text-shimmer">Performance Metrics</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Viewer Retention', value: 72, color: 'bg-primex' },
            { label: 'Click-Through Rate', value: 45, color: 'bg-primex-secondary' },
            { label: 'Share Rate', value: 28, color: 'bg-primex-tertiary' },
            { label: 'Comment Rate', value: 35, color: 'bg-success' },
          ].map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="text-sm font-medium primex-gradient-text">{metric.value}%</span>
              </div>
              <div className="progress-bar h-2">
                <div
                  className={`progress-bar-fill ${metric.color}`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 glass-card-premium p-6 rounded-xl card-shine gradient-border-primex">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-info" />
          </div>
          <h3 className="font-medium text-shimmer">Performance Trend</h3>
          <span className="tag-info text-[10px] ml-auto">Past {period}</span>
        </div>
        <div className="h-48 flex items-end gap-1.5">
          {bars.map((height, i) => (
            <motion.div
              key={`${period}-${i}`}
              className="flex-1 flex flex-col items-center gap-1"
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <div
                className="w-full primex-gradient rounded-t opacity-80 hover:opacity-100 transition-all cursor-pointer hover-lift"
                style={{ height: `${height}%` }}
              />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">Start of period</span>
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}
