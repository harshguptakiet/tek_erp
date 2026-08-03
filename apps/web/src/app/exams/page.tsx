/**
 * Module 09: Assessment & Exams
 * FR-EXAM-001 to FR-EXAM-010: Exam Management
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

export default function ExamsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams', searchQuery, statusFilter],
    queryFn: async () => [
      {
        id: '1',
        name: 'Mid-Term Examination',
        type: 'MID_TERM',
        academicYear: '2024-2025',
        startDate: '2024-10-15',
        endDate: '2024-10-25',
        status: 'UPCOMING',
        classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
        totalSubjects: 8,
        totalStudents: 500,
      },
      {
        id: '2',
        name: 'Unit Test 1',
        type: 'UNIT_TEST',
        academicYear: '2024-2025',
        startDate: '2024-09-10',
        endDate: '2024-09-15',
        status: 'COMPLETED',
        classes: ['Class 9', 'Class 10'],
        totalSubjects: 6,
        totalStudents: 240,
      },
      {
        id: '3',
        name: 'Final Examination',
        type: 'FINAL',
        academicYear: '2024-2025',
        startDate: '2025-03-01',
        endDate: '2025-03-15',
        status: 'SCHEDULED',
        classes: ['Class 10', 'Class 12'],
        totalSubjects: 10,
        totalStudents: 300,
      },
    ],
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage exams, schedules, and assessments
            </p>
          </div>
          <Can permission={PERMISSIONS.EXAMS_MANAGE}>
            <Button onClick={() => router.push('/exams/create')}>
              Create Exam
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{exams?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {exams?.filter((e: any) => e.status === 'UPCOMING').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {exams?.filter((e: any) => e.status === 'IN_PROGRESS').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {exams?.filter((e: any) => e.status === 'COMPLETED').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                type="search"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams?.map((exam: any) => (
              <TableRow key={exam.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell>
                  <p className="font-medium text-gray-900">{exam.name}</p>
                  <p className="text-sm text-gray-500">{exam.academicYear}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="info">{exam.type.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{new Date(exam.startDate).toLocaleDateString()}</p>
                    <p className="text-gray-500">to</p>
                    <p>{new Date(exam.endDate).toLocaleDateString()}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {exam.classes.slice(0, 2).map((cls: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cls}
                      </Badge>
                    ))}
                    {exam.classes.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{exam.classes.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{exam.totalSubjects}</TableCell>
                <TableCell>{exam.totalStudents}</TableCell>
                <TableCell>
                  <Badge variant={
                    exam.status === 'UPCOMING' ? 'info' :
                    exam.status === 'IN_PROGRESS' ? 'warning' :
                    exam.status === 'COMPLETED' ? 'success' :
                    'secondary'
                  }>
                    {exam.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/exams/${exam.id}`)}
                    >
                      View
                    </Button>
                    <Can permission={PERMISSIONS.EXAMS_MANAGE}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/exams/${exam.id}/schedule`)}
                      >
                        Schedule
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
