/**
 * Module 02: User Management - Activity Log
 * FR-USER-004: View account activity and audit trail
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, FileText, Settings, LogIn, LogOut, User, Shield, AlertCircle } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'login' | 'logout' | 'profile_update' | 'password_change' | 'settings_change' | 'security_event' | 'data_access' | 'file_upload';
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  device?: string;
  status: 'success' | 'failed' | 'warning';
  metadata?: Record<string, any>;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login':
      return <LogIn className="h-4 w-4" />;
    case 'logout':
      return <LogOut className="h-4 w-4" />;
    case 'profile_update':
      return <User className="h-4 w-4" />;
    case 'password_change':
      return <Shield className="h-4 w-4" />;
    case 'settings_change':
      return <Settings className="h-4 w-4" />;
    case 'security_event':
      return <AlertCircle className="h-4 w-4" />;
    case 'data_access':
      return <FileText className="h-4 w-4" />;
    case 'file_upload':
      return <FileText className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string, status: string) => {
  if (status === 'failed') return 'text-red-600 bg-red-50';
  if (status === 'warning') return 'text-yellow-600 bg-yellow-50';
  
  switch (type) {
    case 'login':
      return 'text-green-600 bg-green-50';
    case 'logout':
      return 'text-gray-600 bg-gray-50';
    case 'security_event':
      return 'text-red-600 bg-red-50';
    case 'password_change':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-blue-600 bg-blue-50';
  }
};

export default function ActivityLogPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['activity-log', { page, limit, type: typeFilter, status: statusFilter }],
    queryFn: async () => {
      // Mock data - replace with real API call
      const mockActivities: ActivityEvent[] = [
        {
          id: '1',
          type: 'login',
          description: 'Successful login',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          ipAddress: '192.168.1.1',
          location: 'Mumbai, India',
          device: 'Chrome on Windows',
          status: 'success',
        },
        {
          id: '2',
          type: 'profile_update',
          description: 'Updated profile picture',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          ipAddress: '192.168.1.1',
          location: 'Mumbai, India',
          device: 'Chrome on Windows',
          status: 'success',
        },
        {
          id: '3',
          type: 'password_change',
          description: 'Password changed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          ipAddress: '192.168.1.1',
          location: 'Mumbai, India',
          device: 'Chrome on Windows',
          status: 'success',
        },
        {
          id: '4',
          type: 'login',
          description: 'Failed login attempt',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          ipAddress: '203.0.113.0',
          location: 'Unknown',
          device: 'Unknown',
          status: 'failed',
        },
        {
          id: '5',
          type: 'settings_change',
          description: 'Updated notification preferences',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          ipAddress: '192.168.1.1',
          location: 'Mumbai, India',
          device: 'Chrome on Windows',
          status: 'success',
        },
      ];

      return {
        items: mockActivities,
        total: mockActivities.length,
        page,
        limit,
      };
    },
  });

  const activities = data?.items || [];
  const total = data?.total || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          ← Back to settings
        </Button>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review your recent account activity and actions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {activities.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Failed Events</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {activities.filter(a => a.status === 'failed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Last Login</p>
              <p className="text-sm font-bold text-gray-900 mt-1">30 min ago</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="search"
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Events</option>
                <option value="login">Login Events</option>
                <option value="logout">Logout Events</option>
                <option value="profile_update">Profile Updates</option>
                <option value="password_change">Password Changes</option>
                <option value="settings_change">Settings Changes</option>
                <option value="security_event">Security Events</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            A chronological list of actions performed on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No activity found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg border
                    ${activity.status === 'failed' ? 'border-red-200 bg-red-50/50' : 
                      activity.status === 'warning' ? 'border-yellow-200 bg-yellow-50/50' : 
                      'border-gray-200 hover:bg-gray-50'}
                    transition-colors
                  `}
                >
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type, activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                          {activity.location && (
                            <>
                              <span>•</span>
                              <span>{activity.location}</span>
                            </>
                          )}
                          {activity.ipAddress && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{activity.ipAddress}</span>
                            </>
                          )}
                        </div>
                        {activity.device && (
                          <p className="text-sm text-gray-500 mt-1">{activity.device}</p>
                        )}
                      </div>
                      <Badge
                        variant={
                          activity.status === 'success' ? 'success' :
                          activity.status === 'failed' ? 'error' :
                          'warning'
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.print()}>
          Export to PDF
        </Button>
        <Button variant="outline">
          Download CSV
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Security Notice</p>
              <p className="text-sm text-yellow-800 mt-1">
                If you notice any suspicious activity, please change your password immediately and contact support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
