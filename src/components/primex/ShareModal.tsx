'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Code2, Twitter, Facebook, Mail, Link2, QrCode, Check,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
}

export default function ShareModal({ isOpen, onClose, videoId, videoTitle }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'embed'>('share');

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?v=${videoId}`;
  const embedCode = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/${videoId}" width="560" height="315" frameborder="0" allowfullscreen title="${videoTitle}"></iframe>`;

  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      }
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      }
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out: ${videoTitle}`);
    const body = encodeURIComponent(`Watch this video on PrimeX: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="glass-card-premium w-full max-w-lg rounded-2xl relative z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="gradient-border-primex px-6 py-4 flex items-center justify-between border-b border-border/50">
              <div>
                <h2 className="text-lg font-bold text-shimmer">Share Video</h2>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[300px]">{videoTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors active-press"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-2">
              <button
                onClick={() => setActiveTab('share')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'share'
                    ? 'primex-gradient text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Link2 className="w-4 h-4 inline mr-1.5" />
                Share Link
              </button>
              <button
                onClick={() => setActiveTab('embed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'embed'
                    ? 'primex-gradient text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Code2 className="w-4 h-4 inline mr-1.5" />
                Embed Code
              </button>
            </div>

            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {activeTab === 'share' ? (
                  <motion.div
                    key="share"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Share Link */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Shareable Link</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 glass-input px-3 py-2.5 rounded-xl text-sm font-mono truncate">
                          {shareUrl}
                        </div>
                        <button
                          onClick={() => copyToClipboard(shareUrl, 'link')}
                          className={`p-2.5 rounded-xl transition-all active-press shrink-0 ${
                            copiedLink
                              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                              : 'bg-primex/10 text-primex border border-primex/20 hover:bg-primex/20'
                          }`}
                          aria-label="Copy link"
                        >
                          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      {copiedLink && (
                        <p className="text-xs text-green-400 mt-1 notification-pop">Link copied to clipboard!</p>
                      )}
                    </div>

                    {/* Share Options */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">Share to</label>
                      <div className="grid grid-cols-4 gap-3">
                        <button
                          onClick={shareToTwitter}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card hover:bg-white/10 transition-all hover-lift group"
                        >
                          <div className="w-10 h-10 rounded-full bg-sky-500/15 flex items-center justify-center group-hover:bg-sky-500/25 transition-colors">
                            <Twitter className="w-5 h-5 text-sky-400" />
                          </div>
                          <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Twitter</span>
                        </button>

                        <button
                          onClick={shareToFacebook}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card hover:bg-white/10 transition-all hover-lift group"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-600/15 flex items-center justify-center group-hover:bg-blue-600/25 transition-colors">
                            <Facebook className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Facebook</span>
                        </button>

                        <button
                          onClick={shareViaEmail}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card hover:bg-white/10 transition-all hover-lift group"
                        >
                          <div className="w-10 h-10 rounded-full bg-primex/15 flex items-center justify-center group-hover:bg-primex/25 transition-colors">
                            <Mail className="w-5 h-5 text-primex" />
                          </div>
                          <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Email</span>
                        </button>

                        <button
                          onClick={() => copyToClipboard(shareUrl, 'link')}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card hover:bg-white/10 transition-all hover-lift group"
                        >
                          <div className="w-10 h-10 rounded-full bg-primex-secondary/15 flex items-center justify-center group-hover:bg-primex-secondary/25 transition-colors">
                            {copiedLink ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-primex-secondary" />}
                          </div>
                          <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Copy</span>
                        </button>
                      </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">QR Code</label>
                      <div className="flex items-center gap-4 glass-card p-4 rounded-xl">
                        <div className="w-24 h-24 rounded-xl bg-white p-2 shrink-0">
                          {/* CSS-based QR code placeholder */}
                          <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-[2px]">
                            {[
                              1,1,1,0,1,
                              1,0,1,1,0,
                              1,1,1,0,1,
                              0,1,0,1,1,
                              1,0,1,1,1,
                            ].map((cell, i) => (
                              <div
                                key={i}
                                className={`rounded-[1px] ${cell ? 'bg-foreground' : 'bg-white'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <QrCode className="w-4 h-4 text-primex" />
                            Scan to Share
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Point your camera at this QR code to open the video link on any device.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="embed"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Embed Code */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Embed Code</label>
                      <div className="relative">
                        <textarea
                          readOnly
                          value={embedCode}
                          className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono resize-none h-28 text-muted-foreground focus:ring-0"
                          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        />
                        <button
                          onClick={() => copyToClipboard(embedCode, 'embed')}
                          className={`absolute top-3 right-3 p-2 rounded-lg transition-all active-press ${
                            copiedEmbed
                              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                              : 'bg-primex/10 text-primex border border-primex/20 hover:bg-primex/20'
                          }`}
                          aria-label="Copy embed code"
                        >
                          {copiedEmbed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      {copiedEmbed && (
                        <p className="text-xs text-green-400 mt-1 notification-pop">Embed code copied!</p>
                      )}
                    </div>

                    {/* Embed Preview */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">Preview</label>
                      <div className="glass-card p-4 rounded-xl">
                        <div className="aspect-video rounded-lg bg-black/40 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primex/10 to-primex-secondary/10" />
                          <div className="relative text-center">
                            <div className="w-12 h-12 rounded-full primex-gradient flex items-center justify-center mx-auto mb-2">
                              <svg className="w-5 h-5 text-white fill-white ml-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            <p className="text-xs text-muted-foreground">Embedded Player</p>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground bg-black/50 px-1.5 py-0.5 rounded">PrimeX</span>
                            <span className="text-[10px] text-muted-foreground bg-black/50 px-1.5 py-0.5 rounded truncate max-w-[150px]">{videoTitle}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Embed Options */}
                    <div className="divider-primex" />
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Embed Options</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="tag-primex">Responsive</span>
                        <span className="tag-primex">Autoplay</span>
                        <span className="tag-primex">Muted</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        Customize the embed code parameters to suit your needs.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
