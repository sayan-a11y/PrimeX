'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Film, Upload, MessageCircle, User, Search, Bell, LogOut,
  Shield, BarChart3, Users, X, Menu, Compass, TrendingUp, Settings,
  Clock, ListVideo, DollarSign, Clock3, TrendingUp as TrendingIcon, XCircle,
  BookmarkPlus, Radio,
} from 'lucide-react';
import HomeFeed from './HomeFeed';
import ReelsFeed from './ReelsFeed';
import UploadPage from './UploadPage';
import ChatPage from './ChatPage';
import ProfilePage from './ProfilePage';
import FriendsPage from './FriendsPage';
import NotificationsPage from './NotificationsPage';
import AdminPanel from './AdminPanel';
import AnalyticsPage from './AnalyticsPage';
import SearchResults from './SearchResults';
import VideoPlayer from './VideoPlayer';
import ExplorePage from './ExplorePage';
import SettingsPage from './SettingsPage';
import WatchHistoryPage from './WatchHistoryPage';
import PlaylistsPage from './PlaylistsPage';
import CreatorDashboard from './CreatorDashboard';
import OnboardingModal from './OnboardingModal';
import LiveStreamsPage from './LiveStreamsPage';
import KeyboardShortcutsOverlay from './KeyboardShortcutsOverlay';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { playNotificationSound } from '@/lib/notification-sound';

/* ── Trending Searches (mock) ────────────────────────────────── */
const TRENDING_SEARCHES = [
  'music videos',
  'gaming highlights',
  'cooking tips',
  'tech reviews',
  'fitness',
];

/* ── Recent Searches Helper ─────────────────────────────────── */
function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('primex_recent_searches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    const trimmed = recent.slice(0, 5);
    localStorage.setItem('primex_recent_searches', JSON.stringify(trimmed));
  } catch {
    // Silently fail
  }
}

function removeRecentSearch(query: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    localStorage.setItem('primex_recent_searches', JSON.stringify(recent));
    return recent;
  } catch {
    return [];
  }
}

/* ── Search Dropdown Component ──────────────────────────────── */
function SearchDropdown({
  show,
  onSelect,
  onRemoveRecent,
}: {
  show: boolean;
  onSelect: (query: string) => void;
  onRemoveRecent: (query: string) => void;
}) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());

  // Refresh recent searches when shown
  const refreshRecent = () => {
    setRecentSearches(getRecentSearches());
  };

  if (!show) return null;

  const hasRecent = recentSearches.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 mt-2 glass-card-premium rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/40"
    >
      <div className="max-h-80 overflow-y-auto premium-scrollbar p-2">
        {/* Recent Searches */}
        {hasRecent && (
          <div className="mb-3">
            <div className="flex items-center justify-between px-2 mb-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock3 className="w-3 h-3" />
                Recent Searches
              </p>
            </div>
            {recentSearches.map((query) => (
              <button
                key={`recent-${query}`}
                onClick={() => onSelect(query)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/5 transition-colors group text-left"
              >
                <Clock3 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate">{query}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecent(query);
                    refreshRecent();
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
                  aria-label={`Remove ${query} from recent searches`}
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </button>
            ))}
            <div className="divider-primex my-2" />
          </div>
        )}

        {/* Trending Searches */}
        <div>
          <div className="px-2 mb-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-primex" />
              Trending Searches
            </p>
          </div>
          {TRENDING_SEARCHES.map((query) => (
            <button
              key={`trending-${query}`}
              onClick={() => onSelect(query)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/5 transition-colors group text-left hover-lift"
            >
              <TrendingIcon className="w-3.5 h-3.5 text-primex shrink-0" />
              <span className="flex-1 truncate">{query}</span>
              <span className="tag-primex text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">Trending</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Layout Component ─────────────────────────────────── */
export default function MainLayout() {
  const { user, logout, currentView, setCurrentView, unreadNotifications, setUnreadNotifications, setSearchQuery, showOnboarding, setShowOnboarding } = useAppStore();
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [watchLaterCount, setWatchLaterCount] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const prevUnreadRef = useRef(0);

  // Onboarding check on first login
  useEffect(() => {
    if (user) {
      const completed = localStorage.getItem('primex_onboarding_completed');
      if (!completed) {
        // Short delay to let the UI render first
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, setShowOnboarding]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifs = async () => {
      const token = localStorage.getItem('primex_token');
      if (!token) return;
      try {
        const res = await fetch('/api/notifications?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const notifs = data.data.notifications || [];
          const unread = notifs.filter((n: { read: boolean }) => !n.read).length;
          setUnreadNotifications(unread);
          // Play sound when notification count increases
          if (unread > prevUnreadRef.current && prevUnreadRef.current > 0) {
            playNotificationSound();
          }
          prevUnreadRef.current = unread;
        }
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [setUnreadNotifications]);

  // Fetch Watch Later playlist count
  useEffect(() => {
    const fetchWatchLater = async () => {
      const token = localStorage.getItem('primex_token');
      if (!token) return;
      try {
        const res = await fetch('/api/playlists', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const playlists = data.data.playlists || [];
          const watchLater = playlists.find((p: { name: string }) => p.name === 'Watch Later');
          if (watchLater) {
            setWatchLaterCount(watchLater.videos?.length || 0);
          }
        }
      } catch {}
    };
    fetchWatchLater();
    const interval = setInterval(fetchWatchLater, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery.trim());
      saveRecentSearch(localSearchQuery.trim());
      setCurrentView('search');
      setShowSearch(false);
      setSearchFocused(false);
    }
  }, [localSearchQuery, setCurrentView, setSearchQuery]);

  const handleSearchSelect = useCallback((query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
    saveRecentSearch(query);
    setCurrentView('search');
    setShowSearch(false);
    setSearchFocused(false);
  }, [setCurrentView, setSearchQuery]);

  const handleRemoveRecentSearch = useCallback((query: string) => {
    removeRecentSearch(query);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onShowShortcuts: () => setShowShortcuts(true),
    onHideShortcuts: () => setShowShortcuts(false),
    onCloseModal: () => setShowMobileMenu(false),
    onFocusSearch: () => {
      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
      searchInput?.focus();
    },
  });

  const handleLogout = () => {
    logout();
    setCurrentView('home');
  };

  const mainNavItems = [
    { icon: Home, label: 'Home', view: 'home' },
    { icon: Compass, label: 'Explore', view: 'explore' },
    { icon: Film, label: 'Reels', view: 'reels' },
    { icon: Upload, label: 'Upload', view: 'upload' },
    { icon: MessageCircle, label: 'Chat', view: 'chat' },
  ];

  const sidebarItems = [
    { icon: Home, label: 'Home', view: 'home' },
    { icon: Compass, label: 'Explore', view: 'explore' },
    { icon: Film, label: 'Reels', view: 'reels' },
    { icon: Radio, label: 'Live', view: 'live' },
    { icon: Upload, label: 'Upload', view: 'upload' },
    { icon: MessageCircle, label: 'Chat', view: 'chat' },
    { icon: Users, label: 'Friends', view: 'friends' },
    { icon: Bell, label: 'Notifications', view: 'notifications', badge: unreadNotifications },
    { icon: User, label: 'Profile', view: 'profile' },
  ];

  const watchLaterItem = { icon: BookmarkPlus, label: 'Watch Later', view: 'playlists', badge: watchLaterCount };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeFeed />;
      case 'explore': return <ExplorePage />;
      case 'reels': return <ReelsFeed />;
      case 'upload': return <UploadPage />;
      case 'chat': return <ChatPage />;
      case 'profile': return <ProfilePage />;
      case 'friends': return <FriendsPage />;
      case 'notifications': return <NotificationsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'admin': return <AdminPanel />;
      case 'search': return <SearchResults />;
      case 'video': return <VideoPlayer />;
      case 'settings': return <SettingsPage />;
      case 'history': return <WatchHistoryPage />;
      case 'playlists': return <PlaylistsPage />;
      case 'creator-dashboard': return <CreatorDashboard />;
      case 'live': return <LiveStreamsPage />;
      default: return <HomeFeed />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-b border-border/50">
        <div className="flex items-center justify-between h-12 px-3 lg:px-6">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => setCurrentView('home')}
            >
              <img src="/primex-logo.png" alt="PrimeX" className="w-9 h-9 rounded-xl shadow-lg group-hover:shadow-primex/30 transition-shadow object-contain" />
              <span className="text-xl font-bold primex-gradient-text hidden sm:block text-shimmer">PrimeX</span>
            </div>
          </div>

          {/* Center: Search with dropdown */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block relative">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  // Delay to allow click on dropdown items
                  setTimeout(() => setSearchFocused(false), 200);
                }}
                placeholder="Search videos, users, tags..."
                className="pl-10 bg-muted/50 border-border/50 h-10 rounded-xl focus:ring-primex/50 transition-all"
              />
              {localSearchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setLocalSearchQuery('')}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </form>
            {/* Search Dropdown */}
            <AnimatePresence>
              {searchFocused && !localSearchQuery && (
                <SearchDropdown
                  show={searchFocused && !localSearchQuery}
                  onSelect={handleSearchSelect}
                  onRemoveRecent={handleRemoveRecentSearch}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setCurrentView('notifications')}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold"
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </motion.span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              onClick={() => setCurrentView('friends')}
            >
              <Users className="w-5 h-5" />
            </Button>
            <div
              className="w-9 h-9 rounded-xl primex-gradient flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity ml-1"
              onClick={() => setCurrentView('profile')}
            >
              {user?.profilePic ? (
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback className="bg-transparent text-white text-xs font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="text-white text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-3 pb-3 relative">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setSearchFocused(false), 200);
                    }}
                    placeholder="Search videos, users, tags..."
                    className="pl-10 bg-muted/50 border-border/50 h-10 rounded-xl"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowSearch(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </form>
                {/* Mobile search dropdown */}
                <AnimatePresence>
                  {searchFocused && !localSearchQuery && (
                    <div className="mt-2">
                      <SearchDropdown
                        show={searchFocused && !localSearchQuery}
                        onSelect={(query) => {
                          handleSearchSelect(query);
                          setShowSearch(false);
                        }}
                        onRemoveRecent={handleRemoveRecentSearch}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border/50 p-2 gap-0.5 overflow-y-auto premium-scrollbar glass-sidebar">
          {/* User Card */}
          <div className="glass-card-premium p-2.5 rounded-xl mb-2 flex items-center gap-3 cursor-pointer hover-lift card-shine gradient-border-primex transition-all"
            onClick={() => setCurrentView('profile')}
          >
            <div className="w-9 h-9 rounded-xl primex-gradient flex items-center justify-center shrink-0">
              {user?.profilePic ? (
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback className="bg-transparent text-white text-xs font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="text-white text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role === 'admin' ? '🛡️ Admin' : '✨ Member'}</p>
            </div>
          </div>

          {/* Main Nav */}
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-0.5">Menu</p>
          {sidebarItems.slice(0, 6).map((item) => (
            item.view === 'upload' ? (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className="w-full flex items-center gap-3 h-10 rounded-xl transition-all mt-1 mb-1 px-3 primex-gradient text-white font-medium text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: '0 4px 16px oklch(0.75 0.18 330 / 30%), 0 0 24px oklch(0.7 0.22 280 / 20%)' }}
              >
                <item.icon className="w-5 h-5" />
                <span>Upload</span>
              </button>
            ) : (
              <Button
                key={item.view}
                variant="ghost"
                className={`justify-start gap-3 h-9 rounded-xl transition-all ${
                  currentView === item.view ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
                onClick={() => setCurrentView(item.view)}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Button>
            )
          ))}

          <div className="border-t border-border/50 my-1.5" />

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-0.5">Social</p>
          {sidebarItems.slice(6).map((item) => (
            <Button
              key={item.view}
              variant="ghost"
              className={`justify-start gap-3 h-9 rounded-xl transition-all relative ${
                currentView === item.view ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
              onClick={() => setCurrentView(item.view)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <Badge className="ml-auto bg-red-500 text-white text-[10px] h-5 min-w-5 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </Button>
          ))}

          {/* Watch Later Quick Access */}
          <Button
            variant="ghost"
            className={`justify-start gap-3 h-9 rounded-xl transition-all relative ${
              currentView === 'playlists' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            onClick={() => setCurrentView('playlists')}
          >
            <watchLaterItem.icon className="w-5 h-5" />
            <span className="text-sm">{watchLaterItem.label}</span>
            {watchLaterItem.badge > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <Badge className="ml-auto bg-primex text-white text-[10px] h-5 min-w-5 rounded-full flex items-center justify-center badge-pulse">
                  {watchLaterItem.badge > 99 ? '99+' : watchLaterItem.badge}
                </Badge>
              </motion.div>
            )}
          </Button>

          <div className="border-t border-border/50 my-1.5" />

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-0.5">Tools</p>
          <Button
            variant="ghost"
            className={`justify-start gap-3 h-9 rounded-xl transition-all ${
              currentView === 'analytics' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            onClick={() => setCurrentView('analytics')}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Analytics</span>
          </Button>
          <Button
            variant="ghost"
            className={`justify-start gap-3 h-9 rounded-xl transition-all ${
              currentView === 'settings' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            onClick={() => setCurrentView('settings')}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </Button>
          <Button
            variant="ghost"
            className={`justify-start gap-3 h-9 rounded-xl transition-all ${
              currentView === 'history' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            onClick={() => setCurrentView('history')}
          >
            <Clock className="w-5 h-5" />
            <span className="text-sm">History</span>
          </Button>
          <Button
            variant="ghost"
            className={`justify-start gap-3 h-9 rounded-xl transition-all ${
              currentView === 'playlists' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            onClick={() => setCurrentView('playlists')}
          >
            <ListVideo className="w-5 h-5" />
            <span className="text-sm">Playlists</span>
          </Button>

          {user?.isCreator && (
            <Button
              variant="ghost"
              className={`justify-start gap-3 h-9 rounded-xl transition-all ${
                currentView === 'creator-dashboard' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
              onClick={() => setCurrentView('creator-dashboard')}
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">Creator Dashboard</span>
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button
              variant="ghost"
              className={`justify-start gap-3 h-9 rounded-xl transition-all ${
                currentView === 'admin' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
              onClick={() => setCurrentView('admin')}
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm">Admin Panel</span>
            </Button>
          )}

          {/* Sign Out at bottom */}
          <div className="mt-auto pt-2">
            <div className="border-t border-border/50 mb-1.5" />
            <Button
              variant="ghost"
              className="justify-start gap-3 h-9 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/5 w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="page-enter overflow-hidden"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden sticky bottom-0 z-40 glass-card rounded-none border-t border-border/50 safe-area-bottom">
        <div className="flex items-center h-12 px-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-around w-full min-w-0">
            {[
              ...mainNavItems.slice(0, 2),
              { icon: Radio, label: 'Live', view: 'live' as const },
              ...mainNavItems.slice(2),
            ].map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors relative shrink-0 ${
                  currentView === item.view ? 'text-primex' : 'text-muted-foreground'
                }`}
              >
                {item.view === 'upload' ? (
                  <div className="upload-fab">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <item.icon className="w-5 h-5" />
                )}
                <span className={`text-[10px] ${item.view === 'upload' ? 'mt-1' : ''}`}>{item.label}</span>
                {currentView === item.view && item.view !== 'upload' && (
                  <div className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-primex" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border/50"
            >
              <div className="p-3">
                {/* User Card */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl primex-gradient flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? '🛡️ Admin' : '✨ Member'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Nav Items */}
                <div className="space-y-0.5">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.view}
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-9 rounded-xl ${
                        currentView === item.view ? 'bg-primex/10 text-primex' : ''
                      }`}
                      onClick={() => { setCurrentView(item.view); setShowMobileMenu(false); }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white text-[10px] h-5 min-w-5 rounded-full">
                          {item.badge > 9 ? '9+' : item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}

                  {/* Watch Later Quick Access in Mobile Menu */}
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-9 rounded-xl ${
                      currentView === 'playlists' ? 'bg-primex/10 text-primex' : ''
                    }`}
                    onClick={() => { setCurrentView('playlists'); setShowMobileMenu(false); }}
                  >
                    <watchLaterItem.icon className="w-5 h-5" />
                    <span>{watchLaterItem.label}</span>
                    {watchLaterItem.badge > 0 && (
                      <Badge className="ml-auto bg-primex text-white text-[10px] h-5 min-w-5 rounded-full">
                        {watchLaterItem.badge > 99 ? '99+' : watchLaterItem.badge}
                      </Badge>
                    )}
                  </Button>
                </div>

                <div className="border-t border-border/50 my-3" />

                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-9 rounded-xl ${
                    currentView === 'analytics' ? 'bg-primex/10 text-primex' : ''
                  }`}
                  onClick={() => { setCurrentView('analytics'); setShowMobileMenu(false); }}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </Button>

                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-9 rounded-xl ${
                    currentView === 'settings' ? 'bg-primex/10 text-primex' : ''
                  }`}
                  onClick={() => { setCurrentView('settings'); setShowMobileMenu(false); }}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Button>

                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-9 rounded-xl ${
                    currentView === 'history' ? 'bg-primex/10 text-primex' : ''
                  }`}
                  onClick={() => { setCurrentView('history'); setShowMobileMenu(false); }}
                >
                  <Clock className="w-5 h-5" />
                  <span>History</span>
                </Button>

                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-9 rounded-xl ${
                    currentView === 'playlists' ? 'bg-primex/10 text-primex' : ''
                  }`}
                  onClick={() => { setCurrentView('playlists'); setShowMobileMenu(false); }}
                >
                  <ListVideo className="w-5 h-5" />
                  <span>Playlists</span>
                </Button>

                {user?.isCreator && (
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-9 rounded-xl ${
                      currentView === 'creator-dashboard' ? 'bg-primex/10 text-primex' : ''
                    }`}
                    onClick={() => { setCurrentView('creator-dashboard'); setShowMobileMenu(false); }}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Creator Dashboard</span>
                  </Button>
                )}
                {user?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-9 rounded-xl ${
                      currentView === 'admin' ? 'bg-primex/10 text-primex' : ''
                    }`}
                    onClick={() => { setCurrentView('admin'); setShowMobileMenu(false); }}
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </Button>
                )}

                <div className="border-t border-border/50 my-3" />

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-9 rounded-xl text-red-400 hover:bg-red-500/5"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
