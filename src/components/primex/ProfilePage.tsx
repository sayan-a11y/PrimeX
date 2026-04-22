'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type User } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Edit3, Film, Play, Lock, Users, Heart, Eye,
  Save, X, Star, Crown, Calendar, MapPin, LinkIcon,
  MessageCircle, BarChart3, Shield, Upload, Sparkles
} from 'lucide-react';

interface ProfileData {
  id: string;
  username: string;
  email: string;
  profilePic: string | null;
  bio: string | null;
  role: string;
  isCreator: boolean;
  createdAt: string;
  videoCount: number;
  reelCount: number;
  friendCount: number;
  isFriend: string | null;
}

export default function ProfilePage() {
  const { user, token, setCurrentView } = useAppStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    if (!user?.username || !token) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success || data.data) {
          const p = data.data;
          setProfile({ ...p, isFriend: null, email: user.email });
          setEditBio(p.bio || '');
        }
      } catch {}
      setLoading(false);
    };
    fetchProfile();
  }, [user, token]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: editBio }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => prev ? { ...prev, bio: editBio } : null);
        setEditing(false);
      }
    } catch {}
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const memberSince = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-40 w-full rounded-none shimmer" />
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-4 -mt-8">
            <div className="w-24 h-24 rounded-2xl shimmer skeleton-circle" />
            <div className="space-y-2">
              <div className="h-6 w-32 skeleton-pulse skeleton-line" />
              <div className="h-4 w-48 skeleton-pulse skeleton-line" />
            </div>
          </div>
          <div className="mt-6 glass-card-premium p-4 rounded-xl">
            <div className="flex items-center justify-around">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center flex-1">
                  <div className="w-5 h-5 mx-auto mb-1 skeleton-pulse skeleton-circle" />
                  <div className="h-6 w-12 mx-auto skeleton-pulse skeleton-line" />
                  <div className="h-3 w-16 mx-auto mt-1 skeleton-pulse skeleton-line" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-16 h-16 rounded-2xl glass-card-premium flex items-center justify-center mb-3 hover-lift">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Profile not found</p>
        <Button variant="outline" className="mt-4 rounded-xl btn-outline-primex" onClick={() => setCurrentView('home')}>
          Go Home
        </Button>
      </div>
    );
  }

  const stats = [
    { icon: Film, label: 'Videos', value: profile.videoCount || 0, color: 'text-primex' },
    { icon: Play, label: 'Reels', value: profile.reelCount || 0, color: 'text-green-400' },
    { icon: Users, label: 'Friends', value: profile.friendCount || 0, color: 'text-blue-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover with bg-mesh */}
      <div className="h-36 sm:h-48 relative overflow-hidden bg-mesh">
        <div className="absolute inset-0 bg-gradient-to-br from-primex/30 via-purple-900/20 to-primex/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primex/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        {/* Decorative orbs */}
        <div className="orb-primex-sm absolute top-4 right-16 float-slow" />
        <div className="orb-primex-sm absolute bottom-4 left-16 float-medium" />
      </div>

      {/* Profile Info */}
      <div className="px-4 lg:px-6 -mt-14 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-5">
          {/* Avatar with gradient-border-primex */}
          <div className="relative group gradient-border-primex rounded-2xl">
            <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
              <AvatarImage src={profile.profilePic || ''} />
              <AvatarFallback className="bg-primex/20 text-primex text-3xl font-bold">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {profile.isFriend === null && (
              <button className="absolute bottom-1 right-1 w-9 h-9 rounded-full primex-gradient flex items-center justify-center border-2 border-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active-press">
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
            {/* Online indicator */}
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-green-500 border-2 border-background badge-dot-pulse" />
          </div>

          {/* Info + Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-shimmer">{profile.username}</h1>
              {profile.isCreator && (
                <span className="tag-primex gap-1">
                  <Crown className="w-3 h-3" /> Creator
                </span>
              )}
              {profile.role === 'admin' && (
                <span className="tag-primex gap-1" style={{ color: 'var(--warning)', background: 'var(--warning-glow)', borderColor: 'var(--warning)' }}>
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-1 max-w-md">{profile.bio}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {memberSince(profile.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons with hover-lift */}
          <div className="flex gap-2 shrink-0">
            {profile.isFriend === null ? (
              <>
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="outline"
                  className="gap-2 rounded-xl glass-card border-border/50 hover:border-primex/30 hover-lift active-press"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl glass-card border-border/50 hover-lift active-press"
                  onClick={() => setCurrentView('analytics')}
                >
                  <BarChart3 className="w-4 h-4" /> Analytics
                </Button>
              </>
            ) : profile.isFriend === 'accepted' ? (
              <>
                <Badge className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm gap-1">
                  <Users className="w-4 h-4" /> Friends
                </Badge>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl glass-card border-border/50 hover-lift active-press"
                  onClick={() => setCurrentView('chat')}
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Button>
              </>
            ) : profile.isFriend === 'pending' ? (
              <Badge className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm">
                Request Pending
              </Badge>
            ) : (
              <Button className="btn-primex rounded-xl gap-2 hover-lift">
                <Users className="w-4 h-4" /> Add Friend
              </Button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="divider-primex my-4" />

        {/* Stats Bar with glass-card-premium */}
        <div className="glass-card-premium p-4 rounded-xl mb-5 flex items-center justify-around card-shine hover-lift">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center flex-1">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="font-bold text-xl count-up">{formatCount(stat.value)}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Edit Profile Section */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card-premium p-5 rounded-xl mb-5 space-y-4 gradient-border-primex"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primex" /> Edit Profile
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setEditing(false)} className="hover-lift">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Bio</label>
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  className="glass-input min-h-[100px] rounded-xl"
                />
              </div>
              <Button onClick={handleSaveProfile} className="btn-primex rounded-xl gap-2 hover-lift">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card w-full h-11 rounded-xl p-1 mb-4">
            <TabsTrigger value="videos" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white data-[state=active]:glow-effect gap-1.5">
              <Film className="w-4 h-4" /> Videos
            </TabsTrigger>
            <TabsTrigger value="reels" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white data-[state=active]:glow-effect gap-1.5">
              <Play className="w-4 h-4" /> Reels
            </TabsTrigger>
            <TabsTrigger value="private" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white data-[state=active]:glow-effect gap-1.5">
              <Lock className="w-4 h-4" /> Private
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="glass-card-premium rounded-xl p-8 text-center col-span-full card-shine hover-lift">
                <div className="w-16 h-16 rounded-2xl bg-primex/10 flex items-center justify-center mx-auto mb-3 breathe">
                  <Film className="w-7 h-7 text-primex" />
                </div>
                <p className="font-medium text-sm mb-1">No Videos Yet</p>
                <p className="text-xs text-muted-foreground mb-3">Upload your first video to get started!</p>
                <Button
                  className="btn-primex rounded-xl gap-2 hover-lift"
                  onClick={() => setCurrentView('upload')}
                >
                  <Upload className="w-4 h-4" /> Upload Video
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reels">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="glass-card-premium rounded-xl p-8 text-center col-span-full card-shine hover-lift">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3 breathe">
                  <Play className="w-7 h-7 text-green-400" />
                </div>
                <p className="font-medium text-sm mb-1">No Reels Yet</p>
                <p className="text-xs text-muted-foreground mb-3">Create your first reel!</p>
                <Button
                  className="btn-primex rounded-xl gap-2 hover-lift"
                  onClick={() => setCurrentView('upload')}
                >
                  <Upload className="w-4 h-4" /> Create Reel
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="private">
            {profile.isFriend === null || profile.isFriend === 'accepted' ? (
              <div className="glass-card-premium rounded-xl p-8 text-center card-shine hover-lift">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3 breathe">
                  <Lock className="w-7 h-7 text-red-400" />
                </div>
                <p className="font-medium text-sm mb-1">No Private Content</p>
                <p className="text-xs text-muted-foreground mb-3">Private content is visible only to your friends</p>
                <Button
                  className="btn-primex rounded-xl gap-2 hover-lift"
                  onClick={() => setCurrentView('upload')}
                >
                  <Upload className="w-4 h-4" /> Upload Private Content
                </Button>
              </div>
            ) : (
              <div className="glass-card-premium rounded-xl p-10 text-center blur-preview relative gradient-border-glow">
                <div className="absolute inset-0 bg-primex/5 rounded-xl" />
                <Lock className="w-10 h-10 text-primex mx-auto mb-3 relative z-10" />
                <p className="text-primex font-medium relative z-10">Friends Only</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3 relative z-10">
                  Send a friend request to unlock private content
                </p>
                <Button className="btn-primex rounded-xl gap-2 relative z-10 hover-lift">
                  <Users className="w-4 h-4" /> Add Friend
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
