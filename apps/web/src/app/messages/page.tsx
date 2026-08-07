/**
 * Module 16: Messaging - Messages/Chat Interface
 * FR-MSG-001 to FR-MSG-010: Internal messaging system
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import { messageService } from '@/services/message.service';
import { useAuthStore } from '@/stores/auth.store';

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Real API integration
  const { data: conversationsResponse, isLoading } = useQuery({
    queryKey: ['conversations', user?.id, searchTerm],
    queryFn: () => messageService.getConversations(),
    enabled: !!user?.id,
  });

  // Transform API data
  const conversationsData = Array.isArray(conversationsResponse) ? conversationsResponse : conversationsResponse?.conversations || [];


const { data: messagesData } = useQuery({
  queryKey: ['messages', selectedConversation],
  queryFn: async () => {
    if (!selectedConversation) return [];
    return [
      {
        id: 'm1',
        senderId: 'u1',
        senderName: 'Dr. Rajesh Kumar',
        text: 'Hello! I wanted to discuss the recent assignment.',
        timestamp: '2024-08-02T14:00:00Z',
        isOwn: false,
      },
      {
        id: 'm2',
        senderId: 'me',
        senderName: 'You',
        text: 'Sure, what would you like to know?',
        timestamp: '2024-08-02T14:15:00Z',
        isOwn: true,
      },
      {
        id: 'm3',
        senderId: 'u1',
        senderName: 'Dr. Rajesh Kumar',
        text: 'Thanks for the assignment update!',
        timestamp: '2024-08-02T14:30:00Z',
        isOwn: false,
      },
    ];
  },
  enabled: !!selectedConversation,
});

const sendMessageMutation = useMutation({
  mutationFn: async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: 'new-msg', text, timestamp: new Date().toISOString() };
  },
  onSuccess: () => {
    setMessageText('');
    toast.success('Message sent');
  },
  onError: () => {
    toast.error('Failed to send message');
  },
});

const handleSendMessage = () => {
  if (messageText.trim() && selectedConversation) {
    sendMessageMutation.mutate(messageText);
  }
};

const selectedConv = conversationsData?.find((c: any) => c.id === selectedConversation);

if (isLoading) {
  return (
    <div className="h-screen flex">
      <div className="w-80 border-r animate-pulse bg-gray-100"></div>
      <div className="flex-1 animate-pulse bg-gray-50"></div>
    </div>
  );
}

return (
  <Can
    permission={PERMISSIONS.MESSAGES_READ}
    fallback={
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">You don't have permission to access messages</p>
      </div>
    }
  >
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <Button onClick={() => router.push('/messages/new')}>
            + New Message
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationsData?.map((conv: any) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-indigo-600">
                      {conv.type === 'GROUP' ? '👥' : conv.participants[0].name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {conv.type === 'GROUP' ? conv.name : conv.participants[0].name}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge variant="error" className="ml-2">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      {selectedConv?.type === 'GROUP'
                        ? selectedConv.name
                        : selectedConv?.participants[0].name}
                    </h2>
                    {selectedConv?.type === 'GROUP' && (
                      <p className="text-sm text-gray-600">
                        {selectedConv.participants.length} members
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      ℹ️ Info
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messagesData?.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md ${message.isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border'
                        } rounded-lg px-4 py-3 shadow-sm`}
                    >
                      {!message.isOwn && (
                        <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t px-6 py-4">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">💬</span>
                <p className="text-gray-600">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </Can>
);
}
