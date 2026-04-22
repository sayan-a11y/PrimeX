'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type User } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Edit3, Film, Play, Lock, Users, Heart, Eye,
  Save, X, Star, Crown, Calendar, MapPin, LinkIcon,
  MessageCircle, BarChart3, Shield
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
        <Skeleton className="h-40 w-full rounded-none mb-4" />
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-4 -mt-8">
            <Skeleton className="w-24 h-24 rounded-2xl border-4 border-background" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-3">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Profile not found</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => setCurrentView('home')}>
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
      {/* Cover */}
      <div className="h-36 sm:h-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primex/30 via-purple-900/20 to-primex/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primex/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 lg:px-6 -mt-14 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-5">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
              <AvatarImage src={profile.profilePic || ''} />
              <AvatarFallback className="bg-primex/20 text-primex text-3xl font-bold">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {profile.isFriend === null && (
              <button className="absolute bottom-1 right-1 w-9 h-9 rounded-full primex-gradient flex items-center justify-center border-2 border-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
            {/* Online indicator */}
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
          </div>

          {/* Info + Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {profile.isCreator && (
                <Badge className="bg-yellow-400/20 text-yellow-400 text-xs gap-1 px-2 py-0.5">
                  <Crown className="w-3 h-3" /> Creator
                </Badge>
              )}
              {profile.role === 'admin' && (
                <Badge className="bg-primex/20 text-primex text-xs gap-1 px-2 py-0.5">
                  <Shield className="w-3 h-3" /> Admin
                </Badge>
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

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            {profile.isFriend === null ? (
              <>
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="outline"
                  className="gap-2 rounded-xl glass-card border-border/50 hover:border-primex/30"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl glass-card border-border/50"
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
                  className="gap-2 rounded-xl glass-card border-border/50"
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
              <Button className="primex-gradient text-white rounded-xl gap-2 shadow-lg glow-effect">
                <Users className="w-4 h-4" /> Add Friend
              </Button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="glass-card p-4 rounded-xl mb-5 flex items-center justify-around">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center flex-1">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="font-bold text-xl">{formatCount(stat.value)}</p>
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
              className="glass-card p-5 rounded-xl mb-5 space-y-4 glow-border"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primex" /> Edit Profile
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Bio</label>
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  className="bg-muted/50 border-border/50 rounded-xl min-h-[100px]"
                />
              </div>
              <Button onClick={handleSaveProfile} className="primex-gradient text-white rounded-xl gap-2 shadow-lg">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card w-full h-11 rounded-xl p-1 mb-4">
            <TabsTrigger value="videos" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
              <Film className="w-4 h-4" /> Videos
            </TabsTrigger>
            <TabsTrigger value="reels" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
              <Play className="w-4 h-4" /> Reels
            </TabsTrigger>
            <TabsTrigger value="private" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
              <Lock className="w-4 h-4" /> Private
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-8 text-center col-span-full">
                <div className="w-16 h-16 rounded-2xl bg-primex/10 flex items-center justify-center mx-auto mb-3">
                  <Film className="w-7 h-7 text-primex" />
                </div>
                <p className="font-medium text-sm mb-1">No Videos Yet</p>
                <p className="text-xs text-muted-foreground">Upload your first video to get started!</p>
                <Button
                  className="primex-gradient text-white rounded-xl gap-2 mt-3"
                  onClick={() => setCurrentView('upload')}
                >
                  <Film className="w-4 h-4" /> Upload Video
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reels">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="glass-card rounded-xl p-8 text-center col-span-full">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Play className="w-7 h-7 text-green-400" />
                </div>
                <p className="font-medium text-sm mb-1">No Reels Yet</p>
                <p className="text-xs text-muted-foreground">Create your first reel!</p>
                <Button
                  className="primex-gradient text-white rounded-xl gap-2 mt-3"
                  onClick={() => setCurrentView('upload')}
                >
                  <Play className="w-4 h-4" /> Create Reel
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="private">
            {profile.isFriend === null || profile.isFriend === 'accepted' ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7 text-red-400" />
                </div>
                <p className="font-medium text-sm mb-1">No Private Content</p>
                <p className="text-xs text-muted-foreground">Private content is visible only to your friends</p>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-10 text-center blur-preview relative">
                <div className="absolute inset-0 bg-primex/5 rounded-xl" />
                <Lock className="w-10 h-10 text-primex mx-auto mb-3 relative z-10" />
                <p className="text-primex font-medium relative z-10">Friends Only</p>
                <p className="text-xs text-muted-foreground mt-1 relative z-10">Send a friend request to unlock private content</p>
                <Button className="primex-gradient text-white rounded-xl gap-2 mt-3 relative z-10">
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
