'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Heart, Share2, MessageCircle, MoreVertical, Camera, Music, Play, UserPlus, Send, X, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
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
  comments?: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    profilePic: string | null;
  };
  liked?: boolean;
}

export default function ReelsFeed() {
  const { token, user: currentUser } = useAppStore();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHeartReelId, setShowHeartReelId] = useState<string | null>(null);
  
  // Comment System States
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [fetchingComments, setFetchingComments] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastTapRef = useRef<{ time: number; reelId: string | null }>({ time: 0, reelId: null });
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch comments for current reel
  const fetchComments = async (reelId: string) => {
    setFetchingComments(true);
    try {
      const res = await fetch(`/api/comments?reelId=${reelId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data.comments || []);
      }
    } catch {}
    setFetchingComments(false);
  };

  useEffect(() => {
    if (showComments && reels[currentIndex]) {
      fetchComments(reels[currentIndex].id);
    } else {
      setComments([]);
    }
  }, [showComments, currentIndex, reels]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token || !reels[currentIndex]) return;

    const reelId = reels[currentIndex].id;
    const content = newComment.trim();
    setNewComment('');

    // Optimistic UI
    const tempComment: Comment = {
      id: Math.random().toString(),
      content,
      createdAt: new Date().toISOString(),
      user: {
        id: currentUser?.id || '',
        username: currentUser?.username || 'You',
        profilePic: currentUser?.profilePic || null,
      }
    };
    setComments(prev => [tempComment, ...prev]);
    
    // Update count in reels state
    setReels(prev => prev.map(r => 
      r.id === reelId ? { ...r, comments: (r.comments || 0) + 1 } : r
    ));

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reelId, content }),
      });
    } catch {
      // Revert if failed (simple version)
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
    }
  };

  // Handle interaction to enable sound
  const enableSound = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (videoRefs.current[currentIndex]) {
        videoRefs.current[currentIndex]!.muted = false;
        videoRefs.current[currentIndex]!.volume = 1;
        videoRefs.current[currentIndex]!.play().catch(() => {});
      }
    }
  };

  // Auto-play current video and sync sound state
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === currentIndex) {
          video.muted = !hasInteracted;
          video.volume = 1;
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex, reels, hasInteracted]);

  const handleLike = async (reelId: string, isDoubleTap = false) => {
    if (!token) return;
    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    if (isDoubleTap && reel.liked) {
      setShowHeartReelId(reelId);
      setTimeout(() => setShowHeartReelId(null), 800);
      return;
    }

    setReels(prev => prev.map(r =>
      r.id === reelId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
    ));

    if (isDoubleTap) {
      setShowHeartReelId(reelId);
      setTimeout(() => setShowHeartReelId(null), 800);
    }

    try {
      await fetch(`/api/reels/${reelId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setReels(prev => prev.map(r =>
        r.id === reelId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
      ));
    }
  };

  const handleVideoInteraction = (reelId: string) => {
    if (showComments) return; // Ignore video taps when comments are open
    enableSound();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current.reelId === reelId && now - lastTapRef.current.time < DOUBLE_TAP_DELAY) {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      handleLike(reelId, true);
      lastTapRef.current = { time: 0, reelId: null };
    } else {
      lastTapRef.current = { time: now, reelId: reelId };
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = setTimeout(() => {
        const video = videoRefs.current[currentIndex];
        if (video) {
          if (video.paused) video.play();
          else video.pause();
        }
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleShare = async (reel: Reel) => {
    const shareData = {
      title: 'PrimeX Reel',
      text: reel.caption || 'Check out this reel on PrimeX',
      url: window.location.origin + `/reels/${reel.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
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

  const formatTime = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="w-10 h-10 border-4 border-primex/30 border-t-primex rounded-full animate-spin shadow-[0_0_15px_#ff2e2e]" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative flex justify-center items-center">
      <div className="h-full w-full max-w-[420px] md:max-w-[500px] bg-black relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        {/* TOP BAR */}
        <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 pt-8 pb-4 pointer-events-none">
           <h2 className="text-xl font-bold text-white drop-shadow-lg pointer-events-auto cursor-pointer">Reels</h2>
           <button className="p-2 text-white pointer-events-auto hover:bg-white/10 rounded-full transition-all">
              <Camera size={24} />
           </button>
        </div>

        {/* REELS CONTAINER */}
        <div
          ref={containerRef}
          className={`h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth ${showComments ? 'pointer-events-none' : ''}`}
          onScroll={handleScroll}
        >
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className="h-screen w-full snap-center relative flex items-center justify-center bg-black overflow-hidden"
              onClick={() => handleVideoInteraction(reel.id)}
            >
              {/* VIDEO */}
              <video
                ref={(el) => { videoRefs.current[index] = el; }}
                src={reel.videoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
              />

              {/* CENTER HEART ANIMATION */}
              <AnimatePresence>
                {showHeartReelId === reel.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                  >
                    <Heart size={120} className="text-[#ff2e2e] fill-[#ff2e2e] drop-shadow-[0_0_30px_#ff2e2e]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* RIGHT SIDE ACTIONS */}
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30">
                 <div className="flex flex-col items-center gap-1.5">
                    <motion.button 
                      whileTap={{ scale: 0.7 }}
                      onClick={(e) => { e.stopPropagation(); handleLike(reel.id); }}
                      className="p-2 group"
                    >
                       <Heart 
                         size={32} 
                         className={`transition-all duration-300 ${reel.liked ? 'text-[#ff2e2e] fill-[#ff2e2e] drop-shadow-[0_0_10px_#ff2e2e]' : 'text-white'}`} 
                       />
                    </motion.button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{reel.likes}</span>
                 </div>

                 <div className="flex flex-col items-center gap-1.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                      className="p-2"
                    >
                       <MessageCircle size={32} className="text-white drop-shadow-lg" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{reel.comments || 0}</span>
                 </div>

                 <button onClick={(e) => { e.stopPropagation(); handleShare(reel); }} className="p-2">
                    <Send size={32} className="text-white drop-shadow-lg" />
                 </button>

                 <button className="p-2">
                    <MoreVertical size={28} className="text-white drop-shadow-lg" />
                 </button>
              </div>

              {/* BOTTOM LEFT INFO */}
              <div className="absolute bottom-10 left-4 right-16 z-30 flex flex-col gap-4 pointer-events-none">
                 <div className="flex items-center gap-3 pointer-events-auto">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-xl">
                       <AvatarImage src={reel.user?.profilePic || ''} />
                       <AvatarFallback className="bg-primex/20 text-white font-bold">
                          {reel.user?.username?.[0]?.toUpperCase()}
                       </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                       <span className="text-white font-bold text-sm drop-shadow-lg">@{reel.user?.username}</span>
                       <button className="px-3 py-1 border border-white/40 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all">Follow</button>
                    </div>
                 </div>

                 <div className="max-w-[85%] pointer-events-auto">
                    {reel.caption && (
                       <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-md mb-2">{reel.caption}</p>
                    )}
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-black/20 backdrop-blur-md rounded-full">
                          <Music size={12} className="text-white" />
                       </div>
                       <div className="overflow-hidden w-full">
                          <p className="text-white text-[11px] font-bold animate-scroll whitespace-nowrap">Original Audio • {reel.user?.username}</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* COMMENTS MODAL (FULL WORKING SYSTEM) */}
        <AnimatePresence>
           {showComments && (
             <motion.div 
               initial={{ y: '100%' }}
               animate={{ y: 0 }}
               exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
               className="absolute inset-0 z-50 flex flex-col"
             >
                <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowComments(false)} />
                <div className="bg-[#0b0b0f] rounded-t-[32px] h-[75%] border-t border-white/10 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.8)] relative">
                   
                   {/* Handle Indicator */}
                   <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3 mb-1 cursor-pointer" onClick={() => setShowComments(false)} />
                   
                   {/* Header */}
                   <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-2">
                         <h3 className="text-white font-bold text-lg">Comments</h3>
                         <span className="text-white/40 text-sm font-medium">{reels[currentIndex]?.comments || 0}</span>
                      </div>
                      <button onClick={() => setShowComments(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                         <X size={24} />
                      </button>
                   </div>

                   {/* Comment List */}
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 premium-scrollbar">
                      {fetchingComments ? (
                        <div className="h-full flex items-center justify-center">
                           <div className="w-8 h-8 border-3 border-primex/20 border-t-primex rounded-full animate-spin" />
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
                           <div className="p-4 rounded-full bg-white/5">
                              <MessageCircle size={40} className="text-white/20" />
                           </div>
                           <div>
                              <p className="text-white font-bold mb-1">No comments yet</p>
                              <p className="text-white/40 text-sm">Start the conversation!</p>
                           </div>
                        </div>
                      ) : (
                        comments.map((comment) => (
                           <motion.div 
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             key={comment.id} 
                             className="flex gap-3 group"
                           >
                              <Avatar className="w-9 h-9 border border-white/5">
                                 <AvatarImage src={comment.user.profilePic || ''} />
                                 <AvatarFallback className="bg-primex/10 text-white text-xs font-bold">
                                    {comment.user.username[0].toUpperCase()}
                                 </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-white text-sm font-bold">@{comment.user.username}</span>
                                    <span className="text-white/40 text-[10px]">{formatTime(comment.createdAt)}</span>
                                 </div>
                                 <p className="text-white/90 text-sm leading-relaxed">{comment.content}</p>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-[#ff2e2e] transition-all">
                                 <Heart size={14} />
                              </button>
                           </motion.div>
                        ))
                      )}
                   </div>

                   {/* Comment Input */}
                   <div className="p-4 pb-8 border-t border-white/5 bg-[#0b0b0f] safe-area-bottom">
                      <form onSubmit={handleAddComment} className="flex items-center gap-3 bg-white/5 rounded-2xl p-1.5 pl-4 focus-within:bg-white/10 transition-all border border-transparent focus-within:border-primex/30">
                         <Input 
                           value={newComment}
                           onChange={(e) => setNewComment(e.target.value)}
                           placeholder="Add a comment..."
                           className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/20 h-10 p-0"
                         />
                         <button 
                           type="submit" 
                           disabled={!newComment.trim()}
                           className={`p-2.5 rounded-xl transition-all ${newComment.trim() ? 'bg-primex text-white shadow-[0_0_15px_#ff2e2e]' : 'bg-white/5 text-white/20'}`}
                         >
                            <Send size={18} />
                         </button>
                      </form>
                      
                      {/* Emoji Quick Picker (Simple) */}
                      <div className="flex items-center justify-around mt-4 px-2">
                         {['❤️', '🙌', '🔥', '😂', '😍', '👏', '😢', '😮'].map(emoji => (
                            <button 
                              key={emoji}
                              type="button" 
                              onClick={() => setNewComment(prev => prev + emoji)}
                              className="text-lg hover:scale-125 transition-transform"
                            >
                               {emoji}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .animate-scroll {
          display: inline-block;
          padding-left: 100%;
          animation: scroll 15s linear infinite;
        }
        @keyframes scroll {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-100%, 0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .premium-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .premium-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
