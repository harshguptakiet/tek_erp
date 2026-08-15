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
import { examService } from '@/services/exam.service';
import { useAuthStore } from '@/stores/auth.store';

const MOCK_EXAMS = [
  {
    id: 'ex-1',
    title: 'Mid-Term Physics & Mathematics Examination 2026',
    examType: 'MID_TERM',
    startDate: '2026-08-20',
    endDate: '2026-08-25',
    duration: 180,
    classes: ['Class 10', 'Class 11 Science'],
    totalSubjects: 4,
    totalStudents: 205,
    status: 'UPCOMING',
    academicYear: { name: '2025-2026' },
  },
  {
    id: 'ex-2',
    title: 'Computer Science Practical & Lab Assessment',
    examType: 'PRACTICAL',
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    duration: 120,
    classes: ['Class 12 CS'],
    totalSubjects: 1,
    totalStudents: 78,
    status: 'IN_PROGRESS',
    academicYear: { name: '2025-2026' },
  },
  {
    id: 'ex-3',
    title: 'Unit Test 1 - English & Social Sciences',
    examType: 'UNIT_TEST',
    startDate: '2026-07-10',
    endDate: '2026-07-12',
    duration: 90,
    classes: ['Class 9', 'Class 10'],
    totalSubjects: 3,
    totalStudents: 210,
    status: 'COMPLETED',
    academicYear: { name: '2025-2026' },
  },
];

export default function ExamsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Real API integration
  const { data: examsResponse, isLoading } = useQuery({
    queryKey: ['exams', user?.schoolId, statusFilter],
    queryFn: () => examService.listExams({
      subjectId: undefined,
      sectionId: undefined,
      examType: statusFilter !== 'all' ? statusFilter : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  // Transform API data to match UI expectations with mock fallback
  const apiExams = Array.isArray(examsResponse) ? examsResponse : examsResponse?.data || [];
  const exams = apiExams.length > 0 ? apiExams : MOCK_EXAMS;

  const filteredExams = exams.filter((e: any) => {
    const title = e.title || e.name || '';
    const matchesSearch = searchQuery === '' || title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
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
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Examinations</h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
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
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Exams</p>
              <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-1">{exams?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Upcoming</p>
              <p className="text-3xl font-bold text-blue-500 mt-1">
                {exams?.filter((e: any) => e.status === 'UPCOMING' || e.status === 'SCHEDULED').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">In Progress</p>
              <p className="text-3xl font-bold text-emerald-500 mt-1">
                {exams?.filter((e: any) => e.status === 'IN_PROGRESS' || e.status === 'ONGOING').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Completed</p>
              <p className="text-3xl font-bold text-purple-500 mt-1">
                {exams?.filter((e: any) => e.status === 'COMPLETED' || e.status === 'GRADED').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-premium mb-6">
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
      <Card className="card-premium overflow-hidden">
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
            {filteredExams && filteredExams.length > 0 ? (
              filteredExams.map((exam: any) => {
                const examDate = exam.date || exam.startDate;
                const examEndDate = exam.endDate;
                return (
                  <TableRow key={exam.id} className="cursor-pointer hover:bg-[hsl(var(--muted)/0.5)]">
                    <TableCell>
                      <p className="font-semibold text-[hsl(var(--foreground))]">{exam.title || exam.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{exam.academicYear?.name || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{(exam.examType || exam.type || 'EXAM').replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {examDate && <p className="font-medium text-[hsl(var(--foreground))]">{new Date(examDate).toLocaleDateString()}</p>}
                        {examEndDate && (
                          <>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">to</p>
                            <p className="text-xs text-[hsl(var(--foreground))]">{new Date(examEndDate).toLocaleDateString()}</p>
                          </>
                        )}
                        {exam.duration && <p className="text-xs text-[hsl(var(--muted-foreground))]">{exam.duration} min</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {exam.section?.class?.name ? (
                        <Badge variant="secondary" className="text-xs">
                          {exam.section.class.name}
                        </Badge>
                      ) : exam.classes && exam.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {exam.classes.slice(0, 2).map((cls: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {typeof cls === 'string' ? cls : cls.name}
                            </Badge>
                          ))}
                          {exam.classes.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{exam.classes.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[hsl(var(--foreground))]">{exam.subject?.name || exam.totalSubjects || '-'}</TableCell>
                    <TableCell className="text-[hsl(var(--foreground))]">{exam.totalStudents || exam.section?.studentCount || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        exam.status === 'UPCOMING' || exam.status === 'SCHEDULED' ? 'info' :
                        exam.status === 'IN_PROGRESS' || exam.status === 'ONGOING' ? 'warning' :
                        exam.status === 'COMPLETED' || exam.status === 'GRADED' ? 'success' :
                        'secondary'
                      }>
                        {exam.status || 'SCHEDULED'}
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
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-[hsl(var(--muted-foreground))]">
                    <p className="mt-2">No exams found</p>
                    <Can permission={PERMISSIONS.EXAMS_MANAGE}>
                      <Button className="mt-4" onClick={() => router.push('/exams/create')}>
                        Create First Exam
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
