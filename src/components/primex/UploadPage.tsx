'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Film, Play, Lock, X, CheckCircle, CloudUpload, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const { token } = useAppStore();
  const [activeTab, setActiveTab] = useState('video');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Animated progress for mock upload
  const [mockProgress, setMockProgress] = useState(0);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Long video fields
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoTags, setVideoTags] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null);

  // Reel fields
  const [reelFile, setReelFile] = useState<File | null>(null);
  const [reelCaption, setReelCaption] = useState('');

  // Private fields
  const [privateFile, setPrivateFile] = useState<File | null>(null);
  const [privateTitle, setPrivateTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock progress animation for upload
  useEffect(() => {
    if (uploading) {
      setMockProgress(0);
      mockIntervalRef.current = setInterval(() => {
        setMockProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 8 + 2;
        });
      }, 300);
    } else {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
      setMockProgress(0);
    }
    return () => {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, [uploading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'reel' | 'private') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'video') setVideoFile(file);
    else if (type === 'reel') setReelFile(file);
    else setPrivateFile(file);
  };

  const handleDrop = (e: React.DragEvent, type: 'video' | 'reel' | 'private') => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (type === 'video') setVideoFile(file);
    else if (type === 'reel') setReelFile(file);
    else setPrivateFile(file);
  };

  const uploadFile = async (file: File, type: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/upload?type=${type}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.data.url;
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !videoTitle) {
      setError('Please select a video and add a title');
      return;
    }
    setUploading(true);
    setError('');
    setUploadProgress(10);
    try {
      const videoUrl = await uploadFile(videoFile, 'video');
      setUploadProgress(60);
      let thumbnailUrl = '';
      if (videoThumbnail) {
        thumbnailUrl = await uploadFile(videoThumbnail, 'thumbnail');
      }
      setUploadProgress(80);
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: videoTitle,
          description: videoDesc,
          videoUrl,
          thumbnail: thumbnailUrl || undefined,
          tags: videoTags,
          duration: 0,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create video');
      setUploadProgress(100);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setVideoFile(null);
        setVideoTitle('');
        setVideoDesc('');
        setVideoTags('');
        setVideoThumbnail(null);
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
  };

  const handleReelUpload = async () => {
    if (!reelFile) {
      setError('Please select a video for your reel');
      return;
    }
    setUploading(true);
    setError('');
    setUploadProgress(10);
    try {
      const videoUrl = await uploadFile(reelFile, 'reel');
      setUploadProgress(60);
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoUrl,
          caption: reelCaption,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create reel');
      setUploadProgress(100);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReelFile(null);
        setReelCaption('');
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
  };

  const handlePrivateUpload = async () => {
    if (!privateFile) {
      setError('Please select a video');
      return;
    }
    setUploading(true);
    setError('');
    setUploadProgress(10);
    try {
      const videoUrl = await uploadFile(privateFile, 'private');
      setUploadProgress(60);
      const res = await fetch('/api/private', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoUrl,
          title: privateTitle || 'Private Content',
          accessType: 'friends_only',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to upload');
      setUploadProgress(100);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPrivateFile(null);
        setPrivateTitle('');
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
  };

  const renderDropZone = (
    file: File | null,
    type: 'video' | 'reel' | 'private',
    setFile: (f: File | null) => void,
    accept: string = 'video/*'
  ) => (
    <div
      className={`gradient-border-primex rounded-2xl bg-mesh card-shine transition-all cursor-pointer relative overflow-hidden ${
        dragOver ? 'border-primex bg-primex/5 scale-[1.02]' : 'hover:border-primex/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => handleDrop(e, type)}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFileSelect(e, type)}
      />
      <div className="relative z-10 p-5 text-center">
        {file ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 justify-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primex/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primex" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <>
            <div className="orb-primex-sm -top-10 -right-10 float-medium" />
            <div className="orb-primex-sm -bottom-8 -left-8 opacity-50 float-slow" />
            <CloudUpload className="w-12 h-12 mx-auto text-primex/60 mb-3 float-slow" />
            <p className="text-sm font-medium mb-1">Drag & drop your file here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">
              {type === 'video' ? 'MP4, WebM, MOV up to 500MB' : type === 'reel' ? 'MP4, WebM (9:16 vertical)' : 'MP4, WebM (Friends only)'}
            </p>
          </>
        )}
      </div>
    </div>
  );

  const displayProgress = uploading ? Math.min(mockProgress, uploadProgress) : uploadProgress;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-4 bg-mesh relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-8 h-8 rounded-lg bg-primex/10 flex items-center justify-center"
          >
            <Upload className="w-4 h-4 text-primex" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-shimmer">Upload Content</h1>
            <p className="text-muted-foreground text-xs">Share your videos, reels, or private content</p>
          </div>
        </div>
      </div>

      {/* Upload Card */}
      <div className="glass-card-premium p-3 rounded-xl card-shine relative z-10">
        {/* Premium Tab Switcher with glass styling & active indicator */}
        <div className="glass-card p-1.5 rounded-xl w-full mb-4 flex relative">
          {/* Sliding active indicator */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-lg bg-primex/20 border border-primex/30"
            style={{ width: 'calc(33.333% - 4px)' }}
            animate={{ left: activeTab === 'video' ? '4px' : activeTab === 'reel' ? 'calc(33.333% + 2px)' : 'calc(66.666% + 0px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <button
            className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors hover-lift ${activeTab === 'video' ? 'text-primex' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('video')}
          >
            <Film className="w-4 h-4" />Long Video
          </button>
          <button
            className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors hover-lift ${activeTab === 'reel' ? 'text-primex' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('reel')}
          >
            <Play className="w-4 h-4" />Reel
          </button>
          <button
            className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors hover-lift ${activeTab === 'private' ? 'text-primex' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('private')}
          >
            <Lock className="w-4 h-4" />Private
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
            >
              <X className="w-4 h-4 shrink-0" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-3 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2 notification-pop"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />Upload successful!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Progress Bar */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="glass-card-hover p-2.5 rounded-xl">
              <div className="progress-bar h-2 mb-2">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
              <div className="progress-shimmer h-1 rounded-full mb-2" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-primex" />
                  Uploading... {Math.round(displayProgress)}%
                </p>
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="divider-primex mb-3" />

        {/* Long Video Tab */}
        {activeTab === 'video' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {renderDropZone(videoFile, 'video', setVideoFile)}
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Thumbnail</Label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="thumb-input"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setVideoThumbnail(f);
                }}
              />
              <button
                type="button"
                className="glass-input border-border/50 rounded-xl w-full hover-lift active-press px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2"
                onClick={() => document.getElementById('thumb-input')?.click()}
              >
                {videoThumbnail ? (
                  <><CheckCircle className="w-4 h-4 text-primex" />{videoThumbnail.name}</>
                ) : (
                  <><Upload className="w-4 h-4" />Choose Thumbnail</>
                )}
              </button>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Title *</Label>
              <Input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Give your video a title"
                className="glass-input border-border/50 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Description</Label>
              <Textarea
                value={videoDesc}
                onChange={(e) => setVideoDesc(e.target.value)}
                placeholder="Describe your video..."
                className="glass-input border-border/50 rounded-xl min-h-[100px]"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Tags (comma separated)</Label>
              <Input
                value={videoTags}
                onChange={(e) => setVideoTags(e.target.value)}
                placeholder="music, gaming, tutorial"
                className="glass-input border-border/50 h-11 rounded-xl"
              />
            </div>
            <button
              onClick={handleVideoUpload}
              disabled={uploading || !videoFile}
              className="btn-primex active-press w-full h-11 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <><div className="spinner-primex-sm mr-2" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Upload Video</>
              )}
            </button>
          </motion.div>
        )}

        <div className="divider-primex my-3" />

        {/* Reel Tab */}
        {activeTab === 'reel' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {renderDropZone(reelFile, 'reel', setReelFile)}
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Caption</Label>
              <Textarea
                value={reelCaption}
                onChange={(e) => setReelCaption(e.target.value)}
                placeholder="Add a caption to your reel..."
                className="glass-input border-border/50 rounded-xl min-h-[80px]"
              />
            </div>
            <button
              onClick={handleReelUpload}
              disabled={uploading || !reelFile}
              className="btn-primex active-press w-full h-11 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <><div className="spinner-primex-sm mr-2" />Uploading...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Upload Reel</>
              )}
            </button>
          </motion.div>
        )}

        {/* Private Tab */}
        {activeTab === 'private' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="glass-card-hover p-3 rounded-xl gradient-border-primex">
              <div className="flex items-center gap-2 text-primex mb-1">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Friends Only</span>
                <span className="tag-primex text-[10px] ml-auto">🔒 Private</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This content will only be visible to your accepted friends.
              </p>
            </div>
            {renderDropZone(privateFile, 'private', setPrivateFile)}
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">Title</Label>
              <Input
                value={privateTitle}
                onChange={(e) => setPrivateTitle(e.target.value)}
                placeholder="Private content title"
                className="glass-input border-border/50 h-11 rounded-xl"
              />
            </div>
            <button
              onClick={handlePrivateUpload}
              disabled={uploading || !privateFile}
              className="btn-primex active-press w-full h-11 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <><div className="spinner-primex-sm mr-2" />Uploading...</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" />Upload Private Content</>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
