'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Play, Eye, Heart, Film, TrendingUp, Sparkles,
  Compass, Zap, ArrowRight, Clock, Loader2,
  Sparkle
} from 'lucide-react';
import StoriesBar from './StoriesBar';

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

interface RecommendedVideo {
  id: string;
  title: string;
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

export default function HomeFeed() {
  const { setCurrentView, token } = useAppStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedVideo[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const selectedCategoryRef = useRef('All');

  // Keep refs in sync with state
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { selectedCategoryRef.current = selectedCategory; }, [selectedCategory]);

  const fetchVideos = useCallback(async (pageNum: number, reset = false, category?: string) => {
    if (!reset && loadingMoreRef.current) return; // Prevent duplicate requests
    if (!reset) setLoadingMore(true);
    try {
      const cat = category || selectedCategoryRef.current;
      const tagParam = cat && cat !== 'All' ? `&tag=${encodeURIComponent(cat)}` : '';
      const res = await fetch(`/api/videos?page=${pageNum}&limit=12${tagParam}`);
      const data = await res.json();
      if (data.success) {
        const newVideos = data.data.videos || [];
        setVideos(prev => reset ? newVideos : [...prev, ...newVideos]);
        setHasMore(newVideos.length === 12);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/recommendations?limit=6&type=video', { headers });
        const data = await res.json();
        if (data.success) {
          setRecommendations(data.data.recommendations || []);
        }
      } catch {
        // Silently fail
      }
      setRecLoading(false);
    };
    fetchRecs();
  }, [token]);

  useEffect(() => {
    fetchVideos(1, true);
  }, [fetchVideos]);

  // Refetch when category changes
  const prevCategoryRef = useRef('All');
  useEffect(() => {
    if (selectedCategory !== prevCategoryRef.current) {
      prevCategoryRef.current = selectedCategory;
      setPage(1);
      pageRef.current = 1;
      fetchVideos(1, true, selectedCategory);
    } else if (selectedCategory !== 'All' && videos.length === 0) {
      // Also fetch on initial mount for non-All categories
      fetchVideos(1, true, selectedCategory);
    }
  }, [selectedCategory, fetchVideos, videos.length]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
          const nextPage = pageRef.current + 1;
          setPage(nextPage);
          pageRef.current = nextPage;
          fetchVideos(nextPage);
        }
      },
      { rootMargin: '200px' }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [fetchVideos, videos.length]); // Re-observe when new videos are added

  // Manual load more fallback
  const handleLoadMore = useCallback(() => {
    if (hasMoreRef.current && !loadingMoreRef.current) {
      const nextPage = pageRef.current + 1;
      setPage(nextPage);
      pageRef.current = nextPage;
      fetchVideos(nextPage);
    }
  }, [fetchVideos]);

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
      <div className="p-3 lg:p-4">
        {/* Category skeleton */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-pulse h-8 w-16 rounded-full shrink-0" />
          ))}
        </div>
        {/* Video grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="aspect-video shimmer rounded-xl" />
              <div className="flex gap-2">
                <div className="w-9 h-9 skeleton-pulse skeleton-circle shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="skeleton-pulse skeleton-line w-3/4" />
                  <div className="skeleton-pulse skeleton-line w-1/2 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-4">
      {/* Stories Bar */}
      <StoriesBar />

      {/* Category Tabs with tag-primex style */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all active-press hover-lift ${
              selectedCategory === cat.name
                ? 'tag-primex bg-primex/20 text-primex border-primex/40 shadow-lg glow-effect'
                : 'glass-card text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <span className="text-base">{cat.emoji}</span>
            {cat.name}
            {cat.name === 'All' && videos.length > 0 && (
              <span className="badge-pulse text-[9px] ml-1">New</span>
            )}
          </button>
        ))}
      </div>

      {/* Trending Section (when videos exist) */}
      {videos.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold flex items-center gap-1.5 text-shimmer">
              <TrendingUp className="w-4 h-4 text-primex" />
              Trending Now
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="btn-ghost-primex text-xs"
              onClick={() => setCurrentView('explore')}
            >
              See all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {videos.slice(0, 5).map((video, i) => (
              <div
                key={video.id}
                className="shrink-0 w-56 glass-card-premium rounded-xl overflow-hidden cursor-pointer group hover-lift card-shine"
                onClick={() => {
                  useAppStore.setState({ currentVideoId: video.id });
                  setCurrentView('video');
                }}
              >
                <div className="relative aspect-video bg-muted">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full shimmer flex items-center justify-center">
                      <Play className="w-6 h-6 text-primex/40" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 tag-primex text-[10px] px-1.5 py-0.5 gap-0.5">
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

      {/* Divider */}
      <div className="divider-primex my-3" />

      {/* Recommended For You Section */}
      {recommendations.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-1.5 text-shimmer">
                <Sparkle className="w-4 h-4 text-primex" />
                Recommended For You
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Based on your watch history</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {recommendations.map((video) => (
              <div
                key={video.id}
                className="shrink-0 w-56 interactive-card rounded-xl overflow-hidden cursor-pointer group hover-lift card-shine"
                onClick={() => {
                  useAppStore.setState({ currentVideoId: video.id });
                  setCurrentView('video');
                }}
              >
                <div className="relative aspect-video bg-muted">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full shimmer flex items-center justify-center">
                      <Play className="w-6 h-6 text-primex/40" />
                    </div>
                  )}
                  {video.duration > 0 && (
                    <span className="video-duration-badge">{formatDuration(video.duration)}</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="play-button-hover">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium line-clamp-2">{video.title}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={video.user?.profilePic || ''} />
                      <AvatarFallback className="bg-primex/20 text-primex text-[8px] font-bold">
                        {video.user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] text-muted-foreground truncate">{video.user?.username}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <Eye className="w-3 h-3" /> {formatViews(video.views)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="divider-primex mt-3" />
        </div>
      )}

      {/* Recommended Loading Skeleton */}
      {recLoading && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="skeleton-pulse skeleton-line w-48 h-5" />
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-56">
                <div className="aspect-video skeleton-pulse shimmer rounded-xl" />
                <div className="p-2.5 space-y-1.5">
                  <div className="skeleton-pulse skeleton-line w-3/4" />
                  <div className="skeleton-pulse skeleton-line w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
          <div className="divider-primex mt-3" />
        </div>
      )}

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl glass-card-premium flex items-center justify-center hover-lift">
            <Film className="w-7 h-7 text-primex" />
          </div>
          <h3 className="font-medium mb-1">No Videos Yet</h3>
          <p className="text-muted-foreground text-sm mb-3">Be the first to upload and start trending!</p>
        </div>
      ) : (
        <>
          <h2 className="text-base font-semibold mb-2 flex items-center gap-1.5 text-shimmer">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Latest Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.5), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card-premium overflow-hidden cursor-pointer group hover-lift card-shine rounded-xl reveal-up"
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
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full shimmer flex items-center justify-center">
                      <Play className="w-10 h-10 text-primex/30" />
                    </div>
                  )}
                  {video.duration > 0 && (
                    <span className="absolute bottom-2 right-2 video-duration-badge">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="play-button-hover">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <div className="flex gap-2">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={video.user?.profilePic || ''} />
                      <AvatarFallback className="bg-primex/20 text-primex text-xs font-bold">
                        {video.user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-shimmer transition-all duration-300">
                        {video.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {video.user?.username || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(video.views)} views</span>
                        <span>·</span>
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

      {/* Infinite Scroll Sentinel + Load More Fallback + End State */}
      {videos.length > 0 && (
        <div className="mt-4">
          {hasMore ? (
            <>
              {/* Intersection Observer sentinel */}
              <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-3">
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-primex">
                    <div className="spinner-primex" />
                    <span className="text-sm text-muted-foreground">Loading more videos...</span>
                  </div>
                ) : (
                  <div className="spinner-primex-sm" />
                )}
              </div>
              {/* Load More fallback button */}
              {!loadingMore && (
                <div className="flex justify-center pb-4">
                  <Button
                    variant="outline"
                    className="btn-outline-primex rounded-xl gap-2 hover-lift"
                    onClick={handleLoadMore}
                  >
                    <Loader2 className="w-4 h-4" />
                    Load More Videos
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="divider-primex my-3" />
              <div className="text-center py-3">
                <Sparkles className="w-5 h-5 text-primex mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">You&apos;ve seen it all!</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {videos.length} videos loaded
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
