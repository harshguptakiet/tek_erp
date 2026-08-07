/**
 * Module 15: Analytics - Student Performance Analytics
 * FR-ANALYTICS-011 to FR-ANALYTICS-020: Detailed student performance tracking
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/stores/auth.store';

export default function StudentPerformanceAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Real API integration
  const { data: performanceResponse, isLoading } = useQuery({
    queryKey: ['student-performance', user?.schoolId, selectedClass, selectedSubject],
    queryFn: () => analyticsService.getStudentPerformance(user?.schoolId || '', {
      classId: selectedClass !== 'all' ? selectedClass : undefined,
      subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  // Transform API response
  const performanceData = performanceResponse || {
    summary: {
      totalStudents: 0,
      averageGrade: 0,
      topPerformer: '',
      lowestPerformer: '',
      improvementRate: 0,
    },
    students: [],
    insights: [],
  };

  const filteredStudents = performanceData?.students.filter((student: any) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

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
    <Can
      permission={PERMISSIONS.ANALYTICS_READ}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to view analytics</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/analytics')}>
              ← Back to Analytics
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Performance Analytics</h1>
              <p className="mt-2 text-sm text-gray-600">
                Detailed performance tracking and insights
              </p>
            </div>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{performanceData?.summary.totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-purple-600">{performanceData?.summary.averageGrade}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-bold text-green-600">{performanceData?.summary.topPerformer}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Improvement Rate</p>
              <p className="text-2xl font-bold text-blue-600">{performanceData?.summary.improvementRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Need Attention</p>
              <p className="text-2xl font-bold text-orange-600">3</p>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {performanceData?.insights.map((insight: any, idx: number) => (
            <Card key={idx} className={
              insight.type === 'success' ? 'border-green-200 bg-green-50' :
              insight.type === 'warning' ? 'border-orange-200 bg-orange-50' :
              'border-blue-200 bg-blue-50'
            }>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{insight.icon}</span>
                  <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="all">All Classes</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </Select>
              <Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="all">All Subjects</option>
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
                <option value="english">English</option>
                <option value="social">Social Studies</option>
              </Select>
              <Button variant="outline">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Student Performance List */}
        <div className="space-y-4">
          {filteredStudents.map((student: any) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-600">
                        #{student.rank}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">{student.name}</h3>
                        <Badge variant={
                          student.trend === 'up' ? 'success' :
                          student.trend === 'down' ? 'error' : 'secondary'
                        }>
                          {student.trend === 'up' ? '↑ Improving' :
                           student.trend === 'down' ? '↓ Declining' : '→ Stable'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {student.class} - Section {student.section} • {student.admissionNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Overall Grade</p>
                    <p className="text-3xl font-bold text-purple-600">{student.overallGrade}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {student.subjects.map((subject: any) => (
                    <div key={subject.name} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700">{subject.name}</p>
                        <span className={`text-sm ${
                          subject.trend === 'up' ? 'text-green-600' :
                          subject.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {subject.trend === 'up' ? '↑' : subject.trend === 'down' ? '↓' : '→'}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{subject.grade}%</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Attendance: </span>
                      <span className="font-semibold text-gray-900">{student.attendance}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Assignments: </span>
                      <span className="font-semibold text-gray-900">
                        {student.assignmentsSubmitted}/{student.assignmentsTotal}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => router.push(`/students/${student.id}`)}>
                    View Details →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Can>
  );
}
