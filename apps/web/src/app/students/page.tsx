/**
 * FR-USER-011 to FR-USER-018: Student Management
 * List and manage students with real API data
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { getPaginatedItems, getPaginatedTotal } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  GraduationCap, Plus, Search, Filter, Download, Upload,
  Eye, Pencil, MoreHorizontal, UserCheck, UserX, TrendingUp,
} from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['students', { page, limit, class: classFilter, status: statusFilter, search: searchTerm }],
    queryFn: () => userService.searchUsers(searchTerm, {
      role: 'STUDENT',
      class: classFilter !== 'all' ? classFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit,
    }),
  });

  const students = getPaginatedItems(data);
  const total = getPaginatedTotal(data);

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'fullName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.original.profilePicture} alt={row.original.fullName} />
            <AvatarFallback className="text-xs font-semibold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
              {row.original.firstName?.[0]}{row.original.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{row.original.fullName || `${row.original.firstName} ${row.original.lastName}`}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'admissionNumber',
      header: 'Admission No.',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-[hsl(var(--secondary))] px-2 py-1 rounded-md">
          {row.original.admissionNumber || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'class',
      header: 'Class & Section',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">Class {row.original.class || '—'}</p>
          {row.original.section && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Section {row.original.section}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{row.original.phone || '—'}</p>
          {row.original.parentPhone && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Parent: {row.original.parentPhone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, string> = {
          ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
          SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          GRADUATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          TRANSFERRED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[status] || variants.ACTIVE}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Can permission={PERMISSIONS.STUDENTS_VIEW}>
            <button
              onClick={() => router.push(`/students/${row.original.id}`)}
              className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
          </Can>
          <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
            <button
              onClick={() => router.push(`/students/${row.original.id}/edit`)}
              className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </Can>
        </div>
      ),
    },
  ], [router]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-description">Manage student profiles and records</p>
        </div>
        <div className="flex items-center gap-3">
          <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => router.push('/students/bulk')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </Can>
          <Can permission={PERMISSIONS.STUDENTS_CREATE}>
            <Button
              onClick={() => router.push('/students/create')}
              className="text-sm text-white"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 stat-card stat-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Students</p>
              <p className="text-2xl font-bold tabular-nums mt-1">{total || 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card-premium p-5 stat-card stat-card-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Active</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
                {students.filter((s: any) => s.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-success)' }}>
              <UserCheck className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card-premium p-5 stat-card stat-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">New This Month</p>
              <p className="text-2xl font-bold tabular-nums mt-1">0</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card-premium p-5 stat-card stat-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Inactive</p>
              <p className="text-2xl font-bold tabular-nums mt-1">
                {students.filter((s: any) => s.status === 'INACTIVE').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-warm)' }}>
              <UserX className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Search by name, admission number, or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="all">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="card-premium p-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full animate-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded animate-shimmer" />
                  <div className="h-3 w-1/4 rounded animate-shimmer" />
                </div>
                <div className="h-6 w-16 rounded-full animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <DataTable
            columns={columns}
            data={students}
            searchKey="fullName"
            searchPlaceholder="Search students…"
          />
        </div>
      )}

      {/* Bulk Actions */}
      <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="text-sm" onClick={() => router.push('/students/bulk')}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button variant="outline" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
        </div>
      </Can>
    </div>
  );
}
