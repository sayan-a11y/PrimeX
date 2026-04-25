'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Lock, Eye } from 'lucide-react';

interface ContentWarningProps {
  /** Type of content warning */
  type?: 'mature' | 'private';
  /** Whether to show the warning overlay */
  show?: boolean;
  /** Callback when user confirms to reveal content */
  onReveal?: () => void;
  /** Custom warning message */
  message?: string;
  /** Additional description */
  description?: string;
}

export default function ContentWarning({
  type = 'mature',
  show = true,
  onReveal,
  message,
  description,
}: ContentWarningProps) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isMature = type === 'mature';

  const defaultMessages = {
    mature: {
      title: 'Mature Content',
      description: 'This content is for mature audiences only. Please confirm your age to proceed.',
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/15',
      borderColor: 'border-yellow-500/30',
    },
    private: {
      title: 'Friends Only',
      description: 'This content is only visible to friends of the creator.',
      icon: Lock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/15',
      borderColor: 'border-blue-500/30',
    },
  };

  const config = defaultMessages[type];
  const IconComp = config.icon;

  const handleReveal = useCallback(() => {
    if (isMature && !ageConfirmed) return;
    setRevealed(true);
    onReveal?.();
  }, [isMature, ageConfirmed, onReveal]);

  if (!show || revealed) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(0px)' }}
      className="absolute inset-0 z-20 flex items-center justify-center"
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md rounded-xl" />

      {/* Warning Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative glass-card-premium p-5 mx-4 max-w-xs text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${config.bgColor} flex items-center justify-center mx-auto mb-3`}>
          <IconComp className={`w-7 h-7 ${config.color}`} />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-foreground mb-1">
          {message || config.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {description || config.description}
        </p>

        <div className="divider-primex mb-4" />

        {/* Age Confirmation (for mature content) */}
        {isMature && (
          <label className="flex items-center gap-2.5 mb-4 cursor-pointer justify-center">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                ageConfirmed
                  ? 'bg-primex border-primex'
                  : `${config.borderColor} hover:border-primex/60`
              }`}
              onClick={() => setAgeConfirmed(!ageConfirmed)}
            >
              {ageConfirmed && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </motion.svg>
              )}
            </div>
            <span className="text-sm text-foreground/80">I am 18+ years old</span>
          </label>
        )}

        {/* Show Content Button */}
        <button
          onClick={handleReveal}
          disabled={isMature && !ageConfirmed}
          className={`btn-primex w-full flex items-center justify-center gap-2 ${
            isMature && !ageConfirmed ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Eye className="w-4 h-4" />
          Show Content
        </button>

        {/* Shield badge */}
        <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <Shield className="w-3 h-3" />
          Content protected by PrimeX
        </div>
      </motion.div>
    </motion.div>
  );
}
