'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Film, Play, Lock, Flag, Ban, Trash2,
  Search, BarChart3, AlertTriangle, Eye, CheckCircle, XCircle,
  Activity, TrendingUp, ChevronDown, ChevronUp, FilmIcon, Server, HardDrive, Wifi
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalVideos: number;
  totalReels: number;
  totalReports: number;
  bannedUsers: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  isBanned: boolean;
  role: string;
  isCreator: boolean;
  createdAt: string;
  profilePic?: string | null;
}

interface AdminReport {
  id: string;
  reason: string;
  status: string;
  severity: string;
  createdAt: string;
  reporter: { username: string };
  reportedUser?: { username: string };
}

interface AdminContent {
  id: string;
  title: string;
  type: string;
  isPrivate: boolean;
  views: number;
  createdAt: string;
  user: { username: string };
}

// Mock sparkline data for 7 days
const sparklineData = [
  [30, 45, 25, 60, 40, 55, 70],
  [20, 35, 50, 30, 45, 60, 40],
  [15, 25, 40, 55, 35, 50, 65],
  [10, 20, 15, 25, 35, 20, 30],
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function AdminPanel() {
  const { user, token } = useAppStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [content, setContent] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    if (!token || user?.role !== 'admin') return;
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, reportsRes] = await Promise.all([
          fetch('/api/admin', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [statsData, usersData, reportsData] = await Promise.all([
          statsRes.json(), usersRes.json(), reportsRes.json(),
        ]);
        if (statsData.success) setStats(statsData.data.stats || statsData.data);
        if (usersData.success) setUsers(usersData.data.users || usersData.data || []);
        if (reportsData.success) setReports(reportsData.data.reports || reportsData.data || []);

        // Mock content data
        setContent([
          { id: '1', title: 'Getting Started with PrimeX', type: 'video', isPrivate: false, views: 12450, createdAt: new Date().toISOString(), user: { username: 'alexcreator' } },
          { id: '2', title: 'Music Mix 2024', type: 'video', isPrivate: false, views: 8300, createdAt: new Date().toISOString(), user: { username: 'sarahmusic' } },
          { id: '3', title: 'Exclusive Behind the Scenes', type: 'private', isPrivate: true, views: 2100, createdAt: new Date().toISOString(), user: { username: 'emmavlog' } },
          { id: '4', title: 'Gaming Highlights #5', type: 'video', isPrivate: false, views: 6700, createdAt: new Date().toISOString(), user: { username: 'mikegaming' } },
          { id: '5', title: 'Daily Workout Routine', type: 'reel', isPrivate: false, views: 15200, createdAt: new Date().toISOString(), user: { username: 'jamesfitness' } },
          { id: '6', title: 'Cooking Masterclass', type: 'video', isPrivate: true, views: 3400, createdAt: new Date().toISOString(), user: { username: 'oliviacook' } },
        ]);
      } catch {
        // Error fetching admin data
      }
      setLoading(false);
    };
    fetchData();
  }, [token, user]);

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, isBanned: !isBanned }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !isBanned } : u));
    } catch {
      // Error banning user
    }
  };

  const handleUpdateReport = async (reportId: string, status: string) => {
    try {
      await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId, status }),
      });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    } catch {
      // Error updating report
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await fetch(`/api/admin/content?id=${contentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setContent(prev => prev.filter(c => c.id !== contentId));
    } catch {
      // Error deleting content
    }
  };

  const getSeverityTag = (severity: string) => {
    switch (severity) {
      case 'high': return 'tag-danger';
      case 'medium': return 'tag-warning';
      case 'low': return 'tag-info';
      default: return 'tag-info';
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter || (roleFilter === 'creator' && u.isCreator);
    return matchesSearch && matchesRole;
  });

  const activeUsers = Math.floor((stats?.totalUsers || 0) * 0.65);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Shield className="w-12 h-12 text-destructive mb-3 breathe" />
        <h2 className="text-xl font-bold mb-1">Access Denied</h2>
        <p className="text-muted-foreground text-sm">Admin access required</p>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-blue-400', sparkIdx: 0, accent: 'from-blue-500/20 to-blue-500/5' },
    { icon: Film, label: 'Total Videos', value: stats?.totalVideos || 0, color: 'text-primex', sparkIdx: 1, accent: 'from-primex/20 to-primex/5' },
    { icon: Play, label: 'Total Reels', value: stats?.totalReels || 0, color: 'text-green-400', sparkIdx: 2, accent: 'from-green-500/20 to-green-500/5' },
    { icon: Flag, label: 'Reports', value: stats?.totalReports || 0, color: 'text-yellow-400', sparkIdx: 3, accent: 'from-yellow-500/20 to-yellow-500/5' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 bg-mesh min-h-screen relative">
      {/* Decorative orbs */}
      <div className="orb-primex-sm absolute top-6 right-16 opacity-20 pointer-events-none" />
      <div className="orb-primex-sm absolute bottom-10 left-8 opacity-15 pointer-events-none" />
      <div className="orb-primex-sm absolute top-1/3 right-6 opacity-10 pointer-events-none float-slow" />

      {/* Header */}
      <div className="bg-mesh rounded-2xl p-4 mb-4 relative overflow-hidden">
        <div className="orb-primex-sm absolute top-2 right-8 opacity-30" />
        <div className="orb-primex-sm absolute bottom-0 left-4 opacity-20" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl primex-gradient flex items-center justify-center glow-effect">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-shimmer">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage your platform</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">{activeUsers} active</span>
            <span className="badge-pulse">{activeUsers}</span>
          </div>
        </div>
      </div>

      <div className="tab-bar-premium mb-4 relative z-10">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'users', label: 'Users', icon: Users },
          { key: 'reports', label: 'Reports', icon: Flag, badge: stats?.totalReports },
          { key: 'content', label: 'Content', icon: Film },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className="badge-pulse text-[10px] ml-1">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="relative z-10">
          {/* Loading state */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="stat-card-premium p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="skeleton-pulse w-9 h-9 rounded-lg" />
                    <div className="skeleton-pulse h-4 w-20 rounded" />
                  </div>
                  <div className="skeleton-pulse h-8 w-24 rounded mb-3" />
                  <div className="flex items-end gap-1 h-8">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div key={j} className="skeleton-pulse flex-1 rounded-t-sm" style={{ height: `${20 + Math.random() * 60}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
            >
              {statCards.map((stat) => (
                <motion.div key={stat.label} variants={staggerItem} className="stat-card-premium p-4 rounded-2xl">
                  <div className="stat-icon">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="stat-label">{stat.label}</span>
                  <p className="stat-value count-up">{stat.value.toLocaleString()}</p>
                  {/* Mini sparkline chart */}
                  <div className="flex items-end gap-1 mt-3 h-8">
                    {sparklineData[stat.sparkIdx].map((val, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${(val / 70) * 100}%`,
                          background: i === sparklineData[stat.sparkIdx].length - 1
                            ? 'linear-gradient(to top, oklch(0.75 0.18 330), oklch(0.75 0.18 330 / 40%))'
                            : 'rgba(255, 255, 255, 0.08)',
                          minHeight: '4px',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">+12%</span>
                    <span className="text-xs text-muted-foreground">vs last week</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="divider-primex mb-4" />

          {/* Activity overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="glass-card-premium p-4 rounded-2xl"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-shimmer">
                <Activity className="w-4 h-4 text-primex" /> Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'New user registered', time: '2 min ago', icon: Users, color: 'text-blue-400' },
                  { action: 'Video uploaded by sarahmusic', time: '15 min ago', icon: Film, color: 'text-primex' },
                  { action: 'Report submitted', time: '1 hour ago', icon: Flag, color: 'text-yellow-400' },
                  { action: 'New reel by mikegaming', time: '2 hours ago', icon: Play, color: 'text-green-400' },
                  { action: 'User banned: spam_account', time: '5 hours ago', icon: Ban, color: 'text-red-400' },
                ].map((item, i) => (
                  <motion.div key={i} variants={staggerItem} className="interactive-card p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{item.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="glass-card-premium p-4 rounded-2xl"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-shimmer">
                <Eye className="w-4 h-4 text-primex" /> Platform Health
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Server Uptime', value: 99.9, color: 'bg-green-400', icon: Server },
                  { label: 'API Response Time', value: 85, color: 'bg-primex', icon: Wifi },
                  { label: 'Storage Used', value: 62, color: 'bg-blue-400', icon: HardDrive },
                  { label: 'Active Streams', value: 34, color: 'bg-primex-secondary', icon: Play },
                ].map((item) => (
                  <motion.div key={item.label} variants={staggerItem}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </span>
                      <span className="text-sm font-medium primex-gradient-text count-up">{item.value}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${item.value}%` }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="pl-9 glass-input h-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'admin', 'creator', 'user'].map(role => (
                <Button
                  key={role}
                  size="sm"
                  variant={roleFilter === role ? 'default' : 'outline'}
                  className={`rounded-lg text-xs capitalize ${roleFilter === role ? 'btn-primex' : 'btn-outline-primex'}`}
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card-premium p-4 rounded-xl flex items-center gap-3">
                  <div className="skeleton-pulse w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton-pulse h-4 w-32 rounded" />
                    <div className="skeleton-pulse h-3 w-48 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {filteredUsers.map((u) => (
                <motion.div key={u.id} variants={staggerItem}>
                  <div
                    className="interactive-card p-3 rounded-xl cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10 gradient-border-primex">
                          {u.profilePic && <AvatarImage src={u.profilePic} />}
                          <AvatarFallback className="bg-primex/20 text-primex text-sm">
                            {u.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{u.username}</p>
                          {u.role === 'admin' && <span className="tag-primex text-[10px]">Admin</span>}
                          {u.isCreator && <span className="tag-primex text-[10px]">Creator</span>}
                          {u.role === 'user' && !u.isCreator && <span className="tag-success text-[10px]">Member</span>}
                          {u.isBanned && <span className="tag-danger text-[10px]">Banned</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className={`btn-sm ${u.isBanned ? 'btn-outline-primex text-green-400' : 'btn-outline-primex text-red-400'}`}
                          onClick={(e) => { e.stopPropagation(); handleBanUser(u.id, u.isBanned); }}
                        >
                          {u.isBanned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        {expandedUser === u.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedUser === u.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="glass-card-premium p-3 rounded-xl mt-1 ml-6 border-l-2 border-primex/30">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Joined</p>
                              <p className="text-sm font-medium">{new Date(u.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Role</p>
                              <p className="text-sm font-medium capitalize flex items-center justify-center gap-1">
                                {u.role}
                                {u.role === 'admin' && <span className="tag-primex text-[9px]">Privileged</span>}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <p className={`text-sm font-medium flex items-center justify-center gap-1 ${u.isBanned ? 'text-red-400' : 'text-green-400'}`}>
                                {u.isBanned ? 'Banned' : 'Active'}
                                {!u.isBanned && <span className="badge-pulse text-[8px]">Online</span>}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Creator</p>
                              <p className={`text-sm font-medium ${u.isCreator ? 'text-primex' : ''}`}>
                                {u.isCreator ? 'Yes' : 'No'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="relative z-10">
          {/* Loading state */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card-premium p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="skeleton-pulse w-8 h-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <div className="skeleton-pulse h-4 w-48 rounded" />
                      <div className="skeleton-pulse h-3 w-32 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl glass-card-premium flex items-center justify-center mx-auto mb-3 breathe">
                <Flag className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No reports</p>
              <p className="text-sm text-muted-foreground mt-1">All clear! No pending reports.</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  variants={staggerItem}
                  className="interactive-card p-3 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-sm">{report.reason}</span>
                        <span className={getSeverityTag(report.severity || 'low')}>
                          {report.severity || 'low'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Reported by {report.reporter?.username || 'Unknown'}
                        {report.reportedUser && ` \u2022 Target: ${report.reportedUser.username}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${
                        report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {report.status}
                      </Badge>
                      {report.status === 'pending' && (
                        <>
                          <button
                            className="btn-sm btn-primex"
                            onClick={() => handleUpdateReport(report.id, 'resolved')}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                          <button
                            className="btn-sm btn-outline-primex text-red-400"
                            onClick={() => handleUpdateReport(report.id, 'dismissed')}
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Content */}
      {activeTab === 'content' && (
        <div className="relative z-10">
          <div className="divider-primex mb-4" />

          {/* Loading state */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card-premium rounded-2xl overflow-hidden">
                  <div className="skeleton-pulse aspect-video" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton-pulse h-4 w-3/4 rounded" />
                    <div className="skeleton-pulse h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {content.map((item) => (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  className="interactive-card rounded-2xl overflow-hidden"
                >
                  {/* Thumbnail area */}
                  <div className="relative aspect-video bg-gradient-to-br from-primex/20 to-primex-secondary/20">
                    <div className="video-overlay-gradient" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {item.type === 'reel' ? (
                        <Play className="w-8 h-8 text-white/60" />
                      ) : (
                        <FilmIcon className="w-8 h-8 text-white/60" />
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {item.isPrivate && <span className="tag-warning text-[10px]"><Lock className="w-3 h-3" /> Private</span>}
                      <span className="tag-primex text-[10px]">{item.type}</span>
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-white/70" />
                      <span className="text-xs text-white/70 count-up">{item.views.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">by {item.user.username}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
