'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Trophy, Medal, TrendingUp, Eye, Heart, Film, Star,
} from 'lucide-react';

/* ── Types ────────────────────────────────────────────────── */
interface CreatorStats {
  id: string;
  username: string;
  avatar: string | null;
  isCreator: boolean;
  totalViews: number;
  totalLikes: number;
  contentCount: number;
  engagementRate: number;
}

type Period = 'week' | 'month' | 'all';

/* ── Helpers ──────────────────────────────────────────────── */
const formatNum = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

/* ── Mock Data ────────────────────────────────────────────── */
const generateMockCreators = (period: Period): CreatorStats[] => {
  const names = [
    'alexcreator', 'sarahmusic', 'mikegaming', 'emmavlog', 'davidtech',
    'lisaart', 'jamesfitness', 'oliviacook', 'noahfilms', 'miadesign',
    'ethanmusic', 'zoevlogs', 'liamtech', 'chloecraft', 'ryangaming',
  ];

  const multiplier = period === 'week' ? 1 : period === 'month' ? 3.5 : 12;

  return names.map((username, i) => ({
    id: `creator-${i}`,
    username,
    avatar: null,
    isCreator: i < 10,
    totalViews: Math.round((45_000 - i * 2_500 + Math.random() * 5_000) * multiplier),
    totalLikes: Math.round((12_000 - i * 600 + Math.random() * 2_000) * multiplier),
    contentCount: Math.round(80 - i * 4 + Math.random() * 10),
    engagementRate: parseFloat((8.5 - i * 0.35 + Math.random() * 0.5).toFixed(1)),
  })).sort((a, b) => b.totalViews - a.totalViews);
};

/* ── Podium Card ──────────────────────────────────────────── */
function PodiumCard({
  creator,
  rank,
  isFirst,
}: {
  creator: CreatorStats;
  rank: number;
  isFirst: boolean;
}) {
  const rankColors: Record<number, string> = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-orange-400 to-orange-600',
  };
  const rankBgs: Record<number, string> = {
    1: 'from-yellow-400/10 to-amber-500/5',
    2: 'from-gray-300/10 to-gray-400/5',
    3: 'from-orange-400/10 to-orange-600/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * (rank - 1), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center ${isFirst ? 'w-40 sm:w-48' : 'w-32 sm:w-40'}`}
    >
      {/* Avatar + Crown */}
      <div className="relative mb-2">
        {isFirst && (
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl z-10"
          >
            👑
          </motion.span>
        )}
        <div
          className={`rounded-full p-[3px] ${
            isFirst
              ? 'bg-gradient-to-tr from-yellow-400 via-primex to-primex-secondary glow-effect'
              : 'bg-gradient-to-tr ' + (rankColors[rank] || '')
          }`}
        >
          <Avatar
            className={`border-2 border-background ${
              isFirst ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16 sm:w-20 sm:h-20'
            }`}
          >
            <AvatarImage src={creator.avatar || ''} />
            <AvatarFallback
              className={`text-lg font-bold ${
                isFirst ? 'bg-yellow-400/20 text-yellow-300' : 'bg-primex/20 text-primex'
              }`}
            >
              {creator.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        {creator.isCreator && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-background">
            <Star className="w-3 h-3 text-black fill-black" />
          </div>
        )}
      </div>

      {/* Card */}
      <div
        className={`glass-card rounded-xl p-3 sm:p-4 w-full text-center ${
          isFirst ? 'gradient-border-primex' : ''
        } ${isFirst ? 'glow-effect' : ''}`}
        style={{
          background: isFirst
            ? undefined
            : `linear-gradient(135deg, var(--tw-gradient-stops))`,
        }}
      >
        {/* Rank Badge */}
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mb-2 bg-gradient-to-r ${
            rankColors[rank] || 'from-primex to-primex-secondary'
          } text-black`}
        >
          {rank === 1 ? <Trophy className="w-3 h-3" /> : <Medal className="w-3 h-3" />}
          #{rank}
        </div>

        <p className="font-semibold text-sm truncate mb-1">@{creator.username}</p>

        <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatNum(creator.totalViews)}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-primex" />
            {formatNum(creator.totalLikes)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Rank Row (4-20) ─────────────────────────────────────── */
function RankRow({ creator, rank, index }: { creator: CreatorStats; rank: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:bg-white/5 transition-all group cursor-pointer hover-lift card-shine"
    >
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        <span className="text-sm font-bold text-muted-foreground">{rank}</span>
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={creator.avatar || ''} />
          <AvatarFallback className="bg-primex/20 text-primex text-sm font-bold">
            {creator.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {creator.isCreator && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center border border-background">
            <Star className="w-2.5 h-2.5 text-black fill-black" />
          </div>
        )}
      </div>

      {/* Username */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate group-hover:text-primex transition-colors">
          @{creator.username}
        </p>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Film className="w-3 h-3" />
          {creator.contentCount} videos
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span>{formatNum(creator.totalViews)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-primex" />
          <span>{formatNum(creator.totalLikes)}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">{creator.engagementRate}%</span>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="sm:hidden flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-0.5">
          <Eye className="w-3 h-3" />
          {formatNum(creator.totalViews)}
        </div>
        <div className="flex items-center gap-0.5">
          <Heart className="w-3 h-3 text-primex" />
          {formatNum(creator.totalLikes)}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export default function CreatorLeaderboard() {
  const [period, setPeriod] = useState<Period>('week');
  const [creators, setCreators] = useState<CreatorStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCreators(generateMockCreators(period));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [period]);

  const top3 = creators.slice(0, 3);
  const rest = creators.slice(3);

  const periods: { key: Period; label: string }[] = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold primex-gradient-text flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primex" />
            Creator Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Top performing creators this week
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1.5 glass-card rounded-xl p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p.key
                  ? 'primex-gradient text-white glow-effect shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        /* Loading skeleton */
        <div className="space-y-6">
          <div className="flex items-end justify-center gap-3 sm:gap-4 py-8">
            {[2, 1, 3].map((rank) => (
              <div key={rank} className="flex flex-col items-center" style={{ width: rank === 1 ? 180 : 140 }}>
                <Skeleton className={`rounded-full ${rank === 1 ? 'w-24 h-24' : 'w-20 h-20'} mb-2`} />
                <Skeleton className="h-36 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-3">
                <Skeleton className="w-8 h-5 rounded" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-3 sm:gap-4 mb-8 pt-4">
                {/* 2nd Place (left) */}
                <div className="pt-6">
                  <PodiumCard creator={top3[1]} rank={2} isFirst={false} />
                </div>

                {/* 1st Place (center, tallest) */}
                <PodiumCard creator={top3[0]} rank={1} isFirst={true} />

                {/* 3rd Place (right) */}
                <div className="pt-6">
                  <PodiumCard creator={top3[2]} rank={3} isFirst={false} />
                </div>
              </div>
            )}

            {/* Remaining Rankings */}
            {rest.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primex" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Rankings
                  </h3>
                </div>
                {rest.map((creator, i) => (
                  <RankRow key={creator.id} creator={creator} rank={i + 4} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
