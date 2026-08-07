'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquarePlus, Check, CheckCheck } from 'lucide-react';
import { useConversations } from './use-messaging';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface ConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation?: () => void;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: conversations, isLoading } = useConversations();

  const filteredConversations = conversations?.filter((conv: any) =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button size="sm" onClick={onNewConversation}>
            <MessageSquarePlus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquarePlus className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation: any) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}

interface ConversationItemProps {
  conversation: any;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-12 h-12">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {conversation.title?.[0]?.toUpperCase() || '?'}
            </div>
          </Avatar>
          {conversation.participants?.some((p: any) => p.isOnline) && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium truncate ${hasUnread ? 'font-semibold' : ''}`}>
              {conversation.title || 'Unnamed Conversation'}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {conversation.lastMessage?.createdAt &&
                formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                  addSuffix: true,
                })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {conversation.lastMessage?.senderId === 'currentUser' && (
                conversation.lastMessage?.status === 'READ' ? (
                  <CheckCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )
              )}
              <p
                className={`text-sm truncate ${
                  hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'
                }`}
              >
                {conversation.lastMessage?.content || 'No messages yet'}
              </p>
            </div>
            {hasUnread && (
              <Badge variant="default" className="ml-2 flex-shrink-0">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
