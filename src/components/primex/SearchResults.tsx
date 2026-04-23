'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Film, UserPlus, Play, Eye, Compass,
  TrendingUp, Heart, Clapperboard, Star, X, Loader2,
} from 'lucide-react';

interface SearchUser {
  id: string;
  username: string;
  profilePic: string | null;
  bio: string | null;
  isCreator: boolean;
}

interface SearchVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  views: number;
  likes: number;
  duration: number;
  tags: string | null;
  user: { id: string; username: string; profilePic: string | null; isCreator: boolean };
  createdAt: string;
}

interface SearchReel {
  id: string;
  caption: string | null;
  thumbnail: string | null;
  likes: number;
  shares: number;
  createdAt: string;
  user: { id: string; username: string; profilePic: string | null; isCreator: boolean };
}

type TabType = 'all' | 'videos' | 'users' | 'reels';

const trendingSearches = [
  'Music', 'Gaming', 'Cooking', 'Fitness', 'Tech Reviews',
  'Vlog', 'Dance', 'Comedy', 'Art', 'Travel',
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function SearchResults() {
  const { token, searchQuery, setCurrentView, setSearchQuery } = useAppStore();
  const query = searchQuery || '';
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [videos, setVideos] = useState<SearchVideo[]>([]);
  const [reels, setReels] = useState<SearchReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refinementQuery, setRefinementQuery] = useState('');
  const [friendLoading, setFriendLoading] = useState<Record<string, boolean>>({});

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=all`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users || []);
        setVideos(data.data.videos || []);
        setReels(data.data.reels || []);
      }
    } catch {
      // Search failed silently
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  useEffect(() => {
    setRefinementQuery(query);
  }, [query]);

  const handleRefinement = () => {
    if (refinementQuery.trim() && refinementQuery !== query) {
      setSearchQuery(refinementQuery.trim());
    }
  };

  const handleAddFriend = async (userId: string) => {
    if (!token) return;
    setFriendLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });
    } catch {
      // Friend request failed silently
    }
    setFriendLoading(prev => ({ ...prev, [userId]: false }));
  };

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

  const totalResults = users.length + videos.length + reels.length;
  const tabs: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all', label: 'All', icon: <Search className="w-4 h-4" />, count: totalResults },
    { key: 'videos', label: 'Videos', icon: <Film className="w-4 h-4" />, count: videos.length },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" />, count: users.length },
    { key: 'reels', label: 'Reels', icon: <Clapperboard className="w-4 h-4" />, count: reels.length },
  ];

  // Empty query state
  if (!query) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6 relative">
        <div className="bg-mesh absolute inset-0 pointer-events-none" />
        <div className="orb-primex-sm absolute top-20 -right-10 pointer-events-none" />
        <div className="orb-primex-sm absolute bottom-40 -left-10 pointer-events-none" />

        <div className="relative z-10 text-center py-16 empty-state-premium">
          <div className="breathe w-20 h-20 rounded-2xl glass-card-premium flex items-center justify-center mx-auto mb-4">
            <Search className="w-9 h-9 text-primex" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-shimmer">Search PrimeX</h2>
          <p className="text-muted-foreground text-sm mb-6">Type something in the search bar to find videos, creators, and reels</p>
          <Button
            variant="outline"
            className="btn-outline-primex rounded-xl gap-2 hover-lift"
            onClick={() => setCurrentView('explore')}
          >
            <Compass className="w-4 h-4" /> Explore Instead
          </Button>

          {/* Trending Searches */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-primex" /> Trending Searches
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {trendingSearches.map(tag => (
                <button
                  key={tag}
                  className="tag-primex hover-lift cursor-pointer"
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6 relative">
      {/* Background mesh + orbs */}
      <div className="bg-mesh absolute inset-0 pointer-events-none" />
      <div className="orb-primex-sm absolute top-10 -right-10 pointer-events-none" />
      <div className="orb-primex-sm absolute bottom-60 -left-10 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-shimmer mb-2">Search Results</h1>
          <p className="text-muted-foreground text-sm">
            Showing results for &quot;<span className="gradient-text-primex font-semibold text-base">{query}</span>&quot;
          </p>
        </div>

        {/* Search Refinement Input */}
        <div className="mb-6 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              className="glass-input w-full pl-10 pr-20 py-3 rounded-xl text-sm"
              placeholder="Refine your search..."
              value={refinementQuery}
              onChange={(e) => setRefinementQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRefinement(); }}
            />
            {refinementQuery && (
              <button
                className="absolute right-14 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setRefinementQuery('')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              size="sm"
              className="btn-primex absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3"
              onClick={handleRefinement}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="tab-bar-premium mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all active-press ${
                activeTab === tab.key
                  ? 'tag-primex bg-primex/20 text-primex border-primex/40 shadow-lg glow-effect'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-xs ml-1 ${activeTab === tab.key ? 'text-primex' : 'text-muted-foreground/60'}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="interactive-card rounded-xl overflow-hidden">
                  <div className="aspect-video skeleton-pulse shimmer" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton-pulse skeleton-line w-3/4" />
                    <div className="skeleton-pulse skeleton-line w-1/2 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ALL TAB */}
            {activeTab === 'all' && (
              <motion.div
                key="all"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {totalResults === 0 ? (
                  <EmptyState query={query} onExplore={() => setCurrentView('explore')} onSearchTag={setSearchQuery} />
                ) : (
                  <div className="space-y-8">
                    {/* Top Users */}
                    {users.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                            <Users className="w-4 h-4 text-primex" /> Top Users
                            <span className="text-xs text-muted-foreground/60 normal-case">({users.length})</span>
                          </h3>
                        </div>
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="show"
                          className="content-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        >
                          {users.slice(0, 3).map(u => (
                            <motion.div key={u.id} variants={staggerItem}>
                              <UserCard user={u} onAddFriend={handleAddFriend} friendLoading={friendLoading} token={token} />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}

                    {users.length > 0 && videos.length > 0 && <div className="divider-primex" />}

                    {/* Top Videos */}
                    {videos.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                            <Film className="w-4 h-4 text-primex" /> Top Videos
                            <span className="text-xs text-muted-foreground/60 normal-case">({videos.length})</span>
                          </h3>
                        </div>
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="show"
                          className="content-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        >
                          {videos.slice(0, 6).map(v => (
                            <motion.div key={v.id} variants={staggerItem}>
                              <VideoCard video={v} formatViews={formatViews} formatDuration={formatDuration} timeAgo={timeAgo} setCurrentView={setCurrentView} />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}

                    {(users.length > 0 || videos.length > 0) && reels.length > 0 && <div className="divider-primex" />}

                    {/* Top Reels */}
                    {reels.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                            <Clapperboard className="w-4 h-4 text-primex" /> Top Reels
                            <span className="text-xs text-muted-foreground/60 normal-case">({reels.length})</span>
                          </h3>
                        </div>
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="show"
                          className="content-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                        >
                          {reels.slice(0, 4).map(r => (
                            <motion.div key={r.id} variants={staggerItem}>
                              <ReelCard reel={r} formatViews={formatViews} timeAgo={timeAgo} />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* VIDEOS TAB */}
            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {videos.length > 0 ? (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="content-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {videos.map(v => (
                      <motion.div key={v.id} variants={staggerItem}>
                        <VideoCard video={v} formatViews={formatViews} formatDuration={formatDuration} timeAgo={timeAgo} setCurrentView={setCurrentView} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState query={query} onExplore={() => setCurrentView('explore')} onSearchTag={setSearchQuery} type="videos" />
                )}
              </motion.div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {users.length > 0 ? (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="content-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {users.map(u => (
                      <motion.div key={u.id} variants={staggerItem}>
                        <UserCard user={u} onAddFriend={handleAddFriend} friendLoading={friendLoading} token={token} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState query={query} onExplore={() => setCurrentView('explore')} onSearchTag={setSearchQuery} type="users" />
                )}
              </motion.div>
            )}

            {/* REELS TAB */}
            {activeTab === 'reels' && (
              <motion.div
                key="reels"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {reels.length > 0 ? (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="content-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  >
                    {reels.map(r => (
                      <motion.div key={r.id} variants={staggerItem}>
                        <ReelCard reel={r} formatViews={formatViews} timeAgo={timeAgo} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState query={query} onExplore={() => setCurrentView('explore')} onSearchTag={setSearchQuery} type="reels" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Trending Searches at bottom when no results or few results */}
        {!loading && totalResults <= 3 && (
          <div className="mt-8">
            <div className="divider-primex mb-6" />
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primex" /> Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map(tag => (
                <button
                  key={tag}
                  className="tag-primex hover-lift cursor-pointer"
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-Components ──────────────────────────────────────── */

function VideoCard({
  video,
  formatViews,
  formatDuration,
  timeAgo,
  setCurrentView,
}: {
  video: SearchVideo;
  formatViews: (v: number) => string;
  formatDuration: (s: number) => string;
  timeAgo: (d: string) => string;
  setCurrentView: (v: string) => void;
}) {
  return (
    <div
      className="interactive-card rounded-xl overflow-hidden cursor-pointer group"
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
            <Play className="w-8 h-8 text-primex/30" />
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
      <div className="p-3">
        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-shimmer transition-all duration-300">{video.title}</h4>
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={video.user?.profilePic || ''} />
            <AvatarFallback className="bg-primex/20 text-primex text-[10px] font-bold">
              {video.user?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">{video.user?.username || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(video.views)}</span>
          <span>·</span>
          <span>{timeAgo(video.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function UserCard({
  user,
  onAddFriend,
  friendLoading,
  token,
}: {
  user: SearchUser;
  onAddFriend: (id: string) => void;
  friendLoading: Record<string, boolean>;
  token: string | null;
}) {
  return (
    <div className="glass-card-premium hover-lift card-shine rounded-xl p-4 flex flex-col items-center text-center">
      <div className="gradient-border-primex rounded-full p-0.5 mb-3">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.profilePic || ''} />
          <AvatarFallback className="bg-primex/20 text-primex text-xl font-bold">
            {user.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <p className="font-semibold text-sm">{user.username}</p>
        {user.isCreator && (
          <span className="tag-primex text-[10px] px-1.5 py-0.5 gap-0.5 inline-flex items-center">
            <Star className="w-2.5 h-2.5" /> Creator
          </span>
        )}
      </div>
      {user.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{user.bio}</p>}
      {token && (
        <Button
          size="sm"
          className="btn-primex rounded-xl gap-1.5 text-xs mt-auto"
          onClick={() => onAddFriend(user.id)}
          disabled={friendLoading[user.id]}
        >
          {friendLoading[user.id] ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          Add Friend
        </Button>
      )}
    </div>
  );
}

function ReelCard({
  reel,
  formatViews,
  timeAgo,
}: {
  reel: SearchReel;
  formatViews: (v: number) => string;
  timeAgo: (d: string) => string;
}) {
  return (
    <div className="interactive-card rounded-xl overflow-hidden cursor-pointer group">
      <div className="relative aspect-[9/16] bg-muted">
        {reel.thumbnail ? (
          <img src={reel.thumbnail} alt={reel.caption || 'Reel'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full shimmer flex items-center justify-center bg-gradient-to-br from-primex/10 via-primex-secondary/5 to-primex/10">
            <Clapperboard className="w-8 h-8 text-primex/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="play-button-hover">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          {reel.caption && (
            <p className="text-xs text-white line-clamp-2 font-medium drop-shadow-md">{reel.caption}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="w-5 h-5 border border-white/30">
              <AvatarImage src={reel.user?.profilePic || ''} />
              <AvatarFallback className="bg-primex/40 text-white text-[8px]">
                {reel.user?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-white/80">{reel.user?.username}</span>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5">
          <Heart className="w-3 h-3 text-red-400" />
          <span className="text-[10px] text-white font-medium">{formatViews(reel.likes)}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  query,
  onExplore,
  onSearchTag,
  type,
}: {
  query: string;
  onExplore: () => void;
  onSearchTag: (q: string) => void;
  type?: string;
}) {
  return (
    <div className="empty-state-premium text-center py-16">
      <div className="breathe w-20 h-20 rounded-2xl glass-card-premium flex items-center justify-center mx-auto mb-4">
        <Search className="w-9 h-9 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">No {type || 'results'} found</h3>
      <p className="text-muted-foreground text-sm mb-1">
        No matches for &quot;<span className="gradient-text-primex font-medium">{query}</span>&quot;
      </p>
      <p className="text-muted-foreground text-xs mb-6">Try different keywords or browse Explore</p>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" className="btn-outline-primex rounded-xl gap-2 hover-lift" onClick={onExplore}>
          <Compass className="w-4 h-4" /> Explore
        </Button>
      </div>
      {/* Trending suggestions */}
      <div className="mt-8">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Try searching</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {trendingSearches.slice(0, 5).map(tag => (
            <button
              key={tag}
              className="tag-primex hover-lift cursor-pointer text-xs"
              onClick={() => onSearchTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
