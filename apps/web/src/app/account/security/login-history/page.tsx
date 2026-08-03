/**
 * FR-AUTH-018: Login History
 * View detailed login history with filtering
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useLoginHistory } from '@/hooks/use-auth-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { LoginHistoryEntry } from '@/types/auth.types';

export default function LoginHistoryPage() {
  const router = useRouter();
  const { data: history, isLoading } = useLoginHistory();
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

  const filteredHistory = history?.filter((entry: LoginHistoryEntry) => {
    if (filterStatus === 'all') return true;
    return entry.success ? filterStatus === 'success' : filterStatus === 'failed';
  }) || [];

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Login History</h1>
            <p className="mt-2 text-sm text-gray-600">
              Review your account login activity
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/account/security')}
          >
            ← Back to Security
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {history?.length || 0}
                </p>
              </div>
              <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {history?.filter((e: LoginHistoryEntry) => e.success).length || 0}
                </p>
              </div>
              <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {history?.filter((e: LoginHistoryEntry) => !e.success).length || 0}
                </p>
              </div>
              <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <div className="flex space-x-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'success' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('success')}
          >
            Successful
          </Button>
          <Button
            variant={filterStatus === 'failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('failed')}
          >
            Failed
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((entry: LoginHistoryEntry) => (
          <Card key={entry.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Status Icon */}
                {getStatusIcon(entry.success)}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {entry.success ? 'Successful Login' : 'Failed Login Attempt'}
                    </h3>
                    <time className="text-sm text-gray-500">
                      {format(new Date(entry.timestamp), 'PPp')}
                    </time>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {/* Method */}
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span>Method: {entry.method}</span>
                    </div>

                    {/* Device & Browser */}
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{entry.browser} on {entry.os}</span>
                    </div>

                    {/* IP & Location */}
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{entry.location || 'Unknown'} • {entry.ipAddress}</span>
                    </div>

                    {/* Failure Reason */}
                    {!entry.success && entry.failureReason && (
                      <div className="flex items-start mt-2 p-3 bg-red-50 rounded-lg">
                        <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-2">
                          <p className="text-sm font-medium text-red-800">
                            Reason: {entry.failureReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Was This You? (for failed attempts) */}
                {!entry.success && (
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Handle "Yes, this was me" action
                        console.log('User confirmed:', entry.id);
                      }}
                    >
                      This was me
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        // Handle "No, secure my account" action
                        router.push('/account/security');
                      }}
                    >
                      Not me
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No login history</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus !== 'all'
                ? `No ${filterStatus} login attempts found.`
                : 'Your login history will appear here.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <svg className="h-6 w-6 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">Security Tip</h3>
            <p className="mt-2 text-sm text-blue-700">
              Review your login history regularly. If you see any suspicious activity or
              logins from unfamiliar locations, change your password immediately and
              enable two-factor authentication.
            </p>
            <div className="mt-4 flex space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/account/security/change-password')}
              >
                Change Password
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/account/security/2fa/setup')}
              >
                Enable 2FA
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
