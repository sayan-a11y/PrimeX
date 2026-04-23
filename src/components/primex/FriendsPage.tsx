'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserCheck, UserX, Users, Clock, CheckCircle, Sparkles, Search, Plus } from 'lucide-react';

interface FriendItem {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    profilePic: string | null;
  };
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="empty-state-premium py-12">
      <div className="empty-icon w-16 h-16 rounded-full bg-primex/10 flex items-center justify-center mb-4 breathe">
        <Icon className="w-8 h-8 text-primex/50" />
      </div>
      <p className="text-muted-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground/60">{subtitle}</p>
    </div>
  );
}

function normalizeFriendItem(raw: Record<string, any>): FriendItem {
  const friendData = raw.friend || raw.user || {};
  return {
    id: raw.id,
    senderId: raw.senderId || '',
    receiverId: raw.receiverId || '',
    status: raw.status || 'accepted',
    createdAt: raw.createdAt || '',
    user: {
      id: friendData.id || '',
      username: friendData.username || 'Unknown',
      profilePic: friendData.profilePic || null,
    },
  };
}

export default function FriendsPage() {
  const { user, token, setCurrentView, setViewingUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRequests, setPendingRequests] = useState<FriendItem[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendUsername, setAddFriendUsername] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [pendingRes, sentRes, friendsRes] = await Promise.all([
          fetch('/api/friends?type=pending', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/friends?type=sent', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/friends?type=friends', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [pendingData, sentData, friendsData] = await Promise.all([
          pendingRes.json(), sentRes.json(), friendsRes.json(),
        ]);
        const parseList = (d: Record<string, any>) => {
          const raw = d.success ? (d.data?.friends || d.data) : (d.data || d);
          return (Array.isArray(raw) ? raw : []).map(normalizeFriendItem);
        };
        if (!cancelled) {
          setPendingRequests(parseList(pendingData));
          setSentRequests(parseList(sentData));
          setFriends(parseList(friendsData));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  const handleAccept = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'accept' }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingRequests(prev => prev.filter(p => p.id !== friendId));
        const friendsRes = await fetch('/api/friends?type=friends', { headers: { Authorization: `Bearer ${token}` } });
        const friendsData = await friendsRes.json();
        const raw = friendsData.success ? (friendsData.data?.friends || friendsData.data) : (friendsData.data || friendsData);
        setFriends((Array.isArray(raw) ? raw : []).map(normalizeFriendItem));
      }
    } catch {}
  };

  const handleReject = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject' }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingRequests(prev => prev.filter(p => p.id !== friendId));
      }
    } catch {}
  };

  const handleRemove = async (friendId: string) => {
    try {
      await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch {}
  };

  const handleSendRequest = async () => {
    if (!token || !addFriendUsername.trim() || sendingRequest) return;
    setSendingRequest(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: addFriendUsername.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAddFriendUsername('');
        // Refresh sent requests
        const sentRes = await fetch('/api/friends?type=sent', { headers: { Authorization: `Bearer ${token}` } });
        const sentData = await sentRes.json();
        const raw = sentData.success ? (sentData.data?.friends || sentData.data) : (sentData.data || sentData);
        setSentRequests((Array.isArray(raw) ? raw : []).map(normalizeFriendItem));
      }
    } catch {}
    setSendingRequest(false);
  };

  const handleCancelRequest = async (friendId: string) => {
    try {
      await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSentRequests(prev => prev.filter(s => s.id !== friendId));
    } catch {}
  };

  const FriendCard = ({ item, type, index }: { item: FriendItem; type: 'pending' | 'sent' | 'friend'; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card-premium p-3 rounded-xl flex items-center gap-3 hover-lift cursor-pointer active-press group card-shine"
      onClick={() => {
        setViewingUser(item.user.id, item.user.username);
        setCurrentView('profile');
      }}
    >
      <div className="relative rounded-full group-hover:ring-2 group-hover:ring-primex/60 transition-all duration-300">
        <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-0 transition-all">
          <AvatarImage src={item.user?.profilePic || ''} />
          <AvatarFallback className="bg-primex/20 text-primex">
            {item.user?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {type === 'friend' && (
          <span className="tag-primex absolute -bottom-1 -right-1 text-[8px] px-1.5 py-0.5 rounded-full font-medium">
            Online
          </span>
        )}
        {type === 'pending' && (
          <span className="badge-dot-pulse absolute -bottom-0.5 -right-0.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm group-hover:text-primex transition-colors">{item.user?.username || 'Unknown'}</p>
        <p className="text-xs text-muted-foreground">
          {type === 'pending' ? 'Wants to be your friend' :
           type === 'sent' ? 'Request sent' : 'Friend'}
        </p>
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {type === 'pending' && (
          <>
            <button
              className="btn-primex btn-sm gap-1"
              onClick={() => handleAccept(item.id)}
            >
              <CheckCircle className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              className="btn-outline-primex btn-sm"
              onClick={() => handleReject(item.id)}
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {type === 'sent' && (
          <button
            className="btn-outline-primex btn-sm gap-1"
            onClick={() => handleCancelRequest(item.id)}
          >
            <UserX className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
        {type === 'friend' && (
          <div className="flex gap-1.5">
            <span className="tag-success text-[10px] flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Friends
            </span>
            <button
              className="btn-ghost-primex btn-sm text-destructive"
              onClick={() => handleRemove(item.id)}
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const filterBySearch = (items: FriendItem[]) => {
    if (!searchQuery.trim()) return items;
    return items.filter(item =>
      item.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-mesh min-h-screen relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb-primex-sm top-10 -right-16" />
      <div className="orb-primex-sm bottom-20 -left-10 opacity-50" />

      {/* Header */}
      <div className="relative z-10 mb-4 page-header-premium">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-10 h-10 rounded-xl bg-primex/10 flex items-center justify-center"
            >
              <Users className="w-5 h-5 text-primex" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-shimmer">Friends</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Manage your connections</p>
            </div>
          </div>
          {pendingRequests.length > 0 && (
            <div className="badge-pulse px-2.5 py-1 text-xs">
              {pendingRequests.length} new
            </div>
          )}
        </div>
      </div>

      {/* Add Friend */}
      <div className="relative z-10 mb-3">
        <div className="glass-card-premium p-3 rounded-xl flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Add friend by username..."
              value={addFriendUsername}
              onChange={(e) => setAddFriendUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
              className="glass-input w-full h-9 pl-9 pr-4 text-sm rounded-lg"
            />
          </div>
          <button
            className="btn-primex btn-sm gap-1 shrink-0"
            onClick={handleSendRequest}
            disabled={!addFriendUsername.trim() || sendingRequest}
          >
            {sendingRequest ? (
              <div className="spinner-primex-sm w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative z-10 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full h-10 pl-9 pr-4 text-sm rounded-xl"
          />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="relative z-10 tab-bar-premium w-full mb-3">
        <button
          className={`tab-item flex-1 ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock className="w-4 h-4" /> Requests
          {pendingRequests.length > 0 && (
            <span className="badge-pulse ml-1 px-1.5 py-0.5 text-[9px]">{pendingRequests.length}</span>
          )}
        </button>
        <button
          className={`tab-item flex-1 ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <UserPlus className="w-4 h-4" /> Sent
        </button>
        <button
          className={`tab-item flex-1 ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <Sparkles className="w-4 h-4" /> Friends
        </button>
      </div>

      <div className="divider-primex relative z-10 mb-3" />

      {loading ? (
        <div className="relative z-10 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card-premium p-3 rounded-xl flex items-center gap-3">
              <div className="skeleton-pulse skeleton-circle w-12 h-12" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton-pulse skeleton-line w-28 h-4" />
                <div className="skeleton-pulse skeleton-line w-40 h-3" />
              </div>
              <div className="flex gap-2">
                <div className="skeleton-pulse skeleton-line w-20 h-8 rounded-lg" />
                <div className="skeleton-pulse skeleton-line w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'pending' && (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {filterBySearch(pendingRequests).length === 0 ? (
                  <EmptyState icon={Clock} title="No pending requests" subtitle="When someone sends a request, it will appear here" />
                ) : (
                  filterBySearch(pendingRequests).map((item, i) => (
                    <div key={item.id}>
                      <FriendCard item={item} type="pending" index={i} />
                      {i < filterBySearch(pendingRequests).length - 1 && <div className="divider-primex my-2" />}
                    </div>
                  ))
                )}
              </motion.div>
            )}
            {activeTab === 'sent' && (
              <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {filterBySearch(sentRequests).length === 0 ? (
                  <EmptyState icon={UserPlus} title="No sent requests" subtitle="Send friend requests to start connecting!" />
                ) : (
                  filterBySearch(sentRequests).map((item, i) => (
                    <div key={item.id}>
                      <FriendCard item={item} type="sent" index={i} />
                      {i < filterBySearch(sentRequests).length - 1 && <div className="divider-primex my-2" />}
                    </div>
                  ))
                )}
              </motion.div>
            )}
            {activeTab === 'friends' && (
              <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {filterBySearch(friends).length === 0 ? (
                  <EmptyState icon={Users} title="No friends yet" subtitle="Send friend requests to start connecting!" />
                ) : (
                  filterBySearch(friends).map((item, i) => (
                    <div key={item.id}>
                      <FriendCard item={item} type="friend" index={i} />
                      {i < filterBySearch(friends).length - 1 && <div className="divider-primex my-2" />}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
