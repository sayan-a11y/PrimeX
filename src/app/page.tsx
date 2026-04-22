'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import AuthPage from '@/components/primex/AuthPage';
import MainLayout from '@/components/primex/MainLayout';

export default function Home() {
  const { isAuthenticated, setUser, setToken, login } = useAppStore();
  const [initializing, setInitializing] = useState(true);
  const [adminAccess, setAdminAccess] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('primex_token');
      const userStr = localStorage.getItem('primex_user');

      if (token && userStr) {
        try {
          // Verify token is still valid
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            login(data.data.user, token);
          } else {
            // Token expired, try refresh
            localStorage.removeItem('primex_token');
            localStorage.removeItem('primex_user');
          }
        } catch {
          // Network error, use cached data
          try {
            const user = JSON.parse(userStr);
            setUser(user);
            setToken(token);
          } catch {}
        }
      }
      setInitializing(false);
    };
    checkAuth();
  }, [login, setUser, setToken]);

  // Check for admin access via URL hash
  useEffect(() => {
    const checkAdminAccess = () => {
      if (window.location.hash === '#admin-secret-x') {
        setAdminAccess(true);
      }
    };
    checkAdminAccess();
    window.addEventListener('hashchange', checkAdminAccess);
    return () => window.removeEventListener('hashchange', checkAdminAccess);
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl primex-gradient flex items-center justify-center glow-effect pulse-glow">
            <svg className="w-8 h-8 text-white fill-white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-primex/30 border-t-primex rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <MainLayout />;
}
