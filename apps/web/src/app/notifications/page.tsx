/**
 * Notifications Page
 * View and manage all notifications
 */

'use client';

import { NotificationCenter } from '@/features/notifications/notification-center';

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Notifications</h1>
        <p className="page-description">
          Stay updated with your announcements, academic alerts, assignments, and messages
        </p>
      </div>

      <div className="card-premium p-6">
        <NotificationCenter />
      </div>
    </div>
  );
}
