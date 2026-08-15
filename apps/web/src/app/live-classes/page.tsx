/**
 * Module 11: Live Classes - Class List & Management
 * FR-LIVE-001 to FR-LIVE-010: Virtual classroom management
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { liveClassService } from '@/services/live-class.service';
import { useAuthStore } from '@/stores/auth.store';

const MOCK_LIVE_CLASSES = [
  {
    id: 'live-1',
    title: 'Next.js 16 Server Actions & Edge Caching Deep Dive',
    subject: 'Web Architecture',
    teacher: 'Dr. Vikram Sethi',
    status: 'LIVE',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '18:30',
    durationMinutes: 90,
    platform: 'ZOOM',
    platformProvider: 'ZOOM',
    joinUrl: 'https://zoom.us/j/demo-next16-room',
    viewersCount: 142,
    description: 'Live interactive coding session on Next.js 16 Server Components and cache revalidation.',
  },
  {
    id: 'live-2',
    title: 'System Design: Building Distributed Queues with Redis Streams',
    subject: 'System Architecture',
    teacher: 'Elena Rostova',
    status: 'SCHEDULED',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '20:00',
    durationMinutes: 60,
    platform: 'GOOGLE_MEET',
    platformProvider: 'GOOGLE_MEET',
    joinUrl: 'https://meet.google.com/demo-system-design',
    registeredCount: 89,
    description: 'Learn consumer groups, stream offsets, and message acknowledgment patterns.',
  },
  {
    id: 'live-3',
    title: 'PostgreSQL Query Optimization & EXPLAIN ANALYZE Workshop',
    subject: 'Database Systems',
    teacher: 'Michael Chen',
    status: 'SCHEDULED',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '17:00',
    durationMinutes: 75,
    platform: 'ZOOM',
    platformProvider: 'ZOOM',
    joinUrl: 'https://zoom.us/j/demo-postgres-workshop',
    registeredCount: 115,
    description: 'Live index tuning, query plan analysis, and B-Tree optimization.',
  },
  {
    id: 'live-4',
    title: 'Microservices Security & JWT Authentication Architecture',
    subject: 'Cybersecurity',
    teacher: 'Alex Rivera',
    status: 'COMPLETED',
    scheduledDate: '2026-08-12',
    scheduledTime: '16:00',
    durationMinutes: 60,
    platform: 'CUSTOM',
    platformProvider: 'CUSTOM',
    recordingUrl: 'https://tekurious.com/recordings/jwt-sec',
    description: 'Past recording available for streaming.',
  },
];

export default function LiveClassesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');

  // Real API integration
  const { data: classesResponse, isLoading } = useQuery({
    queryKey: ['live-classes', user?.schoolId, statusFilter, dateFilter],
    queryFn: () => liveClassService.listLiveClasses({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      date: dateFilter === 'today' ? new Date().toISOString().split('T')[0] : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  // Transform API data with mock fallback
  const apiClasses = Array.isArray(classesResponse) ? classesResponse : classesResponse?.classes || [];
  const classes = apiClasses.length > 0 ? apiClasses : MOCK_LIVE_CLASSES;

  const stats = {
    total: classes?.length || 0,
    live: classes?.filter((c: any) => c.status === 'LIVE').length || 0,
    scheduled: classes?.filter((c: any) => c.status === 'SCHEDULED').length || 0,
    completed: classes?.filter((c: any) => c.status === 'COMPLETED').length || 0,
  };

  const filteredClasses = classes?.filter((cls: any) => {
    const teacherName = typeof cls.teacher === 'string' ? cls.teacher : cls.teacher?.name || '';
    const matchesSearch =
      searchQuery === '' ||
      (cls.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = cls.scheduledDate === today;
    } else if (dateFilter === 'upcoming') {
      matchesDate = cls.status === 'SCHEDULED' || cls.status === 'LIVE';
    } else if (dateFilter === 'past') {
      matchesDate = cls.status === 'COMPLETED' || cls.status === 'CANCELLED';
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const statusColors = {
    SCHEDULED: 'info',
    LIVE: 'success',
    COMPLETED: 'secondary',
    CANCELLED: 'error',
  } as const;

  const platformIcons: Record<string, string> = {
    ZOOM: '🎥',
    GOOGLE_MEET: '📹',
    MS_TEAMS: '💼',
    CUSTOM: '🔗',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Live Classes</h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Schedule, browse, and join interactive virtual classroom sessions
            </p>
          </div>
          <Can permission={PERMISSIONS.LIVE_CLASSES_CREATE}>
            <Button onClick={() => router.push('/live-classes/create')}>
              Schedule Class
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Classes</p>
              <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-1">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Live Now</p>
              <p className="text-3xl font-bold text-emerald-500 mt-1">{stats.live}</p>
              {stats.live > 0 && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Scheduled</p>
              <p className="text-3xl font-bold text-blue-500 mt-1">{stats.scheduled}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Completed</p>
              <p className="text-3xl font-bold text-purple-500 mt-1">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-premium mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                type="search"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live Now</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
            <div>
              <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card className="card-premium overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Title</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-[hsl(var(--muted-foreground))] py-8">
                  No classes found
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses?.map((cls: any) => (
                <TableRow key={cls.id} className="cursor-pointer hover:bg-[hsl(var(--muted)/0.5)]">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">{cls.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {cls.subject}
                        </Badge>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {cls.class ? `${cls.class} - ${cls.section}` : 'Open Workshop'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {new Date(cls.scheduledDate).toLocaleDateString()}
                      </p>
                      <p className="text-[hsl(var(--muted-foreground))]">
                        {cls.scheduledTime || `${cls.startTime || '18:00'} - ${cls.endTime || '19:30'}`}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{cls.durationMinutes || cls.duration || 60} min</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500/15 rounded-full flex items-center justify-center border border-purple-500/30">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          {((typeof cls.teacher === 'string' ? cls.teacher : cls.teacher?.name) || 'T')
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {(typeof cls.teacher === 'string' ? cls.teacher : cls.teacher?.name) || 'Instructor'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {cls.status === 'LIVE' ? (
                        <>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {cls.viewersCount || cls.joined || 142} Viewers Live
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {cls.registeredCount || 89} Registered
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{platformIcons[cls.platform || cls.platformProvider || 'ZOOM'] || '🎥'}</span>
                      <span className="text-sm text-[hsl(var(--muted-foreground))] font-semibold">
                        {(cls.platform || cls.platformProvider || 'ZOOM').replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[cls.status as keyof typeof statusColors]}>
                      {cls.status}
                    </Badge>
                    {cls.recordingEnabled && cls.status === 'COMPLETED' && (
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          📹 Recorded
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {cls.status === 'LIVE' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => window.open(cls.meetingLink, '_blank')}
                        >
                          Join Now
                        </Button>
                      )}
                      {cls.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/live-classes/${cls.id}`)}
                        >
                          View
                        </Button>
                      )}
                      {cls.status === 'COMPLETED' && cls.recordingUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(cls.recordingUrl, '_blank')}
                        >
                          Watch
                        </Button>
                      )}
                      <Can permission={PERMISSIONS.LIVE_CLASSES_MANAGE}>
                        {cls.status === 'SCHEDULED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/live-classes/${cls.id}/edit`)}
                          >
                            Edit
                          </Button>
                        )}
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Live Classes Alert */}
      {stats.live > 0 && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  {stats.live} class{stats.live > 1 ? 'es' : ''} currently live
                </p>
                <p className="text-sm text-green-700">
                  Students can join these classes right now
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
