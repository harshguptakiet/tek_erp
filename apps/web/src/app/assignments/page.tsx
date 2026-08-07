/**
 * Module 10: Assignments Management
 * FR-ASSIGN-001 to FR-ASSIGN-010: Assignment listing and management
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
import { assignmentService } from '@/services/assignment.service';
import { useAuthStore } from '@/stores/auth.store';

export default function AssignmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Real API integration
  const { data: assignmentsResponse, isLoading } = useQuery({
    queryKey: ['assignments', user?.schoolId, statusFilter, subjectFilter],
    queryFn: () => assignmentService.listAssignments({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : assignmentsResponse?.assignments || [];


const stats = {
  total: assignments?.length || 0,
  active: assignments?.filter((a: any) => a.status === 'ACTIVE').length || 0,
  overdue: assignments?.filter((a: any) => a.status === 'OVERDUE').length || 0,
  completed: assignments?.filter((a: any) => a.status === 'COMPLETED').length || 0,
};

const filteredAssignments = assignments?.filter((assignment: any) => {
  const matchesSearch =
    searchQuery === '' ||
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
  const matchesSubject = subjectFilter === 'all' || assignment.subject === subjectFilter;
  return matchesSearch && matchesStatus && matchesSubject;
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
  ACTIVE: 'info',
  OVERDUE: 'error',
  COMPLETED: 'success',
  DRAFT: 'secondary',
} as const;

return (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage homework, projects, and assignments
          </p>
        </div>
        <Can permission={PERMISSIONS.ASSIGNMENTS_CREATE}>
          <Button onClick={() => router.push('/assignments/create')}>
            Create Assignment
          </Button>
        </Can>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Assignments</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.active}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.overdue}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Filters */}
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              type="search"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="OVERDUE">Overdue</option>
              <option value="COMPLETED">Completed</option>
              <option value="DRAFT">Draft</option>
            </Select>
          </div>
          <div>
            <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Biology">Biology</option>
              <option value="Physics">Physics</option>
              <option value="English">English</option>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Assignments Table */}
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Grading</TableHead>
            <TableHead>Avg. Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAssignments?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                No assignments found
              </TableCell>
            </TableRow>
          ) : (
            filteredAssignments?.map((assignment: any) => {
              const submissionRate = Math.round((assignment.submitted / assignment.totalStudents) * 100);
              const gradingRate = Math.round((assignment.graded / assignment.submitted) * 100);

              return (
                <TableRow key={assignment.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{assignment.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {assignment.subject}
                        </Badge>
                        <span className="text-xs text-gray-500">{assignment.teacher}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-gray-900">{assignment.class}</p>
                      <p className="text-gray-500">Sec {assignment.section}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-gray-900">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Submissions</span>
                        <span className="font-medium">{submissionRate}%</span>
                      </div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${submissionRate >= 75 ? 'bg-green-500' :
                              submissionRate >= 50 ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}
                          style={{ width: `${submissionRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {assignment.submitted}/{assignment.totalStudents} submitted
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Graded</span>
                        <span className="font-medium">{gradingRate}%</span>
                      </div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${gradingRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {assignment.graded}/{assignment.submitted} graded
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {assignment.averageScore}/{assignment.totalMarks}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round((assignment.averageScore / assignment.totalMarks) * 100)}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[assignment.status as keyof typeof statusColors]}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                      >
                        View
                      </Button>
                      <Can permission={PERMISSIONS.ASSIGNMENTS_GRADE}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/assignments/${assignment.id}/grade`)}
                        >
                          Grade
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>

    {/* Quick Stats Section */}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Submissions</h3>
          <p className="text-2xl font-bold text-red-600">
            {assignments?.reduce((sum: number, a: any) => sum + a.pending, 0) || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Across all assignments</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Grading</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {assignments?.reduce((sum: number, a: any) => sum + (a.submitted - a.graded), 0) || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Submissions awaiting grades</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Avg. Score</h3>
          <p className="text-2xl font-bold text-blue-600">
            {assignments?.length
              ? Math.round(
                assignments.reduce((sum: number, a: any) =>
                  sum + (a.averageScore / a.totalMarks * 100), 0
                ) / assignments.length
              )
              : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Average across all assignments</p>
        </CardContent>
      </Card>
    </div>
  </div>
);
}
