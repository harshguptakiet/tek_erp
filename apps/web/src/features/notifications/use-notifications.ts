import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: any) => [...notificationKeys.lists(), filters] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

// Fetch notifications list
export function useNotifications(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: notificationKeys.list(filters || {}),
    queryFn: () => notificationService.getNotifications(filters),
    enabled: !!user?.id,
  });
}

// Fetch unread notifications
export function useUnreadNotifications() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationService.getNotifications({ status: 'UNREAD' }),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Fetch unread count
export function useUnreadCount() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: notificationKeys.count(),
    queryFn: () => notificationService.getUnreadCount(),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Fetch notification preferences
export function useNotificationPreferences() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationService.getPreferences(),
    enabled: !!user?.id,
  });
}

// Send notification mutation
export function useSendNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => notificationService.sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success('Notification sent successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send notification: ${error.message}`);
    },
  });
}

// Mark as read mutation
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark as read: ${error.message}`);
    },
  });
}

// Mark all as read mutation
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark all as read: ${error.message}`);
    },
  });
}

// Delete notification mutation
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count() });
      toast.success('Notification deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete notification: ${error.message}`);
    },
  });
}

// Update preferences mutation
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => notificationService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success('Preferences updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });
}
