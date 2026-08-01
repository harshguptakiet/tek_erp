'use client';

import * as React from 'react';
import { useUIStore } from '../../stores/ui.store';
import { cn } from '../../lib/utils';

export function Toaster() {
  const notifications = useUIStore((state) => state.notifications);
  const removeNotification = useUIStore((state) => state.removeNotification);

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
            notification.type === 'success' && 'border-green-500 bg-green-50',
            notification.type === 'error' && 'border-red-500 bg-red-50',
            notification.type === 'warning' && 'border-yellow-500 bg-yellow-50',
            notification.type === 'info' && 'border-blue-500 bg-blue-50'
          )}
        >
          <div className="grid gap-1">
            <div className="text-sm font-semibold">{notification.title}</div>
            {notification.message && (
              <div className="text-sm opacity-90">{notification.message}</div>
            )}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
