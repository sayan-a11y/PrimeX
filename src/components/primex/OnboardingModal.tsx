'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Film, Play, MessageCircle,
  Lock, Sparkles, Eye, Bell, Moon, Upload, Users, Compass,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 3;

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const handleComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('primex_onboarding_completed', 'true');
    }
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const next = () => {
    setDirection(1);
    handleNext();
  };

  const back = () => {
    setDirection(-1);
    handleBack();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={handleSkip}
        >
          {/* Backdrop with bg-mesh */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg bg-mesh" />

          {/* Decorative orbs */}
          <div className="absolute top-1/4 left-1/4 orb-primex opacity-30 float-slow" />
          <div className="absolute bottom-1/4 right-1/4 orb-primex-sm opacity-20 float-medium" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card-premium w-full max-w-md rounded-2xl relative z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 z-20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5"
            >
              Skip <X className="w-3 h-3" />
            </button>

            {/* Step Content */}
            <div className="min-h-[380px] overflow-hidden relative">
              <AnimatePresence mode="wait" custom={direction}>
                {currentStep === 0 && (
                  <motion.div
                    key="step-0"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="p-6 pt-10"
                  >
                    {/* Welcome illustration */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        className="w-20 h-20 rounded-2xl shadow-lg shadow-primex/30 overflow-hidden"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <img src="/primex-logo.png" alt="PrimeX" className="w-full h-full object-contain" />
                      </motion.div>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-2">
                      Welcome to <span className="text-shimmer">PrimeX</span>!
                    </h2>
                    <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
                      Your premium video and social platform. Discover amazing content, connect with creators, and share your own.
                    </p>

                    {/* Feature highlights */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Film, label: 'Long Videos', desc: '4K quality streaming', color: 'bg-primex/10', iconColor: 'text-primex' },
                        { icon: Play, label: 'Short Reels', desc: 'Quick entertainment', color: 'bg-primex-secondary/10', iconColor: 'text-primex-secondary' },
                        { icon: MessageCircle, label: 'Real-time Chat', desc: 'Stay connected', color: 'bg-primex-tertiary/10', iconColor: 'text-primex-tertiary' },
                        { icon: Lock, label: 'Private Content', desc: 'Friends-only access', color: 'bg-primex-hot/10', iconColor: 'text-primex-hot' },
                      ].map((feature) => (
                        <motion.div
                          key={feature.label}
                          className="glass-card p-3 rounded-xl flex items-center gap-2.5 hover-lift"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className={`w-9 h-9 rounded-lg ${feature.color} flex items-center justify-center shrink-0`}>
                            <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{feature.label}</p>
                            <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="p-6 pt-10"
                  >
                    {/* Customize illustration */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        className="w-20 h-20 rounded-2xl bg-primex-secondary/20 flex items-center justify-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Eye className="w-10 h-10 text-primex-secondary" />
                      </motion.div>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-2">
                      Customize Your <span className="text-shimmer">Experience</span>
                    </h2>
                    <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                      Set up your preferences to get the most out of PrimeX.
                    </p>

                    {/* Toggle options */}
                    <div className="space-y-3">
                      {[
                        {
                          icon: Play,
                          label: 'Autoplay Videos',
                          desc: 'Videos play automatically when you scroll',
                          checked: autoplay,
                          onChange: () => setAutoplay(!autoplay),
                        },
                        {
                          icon: Bell,
                          label: 'Push Notifications',
                          desc: 'Get notified about new content and interactions',
                          checked: notifications,
                          onChange: () => setNotifications(!notifications),
                        },
                        {
                          icon: Moon,
                          label: 'Dark Theme',
                          desc: 'Use the dark color scheme (recommended)',
                          checked: darkTheme,
                          onChange: () => setDarkTheme(!darkTheme),
                        },
                      ].map((option) => (
                        <div
                          key={option.label}
                          className="glass-card p-3.5 rounded-xl flex items-center gap-3 hover-lift cursor-pointer group"
                          onClick={option.onChange}
                        >
                          <div className="w-9 h-9 rounded-lg bg-primex/10 flex items-center justify-center shrink-0 group-hover:bg-primex/15 transition-colors">
                            <option.icon className="w-4 h-4 text-primex" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-[11px] text-muted-foreground">{option.desc}</p>
                          </div>
                          {/* Toggle switch */}
                          <div
                            className={`w-10 h-5.5 rounded-full relative transition-colors duration-300 ${
                              option.checked ? 'bg-primex' : 'bg-muted'
                            }`}
                            style={{ height: '22px' }}
                          >
                            <motion.div
                              className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                              style={{ width: '18px', height: '18px' }}
                              animate={{
                                left: option.checked ? '20px' : '2px',
                              }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="p-6 pt-10"
                  >
                    {/* Ready illustration */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        className="w-20 h-20 rounded-2xl bg-success/20 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Check className="w-10 h-10 text-success" />
                      </motion.div>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-2">
                      You&apos;re All <span className="text-shimmer">Set</span>!
                    </h2>
                    <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                      Your PrimeX experience is ready. Choose where to start!
                    </p>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <button
                        className="btn-primex w-full flex items-center justify-center gap-2.5 py-3"
                        onClick={() => {
                          handleComplete();
                          setCurrentView('home');
                        }}
                      >
                        <Compass className="w-5 h-5" />
                        Explore Videos
                      </button>

                      <button
                        className="btn-outline-primex w-full flex items-center justify-center gap-2.5 py-3"
                        onClick={() => {
                          handleComplete();
                          setCurrentView('friends');
                        }}
                      >
                        <Users className="w-5 h-5" />
                        Find Friends
                      </button>

                      <button
                        className="btn-ghost-primex w-full flex items-center justify-center gap-2.5 py-3"
                        onClick={() => {
                          handleComplete();
                          setCurrentView('upload');
                        }}
                      >
                        <Upload className="w-5 h-5" />
                        Upload Content
                      </button>
                    </div>

                    {/* Quick tip */}
                    <div className="mt-5 glass-card p-3 rounded-xl">
                      <p className="text-[11px] text-muted-foreground text-center">
                        💡 <span className="text-foreground font-medium">Pro tip:</span> Use the sidebar to navigate between sections. You can always change your preferences in Settings.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="divider-primex" />

            {/* Footer: Progress Dots + Navigation */}
            <div className="px-6 py-4 flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentStep
                        ? 'w-6 h-2 bg-primex'
                        : i < currentStep
                          ? 'w-2 h-2 bg-primex/50 hover:bg-primex/70'
                          : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={back}
                    className="btn-ghost-primex btn-sm flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="btn-primex btn-sm flex items-center gap-1"
                >
                  {currentStep === TOTAL_STEPS - 1 ? (
                    <>
                      Get Started
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
