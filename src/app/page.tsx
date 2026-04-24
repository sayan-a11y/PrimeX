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
      let token = localStorage.getItem('primex_token');
      const userStr = localStorage.getItem('primex_user');

      // Fallback to cookie if localStorage is empty
      if (!token) {
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];
        if (cookieToken) token = cookieToken;
      }

      if (token) {
        try {
          // Verify token is still valid
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            login(data.data.user, token);
          } else {
            // Token expired
            localStorage.removeItem('primex_token');
            localStorage.removeItem('primex_user');
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        } catch {
          // Network error, use cached data if available
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              login(user, token);
            } catch {}
          }
        }
      }
      setInitializing(false);
    };
    checkAuth();
  }, [login]);

  // Global 401 interceptor - auto-logout on expired tokens
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        // Token expired - clear session and redirect to login
        localStorage.removeItem('primex_token');
        localStorage.removeItem('primex_user');
        useAppStore.getState().logout();
      }
      return response;
    };
    return () => { window.fetch = originalFetch; };
  }, []);

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
