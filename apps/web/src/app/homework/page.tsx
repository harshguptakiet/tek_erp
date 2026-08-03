/**
 * Module 13: Assignments - Homework Management
 * FR-HW-001: View, submit, and track homework assignments
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

type HomeworkStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';

interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: HomeworkStatus;
  teacherName: string;
  attachments?: string[];
  submission?: {
    submittedAt: string;
    remarks: string;
    files: string[];
  };
  grade?: {
    marks: number;
    maxMarks: number;
    feedback: string;
    gradedAt: string;
  };
}

export default function HomeworkPage() {
  const router = useRouter();
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<HomeworkStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submissionRemarks, setSubmissionRemarks] = useState('');

  // Mock data
  const { data: homeworkData, isLoading } = useQuery({
    queryKey: ['homework'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'hw1',
          subject: 'Mathematics',
          title: 'Linear Equations Practice',
          description: 'Solve all problems from Chapter 3, Exercise 3.2. Show complete working.',
          assignedDate: '2024-07-28',
          dueDate: '2024-08-05',
          status: 'PENDING' as HomeworkStatus,
          teacherName: 'Dr. Rajesh Kumar',
          attachments: ['linear-equations.pdf'],
        },
        {
          id: 'hw2',
          subject: 'Physics',
          title: 'Newton\'s Laws Report',
          description: 'Write a detailed report on Newton\'s three laws with real-world examples.',
          assignedDate: '2024-07-25',
          dueDate: '2024-08-01',
          status: 'SUBMITTED' as HomeworkStatus,
          teacherName: 'Prof. Priya Singh',
          attachments: ['newtons-laws.pdf'],
          submission: {
            submittedAt: '2024-07-30T10:30:00Z',
            remarks: 'Completed with examples from daily life',
            files: ['newton-report.pdf'],
          },
        },
        {
          id: 'hw3',
          subject: 'Chemistry',
          title: 'Periodic Table Assignment',
          description: 'Learn first 20 elements with atomic numbers and electronic configuration.',
          assignedDate: '2024-07-20',
          dueDate: '2024-07-28',
          status: 'GRADED' as HomeworkStatus,
          teacherName: 'Ms. Anjali Sharma',
          submission: {
            submittedAt: '2024-07-27T14:00:00Z',
            remarks: 'Memorized all 20 elements',
            files: ['periodic-table.pdf'],
          },
          grade: {
            marks: 18,
            maxMarks: 20,
            feedback: 'Excellent work! Minor errors in electronic configuration of Calcium.',
            gradedAt: '2024-07-29T09:00:00Z',
          },
        },
        {
          id: 'hw4',
          subject: 'English',
          title: 'Essay on Environmental Conservation',
          description: 'Write a 500-word essay on importance of environmental conservation.',
          assignedDate: '2024-07-22',
          dueDate: '2024-07-30',
          status: 'OVERDUE' as HomeworkStatus,
          teacherName: 'Mr. Suresh Verma',
          attachments: ['essay-guidelines.pdf'],
        },
        {
          id: 'hw5',
          subject: 'Hindi',
          title: 'Hindi Grammar Exercise',
          description: 'Complete exercises on Sangya, Sarvanam, and Visheshan from textbook.',
          assignedDate: '2024-07-29',
          dueDate: '2024-08-06',
          status: 'PENDING' as HomeworkStatus,
          teacherName: 'Mrs. Kavita Joshi',
        },
        {
          id: 'hw6',
          subject: 'Biology',
          title: 'Cell Structure Diagram',
          description: 'Draw and label a detailed diagram of plant and animal cells.',
          assignedDate: '2024-07-26',
          dueDate: '2024-08-03',
          status: 'PENDING' as HomeworkStatus,
          teacherName: 'Dr. Meera Gupta',
          attachments: ['cell-structure-reference.pdf'],
        },
      ] as Homework[];
    },
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => [
      { id: 's1', name: 'Mathematics' },
      { id: 's2', name: 'Physics' },
      { id: 's3', name: 'Chemistry' },
      { id: 's4', name: 'Biology' },
      { id: 's5', name: 'English' },
      { id: 's6', name: 'Hindi' },
    ],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { homeworkId: string; remarks: string; files: string[] }) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: () => {
      toast.success('Homework submitted successfully');
      setShowSubmitDialog(false);
      setSelectedHomework(null);
      setSubmissionRemarks('');
    },
    onError: () => {
      toast.error('Failed to submit homework');
    },
  });

  const filteredHomework = homeworkData?.filter((hw) => {
    const matchesSearch = 
      hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'ALL' || hw.subject === filterSubject;
    const matchesStatus = filterStatus === 'ALL' || hw.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const stats = {
    total: homeworkData?.length || 0,
    pending: homeworkData?.filter((h) => h.status === 'PENDING').length || 0,
    submitted: homeworkData?.filter((h) => h.status === 'SUBMITTED').length || 0,
    graded: homeworkData?.filter((h) => h.status === 'GRADED').length || 0,
    overdue: homeworkData?.filter((h) => h.status === 'OVERDUE').length || 0,
  };

  const handleSubmit = (homework: Homework) => {
    setSelectedHomework(homework);
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    if (!selectedHomework) return;
    submitMutation.mutate({
      homeworkId: selectedHomework.id,
      remarks: submissionRemarks,
      files: [], // File upload would be handled here
    });
  };

  const getStatusBadge = (status: HomeworkStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'SUBMITTED':
        return <Badge variant="info">Submitted</Badge>;
      case 'GRADED':
        return <Badge variant="success">Graded</Badge>;
      case 'OVERDUE':
        return <Badge variant="error">Overdue</Badge>;
    }
  };

  const isOverdue = (dueDate: string, status: HomeworkStatus) => {
    return new Date(dueDate) < new Date() && 
           (status === 'PENDING' || status === 'OVERDUE');
  };


  return (
    <Can
      permission={PERMISSIONS.ASSIGNMENTS_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to view homework</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
          <p className="mt-2 text-sm text-gray-600">
            View your assignments and submit completed work
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('ALL')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('PENDING')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('SUBMITTED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-3xl font-bold text-blue-600">{stats.submitted}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('GRADED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Graded</p>
                <p className="text-3xl font-bold text-green-600">{stats.graded}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('OVERDUE')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search homework..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="ALL">All Subjects</option>
                {subjectsData?.map((subject: any) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </Select>

              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="GRADED">Graded</option>
                <option value="OVERDUE">Overdue</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Homework List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading homework...</p>
          </div>
        ) : filteredHomework && filteredHomework.length > 0 ? (
          <div className="space-y-4">
            {filteredHomework.map((homework) => (
              <Card
                key={homework.id}
                className={`hover:shadow-lg transition-shadow ${
                  isOverdue(homework.dueDate, homework.status) ? 'border-red-300 bg-red-50' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          {homework.subject}
                        </Badge>
                        {getStatusBadge(homework.status)}
                        {isOverdue(homework.dueDate, homework.status) && (
                          <Badge variant="error">⏰ Overdue</Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {homework.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{homework.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>👤 {homework.teacherName}</span>
                        <span>📅 Assigned: {new Date(homework.assignedDate).toLocaleDateString()}</span>
                        <span className={isOverdue(homework.dueDate, homework.status) ? 'text-red-600 font-medium' : ''}>
                          🗓️ Due: {new Date(homework.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {homework.attachments && homework.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-1">Attachments:</p>
                          <div className="flex gap-2">
                            {homework.attachments.map((file, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                📎 {file}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {homework.submission && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs font-medium text-blue-900 mb-1">
                            ✓ Submitted: {new Date(homework.submission.submittedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-800">{homework.submission.remarks}</p>
                        </div>
                      )}

                      {homework.grade && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">Grade:</span>
                            <Badge variant="success" className="text-lg">
                              {homework.grade.marks}/{homework.grade.maxMarks}
                            </Badge>
                          </div>
                          <p className="text-xs text-green-800">{homework.grade.feedback}</p>
                          <p className="text-xs text-green-700 mt-1">
                            Graded: {new Date(homework.grade.gradedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/homework/${homework.id}`)}
                      >
                        View Details
                      </Button>

                      {homework.status === 'PENDING' && (
                        <Can permission={PERMISSIONS.ASSIGNMENTS_SUBMIT}>
                          <Button
                            size="sm"
                            onClick={() => handleSubmit(homework)}
                          >
                            Submit Work
                          </Button>
                        </Can>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No homework found matching your criteria</p>
          </div>
        )}

        {/* Submit Dialog */}
        {showSubmitDialog && selectedHomework && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-2xl w-full mx-4">
              <CardHeader>
                <CardTitle>Submit Homework: {selectedHomework.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submission Remarks *
                    </label>
                    <Textarea
                      value={submissionRemarks}
                      onChange={(e) => setSubmissionRemarks(e.target.value)}
                      placeholder="Describe your work, approach, or any notes..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Files
                    </label>
                    <Input type="file" multiple />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload your completed homework (PDF, DOC, images, etc.)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSubmitDialog(false);
                        setSelectedHomework(null);
                        setSubmissionRemarks('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmSubmit}
                      disabled={!submissionRemarks.trim() || submitMutation.isPending}
                      className="flex-1"
                    >
                      {submitMutation.isPending ? 'Submitting...' : 'Submit Homework'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Can>
  );
}
