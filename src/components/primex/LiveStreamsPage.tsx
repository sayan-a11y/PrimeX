'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Eye, Users, Gamepad2, Music, Mic2, Palette, MapPin, Headphones,
  Video, ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/* ── Types ─────────────────────────────────────────────────── */
interface LiveStream {
  id: string;
  streamerName: string;
  streamerAvatar: string;
  streamTitle: string;
  category: string;
  viewers: number;
  thumbnail: string;
  startedAt: string;
}

/* ── Categories & Streams Data ─────────────────────────────── */
const CATEGORIES = [
  { id: 'all', label: 'All', icon: Radio },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'talk', label: 'Talk Shows', icon: Mic2 },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'irl', label: 'IRL', icon: MapPin },
  { id: 'asmr', label: 'ASMR', icon: Headphones },
];

const STREAMS: LiveStream[] = [];

/* ── Helpers ───────────────────────────────────────────────── */
function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
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
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold uppercase tracking-wider">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
      </span>
      LIVE
    </span>
  );
}

/* ── Featured Stream Hero ──────────────────────────────────── */
function FeaturedStream({ stream }: { stream: LiveStream }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden glass-card-premium hover-lift card-shine cursor-pointer group"
    >
      {/* Thumbnail / Gradient Background */}
      <div className={`relative aspect-[21/9] bg-gradient-to-br ${getGradientForStream(0)}`}>
        {/* Red shimmer border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-red-500/40 animate-pulse" />

        {/* Video overlay gradient */}
        <div className="video-overlay-gradient absolute inset-0" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="flex items-center gap-3 mb-3">
            <LiveBadge />
            <span className="flex items-center gap-1 text-white/90 text-sm">
              <Eye className="w-4 h-4" />
              {formatViewers(stream.viewers)}
            </span>
            <span className="text-white/60 text-xs">{stream.startedAt}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2">
            {stream.streamTitle}
          </h2>
          <div className="flex items-center gap-2">
            <div className="gradient-border-primex rounded-full p-0.5">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primex/20 text-primex font-bold text-sm">
                  {stream.streamerName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-white font-medium text-sm">{stream.streamerName}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getCategoryColor(stream.category)}`}>
                {CATEGORIES.find((c) => c.id === stream.category)?.label || stream.category}
              </span>
            </div>
          </div>
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Stream Card ───────────────────────────────────────────── */
function StreamCard({ stream, index }: { stream: LiveStream; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass-card-premium rounded-xl overflow-hidden hover-lift card-shine cursor-pointer group relative"
    >
      {/* Red shimmer border effect */}
      <div className="absolute inset-0 rounded-xl border border-red-500/20 group-hover:border-red-500/40 transition-colors pointer-events-none z-10" />

      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradientForStream(index)}`} />
        <div className="video-overlay-gradient absolute inset-0" />

        {/* LIVE badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <LiveBadge />
        </div>

        {/* Viewer count */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs">
          <Eye className="w-3 h-3" />
          {formatViewers(stream.viewers)}
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex gap-2">
          {/* Avatar */}
          <div className="gradient-border-primex rounded-full p-0.5 shrink-0">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primex/20 text-primex font-bold text-xs">
                {stream.streamerName[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-foreground truncate">{stream.streamerName}</p>
            <p className="text-xs text-foreground/80 line-clamp-2 mt-0.5 leading-relaxed">{stream.streamTitle}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getCategoryColor(stream.category)}`}>
                {CATEGORIES.find((c) => c.id === stream.category)?.label || stream.category}
              </span>
              <span className="text-[10px] text-muted-foreground">{stream.startedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main LiveStreamsPage ──────────────────────────────────── */
export default function LiveStreamsPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredStreams = activeCategory === 'all'
    ? STREAMS
    : STREAMS.filter((s) => s.category === activeCategory);

  const totalViewers = STREAMS.reduce((sum, s) => sum + s.viewers, 0);
  const featuredStream = STREAMS.length > 0 ? [...STREAMS].sort((a, b) => b.viewers - a.viewers)[0] : null;

  return (
    <div className="relative min-h-screen bg-mesh">
      {/* Decorative orbs */}
      <div className="orb-primex-sm top-20 left-10 float-slow" />
      <div className="orb-primex-sm bottom-40 right-20 float-slow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-shimmer">Live Now</h1>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{formatViewers(totalViewers)} watching</span>
            </div>
          </div>
          <button className="btn-primex flex items-center gap-2 text-sm">
            <Radio className="w-4 h-4" />
            Go Live
          </button>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="tab-bar-premium inline-flex items-center gap-1 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primex text-white shadow-lg shadow-primex/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filteredStreams.length === 0 ? (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="empty-state-premium"
            >
              <div className="glass-card-premium rounded-2xl p-4 text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <Radio className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No one is live right now</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Check back soon or be the first to go live!
                </p>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="btn-outline-primex text-sm"
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
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-primex" />
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Featured Stream</h2>
                  </div>
                  <FeaturedStream stream={featuredStream} />
                </div>
              )}

              {/* Stream Grid */}
              <div className="flex items-center gap-2 mb-3">
                <ChevronRight className="w-4 h-4 text-primex" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {activeCategory === 'all'
                    ? 'All Live Streams'
                    : `${CATEGORIES.find((c) => c.id === activeCategory)?.label} Streams`}
                </h2>
                <span className="text-xs text-muted-foreground/60 ml-1">
                  ({filteredStreams.length})
                </span>
              </div>
              <div className="content-grid">
                {filteredStreams.map((stream, i) => (
                  <StreamCard key={stream.id} stream={stream} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
