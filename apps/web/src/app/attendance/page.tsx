/**
 * Module 10: Attendance Hub
 * Entry point for marking attendance and viewing reports
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { attendanceService } from '@/services/attendance.service';
import { useAuthStore } from '@/stores/auth.store';

export default function AttendanceHubPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Real API integration
  const { data: overviewResponse, isLoading } = useQuery({
    queryKey: ['attendance-overview', user?.schoolId],
    queryFn: () => attendanceService.getAttendanceOverview(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const overview = overviewResponse || {
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    notMarked: 0,
    averageThisWeek: 0,
    classesMarkedToday: 0,
    totalClasses: 0,
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const markProgress =
    overview && overview.totalClasses > 0
      ? Math.round((overview.classesMarkedToday / overview.totalClasses) * 100)
      : 0;

  return (
    <Can permission={PERMISSIONS.ATTENDANCE_VIEW}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="mt-2 text-sm text-gray-600">{today}</p>
          </div>
          <Can permission={PERMISSIONS.ATTENDANCE_MARK}>
            <Button onClick={() => router.push('/attendance/mark')}>Mark attendance</Button>
          </Can>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Present today</p>
              <p className="text-3xl font-bold text-green-600">{overview?.presentToday}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Absent today</p>
              <p className="text-3xl font-bold text-red-600">{overview?.absentToday}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Late today</p>
              <p className="text-3xl font-bold text-yellow-600">{overview?.lateToday}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Weekly average</p>
              <p className="text-3xl font-bold text-indigo-600">{overview?.averageThisWeek}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Quick actions
                {overview?.notMarked ? (
                  <Badge variant="warning">{overview.notMarked} pending</Badge>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Can permission={PERMISSIONS.ATTENDANCE_MARK}>
                <Link
                  href="/attendance/mark"
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">Mark daily attendance</p>
                    <p className="text-sm text-gray-500">Record present, absent, late, or excused</p>
                  </div>
                  <span className="text-indigo-600">→</span>
                </Link>
              </Can>
              <Link
                href="/attendance/reports"
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Reports & analytics</p>
                  <p className="text-sm text-gray-500">Class summaries, exports, and trends</p>
                </div>
                <span className="text-indigo-600">→</span>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                {overview?.classesMarkedToday} of {overview?.totalClasses} classes marked
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${markProgress}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">{markProgress}% complete</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Can>
  );
}
