'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type User } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Edit3, Film, Play, Lock, Users, Heart, Eye, Save, X } from 'lucide-react';

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
  isFriend: string | null; // null = own profile, 'none' | 'pending' | 'accepted'
}

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string | null;
  views: number;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, token, setCurrentView } = useAppStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reels, setReels] = useState<any[]>([]);
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
        if (data.success) {
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <Skeleton className="h-32 w-full rounded-2xl mb-4" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover */}
      <div className="h-32 sm:h-44 bg-gradient-to-r from-primex/20 via-primex/10 to-primex/20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50" />
      </div>

      {/* Profile Info */}
      <div className="px-4 lg:px-6 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={profile.profilePic || ''} />
              <AvatarFallback className="bg-primex/20 text-primex text-2xl font-bold">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {profile.isFriend === null && (
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full primex-gradient flex items-center justify-center border-2 border-background">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{profile.username}</h1>
              {profile.isCreator && (
                <Badge className="bg-primex/20 text-primex text-xs">Creator</Badge>
              )}
              {profile.role === 'admin' && (
                <Badge className="bg-primex/20 text-primex text-xs">Admin</Badge>
              )}
            </div>
            {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
          </div>

          <div className="flex gap-2">
            {profile.isFriend === null ? (
              <Button
                onClick={() => setEditing(!editing)}
                variant="outline"
                className="gap-2 rounded-xl glass-card border-border/50"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Button>
            ) : profile.isFriend === 'accepted' ? (
              <Badge className="bg-green-500/20 text-green-400 px-4 py-1.5">Friends</Badge>
            ) : profile.isFriend === 'pending' ? (
              <Badge className="bg-yellow-500/20 text-yellow-400 px-4 py-1.5">Pending</Badge>
            ) : (
              <Button className="primex-gradient text-white rounded-xl gap-2">
                <Users className="w-4 h-4" /> Add Friend
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          <div className="text-center">
            <p className="font-bold text-lg">{formatCount(profile.videoCount || 0)}</p>
            <p className="text-xs text-muted-foreground">Videos</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{formatCount(profile.reelCount || 0)}</p>
            <p className="text-xs text-muted-foreground">Reels</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{formatCount(profile.friendCount || 0)}</p>
            <p className="text-xs text-muted-foreground">Friends</p>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {editing && (
          <div className="glass-card p-4 rounded-xl mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Edit Profile</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Bio</label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="bg-muted/50 border-border/50 rounded-xl"
              />
            </div>
            <Button onClick={handleSaveProfile} className="primex-gradient text-white rounded-xl gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        )}

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
              {/* Placeholder for videos */}
              <div className="glass-card rounded-xl p-8 text-center">
                <Film className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No videos yet</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reels">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="glass-card rounded-xl p-8 text-center">
                <Play className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No reels yet</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="private">
            {profile.isFriend === null || profile.isFriend === 'accepted' ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No private content</p>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center blur-preview">
                <Lock className="w-8 h-8 text-primex mx-auto mb-2" />
                <p className="text-sm text-primex">Friends only content</p>
                <p className="text-xs text-muted-foreground mt-1">Send a friend request to unlock</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
