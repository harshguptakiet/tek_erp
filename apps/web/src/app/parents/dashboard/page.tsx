/**
 * Module 02: User Management - Parent Dashboard
 * FR-USER-033 to FR-USER-040: Parent portal and dashboard
 */

'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function ParentDashboardPage() {
  const router = useRouter();

  // Mock data - replace with actual API call
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['parent-dashboard'],
    queryFn: async () => ({
      parent: {
        id: 'parent1',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '+91 9876543210',
      },
      children: [
        {
          id: 's1',
          name: 'Aarav Kumar',
          class: 'Class 10',
          section: 'A',
          admissionNumber: 'ADM2024001',
          attendance: {
            present: 92,
            total: 100,
            percentage: 92,
          },
          recentGrades: [
            { subject: 'Mathematics', grade: 'A+', marks: 95, total: 100 },
            { subject: 'Physics', grade: 'A', marks: 88, total: 100 },
            { subject: 'Chemistry', grade: 'A', marks: 90, total: 100 },
          ],
          upcomingExams: [
            { subject: 'Biology', date: '2024-08-10', type: 'Unit Test' },
            { subject: 'English', date: '2024-08-12', type: 'Mid-Term' },
          ],
          pendingAssignments: 2,
          feeStatus: {
            totalFee: 96000,
            paid: 72000,
            pending: 24000,
            nextDueDate: '2024-12-31',
          },
        },
        {
          id: 's2',
          name: 'Diya Kumar',
          class: 'Class 8',
          section: 'B',
          admissionNumber: 'ADM2024002',
          attendance: {
            present: 88,
            total: 100,
            percentage: 88,
          },
          recentGrades: [
            { subject: 'Mathematics', grade: 'A', marks: 90, total: 100 },
            { subject: 'Science', grade: 'A+', marks: 95, total: 100 },
            { subject: 'English', grade: 'B+', marks: 82, total: 100 },
          ],
          upcomingExams: [
            { subject: 'Hindi', date: '2024-08-11', type: 'Unit Test' },
          ],
          pendingAssignments: 1,
          feeStatus: {
            totalFee: 80000,
            paid: 80000,
            pending: 0,
            nextDueDate: null,
          },
        },
      ],
      recentNotifications: [
        {
          id: 'n1',
          title: 'Parent-Teacher Meeting',
          message: 'PTM scheduled for Aug 15, 2024 at 10:00 AM',
          date: '2024-08-01T09:00:00Z',
          type: 'EVENT',
          isRead: false,
        },
        {
          id: 'n2',
          title: 'Fee Payment Reminder',
          message: 'Q4 fee payment due by Dec 31, 2024',
          date: '2024-07-30T08:00:00Z',
          type: 'FEE',
          isRead: true,
        },
        {
          id: 'n3',
          title: 'Assignment Submitted',
          message: 'Aarav has submitted Mathematics assignment',
          date: '2024-07-28T14:30:00Z',
          type: 'ASSIGNMENT',
          isRead: true,
        },
      ],
      upcomingEvents: [
        {
          id: 'e1',
          title: 'Annual Sports Day',
          date: '2024-08-20',
          type: 'SPORTS',
        },
        {
          id: 'e2',
          title: 'Science Exhibition',
          date: '2024-08-25',
          type: 'ACADEMIC',
        },
      ],
    }),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = dashboardData?.recentNotifications.filter((n: any) => !n.isRead).length || 0;

  return (
    <Can
      permission={PERMISSIONS.PARENTS_READ}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have access to the parent dashboard</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back, {dashboardData?.parent.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push('/notifications')}>
                🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
              </Button>
              <Button onClick={() => router.push('/parents/profile')}>
                View Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Children</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData?.children.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Pending Assignments</p>
              <p className="text-3xl font-bold text-orange-600">
                {dashboardData?.children.reduce((sum: number, child: any) => sum + child.pendingAssignments, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Upcoming Exams</p>
              <p className="text-3xl font-bold text-blue-600">
                {dashboardData?.children.reduce((sum: number, child: any) => sum + child.upcomingExams.length, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Unread Notifications</p>
              <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Children Cards */}
        <div className="mb-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">My Children</h2>

          {dashboardData?.children.map((child: any) => (
            <Card key={child.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {child.class} - Section {child.section} • {child.admissionNumber}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/students/${child.id}`)}
                  >
                    View Full Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Attendance */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Attendance</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Present:</span>
                        <span className="font-semibold">{child.attendance.present}/{child.attendance.total}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            child.attendance.percentage >= 90
                              ? 'bg-green-600'
                              : child.attendance.percentage >= 75
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${child.attendance.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {child.attendance.percentage}%
                      </p>
                    </div>
                  </div>

                  {/* Recent Grades */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Grades</p>
                    <div className="space-y-2">
                      {child.recentGrades.map((grade: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{grade.subject}:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{grade.marks}/{grade.total}</span>
                            <Badge variant={
                              grade.grade.startsWith('A') ? 'success' :
                              grade.grade.startsWith('B') ? 'info' : 'warning'
                            }>
                              {grade.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Exams */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Upcoming Exams</p>
                    {child.upcomingExams.length === 0 ? (
                      <p className="text-sm text-gray-500">No exams scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {child.upcomingExams.map((exam: any, idx: number) => (
                          <div key={idx} className="bg-blue-50 p-2 rounded">
                            <p className="text-sm font-semibold text-gray-900">{exam.subject}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(exam.date).toLocaleDateString()} • {exam.type}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fee Status */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Fee Status</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">₹{child.feeStatus.totalFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-semibold text-green-600">₹{child.feeStatus.paid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pending:</span>
                        <span className={`font-semibold ${child.feeStatus.pending > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                          ₹{child.feeStatus.pending.toLocaleString()}
                        </span>
                      </div>
                      {child.feeStatus.pending > 0 && (
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => router.push('/fees/payment')}
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pending Assignments Alert */}
                {child.pendingAssignments > 0 && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-orange-900">
                      ⚠️ {child.pendingAssignments} pending assignment{child.pendingAssignments > 1 ? 's' : ''}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => router.push(`/students/${child.id}?tab=assignments`)}
                    >
                      View Assignments
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Notifications</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/notifications')}
                >
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentNotifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.isRead
                        ? 'bg-white border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${
                          notification.isRead ? 'text-gray-900' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.date).toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.upcomingEvents.map((event: any) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">
                          {event.type === 'SPORTS' ? '🏆' : event.type === 'ACADEMIC' ? '📚' : '📅'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20" onClick={() => router.push('/attendance')}>
                <div className="text-center">
                  <span className="block text-2xl mb-1">📊</span>
                  <span className="text-sm">Attendance</span>
                </div>
              </Button>
              <Button variant="outline" className="h-20" onClick={() => router.push('/assignments')}>
                <div className="text-center">
                  <span className="block text-2xl mb-1">📝</span>
                  <span className="text-sm">Assignments</span>
                </div>
              </Button>
              <Button variant="outline" className="h-20" onClick={() => router.push('/exams')}>
                <div className="text-center">
                  <span className="block text-2xl mb-1">📋</span>
                  <span className="text-sm">Exams</span>
                </div>
              </Button>
              <Button variant="outline" className="h-20" onClick={() => router.push('/fees')}>
                <div className="text-center">
                  <span className="block text-2xl mb-1">💳</span>
                  <span className="text-sm">Fees</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
