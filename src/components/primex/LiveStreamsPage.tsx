'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Eye, Users, Gamepad2, Music, Mic2, Palette, MapPin, Headphones,
  Video, ChevronRight, X, Monitor, Mic, Camera, Loader2, AlertCircle,
  PhoneOff,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store';

/* ── Types ─────────────────────────────────────────────────── */
interface LiveStream {
  id: string;
  userId: string;
  streamerName: string;
  streamerAvatar: string | null;
  streamerIsCreator: boolean;
  streamTitle: string;
  category: string;
  viewers: number;
  thumbnail: string | null;
  isLive: boolean;
  startedAt: string;
}

/* ── Categories ─────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all', label: 'All', icon: Radio },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'talk', label: 'Talk Shows', icon: Mic2 },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'irl', label: 'IRL', icon: MapPin },
  { id: 'asmr', label: 'ASMR', icon: Headphones },
];

const GO_LIVE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all');

/* ── Helpers ───────────────────────────────────────────────── */
function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    gaming: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    music: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    talk: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    creative: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    irl: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    asmr: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  };
  return map[category] || 'bg-primex/20 text-primex border-primex/30';
}

function getGradientForStream(index: number): string {
  const gradients = [
    'from-rose-600/40 via-purple-700/30 to-indigo-800/40',
    'from-emerald-600/40 via-teal-700/30 to-cyan-800/40',
    'from-amber-600/40 via-orange-700/30 to-red-800/40',
    'from-violet-600/40 via-fuchsia-700/30 to-pink-800/40',
    'from-sky-600/40 via-blue-700/30 to-indigo-800/40',
    'from-lime-600/40 via-green-700/30 to-emerald-800/40',
    'from-pink-600/40 via-rose-700/30 to-red-800/40',
    'from-cyan-600/40 via-teal-700/30 to-emerald-800/40',
  ];
  return gradients[index % gradients.length];
}

/* ── Live Badge Component ──────────────────────────────────── */
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-red-500 text-white text-[9px] font-bold uppercase tracking-wider">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
      </span>
      LIVE
    </span>
  );
}

/* ── Go Live Modal ─────────────────────────────────────────── */
function GoLiveModal({
  onClose,
  onGoLive,
  loading,
}: {
  onClose: () => void;
  onGoLive: (title: string, category: string) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('talk');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card-premium gradient-border-primex rounded-2xl p-5 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Radio className="w-4.5 h-4.5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Go Live</h2>
              <p className="text-xs text-muted-foreground">Start streaming to your audience</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Preview */}
        <div className="relative aspect-video rounded-xl bg-gradient-to-br from-primex/20 via-background to-primex-secondary/20 mb-4 overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-noise opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            {cameraOn ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primex/20 flex items-center justify-center mx-auto mb-2">
                  <Camera className="w-8 h-8 text-primex" />
                </div>
                <p className="text-xs text-muted-foreground">Camera preview</p>
              </div>
            ) : (
              <div className="text-center">
                <Monitor className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Camera off</p>
              </div>
            )}
          </div>
          {/* Controls overlay */}
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-3 z-10">
            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                cameraOn ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMicOn(!micOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                micOn ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stream Title */}
        <div className="mb-3">
          <label className="text-xs text-muted-foreground mb-1 block font-medium">Stream Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you streaming today?"
            className="glass-input h-10 rounded-xl"
            maxLength={100}
          />
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 text-right">{title.length}/100</p>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {GO_LIVE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primex text-white shadow-lg shadow-primex/20'
                      : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Go Live Button */}
        <button
          onClick={() => {
            if (title.trim().length >= 2) onGoLive(title.trim(), category);
          }}
          disabled={title.trim().length < 2 || loading}
          className="w-full btn-primex h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting Stream...
            </>
          ) : (
            <>
              <Radio className="w-4 h-4" />
              Go Live Now
            </>
          )}
        </button>

        {title.trim().length < 2 && title.length > 0 && (
          <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Title must be at least 2 characters
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Live Stream Viewer (watching a live stream) ───────────── */
function StreamViewer({
  stream,
  onClose,
}: {
  stream: LiveStream;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg h-full max-h-[100dvh] sm:rounded-2xl sm:max-h-[90vh] overflow-hidden">
        {/* Gradient Background (Stream Content) */}
        <div className="absolute inset-0 bg-gradient-to-br from-primex/30 via-background to-primex-secondary/30" />
        <div className="absolute inset-0 bg-noise opacity-20" />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="gradient-border-primex rounded-full p-0.5">
              <Avatar className="w-9 h-9 border-2 border-black">
                <AvatarImage src={stream.streamerAvatar || ''} />
                <AvatarFallback className="bg-primex/30 text-white text-sm font-bold">
                  {stream.streamerName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-white text-sm font-semibold">@{stream.streamerName}</p>
                {stream.streamerIsCreator && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-primex/30 text-primex font-medium">Creator</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <LiveBadge />
                <span className="text-white/60 text-[11px] flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViewers(stream.viewers)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
              <Radio className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-white text-lg font-bold mb-1">{stream.streamTitle}</h2>
            <p className="text-white/50 text-sm">{timeAgo(stream.startedAt)}</p>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border mt-3 ${getCategoryColor(stream.category)}`}>
              {CATEGORIES.find((c) => c.id === stream.category)?.label || stream.category}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Featured Stream Hero ──────────────────────────────────── */
function FeaturedStream({ stream, onClick }: { stream: LiveStream; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-xl overflow-hidden glass-card-premium hover-lift card-shine cursor-pointer group"
      onClick={onClick}
    >
      <div className={`relative aspect-[21/9] bg-gradient-to-br ${getGradientForStream(0)}`}>
        <div className="absolute inset-0 rounded-xl border-2 border-red-500/40 animate-pulse" />
        <div className="video-overlay-gradient absolute inset-0" />
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2 mb-2">
            <LiveBadge />
            <span className="flex items-center gap-1 text-white/90 text-xs">
              <Eye className="w-3 h-3" />
              {formatViewers(stream.viewers)}
            </span>
            <span className="text-white/60 text-[10px]">{timeAgo(stream.startedAt)}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-1.5 line-clamp-2">
            {stream.streamTitle}
          </h2>
          <div className="flex items-center gap-2">
            <div className="gradient-border-primex rounded-full p-0.5">
              <Avatar className="w-8 h-8">
                <AvatarImage src={stream.streamerAvatar || ''} />
                <AvatarFallback className="bg-primex/20 text-primex font-bold text-xs">
                  {stream.streamerName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-white font-medium text-xs">{stream.streamerName}</p>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${getCategoryColor(stream.category)}`}>
                {CATEGORIES.find((c) => c.id === stream.category)?.label || stream.category}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Video className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Stream Card ───────────────────────────────────────────── */
function StreamCard({ stream, index, onClick }: { stream: LiveStream; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass-card-premium rounded-xl overflow-hidden hover-lift card-shine cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-xl border border-red-500/20 group-hover:border-red-500/40 transition-colors pointer-events-none z-10" />
      <div className="relative aspect-video bg-gradient-to-br overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradientForStream(index)}`} />
        <div className="video-overlay-gradient absolute inset-0" />
        <div className="absolute top-2 left-2 z-10"><LiveBadge /></div>
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px]">
          <Eye className="w-3 h-3" />
          {formatViewers(stream.viewers)}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <div className="flex gap-2">
          <div className="gradient-border-primex rounded-full p-0.5 shrink-0">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primex/20 text-primex font-bold text-[10px]">
                {stream.streamerName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-xs text-foreground truncate">{stream.streamerName}</p>
            <p className="text-[11px] text-foreground/80 line-clamp-2 mt-0.5 leading-relaxed">{stream.streamTitle}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${getCategoryColor(stream.category)}`}>
                {CATEGORIES.find((c) => c.id === stream.category)?.label || stream.category}
              </span>
              <span className="text-[9px] text-muted-foreground">{timeAgo(stream.startedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── My Active Stream Banner ───────────────────────────────── */
function MyStreamBanner({
  stream,
  onEnd,
}: {
  stream: LiveStream;
  onEnd: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-premium rounded-xl p-3 mb-3 border border-red-500/30"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-red-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <LiveBadge />
              <span className="text-xs text-muted-foreground">Your stream</span>
            </div>
            <p className="text-sm font-semibold truncate">{stream.streamTitle}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViewers(stream.viewers)}
              </span>
              <span>{timeAgo(stream.startedAt)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onEnd}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          End Stream
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main LiveStreamsPage ──────────────────────────────────── */
export default function LiveStreamsPage() {
  const { user, token } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoLive, setShowGoLive] = useState(false);
  const [goLiveLoading, setGoLiveLoading] = useState(false);
  const [myStream, setMyStream] = useState<LiveStream | null>(null);
  const [viewingStream, setViewingStream] = useState<LiveStream | null>(null);

  // Fetch live streams
  const fetchStreams = useCallback(async () => {
    try {
      const params = new URLSearchParams({ isLive: 'true', limit: '50' });
      if (activeCategory !== 'all') params.set('category', activeCategory);

      const res = await fetch(`/api/livestreams?${params}`);
      const data = await res.json();
      if (data.success) {
        const mapped: LiveStream[] = data.data.streams.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          userId: s.userId as string,
          streamerName: (s.user as Record<string, unknown>)?.username as string || 'Unknown',
          streamerAvatar: ((s.user as Record<string, unknown>)?.profilePic as string) || null,
          streamerIsCreator: (s.user as Record<string, unknown>)?.isCreator as boolean || false,
          streamTitle: s.title as string,
          category: s.category as string,
          viewers: s.viewers as number,
          thumbnail: (s.thumbnail as string) || null,
          isLive: s.isLive as boolean,
          startedAt: s.startedAt as string,
        }));
        setStreams(mapped);

        // Check if user has an active stream
        if (user) {
          const mine = mapped.find((st) => st.userId === user.id);
          setMyStream(mine || null);
        }
      }
    } catch (err) {
      console.error('Fetch streams error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, user]);

  useEffect(() => {
    fetchStreams();
    // Poll every 15 seconds for live updates
    const interval = setInterval(fetchStreams, 15000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  // Go Live handler
  const handleGoLive = async (title: string, category: string) => {
    if (!user || !token) return;
    setGoLiveLoading(true);
    try {
      const res = await fetch('/api/livestreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, category }),
      });
      const data = await res.json();
      if (data.success) {
        const s = data.data.stream;
        setMyStream({
          id: s.id,
          userId: s.userId,
          streamerName: s.user?.username || user.username,
          streamerAvatar: s.user?.profilePic || user.profilePic || null,
          streamerIsCreator: s.user?.isCreator || false,
          streamTitle: s.title,
          category: s.category,
          viewers: s.viewers,
          thumbnail: s.thumbnail || null,
          isLive: true,
          startedAt: s.startedAt,
        });
        setShowGoLive(false);
        fetchStreams();
      }
    } catch (err) {
      console.error('Go live error:', err);
    } finally {
      setGoLiveLoading(false);
    }
  };

  // End stream handler
  const handleEndStream = async () => {
    if (!myStream || !token) return;
    try {
      await fetch(`/api/livestreams/${myStream.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyStream(null);
      fetchStreams();
    } catch (err) {
      console.error('End stream error:', err);
    }
  };

  const totalViewers = streams.reduce((sum, s) => sum + s.viewers, 0);
  const filteredStreams = activeCategory === 'all'
    ? streams
    : streams.filter((s) => s.category === activeCategory);
  const featuredStream = streams.length > 0 ? [...streams].sort((a, b) => b.viewers - a.viewers)[0] : null;

  return (
    <div className="relative bg-mesh">
      <div className="relative z-10 px-4 pt-3 pb-2 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2 mb-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <h1 className="text-lg font-bold text-shimmer">Live Now</h1>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{formatViewers(totalViewers)} watching</span>
            </div>
          </div>
          {user && (
            <button
              onClick={() => {
                if (myStream) {
                  setViewingStream(myStream);
                } else {
                  setShowGoLive(true);
                }
              }}
              className="btn-primex flex items-center gap-1.5 text-xs px-3 py-1.5 shrink-0"
            >
              <Radio className="w-3.5 h-3.5" />
              {myStream ? 'View My Stream' : 'Go Live'}
            </button>
          )}
        </motion.div>

        {/* My active stream banner */}
        {myStream && (
          <MyStreamBanner stream={myStream} onEnd={handleEndStream} />
        )}

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-2"
        >
          <div className="tab-bar-premium inline-flex items-center gap-0.5 p-0.5 rounded-lg overflow-x-auto max-w-full no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primex text-white shadow-lg shadow-primex/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card-premium rounded-xl overflow-hidden">
                    <div className="aspect-video skeleton-pulse" />
                    <div className="p-2.5 space-y-2">
                      <div className="w-3/4 h-3 rounded skeleton-pulse" />
                      <div className="w-1/2 h-2.5 rounded skeleton-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : filteredStreams.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-4"
            >
              <div className="glass-card-premium rounded-xl p-6 text-center max-w-xs mx-auto">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <Radio className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-sm font-semibold mb-1">No one is live right now</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Check back soon or be the first to go live!
                </p>
                {user && (
                  <button
                    onClick={() => setShowGoLive(true)}
                    className="btn-primex text-xs px-4 py-2 flex items-center gap-1.5 mx-auto"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Go Live Now
                  </button>
                )}
                <button
                  onClick={() => setActiveCategory('all')}
                  className="btn-outline-primex text-xs mt-2"
                >
                  Browse All Categories
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Featured Stream */}
              {activeCategory === 'all' && featuredStream && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-primex" />
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Featured Stream</h2>
                  </div>
                  <FeaturedStream stream={featuredStream} onClick={() => setViewingStream(featuredStream)} />
                </div>
              )}

              {/* Stream Grid */}
              <div className="flex items-center gap-1.5 mb-2">
                <ChevronRight className="w-3.5 h-3.5 text-primex" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {activeCategory === 'all'
                    ? 'All Live Streams'
                    : `${CATEGORIES.find((c) => c.id === activeCategory)?.label} Streams`}
                </h2>
                <span className="text-[10px] text-muted-foreground/60 ml-0.5">
                  ({filteredStreams.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStreams.map((stream, i) => (
                  <StreamCard key={stream.id} stream={stream} index={i} onClick={() => setViewingStream(stream)} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Go Live Modal */}
      <AnimatePresence>
        {showGoLive && (
          <GoLiveModal
            onClose={() => setShowGoLive(false)}
            onGoLive={handleGoLive}
            loading={goLiveLoading}
          />
        )}
      </AnimatePresence>

      {/* Stream Viewer */}
      <AnimatePresence>
        {viewingStream && (
          <StreamViewer
            stream={viewingStream}
            onClose={() => setViewingStream(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
