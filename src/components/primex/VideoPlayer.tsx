'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Share2, Flag, Eye, UserPlus, ArrowLeft, Play } from 'lucide-react';

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
  user: {
    id: string;
    username: string;
    profilePic: string | null;
  };
}

export default function VideoPlayer() {
  const { token, setCurrentView } = useAppStore();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  const videoId = useAppStore.getState().currentVideoId;

  useEffect(() => {
    if (!videoId) return;
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}`);
        const data = await res.json();
        if (data.success) {
          setVideo(data.data.video || data.data);
        }
      } catch {}
      setLoading(false);
    };
    fetchVideo();
  }, [videoId]);

  const handleLike = async () => {
    if (!token || !videoId || liked) return;
    try {
      const res = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && video) {
        setVideo({ ...video, likes: video.likes + 1 });
        setLiked(true);
      }
    } catch {}
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 lg:p-6">
        <Skeleton className="aspect-video rounded-xl mb-4" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">Video not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setCurrentView('home')}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => setCurrentView('home')}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Video + Info */}
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-4">
            <video
              src={video.videoUrl}
              controls
              className="w-full h-full object-contain"
              autoPlay
            />
          </div>

          {/* Video Info */}
          <h1 className="text-xl font-bold mb-2">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              {formatViews(video.views)} views
            </div>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-sm text-muted-foreground">{timeAgo(video.createdAt)}</span>

            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 rounded-xl ${liked ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'glass-card border-border/50'}`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
                {video.likes}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl glass-card border-border/50">
                <Share2 className="w-4 h-4" /> Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl glass-card border-border/50">
                <Flag className="w-4 h-4" /> Report
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-4 rounded-xl mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={video.user?.profilePic || ''} />
                <AvatarFallback className="bg-primex/20 text-primex">
                  {video.user?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{video.user?.username || 'Unknown'}</p>
              </div>
              <Button size="sm" className="ml-auto primex-gradient text-white rounded-xl gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> Add Friend
              </Button>
            </div>
            {video.description && (
              <div>
                <p className={`text-sm text-muted-foreground ${!showDesc ? 'line-clamp-2' : ''}`}>
                  {video.description}
                </p>
                {video.description.length > 100 && (
                  <button
                    className="text-xs text-primex mt-1"
                    onClick={() => setShowDesc(!showDesc)}
                  >
                    {showDesc ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
            {video.tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {video.tags.split(',').map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-primex/10 text-primex text-xs">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden lg:block w-80">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Videos</h3>
          <div className="space-y-3">
            <div className="glass-card p-3 rounded-xl">
              <p className="text-sm text-muted-foreground text-center">More videos coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
