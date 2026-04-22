'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Eye, Clock, MoreVertical } from 'lucide-react';

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

const categories = ['All', 'Music', 'Gaming', 'Education', 'Entertainment', 'Sports', 'News', 'Tech'];

export default function HomeFeed() {
  const { setCurrentView } = useAppStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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
            <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
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
      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'primex-gradient text-white glow-effect'
                : 'glass-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl glass-card flex items-center justify-center">
            <Play className="w-8 h-8 text-primex" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Videos Yet</h3>
          <p className="text-muted-foreground text-sm">Be the first to upload a video!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
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
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <Play className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                )}
                {/* Duration badge */}
                {video.duration > 0 && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
                    {formatDuration(video.duration)}
                  </span>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-12 h-12 rounded-full primex-gradient flex items-center justify-center glow-effect">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex gap-2">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={video.user?.profilePic || ''} />
                    <AvatarFallback className="bg-primex/20 text-primex text-xs">
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
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && videos.length > 0 && (
        <div className="text-center mt-8">
          <Button
            onClick={() => { setPage(p => p + 1); fetchVideos(page + 1); }}
            variant="outline"
            className="glass-card border-border/50 rounded-xl px-8"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
