'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home, Film, Upload, MessageCircle, User, Search, Bell, LogOut,
  Settings, Shield, BarChart3, Users, Heart, X, Menu
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

export default function MainLayout() {
  const { user, logout, currentView, setCurrentView, unreadNotifications, setUnreadNotifications } = useAppStore();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifs = async () => {
      const token = localStorage.getItem('primex_token');
      if (!token) return;
      try {
        const res = await fetch('/api/notifications?limit=1', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const unread = data.data.notifications?.filter((n: { read: boolean }) => !n.read).length || 0;
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
    if (searchQuery.trim()) {
      setCurrentView('search');
      setShowSearch(false);
    }
  }, [searchQuery, setCurrentView]);

  const handleLogout = () => {
    logout();
    setCurrentView('home');
  };

  const navItems = [
    { icon: Home, label: 'Home', view: 'home' },
    { icon: Film, label: 'Reels', view: 'reels' },
    { icon: Upload, label: 'Upload', view: 'upload' },
    { icon: MessageCircle, label: 'Chat', view: 'chat' },
    { icon: User, label: 'Profile', view: 'profile' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeFeed />;
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
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setCurrentView('home')}
            >
              <div className="w-8 h-8 rounded-lg primex-gradient flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold primex-gradient-text hidden sm:block">PrimeX</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, users..."
                className="pl-9 bg-muted/50 border-border/50 h-9 rounded-xl"
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCurrentView('notifications')}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView('friends')}
            >
              <Users className="w-5 h-5" />
            </Button>
            <div
              className="w-8 h-8 rounded-full primex-gradient flex items-center justify-center cursor-pointer"
              onClick={() => setCurrentView('profile')}
            >
              {user?.profilePic ? (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback className="bg-transparent text-white text-xs">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="text-white text-xs font-medium">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, users..."
                className="pl-9 bg-muted/50 border-border/50 h-9 rounded-xl"
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
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border/50 p-3 gap-1">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? 'secondary' : 'ghost'}
              className={`justify-start gap-3 h-10 rounded-xl ${
                currentView === item.view ? 'bg-primex/10 text-primex glow-border' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setCurrentView(item.view)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Button>
          ))}

          <div className="border-t border-border/50 my-2" />

          <Button
            variant="ghost"
            className="justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={() => setCurrentView('analytics')}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Analytics</span>
          </Button>

          {user?.role === 'admin' && (
            <Button
              variant="ghost"
              className="justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-foreground"
              onClick={() => setCurrentView('admin')}
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm">Admin Panel</span>
            </Button>
          )}

          <div className="mt-auto">
            <Button
              variant="ghost"
              className="justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-destructive w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden sticky bottom-0 glass-card rounded-none border-t border-border/50">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                currentView === item.view ? 'text-primex' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r border-border/50 p-4 slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg primex-gradient flex items-center justify-center">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold primex-gradient-text">PrimeX</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.view}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 rounded-xl"
                  onClick={() => { setCurrentView(item.view); setShowMobileMenu(false); }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 rounded-xl"
                onClick={() => { setCurrentView('analytics'); setShowMobileMenu(false); }}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 rounded-xl"
                onClick={() => { setCurrentView('friends'); setShowMobileMenu(false); }}
              >
                <Users className="w-5 h-5" />
                <span>Friends</span>
              </Button>
              {user?.role === 'admin' && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 rounded-xl"
                  onClick={() => { setCurrentView('admin'); setShowMobileMenu(false); }}
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Button>
              )}
              <div className="border-t border-border/50 my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 rounded-xl text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
