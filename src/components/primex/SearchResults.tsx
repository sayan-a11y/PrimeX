'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Film, UserPlus, Play, Eye } from 'lucide-react';

interface SearchUser {
  id: string;
  username: string;
  profilePic: string | null;
  bio: string | null;
  isCreator: boolean;
}

interface SearchVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  views: number;
  user: { username: string; profilePic: string | null };
  createdAt: string;
}

export default function SearchResults() {
  const { token } = useAppStore();
  const [searchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('primex_search') || '';
    }
    return '';
  });
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [videos, setVideos] = useState<SearchVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!searchQuery) return;
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=all`);
        const data = await res.json();
        if (data.success) {
          setUsers(data.data.users || []);
          setVideos(data.data.videos || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchResults();
  }, [searchQuery]);

  // Save search query to localStorage when view changes
  useEffect(() => {
    const store = useAppStore.getState();
    if (store.currentView === 'search') {
      localStorage.setItem('primex_search', store.searchQuery || searchQuery);
    }
  }, [searchQuery]);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold primex-gradient-text">Search Results</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Showing results for &quot;{searchQuery}&quot;
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card w-full h-11 rounded-xl p-1 mb-6">
          <TabsTrigger value="all" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white">
            All
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
            <Users className="w-4 h-4" /> Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="rounded-lg flex-1 data-[state=active]:primex-gradient data-[state=active]:text-white gap-1.5">
            <Film className="w-4 h-4" /> Videos ({videos.length})
          </TabsTrigger>
        </TabsList>

        {/* All Results */}
        <TabsContent value="all">
          {users.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Users
              </h3>
              <div className="space-y-2">
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="glass-card p-3 rounded-xl flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u.profilePic || ''} />
                      <AvatarFallback className="bg-primex/20 text-primex text-sm">
                        {u.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{u.username}</p>
                      {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
                    </div>
                    <Button size="sm" className="primex-gradient text-white rounded-lg gap-1">
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Film className="w-4 h-4" /> Videos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {videos.slice(0, 6).map(v => (
                  <div key={v.id} className="glass-card rounded-xl overflow-hidden video-card-hover cursor-pointer">
                    <div className="aspect-video bg-muted relative">
                      {v.thumbnail ? (
                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium line-clamp-1">{v.title}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(v.views)} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {users.length === 0 && videos.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No results found</p>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="glass-card p-4 rounded-xl flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={u.profilePic || ''} />
                  <AvatarFallback className="bg-primex/20 text-primex">
                    {u.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{u.username}</p>
                  {u.bio && <p className="text-sm text-muted-foreground">{u.bio}</p>}
                </div>
                <Button size="sm" className="primex-gradient text-white rounded-lg gap-1.5">
                  <UserPlus className="w-4 h-4" /> Add Friend
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {videos.map(v => (
              <div key={v.id} className="glass-card rounded-xl overflow-hidden video-card-hover cursor-pointer">
                <div className="aspect-video bg-muted relative">
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-medium line-clamp-2">{v.title}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Eye className="w-3 h-3" />
                    <span>{formatViews(v.views)} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
