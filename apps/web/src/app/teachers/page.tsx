/**
 * FR-USER-019 to FR-USER-026: Teacher Management
 * List and manage teachers
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTeachers } from '@/features/teachers/use-teachers';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { ColumnDef } from '@tanstack/react-table';

export default function TeachersPage() {
  const router = useRouter();
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useTeachers({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    specialization: departmentFilter !== 'all' ? departmentFilter : undefined,
  });

  const teachers = data?.data || [];
  const total = teachers.length;

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'fullName',
      header: 'Teacher',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.original.profilePicture} alt={row.original.fullName} />
            <AvatarFallback>
              {row.original.firstName?.[0]}{row.original.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'employeeId',
      header: 'Employee ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.employeeId || '-'}</span>
      ),
    },
    {
      accessorKey: 'specialization',
      header: 'Department',
      cell: ({ row }) => row.original.specialization || '-',
    },
    {
      accessorKey: 'subjects',
      header: 'Subjects',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.subjects?.slice(0, 2).map((subject: any, idx: number) => (
            <Badge key={idx} variant="info" className="text-xs">
              {subject.name || subject}
            </Badge>
          ))}
          {row.original.subjects?.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{row.original.subjects.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'ACTIVE' ? 'success' :
            row.original.status === 'INACTIVE' ? 'secondary' :
            row.original.status === 'ON_LEAVE' ? 'warning' : 'info'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Can permission={PERMISSIONS.TEACHERS_VIEW}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/teachers/${row.original.id}`)}
            >
              View
            </Button>
          </Can>
          <Can permission={PERMISSIONS.TEACHERS_UPDATE}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/teachers/${row.original.id}/edit`)}
            >
              Edit
            </Button>
          </Can>
        </div>
      ),
    },
  ], [router]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <DataTable
        columns={columns}
        data={teachers}
        searchKey="fullName"
        searchPlaceholder="Search by name, employee ID, or email..."
      />
    </div>
  );
}
