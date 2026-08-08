/**
 * Parent Portal Dashboard - ENHANCED
 * Comprehensive dashboard for parents to track their children's progress
 */

'use client';

import { ParentDashboard } from '@/features/parent/parent-dashboard';
import { useAuthStore } from '@/stores/auth.store';

export default function ParentPortalPage() {
  const { user } = useAuthStore();

  // Mock data - replace with actual API calls
  const mockChildren = [
    {
      id: 'student-1',
      name: 'John Doe',
      class: '10',
      section: 'A',
      rollNumber: '101',
      avatar: undefined,
      attendance: {
        present: 85,
        total: 100,
        percentage: 85,
      },
      performance: {
        average: 87.5,
        rank: 5,
        totalStudents: 45,
      },
      pendingFees: 5000,
      upcomingExams: 3,
      recentActivity: 'Submitted Math Assignment - 2 hours ago',
    },
    {
      id: 'student-2',
      name: 'Jane Doe',
      class: '8',
      section: 'B',
      rollNumber: '205',
      avatar: undefined,
      attendance: {
        present: 92,
        total: 100,
        percentage: 92,
      },
      performance: {
        average: 91.3,
        rank: 2,
        totalStudents: 40,
      },
      pendingFees: 0,
      upcomingExams: 2,
      recentActivity: 'Attended English Live Class - 5 hours ago',
    },
  ];

  const mockNotifications = {
    unread: 5,
    recent: [
      {
        id: 'notif-1',
        title: 'Assignment Submitted',
        message: 'John submitted Math Assignment successfully',
        time: '2 hours ago',
        type: 'success' as const,
      },
      {
        id: 'notif-2',
        title: 'Fee Reminder',
        message: 'Term 2 fees due in 3 days',
        time: '5 hours ago',
        type: 'warning' as const,
      },
      {
        id: 'notif-3',
        title: 'Parent-Teacher Meeting',
        message: 'PTM scheduled for August 15, 2026',
        time: '1 day ago',
        type: 'info' as const,
      },
      {
        id: 'notif-4',
        title: 'Excellent Performance',
        message: 'Jane scored 95% in Science exam',
        time: '2 days ago',
        type: 'success' as const,
      },
      {
        id: 'notif-5',
        title: 'Attendance Alert',
        message: 'John was absent yesterday',
        time: '3 days ago',
        type: 'warning' as const,
      },
    ],
  };

  const mockMessages = {
    unread: 3,
  };

  return (
    <div className="container mx-auto p-6">
      <ParentDashboard
        parentName={user?.firstName || 'Parent'}
        children={mockChildren}
        notifications={mockNotifications}
        messages={mockMessages}
        quickActions={{ enabled: true }}
      />
    </div>
  );
}
