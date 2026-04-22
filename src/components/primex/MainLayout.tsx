'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Film, Upload, MessageCircle, User, Search, Bell, LogOut,
  Shield, BarChart3, Users, Heart, X, Menu, Compass, TrendingUp, Settings
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

export default function MainLayout() {
  const { user, logout, currentView, setCurrentView, unreadNotifications, setUnreadNotifications, setSearchQuery } = useAppStore();
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
        }
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [setUnreadNotifications]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery.trim());
      setCurrentView('search');
      setShowSearch(false);
    }
  }, [localSearchQuery, setCurrentView, setSearchQuery]);

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
    { icon: Upload, label: 'Upload', view: 'upload' },
    { icon: MessageCircle, label: 'Chat', view: 'chat' },
    { icon: Users, label: 'Friends', view: 'friends' },
    { icon: Bell, label: 'Notifications', view: 'notifications', badge: unreadNotifications },
    { icon: User, label: 'Profile', view: 'profile' },
  ];

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
      default: return <HomeFeed />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-3 lg:px-6">
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
              <div className="w-9 h-9 rounded-xl primex-gradient flex items-center justify-center shadow-lg group-hover:shadow-primex/30 transition-shadow">
                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold primex-gradient-text hidden sm:block">PrimeX</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Search videos, users, tags..."
                className="pl-10 bg-muted/50 border-border/50 h-10 rounded-xl focus:ring-primex/50 transition-all"
              />
            </form>
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
              <div className="px-3 pb-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-border/50 p-3 gap-0.5 overflow-y-auto custom-scrollbar">
          {/* User Card */}
          <div className="glass-card p-3 rounded-xl mb-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setCurrentView('profile')}
          >
            <div className="w-10 h-10 rounded-xl primex-gradient flex items-center justify-center shrink-0">
              {user?.profilePic ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback className="bg-transparent text-white text-sm font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="text-white text-sm font-bold">
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
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Menu</p>
          {sidebarItems.slice(0, 5).map((item) => (
            <Button
              key={item.view}
              variant="ghost"
              className={`justify-start gap-3 h-10 rounded-xl transition-all ${
                currentView === item.view ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
              onClick={() => setCurrentView(item.view)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Button>
          ))}

          <div className="border-t border-border/50 my-2" />

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Social</p>
          {sidebarItems.slice(5).map((item) => (
            <Button
              key={item.view}
              variant="ghost"
              className={`justify-start gap-3 h-10 rounded-xl transition-all relative ${
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

          <div className="border-t border-border/50 my-2" />

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Tools</p>
          <Button
            variant="ghost"
            className={`justify-start gap-3 h-10 rounded-xl transition-all ${
              currentView === 'analytics' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            onClick={() => setCurrentView('analytics')}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Analytics</span>
          </Button>

          {user?.role === 'admin' && (
            <Button
              variant="ghost"
              className={`justify-start gap-3 h-10 rounded-xl transition-all ${
                currentView === 'admin' ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
              onClick={() => setCurrentView('admin')}
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm">Admin Panel</span>
            </Button>
          )}

          {/* Sign Out at bottom */}
          <div className="mt-auto pt-3">
            <div className="border-t border-border/50 mb-2" />
            <Button
              variant="ghost"
              className="justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/5 w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden sticky bottom-0 z-40 glass-card rounded-none border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-1">
          {mainNavItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors relative ${
                currentView === item.view ? 'text-primex' : 'text-muted-foreground'
              }`}
            >
              {item.view === 'upload' ? (
                <div className="w-9 h-9 primex-gradient rounded-xl flex items-center justify-center -mt-3 shadow-lg glow-effect">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              <span className={`text-[10px] ${item.view === 'upload' ? 'mt-0.5' : ''}`}>{item.label}</span>
              {currentView === item.view && item.view !== 'upload' && (
                <div className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-primex" />
              )}
            </button>
          ))}
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
              <div className="p-4">
                {/* User Card */}
                <div className="flex items-center justify-between mb-6">
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
                      className={`w-full justify-start gap-3 h-10 rounded-xl ${
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
                </div>

                <div className="border-t border-border/50 my-3" />

                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-10 rounded-xl ${
                    currentView === 'analytics' ? 'bg-primex/10 text-primex' : ''
                  }`}
                  onClick={() => { setCurrentView('analytics'); setShowMobileMenu(false); }}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </Button>

                {user?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-10 rounded-xl ${
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
                  className="w-full justify-start gap-3 h-10 rounded-xl text-red-400 hover:bg-red-500/5"
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
    </div>
  );
}
