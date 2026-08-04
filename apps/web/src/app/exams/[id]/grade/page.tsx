/**
 * Module 09: Assessment - Exam Grading Interface
 * FR-EXAM-010: Enter and manage exam grades
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { examService } from '@/services/exam.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

interface StudentGrade {
  studentId: string;
  studentName: string;
  rollNumber: string;
  marksObtained: number | null;
  grade?: string;
  remarks?: string;
  status: 'pending' | 'entered' | 'verified';
}

export default function ExamGradingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [grades, setGrades] = useState<Record<string, StudentGrade>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'entered' | 'verified'>('all');

  // Real API integration
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', params.id],
    queryFn: () => examService.getExam(params.id),
    enabled: !!params.id,
  });

  const { data: resultsResponse, isLoading: resultsLoading } = useQuery({
    queryKey: ['exam-results', params.id, selectedSubject, selectedClass],
    queryFn: () => examService.getExamResults(params.id),
    enabled: !!params.id && !!selectedSubject && !!selectedClass,
  });

  // Transform results data
  const students: StudentGrade[] = Array.isArray(resultsResponse)
    ? resultsResponse.map((r: any) => ({
        studentId: r.studentId,
        studentName: r.studentName || 'Unknown Student',
        rollNumber: r.rollNumber || '-',
        marksObtained: r.marksObtained,
        grade: r.grade,
        remarks: r.remarks,
        status: r.marksObtained !== null ? 'entered' : 'pending',
      }))
    : [];

  // Submit grades mutation
  const submitGradesMutation = useMutation({
    mutationFn: (data: { examId: string; grades: any[] }) =>
      examService.submitGrades(data.examId, data.grades),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', params.id] });
      queryClient.invalidateQueries({ queryKey: ['exam', params.id] });
      toast.success('Grades submitted successfully!');
      setGrades({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit grades');
    },
  });

  // Publish results mutation
  const publishResultsMutation = useMutation({
    mutationFn: () => examService.publishResults(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', params.id] });
      toast.success('Results published successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish results');
    },
  });

  const handleMarksChange = (studentId: string, value: string) => {
    const marks = value === '' ? null : Number(value);
    const maxMarks = selectedSubjectData?.totalMarks || 100;
    
    if (marks !== null && (marks < 0 || marks > maxMarks)) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        marksObtained: marks,
        grade: marks !== null ? calculateGrade(marks, maxMarks) : undefined,
        status: 'entered',
      },
    }));
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        remarks: value,
      },
    }));
  };

  const calculateGrade = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const handleSubmitGrades = () => {
    const gradesArray = Object.values(grades).filter((g) => g.marksObtained !== null);
    
    if (gradesArray.length === 0) {
      toast.error('Please enter at least one grade');
      return;
    }

    submitGradesMutation.mutate({
      examId: params.id,
      grades: gradesArray.map((g) => ({
        studentId: g.studentId,
        marksObtained: g.marksObtained!,
        grade: g.grade,
        remarks: g.remarks,
      })),
    });
  };

  const handlePublishResults = () => {
    if (window.confirm('Are you sure you want to publish results? Students will be able to view their grades.')) {
      publishResultsMutation.mutate();
    }
  };

  const selectedSubjectData = exam?.schedule?.find((s: any) => s.id === selectedSubject);
  const selectedClassData = exam?.classes?.find((c: any) => c.id === selectedClass);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const enteredCount = students.filter((s) => s.marksObtained !== null).length;
  const pendingCount = students.length - enteredCount;

  if (examLoading) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/exams/${params.id}`)}>
                ← Back to Exam
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Entry</h1>
            <p className="mt-2 text-gray-600">{exam.name}</p>
          </div>
          <Can permission={PERMISSIONS.EXAMS_GRADE}>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePublishResults}
                disabled={publishResultsMutation.isPending}
              >
                Publish Results
              </Button>
            </div>
          </Can>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Choose a subject...</option>
              {exam.schedule?.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.subject} - {new Date(item.date).toLocaleDateString()} ({item.totalMarks} marks)
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Choose a class...</option>
              {exam.classes?.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - Section {cls.section} ({cls.totalStudents} students)
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      {selectedSubject && selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Grades Entered</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{enteredCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Max Marks</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {selectedSubjectData?.totalMarks || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grading Table */}
      {selectedSubject && selectedClass ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Grades</CardTitle>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="entered">Entered</option>
                  <option value="verified">Verified</option>
                </Select>
                <Button
                  onClick={handleSubmitGrades}
                  disabled={submitGradesMutation.isPending || Object.keys(grades).length === 0}
                >
                  {submitGradesMutation.isPending ? 'Submitting...' : 'Submit Grades'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {resultsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading students...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const currentGrade = grades[student.studentId] || student;
                    return (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={selectedSubjectData?.totalMarks || 100}
                            value={currentGrade.marksObtained ?? ''}
                            onChange={(e) => handleMarksChange(student.studentId, e.target.value)}
                            placeholder="Enter marks"
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          {currentGrade.grade && (
                            <Badge
                              variant={
                                currentGrade.grade === 'F'
                                  ? 'error'
                                  : currentGrade.grade.startsWith('A')
                                  ? 'success'
                                  : currentGrade.grade.startsWith('B')
                                  ? 'info'
                                  : 'warning'
                              }
                            >
                              {currentGrade.grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={currentGrade.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                            placeholder="Optional remarks"
                            className="w-48"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              currentGrade.status === 'entered'
                                ? 'success'
                                : currentGrade.status === 'verified'
                                ? 'info'
                                : 'secondary'
                            }
                          >
                            {currentGrade.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {filteredStudents.length === 0 && !resultsLoading && (
              <div className="text-center py-12">
                <p className="text-gray-600">No students found</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📝</span>
              <p className="text-gray-600">Select a subject and class to start entering grades</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
