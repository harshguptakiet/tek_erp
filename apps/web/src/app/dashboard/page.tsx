/**
 * Module 00: Dashboard - Main Dashboard
 * Role-based dashboard with personalized widgets and insights
 */

'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();

  // Mock data - replace with actual API call
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => ({
      user: {
        name: 'Aarav Kumar',
        role: 'STUDENT',
        class: 'Class 10',
        section: 'A',
        avatar: null,
      },
      quickStats: {
        attendance: 92.5,
        assignmentsPending: 3,
        upcomingExams: 2,
        unreadNotifications: 5,
      },
      recentActivity: [
        {
          id: '1',
          type: 'ASSIGNMENT',
          title: 'Mathematics Assignment Submitted',
          description: 'Your assignment has been graded: 95/100',
          timestamp: '2024-08-02T10:30:00Z',
          icon: '📝',
        },
        {
          id: '2',
          type: 'EXAM',
          title: 'Physics Mid-Term Exam',
          description: 'Scheduled for August 10, 2024',
          timestamp: '2024-08-01T14:00:00Z',
          icon: '📋',
        },
        {
          id: '3',
          type: 'ANNOUNCEMENT',
          title: 'Parent-Teacher Meeting',
          description: 'PTM scheduled for August 15, 2024',
          timestamp: '2024-07-30T09:00:00Z',
          icon: '📢',
        },
      ],
      upcomingClasses: [
        {
          id: 'c1',
          subject: 'Mathematics',
          teacher: 'Dr. Rajesh Kumar',
          time: '09:00 AM',
          room: 'Room 201',
          type: 'REGULAR',
        },
        {
          id: 'c2',
          subject: 'Physics',
          teacher: 'Prof. Priya Singh',
          time: '10:00 AM',
          room: 'Lab 101',
          type: 'REGULAR',
        },
        {
          id: 'c3',
          subject: 'Chemistry',
          teacher: 'Ms. Anjali Sharma',
          time: '11:00 AM',
          room: 'Lab 102',
          type: 'LIVE',
        },
      ],
      pendingTasks: [
        {
          id: 't1',
          title: 'Complete Chemistry Assignment',
          dueDate: '2024-08-05',
          priority: 'HIGH',
          type: 'ASSIGNMENT',
        },
        {
          id: 't2',
          title: 'Submit Biology Project',
          dueDate: '2024-08-08',
          priority: 'MEDIUM',
          type: 'PROJECT',
        },
        {
          id: 't3',
          title: 'Return Library Book',
          dueDate: '2024-08-03',
          priority: 'HIGH',
          type: 'LIBRARY',
        },
      ],
      weeklySchedule: {
        Monday: 7,
        Tuesday: 8,
        Wednesday: 7,
        Thursday: 8,
        Friday: 6,
        Saturday: 4,
      },
    }),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {dashboardData?.user.name}! 👋
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {dashboardData?.user.class} - Section {dashboardData?.user.section}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/attendance')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData?.quickStats.attendance}%
                </p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/assignments')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-orange-600">
                  {dashboardData?.quickStats.assignmentsPending}
                </p>
              </div>
              <span className="text-4xl">📝</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/exams')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Exams</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboardData?.quickStats.upcomingExams}
                </p>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/notifications')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifications</p>
                <p className="text-3xl font-bold text-red-600">
                  {dashboardData?.quickStats.unreadNotifications}
                </p>
              </div>
              <span className="text-4xl">🔔</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Classes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/timetable')}>
                  View Full →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.upcomingClasses.map((cls: any) => (
                  <div key={cls.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 text-center">
                      <p className="font-bold text-lg text-gray-900">{cls.time}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{cls.subject}</p>
                        {cls.type === 'LIVE' && (
                          <Badge variant="success" className="text-xs">LIVE</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {cls.teacher} • {cls.room}
                      </p>
                    </div>
                    {cls.type === 'LIVE' && (
                      <Button size="sm">Join Now</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.pendingTasks.map((task: any) => (
                  <div key={task.id} className="border-l-4 border-orange-500 pl-3 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={task.priority === 'HIGH' ? 'error' : 'warning'}
                        className="text-xs ml-2"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline"
                onClick={() => router.push('/assignments')}>
                View All Tasks
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Classes */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(dashboardData?.weeklySchedule || {}).map(([day, count]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${(count as number / 8) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/assignments')}>
                  📝 Assignments
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/exams')}>
                  📋 Exams
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/content')}>
                  📚 Library
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/fees')}>
                  💳 Fees
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
