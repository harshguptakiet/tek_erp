'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Award,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useAnalyticsDashboard } from './use-analytics';
import { useState } from 'react';

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const { data: analytics, isLoading } = useAnalyticsDashboard({ timeRange });

  if (isLoading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  const stats = [
    {
      title: 'Total Students',
      value: analytics?.totalStudents || 0,
      change: analytics?.studentGrowth || 0,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Average Attendance',
      value: `${analytics?.averageAttendance || 0}%`,
      change: analytics?.attendanceChange || 0,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Active Courses',
      value: analytics?.activeCourses || 0,
      change: analytics?.courseGrowth || 0,
      icon: BookOpen,
      color: 'purple',
    },
    {
      title: 'Avg Performance',
      value: `${analytics?.averagePerformance || 0}%`,
      change: analytics?.performanceChange || 0,
      icon: Award,
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">Overview of your school performance</p>
        </div>
        <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 3 months</option>
          <option value="1y">Last year</option>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            amber: 'bg-amber-100 text-amber-600',
          };

          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-medium">{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Attendance Trend</h3>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Chart visualization would go here</p>
              <p className="text-xs">(Line chart showing attendance over time)</p>
            </div>
          </div>
        </Card>

        {/* Performance Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Performance Distribution</h3>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Chart visualization would go here</p>
              <p className="text-xs">(Bar chart showing grade distribution)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="space-y-3">
            {analytics?.topPerformers?.slice(0, 5).map((student: any, index: number) => (
              <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.class}</p>
                </div>
                <Badge variant="success">{student.score}%</Badge>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-8">No data available</p>
            )}
          </div>
        </Card>

        {/* Alerts & Warnings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alerts & Warnings</h3>
          <div className="space-y-3">
            {analytics?.alerts?.slice(0, 5).map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                  alert.severity === 'HIGH' ? 'text-red-600' : 
                  alert.severity === 'MEDIUM' ? 'text-amber-600' : 
                  'text-blue-600'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                </div>
                <Badge variant={
                  alert.severity === 'HIGH' ? 'destructive' : 
                  alert.severity === 'MEDIUM' ? 'warning' : 
                  'default'
                } className="text-xs">
                  {alert.severity}
                </Badge>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-8">No alerts</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
