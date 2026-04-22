import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePic: string | null;
  bio: string | null;
  role: string;
  isCreator: boolean;
  createdAt: string;
}

export type ViewType =
  | 'home'
  | 'explore'
  | 'reels'
  | 'upload'
  | 'chat'
  | 'profile'
  | 'friends'
  | 'notifications'
  | 'analytics'
  | 'admin'
  | 'search'
  | 'video'
  | 'settings'
  | 'history'
  | 'playlists'
  | 'creator-dashboard';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;

  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Video player
  currentVideoId: string | null;

  // Reels
  currentReelIndex: number;
  setCurrentReelIndex: (index: number) => void;

  // Chat
  activeChatUser: User | null;
  setActiveChatUser: (user: User | null) => void;

  // Notifications
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;

  // Viewing other user's profile
  viewingUserId: string | null;
  viewingUsername: string | null;
  setViewingUser: (userId: string | null, username: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Onboarding
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('primex_token', token);
      else localStorage.removeItem('primex_token');
    }
    set({ token });
  },
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('primex_token', token);
      localStorage.setItem('primex_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('primex_token');
      localStorage.removeItem('primex_user');
    }
    set({ user: null, token: null, isAuthenticated: false, currentView: 'home' });
  },

  // Navigation
  currentView: 'home',
  setCurrentView: (currentView) => set({ currentView }),

  // Video player
  currentVideoId: null,

  // Reels
  currentReelIndex: 0,
  setCurrentReelIndex: (currentReelIndex) => set({ currentReelIndex }),

  // Chat
  activeChatUser: null,
  setActiveChatUser: (activeChatUser) => set({ activeChatUser }),

  // Notifications
  unreadNotifications: 0,
  setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),

  // Viewing other user's profile
  viewingUserId: null,
  viewingUsername: null,
  setViewingUser: (viewingUserId, viewingUsername) => set({ viewingUserId, viewingUsername }),

  // Search
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Onboarding
  showOnboarding: false,
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
}));
