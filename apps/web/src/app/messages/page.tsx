/**
 * Messages Center — Interactive Messaging App
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, MessageSquare, CheckCheck, Clock, Phone, Video, MoreVertical, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastMessage: string;
  unread: number;
  time: string;
  online: boolean;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Dr. Vikram Sethi',
    role: 'System Design Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    lastMessage: 'Let me know if you need clarification on Redis Streams indexing.',
    unread: 2,
    time: '10:42 AM',
    online: true,
    messages: [
      { id: 'm1', text: 'Hi Dr. Vikram, I reviewed Module 4 on Redis Streams.', sender: 'me', time: '10:35 AM' },
      { id: 'm2', text: 'Great progress! How did you find the event loop partitioning concept?', sender: 'them', time: '10:38 AM' },
      { id: 'm3', text: 'It made total sense. Quick question on consumer group offsets.', sender: 'me', time: '10:40 AM' },
      { id: 'm4', text: 'Let me know if you need clarification on Redis Streams indexing.', sender: 'them', time: '10:42 AM' },
    ],
  },
  {
    id: 'conv-2',
    name: 'Elena Rostova',
    role: 'Full-Stack & Next.js 16 Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    lastMessage: 'Your Next.js 16 assignment score was 98%. Excellent job!',
    unread: 1,
    time: 'Yesterday',
    online: true,
    messages: [
      { id: 'm1', text: 'Hello Elena, I submitted the Server Actions project.', sender: 'me', time: 'Yesterday' },
      { id: 'm2', text: 'Your Next.js 16 assignment score was 98%. Excellent job!', sender: 'them', time: 'Yesterday' },
    ],
  },
  {
    id: 'conv-3',
    name: 'Tekurious Support & Credentialing',
    role: 'Platform Support',
    lastMessage: 'Your certificate CERT-2026-98412 is verified and active.',
    unread: 0,
    time: 'Aug 10',
    online: false,
    messages: [
      { id: 'm1', text: 'Can you verify my certificate status for LinkedIn?', sender: 'me', time: 'Aug 10' },
      { id: 'm2', text: 'Your certificate CERT-2026-98412 is verified and active.', sender: 'them', time: 'Aug 10' },
    ],
  },
  {
    id: 'conv-4',
    name: 'Sarah Connor',
    role: 'Peer Learner',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    lastMessage: 'Are you attending today live PostgreSQL performance workshop?',
    unread: 0,
    time: 'Aug 08',
    online: false,
    messages: [
      { id: 'm1', text: 'Are you attending today live PostgreSQL performance workshop?', sender: 'them', time: 'Aug 08' },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>('conv-1');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === selectedId) || conversations[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      text: inputText.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentText = inputText.trim();
    setInputText('');

    // Append user message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedId) {
          return {
            ...c,
            lastMessage: currentText,
            time: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Simulate mentor response after 1.2s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: Message = {
        id: `reply-${Date.now()}`,
        text: `Thanks for your note! I reviewed your message regarding "${currentText.slice(0, 30)}..." and I will update your progress log.`,
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedId) {
            return {
              ...c,
              lastMessage: replyMsg.text,
              time: 'Just now',
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
      toast.info(`New reply from ${activeConversation.name}`);
    }, 1400);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Messages & Mentorship
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Direct communication with course instructors, mentors, and peers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[680px]">
        {/* Left Sidebar: Conversation List */}
        <Card className="lg:col-span-4 card-premium flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[hsl(var(--border)/0.6)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Search messages & mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-[hsl(var(--background))]"
              />
            </div>
          </div>

          <div className="divide-y divide-[hsl(var(--border)/0.4)] overflow-y-auto flex-1">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[hsl(var(--primary)/0.08)] border-l-4 border-l-[hsl(var(--primary))]'
                      : 'hover:bg-[hsl(var(--muted)/0.5)]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-[hsl(var(--border))]">
                      <AvatarImage src={conv.avatar} alt={conv.name} />
                      <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-bold text-xs">
                        {conv.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[hsl(var(--card))]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs text-[hsl(var(--foreground))] truncate">
                        {conv.name}
                      </h4>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{conv.time}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-[hsl(var(--primary))] mb-1 truncate">
                      {conv.role}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unread > 0 && (
                    <Badge className="bg-[hsl(var(--primary))] text-white text-[10px] h-5 min-w-[20px] rounded-full flex items-center justify-center p-0 font-bold shrink-0">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Area: Active Chat Window */}
        <Card className="lg:col-span-8 card-premium flex flex-col overflow-hidden border border-[hsl(var(--border)/0.6)]">
          {/* Chat Header */}
          <div className="p-4 border-b border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-[hsl(var(--border))]">
                  <AvatarImage src={activeConversation.avatar} alt={activeConversation.name} />
                  <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-bold text-xs">
                    {activeConversation.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {activeConversation.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[hsl(var(--card))]" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[hsl(var(--foreground))]">{activeConversation.name}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {activeConversation.role} • {activeConversation.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--muted-foreground))]">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--muted-foreground))]">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-[hsl(var(--background)/0.5)]">
            {activeConversation.messages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                      isMe
                        ? 'bg-[hsl(var(--primary))] text-white rounded-br-none'
                        : 'bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.6)] text-[hsl(var(--foreground))] rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] ${
                        isMe ? 'text-white/80' : 'text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.6)] p-3 rounded-2xl text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-bounce" />
                  <span>{activeConversation.name} is typing…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Footer */}
          <div className="p-4 border-t border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Message ${activeConversation.name}… (Press Enter to send)`}
                className="min-h-[44px] max-h-[100px] resize-none text-xs rounded-xl border-[hsl(var(--border)/0.8)] focus:ring-[hsl(var(--ring))]"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputText.trim()}
                style={{ background: 'var(--gradient-primary)' }}
                className="h-11 w-11 shrink-0 text-white rounded-xl shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
