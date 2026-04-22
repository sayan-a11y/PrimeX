'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Eye, UserCircle } from 'lucide-react';
import { useAppStore } from '@/store';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string | null;
    duration: number;
    views: number;
    createdAt: string;
    user: {
      id: string;
      username: string;
      profilePic: string | null;
      isCreator: boolean;
    };
  };
  index?: number;
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

export default function VideoCard({ video, index = 0 }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const handleClick = () => {
    useAppStore.setState({ currentVideoId: video.id });
    setCurrentView('video');
  };

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
              }`}
              onLoad={() => setThumbnailLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted shimmer">
            <Play className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Play overlay on hover with play-button-hover class */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center"
          >
            <div className="play-button-hover">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </motion.div>
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
      <div className="flex gap-3 mt-3 px-0.5">
        <div className="shrink-0">
          {video.user.profilePic ? (
            <img
              src={video.user.profilePic}
              alt={video.user.username}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:gradient-border-primex transition-all duration-300"
            />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primex/10 group-hover:ring-2 group-hover:ring-primex/40 transition-all duration-300">
              <UserCircle className="w-9 h-9 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-shimmer transition-all duration-300">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            {video.user.username}
            {video.user.isCreator && (
              <span className="tag-primex text-[10px] px-1.5 py-0">Creator</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
