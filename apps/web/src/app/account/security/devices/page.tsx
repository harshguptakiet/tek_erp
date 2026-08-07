/**
 * FR-AUTH-033: Multi-Device Session Management
 * View and manage active devices/sessions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useSessions } from '@/hooks/use-auth-queries';
import { useRevokeSession, useLogoutAllDevices } from '@/hooks/use-auth-mutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { DeviceSession } from '@/types/auth.types';

export default function DeviceManagementPage() {
  const router = useRouter();
  const { data: sessionsData, isLoading } = useSessions();
  const revokeMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAllDevices();
  
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);

  const sessions = sessionsData?.sessions || [];
  const currentSessionId = sessionsData?.currentSessionId;

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'tablet':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default: // desktop
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeMutation.mutateAsync(sessionId);
      toast.success('Device logged out successfully');
      setSessionToRevoke(null);
    } catch (error) {
      toast.error('Failed to logout device');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllMutation.mutateAsync({});
      toast.success('All devices logged out successfully');
      setShowLogoutAllDialog(false);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (error) {
      toast.error('Failed to logout all devices');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Devices</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage devices where you're currently logged in
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

      {/* Session Limit Warning */}
      {sessions.length >= 8 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Approaching Session Limit
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                You have {sessions.length} of 10 allowed active sessions. Consider logging out
                unused devices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Sessions</CardDescription>
            <CardTitle className="text-3xl">{sessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Session Limit</CardDescription>
            <CardTitle className="text-3xl">10</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available Slots</CardDescription>
            <CardTitle className="text-3xl">{10 - sessions.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Logout All Button */}
      {sessions.length > 1 && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowLogoutAllDialog(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout All Other Devices
          </Button>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session: DeviceSession) => {
          const isCurrent = session.id === currentSessionId;
          
          return (
            <Card key={session.id} className={isCurrent ? 'border-2 border-indigo-500' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Device Icon */}
                    <div className={`flex-shrink-0 p-3 rounded-lg ${
                      isCurrent ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getDeviceIcon(session.deviceType || 'desktop')}
                    </div>

                    {/* Session Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.deviceName || 'Unknown Device'}
                        </h3>
                        {isCurrent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        {/* Browser & OS */}
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <span>{session.browser} on {session.os}</span>
                        </div>

                        {/* Location */}
                        {(session.location || session.ipAddress) && (
                          <div className="flex items-center">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>
                              {session.location || 'Unknown location'} • {session.ipAddress}
                            </span>
                          </div>
                        )}

                        {/* Last Activity */}
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            Last active: {format(new Date(session.lastActivity ?? session.lastActive), 'PPp')}
                          </span>
                        </div>

                        {/* Login Date */}
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            Logged in: {format(new Date(session.createdAt), 'PPp')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSessionToRevoke(session.id)}
                      disabled={revokeMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any active sessions on other devices.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Revoke Session Dialog */}
      <Dialog open={!!sessionToRevoke} onOpenChange={(open) => !open && setSessionToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout Device?</DialogTitle>
            <DialogDescription>
              This device will be logged out immediately. You'll need to log in again to
              use this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSessionToRevoke(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => sessionToRevoke && handleRevokeSession(sessionToRevoke)}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? 'Logging out...' : 'Logout Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout All Dialog */}
      <Dialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout All Devices?</DialogTitle>
            <DialogDescription>
              This will log you out from all devices except this one. This action cannot
              be undone. You'll need to log in again on each device.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  This will log out {sessions.length - 1} other{' '}
                  {sessions.length - 1 === 1 ? 'device' : 'devices'}.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutAllDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogoutAll}
              disabled={logoutAllMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {logoutAllMutation.isPending ? 'Logging out...' : 'Logout All Devices'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
