/**
 * Module 13: Assignments - Assignment Detail Page
 * FR-ASSIGN-001 to FR-ASSIGN-020: Detailed assignment information and submission tracking
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'grading' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API call
  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', params.id],
    queryFn: async () => ({
      id: params.id,
      title: 'Photosynthesis Lab Report',
      description: 'Write a comprehensive lab report on the photosynthesis experiment conducted in class. Include observations, data analysis, and conclusions.',
      subject: 'Biology',
      class: 'Class 10',
      section: 'A',
      teacher: {
        id: 't1',
        name: 'Dr. Verma',
        email: 'dr.verma@school.com',
      },
      assignedDate: '2024-09-01T10:00:00Z',
      dueDate: '2024-09-15T23:59:59Z',
      totalMarks: 50,
      passingMarks: 20,
      status: 'ACTIVE',
      type: 'LAB_REPORT',
      instructions: [
        'Minimum 1000 words',
        'Include graphs and diagrams',
        'Cite at least 3 scientific sources',
        'Follow the standard lab report format',
        'Submit as PDF only',
      ],
      attachments: [
        { id: '1', name: 'Lab_Instructions.pdf', size: '2.5 MB', url: '/files/lab-instructions.pdf' },
        { id: '2', name: 'Reference_Material.pdf', size: '4.8 MB', url: '/files/reference.pdf' },
      ],
      submissions: [
        {
          id: 's1',
          student: { id: '1', name: 'Aarav Kumar', rollNumber: '1', admissionNumber: 'ADM2024001' },
          submittedAt: '2024-09-14T18:30:00Z',
          status: 'GRADED',
          score: 45,
          feedback: 'Excellent work! Well-structured report with clear observations.',
          lateSubmission: false,
          attachments: [{ name: 'Aarav_Lab_Report.pdf', size: '3.2 MB' }],
        },
        {
          id: 's2',
          student: { id: '2', name: 'Diya Sharma', rollNumber: '2', admissionNumber: 'ADM2024002' },
          submittedAt: '2024-09-13T16:45:00Z',
          status: 'GRADED',
          score: 48,
          feedback: 'Outstanding! Very thorough analysis and excellent presentation.',
          lateSubmission: false,
          attachments: [{ name: 'Diya_Report.pdf', size: '4.1 MB' }],
        },
        {
          id: 's3',
          student: { id: '3', name: 'Rohan Patel', rollNumber: '3', admissionNumber: 'ADM2024003' },
          submittedAt: '2024-09-15T14:20:00Z',
          status: 'SUBMITTED',
          score: null,
          feedback: null,
          lateSubmission: false,
          attachments: [{ name: 'Rohan_Lab.pdf', size: '2.8 MB' }],
        },
        {
          id: 's4',
          student: { id: '4', name: 'Priya Singh', rollNumber: '4', admissionNumber: 'ADM2024004' },
          submittedAt: '2024-09-16T10:15:00Z',
          status: 'SUBMITTED',
          score: null,
          feedback: null,
          lateSubmission: true,
          attachments: [{ name: 'Priya_Report.pdf', size: '3.5 MB' }],
        },
      ],
      totalStudents: 45,
      statistics: {
        submitted: 32,
        pending: 13,
        graded: 28,
        averageScore: 42.5,
        highestScore: 50,
        lowestScore: 25,
        medianScore: 43,
        lateSubmissions: 4,
      },
    }),
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

  if (!assignment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Assignment not found</p>
          <Button className="mt-4" onClick={() => router.push('/assignments')}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const daysUntilDue = Math.ceil(
    (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusColors = {
    ACTIVE: 'info',
    OVERDUE: 'error',
    COMPLETED: 'success',
    DRAFT: 'secondary',
  } as const;

  const submissionStatusColors = {
    SUBMITTED: 'info',
    GRADED: 'success',
    PENDING: 'secondary',
    LATE: 'warning',
  } as const;

  const filteredSubmissions = assignment.submissions.filter((submission: any) =>
    submission.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.student.rollNumber.includes(searchQuery) ||
    submission.student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/assignments')}>
                ← Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant={statusColors[assignment.status as keyof typeof statusColors]}>
                {assignment.status}
              </Badge>
              <Badge variant="secondary">{assignment.type.replace('_', ' ')}</Badge>
              <span className="text-sm text-gray-600">{assignment.subject}</span>
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm text-gray-600">
                {assignment.class} - Section {assignment.section}
              </span>
              <span className="text-sm text-gray-600">•</span>
              <span className={`text-sm font-medium ${
                daysUntilDue < 0 ? 'text-red-600' :
                daysUntilDue < 3 ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                {daysUntilDue < 0 ? 'Overdue' : `${daysUntilDue} days left`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Can permission={PERMISSIONS.ASSIGNMENTS_MANAGE}>
              <Button variant="outline" onClick={() => router.push(`/assignments/${params.id}/edit`)}>
                Edit
              </Button>
            </Can>
            <Can permission={PERMISSIONS.ASSIGNMENTS_GRADE}>
              <Button onClick={() => router.push(`/assignments/${params.id}/grade`)}>
                Grade Submissions
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
              <p className="text-3xl font-bold text-gray-900 mt-1">{assignment.totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{assignment.statistics.submitted}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((assignment.statistics.submitted / assignment.totalStudents) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{assignment.statistics.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{assignment.statistics.graded}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((assignment.statistics.graded / assignment.statistics.submitted) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {assignment.statistics.averageScore}/{assignment.totalMarks}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((assignment.statistics.averageScore / assignment.totalMarks) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {(['overview', 'submissions', 'grading', 'analytics'] as const).map((tab) => (
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
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{assignment.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Assigned Date</p>
                  <p className="text-gray-900">
                    {new Date(assignment.assignedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Due Date</p>
                  <p className="text-gray-900">
                    {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
                    {new Date(assignment.dueDate).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Marks</p>
                  <p className="text-gray-900">
                    {assignment.totalMarks} (Passing: {assignment.passingMarks})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Teacher</p>
                  <p className="text-gray-900">{assignment.teacher.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Subject</p>
                  <p className="text-gray-900">{assignment.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Class</p>
                  <p className="text-gray-900">
                    {assignment.class} - Section {assignment.section}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {assignment.instructions.map((instruction: string, idx: number) => (
                  <li key={idx} className="text-gray-700">{instruction}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Attachments */}
          {assignment.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments ({assignment.attachments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assignment.attachments.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-red-600 text-xs font-bold">PDF</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Submissions ({assignment.statistics.submitted}/{assignment.totalStudents})</CardTitle>
              <Input
                type="search"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission: any) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.student.rollNumber}</TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{submission.student.name}</p>
                      <p className="text-sm text-gray-500">{submission.student.admissionNumber}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </p>
                      {submission.lateSubmission && (
                        <Badge variant="warning" className="mt-1">Late</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={submissionStatusColors[submission.status as keyof typeof submissionStatusColors]}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.score !== null ? (
                        <span className={`font-medium ${
                          submission.score >= assignment.passingMarks ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submission.score}/{assignment.totalMarks}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not graded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{submission.attachments.length} file(s)</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                        {submission.status === 'SUBMITTED' && (
                          <Can permission={PERMISSIONS.ASSIGNMENTS_GRADE}>
                            <Button size="sm" variant="ghost">
                              Grade
                            </Button>
                          </Can>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'grading' && (
        <Card>
          <CardHeader>
            <CardTitle>Grading Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Bulk grading interface will be available here</p>
              <Button className="mt-4" onClick={() => router.push(`/assignments/${params.id}/grade`)}>
                Open Grading Interface
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Highest Score</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {assignment.statistics.highestScore}/{assignment.totalMarks}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Median Score</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {assignment.statistics.medianScore}/{assignment.totalMarks}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Lowest Score</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {assignment.statistics.lowestScore}/{assignment.totalMarks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>Detailed analytics and charts will be displayed here</p>
                <p className="text-sm mt-2">
                  Submission timeline, score distribution, and performance trends
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
