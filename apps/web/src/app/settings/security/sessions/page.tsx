/**
 * FR-AUTH-015: Multi-Device Session Management
 * View and manage active sessions across all devices
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, Monitor, Smartphone, Tablet, MapPin, Clock, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Session {
  id: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
  };
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: {
    city?: string;
    country?: string;
  };
  loginTime?: string;
  createdAt?: string;
  lastActivity?: string;
  lastActivityAt?: string;
  isCurrent?: boolean;
}

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch sessions
  const { data, isLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        const response = await authService.getSessions();
        // Handle both array response and object with sessions property
        if (Array.isArray(response)) {
          return response;
        }
        return response.sessions || [];
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        return [];
      }
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

  // Logout all devices mutation - requires password re-authentication (FR-AUTH-028)
  const logoutAllMutation = useMutation({
    mutationFn: async (password: string) => {
      return authService.logoutAllDevices(password);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success(data?.message || 'Logged out from all other devices');
      setShowLogoutAllDialog(false);
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error('Failed to logout from all devices', {
        description: error?.response?.data?.message || error?.message || 'Please check your password and try again',
      });
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    setRevoking(sessionId);
    revokeSessionMutation.mutate(sessionId);
  };

  const handleLogoutAll = () => {
    setShowLogoutAllDialog(true);
  };

  const handleConfirmLogoutAll = () => {
    if (!confirmPassword) {
      toast.error('Please enter your password to confirm');
      return;
    }
    logoutAllMutation.mutate(confirmPassword);
  };

  const getDeviceIcon = (session: Session) => {
    const deviceType = session.deviceInfo?.deviceType || session.deviceType || 'desktop';
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

  const sessions: Session[] = Array.isArray(data) ? data : [];
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
                  {getDeviceIcon(session)}
                </div>

                {/* Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {session.deviceInfo?.browser || session.browser || 'Unknown Browser'} on {session.deviceInfo?.os || session.os || 'Unknown OS'}
                    </h3>
                    {session.isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium">
                        Current Session
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                    {/* Location */}
                    {session.location && (session.location.city || session.location.country) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {[session.location.city, session.location.country].filter(Boolean).join(', ')}
                        </span>
                        {session.ipAddress && <span className="text-xs">• {session.ipAddress}</span>}
                      </div>
                    )}

                    {/* Login Time */}
                    {(session.loginTime || session.createdAt) && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Logged in {formatDate(session.loginTime || session.createdAt!)}</span>
                      </div>
                    )}

                    {/* Last Activity */}
                    {(session.lastActivity || session.lastActivityAt) && (
                      <div className="text-xs">
                        Last active: {getTimeAgo(session.lastActivity || session.lastActivityAt!)}
                      </div>
                    )}
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

      {/* Logout All Devices Confirmation Dialog */}
      <Dialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout all other devices?</DialogTitle>
            <DialogDescription>
              For your security, please confirm your password. This session will stay logged in;
              all other devices will be signed out.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              <input
                type="password"
                autoFocus
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmLogoutAll();
                }}
                placeholder="Enter your password"
                className="w-full h-11 pl-11 pr-4 rounded-xl border text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLogoutAllDialog(false);
                setConfirmPassword('');
              }}
              disabled={logoutAllMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLogoutAll}
              disabled={logoutAllMutation.isPending || !confirmPassword}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {logoutAllMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Logging out...
                </>
              ) : (
                'Confirm Logout All'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
