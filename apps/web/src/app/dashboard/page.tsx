/**
 * Module 00: Dashboard - Main Dashboard
 * Role-based dashboard with personalized widgets and insights
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'User';
  const displayRole = user?.role || 'USER';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {displayRole.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/dashboard/students')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-3xl font-bold text-blue-600">-</p>
              </div>
              <span className="text-4xl">👨‍🎓</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/dashboard/teachers')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Teachers</p>
                <p className="text-3xl font-bold text-green-600">-</p>
              </div>
              <span className="text-4xl">👨‍🏫</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/dashboard/classes')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classes</p>
                <p className="text-3xl font-bold text-purple-600">-</p>
              </div>
              <span className="text-4xl">🏫</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/dashboard/attendance')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-3xl font-bold text-orange-600">-</p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push('/dashboard/students')}
            >
              <span className="text-2xl">👨‍🎓</span>
              <span>View Students</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push('/dashboard/teachers')}
            >
              <span className="text-2xl">👨‍🏫</span>
              <span>View Teachers</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push('/dashboard/classes')}
            >
              <span className="text-2xl">🏫</span>
              <span>View Classes</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push('/dashboard/attendance')}
            >
              <span className="text-2xl">📊</span>
              <span>Take Attendance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push('/dashboard/subjects')}
            >
              <span className="text-2xl">📚</span>
              <span>Subjects</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push('/dashboard/exams')}
            >
              <span className="text-2xl">📝</span>
              <span>Exams</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push('/dashboard/fees')}
            >
              <span className="text-2xl">💰</span>
              <span>Fees</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push('/dashboard/settings')}
            >
              <span className="text-2xl">⚙️</span>
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ol className="list-decimal list-inside space-y-2">
            <li>Navigate to Students section to view and manage student records</li>
            <li>Check Teachers section for faculty management</li>
            <li>View Classes to see all academic classes and sections</li>
            <li>Use Attendance to mark daily attendance</li>
            <li>Configure system settings in Settings page</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
