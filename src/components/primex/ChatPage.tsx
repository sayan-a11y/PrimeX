'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, ImageIcon, ArrowLeft, Search, Circle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Conversation {
  userId: string;
  username: string;
  profilePic: string | null;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface ApiConversation {
  partner: { id: string; username: string; profilePic: string | null };
  lastMessage: { message: string; createdAt: string };
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  mediaUrl: string | null;
  seen: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const { user, token, activeChatUser, setActiveChatUser, setCurrentView } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Socket.io connection
  useEffect(() => {
    if (!user) return;
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { userId: user.id });
    });

    socket.on('message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('typing', () => {
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    });

    socket.on('stopTyping', () => {
      setIsTyping(false);
    });

    socket.on('seen', () => {
      setMessages(prev => prev.map(m => ({ ...m, seen: true })));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const rawConversations = data.data.conversations || data.data || [];
          const mapped: Conversation[] = (Array.isArray(rawConversations) ? rawConversations : []).map((c: ApiConversation) => ({
            userId: c.partner.id,
            username: c.partner.username,
            profilePic: c.partner.profilePic,
            lastMessage: c.lastMessage?.message || '',
            lastTime: c.lastMessage?.createdAt || '',
            unread: c.unreadCount || 0,
          }));
          setConversations(mapped);
        }
      } catch {}
      setLoading(false);
    };
    if (token) fetchConversations();
  }, [token]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChatUser || !token) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${activeChatUser.id}&limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.data.messages || data.data || []);
        }
      } catch {}
    };
    fetchMessages();
  }, [activeChatUser, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChatUser || !token) return;
    setSending(true);
    try {
      // Send via API for persistence
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: activeChatUser.id,
          message: newMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        const msg = data.data.message || data.data;
        setMessages(prev => [...prev, msg]);
        // Send via socket for real-time
        socketRef.current?.emit('message', {
          senderId: user?.id,
          receiverId: activeChatUser.id,
          message: newMessage.trim(),
        });
        setNewMessage('');
      }
    } catch {}
    setSending(false);
  };

  const handleTyping = () => {
    if (activeChatUser && socketRef.current) {
      socketRef.current.emit('typing', {
        senderId: user?.id,
        receiverId: activeChatUser.id,
      });
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // No active chat - show conversation list
  if (!activeChatUser) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-xl font-bold primex-gradient-text mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 bg-muted/50 border-border/50 h-9 rounded-xl"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-primex" />
            </div>
            <h3 className="font-medium mb-1">No Conversations</h3>
            <p className="text-sm text-muted-foreground">Send a friend request to start chatting!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.map((conv) => (
              <button
                key={conv.userId}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
                onClick={() => setActiveChatUser({
                  id: conv.userId,
                  username: conv.username,
                  email: '',
                  profilePic: conv.profilePic,
                  bio: null,
                  role: 'user',
                  isCreator: false,
                  createdAt: '',
                })}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.profilePic || ''} />
                    <AvatarFallback className="bg-primex/20 text-primex">
                      {conv.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{conv.username}</p>
                    <span className="text-xs text-muted-foreground">
                      {conv.lastTime ? formatTime(conv.lastTime) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <Badge className="bg-primex text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                    {conv.unread}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Active chat view
  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-3 border-b border-border/50 glass-card">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setActiveChatUser(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarImage src={activeChatUser.profilePic || ''} />
          <AvatarFallback className="bg-primex/20 text-primex text-sm">
            {activeChatUser.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{activeChatUser.username}</p>
          {isTyping && (
            <p className="text-xs text-primex animate-pulse">typing...</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                isMine
                  ? 'primex-gradient text-white rounded-br-md'
                  : 'glass-card rounded-bl-md'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                  <span className={`text-[10px] ${isMine ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {formatTime(msg.createdAt)}
                  </span>
                  {isMine && msg.seen && (
                    <span className="text-[10px] text-white/70">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 border-border/50 h-10 rounded-xl"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="shrink-0 h-10 w-10 rounded-xl primex-gradient text-white p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
