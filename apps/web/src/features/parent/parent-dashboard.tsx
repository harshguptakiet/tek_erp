/**
 * Parent Dashboard Component
 * Comprehensive overview for parents to track their children
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Calendar,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  MessageSquare,
  Bell,
  Award,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface Child {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  avatar?: string;
  attendance: {
    present: number;
    total: number;
    percentage: number;
  };
  performance: {
    average: number;
    rank: number;
    totalStudents: number;
  };
  pendingFees: number;
  upcomingExams: number;
  recentActivity: string;
}

interface ParentDashboardProps {
  parentName: string;
  children: Child[];
  notifications: {
    unread: number;
    recent: {
      id: string;
      title: string;
      message: string;
      time: string;
      type: 'info' | 'warning' | 'success';
    }[];
  };
  messages: {
    unread: number;
  };
  quickActions: {
    enabled: boolean;
  };
}

export function ParentDashboard({
  parentName,
  children,
  notifications,
  messages,
  quickActions,
}: ParentDashboardProps) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || '');

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Excellent' };
    if (percentage >= 75) return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Good' };
    if (percentage >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Average' };
    return { color: 'text-red-600', bg: 'bg-red-50', label: 'Poor' };
  };

  const getPerformanceStatus = (average: number) => {
    if (average >= 90) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Outstanding' };
    if (average >= 75) return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Very Good' };
    if (average >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Good' };
    return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Needs Improvement' };
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {parentName}!</h1>
          <p className="text-muted-foreground">Track your child's progress and stay informed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/parent-portal/messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
              {messages.unread > 0 && (
                <Badge className="ml-2 bg-red-500">{messages.unread}</Badge>
              )}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {notifications.unread > 0 && (
                <Badge className="ml-2 bg-red-500">{notifications.unread}</Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Viewing:</span>
            <div className="flex gap-2 flex-wrap">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChildId === child.id ? 'default' : 'outline'}
                  onClick={() => setSelectedChildId(child.id)}
                  className="gap-2"
                >
                  <Avatar className="h-6 w-6">
                    {child.avatar ? (
                      <img src={child.avatar} alt={child.name} />
                    ) : (
                      <div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full text-xs">
                        {child.name.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  {child.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {selectedChild && (
        <>
          {/* Student Info Card */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {selectedChild.avatar ? (
                  <img src={selectedChild.avatar} alt={selectedChild.name} />
                ) : (
                  <div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full text-2xl">
                    {selectedChild.name.charAt(0)}
                  </div>
                )}
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selectedChild.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-muted-foreground">
                    Class {selectedChild.class} {selectedChild.section}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Roll No: {selectedChild.rollNumber}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <Activity className="h-4 w-4 inline mr-1" />
                  {selectedChild.recentActivity}
                </p>
              </div>
              <Button asChild>
                <Link href={`/parent-portal/child/${selectedChild.id}`}>
                  View Full Profile
                </Link>
              </Button>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getAttendanceStatus(selectedChild.attendance.percentage).bg}`}>
                  <Calendar className={`h-6 w-6 ${getAttendanceStatus(selectedChild.attendance.percentage).color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="text-2xl font-bold">{selectedChild.attendance.percentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedChild.attendance.present}/{selectedChild.attendance.total} days
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getPerformanceStatus(selectedChild.performance.average).bg}`}>
                  <TrendingUp className={`h-6 w-6 ${getPerformanceStatus(selectedChild.performance.average).color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <p className="text-2xl font-bold">{selectedChild.performance.average}%</p>
                  <p className="text-xs text-muted-foreground">
                    Rank {selectedChild.performance.rank}/{selectedChild.performance.totalStudents}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${selectedChild.pendingFees > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <DollarSign className={`h-6 w-6 ${selectedChild.pendingFees > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Pending Fees</p>
                  <p className="text-2xl font-bold">₹{selectedChild.pendingFees.toLocaleString()}</p>
                  {selectedChild.pendingFees > 0 && (
                    <Link href="/fees/payment" className="text-xs text-blue-600 hover:underline">
                      Pay Now →
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${selectedChild.upcomingExams > 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <BookOpen className={`h-6 w-6 ${selectedChild.upcomingExams > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Upcoming Exams</p>
                  <p className="text-2xl font-bold">{selectedChild.upcomingExams}</p>
                  <Link href="/exams" className="text-xs text-blue-600 hover:underline">
                    View Schedule →
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Alerts */}
          {(selectedChild.attendance.percentage < 75 || selectedChild.pendingFees > 0) && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">Attention Required</h3>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    {selectedChild.attendance.percentage < 75 && (
                      <li>• Attendance is below 75%. Please ensure regular attendance.</li>
                    )}
                    {selectedChild.pendingFees > 0 && (
                      <li>• Fee payment of ₹{selectedChild.pendingFees.toLocaleString()} is pending.</li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Tabs Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recent Notifications */}
                <Card>
                  <div className="p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Recent Notifications
                    </h3>
                  </div>
                  <div className="divide-y">
                    {notifications.recent.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-muted/50">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded ${
                            notif.type === 'success' ? 'bg-green-100' :
                            notif.type === 'warning' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            {notif.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                             notif.type === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                             <Bell className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-sm text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full" asChild>
                      <Link href="/notifications">View All Notifications</Link>
                    </Button>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Quick Actions</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/fees/payment">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay Fees
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/leaves/apply">
                        <Calendar className="h-4 w-4 mr-2" />
                        Apply for Leave
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/parent-teacher">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Teacher
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/report-cards`}>
                        <Award className="h-4 w-4 mr-2" />
                        View Report Cards
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/assignments">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Assignments
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/timetable">
                        <Clock className="h-4 w-4 mr-2" />
                        View Timetable
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="academics">
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  Academic details will be displayed here. See subject-wise performance, recent grades, and upcoming exams.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  Detailed attendance records and history will be shown here.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="fees">
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  Fee structure, payment history, and pending dues will be displayed here.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="communication">
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  Messages from teachers and school announcements will appear here.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
