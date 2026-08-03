/**
 * FR-USER-008: View Activity Log
 * Display user activity with filters and export
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserActivity } from '@/hooks/use-user-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

type ActivityType = 'all' | 'auth' | 'profile' | 'content' | 'payment' | 'system';

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'all', label: 'All Activities' },
  { value: 'auth', label: 'Authentication' },
  { value: 'profile', label: 'Profile Changes' },
  { value: 'content', label: 'Content Activity' },
  { value: 'payment', label: 'Payments' },
  { value: 'system', label: 'System Events' },
];

export default function ActivityLogPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const [dateRange, setDateRange] = useState('30'); // days
  
  const { data: activities, isLoading } = useUserActivity();

  const filteredActivities = activities?.filter((activity: any) => {
    if (filterType === 'all') return true;
    return activity.type === filterType;
  }) || [];

  const handleExport = (exportFormat: 'csv' | 'pdf') => {
    // Export functionality
    const data = filteredActivities.map((a: any) => ({
      date: format(new Date(a.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      type: a.type,
      action: a.action,
      details: a.details,
      ipAddress: a.ipAddress,
      device: a.device,
    }));

    if (exportFormat === 'csv') {
      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map((row: any) => Object.values(row).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'auth':
        return <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
      case 'profile':
        return <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'content':
        return <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'payment':
        return <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
      default:
        return <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track all activities on your account
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/profile')}>
            ← Back to Profile
          </Button>
        </div>
      </div>

      {/* Filters and Export */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="w-full sm:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type
                </label>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ActivityType)}
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="w-full sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No activity found for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity: any) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <Badge variant="secondary">{activity.type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{activity.action}</TableCell>
                  <TableCell className="text-sm text-gray-600">{activity.details}</TableCell>
                  <TableCell className="text-sm text-gray-600">{activity.device}</TableCell>
                  <TableCell className="text-sm text-gray-600">{activity.ipAddress}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(activity.timestamp), 'PPp')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              Activity logs are retained for 90 days. Export your data if you need longer retention.
              Suspicious activities are automatically flagged for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
