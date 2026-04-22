'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield, Users, Film, Play, Lock, Flag, Ban, Trash2,
  Search, BarChart3, AlertTriangle, Eye, CheckCircle, XCircle
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
  createdAt: string;
}

interface AdminReport {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { username: string };
  reportedUser?: { username: string };
}

export default function AdminPanel() {
  const { user, token } = useAppStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');

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
      } catch {}
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
    } catch {}
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
    } catch {}
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Shield className="w-12 h-12 text-destructive mb-3" />
        <h2 className="text-xl font-bold mb-1">Access Denied</h2>
        <p className="text-muted-foreground text-sm">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl primex-gradient flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold primex-gradient-text">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Manage your platform</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card w-full h-11 rounded-xl p-1 mb-6">
          <TabsTrigger value="overview" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
            <BarChart3 className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
            <Users className="w-4 h-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
            <Flag className="w-4 h-4" /> Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-blue-400' },
              { icon: Film, label: 'Total Videos', value: stats?.totalVideos || 0, color: 'text-primex' },
              { icon: Play, label: 'Total Reels', value: stats?.totalReels || 0, color: 'text-green-400' },
              { icon: Flag, label: 'Reports', value: stats?.totalReports || 0, color: 'text-yellow-400' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <div className="mb-4">
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="bg-muted/50 border-border/50 h-10 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            {users
              .filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
              .map((u) => (
              <div key={u.id} className="glass-card p-4 rounded-xl flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primex/20 text-primex text-sm">
                    {u.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{u.username}</p>
                    {u.role === 'admin' && <Badge className="bg-primex/20 text-primex text-[10px]">Admin</Badge>}
                    {u.isBanned && <Badge className="bg-destructive/20 text-destructive text-[10px]">Banned</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className={`rounded-lg gap-1.5 ${u.isBanned ? 'text-green-400 border-green-400/30' : 'text-destructive border-destructive/30'}`}
                  onClick={() => handleBanUser(u.id, u.isBanned)}
                >
                  {u.isBanned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                  {u.isBanned ? 'Unban' : 'Ban'}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <div className="space-y-2">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <Flag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No reports</p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="glass-card p-4 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-sm">{report.reason}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Reported by {report.reporter?.username || 'Unknown'}
                        {report.reportedUser && ` • Target: ${report.reportedUser.username}`}
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-green-400 border-green-400/30 text-xs"
                            onClick={() => handleUpdateReport(report.id, 'resolved')}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-destructive border-destructive/30 text-xs"
                            onClick={() => handleUpdateReport(report.id, 'dismissed')}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
