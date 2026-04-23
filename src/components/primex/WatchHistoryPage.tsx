'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Play, Trash2, CheckCircle2, Circle, Eye, Film, AlertTriangle,
  Search, Filter,
} from 'lucide-react';

interface HistoryVideo {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  videoUrl: string;
  duration: number;
  views: number;
  user: {
    id: string;
    username: string;
    profilePic: string | null;
    isCreator: boolean;
  };
}

interface HistoryEntry {
  id: string;
  videoId: string;
  watchTime: number;
  completed: boolean;
  createdAt: string;
  video: HistoryVideo;
}

type FilterTab = 'all' | 'in_progress' | 'completed';

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'This Week';
  return 'Earlier';
}

export default function WatchHistoryPage() {
  const { user, token, setCurrentView } = useAppStore();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = useCallback(async (pageNum: number = 1) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/history?page=${pageNum}&limit=20&filter=${filter === 'in_progress' ? 'in_progress' : filter === 'completed' ? 'completed' : 'all'}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (pageNum === 1) {
          setHistory(data.data.history);
        } else {
          setHistory((prev) => [...prev, ...data.data.history]);
        }
        setHasMore(pageNum < data.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, [token, filter]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) return;
      try {
        const res = await fetch(`/api/history?page=1&limit=20&filter=${filter === 'in_progress' ? 'in_progress' : filter === 'completed' ? 'completed' : 'all'}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setHistory(data.data.history);
          setHasMore(1 < data.data.totalPages);
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to fetch history:', err);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [token, filter]);

  const handleClearAll = async () => {
    if (!token || clearing) return;
    setClearing(true);
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
    setClearing(false);
  };

  const handleRemoveEntry = async (videoId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/history?videoId=${videoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory((prev) => prev.filter((h) => h.videoId !== videoId));
      }
    } catch (err) {
      console.error('Failed to remove history entry:', err);
    }
  };

  const handlePlayVideo = (videoId: string) => {
    useAppStore.setState({ currentVideoId: videoId });
    setCurrentView('video');
  };

  // Group history by date
  const groupedHistory: Record<string, HistoryEntry[]> = {};
  const filteredHistory = searchQuery.trim()
    ? history.filter((entry) =>
        entry.video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.video.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  filteredHistory.forEach((entry) => {
    const group = getDateGroup(entry.createdAt);
    if (!groupedHistory[group]) groupedHistory[group] = [];
    groupedHistory[group].push(entry);
  });

  const dateOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

  if (loading) {
    return (
      <div className="px-4 pt-4 pb-2 max-w-5xl mx-auto bg-mesh relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="skeleton-circle w-10 h-10 skeleton-pulse" />
            <div className="skeleton-heading w-40 h-7 skeleton-pulse" />
          </div>
          <div className="skeleton-line w-24 h-9 skeleton-pulse rounded-lg" />
        </div>
        <div className="flex gap-2 mb-4 relative z-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-line w-28 h-9 rounded-full skeleton-pulse" />
          ))}
        </div>
        <div className="space-y-3 relative z-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 glass-card-premium p-3 rounded-xl">
              <div className="skeleton-pulse w-40 aspect-video rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton-heading w-3/4 h-5 skeleton-pulse" />
                <div className="skeleton-line w-1/2 h-4 skeleton-pulse" />
                <div className="skeleton-line w-1/3 h-3 skeleton-pulse" />
                <div className="skeleton-line w-2/3 h-1.5 skeleton-pulse rounded-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="px-4 pt-4 pb-2 max-w-5xl mx-auto bg-mesh relative overflow-hidden">
        <div className="relative z-10 mb-3 page-header-premium">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-10 h-10 rounded-xl bg-primex/10 flex items-center justify-center"
            >
              <Clock className="w-5 h-5 text-primex" />
            </motion.div>
            <h1 className="text-2xl font-bold text-shimmer">Watch History</h1>
          </div>
        </div>
        <div className="empty-state-premium relative z-10">
          <div className="empty-icon w-20 h-20 rounded-full bg-primex/10 flex items-center justify-center mb-4 breathe">
            <Clock className="w-10 h-10 text-primex/50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-sm">
            Videos you watch will appear here so you can easily find them again.
          </p>
          <button
            className="btn-outline-primex"
            onClick={() => setCurrentView('home')}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Watching
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-2 max-w-5xl mx-auto bg-mesh relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 mb-3 page-header-premium">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-10 h-10 rounded-xl bg-primex/10 flex items-center justify-center"
            >
              <Clock className="w-5 h-5 text-primex" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-shimmer">Watch History</h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                {history.length} video{history.length !== 1 ? 's' : ''} watched
              </p>
            </div>
          </div>
          <button
            className="btn-outline-primex border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleClearAll}
            disabled={clearing}
          >
            {clearing ? (
              <div className="spinner-primex-sm w-4 h-4 mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Clear All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative z-10 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full h-10 pl-9 pr-4 text-sm rounded-xl"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="relative z-10 tab-bar-premium mb-4">
        {[
          { key: 'all' as FilterTab, label: 'All Videos', icon: Film },
          { key: 'in_progress' as FilterTab, label: 'In Progress', icon: Circle },
          { key: 'completed' as FilterTab, label: 'Completed', icon: CheckCircle2 },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-item ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="divider-primex relative z-10 mb-4" />

      {/* History Groups */}
      <div className="relative z-10 space-y-4">
        {dateOrder.map((group) => {
          const entries = groupedHistory[group];
          if (!entries || entries.length === 0) return null;

          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{group}</h2>
                <div className="flex-1 divider-primex" />
                <span className="text-xs text-muted-foreground tag-info">{entries.length} video{entries.length > 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {entries.map((entry, index) => {
                    const progress = entry.video.duration > 0
                      ? Math.min(100, (entry.watchTime / entry.video.duration) * 100)
                      : 0;

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="glass-card-premium p-3 rounded-xl hover-lift card-shine group cursor-pointer"
                        onClick={() => handlePlayVideo(entry.videoId)}
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="relative w-36 sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0 bg-muted">
                            {entry.video.thumbnail ? (
                              <img
                                src={entry.video.thumbnail}
                                alt={entry.video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/20 to-primex-secondary/20 shimmer">
                                <Film className="w-8 h-8 text-primex/40" />
                              </div>
                            )}
                            {/* Duration badge */}
                            {entry.video.duration > 0 && (
                              <div className="video-duration-badge absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white">
                                {formatDuration(entry.video.duration)}
                              </div>
                            )}
                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="play-button-hover w-10 h-10">
                                <Play className="w-5 h-5 text-white ml-0.5" />
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-primex transition-colors">
                              {entry.video.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={entry.video.user?.profilePic || ''} />
                                <AvatarFallback className="text-[8px] bg-primex/20 text-primex">
                                  {entry.video.user?.username?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground truncate">
                                {entry.video.user?.username || 'Unknown'}
                              </span>
                              {entry.video.user?.isCreator && (
                                <span className="tag-primex text-[9px] py-0 px-1">Creator</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Eye className="w-3 h-3" />
                              <span>{formatViews(entry.video.views)} views</span>
                              <span>•</span>
                              <span>{timeAgo(entry.createdAt)}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-auto">
                              <div className="flex items-center gap-2 mb-1">
                                {entry.completed ? (
                                  <span className="flex items-center gap-1 text-[10px] text-success font-medium tag-success text-[9px] py-0">
                                    <CheckCircle2 className="w-3 h-3" /> Watched
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] text-primex font-medium tag-primex text-[9px] py-0">
                                    <Circle className="w-3 h-3" /> In Progress
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <div className="progress-bar h-1.5">
                                <div
                                  className={`progress-bar-fill ${entry.completed ? 'bg-success' : ''}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Remove button */}
                          <button
                            className="shrink-0 self-start p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEntry(entry.videoId);
                            }}
                            aria-label="Remove from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Divider between date groups */}
              {group !== dateOrder[dateOrder.length - 1] && (
                <div className="divider-primex mt-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="relative z-10 flex justify-center mt-4">
          <button
            className="btn-outline-primex"
            onClick={() => fetchHistory(page + 1)}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
