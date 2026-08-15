/**
 * Login History Page
 * View all login attempts with filtering
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Calendar,
  Loader2,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

type LoginStatus = 'all' | 'success' | 'failed' | 'suspicious';
type DateFilter = 'all' | 'today' | 'week' | 'month';

interface LoginAttempt {
  id: string;
  success: boolean;
  timestamp: string;
  ipAddress: string;
  location?: string | { city?: string; region?: string; country?: string; countryCode?: string } | null;
  device: string;
  browser: string;
  os: string;
  isSuspicious: boolean;
  failureReason?: string;
}

export default function LoginHistoryPage() {
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<LoginStatus>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch login history
  const { data, isLoading } = useQuery({
    queryKey: ['login-history', statusFilter, dateFilter, page],
    queryFn: () =>
      authService.getLoginHistory({
        status: statusFilter === 'all' ? undefined : statusFilter,
        dateFilter: dateFilter === 'all' ? undefined : dateFilter,
        page,
        limit: pageSize,
      }),
    staleTime: 2 * 60 * 1000,
  });

  const loginAttempts: LoginAttempt[] = data?.attempts || [];
  const stats = data?.stats || {
    total: 0,
    successful: 0,
    failed: 0,
    suspicious: 0,
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const getDeviceIcon = (device: string) => {
    if (!device) return Monitor;
    if (device.includes('Mobile') || device.includes('Phone')) {
      return Smartphone;
    }
    if (device.includes('Tablet')) {
      return Tablet;
    }
    return Monitor;
  };

  const formatLocation = (location: LoginAttempt['location']): string => {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location || 'Unknown';
    const parts = [location.city, location.region, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    }
    if (isThisWeek(date)) {
      return format(date, 'EEEE \'at\' HH:mm');
    }
    if (isThisMonth(date)) {
      return format(date, 'MMM dd \'at\' HH:mm');
    }
    return format(date, 'MMM dd, yyyy \'at\' HH:mm');
  };

  const filterLoginsByDate = (attempts: LoginAttempt[]) => {
    if (dateFilter === 'all') return attempts;

    return attempts.filter((attempt) => {
      const date = new Date(attempt.timestamp);
      switch (dateFilter) {
        case 'today':
          return isToday(date);
        case 'week':
          return isThisWeek(date);
        case 'month':
          return isThisMonth(date);
        default:
          return true;
      }
    });
  };

  const filteredAttempts = filterLoginsByDate(loginAttempts);

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/settings/security"
        className="inline-flex items-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Security Settings
      </Link>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Logins</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{stats.total}</p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10">
                <History className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Successful</p>
                <p className="text-2xl font-bold mt-1 tabular-nums text-green-600 dark:text-green-400">
                  {stats.successful}
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Failed</p>
                <p className="text-2xl font-bold mt-1 tabular-nums text-red-600 dark:text-red-400">
                  {stats.failed}
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Suspicious</p>
                <p className="text-2xl font-bold mt-1 tabular-nums text-amber-600 dark:text-amber-400">
                  {stats.suspicious}
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login History Table */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Login History
              </CardTitle>
              <CardDescription>View all login attempts to your account</CardDescription>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LoginStatus)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="suspicious">Suspicious</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No login attempts found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttempts.map((attempt) => {
                      const DeviceIcon = getDeviceIcon(attempt.device);
                      return (
                        <TableRow key={attempt.id}>
                          <TableCell>
                            {attempt.isSuspicious ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Suspicious
                              </Badge>
                            ) : attempt.success ? (
                              <Badge variant="success" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{formatDate(attempt.timestamp)}</span>
                              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                {format(new Date(attempt.timestamp), 'PPP')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DeviceIcon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{attempt.browser}</span>
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                  {attempt.os}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                              <span className="text-sm">
                                {formatLocation(attempt.location)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-[hsl(var(--muted))] px-2 py-1 rounded">
                              {attempt.ipAddress}
                            </code>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, data?.total || 0)} of {data?.total || 0} entries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
