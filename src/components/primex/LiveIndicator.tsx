'use client';

import { motion } from 'framer-motion';
import { Eye, Radio } from 'lucide-react';

interface LiveIndicatorProps {
  /** Number of viewers (mock data) */
  viewerCount?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show viewer count */
  showViewers?: boolean;
}

function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function LiveIndicator({
  viewerCount = 0,
  size = 'md',
  showViewers = true,
}: LiveIndicatorProps) {
  const sizeMap = {
    sm: { dot: 'w-2 h-2', text: 'text-[9px]', gap: 'gap-1', px: 'px-1.5 py-0.5', ring: 'w-5 h-5' },
    md: { dot: 'w-2.5 h-2.5', text: 'text-[10px]', gap: 'gap-1.5', px: 'px-2 py-1', ring: 'w-7 h-7' },
    lg: { dot: 'w-3 h-3', text: 'text-xs', gap: 'gap-2', px: 'px-3 py-1.5', ring: 'w-9 h-9' },
  };

  const s = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${s.gap}`}>
      {/* Live Badge */}
      <div className={`relative inline-flex items-center ${s.px} rounded-full bg-gradient-to-r from-red-600 to-red-500 ${s.gap} shadow-lg shadow-red-500/30`}>
        {/* Breathing ring */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className={`absolute ${s.ring} rounded-full bg-red-500/40`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Pulsing red dot */}
          <motion.div
            className={`${s.dot} rounded-full bg-white`}
            animate={{
              opacity: [1, 0.6, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        <span className={`${s.text} font-bold text-white uppercase tracking-wider`}>Live</span>
      </div>

      {/* Viewer Count */}
      {showViewers && viewerCount > 0 && (
        <div className={`inline-flex items-center ${s.gap} ${s.px} rounded-full bg-black/50 backdrop-blur-sm text-white ${s.text}`}>
          <Eye className={`${size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
          <span className="font-medium">{formatViewerCount(viewerCount)}</span>
        </div>
      )}
    </div>
  );
}

/**
 * LiveStreamCard - A card component for displaying a live stream
 * Used in ExplorePage "Live Now" section and StoriesBar
 */
export function LiveStreamCard({
  username,
  title,
  viewerCount,
  avatar,
  onClick,
}: {
  username: string;
  title: string;
  viewerCount: number;
  avatar?: string | null;
  onClick?: () => void;
}) {
  const initial = username?.[0]?.toUpperCase() || 'U';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card-premium rounded-xl overflow-hidden cursor-pointer hover-lift card-shine relative group"
      onClick={onClick}
    >
      {/* Gradient background simulating live content */}
      <div className="relative aspect-video bg-gradient-to-br from-red-900/40 via-red-800/30 to-orange-900/40 overflow-hidden">
        {/* Animated noise */}
        <div className="absolute inset-0 bg-noise opacity-20" />

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Radio className="w-6 h-6 text-red-400" />
          </motion.div>
          <p className="text-xs text-white/60">Live Stream</p>
        </div>

        {/* Live indicator at top-left */}
        <div className="absolute top-2 left-2 z-10">
          <LiveIndicator viewerCount={viewerCount} size="sm" />
        </div>

        {/* Viewer count at top-right */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px]">
          <Eye className="w-2.5 h-2.5" />
          {formatViewerCount(viewerCount)}
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Username overlay */}
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="text-xs font-medium text-white truncate">@{username}</p>
        </div>
      </div>

      {/* Info section */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full primex-gradient flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate group-hover:text-primex transition-colors">{title}</p>
            <p className="text-[10px] text-muted-foreground">{username}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
