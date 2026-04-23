'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  MessageCircle,
  Send,
  Clock,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Bell,
  UserPlus,
  UserCheck,
  ArrowLeft,
  X,
} from 'lucide-react';
import ShareModal from './ShareModal';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface VideoUserData {
  id: string;
  username: string;
  profilePic: string | null;
  isCreator: boolean;
  bio?: string | null;
}

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnail: string | null;
  views: number;
  likes: number;
  duration: number;
  tags: string | null;
  createdAt: string;
  user: VideoUserData;
}

interface CommentData {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  parentId: string | null;
  user: {
    id: string;
    username: string;
    profilePic: string | null;
    isCreator: boolean;
  };
  replies?: CommentData[];
}

interface RecommendedVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  views: number;
  duration: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    profilePic: string | null;
  };
}

type FriendStatus = 'none' | 'pending' | 'friends';

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  return formatTime(seconds);
}

/* ────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────── */

export default function VideoPlayer() {
  const { user, token, setCurrentView } = useAppStore();
  const currentVideoId = useAppStore((s) => s.currentVideoId);

  // Video data
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Comments state
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentSort, setCommentSort] = useState<'top' | 'newest'>('top');
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReplies, setSubmittingReplies] = useState<Record<string, boolean>>({});

  // Recommended videos
  const [recommended, setRecommended] = useState<RecommendedVideo[]>([]);

  // Friend status for creator
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');

  // Share modal
  const [shareOpen, setShareOpen] = useState(false);

  // Share toast
  const [shareToast, setShareToast] = useState(false);

  // Playlist picker
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [playlists, setPlaylists] = useState<{ id: string; name: string; videos: { videoId: string }[] }[]>([]);
  const [playlistToast, setPlaylistToast] = useState('');

  // Watch history recording
  const historyRecordedRef = useRef(false);

  /* ── Check friend status ─────────────────── */
  const checkFriendStatus = useCallback(
    async (userId: string) => {
      if (!token) return;
      try {
        const res = await fetch('/api/friends?type=friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const friends: { friend: { id: string } }[] = data.data || [];
        const isFriend = friends.some((f) => f.friend?.id === userId);
        if (isFriend) {
          setFriendStatus('friends');
          return;
        }
        // Check pending
        const sentRes = await fetch('/api/friends?type=sent', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sentData = await sentRes.json();
        const sent: { friend: { id: string } }[] = sentData.data || [];
        const isPending = sent.some((f) => f.friend?.id === userId);
        if (isPending) {
          setFriendStatus('pending');
        }
      } catch (err) {
        console.error('Friend check error:', err);
      }
    },
    [token]
  );

  /* ── Record watch history ─────────────────── */
  useEffect(() => {
    if (!token || !currentVideoId || !isPlaying) return;
    if (historyRecordedRef.current === true) return;
    historyRecordedRef.current = true;
    const recordHistory = async () => {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId: currentVideoId,
            watchTime: 0,
            completed: false,
          }),
        });
      } catch {}
    };
    recordHistory();
  }, [token, currentVideoId, isPlaying]);

  // Update watch progress periodically
  useEffect(() => {
    if (!token || !currentVideoId) return;
    const interval = setInterval(() => {
      const vid = videoRef.current;
      if (!vid || vid.paused) return;
      const watchTime = Math.floor(vid.currentTime);
      const isCompleted = vid.duration > 0 && (vid.currentTime / vid.duration) > 0.9;
      fetch('/api/history', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: currentVideoId,
          watchTime,
          completed: isCompleted,
        }),
      }).catch(() => {});
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [token, currentVideoId]);

  /* ── Fetch video data ────────────────────── */
  useEffect(() => {
    if (!currentVideoId) return;
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/videos/${currentVideoId}`, { headers });
        const data = await res.json();
        if (data.success) {
          const v = data.data;
          setVideo(v);
          setDuration(v.duration || 0);
          // Check friend status
          if (token && v.user?.id && v.user.id !== user?.id) {
            checkFriendStatus(v.user.id);
          } else if (v.user?.id === user?.id) {
            setFriendStatus('friends'); // self
          }
        }
      } catch (err) {
        console.error('Failed to fetch video:', err);
      }
      setLoading(false);
    };
    fetchVideo();
    historyRecordedRef.current = false; // Reset for new video
  }, [currentVideoId, token, user?.id, checkFriendStatus]);

  /* ── Fetch comments ──────────────────────── */
  const fetchComments = useCallback(
    async (page = 1) => {
      if (!currentVideoId) return;
      try {
        const res = await fetch(
          `/api/comments?videoId=${currentVideoId}&page=${page}&limit=10`
        );
        const data = await res.json();
        if (data.success) {
          const newComments = data.data.comments;
          if (page === 1) {
            setComments(newComments);
          } else {
            setComments((prev) => [...prev, ...newComments]);
          }
          setCommentsTotal(data.data.total);
          setCommentsPage(page);
          setCommentsHasMore(page < data.data.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    },
    [currentVideoId]
  );

  // Fetch comments when video changes
  useEffect(() => {
    if (!currentVideoId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/comments?videoId=${currentVideoId}&page=1&limit=10`
        );
        const data = await res.json();
        if (!cancelled && data.success) {
          setComments(data.data.comments);
          setCommentsTotal(data.data.total);
          setCommentsPage(1);
          setCommentsHasMore(1 < data.data.totalPages);
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to fetch comments:', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentVideoId]);

  /* ── Fetch recommended videos ────────────── */
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await fetch('/api/videos?limit=10&page=1');
        const data = await res.json();
        if (data.success) {
          const filtered = data.data.videos.filter(
            (v: RecommendedVideo) => v.id !== currentVideoId
          );
          setRecommended(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch recommended:', err);
      }
    };
    fetchRecommended();
  }, [currentVideoId]);

  /* ── Video control handlers ──────────────── */
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setCurrentTime(vid.currentTime);
  };

  const handleLoadedMetadata = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setDuration(vid.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const vid = videoRef.current;
    if (!vid || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    vid.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(pct * (duration || 0));
    setHoverX(x);
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleVolumeChange = (val: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.volume = val;
    setVolume(val);
    if (val === 0) {
      vid.muted = true;
      setIsMuted(true);
    } else if (vid.muted) {
      vid.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleSpeedChange = (speed: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  /* ── Auto-hide controls ──────────────────── */
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Auto-hide controls after 3 seconds of playing
  useEffect(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  /* ── Like video ──────────────────────────── */
  const handleLike = async () => {
    if (!token || !currentVideoId) return;
    if (liked) {
      setLiked(false);
      if (video) setVideo({ ...video, likes: video.likes - 1 });
      return;
    }
    try {
      const res = await fetch(`/api/videos/${currentVideoId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && video) {
        setVideo({ ...video, likes: video.likes + 1 });
        setLiked(true);
        setDisliked(false);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleHeartBurst = () => {
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 800);
  };

  /* ── Share ───────────────────────────────── */
  const handleShare = () => {
    const url = `${window.location.origin}?v=${currentVideoId}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  };

  /* ── Add friend ──────────────────────────── */
  const handleAddFriend = async () => {
    if (!token || !video?.user?.id) return;
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: video.user.id }),
      });
      setFriendStatus('pending');
    } catch (err) {
      console.error('Add friend error:', err);
    }
  };

  /* ── Post comment ────────────────────────── */
  const handleSubmitComment = async () => {
    if (!token || !currentVideoId || !commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentInput.trim(),
          videoId: currentVideoId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentInput('');
        // Prepend the new comment
        setComments((prev) => [data.data, ...prev]);
        setCommentsTotal((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
    setSubmittingComment(false);
  };

  /* ── Like comment ────────────────────────── */
  const handleLikeComment = async (commentId: string) => {
    if (!token) return;
    const isLiked = likedComments.has(commentId);
    // Optimistic
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: c.likes + (isLiked ? -1 : 1) }
          : {
              ...c,
              replies: c.replies?.map((r) =>
                r.id === commentId
                  ? { ...r, likes: r.likes + (isLiked ? -1 : 1) }
                  : r
              ),
            }
      )
    );
    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Like comment error:', err);
    }
  };

  /* ── Post reply ──────────────────────────── */
  const handleSubmitReply = async (parentId: string) => {
    if (!token || !currentVideoId) return;
    const content = replyInputs[parentId]?.trim();
    if (!content) return;
    setSubmittingReplies((prev) => ({ ...prev, [parentId]: true }));
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          videoId: currentVideoId,
          parentId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyInputs((prev) => ({ ...prev, [parentId]: '' }));
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: [...(c.replies || []), data.data],
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Reply error:', err);
    }
    setSubmittingReplies((prev) => ({ ...prev, [parentId]: false }));
  };

  /* ── Play recommended video ──────────────── */
  const playRecommended = (videoId: string) => {
    useAppStore.setState({ currentVideoId: videoId });
    // Re-fetch will be triggered by useEffect
    setLoading(true);
    setVideo(null);
    setComments([]);
    setCommentsTotal(0);
    setLiked(false);
    setDisliked(false);
    setBookmarked(false);
    setCurrentTime(0);
    setIsPlaying(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Double-click to like ────────────────── */
  const lastTapRef = useRef(0);
  const handleVideoDoubleClick = () => {
    if (!liked) {
      handleLike();
    }
    handleHeartBurst();
  };

  /* ──────────────────────────────────────────
     Render: Loading
     ────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <Skeleton className="aspect-video rounded-2xl mb-4" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Skeleton className="h-7 w-3/4 mb-3" />
            <div className="flex gap-3 mb-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl mb-4" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="hidden lg:block w-80 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 min-h-[60vh]">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-primex/10 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-primex" />
          </div>
          <p className="text-lg font-medium mb-2">Video not found</p>
          <p className="text-sm text-muted-foreground mb-4">
            This video may have been removed or is unavailable.
          </p>
          <Button
            variant="outline"
            className="btn-outline-primex"
            onClick={() => setCurrentView('home')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Home
          </Button>
        </div>
      </div>
    );
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  /* ──────────────────────────────────────────
     Render: Main
     ────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-3 gap-2 text-muted-foreground hover:text-foreground btn-ghost-primex"
        onClick={() => setCurrentView('home')}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left Column: Player + Info + Comments ── */}
        <div className="flex-1 min-w-0">
          {/* ══════════════════════════════════════
              VIDEO PLAYER
              ══════════════════════════════════════ */}
          <div
            ref={containerRef}
            className="relative aspect-video bg-black rounded-2xl overflow-hidden group cursor-pointer select-none"
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={(e) => {
              // Detect double-click on desktop
              const now = Date.now();
              if (now - lastTapRef.current < 300) {
                handleVideoDoubleClick();
              } else {
                lastTapRef.current = now;
                // Single click toggles play on mobile tap
                setTimeout(() => {
                  if (Date.now() - lastTapRef.current >= 280) {
                    togglePlay();
                  }
                }, 300);
              }
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              // Already handled by click double-tap detection
            }}
          >
            {/* Video element */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => { setIsPlaying(false); setShowControls(true); }}
              onEnded={() => { setIsPlaying(false); setShowControls(true); }}
              playsInline
            />

            {/* Heart burst on double-click */}
            {heartBurst && (
              <div className="like-heart-burst absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
              </div>
            )}

            {/* Overlay gradient for controls */}
            <div
              className={`video-overlay-gradient transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Large center play/pause button */}
            {!isPlaying && (
              <button
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                aria-label="Play video"
              >
                <div className="play-button-hover w-16 h-16 sm:w-20 sm:h-20">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
                </div>
              </button>
            )}

            {/* ── Control bar ── */}
            <div
              className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
              {/* Progress bar */}
              <div
                className="video-progress-track h-1 hover:h-2"
                onClick={handleSeek}
                onMouseMove={handleProgressHover}
                onMouseLeave={() => setHoverTime(null)}
              >
                {/* Buffer bar (visual) */}
                <div
                  className="absolute top-0 left-0 h-full bg-white/20 rounded-r-full"
                  style={{ width: `${Math.min(progressPct + 10, 100)}%` }}
                />
                {/* Progress fill */}
                <div
                  className="video-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
                {/* Hover preview time */}
                {hoverTime !== null && duration > 0 && (
                  <div
                    className="absolute -top-8 px-2 py-0.5 bg-black/90 rounded text-xs text-white pointer-events-none"
                    style={{ left: `${Math.max(0, hoverX - 20)}px` }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 pb-3 pt-2">
                {/* Play/Pause */}
                <button
                  className="text-white hover:text-primex transition-colors active-press"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1 group/vol">
                  <button
                    className="text-white hover:text-primex transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleVolumeChange(parseFloat(e.target.value));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-1 appearance-none bg-white/30 rounded-full cursor-pointer accent-primex"
                    />
                  </div>
                </div>

                {/* Time display */}
                <div className="text-white/80 text-xs sm:text-sm font-mono tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                <div className="flex-1" />

                {/* Speed selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="text-white/80 hover:text-white text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {playbackSpeed}x
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="glass-card border-border/50"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        className={speed === playbackSpeed ? 'text-primex' : ''}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quality selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Quality"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="glass-card border-border/50"
                  >
                    {['Auto', '4K', '1080p', '720p', '480p'].map((q) => (
                      <DropdownMenuItem key={q} className={q === 'Auto' ? 'text-primex' : ''}>
                        {q}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Fullscreen */}
                <button
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              VIDEO INFORMATION SECTION
              ══════════════════════════════════════ */}
          <div className="mt-4">
            {/* Title */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight mb-2">
              {video.title}
            </h1>

            {/* Views + Date + Action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <Clock className="w-3.5 h-3.5" />
                <span>{timeAgo(video.createdAt)}</span>
              </div>

              <div className="flex flex-wrap gap-2 sm:ml-auto">
                {/* Like */}
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all active-press ${
                    liked
                      ? 'bg-primex/15 text-primex border border-primex/30'
                      : 'glass-card border border-border/50 hover:bg-white/10'
                  }`}
                  onClick={handleLike}
                >
                  <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-primex' : ''}`} />
                  <span className="count-up">{video.likes}</span>
                </button>

                {/* Dislike */}
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all active-press ${
                    disliked
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'glass-card border border-border/50 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setDisliked(!disliked);
                    if (liked && !disliked) {
                      setLiked(false);
                      setVideo({ ...video, likes: video.likes - 1 });
                    }
                  }}
                >
                  <ThumbsDown className={`w-4 h-4 ${disliked ? 'fill-red-400' : ''}`} />
                </button>

                {/* Share */}
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium glass-card border border-border/50 hover:bg-white/10 transition-all active-press"
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                {/* Bookmark / Save to Playlist */}
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all active-press ${
                    bookmarked
                      ? 'bg-primex-secondary/15 text-primex-secondary border border-primex-secondary/30'
                      : 'glass-card border border-border/50 hover:bg-white/10'
                  }`}
                  onClick={async () => {
                    if (!token) return;
                    setBookmarked(!bookmarked);
                    // Fetch playlists for picker
                    try {
                      const res = await fetch('/api/playlists', {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const data = await res.json();
                      if (data.success) {
                        setPlaylists(data.data.playlists);
                        setShowPlaylistPicker(true);
                      }
                    } catch {}
                  }}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-primex-secondary' : ''}`} />
                  <span className="hidden sm:inline">Save</span>
                </button>

                {/* Report */}
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium glass-card border border-border/50 hover:bg-white/10 transition-all active-press"
                  onClick={() => {
                    if (token && currentVideoId) {
                      fetch('/api/report', {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          targetType: 'video',
                          targetId: currentVideoId,
                          reason: 'inappropriate',
                        }),
                      }).catch(() => {});
                    }
                  }}
                >
                  <Flag className="w-4 h-4" />
                  <span className="hidden sm:inline">Report</span>
                </button>
              </div>
            </div>

            {/* Share toast */}
            {shareToast && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-card px-4 py-2 rounded-xl text-sm text-primex notification-pop">
                Link copied to clipboard!
              </div>
            )}

            {/* Playlist toast */}
            {playlistToast && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-card px-4 py-2 rounded-xl text-sm text-primex-secondary notification-pop">
                {playlistToast}
              </div>
            )}

            {/* Playlist Picker Modal */}
            {showPlaylistPicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPlaylistPicker(false)} />
                <div className="glass-card-premium w-full max-w-md rounded-2xl p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Save to Playlist</h3>
                    <button onClick={() => setShowPlaylistPicker(false)} className="p-1 rounded hover:bg-white/10">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto premium-scrollbar">
                    {playlists.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-3">No playlists yet</p>
                        <Button
                          className="btn-primex btn-sm"
                          onClick={() => {
                            setShowPlaylistPicker(false);
                            setCurrentView('playlists');
                          }}
                        >
                          Create a Playlist
                        </Button>
                      </div>
                    ) : (
                      playlists.map((pl) => {
                        const alreadyAdded = pl.videos?.some((v) => v.videoId === currentVideoId);
                        return (
                          <button
                            key={pl.id}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left ${alreadyAdded ? 'opacity-60' : ''}`}
                            onClick={async () => {
                              if (alreadyAdded || !token || !currentVideoId) return;
                              try {
                                const res = await fetch(`/api/playlists/${pl.id}/videos`, {
                                  method: 'POST',
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ videoId: currentVideoId }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setPlaylistToast(`Added to "${pl.name}"`);
                                  setTimeout(() => setPlaylistToast(''), 2000);
                                } else {
                                  setPlaylistToast(data.message || 'Failed to add');
                                  setTimeout(() => setPlaylistToast(''), 2000);
                                }
                              } catch {
                                setPlaylistToast('Failed to add');
                                setTimeout(() => setPlaylistToast(''), 2000);
                              }
                              setShowPlaylistPicker(false);
                            }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-primex/10 flex items-center justify-center shrink-0">
                              <Bookmark className="w-5 h-5 text-primex" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{pl.name}</p>
                              <p className="text-xs text-muted-foreground">{pl.videos?.length || 0} video{(pl.videos?.length || 0) !== 1 ? 's' : ''}</p>
                            </div>
                            {alreadyAdded && (
                              <span className="text-[10px] text-primex-secondary font-medium">Already added</span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Creator info card */}
            <div className="glass-card p-4 rounded-2xl mb-4 hover-lift">
              <div className="flex items-center gap-3">
                <Avatar className="w-11 h-11 border-2 border-primex/20">
                  <AvatarImage src={video.user?.profilePic || ''} />
                  <AvatarFallback className="bg-primex/20 text-primex font-semibold">
                    {video.user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {video.user?.username || 'Unknown'}
                    </span>
                    {video.user?.isCreator && (
                      <span className="tag-primex text-[10px] py-0 px-1.5">Creator</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {video.user?.isCreator ? 'Creator' : 'Member'}
                  </p>
                </div>

                {/* Friend / Subscribe buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {video.user?.id !== user?.id && (
                    <>
                      {friendStatus === 'friends' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-success text-xs font-medium">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Friends</span>
                        </div>
                      ) : friendStatus === 'pending' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/30 text-warning text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Pending</span>
                        </div>
                      ) : (
                        <button
                          className="btn-primex btn-sm flex items-center gap-1.5 text-xs"
                          onClick={handleAddFriend}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Add Friend</span>
                        </button>
                      )}
                    </>
                  )}
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Notifications">
                    <Bell className="w-4 h-4 text-muted-foreground hover:text-primex" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div className="mt-3">
                  <p
                    className={`text-sm text-muted-foreground whitespace-pre-wrap ${!showDesc ? 'line-clamp-2' : ''}`}
                  >
                    {video.description}
                  </p>
                  {video.description.length > 120 && (
                    <button
                      className="text-xs text-primex mt-1 hover:underline"
                      onClick={() => setShowDesc(!showDesc)}
                    >
                      {showDesc ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              {/* Tags */}
              {video.tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {video.tags.split(',').map((tag, i) => (
                    <span key={i} className="tag-primex">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════
                COMMENTS SECTION
                ══════════════════════════════════════ */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl">
              {/* Comments header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primex" />
                  <span className="font-semibold">
                    {commentsTotal} Comment{commentsTotal !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                        {commentSort === 'top' ? 'Top Comments' : 'Newest First'}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-card border-border/50">
                      <DropdownMenuItem onClick={() => setCommentSort('top')}>
                        Top Comments
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCommentSort('newest')}>
                        Newest First
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Comment input */}
              {token ? (
                <div className="flex gap-3 mb-6">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={user?.profilePic || ''} />
                    <AvatarFallback className="bg-primex/20 text-primex text-xs">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                      className="flex-1 glass-input px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button
                      className={`p-2 rounded-xl transition-all ${
                        commentInput.trim()
                          ? 'text-primex hover:bg-primex/10 active-press'
                          : 'text-muted-foreground/50 cursor-not-allowed'
                      }`}
                      onClick={handleSubmitComment}
                      disabled={!commentInput.trim() || submittingComment}
                    >
                      {submittingComment ? (
                        <div className="spinner-primex spinner-primex-sm" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 mb-4 text-sm text-muted-foreground">
                  <a className="text-primex hover:underline cursor-pointer" onClick={() => setCurrentView('home')}>
                    Sign in
                  </a>{' '}
                  to add a comment
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto premium-scrollbar">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                    <p className="text-xs text-muted-foreground/60">Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      token={token}
                      likedComments={likedComments}
                      expandedReplies={expandedReplies}
                      replyInputs={replyInputs}
                      submittingReplies={submittingReplies}
                      onLikeComment={handleLikeComment}
                      onToggleReplies={(id) =>
                        setExpandedReplies((prev) => {
                          const next = new Set(prev);
                          if (next.has(id)) next.delete(id);
                          else next.add(id);
                          return next;
                        })
                      }
                      onReplyInputChange={(id, val) =>
                        setReplyInputs((prev) => ({ ...prev, [id]: val }))
                      }
                      onSubmitReply={handleSubmitReply}
                    />
                  ))
                )}
              </div>

              {/* Load more */}
              {commentsHasMore && (
                <div className="mt-4 text-center">
                  <button
                    className="btn-outline-primex btn-sm text-xs"
                    onClick={() => fetchComments(commentsPage + 1)}
                  >
                    Load more comments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Recommended Sidebar (desktop) ── */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0">
          <div className="sticky top-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-primex" /> Up Next
            </h3>
            <div className="space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto premium-scrollbar pr-1">
              {recommended.length === 0 ? (
                <div className="glass-card p-4 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground">No more videos</p>
                </div>
              ) : (
                recommended.map((rv) => (
                  <button
                    key={rv.id}
                    className="w-full glass-card rounded-xl overflow-hidden hover-lift card-shine text-left group/rv"
                    onClick={() => playRecommended(rv.id)}
                  >
                    <div className="flex gap-3 p-2.5">
                      {/* Thumbnail */}
                      <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-white/5 shrink-0">
                        {rv.thumbnail ? (
                          <img
                            src={rv.thumbnail}
                            alt={rv.title}
                            className="w-full h-full object-cover group-hover/rv:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                        <div className="video-duration-badge absolute bottom-1 right-1">
                          {formatDuration(rv.duration)}
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <p className="text-sm font-medium line-clamp-2 leading-tight mb-1">
                          {rv.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {rv.user?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatViews(rv.views)} views • {timeAgo(rv.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Recommended (shown below comments) ── */}
      <div className="lg:hidden mt-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Play className="w-4 h-4 text-primex" /> Up Next
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {recommended.slice(0, 6).map((rv) => (
            <button
              key={rv.id}
              className="shrink-0 w-44 glass-card rounded-xl overflow-hidden hover-lift text-left"
              onClick={() => playRecommended(rv.id)}
            >
              <div className="relative aspect-video bg-white/5">
                {rv.thumbnail ? (
                  <img
                    src={rv.thumbnail}
                    alt={rv.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white/20" />
                  </div>
                )}
                <div className="video-duration-badge absolute bottom-1 right-1">
                  {formatDuration(rv.duration)}
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-2 leading-tight">
                  {rv.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {rv.user?.username} • {formatViews(rv.views)} views
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        videoId={currentVideoId || ''}
        videoTitle={video?.title || ''}
      />
    </div>
  );
}

/* ────────────────────────────────────────────
   Comment Item Sub-component
   ──────────────────────────────────────────── */

function CommentItem({
  comment,
  token,
  likedComments,
  expandedReplies,
  replyInputs,
  submittingReplies,
  onLikeComment,
  onToggleReplies,
  onReplyInputChange,
  onSubmitReply,
}: {
  comment: CommentData;
  token: string | null;
  likedComments: Set<string>;
  expandedReplies: Set<string>;
  replyInputs: Record<string, string>;
  submittingReplies: Record<string, boolean>;
  onLikeComment: (id: string) => void;
  onToggleReplies: (id: string) => void;
  onReplyInputChange: (id: string, val: string) => void;
  onSubmitReply: (parentId: string) => void;
}) {
  const isLiked = likedComments.has(comment.id);
  const hasReplies = (comment.replies?.length || 0) > 0;
  const showReplies = expandedReplies.has(comment.id);

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={comment.user?.profilePic || ''} />
          <AvatarFallback className="bg-primex/15 text-primex text-xs">
            {comment.user?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.user?.username}</span>
            {comment.user?.isCreator && (
              <span className="tag-primex text-[9px] py-0 px-1">Creator</span>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Comment actions */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              className={`flex items-center gap-1 text-xs transition-colors ${
                isLiked ? 'text-primex' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onLikeComment(comment.id)}
            >
              <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-primex' : ''}`} />
              {comment.likes > 0 && comment.likes}
            </button>
            {token && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  onToggleReplies(comment.id);
                  onReplyInputChange(comment.id, replyInputs[comment.id] || '');
                }}
              >
                Reply
              </button>
            )}
            {hasReplies && (
              <button
                className="text-xs text-primex hover:underline flex items-center gap-1"
                onClick={() => onToggleReplies(comment.id)}
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showReplies ? 'rotate-180' : ''}`}
                />
                {comment.replies!.length} repl{comment.replies!.length === 1 ? 'y' : 'ies'}
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplies && token && (
            <div className="flex gap-2 mt-3 ml-2">
              <input
                type="text"
                placeholder="Write a reply..."
                value={replyInputs[comment.id] || ''}
                onChange={(e) => onReplyInputChange(comment.id, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmitReply(comment.id)}
                className="flex-1 glass-input px-3 py-1.5 text-xs bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                className={`p-1.5 rounded-lg transition-all ${
                  replyInputs[comment.id]?.trim()
                    ? 'text-primex hover:bg-primex/10'
                    : 'text-muted-foreground/50 cursor-not-allowed'
                }`}
                onClick={() => onSubmitReply(comment.id)}
                disabled={!replyInputs[comment.id]?.trim() || submittingReplies[comment.id]}
              >
                {submittingReplies[comment.id] ? (
                  <div className="spinner-primex spinner-primex-sm" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Replies */}
          {showReplies && hasReplies && (
            <div className="mt-3 ml-2 space-y-3 border-l-2 border-primex/20 pl-3">
              {comment.replies!.map((reply) => {
                const replyLiked = likedComments.has(reply.id);
                return (
                  <div key={reply.id} className="flex gap-2.5">
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarImage src={reply.user?.profilePic || ''} />
                      <AvatarFallback className="bg-primex/10 text-primex text-[9px]">
                        {reply.user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{reply.user?.username}</span>
                        {reply.user?.isCreator && (
                          <span className="tag-primex text-[8px] py-0 px-1">Creator</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/85 mt-0.5 whitespace-pre-wrap break-words">
                        {reply.content}
                      </p>
                      <button
                        className={`flex items-center gap-1 text-[10px] mt-1 transition-colors ${
                          replyLiked ? 'text-primex' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => onLikeComment(reply.id)}
                      >
                        <ThumbsUp className={`w-2.5 h-2.5 ${replyLiked ? 'fill-primex' : ''}`} />
                        {reply.likes > 0 && reply.likes}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="divider-glow mt-4" />
    </div>
  );
}
