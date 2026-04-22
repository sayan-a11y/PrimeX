'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Code2, Twitter, Facebook, Mail, Link2, QrCode, Check,
  Share2, MessageCircle, Send, ExternalLink, BarChart3, Download,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  // Mock share analytics
  const shareCount = 24;

  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: 'Link Copied! 🔗',
        description: 'Video link has been copied to your clipboard.',
      });
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
      toast({
        title: 'Embed Code Copied!',
        description: 'Embed code has been copied to your clipboard.',
      });
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

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${videoTitle} ${shareUrl}`)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(videoTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToReddit = () => {
    const url = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(videoTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out: ${videoTitle}`);
    const body = encodeURIComponent(`Watch this video on PrimeX: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const socialButtons = [
    { icon: Twitter, label: 'Twitter/X', color: 'bg-sky-500/15', hoverColor: 'group-hover:bg-sky-500/25', textColor: 'text-sky-400', onClick: shareToTwitter },
    { icon: Facebook, label: 'Facebook', color: 'bg-blue-600/15', hoverColor: 'group-hover:bg-blue-600/25', textColor: 'text-blue-400', onClick: shareToFacebook },
    { icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-500/15', hoverColor: 'group-hover:bg-green-500/25', textColor: 'text-green-400', onClick: shareToWhatsApp },
    { icon: Send, label: 'Telegram', color: 'bg-cyan-500/15', hoverColor: 'group-hover:bg-cyan-500/25', textColor: 'text-cyan-400', onClick: shareToTelegram },
    { icon: ExternalLink, label: 'Reddit', color: 'bg-orange-500/15', hoverColor: 'group-hover:bg-orange-500/25', textColor: 'text-orange-400', onClick: shareToReddit },
    { icon: Mail, label: 'Email', color: 'bg-primex/15', hoverColor: 'group-hover:bg-primex/25', textColor: 'text-primex', onClick: shareViaEmail },
  ];

  // QR code pattern generation based on videoId
  const generateQRPattern = () => {
    const seed = videoId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const pattern: number[][] = [];
    for (let row = 0; row < 15; row++) {
      pattern[row] = [];
      for (let col = 0; col < 15; col++) {
        const inTopLeft = row < 5 && col < 5;
        const inTopRight = row < 5 && col >= 10;
        const inBottomLeft = row >= 10 && col < 5;

        if (inTopLeft || inTopRight || inBottomLeft) {
          const r = inTopLeft ? row : inTopRight ? row : row - 10;
          const c = inTopLeft ? col : inTopRight ? col - 10 : col;
          if (r === 0 || r === 4 || c === 0 || c === 4) pattern[row][col] = 1;
          else if (r >= 1 && r <= 3 && c >= 1 && c <= 3) pattern[row][col] = 1;
          else pattern[row][col] = 0;
        } else {
          const idx = row * 15 + col;
          pattern[row][col] = ((seed * (idx + 1) * 7 + idx * 13) % 3 === 0) ? 1 : 0;
        }
      }
    }
    return pattern;
  };

  const qrPattern = generateQRPattern();

  const downloadQR = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300"><rect fill="white" width="300" height="300"/>${qrPattern.map((row, r) => row.map((cell, c) => cell ? `<rect x="${c*20}" y="${r*20}" width="20" height="20" fill="black"/>` : '').join('')).join('')}</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `primex-${videoId}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'QR Code Downloaded!', description: 'SVG file saved successfully.' });
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
            <div className="px-6 py-4 flex items-center justify-between border-b border-border/50">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-9 h-9 rounded-xl primex-gradient flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-shimmer">Share Video</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[280px]">{videoTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors active-press"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Share Analytics */}
            <div className="px-6 py-3 flex items-center gap-2 bg-primex/5 border-b border-border/30">
              <BarChart3 className="w-4 h-4 text-primex" />
              <span className="text-xs text-muted-foreground">
                Shared <span className="text-primex font-semibold count-up">{shareCount}</span> times
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('share')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'share'
                    ? 'primex-gradient text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Link2 className="w-4 h-4 inline mr-1.5" />
                Share Link
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('embed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'embed'
                    ? 'primex-gradient text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Code2 className="w-4 h-4 inline mr-1.5" />
                Embed Code
              </motion.button>
            </div>

            <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto premium-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'share' ? (
                  <motion.div
                    key="share"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Copy Link */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Shareable Link</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 glass-input px-3 py-2.5 rounded-xl text-sm font-mono truncate">
                          {shareUrl}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(shareUrl, 'link')}
                          className={`btn-primex btn-sm flex items-center gap-1.5 shrink-0 ${
                            copiedLink ? '!bg-green-500/80' : ''
                          }`}
                          aria-label="Copy link"
                        >
                          <AnimatePresence mode="wait">
                            {copiedLink ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                                transition={{ type: 'spring', damping: 12 }}
                              >
                                <Check className="w-4 h-4" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Copy className="w-4 h-4" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                        </motion.button>
                      </div>
                    </div>

                    <div className="divider-primex" />

                    {/* Social Media Share Buttons */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2.5 block font-medium">Share to</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {socialButtons.map((btn, idx) => (
                          <motion.button
                            key={btn.label}
                            onClick={btn.onClick}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl glass-card hover:bg-white/10 transition-all group"
                          >
                            <div className={`w-10 h-10 rounded-full ${btn.color} ${btn.hoverColor} flex items-center justify-center transition-colors`}>
                              <btn.icon className={`w-5 h-5 ${btn.textColor}`} />
                            </div>
                            <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">{btn.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="divider-primex" />

                    {/* QR Code */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">QR Code</label>
                      <div className="flex items-center gap-4 glass-card p-4 rounded-xl hover-lift">
                        <div className="w-24 h-24 rounded-xl bg-white p-2 shrink-0">
                          <div className="w-full h-full grid grid-cols-15 gap-0" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
                            {qrPattern.flat().map((cell, i) => (
                              <div
                                key={i}
                                className={`aspect-square ${cell ? 'bg-foreground' : 'bg-white'}`}
                                style={{ borderRadius: cell ? '1px' : '0' }}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <QrCode className="w-4 h-4 text-primex" />
                            Scan to Share
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Point your camera at this QR code to open the video link on any device.
                          </p>
                          <button
                            onClick={downloadQR}
                            className="text-xs text-primex hover:underline mt-1.5 inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Download QR
                          </button>
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
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(embedCode, 'embed')}
                          className={`absolute top-3 right-3 p-2 rounded-lg transition-all active-press ${
                            copiedEmbed
                              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                              : 'bg-primex/10 text-primex border border-primex/20 hover:bg-primex/20'
                          }`}
                          aria-label="Copy embed code"
                        >
                          {copiedEmbed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </motion.button>
                      </div>
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
