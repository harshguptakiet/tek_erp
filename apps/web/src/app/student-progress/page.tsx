/**
 * Module 09: Assessment - Student Progress Reports
 * FR-ASSESS-015: Comprehensive student progress tracking and reports
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

interface SubjectProgress {
  subject: string;
  currentGrade: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  assignmentsCompleted: number;
  assignmentsTotal: number;
  lastAssessment: string;
}

interface StudentProgress {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;
  section: string;
  rollNumber: number;
  overallPercentage: number;
  overallGrade: string;
  rank: number;
  totalStudents: number;
  attendancePercentage: number;
  subjects: SubjectProgress[];
  strengths: string[];
  areasForImprovement: string[];
  teacherRemarks: string;
}

export default function StudentProgressPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const { data: progressData, isLoading } = useQuery({
    queryKey: ['student-progress', selectedClass, selectedTerm],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 's1',
          name: 'Rahul Sharma',
          admissionNumber: 'ADM-2024-1045',
          class: 'Class 10',
          section: 'A',
          rollNumber: 15,
          overallPercentage: 87.5,
          overallGrade: 'A',
          rank: 3,
          totalStudents: 42,
          attendancePercentage: 94,
          subjects: [
            { subject: 'Mathematics', currentGrade: 'A+', percentage: 92, trend: 'up' as const, assignmentsCompleted: 18, assignmentsTotal: 20, lastAssessment: '2024-07-20' },
            { subject: 'Physics', currentGrade: 'A', percentage: 85, trend: 'stable' as const, assignmentsCompleted: 15, assignmentsTotal: 18, lastAssessment: '2024-07-18' },
            { subject: 'Chemistry', currentGrade: 'A', percentage: 88, trend: 'up' as const, assignmentsCompleted: 16, assignmentsTotal: 18, lastAssessment: '2024-07-19' },
            { subject: 'English', currentGrade: 'B+', percentage: 78, trend: 'down' as const, assignmentsCompleted: 12, assignmentsTotal: 15, lastAssessment: '2024-07-15' },
            { subject: 'Biology', currentGrade: 'A', percentage: 90, trend: 'up' as const, assignmentsCompleted: 14, assignmentsTotal: 16, lastAssessment: '2024-07-21' },
          ],
          strengths: ['Strong in Mathematics and Biology', 'Consistent assignment submission', 'Active class participation'],
          areasForImprovement: ['English writing skills need improvement', 'Focus on Physics numerical problems'],
          teacherRemarks: 'Rahul is a dedicated student showing excellent progress in science subjects. Encourage more reading for English improvement.',
        },
        {
          id: 's2',
          name: 'Priya Patel',
          admissionNumber: 'ADM-2024-1046',
          class: 'Class 10',
          section: 'A',
          rollNumber: 22,
          overallPercentage: 91.2,
          overallGrade: 'A+',
          rank: 1,
          totalStudents: 42,
          attendancePercentage: 98,
          subjects: [
            { subject: 'Mathematics', currentGrade: 'A+', percentage: 95, trend: 'up' as const, assignmentsCompleted: 20, assignmentsTotal: 20, lastAssessment: '2024-07-20' },
            { subject: 'Physics', currentGrade: 'A+', percentage: 92, trend: 'up' as const, assignmentsCompleted: 18, assignmentsTotal: 18, lastAssessment: '2024-07-18' },
            { subject: 'Chemistry', currentGrade: 'A+', percentage: 90, trend: 'stable' as const, assignmentsCompleted: 17, assignmentsTotal: 18, lastAssessment: '2024-07-19' },
            { subject: 'English', currentGrade: 'A', percentage: 88, trend: 'up' as const, assignmentsCompleted: 15, assignmentsTotal: 15, lastAssessment: '2024-07-15' },
            { subject: 'Biology', currentGrade: 'A+', percentage: 93, trend: 'up' as const, assignmentsCompleted: 16, assignmentsTotal: 16, lastAssessment: '2024-07-21' },
          ],
          strengths: ['Top performer across all subjects', 'Excellent attendance record', 'Leadership qualities'],
          areasForImprovement: ['Could mentor struggling classmates'],
          teacherRemarks: 'Outstanding student. Consider for school leadership roles and advanced programs.',
        },
        {
          id: 's3',
          name: 'Arjun Mehta',
          admissionNumber: 'ADM-2024-1047',
          class: 'Class 10',
          section: 'A',
          rollNumber: 8,
          overallPercentage: 72.3,
          overallGrade: 'B',
          rank: 28,
          totalStudents: 42,
          attendancePercentage: 82,
          subjects: [
            { subject: 'Mathematics', currentGrade: 'B', percentage: 68, trend: 'down' as const, assignmentsCompleted: 12, assignmentsTotal: 20, lastAssessment: '2024-07-20' },
            { subject: 'Physics', currentGrade: 'B+', percentage: 75, trend: 'stable' as const, assignmentsCompleted: 14, assignmentsTotal: 18, lastAssessment: '2024-07-18' },
            { subject: 'Chemistry', currentGrade: 'B', percentage: 70, trend: 'down' as const, assignmentsCompleted: 13, assignmentsTotal: 18, lastAssessment: '2024-07-19' },
            { subject: 'English', currentGrade: 'B+', percentage: 78, trend: 'up' as const, assignmentsCompleted: 13, assignmentsTotal: 15, lastAssessment: '2024-07-15' },
            { subject: 'Biology', currentGrade: 'B+', percentage: 76, trend: 'stable' as const, assignmentsCompleted: 14, assignmentsTotal: 16, lastAssessment: '2024-07-21' },
          ],
          strengths: ['Improving in English', 'Good practical lab skills'],
          areasForImprovement: ['Mathematics needs focused attention', 'Improve attendance', 'Complete pending assignments'],
          teacherRemarks: 'Arjun has potential but needs consistent effort. Recommend remedial classes for Mathematics.',
        },
      ] as StudentProgress[];
    },
  });

  const filteredStudents = progressData?.filter(
    (s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.admissionNumber.includes(searchQuery)
  );

  const activeStudent = selectedStudent
    ? progressData?.find((s) => s.id === selectedStudent)
    : filteredStudents?.[0];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <span className="text-green-500">↑</span>;
      case 'down': return <span className="text-red-500">↓</span>;
      case 'stable': return <span className="text-gray-400">→</span>;
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'info';
    if (grade.startsWith('C')) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="h-96 bg-gray-200 rounded" />
          <div className="md:col-span-2 h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Progress Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track academic performance, attendance, and growth across subjects
          </p>
        </div>
        <Can permission={PERMISSIONS.CONTENT_VIEW}>
          <Button variant="outline">Export Reports</Button>
        </Can>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="Class 10-A">Class 10 - Section A</option>
              <option value="Class 10-B">Class 10 - Section B</option>
              <option value="Class 9-A">Class 9 - Section A</option>
            </Select>
            <Select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
              <option value="TERM_1">Term 1 (Apr - Jul)</option>
              <option value="TERM_2">Term 2 (Aug - Nov)</option>
              <option value="ANNUAL">Annual Report</option>
            </Select>
            <Input
              placeholder="Search by name or admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="space-y-2">
          {filteredStudents?.map((student) => (
            <Card
              key={student.id}
              className={`cursor-pointer transition-colors ${
                activeStudent?.id === student.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedStudent(student.id)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">Roll #{student.rollNumber} · {student.admissionNumber}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getGradeColor(student.overallGrade)}>{student.overallGrade}</Badge>
                    <p className="text-sm text-gray-500 mt-1">Rank #{student.rank}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Detail */}
        {activeStudent && (
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{activeStudent.name}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/students/${activeStudent.id}`)}>
                    View Full Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{activeStudent.overallPercentage}%</p>
                    <p className="text-sm text-gray-500">Overall</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">#{activeStudent.rank}</p>
                    <p className="text-sm text-gray-500">Class Rank</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{activeStudent.attendancePercentage}%</p>
                    <p className="text-sm text-gray-500">Attendance</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{activeStudent.overallGrade}</p>
                    <p className="text-sm text-gray-500">Grade</p>
                  </div>
                </div>

                <h4 className="font-medium mb-3">Subject-wise Performance</h4>
                <div className="space-y-3">
                  {activeStudent.subjects.map((subject) => (
                    <div key={subject.subject} className="flex items-center gap-4">
                      <span className="w-28 text-sm font-medium text-gray-700">{subject.subject}</span>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${subject.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-12">{subject.percentage}%</span>
                      <Badge variant={getGradeColor(subject.currentGrade)}>{subject.currentGrade}</Badge>
                      {getTrendIcon(subject.trend)}
                      <span className="text-xs text-gray-400 w-20">
                        {subject.assignmentsCompleted}/{subject.assignmentsTotal} tasks
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-green-700">Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {activeStudent.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-orange-700">Areas for Improvement</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {activeStudent.areasForImprovement.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-orange-500">!</span>{a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Teacher Remarks</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 italic">&ldquo;{activeStudent.teacherRemarks}&rdquo;</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
