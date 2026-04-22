'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Film, Play, Lock, X, CheckCircle, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const { token, setCurrentView } = useAppStore();
  const [activeTab, setActiveTab] = useState('video');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

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
  const thumbInputRef = useRef<HTMLInputElement>(null);

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
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
        dragOver ? 'border-primex bg-primex/5' : 'border-border/50 hover:border-primex/50'
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
      {file ? (
        <div className="flex items-center gap-3 justify-center">
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
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <CloudUpload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium mb-1">Drag & drop your file here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
          <p className="text-xs text-muted-foreground mt-2">
            {type === 'video' ? 'MP4, WebM, MOV up to 500MB' : type === 'reel' ? 'MP4, WebM (9:16 vertical)' : 'MP4, WebM (Friends only)'}
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold primex-gradient-text">Upload Content</h1>
        <p className="text-muted-foreground text-sm mt-1">Share your videos, reels, or private content</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card w-full h-11 rounded-xl p-1 mb-6">
          <TabsTrigger value="video" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white">
            <Film className="w-4 h-4 mr-2" />Long Video
          </TabsTrigger>
          <TabsTrigger value="reel" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white">
            <Play className="w-4 h-4 mr-2" />Reel
          </TabsTrigger>
          <TabsTrigger value="private" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white">
            <Lock className="w-4 h-4 mr-2" />Private
          </TabsTrigger>
        </TabsList>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />Upload successful!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        {uploading && (
          <div className="mb-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full primex-gradient rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Long Video Tab */}
        <TabsContent value="video" className="space-y-4">
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
            <Button
              type="button"
              variant="outline"
              className="glass-card border-border/50 rounded-xl w-full"
              onClick={() => document.getElementById('thumb-input')?.click()}
            >
              {videoThumbnail ? videoThumbnail.name : 'Choose Thumbnail'}
            </Button>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">Title *</Label>
            <Input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Give your video a title"
              className="bg-muted/50 border-border/50 h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">Description</Label>
            <Textarea
              value={videoDesc}
              onChange={(e) => setVideoDesc(e.target.value)}
              placeholder="Describe your video..."
              className="bg-muted/50 border-border/50 rounded-xl min-h-[100px]"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">Tags (comma separated)</Label>
            <Input
              value={videoTags}
              onChange={(e) => setVideoTags(e.target.value)}
              placeholder="music, gaming, tutorial"
              className="bg-muted/50 border-border/50 h-11 rounded-xl"
            />
          </div>
          <Button
            onClick={handleVideoUpload}
            disabled={uploading || !videoFile}
            className="w-full h-11 rounded-xl primex-gradient text-white font-medium hover:opacity-90 glow-effect"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </TabsContent>

        {/* Reel Tab */}
        <TabsContent value="reel" className="space-y-4">
          {renderDropZone(reelFile, 'reel', setReelFile)}
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">Caption</Label>
            <Textarea
              value={reelCaption}
              onChange={(e) => setReelCaption(e.target.value)}
              placeholder="Add a caption to your reel..."
              className="bg-muted/50 border-border/50 rounded-xl min-h-[80px]"
            />
          </div>
          <Button
            onClick={handleReelUpload}
            disabled={uploading || !reelFile}
            className="w-full h-11 rounded-xl primex-gradient text-white font-medium hover:opacity-90 glow-effect"
          >
            {uploading ? 'Uploading...' : 'Upload Reel'}
          </Button>
        </TabsContent>

        {/* Private Tab */}
        <TabsContent value="private" className="space-y-4">
          <div className="glass-card p-4 rounded-xl mb-2 border-primex/20">
            <div className="flex items-center gap-2 text-primex mb-1">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Friends Only</span>
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
              className="bg-muted/50 border-border/50 h-11 rounded-xl"
            />
          </div>
          <Button
            onClick={handlePrivateUpload}
            disabled={uploading || !privateFile}
            className="w-full h-11 rounded-xl primex-gradient text-white font-medium hover:opacity-90 glow-effect"
          >
            {uploading ? 'Uploading...' : 'Upload Private Content'}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
