'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, UserCheck, UserX, Users, Clock, CheckCircle } from 'lucide-react';

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

// API returns { friend: {...} } but we use { user: {...} } in UI
function normalizeFriendItem(raw: any): FriendItem {
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

  const fetchFriends = async () => {
    if (!token) return;
    try {
      const [pendingRes, sentRes, friendsRes] = await Promise.all([
        fetch('/api/friends?type=pending', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/friends?type=sent', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/friends?type=friends', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [pendingData, sentData, friendsData] = await Promise.all([
        pendingRes.json(), sentRes.json(), friendsRes.json(),
      ]);
      const parseList = (d: any) => {
        const raw = d.success ? (d.data?.friends || d.data) : (d.data || d);
        return (Array.isArray(raw) ? raw : []).map(normalizeFriendItem);
      };
      setPendingRequests(parseList(pendingData));
      setSentRequests(parseList(sentData));
      setFriends(parseList(friendsData));
    } catch {}
    setLoading(false);
  };

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
        const parseList = (d: any) => {
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
      if (data.success) fetchFriends();
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
      if (data.success) fetchFriends();
    } catch {}
  };

  const handleRemove = async (friendId: string) => {
    try {
      await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFriends();
    } catch {}
  };

  const FriendCard = ({ item, type }: { item: FriendItem; type: 'pending' | 'sent' | 'friend' }) => (
    <div
      className="glass-card p-4 rounded-xl flex items-center gap-3 hover-lift cursor-pointer active-press group"
      onClick={() => {
        setViewingUser(item.user.id, item.user.username);
        setCurrentView('profile');
      }}
    >
      <div className="relative">
        <Avatar className="w-12 h-12 group-hover:ring-2 group-hover:ring-primex/50 transition-all">
          <AvatarImage src={item.user?.profilePic || ''} />
          <AvatarFallback className="bg-primex/20 text-primex">
            {item.user?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{item.user?.username || 'Unknown'}</p>
        <p className="text-xs text-muted-foreground">
          {type === 'pending' ? 'Wants to be your friend' :
           type === 'sent' ? 'Request sent' : 'Friend'}
        </p>
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {type === 'pending' && (
          <>
            <Button
              size="sm"
              className="primex-gradient text-white rounded-lg gap-1"
              onClick={() => handleAccept(item.id)}
            >
              <CheckCircle className="w-3.5 h-3.5" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg glass-card border-border/50"
              onClick={() => handleReject(item.id)}
            >
              <UserX className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
        {type === 'sent' && (
          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Pending</Badge>
        )}
        {type === 'friend' && (
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="rounded-lg glass-card border-border/50 text-xs">
              <UserCheck className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg glass-card border-border/50 text-destructive text-xs"
              onClick={() => handleRemove(item.id)}
            >
              <UserX className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold primex-gradient-text">Friends</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your friend requests and connections</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card w-full h-11 rounded-xl p-1 mb-6">
          <TabsTrigger value="pending" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
            <Clock className="w-4 h-4" /> Requests
            {pendingRequests.length > 0 && (
              <Badge className="bg-primex text-white text-[10px] h-4 min-w-4 rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
            <UserPlus className="w-4 h-4" /> Sent
          </TabsTrigger>
          <TabsTrigger value="friends" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
            <Users className="w-4 h-4" /> Friends
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-4 rounded-xl flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(item => (
                    <FriendCard key={item.id} item={item} type="pending" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent">
              {sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No sent requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map(item => (
                    <FriendCard key={item.id} item={item} type="sent" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="friends">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No friends yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Send friend requests to start connecting!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map(item => (
                    <FriendCard key={item.id} item={item} type="friend" />
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
