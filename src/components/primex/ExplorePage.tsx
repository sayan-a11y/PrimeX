'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type User } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  Compass, TrendingUp, Users, Film, Play, Heart, Eye,
  UserPlus, Star, Crown, Sparkles, Radio, Search, Hash
} from 'lucide-react';

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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function ExplorePage() {
  const { token, setCurrentView, setViewingUser } = useAppStore();
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [videos, setVideos] = useState<ExploreVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'users' | 'videos'>('trending');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Trending tags
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
    <div className="max-w-5xl mx-auto p-4 bg-mesh min-h-screen relative">
      {/* Decorative orbs */}
      <div className="orb-primex-sm absolute top-4 right-12 opacity-20 pointer-events-none" />
      <div className="orb-primex-sm absolute bottom-20 left-6 opacity-15 pointer-events-none" />
      <div className="orb-primex-sm absolute top-1/2 right-4 opacity-10 pointer-events-none float-slow" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl primex-gradient flex items-center justify-center glow-effect">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-shimmer">Explore</h1>
          <p className="text-sm text-muted-foreground">Discover trending content and creators</p>
        </div>
        {/* Search bar */}
        <div className="ml-auto hidden sm:flex items-center relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, tags..."
            className="pl-9 glass-input h-9 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-bar-premium mb-4 relative z-10">
        {[
          { key: 'trending', label: 'Trending', icon: TrendingUp },
          { key: 'users', label: 'Creators', icon: Users },
          { key: 'videos', label: 'Videos', icon: Film },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trending Tab */}
      {activeTab === 'trending' && (
        <div className="space-y-4 relative z-10">
          {/* Live Now Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                <span className="text-shimmer">Live Now</span>
              </h2>
            </div>
            <div className="glass-card-premium p-4 rounded-xl text-center card-shine hover-lift">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-2 breathe">
                <Radio className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="font-medium mb-1">No one is live right now</h3>
              <p className="text-sm text-muted-foreground">Check back later for live streams!</p>
            </div>
          </div>

          <div className="divider-primex" />

          {/* Trending Tags */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-shimmer">
              <TrendingUp className="w-5 h-5 text-primex" />
              Trending Tags
            </h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {trendingTags.map((t) => (
                <motion.div
                  key={t.tag}
                  variants={staggerItem}
                  className="glass-card-premium p-3 rounded-xl cursor-pointer hover-lift card-shine group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primex transition-colors">#{t.tag}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="tag-primex text-[10px] mr-1">Trending</span>
                        {t.count} videos
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="divider-primex" />

          {/* Featured Creators */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-shimmer">
                <Crown className="w-5 h-5 text-yellow-400" />
                Featured Creators
              </h2>
              <span className="featured-badge">Featured</span>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card-premium p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="skeleton-pulse w-12 h-12 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <div className="skeleton-pulse h-4 w-24 rounded" />
                        <div className="skeleton-pulse h-3 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                ))
              ) : users.length > 0 ? (
                users.slice(0, 6).map((u) => (
                  <motion.div
                    key={u.id}
                    variants={staggerItem}
                    className="glass-card-premium p-3 rounded-xl hover-lift card-shine cursor-pointer group"
                    onClick={() => {
                      setViewingUser(u.id, u.username);
                      setCurrentView('profile');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12 gradient-border-primex">
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm group-hover:text-primex transition-colors truncate">
                            {u.username}
                          </p>
                          {u.isCreator && <span className="tag-primex text-[10px]">Creator</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.bio || 'Creator on PrimeX'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="btn-primex rounded-lg gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="glass-card-premium p-4 rounded-xl text-center col-span-full card-shine hover-lift">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-2 breathe">
                    <Crown className="w-7 h-7 text-yellow-400" />
                  </div>
                  <h3 className="font-medium mb-1">No Creators Yet</h3>
                  <p className="text-sm text-muted-foreground">Check back soon!</p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="divider-primex" />

          {/* Popular Videos */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-shimmer">
              <Sparkles className="w-5 h-5 text-primex" />
              Popular Videos
            </h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="content-grid"
            >
              {videos.length > 0 ? videos.slice(0, 6).map((v) => (
                <motion.div
                  key={v.id}
                  variants={staggerItem}
                  className="interactive-card rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => {
                    useAppStore.setState({ currentVideoId: v.id });
                    setCurrentView('video');
                  }}
                >
                  <div className="aspect-video bg-muted relative">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="shimmer w-full h-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-primex/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="play-button-hover">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="video-overlay-gradient" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                        <Eye className="w-3 h-3" /> <span className="count-up">{formatCount(v.views)}</span>
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                        <Heart className="w-3 h-3" /> <span className="count-up">{formatCount(v.likes)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium line-clamp-1">{v.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Avatar className="w-5 h-5 gradient-border-primex">
                        <AvatarFallback className="text-[8px] bg-primex/20 text-primex">
                          {v.user?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{v.user?.username || 'Unknown'}</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="glass-card-premium p-4 rounded-xl text-center col-span-full card-shine hover-lift">
                  <div className="w-16 h-16 rounded-2xl bg-primex/10 flex items-center justify-center mx-auto mb-2 breathe">
                    <Play className="w-7 h-7 text-primex" />
                  </div>
                  <h3 className="font-medium mb-1">No Videos Yet</h3>
                  <p className="text-sm text-muted-foreground">Be the first to upload!</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3 relative z-10">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              className="pl-9 glass-input h-10 rounded-xl"
            />
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card-premium p-3 rounded-xl flex items-center gap-3">
                <div className="skeleton-pulse w-14 h-14 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton-pulse h-4 w-32 rounded" />
                  <div className="skeleton-pulse h-3 w-48 rounded" />
                </div>
              </div>
            ))
          ) : users.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {users.map((u) => (
                <motion.div
                  key={u.id}
                  variants={staggerItem}
                  className="glass-card-premium p-3 rounded-xl flex items-center gap-3 hover-lift card-shine cursor-pointer group"
                  onClick={() => {
                    setViewingUser(u.id, u.username);
                    setCurrentView('profile');
                  }}
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14 gradient-border-primex">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold group-hover:text-primex transition-colors">{u.username}</p>
                      {u.role === 'admin' && <span className="tag-primex text-[10px]">Admin</span>}
                      {u.isCreator && <span className="featured-badge text-[9px]">Featured</span>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{u.bio || 'Creator on PrimeX'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {u.isCreator && <span className="tag-primex text-[10px]">Creator</span>}
                      {u._count && (
                        <span className="text-xs text-muted-foreground">
                          {u._count.videos} videos
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="btn-primex rounded-xl gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UserPlus className="w-4 h-4" /> Add Friend
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl glass-card-premium flex items-center justify-center mx-auto mb-2 breathe hover-lift">
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="content-grid relative z-10"
        >
          {videos.length > 0 ? videos.map((v) => (
            <motion.div
              key={v.id}
              variants={staggerItem}
              className="interactive-card rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => {
                useAppStore.setState({ currentVideoId: v.id });
                setCurrentView('video');
              }}
            >
              <div className="aspect-video bg-muted relative">
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="shimmer w-full h-full flex items-center justify-center">
                    <Play className="w-10 h-10 text-primex/30" />
                  </div>
                )}
                <div className="video-overlay-gradient" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                    <Eye className="w-3 h-3" /> <span className="count-up">{formatCount(v.views)}</span>
                  </span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                    <Heart className="w-3 h-3" /> <span className="count-up">{formatCount(v.likes)}</span>
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium line-clamp-2">{v.title}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <Avatar className="w-5 h-5 gradient-border-primex">
                    <AvatarFallback className="text-[8px] bg-primex/20 text-primex">
                      {v.user?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{v.user?.username || 'Unknown'}</span>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="glass-card-premium p-4 rounded-xl text-center col-span-full card-shine hover-lift">
              <div className="w-16 h-16 rounded-2xl bg-primex/10 flex items-center justify-center mx-auto mb-2 breathe">
                <Play className="w-7 h-7 text-primex" />
              </div>
              <h3 className="font-medium mb-1">No Videos Yet</h3>
              <p className="text-sm text-muted-foreground">Be the first to upload!</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
