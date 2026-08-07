/**
 * Module 15: Analytics - Comprehensive Analytics Dashboard
 * FR-ANALYTICS-001: School-wide analytics and insights
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  DollarSign,
  Calendar,
  Target,
  Award,
  Clock,
  Download
} from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedClass, setSelectedClass] = useState('all');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics-dashboard', { timeRange, class: selectedClass, schoolId: user?.schoolId }],
    queryFn: () => analyticsService.getDashboardAnalytics({
      timeRange,
      classId: selectedClass !== 'all' ? selectedClass : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  const stats = analyticsData?.stats || {};
  const trends = analyticsData?.trends || {};
  const topPerformers = analyticsData?.topPerformers || [];
  const recentActivity = analyticsData?.recentActivity || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Can permission={PERMISSIONS.ANALYTICS_VIEW}>
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </Select>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="all">All Classes</option>
                <option value="class-1">Class 1</option>
                <option value="class-2">Class 2</option>
                <option value="class-3">Class 3</option>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(trends.students || 0)}
                  <span className={`text-sm font-medium ${getTrendColor(trends.students || 0)}`}>
                    {Math.abs(trends.students || 0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeStudents || 0} active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(trends.attendance || 0)}
                  <span className={`text-sm font-medium ${getTrendColor(trends.attendance || 0)}`}>
                    {Math.abs(trends.attendance || 0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgAttendance || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">
                Target: 95%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(trends.performance || 0)}
                  <span className={`text-sm font-medium ${getTrendColor(trends.performance || 0)}`}>
                    {Math.abs(trends.performance || 0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Avg Grade</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgGrade || 'B+'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.topPerformers || 0} A+ students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(trends.revenue || 0)}
                  <span className={`text-sm font-medium ${getTrendColor(trends.revenue || 0)}`}>
                    {Math.abs(trends.revenue || 0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Fee Collection</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{(stats.feeCollection || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.collectionRate || 0}% collected
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Academic performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Chart visualization would go here</p>
                    <p className="text-xs">(Line chart showing performance trends)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>
                  Daily attendance patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Attendance heatmap would go here</p>
                    <p className="text-xs">(Calendar view with color-coded attendance)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class-wise Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Class-wise Performance</CardTitle>
                <CardDescription>
                  Average performance by class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { class: 'Class 10', avg: 85, students: 45, trend: 5 },
                    { class: 'Class 9', avg: 82, students: 50, trend: 3 },
                    { class: 'Class 8', avg: 79, students: 48, trend: -2 },
                    { class: 'Class 7', avg: 88, students: 52, trend: 8 },
                  ].map((item) => (
                    <div key={item.class} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <span className="font-bold text-indigo-600">{item.avg}%</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.class}</p>
                          <p className="text-sm text-gray-500">{item.students} students</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(item.trend)}
                        <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                          {Math.abs(item.trend)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Highest achieving students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Aarav Kumar', class: 'Class 10', score: 98, rank: 1 },
                    { name: 'Diya Sharma', class: 'Class 10', score: 97, rank: 2 },
                    { name: 'Rohan Patel', class: 'Class 9', score: 96, rank: 3 },
                    { name: 'Ananya Singh', class: 'Class 9', score: 95, rank: 4 },
                    { name: 'Arjun Reddy', class: 'Class 8', score: 94, rank: 5 },
                  ].map((student) => (
                    <div key={student.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                        {student.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.class}</p>
                      </div>
                      <Badge variant="success">{student.score}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      type: 'exam', 
                      title: 'Math Final Exam', 
                      time: '2 hours ago',
                      icon: BookOpen,
                      color: 'blue'
                    },
                    { 
                      type: 'assignment', 
                      title: '15 Assignments Submitted', 
                      time: '5 hours ago',
                      icon: Clock,
                      color: 'green'
                    },
                    { 
                      type: 'attendance', 
                      title: 'Attendance Marked', 
                      time: '1 day ago',
                      icon: Users,
                      color: 'purple'
                    },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                        <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Teachers</span>
                    <span className="font-semibold text-gray-900">{stats.activeTeachers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Classes</span>
                    <span className="font-semibold text-gray-900">{stats.totalClasses || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Assignments</span>
                    <span className="font-semibold text-red-600">{stats.pendingAssignments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Upcoming Exams</span>
                    <span className="font-semibold text-blue-600">{stats.upcomingExams || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Can>
  );
}
