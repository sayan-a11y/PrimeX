'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Eye, Heart, Clock, TrendingUp, Film, Play } from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  avgWatchTime: number;
  videoCount: number;
  reelCount: number;
  engagementRate: number;
}

export default function AnalyticsPage() {
  const { user, token } = useAppStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    if (!token || !user) return;
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/analytics/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.data.analytics || data.data);
        }
      } catch {}
      setLoading(false);
    };
    fetchAnalytics();
  }, [token, user]);

  const statCards = [
    { icon: Eye, label: 'Total Views', value: analytics?.totalViews || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Heart, label: 'Total Likes', value: analytics?.totalLikes || 0, color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: Clock, label: 'Avg Watch Time', value: `${analytics?.avgWatchTime || 0}s`, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: TrendingUp, label: 'Engagement', value: `${analytics?.engagementRate || 0}%`, color: 'text-primex', bg: 'bg-primex/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold primex-gradient-text">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your content performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-4 rounded-xl">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Film className="w-5 h-5 text-primex" />
            <h3 className="font-medium">Video Content</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Videos</span>
              <span className="font-medium">{analytics?.videoCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Views</span>
              <span className="font-medium">{analytics?.totalViews || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Likes</span>
              <span className="font-medium">{analytics?.totalLikes || 0}</span>
            </div>
            {/* Simple bar visualization */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full primex-gradient rounded-full"
                style={{ width: `${Math.min((analytics?.totalViews || 0) / Math.max(analytics?.totalViews || 1, 1) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Play className="w-5 h-5 text-green-400" />
            <h3 className="font-medium">Reels Content</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Reels</span>
              <span className="font-medium">{analytics?.reelCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Watch Time</span>
              <span className="font-medium">{analytics?.avgWatchTime || 0}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
              <span className="font-medium">{analytics?.engagementRate || 0}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min((analytics?.engagementRate || 0), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Performance Trend</h3>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  period === p ? 'primex-gradient text-white' : 'text-muted-foreground glass-card'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48 flex items-end gap-1">
          {Array.from({ length: 12 }).map((_, i) => {
            const height = 20 + Math.random() * 80;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full primex-gradient rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">Past {period}</span>
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}
