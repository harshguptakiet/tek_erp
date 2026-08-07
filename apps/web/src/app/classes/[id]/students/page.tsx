/**
 * Module 04: Academic Management - Class Student Roster
 * FR-CLASS-006: View and manage students in a class
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { studentService } from '@/services/student.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import { Loader2, UserPlus, UserMinus, Download, Upload, Mail, Phone, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function ClassStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const classId = params.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Fetch class details
  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => academicService.getClass(classId),
    enabled: !!classId,
  });

  // Fetch students in class
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students', classId, { search: searchQuery, status: statusFilter }],
    queryFn: () => academicService.getClassStudents(classId, {
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
    enabled: !!classId,
  });

  // Remove student from class
  const removeStudentMutation = useMutation({
    mutationFn: ({ studentId }: { studentId: string }) =>
      academicService.removeStudentFromClass(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', classId] });
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      toast.success('Student removed from class');
      setSelectedStudents([]);
    },
    onError: () => {
      toast.error('Failed to remove student');
    },
  });

  // Bulk remove students
  const bulkRemoveMutation = useMutation({
    mutationFn: (studentIds: string[]) =>
      Promise.all(studentIds.map(id => academicService.removeStudentFromClass(classId, id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', classId] });
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      toast.success(`${selectedStudents.length} students removed from class`);
      setSelectedStudents([]);
    },
    onError: () => {
      toast.error('Failed to remove students');
    },
  });

  const students = studentsData?.items || [];
  const classInfo = classData;

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s: any) => s.id));
    }
  };

  if (classLoading || studentsLoading) {
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
        <Button variant="ghost" size="sm" onClick={() => router.push(`/classes/${classId}`)}>
          ← Back to Class
        </Button>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {classInfo?.name} - Student Roster
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage students enrolled in this class
            </p>
          </div>
          <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
            <Button onClick={() => router.push(`/classes/${classId}/students/add`)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Students
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Boys</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {students.filter((s: any) => s.gender === 'MALE').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Girls</p>
              <p className="text-3xl font-bold text-pink-600 mt-1">
                {students.filter((s: any) => s.gender === 'FEMALE').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-3xl font-bold text-green-600 mt-1">92%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search students by name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
            {selectedStudents.length > 0 && (
              <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
                <Button
                  variant="outline"
                  onClick={() => bulkRemoveMutation.mutate(selectedStudents)}
                  disabled={bulkRemoveMutation.isPending}
                  className="text-red-600 border-red-300"
                >
                  {bulkRemoveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove {selectedStudents.length}
                    </>
                  )}
                </Button>
              </Can>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead>Admission No.</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-gray-500">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="mt-2">No students found</p>
                    <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push(`/classes/${classId}/students/add`)}
                      >
                        Add Students
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student: any) => (
                <TableRow key={student.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {student.profilePicture ? (
                          <Image
                            src={student.profilePicture}
                            alt={student.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-sm font-bold">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.fullName}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-semibold">
                      {student.rollNumber || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{student.admissionNumber || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {student.dateOfBirth
                        ? new Date(student.dateOfBirth).toLocaleDateString()
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {student.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{student.email}</span>
                        </div>
                      )}
                      {student.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={student.status === 'ACTIVE' ? 'success' : 'secondary'}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Can permission={PERMISSIONS.STUDENTS_VIEW}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/students/${student.id}`)}
                        >
                          View
                        </Button>
                      </Can>
                      <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStudentMutation.mutate({ studentId: student.id })}
                          disabled={removeStudentMutation.isPending}
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Bulk Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Export List
        </Button>
        <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Students
          </Button>
        </Can>
      </div>
    </div>
  );
}
