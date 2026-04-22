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
    <div className="relative w-full h-full snap-start shrink-0 flex items-center justify-center bg-black">
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

      {/* Double-tap heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Heart className="w-24 h-24 text-red-500 fill-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <Heart
            className={`w-7 h-7 transition-colors ${
              liked ? 'text-red-500 fill-red-500' : 'text-white'
            }`}
          />
          <span className="text-white text-xs font-medium">{likeCount}</span>
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

      {/* Bottom caption */}
      <div className="absolute bottom-16 left-3 right-16">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={goToProfile} className="flex items-center gap-2">
            {reel.user.profilePic ? (
              <img
                src={reel.user.profilePic}
                alt={reel.user.username}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              <UserCircle className="w-9 h-9 text-white" />
            )}
            <span className="text-white font-semibold text-sm">@{reel.user.username}</span>
          </button>
        </div>
        {reel.caption && (
          <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
        )}
      </div>
    </div>
  );
}
