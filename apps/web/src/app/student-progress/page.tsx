/**
 * Module 13: Student Progress Tracking
 * FR-PROGRESS-001: View comprehensive student progress
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { analyticsService } from '@/services/analytics.service';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

export default function StudentProgressPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term' | 'year'>('term');

  // Real API integration
  const { data: progressResponse, isLoading } = useQuery({
    queryKey: ['student-progress', user?.schoolId, selectedClass, selectedSubject, timeRange],
    queryFn: () =>
      analyticsService.getStudentPerformance(user?.schoolId || '', {
        classId: selectedClass || undefined,
        subjectId: selectedSubject || undefined,
        timeRange,
      }),
    enabled: !!user?.schoolId,
  });

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  // Transform API data
  const students = Array.isArray(progressResponse)
    ? progressResponse
    : progressResponse?.students || [];
  const classes = Array.isArray(classesResponse) ? classesResponse : classesResponse?.data || [];
  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data || [];

  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const averageProgress = students.length > 0
    ? (students.reduce((sum: number, s: any) => sum + (s.overallProgress || 0), 0) / students.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Progress Tracking</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor academic performance and learning progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Average Progress</p>
            <p className="text-3xl font-bold text-blue-600">{averageProgress}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">On Track</p>
            <p className="text-3xl font-bold text-green-600">
              {students.filter((s: any) => (s.overallProgress || 0) >= 70).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Needs Attention</p>
            <p className="text-3xl font-bold text-red-600">
              {students.filter((s: any) => (s.overallProgress || 0) < 50).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </Select>
            <Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((subject: any) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="term">This Term</option>
              <option value="year">This Year</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Progress Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading progress data...</p>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student: any) => (
            <Card
              key={student.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/students/${student.id}`)}
            >
              <CardContent className="pt-6">
                {/* Student Info */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{student.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600">
                      {student.rollNumber || '-'} • {student.className || '-'}
                    </p>
                  </div>
                  <Badge
                    variant={
                      (student.overallProgress || 0) >= 80
                        ? 'success'
                        : (student.overallProgress || 0) >= 60
                        ? 'info'
                        : (student.overallProgress || 0) >= 40
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {(student.overallProgress || 0).toFixed(0)}%
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm text-gray-600">{(student.overallProgress || 0).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (student.overallProgress || 0) >= 80
                          ? 'bg-green-500'
                          : (student.overallProgress || 0) >= 60
                          ? 'bg-blue-500'
                          : (student.overallProgress || 0) >= 40
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${student.overallProgress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Attendance</p>
                    <p className="font-semibold text-blue-600">{student.attendance || 0}%</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-xs text-gray-600">Avg Score</p>
                    <p className="font-semibold text-green-600">{student.averageScore || 0}%</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-xs text-gray-600">Assignments</p>
                    <p className="font-semibold text-purple-600">
                      {student.completedAssignments || 0}/{student.totalAssignments || 0}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View Detailed Report →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <p className="text-gray-600">No progress data available</p>
              <p className="text-sm text-gray-500 mt-2">
                Progress data will appear once students have attendance, assignments, and exam records
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
