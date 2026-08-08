'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  DollarSign,
  Award,
  Calendar,
  BarChart3,
  Download,
} from 'lucide-react';
import { useGetDashboardAnalytics } from './use-analytics';
import { cn } from '@/lib/utils';

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: any;
  color: string;
}

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useGetDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      title: 'Total Students',
      value: analytics?.totalStudents || 0,
      change: 12,
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Teachers',
      value: analytics?.totalTeachers || 0,
      change: 5,
      changeType: 'increase',
      icon: GraduationCap,
      color: 'bg-green-500',
    },
    {
      title: 'Active Classes',
      value: analytics?.activeClasses || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      title: 'Attendance Rate',
      value: `${analytics?.attendanceRate || 0}%`,
      change: -3,
      changeType: 'decrease',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                  {stat.change !== undefined && (
                    <div className="flex items-center gap-1">
                      {stat.changeType === 'increase' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={cn(
                          'text-sm font-medium',
                          stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={cn('p-3 rounded-lg', stat.color, 'bg-opacity-10')}>
                  <Icon className={cn('h-6 w-6', stat.color.replace('bg-', 'text-'))} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attendance Trends</h3>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="space-y-4">
            {analytics?.attendanceTrends?.map((trend: any) => (
              <div key={trend.date} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{trend.date}</span>
                  <span className="font-medium">{trend.percentage}%</span>
                </div>
                <Progress value={trend.percentage} />
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </Card>

        {/* Performance Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Performance Overview</h3>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </div>
          <div className="space-y-4">
            {analytics?.performanceMetrics?.map((metric: any) => (
              <div key={metric.subject} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{metric.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: {metric.average}%
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    metric.average >= 75 ? 'success' :
                    metric.average >= 60 ? 'warning' : 'error'
                  }
                >
                  {metric.average}%
                </Badge>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-3">
            {analytics?.recentAssignments?.map((assignment: any) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="info">{assignment.submissions} submissions</Badge>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No recent assignments
              </div>
            )}
          </TabsContent>

          <TabsContent value="exams" className="space-y-3">
            {analytics?.upcomingExams?.map((exam: any) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exam.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="warning">{exam.duration} mins</Badge>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming exams
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-3">
            <div className="text-center py-8 text-muted-foreground">
              Attendance records will appear here
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
