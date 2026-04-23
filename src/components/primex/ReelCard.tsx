'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, UserCircle, MessageCircle, Play, X, Send, ThumbsUp, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentData {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    profilePic: string | null;
    isCreator: boolean;
  };
  replies?: CommentData[];
}

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
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const token = useAppStore((s) => s.token);
  const user = useAppStore((s) => s.user);
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

  // Close comments panel when reel is no longer active
  useEffect(() => {
    if (!isActive) setShowComments(false);
  }, [isActive]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/comments?reelId=${reel.id}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data.comments || []);
        setCommentCount(data.data.total || 0);
      }
    } catch {
      // silently fail
    }
    setCommentsLoading(false);
  }, [reel.id]);

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

  const handleViewComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !token) return;
    setPostingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: commentText.trim(),
          reelId: reel.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [data.data, ...prev]);
        setCommentCount(prev => prev + 1);
        setCommentText('');
        toast({ title: 'Comment posted!', description: 'Your comment has been added.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to post comment', variant: 'destructive' });
    }
    setPostingComment(false);
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, likes: c.likes + 1 }
            : c
        )
      );
    } catch {
      // silently fail
    }
  };

  const goToProfile = () => {
    setCurrentView('profile');
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
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

      {/* Double-tap heart animation */}
      <AnimatePresence>
        {showHeart && (
          <div className="like-heart-burst absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
          </div>
        )}
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="video-overlay-gradient" />

      {/* Right sidebar actions */}
      <div className="reel-actions-float" style={{ gap: '8px' }}>
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

        <button onClick={handleViewComments} className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-medium">{commentCount}</span>
        </button>
      </div>

      {/* Bottom caption with glass-card creator info */}
      <div className="absolute bottom-16 left-3 right-16">
        <div className="glass-card p-2 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
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

          {/* View Comments Button */}
          <button
            onClick={handleViewComments}
            className="flex items-center gap-1 mt-1.5 text-white/70 hover:text-white transition-colors text-xs group"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{commentCount > 0 ? `View ${commentCount} comment${commentCount !== 1 ? 's' : ''}` : 'Add a comment'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showComments ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comments Slide-Up Panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 top-20 z-30 flex flex-col"
          >
            <div className="glass-card-premium flex flex-col h-full rounded-t-2xl overflow-hidden">
              {/* Comments Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primex" />
                  <span className="font-semibold text-sm">
                    Comments <span className="text-muted-foreground font-normal">({commentCount})</span>
                  </span>
                </div>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close comments"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Drag indicator */}
              <div className="flex justify-center py-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto premium-scrollbar px-4 py-2">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="spinner-primex" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment, idx) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.3 }}
                        className="flex gap-2.5"
                      >
                        <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                          <AvatarImage src={comment.user?.profilePic || ''} />
                          <AvatarFallback className="bg-primex/20 text-primex text-[10px]">
                            {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white">
                              @{comment.user?.username || 'user'}
                            </span>
                            {comment.user?.isCreator && (
                              <span className="tag-primex text-[8px] px-1 py-0 leading-none">Creator</span>
                            )}
                            <span className="text-[10px] text-white/40">{timeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-xs text-white/80 whitespace-pre-wrap break-words mt-0.5">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <button
                              onClick={() => handleCommentLike(comment.id)}
                              className="flex items-center gap-1 text-[10px] text-white/40 hover:text-primex transition-colors"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {comment.likes > 0 && comment.likes}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="border-t border-white/10 p-3">
                {token ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src={user?.profilePic || ''} />
                      <AvatarFallback className="bg-primex/20 text-primex text-[10px]">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                      <input
                        ref={commentInputRef}
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePostComment();
                          }
                        }}
                        placeholder="Add a comment..."
                        className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-primex/40 transition-colors"
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePostComment}
                      disabled={!commentText.trim() || postingComment}
                      className={`p-2 rounded-full transition-colors ${
                        commentText.trim()
                          ? 'bg-primex text-white hover:bg-primex/80'
                          : 'bg-white/5 text-white/20'
                      }`}
                      aria-label="Post comment"
                    >
                      {postingComment ? (
                        <div className="spinner-primex-sm" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <p className="text-xs text-center text-white/40">
                    Sign in to add a comment
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover gradient-border-glow ring effect */}
      <div className="absolute inset-0 rounded-none pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 gradient-border-glow" />
    </div>
  );
}
