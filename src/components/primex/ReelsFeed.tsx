'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, Share2, MessageCircle, MoreVertical, 
  Camera, Music, Send, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
    profilePic: string | null;
  };
}

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

function CommentSection({ reelId, token, onCommentAdded }: { reelId: string; token: string | null; onCommentAdded: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?reelId=${reelId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data.comments);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [reelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment, reelId }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [data.data, ...prev]);
        setNewComment('');
        onCommentAdded();
      }
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-[70vh] bg-zinc-900 rounded-t-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5 premium-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner-primex" /></div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <div className="p-4 rounded-full bg-zinc-800/50">
              <MessageSquare className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-sm font-medium">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Avatar className="w-8 h-8 shrink-0 border border-white/10">
                <AvatarImage src={comment.user.profilePic || ''} />
                <AvatarFallback className="bg-zinc-800 text-[10px] text-white">
                  {comment.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-xs">@{comment.user.username}</span>
                  <span className="text-zinc-500 text-[10px]">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Field */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-full pl-4 pr-12 py-2.5 text-sm text-white focus:ring-1 focus:ring-primex focus:border-primex outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-primex hover:scale-110 disabled:opacity-30 disabled:scale-100 transition-all"
            >
              <Send className={`w-4 h-4 ${submitting ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReelsFeed() {
  const { token, setCurrentView, user } = useAppStore();
  const [reels, setReels] = useState<(Reel & { commentCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastTapRef = useRef(0);

  const fetchReels = async () => {
    try {
      const res = await fetch('/api/reels?limit=20');
      const data = await res.json();
      if (data.success) {
        // Fetch comment counts for each reel
        const reelsWithCounts = await Promise.all((data.data.reels || data.data || []).map(async (r: Reel) => {
          const cRes = await fetch(`/api/comments?reelId=${r.id}&limit=1`);
          const cData = await cRes.json();
          return { ...r, commentCount: cData.data?.total || 0 };
        }));
        setReels(reelsWithCounts);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // Handle Autoplay and Sound
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === currentIndex) {
          video.muted = false;
          video.volume = 1;
          if (hasInteracted) {
            video.play().catch(() => {
              video.muted = true;
              video.play();
            });
          }
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex, reels, hasInteracted]);

  const handleInteraction = () => {
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleLike = async (reelId: string) => {
    if (!token) return;
    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;
    
    const isUnliking = !!reel.liked;
    
    setReels(prev => prev.map(r =>
      r.id === reelId ? { ...r, likes: isUnliking ? r.likes - 1 : r.likes + 1, liked: !isUnliking } : r
    ));

    try {
      await fetch(`/api/reels/${reelId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setReels(prev => prev.map(r =>
        r.id === reelId ? { ...r, likes: isUnliking ? r.likes + 1 : r.likes - 1, liked: isUnliking } : r
      ));
    }
  };

  const handleDoubleTap = (reelId: string) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      const reel = reels.find(r => r.id === reelId);
      if (reel && !reel.liked) {
        handleLike(reelId);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTapRef.current = now;
    handleInteraction();
  };

  const handleShare = async (reel: Reel) => {
    const url = `${window.location.origin}/reels?id=${reel.id}`;
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `Check out ${reel.user.username}'s reel on PrimeX`,
          url: url,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
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
    return <div className="flex items-center justify-center h-full bg-black"><div className="spinner-primex-lg" /></div>;
  }

  return (
    <div className="h-full w-full bg-black flex justify-center select-none" onClick={handleInteraction}>
      <div className="h-full w-full max-w-[420px] md:max-w-[500px] relative bg-black shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-5 z-50 pointer-events-none">
          <span className="text-white text-xl font-bold drop-shadow-lg pointer-events-auto">Reels</span>
          <Camera className="text-white w-6 h-6 drop-shadow-lg pointer-events-auto cursor-pointer" />
        </div>

        <div 
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
          onScroll={handleScroll}
        >
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className="h-full w-full snap-center relative flex items-center justify-center bg-black overflow-hidden"
              onClick={() => handleDoubleTap(reel.id)}
            >
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={reel.videoUrl}
              className="w-full h-full object-cover pointer-events-none"
              loop
              playsInline
              preload="auto"
            />

            <AnimatePresence>
              {showHeart && index === currentIndex && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                  <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right Actions */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-7 z-40">
              <div className="flex flex-col items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.7 }}
                  onClick={(e) => { e.stopPropagation(); handleLike(reel.id); }}
                  className="p-1 drop-shadow-md"
                >
                  <Heart className={`w-8 h-8 ${reel.liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </motion.button>
                <span className="text-white text-[13px] font-bold drop-shadow-md">{reel.likes}</span>
              </div>

              <Drawer>
                <DrawerTrigger asChild>
                  <div className="flex flex-col items-center gap-1.5 cursor-pointer drop-shadow-md" onClick={(e) => e.stopPropagation()}>
                    <MessageCircle className="w-8 h-8 text-white" />
                    <span className="text-white text-[13px] font-bold">{reel.commentCount || 0}</span>
                  </div>
                </DrawerTrigger>
                <DrawerContent className="bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden md:max-w-[400px] md:mx-auto md:rounded-t-2xl">
                  <DrawerHeader className="border-b border-zinc-800/50 py-3">
                    <DrawerTitle className="text-white text-center text-sm font-bold">Comments</DrawerTitle>
                  </DrawerHeader>
                  <CommentSection 
                    reelId={reel.id} 
                    token={token} 
                    onCommentAdded={() => {
                      setReels(prev => prev.map(r => r.id === reel.id ? { ...r, commentCount: (r.commentCount || 0) + 1 } : r));
                    }}
                  />
                </DrawerContent>
              </Drawer>

              <div className="flex flex-col items-center gap-1.5 cursor-pointer drop-shadow-md" onClick={(e) => { e.stopPropagation(); handleShare(reel); }}>
                <Send className="w-7 h-7 text-white -rotate-12" />
                <span className="text-white text-[11px] font-bold">Share</span>
              </div>

              <div className="p-1 cursor-pointer drop-shadow-md" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Info Section */}
            <div className="absolute bottom-6 left-4 right-16 z-40 pointer-events-none flex flex-col gap-3">
              <div className="flex flex-col gap-2.5 pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="cursor-pointer flex items-center gap-2.5" onClick={(e) => { e.stopPropagation(); setCurrentView('profile'); }}>
                    <Avatar className="w-9 h-9 border border-white/30">
                      <AvatarImage src={reel.user?.profilePic || ''} />
                      <AvatarFallback className="bg-zinc-800 text-white font-bold">{reel.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-white font-bold text-sm drop-shadow-md">{reel.user?.username}</span>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-md border border-white/60 text-white text-[11px] font-bold hover:bg-white/10 transition-all active:scale-95 drop-shadow-md">Follow</button>
                </div>
                {reel.caption && <p className="text-white text-[13px] line-clamp-2 max-w-[280px] drop-shadow-md font-medium leading-relaxed">{reel.caption}</p>}
                <div className="flex items-center gap-2">
                  <div className="bg-white/15 backdrop-blur-lg px-3 py-1.5 rounded-full flex items-center gap-2.5 max-w-[180px] border border-white/10">
                    <Music className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span className="text-white text-[11px] font-bold truncate tracking-wide">Original Audio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}


