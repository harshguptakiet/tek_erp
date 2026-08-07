/**
 * FR-USER-019 to FR-USER-026: Teacher Management
 * List and manage teachers
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { getPaginatedItems, getPaginatedTotal } from '@/types';
import Image from 'next/image';

export default function TeachersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', { page, limit, search: searchQuery, department: departmentFilter, status: statusFilter }],
    queryFn: () => userService.searchUsers(searchQuery, {
      role: 'TEACHER',
      department: departmentFilter !== 'all' ? departmentFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit,
    }),
  });

  const teachers = getPaginatedItems(data);
  const total = getPaginatedTotal(data);
  const totalPages = Math.ceil(total / limit);

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
            <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage teacher profiles and assignments
            </p>
          </div>
          <Can permission={PERMISSIONS.TEACHERS_CREATE}>
            <Button onClick={() => router.push('/teachers/create')}>
              Add Teacher
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {teachers.filter((t: any) => t.status === 'ACTIVE').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg Experience</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">8 yrs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="search"
                placeholder="Search by name, employee ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                <option value="all">All Departments</option>
                <option value="MATHEMATICS">Mathematics</option>
                <option value="SCIENCE">Science</option>
                <option value="ENGLISH">English</option>
                <option value="SOCIAL_STUDIES">Social Studies</option>
                <option value="LANGUAGES">Languages</option>
                <option value="ARTS">Arts</option>
                <option value="PHYSICAL_EDUCATION">Physical Education</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-2">No teachers found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher: any) => (
                <TableRow key={teacher.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {teacher.profilePicture ? (
                          <Image
                            src={teacher.profilePicture}
                            alt={teacher.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-sm font-bold">
                            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{teacher.fullName}</p>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{teacher.employeeId || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{teacher.department || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.slice(0, 2).map((subject: string, idx: number) => (
                        <Badge key={idx} variant="info" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {teacher.subjects?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{teacher.subjects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        teacher.status === 'ACTIVE' ? 'success' :
                        teacher.status === 'INACTIVE' ? 'secondary' :
                        teacher.status === 'ON_LEAVE' ? 'warning' : 'info'
                      }
                    >
                      {teacher.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Can permission={PERMISSIONS.TEACHERS_VIEW}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/teachers/${teacher.id}`)}
                        >
                          View
                        </Button>
                      </Can>
                      <Can permission={PERMISSIONS.TEACHERS_UPDATE}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/teachers/${teacher.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} teachers
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
