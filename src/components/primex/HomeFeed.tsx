'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  Play, Eye, Heart, Film, TrendingUp, Sparkles,
  Compass, Zap, ArrowRight, Clock, Trophy, ChevronDown, ChevronUp
} from 'lucide-react';
import StoriesBar from './StoriesBar';
import CreatorLeaderboard from './CreatorLeaderboard';

interface Video {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnail: string | null;
  views: number;
  likes: number;
  duration: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    profilePic: string | null;
  };
}

const categories = [
  { name: 'All', emoji: '🔥' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Gaming', emoji: '🎮' },
  { name: 'Education', emoji: '📚' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'News', emoji: '📰' },
  { name: 'Tech', emoji: '💻' },
];

export default function HomeFeed() {
  const { setCurrentView } = useAppStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const fetchVideos = async (pageNum: number, reset = false) => {
    try {
      const res = await fetch(`/api/videos?page=${pageNum}&limit=12`);
      const data = await res.json();
      if (data.success) {
        const newVideos = data.data.videos || [];
        setVideos(prev => reset ? newVideos : [...prev, ...newVideos]);
        setHasMore(newVideos.length === 12);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos(1, true);
  }, []);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Stories Bar */}
      <StoriesBar />

      {/* Divider */}
      <div className="divider-primex my-2" />

      {/* Leaderboard Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primex transition-colors group w-full"
        >
          <Trophy className="w-4 h-4 text-primex" />
          <span>Creator Leaderboard</span>
          {showLeaderboard ? (
            <ChevronUp className="w-4 h-4 ml-auto group-hover:text-primex transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto group-hover:text-primex transition-colors" />
          )}
        </button>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <CreatorLeaderboard />
          </motion.div>
        )}
      </div>

      {/* Welcome Banner (only when no videos) */}
      {videos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 lg:p-8 mb-6 glow-border overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primex/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primex" />
              <span className="text-xs font-medium text-primex uppercase tracking-wider">Welcome to PrimeX</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              Your Premium <span className="primex-gradient-text">Video Platform</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mb-4">
              Watch long videos, scroll through reels, connect with creators, and share your own content. No subscriptions — just pure entertainment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="primex-gradient text-white rounded-xl gap-2 shadow-lg glow-effect"
                onClick={() => setCurrentView('upload')}
              >
                <Film className="w-4 h-4" /> Upload Your First Video
              </Button>
              <Button
                variant="outline"
                className="rounded-xl glass-card border-border/50 gap-2"
                onClick={() => setCurrentView('explore')}
              >
                <Compass className="w-4 h-4" /> Explore Content
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { icon: Film, label: 'Long Videos', desc: '4K quality streaming' },
                { icon: Play, label: 'Short Reels', desc: 'Quick entertainment' },
                { icon: Heart, label: 'Private Content', desc: 'Friends-only access' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primex/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primex" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.name
                ? 'primex-gradient text-white glow-effect shadow-lg'
                : 'glass-card text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <span className="text-base">{cat.emoji}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Trending Section (when videos exist) */}
      {videos.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primex" />
              Trending Now
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primex gap-1 text-xs"
              onClick={() => setCurrentView('explore')}
            >
              See all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {videos.slice(0, 5).map((video, i) => (
              <div
                key={video.id}
                className="shrink-0 w-56 glass-card rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  useAppStore.setState({ currentVideoId: video.id });
                  setCurrentView('video');
                }}
              >
                <div className="relative aspect-video bg-muted">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/10 to-primex/5">
                      <Play className="w-6 h-6 text-primex/40" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-primex text-white text-[10px] font-bold flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> #{i + 1}
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium line-clamp-1">{video.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <Eye className="w-3 h-3" /> {formatViews(video.views)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl glass-card flex items-center justify-center">
            <Film className="w-7 h-7 text-primex" />
          </div>
          <h3 className="font-medium mb-1">No Videos Yet</h3>
          <p className="text-muted-foreground text-sm mb-3">Be the first to upload and start trending!</p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Latest Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden video-card-hover cursor-pointer group"
                onClick={() => {
                  useAppStore.setState({ currentVideoId: video.id });
                  setCurrentView('video');
                }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/10 to-primex/5">
                      <Play className="w-10 h-10 text-primex/30" />
                    </div>
                  )}
                  {video.duration > 0 && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-xs font-medium">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 rounded-full primex-gradient flex items-center justify-center glow-effect">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex gap-2.5">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={video.user?.profilePic || ''} />
                      <AvatarFallback className="bg-primex/20 text-primex text-xs font-bold">
                        {video.user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium line-clamp-2 leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {video.user?.username || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{timeAgo(video.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Load More */}
      {hasMore && videos.length > 0 && (
        <div className="text-center mt-8">
          <Button
            onClick={() => { setPage(p => p + 1); fetchVideos(page + 1); }}
            variant="outline"
            className="glass-card border-border/50 rounded-xl px-8 gap-2"
          >
            Load More <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
