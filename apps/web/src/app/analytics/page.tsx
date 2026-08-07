/**
 * Module 15: Analytics - Main Dashboard
 * FR-ANALYTICS-001 to FR-ANALYTICS-010: System-wide analytics and insights
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/stores/auth.store';

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState('THIS_MONTH');
  const [selectedMetric, setSelectedMetric] = useState('OVERVIEW');

  // Real API integration
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['analytics', user?.schoolId, selectedPeriod],
    queryFn: () => analyticsService.getOverviewDashboard(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const analyticsData = analyticsResponse || {
    period: selectedPeriod,
    overview: {},
    attendance: {},
    academic: {},
    engagement: {},
    finance: {},
  };


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
  <Can
    permission={PERMISSIONS.ANALYTICS_READ}
    fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">You don't have permission to view analytics</p>
        </div>
      </div>
    }
  >
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-40"
            >
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="THIS_YEAR">This Year</option>
            </Select>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview.totalStudents}</p>
            <p className="text-sm text-green-600 mt-1">
              {analyticsData?.overview.activeStudents} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Teachers</p>
            <p className="text-3xl font-bold text-gray-900">{analyticsData?.overview.totalTeachers}</p>
            <p className="text-sm text-green-600 mt-1">
              {analyticsData?.overview.activeTeachers} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Attendance</p>
            <p className="text-3xl font-bold text-blue-600">{analyticsData?.overview.averageAttendance}%</p>
            <p className="text-sm text-green-600 mt-1">
              {analyticsData?.attendance.trend} vs last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Grade</p>
            <p className="text-3xl font-bold text-purple-600">{analyticsData?.overview.averageGrade}%</p>
            <p className="text-sm text-green-600 mt-1">
              {analyticsData?.academic.trend} vs last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric Selector */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'ATTENDANCE', label: 'Attendance' },
            { id: 'ACADEMIC', label: 'Academic' },
            { id: 'ENGAGEMENT', label: 'Engagement' },
            { id: 'FINANCE', label: 'Finance' },
          ].map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`pb-3 px-1 border-b-2 transition-colors ${selectedMetric === metric.id
                  ? 'border-indigo-600 text-indigo-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedMetric === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Classes</span>
                  <span className="font-semibold text-gray-900">
                    {analyticsData?.overview.totalClasses}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Students</span>
                  <span className="font-semibold text-gray-900">
                    {analyticsData?.overview.activeStudents}/{analyticsData?.overview.totalStudents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Teachers</span>
                  <span className="font-semibold text-gray-900">
                    {analyticsData?.overview.activeTeachers}/{analyticsData?.overview.totalTeachers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending Assignments</span>
                  <span className="font-semibold text-orange-600">
                    {analyticsData?.overview.pendingAssignments}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => router.push('/attendance/reports')}>
                  Attendance Report
                </Button>
                <Button variant="outline" onClick={() => router.push('/analytics/performance')}>
                  Performance Report
                </Button>
                <Button variant="outline" onClick={() => router.push('/fees')}>
                  Fee Collection
                </Button>
                <Button variant="outline" onClick={() => router.push('/analytics/export')}>
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Tab */}
      {selectedMetric === 'ATTENDANCE' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.attendance.byClass.map((classData: any) => (
                  <div key={classData.class}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{classData.class}</span>
                      <span className="text-sm text-gray-600">
                        {classData.present}/{classData.students} ({classData.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${classData.percentage >= 90
                            ? 'bg-green-600'
                            : classData.percentage >= 75
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                        style={{ width: `${classData.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers (Attendance)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData?.attendance.topPerformers.map((student: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.class}</p>
                      </div>
                    </div>
                    <Badge variant="success">{student.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Academic Tab */}
      {selectedMetric === 'ACADEMIC' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.academic.subjectPerformance.map((subject: any) => (
                  <div key={subject.subject}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{subject.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{subject.average}%</span>
                        <span className={`text-sm ${subject.trend === 'up' ? 'text-green-600' :
                            subject.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                          {subject.trend === 'up' ? '↑' : subject.trend === 'down' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600"
                        style={{ width: `${subject.average}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData?.academic.gradeDistribution.map((grade: any) => (
                  <div key={grade.grade} className="flex items-center gap-4">
                    <div className="w-12">
                      <Badge variant={
                        grade.grade.startsWith('A') ? 'success' :
                          grade.grade.startsWith('B') ? 'info' : 'warning'
                      }>
                        {grade.grade}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{grade.count} students</span>
                        <span className="text-sm font-medium">{grade.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${grade.percentage * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Engagement Tab */}
      {selectedMetric === 'ENGAGEMENT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Assignment Submission</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.engagement.assignmentSubmissionRate}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Avg Submission Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.engagement.averageSubmissionTime}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Live Class Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.engagement.liveClassAttendance}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Content Access Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.engagement.contentAccessRate}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData?.engagement.mostActiveStudents.map((student: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.class}</p>
                      </div>
                    </div>
                    <Badge variant="info">{student.activities} activities</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Finance Tab */}
      {selectedMetric === 'FINANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{((analyticsData?.finance?.totalCollected ?? 0) / 10000000).toFixed(1)}Cr
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {analyticsData?.finance?.collectionRate ?? 0}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{((analyticsData?.finance?.totalPending ?? 0) / 10000000).toFixed(1)}Cr
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {(100 - (analyticsData?.finance?.collectionRate ?? 0)).toFixed(1)}% remaining
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData?.finance.collectionRate}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {analyticsData?.finance.trend} vs last period
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fee Collection by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.finance.byClass.map((classData: any) => (
                  <div key={classData.class}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{classData.class}</span>
                      <span className="text-sm text-gray-600">
                        ₹{(classData.collected / 10000000).toFixed(1)}Cr / ₹
                        {((classData.collected + classData.pending) / 10000000).toFixed(1)}Cr
                        ({classData.rate}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${classData.rate >= 90 ? 'bg-green-600' :
                            classData.rate >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                        style={{ width: `${classData.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  </Can>
);
}
