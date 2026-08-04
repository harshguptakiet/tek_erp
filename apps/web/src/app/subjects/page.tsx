/**
 * Module 04: Academic Management - Subjects List
 * FR-SUBJECT-001 to FR-SUBJECT-010: Subject catalog management
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { Loader2, BookOpen, Clock, FlaskConical } from 'lucide-react';

export default function SubjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['subjects', { page, limit, search: searchQuery, category: categoryFilter, schoolId: user?.schoolId }],
    queryFn: () => academicService.getSubjects({
      page,
      limit,
      search: searchQuery,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  const subjects = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your academic subject catalog
            </p>
          </div>
          <Can permission={PERMISSIONS.SUBJECTS_CREATE}>
            <Button onClick={() => router.push('/subjects/create')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Core Subjects</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {subjects.filter((s: any) => s.category === 'CORE').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Electives</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {subjects.filter((s: any) => s.category === 'ELECTIVE').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">With Lab</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {subjects.filter((s: any) => s.labRequired).length}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="search"
                placeholder="Search subjects by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="CORE">Core</option>
                <option value="ELECTIVE">Elective</option>
                <option value="OPTIONAL">Optional</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Weekly Hours</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="text-gray-500">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="mt-2">No subjects found</p>
                    <Can permission={PERMISSIONS.SUBJECTS_CREATE}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push('/subjects/create')}
                      >
                        Add First Subject
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject: any) => (
                <TableRow 
                  key={subject.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/subjects/${subject.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{subject.name}</p>
                        <p className="text-sm text-gray-500">{subject.description?.substring(0, 50)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-semibold text-gray-700">
                      {subject.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        subject.category === 'CORE' ? 'default' :
                        subject.category === 'ELECTIVE' ? 'success' :
                        'secondary'
                      }
                    >
                      {subject.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{subject.weeklyHours || 0}h</span>
                      {subject.practicalHours > 0 && (
                        <span className="text-gray-400">+ {subject.practicalHours}h practical</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {subject.labRequired ? (
                      <div className="flex items-center gap-1 text-purple-600">
                        <FlaskConical className="h-4 w-4" />
                        <span className="text-sm">Required</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not required</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Can permission={PERMISSIONS.SUBJECTS_VIEW}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/subjects/${subject.id}`);
                          }}
                        >
                          View
                        </Button>
                      </Can>
                      <Can permission={PERMISSIONS.SUBJECTS_UPDATE}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/subjects/${subject.id}/edit`);
                          }}
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
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} subjects
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

      {/* Quick Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.print()}>
          Export List
        </Button>
        <Can permission={PERMISSIONS.SUBJECTS_UPDATE}>
          <Button variant="outline">
            Bulk Edit
          </Button>
        </Can>
      </div>
    </div>
  );
}
