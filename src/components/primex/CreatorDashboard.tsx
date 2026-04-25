'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Eye, Heart, MessageCircle, Share2, Users, TrendingUp,
  Calendar, Clock, BarChart3, Play, Star, MapPin, Monitor,
  Smartphone, Globe, ChevronRight, Zap, Target, Award, Crown, Film,
  Search, Bell, Settings, PieChart
} from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────
const earningsData = {
  total: 12458.50,
  thisMonth: 3420.00,
  lastMonth: 2890.00,
  breakdown: { ads: 5240, tips: 3120, subscriptions: 4098.50 },
  monthly: [
    { month: 'Jul', amount: 1850 },
    { month: 'Aug', amount: 2200 },
    { month: 'Sep', amount: 1950 },
    { month: 'Oct', amount: 2800 },
    { month: 'Nov', amount: 2890 },
    { month: 'Dec', amount: 3420 },
  ],
  payouts: [
    { id: '1', date: '2024-12-01', amount: 2890.00, status: 'completed', method: 'Bank Transfer' },
    { id: '2', date: '2024-11-01', amount: 2450.00, status: 'completed', method: 'Bank Transfer' },
    { id: '3', date: '2024-10-01', amount: 2100.00, status: 'completed', method: 'PayPal' },
    { id: '4', date: '2024-09-01', amount: 1950.00, status: 'completed', method: 'PayPal' },
  ],
};

const topVideos = [
  { id: '1', title: 'Ultimate Gaming Setup Tour', views: 45200, likes: 3200, comments: 456, shares: 234, engagement: 8.6, thumbnail: null },
  { id: '2', title: '10 Tips for Better Streams', views: 38700, likes: 2800, comments: 312, shares: 189, engagement: 7.9, thumbnail: null },
  { id: '3', title: 'React vs Vue in 2024', views: 31400, likes: 2100, comments: 523, shares: 345, engagement: 9.2, thumbnail: null },
  { id: '4', title: 'My Creative Process Revealed', views: 24800, likes: 1900, comments: 278, shares: 156, engagement: 8.1, thumbnail: null },
];

const audienceData = {
  ageGroups: [
    { range: '18-24', pct: 35 },
    { range: '25-34', pct: 30 },
    { range: '35-44', pct: 20 },
    { range: '45-54', pct: 10 },
    { range: '55+', pct: 5 },
  ],
  locations: [
    { country: 'United States', pct: 42, flag: '\u{1F1FA}\u{1F1F8}' },
    { country: 'United Kingdom', pct: 18, flag: '\u{1F1EC}\u{1F1E7}' },
    { country: 'Germany', pct: 12, flag: '\u{1F1E9}\u{1F1EA}' },
    { country: 'Canada', pct: 10, flag: '\u{1F1E8}\u{1F1E6}' },
    { country: 'Australia', pct: 8, flag: '\u{1F1E6}\u{1F1FA}' },
  ],
  devices: [
    { type: 'Mobile', pct: 62, icon: Smartphone },
    { type: 'Desktop', pct: 28, icon: Monitor },
    { type: 'Tablet', pct: 10, icon: Monitor },
  ],
  followerGrowth: [
    { period: 'This Week', gained: 245 },
    { period: 'Last Week', gained: 189 },
    { period: 'This Month', gained: 890 },
    { period: 'Last Month', gained: 720 },
  ],
  activeFollowers: 8420,
  totalFollowers: 28500,
  topFans: [
    { username: 'superfan_jenny', contributions: 450, avatar: null },
    { username: 'dev_marcus', contributions: 380, avatar: null },
    { username: 'stream_queen', contributions: 320, avatar: null },
    { username: 'tech_guru42', contributions: 290, avatar: null },
    { username: 'creative_soul', contributions: 240, avatar: null },
  ],
};

const scheduleData = {
  calendar: {
    year: 2025, month: 1,
    days: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      hasContent: [3, 6, 8, 12, 15, 18, 22, 25, 28].includes(i + 1),
      isToday: i + 1 === 3,
    })),
    firstDayOffset: 2, // Wednesday
  },
  queue: [
    { id: '1', title: 'Weekly Q&A Stream', scheduledFor: '2025-01-06 18:00', type: 'live' },
    { id: '2', title: 'React 19 Deep Dive', scheduledFor: '2025-01-08 15:00', type: 'video' },
    { id: '3', title: 'Behind the Scenes Reel', scheduledFor: '2025-01-12 12:00', type: 'reel' },
    { id: '4', title: 'Community Game Night', scheduledFor: '2025-01-15 20:00', type: 'live' },
  ],
  bestTimes: [
    ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    ['6am', 0.2, 0.1, 0.1, 0.2, 0.1, 0.3, 0.4],
    ['9am', 0.4, 0.3, 0.3, 0.4, 0.3, 0.5, 0.6],
    ['12pm', 0.6, 0.5, 0.5, 0.6, 0.5, 0.7, 0.8],
    ['3pm', 0.7, 0.8, 0.7, 0.8, 0.6, 0.5, 0.4],
    ['6pm', 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
    ['9pm', 1.0, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6],
  ],
};

// ── Donut Chart CSS Component ──────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  // Pre-compute offsets to avoid reassignment during render
  const offsets = segments.reduce<number[]>((acc, seg, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    acc.push(prev + (seg.value / total) * 100);
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const percent = (seg.value / total) * 100;
            const dashArray = `${percent} ${100 - percent}`;
            const dashOffset = -(offsets[i] - percent);
            return (
              <circle
                key={i}
                cx="18" cy="18" r="14"
                fill="none"
                stroke={seg.color}
                strokeWidth="4"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold primex-gradient-text count-up">${(total / 1000).toFixed(1)}k</span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-sm text-muted-foreground">{seg.label}</span>
            <span className="text-sm font-medium ml-auto count-up">${seg.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Heat Map Component ─────────────────────────────────────
function HeatMap({ data }: { data: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto premium-scrollbar">
      <table className="w-full text-xs">
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                const isHeader = ri === 0 || ci === 0;
                const opacity = typeof cell === 'number' ? cell : 0;
                return (
                  <td key={ci} className="p-1 text-center">
                    {isHeader ? (
                      <span className="text-muted-foreground font-medium">{cell}</span>
                    ) : (
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-white/80 font-medium transition-all hover:scale-110"
                        style={{
                          backgroundColor: `oklch(0.75 0.18 330 / ${Math.max(opacity * 0.8, 0.05)})`,
                        }}
                      >
                        {typeof cell === 'number' && cell >= 0.8 && (
                          <Zap className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function CreatorDashboard() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-2 lg:px-6 lg:pt-4 lg:pb-4 bg-mesh relative">
      {/* Header */}
      <div className="relative z-10 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl primex-gradient flex items-center justify-center glow-effect">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-shimmer">Creator Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.username || 'Creator'}!
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="featured-badge">Pro Creator</span>
          </div>
        </div>
      </div>

      <div className="divider-primex mb-6" />

      {/* Tab Navigation - tab-bar-premium */}
      <div className="tab-bar-premium mb-6 relative z-10">
        {[
          { key: 'overview', label: 'Overview', icon: DollarSign },
          { key: 'content', label: 'Content', icon: Play },
          { key: 'audience', label: 'Audience', icon: Users },
          { key: 'schedule', label: 'Schedule', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────── */}
      {activeTab === 'overview' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6 relative z-10">
          {/* Earnings Cards - using stat-card-premium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={staggerItem} className="stat-card-premium p-6 rounded-2xl">
              <div className="stat-icon">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <span className="stat-label">Total Earnings</span>
              <p className="stat-value count-up">${earningsData.total.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">+18.3%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="stat-card-premium p-6 rounded-2xl">
              <div className="stat-icon">
                <BarChart3 className="w-5 h-5 text-primex" />
              </div>
              <span className="stat-label">This Month</span>
              <p className="stat-value count-up">${earningsData.thisMonth.toLocaleString()}</p>
              <div className="progress-bar mt-3">
                <div className="progress-bar-fill" style={{ width: '78%' }} />
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">78% of monthly goal</span>
            </motion.div>

            <motion.div variants={staggerItem} className="stat-card-premium p-6 rounded-2xl">
              <div className="stat-icon">
                <TrendingUp className="w-5 h-5 text-primex-secondary" />
              </div>
              <span className="stat-label">Growth Rate</span>
              <p className="stat-value count-up">
                +{((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth * 100).toFixed(1)}%
              </p>
              <span className="text-xs text-muted-foreground mt-1 block">Month over month</span>
            </motion.div>
          </div>

          <div className="divider-primex" />

          {/* Earnings Breakdown */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl gradient-border-primex">
            <h3 className="font-semibold mb-4 text-shimmer">Earnings Breakdown</h3>
            <DonutChart segments={[
              { value: earningsData.breakdown.ads, color: 'oklch(0.75 0.18 330)', label: 'Ads Revenue' },
              { value: earningsData.breakdown.tips, color: 'oklch(0.7 0.2 280)', label: 'Tips' },
              { value: earningsData.breakdown.subscriptions, color: 'oklch(0.65 0.18 200)', label: 'Subscriptions' },
            ]} />
          </motion.div>

          {/* Monthly Trend */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl gradient-border-primex">
            <h3 className="font-semibold mb-4 text-shimmer">Monthly Earnings Trend</h3>
            <div className="flex items-end gap-3 h-40">
              {earningsData.monthly.map((m, i) => {
                const maxAmount = Math.max(...earningsData.monthly.map(x => x.amount));
                const heightPct = (m.amount / maxAmount) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground count-up">${(m.amount / 1000).toFixed(1)}k</span>
                    <div className="w-full relative group">
                      <div
                        className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                        style={{
                          height: `${heightPct * 1.2}px`,
                          background: i === earningsData.monthly.length - 1
                            ? 'linear-gradient(to top, oklch(0.75 0.18 330), oklch(0.75 0.18 330 / 40%))'
                            : 'rgba(255, 255, 255, 0.08)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Payout History */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-shimmer">Payout History</h3>
            <div className="space-y-2">
              {earningsData.payouts.map((p) => (
                <div key={p.id} className="interactive-card p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium count-up">${p.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{p.method} \u2022 {new Date(p.date).toLocaleDateString()}</p>
                    </div>
                    <Badge className="tag-success text-xs">{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── CONTENT TAB ───────────────────────────────────── */}
      {activeTab === 'content' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6 relative z-10">
          {/* Search field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your content..."
              className="pl-9 glass-input h-10 rounded-xl"
            />
          </div>

          {/* Performance Metrics - stat-card-premium */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Eye, label: 'Total Views', value: '142.5K', color: 'text-primex' },
              { icon: Heart, label: 'Total Likes', value: '10.2K', color: 'text-red-400' },
              { icon: MessageCircle, label: 'Comments', value: '1.6K', color: 'text-blue-400' },
              { icon: Share2, label: 'Shares', value: '924', color: 'text-green-400' },
            ].map((m) => (
              <motion.div key={m.label} variants={staggerItem} className="stat-card-premium p-4 rounded-2xl text-center">
                <div className="stat-icon mx-auto mb-2">
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <p className="stat-value count-up">{m.value}</p>
                <p className="stat-label">{m.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="divider-primex" />

          {/* Top Performing Videos */}
          <motion.div variants={staggerItem}>
            <h3 className="font-semibold mb-4 text-shimmer">Top Performing Content</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topVideos.map((video, idx) => (
                <motion.div key={video.id} variants={staggerItem} className="interactive-card rounded-2xl overflow-hidden gradient-border-primex">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primex/20 to-primex-secondary/10">
                    <div className="video-overlay-gradient" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="play-button-hover">
                        <Play className="w-6 h-6 text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="tag-primex text-[10px]">#{idx + 1}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-sm truncate mb-2">{video.title}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs count-up">{(video.views / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs count-up">{(video.likes / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs count-up">{video.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs count-up">{video.shares}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <Target className="w-3 h-3 text-primex" />
                      <span className="text-xs text-primex font-medium">{video.engagement}% engagement</span>
                    </div>
                    {/* Engagement progress bar */}
                    <div className="progress-bar mt-2">
                      <div className="progress-bar-fill" style={{ width: `${video.engagement * 10}%` }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Engagement Rate Graph */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl gradient-border-primex">
            <h3 className="font-semibold mb-4 text-shimmer">Engagement Rate Trend</h3>
            <div className="flex items-end gap-1 h-32">
              {[6.2, 7.1, 5.8, 8.4, 7.9, 9.2, 8.6, 7.3, 8.8, 9.5, 8.1, 9.2, 8.6, 7.9].map((val, i) => {
                const maxVal = 10;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                      style={{
                        height: `${(val / maxVal) * 100}%`,
                        background: val >= 8.5
                          ? 'linear-gradient(to top, oklch(0.75 0.18 330), oklch(0.75 0.18 330 / 30%))'
                          : val >= 7
                            ? 'linear-gradient(to top, oklch(0.7 0.2 280), oklch(0.7 0.2 280 / 30%))'
                            : 'rgba(255, 255, 255, 0.08)',
                        minHeight: '4px',
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">2 weeks ago</span>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
          </motion.div>

          {/* Content Comparison */}
          <motion.div variants={staggerItem}>
            <h3 className="font-semibold mb-4 text-shimmer">Content Comparison</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: 'Videos', count: 48, views: '95.2K', color: 'from-primex/20 to-primex/5', tagClass: 'tag-primex' },
                { type: 'Reels', count: 124, views: '47.3K', color: 'from-primex-secondary/20 to-primex-secondary/5', tagClass: 'tag-primex' },
              ].map((c) => (
                <div key={c.type} className="interactive-card p-5 rounded-2xl gradient-border-primex">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                      {c.type === 'Videos' ? <Play className="w-5 h-5 text-primex" /> : <Zap className="w-5 h-5 text-primex-secondary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{c.type}</p>
                        <span className={c.tagClass + ' text-[10px]'}>{c.count} published</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold primex-gradient-text count-up">{c.views}</span>
                    <span className="text-xs text-muted-foreground">total views</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── AUDIENCE TAB ──────────────────────────────────── */}
      {activeTab === 'audience' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6 relative z-10">
          {/* Search field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search audience insights..."
              className="pl-9 glass-input h-10 rounded-xl"
            />
          </div>

          {/* Followers Stats - stat-card-premium */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div variants={staggerItem} className="stat-card-premium p-5 rounded-2xl">
              <div className="stat-icon">
                <Users className="w-5 h-5 text-primex" />
              </div>
              <span className="stat-label">Total Followers</span>
              <p className="stat-value count-up">{(audienceData.totalFollowers / 1000).toFixed(1)}K</p>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card-premium p-5 rounded-2xl">
              <div className="stat-icon">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <span className="stat-label">Active Followers</span>
              <div className="flex items-center gap-2">
                <p className="stat-value count-up">{(audienceData.activeFollowers / 1000).toFixed(1)}K</p>
                <span className="badge-pulse text-[9px]">Live</span>
              </div>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card-premium p-5 rounded-2xl">
              <div className="stat-icon">
                <TrendingUp className="w-5 h-5 text-primex-secondary" />
              </div>
              <span className="stat-label">This Week</span>
              <p className="stat-value count-up">+{audienceData.followerGrowth[0].gained}</p>
            </motion.div>
            <motion.div variants={staggerItem} className="stat-card-premium p-5 rounded-2xl">
              <div className="stat-icon">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="stat-label">Creator Rank</span>
              <p className="stat-value count-up">Top 5%</p>
            </motion.div>
          </div>

          <div className="divider-primex" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Groups */}
            <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl gradient-border-primex">
              <h3 className="font-semibold mb-4 text-shimmer">Age Demographics</h3>
              <div className="space-y-3">
                {audienceData.ageGroups.map((ag) => (
                  <div key={ag.range}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{ag.range}</span>
                      <span className="text-sm font-medium primex-gradient-text count-up">{ag.pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${ag.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Locations */}
            <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl gradient-border-primex">
              <h3 className="font-semibold mb-4 text-shimmer">Top Locations</h3>
              <div className="space-y-3">
                {audienceData.locations.map((loc) => (
                  <div key={loc.country} className="flex items-center gap-3">
                    <span className="text-lg">{loc.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{loc.country}</span>
                        <span className="text-sm font-medium count-up">{loc.pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${loc.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Devices */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-shimmer">Device Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              {audienceData.devices.map((d) => (
                <div key={d.type} className="interactive-card p-4 rounded-xl text-center">
                  <d.icon className="w-6 h-6 text-primex mx-auto mb-2" />
                  <p className="text-lg font-bold primex-gradient-text count-up">{d.pct}%</p>
                  <p className="text-xs text-muted-foreground">{d.type}</p>
                  <div className="progress-bar mt-2">
                    <div className="progress-bar-fill" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Follower Growth */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-shimmer">Follower Growth</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {audienceData.followerGrowth.map((fg, i) => (
                <div key={fg.period} className="interactive-card p-4 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">{fg.period}</p>
                  <p className="text-xl font-bold primex-gradient-text count-up">+{fg.gained}</p>
                  {i === 0 && (
                    <span className="tag-primex text-[10px] mt-1 inline-flex">Latest</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Fans */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-shimmer flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> Top Fans
              <span className="badge-pulse text-[10px] ml-1">{audienceData.topFans.length}</span>
            </h3>
            <div className="space-y-2">
              {audienceData.topFans.map((fan, i) => (
                <div key={fan.username} className="interactive-card p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 gradient-border-primex">
                        <AvatarFallback className="bg-primex/20 text-primex text-sm">
                          {fan.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {i < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-black">{i + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fan.username}</p>
                      <p className="text-xs text-muted-foreground">Top supporter</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium primex-gradient-text count-up">${fan.contributions}</p>
                      <p className="text-xs text-muted-foreground">contributed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── SCHEDULE TAB ──────────────────────────────────── */}
      {activeTab === 'schedule' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6 relative z-10">
          {/* Calendar with premium glass styling */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl gradient-border-primex">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-shimmer flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primex" />
                January 2025
              </h3>
              <div className="flex items-center gap-2">
                <span className="tag-primex text-[10px]">9 scheduled</span>
                <span className="badge-pulse text-[10px]">2</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
              ))}
              {/* Empty cells for offset */}
              {Array.from({ length: scheduleData.calendar.firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-lg" />
              ))}
              {scheduleData.calendar.days.map((day) => (
                <div
                  key={day.day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all cursor-pointer ${
                    day.isToday
                      ? 'primex-gradient text-white font-bold glow-effect'
                      : day.hasContent
                        ? 'bg-primex/10 text-primex hover:bg-primex/20 glass-card'
                        : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                >
                  <span>{day.day}</span>
                  {day.hasContent && !day.isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primex mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="divider-primex" />

          {/* Content Queue */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-shimmer flex items-center gap-2">
              <Clock className="w-5 h-5 text-primex" /> Content Queue
              <span className="badge-pulse text-[10px] ml-1">{scheduleData.queue.length}</span>
            </h3>
            <div className="space-y-3">
              {scheduleData.queue.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="interactive-card p-4 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.type === 'live' ? 'bg-red-500/10' :
                      item.type === 'video' ? 'bg-primex/10' : 'bg-primex-secondary/10'
                    }`}>
                      {item.type === 'live' ? <Zap className="w-5 h-5 text-red-400" /> :
                       item.type === 'video' ? <Play className="w-5 h-5 text-primex" /> :
                       <Film className="w-5 h-5 text-primex-secondary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.scheduledFor}</p>
                    </div>
                    <span className={`tag-${item.type === 'live' ? 'danger' : 'primex'} text-[10px] capitalize`}>
                      {item.type}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Best Posting Times Heat Map */}
          <motion.div variants={staggerItem} className="glass-card-premium p-6 rounded-2xl gradient-border-primex">
            <h3 className="font-semibold mb-4 text-shimmer flex items-center gap-2">
              <Globe className="w-5 h-5 text-primex" /> Best Posting Times
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Darker = better engagement. <Zap className="w-3 h-3 inline text-primex" /> = Peak time</p>
            <HeatMap data={scheduleData.bestTimes} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
