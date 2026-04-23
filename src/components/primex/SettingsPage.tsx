'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, User, Shield, Palette, Bell, Eye, HardDrive,
  Trash2, Download, Lock, Save, Check, AlertTriangle,
  Monitor, Moon, ChevronRight, Pencil, Globe, Users,
  Wifi, MessageSquare, Heart, MessageCircle, Play,
  Film, Gauge, X, Database, Archive
} from 'lucide-react';

type AccentColor = 'primex' | 'rose' | 'amber' | 'emerald' | 'cyan';
type ProfileVisibility = 'public' | 'friends' | 'private';
type VideoQuality = 'auto' | '4k' | '1080p' | '720p' | '480p';

const accentColors: { id: AccentColor; label: string; color: string }[] = [
  { id: 'primex', label: 'Primex', color: 'oklch(0.75 0.18 330)' },
  { id: 'rose', label: 'Rose', color: 'oklch(0.7 0.2 350)' },
  { id: 'amber', label: 'Amber', color: 'oklch(0.78 0.16 75)' },
  { id: 'emerald', label: 'Emerald', color: 'oklch(0.72 0.19 155)' },
  { id: 'cyan', label: 'Cyan', color: 'oklch(0.72 0.15 200)' },
];

// Lazy-load saved settings from localStorage
function loadSavedSettings() {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('primex_settings');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function SettingsPage() {
  const { user } = useAppStore();

  // Load persisted settings once via lazy initializer
  const [saved] = useState(loadSavedSettings);

  // Account state
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [usernameValue, setUsernameValue] = useState(user?.username || '');
  const [emailValue, setEmailValue] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Privacy state
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(saved.profileVisibility || 'public');
  const [showOnlineStatus, setShowOnlineStatus] = useState(saved.showOnlineStatus ?? true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(saved.allowFriendRequests ?? true);
  const [showActivityStatus, setShowActivityStatus] = useState(saved.showActivityStatus ?? true);

  // Appearance state
  const [accentColor, setAccentColor] = useState<AccentColor>(saved.accentColor || 'primex');
  const [compactMode, setCompactMode] = useState(saved.compactMode ?? false);
  const [animations, setAnimations] = useState(saved.animations ?? true);

  // Notifications state
  const [pushNotifications, setPushNotifications] = useState(saved.pushNotifications ?? true);
  const [emailNotifications, setEmailNotifications] = useState(saved.emailNotifications ?? true);
  const [friendRequestNotifications, setFriendRequestNotifications] = useState(saved.friendRequestNotifications ?? true);
  const [likeNotifications, setLikeNotifications] = useState(saved.likeNotifications ?? true);
  const [commentNotifications, setCommentNotifications] = useState(saved.commentNotifications ?? true);
  const [messageNotifications, setMessageNotifications] = useState(saved.messageNotifications ?? true);

  // Content preferences state
  const [autoplayVideos, setAutoplayVideos] = useState(saved.autoplayVideos ?? true);
  const [autoplayReels, setAutoplayReels] = useState(saved.autoplayReels ?? true);
  const [defaultVideoQuality, setDefaultVideoQuality] = useState<VideoQuality>(saved.defaultVideoQuality || 'auto');
  const [showMatureContent, setShowMatureContent] = useState(saved.showMatureContent ?? false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);

  // Data & Storage state
  const [storageUsed, setStorageUsed] = useState(saved.storageUsed ?? 42);
  const [clearingCache, setClearingCache] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveSettings = () => {
    const settings = {
      profileVisibility,
      showOnlineStatus,
      allowFriendRequests,
      showActivityStatus,
      accentColor,
      compactMode,
      animations,
      pushNotifications,
      emailNotifications,
      friendRequestNotifications,
      likeNotifications,
      commentNotifications,
      messageNotifications,
      autoplayVideos,
      autoplayReels,
      defaultVideoQuality,
      showMatureContent,
      storageUsed,
    };
    localStorage.setItem('primex_settings', JSON.stringify(settings));
    showToast('Settings saved successfully!');
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    await new Promise(r => setTimeout(r, 1500));
    setStorageUsed(Math.max(0, storageUsed - 20));
    setClearingCache(false);
    showToast('Cache cleared successfully!');
  };

  const handleDownloadData = async () => {
    setDownloadingData(true);
    await new Promise(r => setTimeout(r, 2000));
    setDownloadingData(false);
    showToast('Data download started! Check your email.');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      showToast('Account deletion requested. You will receive a confirmation email.', 'error');
    }
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated successfully!');
  };

  const handleSaveUsername = () => {
    if (usernameValue.trim().length < 3) {
      showToast('Username must be at least 3 characters', 'error');
      return;
    }
    setEditingUsername(false);
    showToast('Username updated!');
  };

  const handleSaveEmail = () => {
    if (!emailValue.includes('@')) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    setEditingEmail(false);
    showToast('Email updated! Verification sent.');
  };

  const sectionGap = compactMode ? 'gap-2' : 'gap-4';
  const cardPadding = compactMode ? 'p-3' : 'p-4';
  const itemGap = compactMode ? 'gap-1.5' : 'gap-3';

  return (
    <div className="min-h-screen bg-background">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border ${
              toast.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-card-premium p-4 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                All your data, videos, messages, and content will be permanently deleted. Type <span className="text-red-400 font-bold">DELETE</span> to confirm.
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="glass-input mb-3"
              />
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  disabled={deleteConfirmText !== 'DELETE'}
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Forever
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Age Verification Modal */}
      <AnimatePresence>
        {showAgeVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAgeVerification(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-card-premium p-4 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Age Verification</h3>
                  <p className="text-sm text-muted-foreground">Confirm you are 18+</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Mature content may include adult themes, violence, or other age-restricted material. By enabling this, you confirm that you are at least 18 years old.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => { setShowAgeVerification(false); setShowMatureContent(false); }}
                >
                  I&apos;m Under 18
                </Button>
                <Button
                  className="flex-1 btn-primex"
                  onClick={() => { setShowAgeVerification(false); setShowMatureContent(true); showToast('Mature content enabled'); }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  I&apos;m 18 or Older
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-30 glass-header border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl primex-gradient flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold primex-gradient-text">Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your account & preferences</p>
            </div>
          </div>
          <Button className="btn-primex" onClick={saveSettings}>
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <Tabs defaultValue="account" className={`flex flex-col ${sectionGap}`}>
          <TabsList className="glass-card p-1.5 h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-primex/10 data-[state=active]:text-primex">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2 data-[state=active]:bg-primex/10 data-[state=active]:text-primex">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-primex/10 data-[state=active]:text-primex">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primex/10 data-[state=active]:text-primex">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-primex/10 data-[state=active]:text-primex">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2 data-[state=active]:bg-primex/10 data-[state=active]:text-primex">
              <HardDrive className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── ACCOUNT ─── */}
          <TabsContent value="account" className={`flex flex-col ${sectionGap} mt-0`}>
            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-5 h-5 text-primex" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} ${itemGap} flex flex-col`}>
                {/* Username */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label className="sm:w-40 text-muted-foreground text-sm">Username</Label>
                  <div className="flex-1 flex items-center gap-2">
                    {editingUsername ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={usernameValue}
                          onChange={(e) => setUsernameValue(e.target.value)}
                          className="glass-input flex-1"
                        />
                        <Button size="sm" className="btn-primex btn-sm" onClick={handleSaveUsername}>
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingUsername(false); setUsernameValue(user?.username || ''); }}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium">@{user?.username || 'user'}</span>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingUsername(true)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label className="sm:w-40 text-muted-foreground text-sm">Email</Label>
                  <div className="flex-1 flex items-center gap-2">
                    {editingEmail ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="email"
                          value={emailValue}
                          onChange={(e) => setEmailValue(e.target.value)}
                          className="glass-input flex-1"
                        />
                        <Button size="sm" className="btn-primex btn-sm" onClick={handleSaveEmail}>
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingEmail(false); setEmailValue(user?.email || ''); }}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium">{user?.email || 'user@example.com'}</span>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingEmail(true)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-5 h-5 text-primex" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} ${itemGap} flex flex-col`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label className="sm:w-40 text-muted-foreground text-sm">Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="glass-input flex-1"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label className="sm:w-40 text-muted-foreground text-sm">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input flex-1"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label className="sm:w-40 text-muted-foreground text-sm">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass-input flex-1"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="btn-primex" onClick={handlePasswordChange}>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="glass-card border-red-500/20 hover-lift">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
                  </div>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white shrink-0"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── PRIVACY ─── */}
          <TabsContent value="privacy" className={`flex flex-col ${sectionGap} mt-0`}>
            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-5 h-5 text-primex" />
                  Profile Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding}`}>
                <div className="flex flex-col gap-3">
                  <Label className="text-muted-foreground text-sm">Who can see your profile</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'public' as ProfileVisibility, label: 'Public', icon: Globe, desc: 'Anyone' },
                      { value: 'friends' as ProfileVisibility, label: 'Friends', icon: Users, desc: 'Friends only' },
                      { value: 'private' as ProfileVisibility, label: 'Private', icon: Lock, desc: 'Only you' },
                    ]).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setProfileVisibility(option.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          profileVisibility === option.value
                            ? 'border-primex/50 bg-primex/10 text-primex'
                            : 'border-border/50 bg-transparent text-muted-foreground hover:bg-white/5'
                        }`}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{option.label}</span>
                        <span className="text-[10px] opacity-60">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="w-5 h-5 text-primex" />
                  Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} flex flex-col ${itemGap}`}>
                <SettingRow
                  icon={<Wifi className="w-4 h-4" />}
                  label="Show Online Status"
                  description="Let others see when you're online"
                  checked={showOnlineStatus}
                  onCheckedChange={setShowOnlineStatus}
                />
                <div className="divider-glow" />
                <SettingRow
                  icon={<Users className="w-4 h-4" />}
                  label="Allow Friend Requests"
                  description="Let people send you friend requests"
                  checked={allowFriendRequests}
                  onCheckedChange={setAllowFriendRequests}
                />
                <div className="divider-glow" />
                <SettingRow
                  icon={<Monitor className="w-4 h-4" />}
                  label="Show Activity Status"
                  description="Show your recent activity to friends"
                  checked={showActivityStatus}
                  onCheckedChange={setShowActivityStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── APPEARANCE ─── */}
          <TabsContent value="appearance" className={`flex flex-col ${sectionGap} mt-0`}>
            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Moon className="w-5 h-5 text-primex" />
                  Theme
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">PrimeX is optimized for dark theme</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primex/10 border border-primex/20">
                    <Moon className="w-4 h-4 text-primex" />
                    <span className="text-sm font-medium text-primex">Dark</span>
                    <Lock className="w-3 h-3 text-primex/50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="w-5 h-5 text-primex" />
                  Accent Color
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding}`}>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {accentColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setAccentColor(color.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                        accentColor === color.id
                          ? 'border-white/20 bg-white/5'
                          : 'border-border/50 bg-transparent hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full shrink-0"
                        style={{ background: color.color }}
                      />
                      <span className="text-sm font-medium">{color.label}</span>
                      {accentColor === color.id && (
                        <Check className="w-4 h-4 text-primex ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="w-5 h-5 text-primex" />
                  Display Options
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} flex flex-col ${itemGap}`}>
                <SettingRow
                  icon={<Monitor className="w-4 h-4" />}
                  label="Compact Mode"
                  description="Reduce spacing for more content density"
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
                <div className="divider-glow" />
                <SettingRow
                  icon={<ChevronRight className="w-4 h-4" />}
                  label="Animations"
                  description="Enable smooth animations and transitions"
                  checked={animations}
                  onCheckedChange={setAnimations}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── NOTIFICATIONS ─── */}
          <TabsContent value="notifications" className={`flex flex-col ${sectionGap} mt-0`}>
            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="w-5 h-5 text-primex" />
                  Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} flex flex-col ${itemGap}`}>
                <SettingRow
                  icon={<Bell className="w-4 h-4" />}
                  label="Push Notifications"
                  description="Receive browser push notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
                <div className="divider-glow" />
                <SettingRow
                  icon={<MessageSquare className="w-4 h-4" />}
                  label="Email Notifications"
                  description="Receive email notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="w-5 h-5 text-primex" />
                  Notification Types
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} flex flex-col ${itemGap}`}>
                <SettingRow
                  icon={<Users className="w-4 h-4" />}
                  label="Friend Requests"
                  description="When someone sends you a friend request"
                  checked={friendRequestNotifications}
                  onCheckedChange={setFriendRequestNotifications}
                />
                <div className="divider-glow" />
                <SettingRow
                  icon={<Heart className="w-4 h-4" />}
                  label="Likes"
                  description="When someone likes your content"
                  checked={likeNotifications}
                  onCheckedChange={setLikeNotifications}
                />
                <div className="divider-glow" />
                <SettingRow
                  icon={<MessageCircle className="w-4 h-4" />}
                  label="Comments"
                  description="When someone comments on your content"
                  checked={commentNotifications}
                  onCheckedChange={setCommentNotifications}
                />
                <div className="divider-glow" />
                <SettingRow
                  icon={<MessageSquare className="w-4 h-4" />}
                  label="Messages"
                  description="When you receive a direct message"
                  checked={messageNotifications}
                  onCheckedChange={setMessageNotifications}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── CONTENT PREFERENCES ─── */}
          <TabsContent value="content" className={`flex flex-col ${sectionGap} mt-0`}>
            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Play className="w-5 h-5 text-primex" />
                  Autoplay
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} flex flex-col ${itemGap}`}>
                <SettingRow
                  icon={<Play className="w-4 h-4" />}
                  label="Autoplay Videos"
                  description="Automatically play videos in feed"
                  checked={autoplayVideos}
                  onCheckedChange={setAutoplayVideos}
                />
                <div className="divider-glow" />
                <SettingRow
                  icon={<Film className="w-4 h-4" />}
                  label="Autoplay Reels"
                  description="Automatically play reels as you scroll"
                  checked={autoplayReels}
                  onCheckedChange={setAutoplayReels}
                />
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="w-5 h-5 text-primex" />
                  Video Quality
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding}`}>
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-sm">Default Video Quality</Label>
                  <Select value={defaultVideoQuality} onValueChange={(v) => setDefaultVideoQuality(v as VideoQuality)}>
                    <SelectTrigger className="glass-input w-full">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="glass-card-premium border-border/50">
                      <SelectItem value="auto">Auto (Recommended)</SelectItem>
                      <SelectItem value="4k">4K Ultra HD</SelectItem>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="480p">480p SD</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Higher quality uses more data. Auto adjusts based on your connection.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="w-5 h-5 text-primex" />
                  Content Filters
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Show Mature Content</p>
                      {showMatureContent && (
                        <span className="tag-primex text-[10px]">18+</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Display age-restricted content. Requires age verification.
                    </p>
                  </div>
                  <Switch
                    checked={showMatureContent}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setShowAgeVerification(true);
                      } else {
                        setShowMatureContent(false);
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── DATA & STORAGE ─── */}
          <TabsContent value="data" className={`flex flex-col ${sectionGap} mt-0`}>
            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="w-5 h-5 text-primex" />
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} flex flex-col gap-3`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">{storageUsed} MB / 500 MB</span>
                </div>
                <div className="relative">
                  <Progress
                    value={(storageUsed / 500) * 100}
                    className="h-3 bg-white/5 rounded-full overflow-hidden"
                  />
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full primex-gradient transition-all duration-500"
                    style={{ width: `${(storageUsed / 500) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="glass-card p-3 rounded-xl">
                    <p className="text-lg font-bold primex-gradient-text">{storageUsed}</p>
                    <p className="text-[10px] text-muted-foreground">MB Used</p>
                  </div>
                  <div className="glass-card p-3 rounded-xl">
                    <p className="text-lg font-bold">{500 - storageUsed}</p>
                    <p className="text-[10px] text-muted-foreground">MB Free</p>
                  </div>
                  <div className="glass-card p-3 rounded-xl">
                    <p className="text-lg font-bold">500</p>
                    <p className="text-[10px] text-muted-foreground">MB Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift border-border/50">
              <CardHeader className={`${cardPadding} pb-0`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Archive className="w-5 h-5 text-primex" />
                  Cache & Data
                </CardTitle>
              </CardHeader>
              <CardContent className={`${cardPadding} flex flex-col ${itemGap}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Clear Cache</p>
                    <p className="text-xs text-muted-foreground">Free up space by clearing cached data</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-border/50 hover:bg-white/5"
                    disabled={clearingCache}
                    onClick={handleClearCache}
                  >
                    {clearingCache ? (
                      <>
                        <div className="spinner-primex-sm mr-2" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </>
                    )}
                  </Button>
                </div>
                <div className="divider-glow" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Download My Data</p>
                    <p className="text-xs text-muted-foreground">Export all your data as a zip file</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-border/50 hover:bg-white/5"
                    disabled={downloadingData}
                    onClick={handleDownloadData}
                  >
                    {downloadingData ? (
                      <>
                        <div className="spinner-primex-sm mr-2" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ── Reusable Setting Row Component ── */
function SettingRow({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
