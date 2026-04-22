'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListVideo, Plus, Lock, Globe, Trash2, Play, X, Film, Eye,
  ChevronLeft, Check, Bookmark, Search,
} from 'lucide-react';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface PlaylistVideoItem {
  id: string;
  videoId: string;
  addedAt: string;
  video: {
    id: string;
    title: string;
    thumbnail: string | null;
    videoUrl: string;
    duration: number;
    views: number;
    user: {
      id: string;
      username: string;
      profilePic: string | null;
      isCreator: boolean;
    };
  };
}

interface PlaylistData {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  videos: PlaylistVideoItem[];
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
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

/* ────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────── */

export default function PlaylistsPage() {
  const { user, token, setCurrentView } = useAppStore();
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<PlaylistData | null>(null);

  // Create playlist form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPublic, setNewPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  // Playlist picker (for adding videos from VideoPlayer integration)
  const [showPicker, setShowPicker] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('primex_picker_video');
  });
  const [pickerVideoId, setPickerVideoId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const pending = localStorage.getItem('primex_picker_video');
    if (pending) {
      localStorage.removeItem('primex_picker_video');
      return pending;
    }
    return null;
  });

  const fetchPlaylists = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.data.playlists);
      }
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/playlists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setPlaylists(data.data.playlists);
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to fetch playlists:', err);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  const handleCreatePlaylist = async () => {
    if (!token || !newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim() || undefined,
          isPublic: newPublic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists((prev) => [data.data, ...prev]);
        setNewName('');
        setNewDesc('');
        setNewPublic(false);
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
    setCreating(false);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
        if (activePlaylist?.id === playlistId) {
          setActivePlaylist(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const handleRemoveVideo = async (playlistId: string, videoId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}/videos?videoId=${videoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setPlaylists((prev) =>
          prev.map((p) =>
            p.id === playlistId
              ? { ...p, videos: p.videos.filter((v) => v.videoId !== videoId) }
              : p
          )
        );
        if (activePlaylist?.id === playlistId) {
          setActivePlaylist((prev) =>
            prev ? { ...prev, videos: prev.videos.filter((v) => v.videoId !== videoId) } : null
          );
        }
      }
    } catch (err) {
      console.error('Failed to remove video:', err);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!token || !pickerVideoId) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}/videos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: pickerVideoId }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh playlists
        fetchPlaylists();
        setShowPicker(false);
        setPickerVideoId(null);
      }
    } catch (err) {
      console.error('Failed to add video to playlist:', err);
    }
  };

  const handlePlayVideo = (videoId: string) => {
    useAppStore.setState({ currentVideoId: videoId });
    setCurrentView('video');
  };

  /* ──────────────────────────────────────────
     Loading
     ────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="skeleton-circle w-10 h-10" />
            <div className="skeleton-heading w-36 h-7" />
          </div>
          <div className="skeleton-line w-36 h-9" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <div className="skeleton-pulse aspect-video" />
              <div className="p-4 space-y-2">
                <div className="skeleton-heading w-3/4 h-5" />
                <div className="skeleton-line w-1/2 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────
     Playlist Detail View
     ────────────────────────────────────────── */
  if (activePlaylist) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground btn-ghost-primex"
          onClick={() => setActivePlaylist(null)}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Playlists
        </Button>

        {/* Playlist header */}
        <div className="glass-card p-6 rounded-2xl mb-6 hover-lift">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{activePlaylist.name}</h1>
              {activePlaylist.description && (
                <p className="text-sm text-muted-foreground mb-2">{activePlaylist.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {activePlaylist.isPublic ? (
                    <><Globe className="w-3 h-3" /> Public</>
                  ) : (
                    <><Lock className="w-3 h-3" /> Private</>
                  )}
                </span>
                <span>•</span>
                <span>{activePlaylist.videos.length} video{activePlaylist.videos.length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Updated {timeAgo(activePlaylist.updatedAt)}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="btn-outline-primex border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => handleDeletePlaylist(activePlaylist.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        {/* Videos list */}
        {activePlaylist.videos.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-16 h-16 rounded-full bg-primex/10 flex items-center justify-center mb-4">
              <Film className="w-8 h-8 text-primex/50" />
            </div>
            <p className="text-muted-foreground mb-2">No videos in this playlist yet</p>
            <p className="text-xs text-muted-foreground">Add videos from the video player</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {activePlaylist.videos.map((pv, index) => (
                <motion.div
                  key={pv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="glass-card p-4 rounded-xl hover-lift card-shine group cursor-pointer"
                  onClick={() => handlePlayVideo(pv.video.id)}
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-36 sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0 bg-muted">
                      {pv.video.thumbnail ? (
                        <img src={pv.video.thumbnail} alt={pv.video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/20 to-primex-secondary/20">
                          <Film className="w-8 h-8 text-primex/40" />
                        </div>
                      )}
                      {pv.video.duration > 0 && (
                        <div className="video-duration-badge absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white">
                          {formatDuration(pv.video.duration)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-10 h-10 rounded-full bg-primex/90 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-primex transition-colors">
                        {pv.video.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={pv.video.user?.profilePic || ''} />
                          <AvatarFallback className="text-[8px] bg-primex/20 text-primex">
                            {pv.video.user?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">
                          {pv.video.user?.username || 'Unknown'}
                        </span>
                        {pv.video.user?.isCreator && (
                          <span className="tag-primex text-[9px] py-0 px-1">Creator</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(pv.video.views)} views</span>
                        <span>•</span>
                        <span>Added {timeAgo(pv.addedAt)}</span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      className="shrink-0 self-start p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveVideo(activePlaylist.id, pv.videoId);
                      }}
                      aria-label="Remove from playlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  /* ──────────────────────────────────────────
     Empty State
     ────────────────────────────────────────── */
  if (playlists.length === 0 && !showCreateModal) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primex/10 flex items-center justify-center">
            <ListVideo className="w-5 h-5 text-primex" />
          </div>
          <h1 className="text-2xl font-bold primex-gradient-text">My Playlists</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-primex/10 flex items-center justify-center mb-6">
            <ListVideo className="w-10 h-10 text-primex/50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No playlists yet</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            Create playlists to organize and save your favorite videos.
          </p>
          <Button
            className="btn-primex"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Playlist
          </Button>
        </div>

        {/* Create Modal */}
        <CreatePlaylistModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          name={newName}
          setName={setNewName}
          desc={newDesc}
          setDesc={setNewDesc}
          isPublic={newPublic}
          setIsPublic={setNewPublic}
          creating={creating}
          onCreate={handleCreatePlaylist}
        />
      </div>
    );
  }

  /* ──────────────────────────────────────────
     Main Playlists Grid
     ────────────────────────────────────────── */
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primex/10 flex items-center justify-center">
            <ListVideo className="w-5 h-5 text-primex" />
          </div>
          <h1 className="text-2xl font-bold primex-gradient-text">My Playlists</h1>
        </div>
        <Button
          className="btn-primex"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Playlist
        </Button>
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {playlists.map((playlist, index) => {
            const firstThumbnail = playlist.videos[0]?.video?.thumbnail;
            return (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="glass-card rounded-xl overflow-hidden hover-lift card-shine cursor-pointer gradient-border-primex group"
                onClick={() => setActivePlaylist(playlist)}
              >
                {/* Cover */}
                <div className="relative aspect-video bg-muted">
                  {firstThumbnail ? (
                    <img
                      src={firstThumbnail}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/20 via-primex-secondary/10 to-primex-tertiary/20">
                      <ListVideo className="w-12 h-12 text-primex/30" />
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Video count badge */}
                  <div className="absolute bottom-2 right-2 badge-pulse px-2 py-1 rounded-lg bg-black/70 text-white text-xs font-medium flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {playlist.videos.length}
                  </div>
                  {/* Privacy badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium flex items-center gap-1">
                    {playlist.isPublic ? (
                      <><Globe className="w-3 h-3" /> Public</>
                    ) : (
                      <><Lock className="w-3 h-3" /> Private</>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1 group-hover:text-primex transition-colors">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {playlist.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Updated {timeAgo(playlist.updatedAt)}
                    </span>
                    <button
                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      aria-label="Delete playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        name={newName}
        setName={setNewName}
        desc={newDesc}
        setDesc={setNewDesc}
        isPublic={newPublic}
        setIsPublic={setNewPublic}
        creating={creating}
        onCreate={handleCreatePlaylist}
      />

      {/* Playlist Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowPicker(false); setPickerVideoId(null); }} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card-premium w-full max-w-md rounded-2xl p-6 relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Save to Playlist</h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowPicker(false); setPickerVideoId(null); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto premium-scrollbar">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                    onClick={() => handleAddToPlaylist(pl.id)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primex/10 flex items-center justify-center shrink-0">
                      <ListVideo className="w-5 h-5 text-primex" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pl.name}</p>
                      <p className="text-xs text-muted-foreground">{pl.videos.length} video{pl.videos.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
                {playlists.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No playlists yet. Create one first!
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────
   Create Playlist Modal
   ──────────────────────────────────────────── */

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
  creating: boolean;
  onCreate: () => void;
}

function CreatePlaylistModal({
  open, onClose, name, setName, desc, setDesc,
  isPublic, setIsPublic, creating, onCreate,
}: CreatePlaylistModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card-premium w-full max-w-md rounded-2xl p-6 relative z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold primex-gradient-text">Create Playlist</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Playlist Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My awesome playlist"
                  className="glass-input"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description <span className="text-muted-foreground">(optional)</span></label>
                <Input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What's this playlist about?"
                  className="glass-input"
                  maxLength={300}
                />
              </div>

              {/* Privacy toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Visibility</p>
                  <p className="text-xs text-muted-foreground">
                    {isPublic ? 'Anyone can see this playlist' : 'Only you can see this playlist'}
                  </p>
                </div>
                <button
                  className={`toggle-primex ${isPublic ? 'active' : ''}`}
                  onClick={() => setIsPublic(!isPublic)}
                  aria-label="Toggle playlist visibility"
                >
                  <span className="toggle-thumb" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 btn-outline-primex"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 btn-primex"
                  onClick={onCreate}
                  disabled={!name.trim() || creating}
                >
                  {creating ? (
                    <div className="spinner-primex-sm w-4 h-4 mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Create
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
