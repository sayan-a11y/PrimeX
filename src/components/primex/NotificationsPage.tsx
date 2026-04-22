'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, UserPlus, Heart, MessageCircle, Flag, Check, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  fromUserId: string | null;
  createdAt: string;
  fromUser?: {
    id: string;
    username: string;
    profilePic: string | null;
  };
}

export default function NotificationsPage() {
  const { token } = useAppStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/notifications?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.notifications || data.data || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchNotifications();
  }, [token]);

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const markAllRead = async () => {
    await markAsRead(notifications.filter(n => !n.read).map(n => n.id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <UserPlus className="w-4 h-4 text-blue-400" />;
      case 'friend_accept': return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'like': return <Heart className="w-4 h-4 text-red-400" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-primex" />;
      case 'report': return <Flag className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold primex-gradient-text">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated with your activity</p>
        </div>
        {notifications.some(n => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl glass-card border-border/50"
            onClick={markAllRead}
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-4 rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6 text-primex" />
          </div>
          <h3 className="font-medium mb-1">No Notifications</h3>
          <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`glass-card p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                !notif.read ? 'bg-primex/5 border-primex/20' : ''
              }`}
              onClick={() => { if (!notif.read) markAsRead([notif.id]); }}
            >
              <div className="relative">
                {notif.fromUser ? (
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={notif.fromUser.profilePic || ''} />
                    <AvatarFallback className="bg-primex/20 text-primex text-sm">
                      {notif.fromUser.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center border border-background">
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{notif.fromUser?.username || 'Someone'}</span>{' '}
                  {notif.message}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.createdAt)}</p>
              </div>

              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primex shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
