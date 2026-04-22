'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Film, UserPlus, Play, Eye, Compass } from 'lucide-react';

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
  const { token, searchQuery, setCurrentView } = useAppStore();
  const query = searchQuery || '';
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [videos, setVideos] = useState<SearchVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!query) { return; }
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all`);
        const data = await res.json();
        if (data.success) {
          setUsers(data.data.users || []);
          setVideos(data.data.videos || []);
        }
      } catch {
        // Search failed silently
      }
    };
    fetchResults();
  }, [query]);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-primex" />
          </div>
          <h2 className="text-xl font-bold mb-2">Search PrimeX</h2>
          <p className="text-muted-foreground text-sm">Type something in the search bar to find videos and creators</p>
          <Button
            variant="outline"
            className="mt-4 rounded-xl glass-card border-border/50 gap-2"
            onClick={() => setCurrentView('explore')}
          >
            <Compass className="w-4 h-4" /> Explore Instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold primex-gradient-text">Search Results</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Showing results for &quot;<span className="text-primex font-medium">{query}</span>&quot;
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
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Users className="w-4 h-4 text-primex" /> Users
              </h3>
              <div className="space-y-2">
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={u.profilePic || ''} />
                      <AvatarFallback className="bg-primex/20 text-primex font-bold">
                        {u.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{u.username}</p>
                      {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
                    </div>
                    <Button size="sm" className="primex-gradient text-white rounded-xl gap-1.5 shrink-0">
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Film className="w-4 h-4 text-primex" /> Videos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {videos.slice(0, 6).map(v => (
                  <div key={v.id} className="glass-card rounded-xl overflow-hidden video-card-hover cursor-pointer group"
                    onClick={() => {
                      useAppStore.setState({ currentVideoId: v.id });
                      setCurrentView('video');
                    }}>
                    <div className="aspect-video bg-muted relative">
                      {v.thumbnail ? (
                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/10 to-primex/5">
                          <Play className="w-8 h-8 text-primex/30" />
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
            </div>
          )}
          {users.length === 0 && videos.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground">Try different keywords or browse Explore</p>
              <Button variant="outline" className="mt-3 rounded-xl glass-card gap-2" onClick={() => setCurrentView('explore')}>
                <Compass className="w-4 h-4" /> Explore
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={u.profilePic || ''} />
                    <AvatarFallback className="bg-primex/20 text-primex text-lg font-bold">
                      {u.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{u.username}</p>
                    {u.bio && <p className="text-sm text-muted-foreground">{u.bio}</p>}
                  </div>
                  <Button size="sm" className="primex-gradient text-white rounded-xl gap-1.5 shrink-0">
                    <UserPlus className="w-4 h-4" /> Add Friend
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {videos.map(v => (
                <div key={v.id} className="glass-card rounded-xl overflow-hidden video-card-hover cursor-pointer"
                  onClick={() => {
                    useAppStore.setState({ currentVideoId: v.id });
                    setCurrentView('video');
                  }}>
                  <div className="aspect-video bg-muted relative">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primex/10 to-primex/5">
                        <Play className="w-8 h-8 text-primex/30" />
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
          ) : (
            <div className="text-center py-12">
              <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No videos found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
