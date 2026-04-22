'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';

interface KeyboardShortcutsOptions {
  onShowShortcuts: () => void;
  onHideShortcuts: () => void;
  onCloseModal?: () => void;
  onFocusSearch?: () => void;
}

export function useKeyboardShortcuts({
  onShowShortcuts,
  onHideShortcuts,
  onCloseModal,
  onFocusSearch,
}: KeyboardShortcutsOptions) {
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInput =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable;

      const isMod = e.metaKey || e.ctrlKey;

      // ── Ctrl/Cmd + K → Focus search ─────────────
      if (isMod && e.key === 'k') {
        e.preventDefault();
        onFocusSearch?.();
        return;
      }

      // ── Ctrl/Cmd + 1-5 → Navigation ─────────────
      if (isMod && e.key === '1') {
        e.preventDefault();
        setCurrentView('home');
        return;
      }
      if (isMod && e.key === '2') {
        e.preventDefault();
        setCurrentView('explore');
        return;
      }
      if (isMod && e.key === '3') {
        e.preventDefault();
        setCurrentView('reels');
        return;
      }
      if (isMod && e.key === '4') {
        e.preventDefault();
        setCurrentView('live');
        return;
      }
      if (isMod && e.key === '5') {
        e.preventDefault();
        setCurrentView('upload');
        return;
      }

      // ── Escape → Close modals/panels ─────────────
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseModal?.();
        onHideShortcuts();
        return;
      }

      // ── ? → Show shortcuts help ──────────────────
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        onShowShortcuts();
        return;
      }

      // ── J/K → Scroll down/up in feeds ────────────
      if (!isInput) {
        if (e.key === 'j' || e.key === 'J') {
          e.preventDefault();
          window.scrollBy({ top: 300, behavior: 'smooth' });
          return;
        }
        if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          window.scrollBy({ top: -300, behavior: 'smooth' });
          return;
        }
      }
    },
    [setCurrentView, onShowShortcuts, onHideShortcuts, onCloseModal, onFocusSearch]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
