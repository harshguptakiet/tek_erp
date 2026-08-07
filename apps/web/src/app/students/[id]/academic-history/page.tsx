/**
 * FR-USER-013: Student Academic History
 * Complete academic timeline and records
 */

'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { use } from 'react';

export default function StudentAcademicHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: student } = useQuery({
    queryKey: ['student', id],
    queryFn: () => userService.getStudent(id),
  });

  const { data: academicHistory, isLoading } = useQuery({
    queryKey: ['student-academic-history', id],
    queryFn: () => userService.getStudentAcademicHistory(id),
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
    <Can permission={PERMISSIONS.STUDENTS_VIEW}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic History</h1>
            <p className="mt-2 text-sm text-gray-600">
              {student?.fullName} - Complete academic timeline
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              Export Transcript
            </Button>
            <Button variant="outline" onClick={() => router.push(`/students/${id}`)}>
              Back to Profile
            </Button>
          </div>
        </div>

        {/* Enrollment Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enrollment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {academicHistory?.enrollments?.map((enrollment: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="flex-shrink-0 w-24 text-sm text-gray-600">
                    {enrollment.academicYear}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">Class {enrollment.class} - Section {enrollment.section}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Roll Number: {enrollment.rollNumber}
                    </p>
                  </div>
                  <Badge variant={enrollment.status === 'COMPLETED' ? 'success' : 'info'}>
                    {enrollment.status}
                  </Badge>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No enrollment history available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Year-wise Performance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Year-wise Academic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>GPA/Percentage</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicHistory?.yearlyPerformance?.map((year: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{year.academicYear}</TableCell>
                    <TableCell>Class {year.class}</TableCell>
                    <TableCell>
                      <span className={year.attendance >= 75 ? 'text-green-600' : 'text-red-600'}>
                        {year.attendance}%
                      </span>
                    </TableCell>
                    <TableCell>{year.gpa || year.percentage}</TableCell>
                    <TableCell>{year.rank || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={year.result === 'PASS' ? 'success' : 'error'}>
                        {year.result}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No performance data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Certificates & Awards */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Certificates & Report Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {academicHistory?.certificates?.map((cert: any, idx: number) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="info">{cert.type}</Badge>
                      <span className="text-xs text-gray-500">{cert.year}</span>
                    </div>
                    <p className="font-medium mb-2">{cert.title}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Download
                    </Button>
                  </CardContent>
                </Card>
              )) || (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No certificates available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disciplinary Records */}
        <Card>
          <CardHeader>
            <CardTitle>Disciplinary & Conduct Records</CardTitle>
          </CardHeader>
          <CardContent>
            {academicHistory?.discipline?.length > 0 ? (
              <div className="space-y-3">
                {academicHistory.discipline.map((record: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{record.incident}</p>
                        <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                      </div>
                      <Badge variant={record.type === 'POSITIVE' ? 'success' : 'warning'}>
                        {record.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(record.date).toLocaleDateString()} - {record.actionTaken}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No disciplinary records</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
