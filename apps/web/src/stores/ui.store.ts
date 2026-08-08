import { create } from 'zustand';
import { toast } from 'sonner';

export interface UINotification {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Mobile
  mobileSidebarOpen: boolean;

  // Notifications
  notifications: UINotification[];
  addNotification: (notification: UINotification) => void;
  removeNotification: (id: string) => void;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,

  notifications: [],
  addNotification: (notification) => {
    // Show toast via sonner as well for instant UI feedback
    if (notification.type === 'error') {
      toast.error(notification.title, { description: notification.message });
    } else if (notification.type === 'success') {
      toast.success(notification.title, { description: notification.message });
    } else {
      toast.info(notification.title, { description: notification.message });
    }

    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: notification.id || Math.random().toString(36).substring(2, 9) },
      ],
    }));
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebarCollapse: () =>
    set((state) => {
      const newCollapsed = !state.sidebarCollapsed;
      // Persist preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', String(newCollapsed));
      }
      return { sidebarCollapsed: newCollapsed };
    }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
