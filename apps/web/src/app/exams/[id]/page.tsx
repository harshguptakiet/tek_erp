/**
 * Module 09: Assessment - Exam Detail Page
 * FR-EXAM-001 to FR-EXAM-015: Detailed exam information and management
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { examService } from '@/services/exam.service';
import { useAuthStore } from '@/stores/auth.store';

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'grades' | 'analytics'>('overview');

  // Real API integration
  const { data: exam, isLoading } = useQuery({
    queryKey: ['exam', params.id],
    queryFn: () => examService.getExam(params.id),
    enabled: !!params.id,
  });

  const { data: resultsResponse } = useQuery({
    queryKey: ['exam-results', params.id],
    queryFn: () => examService.getExamResults(params.id),
    enabled: !!params.id && activeTab === 'grades',
  });

  // Transform API data
  const results = Array.isArray(resultsResponse) ? resultsResponse : resultsResponse?.results || [];

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

  if (!exam) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Exam not found</p>
          <Button className="mt-4" onClick={() => router.push('/exams')}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    UPCOMING: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'secondary',
    SCHEDULED: 'info',
  } as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/exams')}>
                ← Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{exam.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant={statusColors[exam.status as keyof typeof statusColors]}>
                {exam.status}
              </Badge>
              <span className="text-sm text-gray-600">{exam.academicYear}</span>
              <Badge variant="secondary">{exam.type.replace('_', ' ')}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Can permission={PERMISSIONS.EXAMS_MANAGE}>
              <Button
                variant="outline"
                onClick={() => router.push(`/exams/${params.id}/edit`)}
              >
                Edit
              </Button>
              <Button onClick={() => router.push(`/exams/${params.id}/schedule`)}>
                Manage Schedule
              </Button>
            </Can>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {exam.statistics.totalStudents}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {exam.statistics.enrolled} enrolled
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {exam.schedule.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {exam.totalMarks} marks
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {exam.statistics.graded}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {exam.statistics.submitted} submitted
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {exam.statistics.passPercentage}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Min: {exam.passingMarks}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {(['overview', 'schedule', 'grades', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Exam Information */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{exam.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Duration</p>
                  <p className="text-gray-900">
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Marks</p>
                  <p className="text-gray-900">{exam.totalMarks}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Passing Marks</p>
                  <p className="text-gray-900">{exam.passingMarks} ({((exam.passingMarks / exam.totalMarks) * 100).toFixed(0)}%)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Grade Scale</p>
                  <p className="text-gray-900">{exam.gradeScale}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Created By</p>
                  <p className="text-gray-900">{exam.createdBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classes Enrolled */}
          <Card>
            <CardHeader>
              <CardTitle>Classes Enrolled ({exam.classes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exam.classes.map((cls: any) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.section}</TableCell>
                      <TableCell>{cls.totalStudents}</TableCell>
                      <TableCell>
                        <span className={cls.enrolled === cls.totalStudents ? 'text-green-600' : 'text-yellow-600'}>
                          {cls.enrolled}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/classes/${cls.id}`)}>
                          View Class
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'schedule' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Exam Schedule ({exam.schedule.length} subjects)</CardTitle>
              <Can permission={PERMISSIONS.EXAMS_MANAGE}>
                <Button size="sm" onClick={() => router.push(`/exams/${params.id}/schedule/edit`)}>
                  Edit Schedule
                </Button>
              </Can>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Supervisor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exam.schedule.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.subject}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {item.startTime} - {item.endTime}
                    </TableCell>
                    <TableCell>{item.duration} min</TableCell>
                    <TableCell>{item.totalMarks}</TableCell>
                    <TableCell>{item.room}</TableCell>
                    <TableCell>{item.supervisor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'grades' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Grade Entry</CardTitle>
              <Can permission={PERMISSIONS.EXAMS_GRADE}>
                <Button onClick={() => router.push(`/exams/${params.id}/grades/entry`)}>
                  Enter Grades
                </Button>
              </Can>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Grade entry interface will be available here</p>
              <p className="text-sm mt-2">Select a subject and class to enter grades</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>Analytics will be available after exam completion</p>
                <p className="text-sm mt-2">
                  View subject-wise performance, grade distribution, and comparative analysis
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
