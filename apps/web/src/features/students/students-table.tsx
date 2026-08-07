'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudents } from './use-students';
import type { StudentFilters } from '../../services/student.service';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { formatDate } from '../../lib/utils';

export function StudentsTable() {
  const router = useRouter();
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 50,
    search: '',
  });

  const { data, isLoading, isError, error } = useStudents(filters);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleViewStudent = (id: string) => {
    router.push(`/students/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading students...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-medium">Failed to load students</div>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'An error occurred while fetching students'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const students = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Students</h2>
          <p className="text-sm text-muted-foreground">
            Manage student information and records
          </p>
        </div>
        <Button onClick={() => router.push('/students/create')}>
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search students..."
          value={filters.search || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left text-sm font-medium">Admission No.</th>
              <th className="p-4 text-left text-sm font-medium">Name</th>
              <th className="p-4 text-left text-sm font-medium">Class</th>
              <th className="p-4 text-left text-sm font-medium">Gender</th>
              <th className="p-4 text-left text-sm font-medium">Status</th>
              <th className="p-4 text-left text-sm font-medium">Enrollment Date</th>
              <th className="p-4 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  {filters.search ? 'No students found matching your search' : 'No students found'}
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 text-sm">{student.admissionNumber}</td>
                  <td className="p-4 text-sm font-medium">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="p-4 text-sm">
                    {student.class
                      ? `${student.class.name} ${student.class.section}`
                      : '-'}
                  </td>
                  <td className="p-4 text-sm">{student.gender}</td>
                  <td className="p-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        student.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : student.status === 'INACTIVE'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{formatDate(student.enrollmentDate)}</td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewStudent(student.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(meta.page - 1) * meta.limit + 1} to{' '}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} students
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={!meta.hasPreviousPage}
            >
              Previous
            </Button>
            <div className="flex items-center px-4 text-sm">
              Page {meta.page} of {meta.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
