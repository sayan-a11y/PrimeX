'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Types ────────────────────────────────────────────────── */
interface StoryItem {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  gradient: string;
  viewed: boolean;
  timestamp: string;
}

/* ── Gradient Presets for Story Content ───────────────────── */
const storyGradients = [
  'from-pink-500 via-primex to-purple-600',
  'from-blue-500 via-teal-400 to-emerald-500',
  'from-orange-500 via-red-500 to-pink-500',
  'from-violet-500 via-purple-500 to-indigo-500',
  'from-cyan-400 via-blue-500 to-purple-500',
  'from-rose-400 via-fuchsia-500 to-indigo-500',
  'from-emerald-400 via-cyan-500 to-blue-500',
  'from-amber-400 via-orange-500 to-red-400',
  'from-teal-400 via-emerald-500 to-lime-400',
  'from-indigo-500 via-violet-500 to-purple-500',
];

/* ── No mock/demo data — stories come from real data sources ── */

/* ── Story Viewer ─────────────────────────────────────────── */
function StoryViewer({
  stories,
  initialIndex,
  onClose,
}: {
  stories: StoryItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());
  const STORY_DURATION = 5000; // 5 seconds

  const story = stories[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Reset start time when story index changes
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [currentIndex]);

  // Auto-advance timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        goNext();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      {/* Story Content Container */}
      <div className="relative w-full max-w-lg h-full max-h-[100dvh] sm:rounded-2xl sm:max-h-[90vh] overflow-hidden">
        {/* Gradient Background (Story Content) */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${story.gradient}`}
          style={{ transition: 'background 0.5s ease' }}
        />

        {/* Noise overlay */}
        <div className="absolute inset-0 bg-noise opacity-30" />

        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-2">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width:
                    i < currentIndex
                      ? '100%'
                      : i === currentIndex
                        ? `${progress}%`
                        : '0%',
                  transition: i === currentIndex ? 'width 50ms linear' : 'width 0.3s ease',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full p-[2px] bg-gradient-to-tr from-primex to-primex-secondary">
              <Avatar className="w-9 h-9 border-2 border-black">
                <AvatarImage src={story.avatar || ''} />
                <AvatarFallback className="bg-primex/30 text-white text-sm font-bold">
                  {story.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">@{story.username}</p>
              <p className="text-white/60 text-[11px]">{story.timestamp}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3">
              <span className="text-3xl">
                {currentIndex % 3 === 0 ? '🎬' : currentIndex % 3 === 1 ? '🎵' : '✨'}
              </span>
            </div>
            <p className="text-white/80 text-lg font-medium">
              @{story.username}&apos;s Story
            </p>
            <p className="text-white/50 text-sm mt-1">Tap to see more</p>
          </div>
        </div>

        {/* Navigation Areas */}
        <div className="absolute inset-0 z-10 flex">
          {/* Left tap zone */}
          <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
          {/* Right tap zone */}
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full cursor-pointer" onClick={goNext} />
        </div>

        {/* Navigation Arrows (desktop) */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Reply Input */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 glass-input rounded-full px-4 py-2.5 text-white/60 text-sm">
              Reply to @{story.username}...
            </div>
            <button className="w-10 h-10 rounded-full primex-gradient flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity">
              <svg className="w-5 h-5 text-white rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export default function StoriesBar() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [loading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // No mock data — stories will be populated from API when available

  const openStory = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
    // Mark as viewed
    setStories((prev) =>
      prev.map((s, i) => (i === index ? { ...s, viewed: true } : s))
    );
  };

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 px-3 py-2 overflow-x-auto no-scrollbar">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-14 h-14 rounded-full skeleton-pulse" />
            <div className="w-12 h-2.5 rounded skeleton-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Stories Bar */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {/* Your Story (Add) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1 shrink-0 group"
            onClick={() => {
              /* Would open camera/upload */
            }}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-white/20 group-hover:border-primex/50 transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primex transition-colors" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground group-hover:text-primex transition-colors">
              Add
            </span>
          </motion.button>

          {/* Story Items */}
          {stories.length > 0 && stories.map((story, i) => (
            <motion.button
              key={story.id}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 shrink-0 group"
              onClick={() => openStory(i)}
            >
              <div className="relative">
                {/* Gradient Ring */}
                <div
                  className={`rounded-full p-[2.5px] transition-all ${
                    story.viewed
                      ? 'bg-gray-500/50'
                      : 'bg-gradient-to-tr from-primex via-primex-secondary to-primex-tertiary'
                  }`}
                >
                  <Avatar className="w-[52px] h-[52px] border-2 border-background group-hover:scale-105 transition-transform">
                    <AvatarImage src={story.avatar || ''} />
                    <AvatarFallback className="bg-primex/20 text-primex text-lg font-bold">
                      {story.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {/* Unviewed indicator dot */}
                {!story.viewed && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primex border-2 border-background badge-pulse" />
                )}
              </div>
              <span
                className={`text-[11px] max-w-[64px] truncate ${
                  story.viewed ? 'text-muted-foreground' : 'text-foreground font-medium'
                }`}
              >
                {story.username}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {viewerOpen && (
          <StoryViewer
            stories={stories}
            initialIndex={viewerIndex}
            onClose={closeViewer}
          />
        )}
      </AnimatePresence>
    </>
  );
}
