'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type User } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Compass, TrendingUp, Users, Film, Play, Heart, Eye,
  UserPlus, Star, Crown, Sparkles, Radio
} from 'lucide-react';
import { LiveIndicator, LiveStreamCard } from './LiveIndicator';

interface ExploreUser {
  id: string;
  username: string;
  profilePic: string | null;
  bio: string | null;
  isCreator: boolean;
  role: string;
  _count?: { videos: number; reels: number };
}

interface ExploreVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  views: number;
  likes: number;
  user: { username: string; profilePic: string | null };
  createdAt: string;
}

export default function ExplorePage() {
  const { token, setCurrentView, setViewingUser } = useAppStore();
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [videos, setVideos] = useState<ExploreVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'users' | 'videos'>('trending');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, videosRes] = await Promise.all([
          fetch('/api/search?q=&type=users'),
          fetch('/api/videos?page=1&limit=12'),
        ]);
        const [usersData, videosData] = await Promise.all([
          usersRes.json(),
          videosRes.json(),
        ]);
        if (usersData.success && usersData.data) {
          setUsers(usersData.data.users || []);
        }
        if (videosData.success) {
          setVideos(videosData.data?.videos || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // Mock live streams
  const liveStreams = [
    { username: 'djmaria', title: '🎵 Live DJ Set - Chill Vibes', viewerCount: 1243 },
    { username: 'gamerguru', title: '🎮 Ranked Grind - Road to Champion', viewerCount: 892 },
    { username: 'chefkat', title: '🍳 Cooking Japanese Ramen Live', viewerCount: 567 },
  ];

  // Trending tags mock
  const trendingTags = [
    { tag: 'Music', count: '2.1K', icon: '🎵' },
    { tag: 'Gaming', count: '1.8K', icon: '🎮' },
    { tag: 'Tutorial', count: '956', icon: '📚' },
    { tag: 'Vlog', count: '743', icon: '📹' },
    { tag: 'Comedy', count: '621', icon: '😂' },
    { tag: 'Sports', count: '534', icon: '⚽' },
    { tag: 'Tech', count: '412', icon: '💻' },
    { tag: 'Art', count: '389', icon: '🎨' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl primex-gradient flex items-center justify-center">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-shimmer">Explore</h1>
          <p className="text-sm text-muted-foreground">Discover trending content and creators</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'trending', label: 'Trending', icon: TrendingUp },
          { key: 'users', label: 'Creators', icon: Users },
          { key: 'videos', label: 'Videos', icon: Film },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'primex-gradient text-white glow-effect'
                : 'glass-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trending Tab */}
      {activeTab === 'trending' && (
        <div className="space-y-6">
          {/* Live Now Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                <span className="text-shimmer">Live Now</span>
              </h2>
              <LiveIndicator size="sm" viewerCount={liveStreams.reduce((acc, s) => acc + s.viewerCount, 0)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveStreams.map((stream) => (
                <LiveStreamCard
                  key={stream.username}
                  username={stream.username}
                  title={stream.title}
                  viewerCount={stream.viewerCount}
                  onClick={() => {
                    /* Would open live stream */
                  }}
                />
              ))}
            </div>
          </div>

          <div className="divider-primex" />

          {/* Trending Tags */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primex" />
              Trending Tags
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trendingTags.map((t, idx) => (
                <div
                  key={t.tag}
                  className={`glass-card p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all group hover-scale hover-lift card-shine stagger-${Math.min(idx + 1, 8)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primex transition-colors">#{t.tag}</p>
                      <p className="text-xs text-muted-foreground">{t.count} videos</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Creators */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-shimmer">
              <Crown className="w-5 h-5 text-yellow-400" />
              Featured Creators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : users.length > 0 ? (
                users.slice(0, 6).map((u, idx) => (
                  <div
                    key={u.id}
                    className={`glass-card-premium p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer group hover-lift card-shine stagger-${Math.min(idx + 1, 8)}`}
                    onClick={() => {
                      setViewingUser(u.id, u.username);
                      setCurrentView('profile');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={u.profilePic || ''} />
                          <AvatarFallback className="bg-primex/20 text-primex font-bold">
                            {u.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {u.isCreator && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-background">
                            <Star className="w-2.5 h-2.5 text-black fill-black" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primex transition-colors truncate">
                          {u.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.bio || 'Creator on PrimeX'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="primex-gradient text-white rounded-lg gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card-premium p-8 rounded-xl text-center col-span-full card-shine hover-lift">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-7 h-7 text-yellow-400" />
                  </div>
                  <h3 className="font-medium mb-1">No Creators Yet</h3>
                  <p className="text-sm text-muted-foreground">Check back soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Videos */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-shimmer">
              <Sparkles className="w-5 h-5 text-primex" />
              Popular Videos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {videos.length > 0 ? videos.slice(0, 6).map((v, idx) => (
                <div
                  key={v.id}
                  className={`glass-card-premium rounded-xl overflow-hidden hover-lift card-shine cursor-pointer group stagger-${Math.min(idx + 1, 8)}`}
                  onClick={() => {
                    useAppStore.setState({ currentVideoId: v.id });
                    setCurrentView('video');
                  }}
                >
                  <div className="aspect-video bg-muted relative">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/10 to-primex/5">
                        <Play className="w-8 h-8 text-primex/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-10 h-10 rounded-full primex-gradient flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium line-clamp-1">{v.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[8px] bg-primex/20 text-primex">
                          {v.user?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{v.user?.username || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {formatCount(v.views)}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="glass-card-premium p-8 rounded-xl text-center col-span-full card-shine hover-lift">
                  <div className="w-16 h-16 rounded-2xl bg-primex/10 flex items-center justify-center mx-auto mb-3">
                    <Play className="w-7 h-7 text-primex" />
                  </div>
                  <h3 className="font-medium mb-1">No Videos Yet</h3>
                  <p className="text-sm text-muted-foreground">Be the first to upload!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-4 rounded-xl flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))
          ) : users.length > 0 ? (
            users.map((u, idx) => (
              <div key={u.id} className={`glass-card-premium p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer hover-lift card-shine stagger-${Math.min(idx + 1, 8)}`}
                onClick={() => {
                  setViewingUser(u.id, u.username);
                  setCurrentView('profile');
                }}
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={u.profilePic || ''} />
                    <AvatarFallback className="bg-primex/20 text-primex text-lg font-bold">
                      {u.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {u.isCreator && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-background">
                      <Crown className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{u.username}</p>
                    {u.role === 'admin' && (
                      <Badge className="bg-primex/20 text-primex text-[10px]">Admin</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{u.bio || 'Creator on PrimeX'}</p>
                </div>
                <Button
                  size="sm"
                  className="btn-primex rounded-xl gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <UserPlus className="w-4 h-4" /> Add Friend
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl glass-card-premium flex items-center justify-center mx-auto mb-3 hover-lift">
                <Crown className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="font-medium mb-1">No Creators Found</h3>
              <p className="text-sm text-muted-foreground">Check back soon for new creators!</p>
            </div>
          )}
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {videos.length > 0 ? videos.map((v) => (
            <div
              key={v.id}
              className="glass-card rounded-xl overflow-hidden video-card-hover cursor-pointer group"
              onClick={() => {
                useAppStore.setState({ currentVideoId: v.id });
                setCurrentView('video');
              }}
            >
              <div className="aspect-video bg-muted relative">
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/10 to-primex/5">
                    <Play className="w-10 h-10 text-primex/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs">
                    <Eye className="w-3 h-3" /> {formatCount(v.views)}
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs">
                    <Heart className="w-3 h-3" /> {formatCount(v.likes)}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium line-clamp-2">{v.title}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-[8px] bg-primex/20 text-primex">
                      {v.user?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{v.user?.username || 'Unknown'}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="glass-card-premium p-8 rounded-xl text-center col-span-full card-shine hover-lift">
              <div className="w-16 h-16 rounded-2xl bg-primex/10 flex items-center justify-center mx-auto mb-3">
                <Play className="w-7 h-7 text-primex" />
              </div>
              <h3 className="font-medium mb-1">No Videos Yet</h3>
              <p className="text-sm text-muted-foreground">Be the first to upload!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
