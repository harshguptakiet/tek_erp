/**
 * Module 04: Academic - Class Detail Page
 * FR-ACAD-001 to FR-ACAD-010: Detailed class information and student roster
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'subjects' | 'timetable' | 'performance'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Real API integration
  const { data: classData, isLoading } = useQuery({
    queryKey: ['class', params.id],
    queryFn: () => academicService.getClass(params.id),
    enabled: !!params.id,
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

if (!classData) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-12">
        <p className="text-gray-600">Class not found</p>
        <Button className="mt-4" onClick={() => router.push('/classes')}>
          Back to Classes
        </Button>
      </div>
    </div>
  );
}

const filteredStudents = classData.students.filter((student: any) =>
  student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
  student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
);

return (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header */}
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/classes')}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {classData.name} - Section {classData.section}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-600">{classData.academicYear}</span>
            <Badge variant="secondary">{classData.room}</Badge>
            <span className="text-sm text-gray-600">
              {classData.totalStudents}/{classData.capacity} students
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Can permission={PERMISSIONS.ACADEMIC_MANAGE}>
            <Button
              variant="outline"
              onClick={() => router.push(`/classes/${params.id}/edit`)}
            >
              Edit Class
            </Button>
            <Button onClick={() => router.push(`/classes/${params.id}/timetable`)}>
              View Timetable
            </Button>
          </Can>
        </div>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {classData.totalStudents}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {classData.maleStudents}M / {classData.femaleStudents}F
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {classData.statistics.averageAttendance}%
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Avg. Score</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {classData.statistics.averageScore}%
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Pass Rate</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {classData.statistics.passPercentage}%
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Excellence</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {classData.statistics.excellenceRate}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Tabs */}
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex gap-8">
        {(['overview', 'students', 'subjects', 'timetable', 'performance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                ? 'border-orange-500 text-orange-600'
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
        {/* Class Teacher Info */}
        <Card>
          <CardHeader>
            <CardTitle>Class Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {classData.classTeacher.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-900">{classData.classTeacher.name}</p>
                  <p className="text-sm text-gray-600">{classData.classTeacher.employeeId}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-600">{classData.classTeacher.phone}</p>
                    <p className="text-sm text-gray-600">{classData.classTeacher.email}</p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/teachers/${classData.classTeacher.id}`)}
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects ({classData.subjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Periods/Week</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classData.subjects.map((subject: any) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.teacher}</TableCell>
                    <TableCell>{subject.periods}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/subjects/${subject.id}`)}
                      >
                        View
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

    {activeTab === 'students' && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Roster ({classData.totalStudents})</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Can permission={PERMISSIONS.STUDENTS_MANAGE}>
                <Button onClick={() => router.push('/students/create')}>
                  Add Student
                </Button>
              </Can>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Avg. Score</TableHead>
                <TableHead>Parent Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student: any) => (
                  <TableRow key={student.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">{student.rollNumber}</TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{student.name}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{student.admissionNumber}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.gender}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={
                        student.attendance >= 90 ? 'text-green-600' :
                          student.attendance >= 75 ? 'text-blue-600' :
                            'text-red-600'
                      }>
                        {student.attendance}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={
                        student.averageScore >= 90 ? 'text-green-600' :
                          student.averageScore >= 75 ? 'text-blue-600' :
                            student.averageScore >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                      }>
                        {student.averageScore}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-gray-900">{student.parentName}</p>
                        <p className="text-gray-500">{student.parentPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/students/${student.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )}

    {activeTab === 'subjects' && (
      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>Detailed subject information will be displayed here</p>
            <p className="text-sm mt-2">Including syllabus, assignments, and assessments</p>
          </div>
        </CardContent>
      </Card>
    )}

    {activeTab === 'timetable' && (
      <Card>
        <CardHeader>
          <CardTitle>Class Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>Weekly timetable will be displayed here</p>
            <Button className="mt-4" onClick={() => router.push(`/classes/${params.id}/timetable`)}>
              View Full Timetable
            </Button>
          </div>
        </CardContent>
      </Card>
    )}

    {activeTab === 'performance' && (
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>Class performance analytics and trends</p>
            <p className="text-sm mt-2">Subject-wise performance, attendance patterns, and comparative analysis</p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);
}
