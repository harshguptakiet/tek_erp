/**
 * FR-AUTH-015: Multi-Device Session Management
 * View and manage active sessions across all devices
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, Monitor, Smartphone, Tablet, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Session {
  id: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
  };
  ipAddress: string;
  location?: {
    city?: string;
    country?: string;
  };
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [revoking, setRevoking] = useState<string | null>(null);

  // Fetch sessions
  const { data, isLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await authService.getSessions();
      return response.sessions || [];
    },
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session terminated successfully');
      setRevoking(null);
    },
    onError: (error: any) => {
      toast.error('Failed to terminate session', {
        description: error?.message || 'Please try again',
      });
      setRevoking(null);
    },
  });

  // Logout all devices mutation
  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      // This requires password confirmation in production
      return authService.logoutAllDevices(''); // Empty password for now
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Logged out from all other devices');
    },
    onError: (error: any) => {
      toast.error('Failed to logout from all devices', {
        description: error?.message || 'Please try again',
      });
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    setRevoking(sessionId);
    revokeSessionMutation.mutate(sessionId);
  };

  const handleLogoutAll = () => {
    if (confirm('Are you sure you want to logout from all other devices?')) {
      logoutAllMutation.mutate();
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load sessions. Please try again.</p>
        </div>
      </div>
    );
  }

  const sessions: Session[] = data || [];
  const activeSessions = sessions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Manage your active sessions across all devices. Maximum 10 concurrent sessions allowed.
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-[hsl(var(--card))]">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Active Sessions</p>
          <p className="text-2xl font-bold">{activeSessions} / 10</p>
        </div>
        {activeSessions > 1 && (
          <Button
            onClick={handleLogoutAll}
            disabled={logoutAllMutation.isPending}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {logoutAllMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Logging out...
              </>
            ) : (
              'Logout all other devices'
            )}
          </Button>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`rounded-lg border p-4 transition-colors ${
              session.isCurrent
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                : 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--secondary))]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                {/* Device Icon */}
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    session.isCurrent
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]'
                  }`}
                >
                  {getDeviceIcon(session.deviceInfo.deviceType)}
                </div>

                {/* Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {session.deviceInfo.browser} on {session.deviceInfo.os}
                    </h3>
                    {session.isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium">
                        Current Session
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                    {/* Location */}
                    {session.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {session.location.city}, {session.location.country}
                        </span>
                        <span className="text-xs">• {session.ipAddress}</span>
                      </div>
                    )}

                    {/* Login Time */}
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Logged in {formatDate(session.loginTime)}</span>
                    </div>

                    {/* Last Activity */}
                    <div className="text-xs">
                      Last active: {getTimeAgo(session.lastActivity)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!session.isCurrent && (
                <Button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revoking === session.id}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {revoking === session.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Revoking...
                    </>
                  ) : (
                    'Revoke'
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Security Note</p>
            <p className="text-blue-700 dark:text-blue-300">
              If you see a session you don't recognize, revoke it immediately and change your
              password. You can have a maximum of 10 active sessions. The oldest session will be
              automatically logged out when you exceed this limit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
