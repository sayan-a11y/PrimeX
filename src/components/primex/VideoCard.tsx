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
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const setSelectedVideoId = useAppStore((s) => s.setSelectedVideoId);

  const handleClick = () => {
    setSelectedVideoId(video.id);
    setCurrentView('videoPlayer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="video-card-hover cursor-pointer group"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <Play className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Play overlay on hover */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full primex-gradient flex items-center justify-center glow-effect">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </motion.div>
        )}

        {/* Duration badge */}
        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
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
              className="w-9 h-9 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <UserCircle className="w-9 h-9 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {video.user.username}
            {video.user.isCreator && (
              <span className="inline-block w-3 h-3 primex-gradient rounded-full ml-0.5" />
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
