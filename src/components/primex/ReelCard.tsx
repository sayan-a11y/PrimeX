'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, UserCircle, MessageCircle, Play } from 'lucide-react';
import { useAppStore } from '@/store';
import { toast } from '@/hooks/use-toast';

interface ReelCardProps {
  reel: {
    id: string;
    videoUrl: string;
    caption: string | null;
    likes: number;
    shares: number;
    createdAt: string;
    user: {
      id: string;
      username: string;
      profilePic: string | null;
      isCreator: boolean;
    };
  };
  isActive: boolean;
}

export default function ReelCard({ reel, isActive }: ReelCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const [showHeart, setShowHeart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const token = useAppStore((s) => s.token);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      await fetch(`/api/reels/${reel.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Revert on error
      setLiked(liked);
      setLikeCount(likeCount);
    }
  };

  const handleShare = async () => {
    try {
      await fetch(`/api/reels/${reel.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Shared!', description: 'Reel shared successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to share', variant: 'destructive' });
    }
  };

  const goToProfile = () => {
    setCurrentView('profile');
  };

  return (
    <div className="relative w-full h-full snap-start shrink-0 flex items-center justify-center bg-black card-shine">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        onClick={handleDoubleTap}
      />

      {/* Play button when paused */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play className="w-16 h-16 text-white/50 fill-white/50" />
        </div>
      )}

      {/* Double-tap heart animation with like-heart-burst */}
      <AnimatePresence>
        {showHeart && (
          <div className="like-heart-burst absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
          </div>
        )}
      </AnimatePresence>

      {/* Gradient overlays with video-overlay-gradient */}
      <div className="video-overlay-gradient" />

      {/* Right sidebar actions with reel-actions-float */}
      <div className="reel-actions-float">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <Heart
            className={`w-7 h-7 transition-all duration-200 ${
              liked ? 'text-red-500 fill-red-500 scale-110' : 'text-white'
            }`}
          />
          <span className={`text-white text-xs font-medium ${liked ? 'badge-pulse' : ''}`}>
            {likeCount}
          </span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <Share2 className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-medium">{reel.shares}</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-medium">0</span>
        </button>
      </div>

      {/* Bottom caption with glass-card creator info */}
      <div className="absolute bottom-16 left-3 right-16">
        <div className="glass-card p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={goToProfile} className="flex items-center gap-2">
              {reel.user.profilePic ? (
                <img
                  src={reel.user.profilePic}
                  alt={reel.user.username}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30 group-hover:gradient-border-glow transition-all duration-300"
                />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:ring-2 hover:ring-primex/40 transition-all duration-300">
                  <UserCircle className="w-9 h-9 text-white" />
                </div>
              )}
              <span className="text-white font-semibold text-sm">@{reel.user.username}</span>
            </button>
            {reel.user.isCreator && (
              <span className="tag-primex text-[10px] px-1.5 py-0">Creator</span>
            )}
          </div>
          {reel.caption && (
            <p className="text-white/90 text-sm line-clamp-2">{reel.caption}</p>
          )}
        </div>
      </div>

      {/* Hover gradient-border-glow ring effect */}
      <div className="absolute inset-0 rounded-none pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 gradient-border-glow" />
    </div>
  );
}
