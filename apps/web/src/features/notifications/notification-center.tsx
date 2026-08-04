'use client';

import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover } from '@/components/ui/popover';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from './use-notifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const { data: notifications, isLoading } = useNotifications({ limit: 20 });
  const { data: unreadCount } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const unreadNotifications = notifications?.filter((n: any) => n.status === 'UNREAD') || [];
  const readNotifications = notifications?.filter((n: any) => n.status === 'READ') || [];

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const getNotificationIcon = (type: string) => {
    // You can customize icons based on notification type
    return <Bell className="w-5 h-5 text-blue-600" />;
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'MEDIUM':
        return 'border-l-4 border-l-amber-500 bg-amber-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  const content = (
    <div className="w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount?.count > 0 && (
            <Badge variant="default">{unreadCount.count}</Badge>
          )}
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : notifications?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  NEW ({unreadNotifications.length})
                </div>
                {unreadNotifications.map((notification: any) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    isMarkingAsRead={markAsReadMutation.isPending}
                    isDeleting={deleteNotificationMutation.isPending}
                  />
                ))}
              </>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  EARLIER
                </div>
                {readNotifications.map((notification: any) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    isMarkingAsRead={markAsReadMutation.isPending}
                    isDeleting={deleteNotificationMutation.isPending}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t">
        <Button variant="ghost" className="w-full" size="sm">
          View all notifications
        </Button>
      </div>
    </div>
  );

  return (
    <Popover content={content}>
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount?.count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount.count > 9 ? '9+' : unreadCount.count}
          </span>
        )}
      </Button>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingAsRead: boolean;
  isDeleting: boolean;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting,
}: NotificationItemProps) {
  const isUnread = notification.status === 'UNREAD';

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors ${
        isUnread ? 'bg-blue-50/50' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${isUnread ? 'font-semibold' : 'font-normal'}`}>
              {notification.title}
            </p>
            {notification.priority === 'HIGH' && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {isUnread && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isMarkingAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Check className="w-3 h-3 inline mr-1" />
                Mark as read
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              disabled={isDeleting}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
