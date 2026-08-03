/**
 * Module 14: Notifications - Notification Center
 * FR-NOTIF-001 to FR-NOTIF-010: View and manage notifications
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data - replace with actual API call
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', filter, typeFilter],
    queryFn: async () => [
      {
        id: '1',
        type: 'ASSIGNMENT',
        title: 'New Assignment Posted',
        message: 'Mathematics - Quadratic Equations Worksheet has been assigned',
        timestamp: '2024-09-19T10:30:00Z',
        read: false,
        actionUrl: '/assignments/1',
        actionLabel: 'View Assignment',
        priority: 'HIGH',
        icon: '📝',
      },
      {
        id: '2',
        type: 'LIVE_CLASS',
        title: 'Live Class Starting Soon',
        message: 'Science - Photosynthesis Lab starts in 15 minutes',
        timestamp: '2024-09-19T09:45:00Z',
        read: false,
        actionUrl: '/live-classes/2',
        actionLabel: 'Join Class',
        priority: 'URGENT',
        icon: '📹',
      },
      {
        id: '3',
        type: 'GRADE',
        title: 'Grade Published',
        message: 'Your English Essay has been graded: 45/50',
        timestamp: '2024-09-18T16:20:00Z',
        read: true,
        actionUrl: '/assignments/3',
        actionLabel: 'View Grade',
        priority: 'NORMAL',
        icon: '📊',
      },
      {
        id: '4',
        type: 'ATTENDANCE',
        title: 'Attendance Alert',
        message: 'Your attendance is below 75%. Current: 72%',
        timestamp: '2024-09-18T14:00:00Z',
        read: false,
        actionUrl: '/attendance/reports',
        actionLabel: 'View Report',
        priority: 'HIGH',
        icon: '⚠️',
      },
      {
        id: '5',
        type: 'EXAM',
        title: 'Exam Schedule Released',
        message: 'Mid-Term Examination schedule is now available',
        timestamp: '2024-09-18T11:30:00Z',
        read: true,
        actionUrl: '/exams/1',
        actionLabel: 'View Schedule',
        priority: 'HIGH',
        icon: '📋',
      },
      {
        id: '6',
        type: 'ANNOUNCEMENT',
        title: 'School Holiday Announcement',
        message: 'School will be closed on September 25th for Gandhi Jayanti',
        timestamp: '2024-09-17T09:00:00Z',
        read: true,
        actionUrl: '/announcements/5',
        actionLabel: 'Read More',
        priority: 'NORMAL',
        icon: '📢',
      },
      {
        id: '7',
        type: 'FEE',
        title: 'Fee Payment Reminder',
        message: 'Your quarterly fee payment is due on September 30th',
        timestamp: '2024-09-16T10:00:00Z',
        read: false,
        actionUrl: '/fees/payment',
        actionLabel: 'Pay Now',
        priority: 'HIGH',
        icon: '💳',
      },
      {
        id: '8',
        type: 'CONTENT',
        title: 'New Study Material Available',
        message: 'Chapter 5 Notes - Physics has been uploaded',
        timestamp: '2024-09-15T15:30:00Z',
        read: true,
        actionUrl: '/content/12',
        actionLabel: 'Download',
        priority: 'NORMAL',
        icon: '📚',
      },
    ],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      return notificationId;
    },
    onSuccess: () => {
      refetch();
      toast.success('Marked as read');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      refetch();
      toast.success('All notifications marked as read');
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      return notificationId;
    },
    onSuccess: () => {
      refetch();
      toast.success('Notification deleted');
    },
  });

  const filteredNotifications = notifications?.filter((notif: any) => {
    const matchesReadFilter =
      filter === 'all' ||
      (filter === 'unread' && !notif.read) ||
      (filter === 'read' && notif.read);
    
    const matchesTypeFilter =
      typeFilter === 'all' || notif.type === typeFilter;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const priorityColors = {
    URGENT: 'bg-red-100 border-red-300',
    HIGH: 'bg-yellow-100 border-yellow-300',
    NORMAL: 'bg-white border-gray-200',
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-sm text-gray-600">
              Stay updated with important information and updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/notifications/preferences')}
            >
              ⚙️ Preferences
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats & Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                <p className="text-xs text-gray-600">Unread</p>
              </div>
              <div className="text-center px-4 border-l">
                <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <Select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="ASSIGNMENT">Assignments</option>
                <option value="LIVE_CLASS">Live Classes</option>
                <option value="GRADE">Grades</option>
                <option value="EXAM">Exams</option>
                <option value="ATTENDANCE">Attendance</option>
                <option value="FEE">Fees</option>
                <option value="ANNOUNCEMENT">Announcements</option>
                <option value="CONTENT">Content</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No notifications found</p>
                <p className="text-sm">
                  {filter === 'unread' ? "You're all caught up!" : 'Check back later for updates'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications?.map((notification: any) => (
            <Card
              key={notification.id}
              className={`${
                !notification.read ? 'border-l-4 border-l-blue-500' : ''
              } ${priorityColors[notification.priority as keyof typeof priorityColors]} transition-all hover:shadow-md`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {notification.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${
                          !notification.read ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          {notification.priority === 'URGENT' && (
                            <Badge variant="error" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant={!notification.read ? 'default' : 'outline'}
                            onClick={() => {
                              if (!notification.read) {
                                markAsReadMutation.mutate(notification.id);
                              }
                              router.push(notification.actionUrl);
                            }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                        <div className="flex flex-col gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                              disabled={markAsReadMutation.isPending}
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                            disabled={deleteNotificationMutation.isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Empty State for All Read */}
      {filteredNotifications?.length === 0 && filter === 'unread' && (
        <div className="mt-6 text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-lg font-semibold text-gray-900">All caught up!</p>
          <p className="text-sm text-gray-600 mt-2">
            You have no unread notifications
          </p>
        </div>
      )}
    </div>
  );
}
