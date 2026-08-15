/**
 * FR-USER-011 to FR-USER-018: Student Management
 * List and manage students with real API data, grid/table toggle, and stats
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { getPaginatedItems, getPaginatedTotal } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { StudentGridCard } from '@/features/students/student-grid-card';
import {
  GraduationCap, Plus, Search, Upload, Download,
  Eye, Pencil, UserCheck, UserX, TrendingUp,
  LayoutGrid, List, RefreshCw
} from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading, refetch, isRefetching } = useQuery({
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
          <Avatar className="h-10 w-10 ring-1 ring-[hsl(var(--primary)/0.2)]">
            <AvatarImage src={row.original.profilePicture} alt={row.original.fullName} />
            <AvatarFallback className="text-xs font-semibold text-white" style={{ background: 'var(--gradient-primary)' }}>
              {row.original.firstName?.[0]}{row.original.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{row.original.fullName || `${row.original.firstName} ${row.original.lastName}`}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'admissionNumber',
      header: 'Admission No.',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-2.5 py-1 rounded-md font-medium">
          {row.original.admissionNumber || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'class',
      header: 'Class & Section',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">Class {row.original.class || 'Unassigned'}</p>
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
        const status = row.original.status || 'ACTIVE';
        const variants: Record<string, string> = {
          ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          INACTIVE: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
          SUSPENDED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          GRADUATED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          TRANSFERRED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[status] || variants.ACTIVE}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Can permission={PERMISSIONS.STUDENTS_VIEW}>
            <button
              onClick={() => router.push(`/students/${row.original.id}`)}
              className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              title="View Profile"
            >
              <Eye className="h-4 w-4" />
            </button>
          </Can>
          <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
            <button
              onClick={() => router.push(`/students/${row.original.id}/edit`)}
              className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              title="Edit Profile"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </Can>
        </div>
      ),
    },
  ], [router]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-[hsl(var(--primary)/0.05)] to-transparent p-6 rounded-2xl border border-[hsl(var(--primary)/0.2)]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md" style={{ background: 'var(--gradient-primary)' }}>
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Student Management</h1>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] ml-13">
            Manage student directory, admissions, academic records, and enrollment status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-xs h-10 px-3 rounded-xl border-[hsl(var(--border))]"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-10 rounded-xl border-[hsl(var(--border))]"
              onClick={() => router.push('/students/bulk')}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Import
            </Button>
          </Can>
          <Can permission={PERMISSIONS.STUDENTS_CREATE}>
            <Button
              onClick={() => router.push('/students/create')}
              size="sm"
              className="text-xs h-10 px-4 rounded-xl text-white font-semibold shadow-md hover:opacity-95 transition-opacity"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Student
            </Button>
          </Can>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 stat-card stat-card-blue border border-[hsl(var(--border)/0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Total Enrolled</p>
              <p className="text-2xl font-black tabular-nums mt-1">{total || 0}</p>
            </div>
            <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: 'var(--gradient-primary)' }}>
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="card-premium p-5 stat-card stat-card-green border border-[hsl(var(--border)/0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Active Students</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
                {students.filter((s: any) => s.status === 'ACTIVE' || !s.status).length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: 'var(--gradient-success)' }}>
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="card-premium p-5 stat-card stat-card-purple border border-[hsl(var(--border)/0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Current Session</p>
              <p className="text-2xl font-black tabular-nums mt-1">2024-25</p>
            </div>
            <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: 'var(--gradient-accent)' }}>
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="card-premium p-5 stat-card stat-card-orange border border-[hsl(var(--border)/0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Inactive / Other</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums mt-1">
                {students.filter((s: any) => s.status && s.status !== 'ACTIVE').length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: 'var(--gradient-warm)' }}>
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="card-premium p-4 border border-[hsl(var(--border)/0.4)]">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Search by student name, admission no, or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm placeholder:text-[hsl(var(--muted-foreground)/0.6)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
            >
              <option value="all">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-[hsl(var(--secondary))] rounded-xl border border-[hsl(var(--border)/0.5)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${viewMode === 'grid' ? 'bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--primary))] font-bold' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${viewMode === 'table' ? 'bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--primary))] font-bold' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-premium p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="card-premium p-12 text-center space-y-3 border border-dashed border-[hsl(var(--border))]">
          <GraduationCap className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground)/0.5)]" />
          <h3 className="text-lg font-bold">No Students Found</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
            No student records match your current search terms or class filters. Try resetting search criteria or adding a new student.
          </p>
          <Button
            size="sm"
            onClick={() => { setSearchTerm(''); setClassFilter('all'); setStatusFilter('all'); }}
            variant="outline"
            className="text-xs mt-2"
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student: any) => (
            <StudentGridCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="card-premium overflow-hidden border border-[hsl(var(--border)/0.4)]">
          <DataTable
            columns={columns}
            data={students}
            searchKey="fullName"
            searchPlaceholder="Search students…"
          />
        </div>
      )}

      {/* Footer Bulk Actions Bar */}
      <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
        <div className="flex items-center justify-between p-4 card-premium border border-[hsl(var(--border)/0.4)] text-xs">
          <span className="text-[hsl(var(--muted-foreground))]">
            Showing <strong className="text-[hsl(var(--foreground))]">{students.length}</strong> of <strong className="text-[hsl(var(--foreground))]">{total}</strong> student records
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => router.push('/students/bulk')}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Bulk Import
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export Records
            </Button>
          </div>
        </div>
      </Can>
    </div>
  );
}
