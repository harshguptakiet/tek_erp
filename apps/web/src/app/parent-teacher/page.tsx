/**
 * Module 02: User Management - Parent-Teacher Meetings
 * FR-PTM-001: Schedule and manage parent-teacher meetings
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

export default function ParentTeacherPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Real API integration
  const { data: ptmResponse, isLoading } = useQuery({
    queryKey: ['ptm', user?.schoolId, selectedAcademicYear],
    queryFn: () =>
      academicService.listPTMs(
        user?.schoolId || '',
        selectedAcademicYear || undefined
      ),
    enabled: !!user?.schoolId,
  });

  const { data: academicYearsResponse } = useQuery({
    queryKey: ['academic-years', user?.schoolId],
    queryFn: () => academicService.listAcademicYears(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const meetings = Array.isArray(ptmResponse) ? ptmResponse : ptmResponse?.data || [];
  const academicYears = Array.isArray(academicYearsResponse)
    ? academicYearsResponse
    : academicYearsResponse?.data || [];

  const filteredMeetings = meetings.filter((meeting: any) => {
    const matchesSearch = meeting.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || meeting.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const upcomingCount = meetings.filter(
    (m: any) => new Date(m.scheduledDate) > new Date()
  ).length;
  const completedCount = meetings.filter((m: any) => m.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parent-Teacher Meetings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Schedule and manage parent-teacher conferences
            </p>
          </div>
          <Can permission={PERMISSIONS.PTM_MANAGE}>
            <Button onClick={() => router.push('/parent-teacher/create')}>
              + Schedule Meeting
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Meetings</p>
            <p className="text-3xl font-bold text-gray-900">{meetings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Upcoming</p>
            <p className="text-3xl font-bold text-blue-600">{upcomingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-3xl font-bold text-purple-600">
              {meetings.filter((m: any) => {
                const date = new Date(m.scheduledDate);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
            >
              <option value="">All Academic Years</option>
              {academicYears.map((year: any) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Meetings ({filteredMeetings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading meetings...</p>
            </div>
          ) : filteredMeetings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.map((meeting: any) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell>
                      {new Date(meeting.scheduledDate).toLocaleDateString()}
                      <br />
                      <span className="text-sm text-gray-600">
                        {meeting.timeFrom} - {meeting.timeTo}
                      </span>
                    </TableCell>
                    <TableCell>
                      {meeting.duration ? `${meeting.duration} min` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{meeting.attendedCount || 0} attended</div>
                        <div className="text-gray-500">
                          of {meeting.totalParticipants || 0} invited
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          meeting.status === 'completed'
                            ? 'success'
                            : meeting.status === 'ongoing'
                            ? 'info'
                            : meeting.status === 'cancelled'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {meeting.status || 'scheduled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/parent-teacher/${meeting.id}`)}
                        >
                          View
                        </Button>
                        <Can permission={PERMISSIONS.PTM_MANAGE}>
                          {meeting.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/parent-teacher/${meeting.id}/attendance`)}
                            >
                              Mark Attendance
                            </Button>
                          )}
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">👥</span>
              <p className="text-gray-600">No meetings found</p>
              <Can permission={PERMISSIONS.PTM_MANAGE}>
                <Button className="mt-4" onClick={() => router.push('/parent-teacher/create')}>
                  Schedule First Meeting
                </Button>
              </Can>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
