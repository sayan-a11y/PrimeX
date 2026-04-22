'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

/* ── Shortcut data ─────────────────────────────────────────── */
interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘/Ctrl', 'K'], description: 'Focus search bar' },
      { keys: ['⌘/Ctrl', '1'], description: 'Go Home' },
      { keys: ['⌘/Ctrl', '2'], description: 'Go Explore' },
      { keys: ['⌘/Ctrl', '3'], description: 'Go Reels' },
      { keys: ['⌘/Ctrl', '4'], description: 'Go Live' },
      { keys: ['⌘/Ctrl', '5'], description: 'Go Upload' },
    ],
  },
  {
    title: 'Video',
    shortcuts: [
      { keys: ['J'], description: 'Scroll down in feeds' },
      { keys: ['K'], description: 'Scroll up in feeds' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modals/panels' },
    ],
  },
];

/* ── Key Badge ─────────────────────────────────────────────── */
function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md bg-white/10 border border-white/20 text-xs font-mono text-foreground/90 shadow-sm">
      {children}
    </kbd>
  );
}

/* ── KeyboardShortcutsOverlay ──────────────────────────────── */
interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative glass-card-premium rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/30">
              <div className="flex items-center gap-2.5">
                <Keyboard className="w-5 h-5 text-primex" />
                <h2 className="text-lg font-bold text-shimmer">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-68px)] premium-scrollbar">
              {SHORTCUT_GROUPS.map((group, gi) => (
                <div key={group.title} className={gi > 0 ? 'mt-5' : ''}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.description}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm text-foreground/80">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              {ki > 0 && <span className="text-muted-foreground/40 text-xs">+</span>}
                              <KeyBadge>{key}</KeyBadge>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {gi < SHORTCUT_GROUPS.length - 1 && <div className="divider-primex mt-4" />}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
