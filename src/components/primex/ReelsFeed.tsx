'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Share2, MessageCircle, MoreVertical, X, Play, Eye, Film } from 'lucide-react';
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
  const { token, setCurrentView } = useAppStore();
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
        <div className="spinner-primex-lg" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="w-20 h-20 mb-4 rounded-2xl glass-card-premium flex items-center justify-center hover-lift">
          <Film className="w-8 h-8 text-primex" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Reels Yet</h3>
        <p className="text-muted-foreground text-sm mb-4">Be the first to create a reel!</p>
        <button
          className="btn-primex rounded-xl gap-2 hover-lift px-6 py-2.5 text-sm font-medium"
          onClick={() => setCurrentView('upload')}
        >
          <Film className="w-4 h-4" /> Create Reel
        </button>
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

          {/* Gradient overlay top + bottom */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 video-overlay-gradient pointer-events-none" />

          {/* Right side actions */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 reel-actions-float">
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
              className="flex flex-col items-center gap-1 group"
              onClick={(e) => { e.stopPropagation(); handleLike(reel.id); }}
            >
              <div className={`p-2 rounded-full transition-all ${reel.liked ? 'bg-red-500/20' : 'bg-black/20 group-hover:bg-black/40'}`}>
                <Heart className={`w-6 h-6 transition-transform group-hover:scale-110 ${reel.liked ? 'text-red-500 fill-red-500 like-heart-burst' : 'text-white'} drop-shadow-lg`} />
              </div>
              <span className="text-white text-xs font-medium drop-shadow badge-pulse">{reel.likes}</span>
            </button>

            {/* Comment */}
            <button className="flex flex-col items-center gap-1 group" onClick={(e) => e.stopPropagation()}>
              <div className="p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-all">
                <MessageCircle className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow">0</span>
            </button>

            {/* Share */}
            <button className="flex flex-col items-center gap-1 group" onClick={(e) => e.stopPropagation()}>
              <div className="p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-all">
                <Share2 className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow">{reel.shares}</span>
            </button>

            {/* More */}
            <button className="flex flex-col items-center gap-1 group" onClick={(e) => e.stopPropagation()}>
              <div className="p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-all">
                <MoreVertical className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-16 left-4 right-16">
            <div className="glass-card-premium p-3 rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1.5">
                <Avatar className="w-7 h-7 border border-white/30">
                  <AvatarImage src={reel.user?.profilePic || ''} />
                  <AvatarFallback className="bg-primex/30 text-white text-[10px]">
                    {reel.user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-sm drop-shadow">
                  @{reel.user?.username || 'unknown'}
                </span>
              </div>
              {reel.caption && (
                <p className="text-white/90 text-sm line-clamp-2 drop-shadow">{reel.caption}</p>
              )}
            </div>
          </div>

          {/* Live indicator */}
          {index === currentIndex && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/80 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-bold">LIVE</span>
              </div>
            </div>
          )
        </div>
      ))}
    </div>
  );
}
