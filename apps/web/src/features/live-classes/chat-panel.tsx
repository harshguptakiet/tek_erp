'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { useSendChatMessage, useGetChatHistory } from './use-live-classes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: 'TEACHER' | 'STUDENT';
  message: string;
  timestamp: string;
  isDeleted?: boolean;
}

interface ChatPanelProps {
  classId: string;
  currentUserId: string;
  currentUserRole: 'TEACHER' | 'STUDENT';
  isHost?: boolean;
}

export function ChatPanel({
  classId,
  currentUserId,
  currentUserRole,
  isHost = false,
}: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendChatMessage();
  const { data: chatHistory = [], refetch } = useGetChatHistory(classId);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      refetch();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({
        classId,
        message: message.trim(),
      });
      setMessage('');
      refetch();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Chat</h3>
          <Badge variant="secondary" className="ml-auto">
            {chatHistory.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            chatHistory.map((msg: ChatMessage) => {
              const isOwn = msg.userId === currentUserId;
              const isTeacher = msg.userRole === 'TEACHER';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    isOwn && 'flex-row-reverse'
                  )}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.userAvatar} alt={msg.userName} />
                    <AvatarFallback className={isTeacher ? 'bg-blue-100' : 'bg-gray-100'}>
                      {msg.userName.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      'flex-1 max-w-[70%]',
                      isOwn && 'items-end'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-sm font-medium',
                        isOwn && 'text-right'
                      )}>
                        {isOwn ? 'You' : msg.userName}
                      </span>
                      {isTeacher && (
                        <Badge variant="info" className="text-xs">
                          Teacher
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={cn(
                        'rounded-lg p-3 text-sm',
                        isOwn
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      )}
                    >
                      {msg.isDeleted ? (
                        <p className="italic text-muted-foreground">
                          This message was deleted
                        </p>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      )}
                    </div>

                    {isHost && !msg.isDeleted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-1 h-6 text-xs text-red-500"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            maxLength={500}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {message.length}/500
        </p>
      </div>
    </Card>
  );
}
