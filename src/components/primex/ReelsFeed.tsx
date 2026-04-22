'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Share2, MessageCircle, MoreVertical, X, Play, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reel {
  id: string;
  videoUrl: string;
  thumbnail: string | null;
  caption: string | null;
  likes: number;
  shares: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    profilePic: string | null;
  };
  liked?: boolean;
}

export default function ReelsFeed() {
  const { token } = useAppStore();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doubleTapLike, setDoubleTapLike] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastTapRef = useRef(0);

  const fetchReels = async () => {
    try {
      const res = await fetch('/api/reels?limit=20');
      const data = await res.json();
      if (data.success) {
        setReels(data.data.reels || data.data || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // Auto-play current video
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === currentIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex, reels]);

  const handleLike = async (reelId: string) => {
    if (!token) return;
    try {
      await fetch(`/api/reels/${reelId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setReels(prev => prev.map(r =>
        r.id === reelId ? { ...r, likes: r.likes + 1, liked: true } : r
      ));
    } catch {}
  };

  const handleDoubleTap = (reelId: string) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setDoubleTapLike(true);
      handleLike(reelId);
      setTimeout(() => setDoubleTapLike(false), 1000);
    }
    lastTapRef.current = now;
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, reels.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primex/30 border-t-primex rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="w-20 h-20 mb-4 rounded-2xl glass-card flex items-center justify-center">
          <Play className="w-8 h-8 text-primex" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Reels Yet</h3>
        <p className="text-muted-foreground text-sm">Be the first to create a reel!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      onScroll={handleScroll}
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className="h-full w-full snap-center relative flex items-center justify-center bg-black"
          onClick={() => handleDoubleTap(reel.id)}
        >
          {/* Video */}
          <video
            ref={(el) => { videoRefs.current[index] = el; }}
            src={reel.videoUrl}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
          />

          {/* Double-tap heart animation */}
          <AnimatePresence>
            {doubleTapLike && index === currentIndex && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-24 h-24 text-red-500 fill-red-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gradient overlay bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          {/* Right side actions */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-11 h-11 border-2 border-white">
                <AvatarImage src={reel.user?.profilePic || ''} />
                <AvatarFallback className="bg-primex/30 text-white text-sm">
                  {reel.user?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Like */}
            <button
              className="flex flex-col items-center gap-1"
              onClick={(e) => { e.stopPropagation(); handleLike(reel.id); }}
            >
              <Heart className={`w-7 h-7 ${reel.liked ? 'text-red-500 fill-red-500' : 'text-white'} drop-shadow-lg`} />
              <span className="text-white text-xs font-medium drop-shadow">{reel.likes}</span>
            </button>

            {/* Share */}
            <button className="flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Share2 className="w-7 h-7 text-white drop-shadow-lg" />
              <span className="text-white text-xs font-medium drop-shadow">{reel.shares}</span>
            </button>

            {/* More */}
            <button className="flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="w-7 h-7 text-white drop-shadow-lg" />
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-16 left-4 right-16 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-medium text-sm drop-shadow">
                @{reel.user?.username || 'unknown'}
              </span>
            </div>
            {reel.caption && (
              <p className="text-white/90 text-sm line-clamp-2 drop-shadow">{reel.caption}</p>
            )}
          </div>

          {/* Play/Pause indicator */}
          {index === currentIndex && (
            <div className="absolute top-4 right-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
