'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Eye, UserCircle, Check } from 'lucide-react';
import { useAppStore } from '@/store';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string | null;
    duration: number;
    views: number;
    createdAt: string;
    isMature?: boolean;
    isPrivate?: boolean;
    user: {
      id: string;
      username: string;
      profilePic: string | null;
      isCreator: boolean;
    };
  };
  index?: number;
  showContentWarning?: boolean;
}

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video, index = 0, showContentWarning }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [savedToWatchLater, setSavedToWatchLater] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(showContentWarning && (video.isMature || video.isPrivate));
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const token = useAppStore((s) => s.token);

  const handleClick = () => {
    useAppStore.setState({ currentVideoId: video.id });
    setCurrentView('video');
  };

  const handleWatchLater = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saving || savedToWatchLater) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('primex_token');
      if (!token) return;

      // First, find or create a "Watch Later" playlist
      const playlistsRes = await fetch('/api/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const playlistsData = await playlistsRes.json();

      let watchLaterPlaylistId: string | null = null;

      if (playlistsData.success) {
        const watchLater = playlistsData.data.playlists.find(
          (p: { name: string }) => p.name === 'Watch Later'
        );
        if (watchLater) {
          watchLaterPlaylistId = watchLater.id;
        }
      }

      // Create "Watch Later" playlist if it doesn't exist
      if (!watchLaterPlaylistId) {
        const createRes = await fetch('/api/playlists', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Watch Later',
            description: 'Videos saved to watch later',
            isPublic: false,
          }),
        });
        const createData = await createRes.json();
        if (createData.success) {
          watchLaterPlaylistId = createData.data.id;
        }
      }

      // Add video to Watch Later playlist
      if (watchLaterPlaylistId) {
        const addRes = await fetch(`/api/playlists/${watchLaterPlaylistId}/videos`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId: video.id }),
        });
        const addData = await addRes.json();
        if (addData.success) {
          setSavedToWatchLater(true);
        }
      }
    } catch {
      // Silently fail
    }
    setSaving(false);
  }, [video.id, saving, savedToWatchLater]);

  const handleRevealContent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (video.isMature && !ageConfirmed) return;
    setShowWarning(false);
  }, [video.isMature, ageConfirmed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-shine hover-lift cursor-pointer group rounded-xl"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
        {video.thumbnail ? (
          <>
            {!thumbnailLoaded && (
              <div className="absolute inset-0 shimmer" />
            )}
            <img
              src={video.thumbnail}
              alt={video.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                thumbnailLoaded ? 'opacity-100' : 'opacity-0'
              } ${showWarning ? 'blur-xl' : ''}`}
              onLoad={() => setThumbnailLoaded(true)}
            />
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted shimmer ${showWarning ? 'blur-xl' : ''}`}>
            <Play className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Content Warning Overlay */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-yellow-500/15 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white text-center mb-1">
                {video.isMature ? 'Mature Content' : 'Friends Only'}
              </p>
              <p className="text-xs text-white/60 text-center mb-3">
                {video.isMature ? 'This content is for mature audiences' : 'This content is only visible to friends'}
              </p>
              {video.isMature && (
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded accent-primex"
                  />
                  <span className="text-xs text-white/80">I am 18+ years old</span>
                </label>
              )}
              <button
                onClick={handleRevealContent}
                disabled={video.isMature && !ageConfirmed}
                className={`btn-primex btn-sm ${video.isMature && !ageConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Show Content
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play overlay on hover with play-button-hover class */}
        {hovered && !showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center z-5"
          >
            <div className="play-button-hover">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </motion.div>
        )}

        {/* Watch Later Button - appears on hover */}
        <AnimatePresence>
          {hovered && !showWarning && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={handleWatchLater}
              className={`absolute top-2 right-2 z-10 p-1.5 rounded-lg backdrop-blur-sm transition-all active-press ${
                savedToWatchLater
                  ? 'bg-primex/80 text-white badge-pulse'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              aria-label={savedToWatchLater ? 'Added to Watch Later' : 'Watch Later'}
            >
              {savedToWatchLater ? (
                <Check className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Mature/Private Badge */}
        {(video.isMature || video.isPrivate) && !showWarning && (
          <div className="absolute top-2 left-2 z-5">
            <span className={`tag-primex text-[9px] px-1.5 py-0.5 ${video.isMature ? '!bg-yellow-500/15 !text-yellow-400 !border-yellow-500/30' : '!bg-blue-500/15 !text-blue-400 !border-blue-500/30'}`}>
              {video.isMature ? '18+' : 'Friends'}
            </span>
          </div>
        )}

        {/* Duration badge */}
        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 video-duration-badge flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-2 mt-2 px-0.5">
        <div className="shrink-0">
          {video.user.profilePic ? (
            <img
              src={video.user.profilePic}
              alt={video.user.username}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:gradient-border-primex transition-all duration-300"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primex/10 group-hover:ring-2 group-hover:ring-primex/40 transition-all duration-300">
              <UserCircle className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-shimmer transition-all duration-300">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            {video.user.username}
            {video.user.isCreator && (
              <span className="tag-primex text-[10px] px-1.5 py-0">Creator</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
