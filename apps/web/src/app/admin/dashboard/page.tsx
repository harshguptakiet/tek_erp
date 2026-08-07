/**
 * Admin Dashboard - System-wide Overview
 * Complete system monitoring and management
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { 
  Loader2, 
  Users, 
  BookOpen, 
  Calendar, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  Server,
  Database,
  Zap,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', user?.schoolId],
    queryFn: () => analyticsService.getSystemOverview(),
    enabled: !!user?.schoolId,
  });

  const stats = data?.stats || {};
  const systemHealth = data?.systemHealth || {};
  const recentActivity = data?.recentActivity || [];
  const alerts = data?.alerts || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Can permission={PERMISSIONS.ADMIN_ACCESS}>
      <div className="max-w-[1800px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                System-wide monitoring and management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={systemHealth.status === 'healthy' ? 'success' : 'error'}>
                {systemHealth.status === 'healthy' ? 'System Healthy' : 'Issues Detected'}
              </Badge>
              <Button onClick={() => router.push('/settings')}>
                System Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <AlertCircle className="h-5 w-5" />
                System Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                    <Button size="sm" variant="outline">Resolve</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="success">+12%</Badge>
              </div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeUsers || 0} active today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <Badge variant="success">+8%</Badge>
              </div>
              <p className="text-sm text-gray-600">Active Classes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeClasses || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalStudents || 0} students enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant="default">Today</Badge>
              </div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.attendanceRate || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.presentToday || 0} present today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <Badge variant="success">+15%</Badge>
              </div>
              <p className="text-sm text-gray-600">Revenue (MTD)</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{(stats.monthlyRevenue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingFees || 0} pending payments
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Real-time system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Server Status</p>
                        <p className="text-sm text-gray-600">All systems operational</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Online</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Database</p>
                        <p className="text-sm text-gray-600">Connection stable</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-700">
                        {systemHealth.dbResponseTime || 45}ms
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">API Performance</p>
                        <p className="text-sm text-gray-600">Average response time</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-purple-700">
                        {systemHealth.apiResponseTime || 120}ms
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">CPU Usage</p>
                      <p className="text-2xl font-bold text-gray-900">{systemHealth.cpuUsage || 45}%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">Memory</p>
                      <p className="text-2xl font-bold text-gray-900">{systemHealth.memoryUsage || 62}%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">Storage</p>
                      <p className="text-2xl font-bold text-gray-900">{systemHealth.storageUsage || 38}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => router.push('/students/bulk')}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Bulk Import</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => router.push('/analytics/reports')}
                  >
                    <Activity className="h-5 w-5" />
                    <span className="text-xs">Reports</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => router.push('/settings/integrations')}
                  >
                    <Zap className="h-5 w-5" />
                    <span className="text-xs">Integrations</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => router.push('/account/activity')}
                  >
                    <Clock className="h-5 w-5" />
                    <span className="text-xs">Activity Log</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Total Logins', value: stats.totalLogins || 0, change: '+12%' },
                    { label: 'API Requests', value: stats.apiRequests || 0, change: '+8%' },
                    { label: 'Data Storage', value: `${stats.dataStorage || 0} GB`, change: '+5%' },
                    { label: 'Avg Session Duration', value: `${stats.avgSession || 0} min`, change: '+3%' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      action: 'New user registered', 
                      user: 'John Doe', 
                      time: '2 min ago',
                      type: 'success'
                    },
                    { 
                      action: 'Failed login attempt', 
                      user: 'Unknown', 
                      time: '5 min ago',
                      type: 'error'
                    },
                    { 
                      action: 'Bulk import completed', 
                      user: 'Admin', 
                      time: '15 min ago',
                      type: 'success'
                    },
                    { 
                      action: 'System backup', 
                      user: 'System', 
                      time: '1 hour ago',
                      type: 'info'
                    },
                    { 
                      action: 'Payment processed', 
                      user: 'Jane Smith', 
                      time: '2 hours ago',
                      type: 'success'
                    },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                      {activity.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mt-1" />}
                      {activity.type === 'error' && <XCircle className="h-4 w-4 text-red-600 mt-1" />}
                      {activity.type === 'info' && <Activity className="h-4 w-4 text-blue-600 mt-1" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Total Teachers</span>
                    <span className="font-semibold text-gray-900">{stats.totalTeachers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Total Students</span>
                    <span className="font-semibold text-gray-900">{stats.totalStudents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Active Courses</span>
                    <span className="font-semibold text-gray-900">{stats.activeCourses || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Upcoming Exams</span>
                    <span className="font-semibold text-blue-600">{stats.upcomingExams || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Pending Approvals</span>
                    <span className="font-semibold text-red-600">{stats.pendingApprovals || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Version */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version</span>
                    <span className="font-mono font-semibold">v2.5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment</span>
                    <Badge variant="success">Production</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-semibold">99.98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup</span>
                    <span className="text-gray-900">2 hours ago</span>
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
