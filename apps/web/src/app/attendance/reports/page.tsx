/**
 * Module 10: Attendance Reports
 * FR-ATT-011 to FR-ATT-020: Attendance Analytics and Reporting
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function AttendanceReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState('daily');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Mock data - replace with actual API call
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['attendance-report', reportType, selectedClass, selectedSection, selectedMonth],
    queryFn: async () => ({
      summary: {
        totalStudents: 120,
        averageAttendance: 92.5,
        presentToday: 110,
        absentToday: 8,
        lateToday: 2,
        totalDays: 20,
      },
      students: [
        { id: '1', name: 'Amit Kumar', rollNumber: '001', present: 18, absent: 2, late: 0, percentage: 90 },
        { id: '2', name: 'Priya Sharma', rollNumber: '002', present: 20, absent: 0, late: 0, percentage: 100 },
        { id: '3', name: 'Rahul Singh', rollNumber: '003', present: 17, absent: 3, late: 0, percentage: 85 },
        { id: '4', name: 'Neha Patel', rollNumber: '004', present: 19, absent: 1, late: 0, percentage: 95 },
        { id: '5', name: 'Vikram Reddy', rollNumber: '005', present: 16, absent: 3, late: 1, percentage: 80 },
      ],
      classSummary: [
        { class: 'Class 10 A', totalStudents: 40, avgAttendance: 92, presentToday: 38 },
        { class: 'Class 10 B', totalStudents: 40, avgAttendance: 89, presentToday: 36 },
        { class: 'Class 10 C', totalStudents: 40, avgAttendance: 95, presentToday: 39 },
      ],
    }),
  });

  const handleExport = (format: 'pdf' | 'excel') => {
    // Implement export functionality
    console.log(`Exporting as ${format}`);
  };

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
    <Can permission={PERMISSIONS.ATTENDANCE_VIEW}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and analyze attendance data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="daily">Daily Report</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="student">Student-wise</option>
                  <option value="class">Class-wise</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                  <option value="">All Classes</option>
                  {[6, 7, 8, 9, 10, 11, 12].map(num => (
                    <option key={num} value={num.toString()}>Class {num}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <Select 
                  value={selectedSection} 
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">All Sections</option>
                  {['A', 'B', 'C', 'D'].map(letter => (
                    <option key={letter} value={letter}>Section {letter}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  max={new Date().toISOString().slice(0, 7)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.summary.totalStudents}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-blue-600">{reportData?.summary.averageAttendance}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{reportData?.summary.presentToday}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">{reportData?.summary.absentToday}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Working Days</p>
                <p className="text-2xl font-bold text-purple-600">{reportData?.summary.totalDays}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student-wise Report */}
        {reportType === 'student' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Student-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Present Days</TableHead>
                    <TableHead>Absent Days</TableHead>
                    <TableHead>Late Days</TableHead>
                    <TableHead>Attendance %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.students.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.rollNumber}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.present}</TableCell>
                      <TableCell>{student.absent}</TableCell>
                      <TableCell>{student.late}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          student.percentage >= 90 ? 'text-green-600' :
                          student.percentage >= 75 ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {student.percentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          student.percentage >= 90 ? 'success' :
                          student.percentage >= 75 ? 'info' :
                          'error'
                        }>
                          {student.percentage >= 90 ? 'Excellent' :
                           student.percentage >= 75 ? 'Good' :
                           'Below Requirement'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Class-wise Report */}
        {reportType === 'class' && (
          <Card>
            <CardHeader>
              <CardTitle>Class-wise Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class & Section</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Avg Attendance %</TableHead>
                    <TableHead>Present Today</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.classSummary.map((cls: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{cls.class}</TableCell>
                      <TableCell>{cls.totalStudents}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          cls.avgAttendance >= 90 ? 'text-green-600' :
                          cls.avgAttendance >= 75 ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {cls.avgAttendance}%
                        </span>
                      </TableCell>
                      <TableCell>{cls.presentToday}</TableCell>
                      <TableCell>
                        <Badge variant={
                          cls.avgAttendance >= 90 ? 'success' :
                          cls.avgAttendance >= 75 ? 'info' :
                          'error'
                        }>
                          {cls.avgAttendance >= 90 ? 'Excellent' :
                           cls.avgAttendance >= 75 ? 'Good' :
                           'Needs Attention'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Low Attendance Alert */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Low Attendance Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800">
              <strong>2 students</strong> have attendance below 75% (minimum requirement).
              Parent notifications have been sent automatically.
            </p>
            <Button size="sm" variant="outline" className="mt-3">
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
