import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const messagingKeys = {
  all: ['messaging'] as const,
  conversations: () => [...messagingKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...messagingKeys.conversations(), id] as const,
  messages: (conversationId: string) => [...messagingKeys.all, 'messages', conversationId] as const,
  unread: () => [...messagingKeys.all, 'unread'] as const,
};

// Fetch conversations list
export function useConversations(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...messagingKeys.conversations(), filters],
    queryFn: () => messageService.listConversations(filters),
    enabled: !!user?.id,
  });
}

// Fetch single conversation
export function useConversation(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: messagingKeys.conversation(id),
    queryFn: () => messageService.getConversation(id),
    enabled: !!user?.id && !!id,
  });
}

// Fetch messages in a conversation
export function useMessages(conversationId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: messagingKeys.messages(conversationId),
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!user?.id && !!conversationId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

// Fetch unread message count
export function useUnreadCount() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: messagingKeys.unread(),
    queryFn: () => messageService.getUnreadCount(),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Create conversation mutation
export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => messageService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      toast.success('Conversation created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create conversation: ${error.message}`);
    },
  });
}

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: any }) =>
      messageService.sendMessage(conversationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
}

// Mark as read mutation
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: string) => messageService.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: messagingKeys.unread() });
    },
  });
}

// Delete message mutation
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      messageService.deleteMessage(messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.messages(variables.conversationId) });
      toast.success('Message deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete message: ${error.message}`);
    },
  });
}

// Archive conversation mutation
export function useArchiveConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: string) => messageService.archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      toast.success('Conversation archived');
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive conversation: ${error.message}`);
    },
  });
}
