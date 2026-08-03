/**
 * Module 09: Assessment - Grade Entry for Exams
 * FR-EXAM-005: Enter and manage exam grades
 */

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

interface StudentGrade {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: string;
  marksObtained: number | null;
  maxMarks: number;
  grade: string;
  remarks: string;
  isAbsent: boolean;
}

export default function ExamGradeEntryPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params?.id as string;

  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [bulkMarks, setBulkMarks] = useState('');

  // Mock exam data
  const { data: examData } = useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => ({
      id: examId,
      name: 'First Term Examination 2024',
      type: 'MID_TERM',
      class: 'Class 10-A',
      subjects: [
        { id: 's1', name: 'Mathematics', maxMarks: 100, date: '2024-08-05' },
        { id: 's2', name: 'Physics', maxMarks: 100, date: '2024-08-06' },
        { id: 's3', name: 'Chemistry', maxMarks: 100, date: '2024-08-07' },
        { id: 's4', name: 'English', maxMarks: 100, date: '2024-08-08' },
      ],
    }),
  });

  // Mock students data
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['exam-students', examId, selectedSubject],
    queryFn: async () => {
      if (!selectedSubject) return [];
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const maxMarks = examData?.subjects.find((s: any) => s.id === selectedSubject)?.maxMarks || 100;
      
      return [
        {
          studentId: 's1',
          studentName: 'Aarav Kumar',
          admissionNumber: 'ADM001',
          rollNumber: '1',
          marksObtained: null,
          maxMarks,
          grade: '',
          remarks: '',
          isAbsent: false,
        },
        {
          studentId: 's2',
          studentName: 'Priya Sharma',
          admissionNumber: 'ADM002',
          rollNumber: '2',
          marksObtained: null,
          maxMarks,
          grade: '',
          remarks: '',
          isAbsent: false,
        },
        {
          studentId: 's3',
          studentName: 'Rahul Verma',
          admissionNumber: 'ADM003',
          rollNumber: '3',
          marksObtained: null,
          maxMarks,
          grade: '',
          remarks: '',
          isAbsent: false,
        },
        {
          studentId: 's4',
          studentName: 'Ananya Singh',
          admissionNumber: 'ADM004',
          rollNumber: '4',
          marksObtained: null,
          maxMarks,
          grade: '',
          remarks: '',
          isAbsent: false,
        },
        {
          studentId: 's5',
          studentName: 'Arjun Patel',
          admissionNumber: 'ADM005',
          rollNumber: '5',
          marksObtained: null,
          maxMarks,
          grade: '',
          remarks: '',
          isAbsent: false,
        },
        {
          studentId: 's6',
          studentName: 'Diya Reddy',
          admissionNumber: 'ADM006',
          rollNumber: '6',
          marksObtained: null,
          maxMarks,
          grade: '',
          remarks: '',
          isAbsent: false,
        },
        {
          studentId: 's7',
          studentName: 'Vivaan Gupta',
          admissionNumber: 'ADM007',
          rollNumber: '7',
          marksObtained: null,
          maxMarks,
          grade: '',
          remarks: '',
          isAbsent: false,
        },
        {
          studentId: 's8',
          studentName: 'Ishita Joshi',
          admissionNumber: 'ADM008',
          rollNumber: '8',
          marksObtained: null,
          maxMarks,
          grade: '',
          remarks: '',
          isAbsent: false,
        },
      ] as StudentGrade[];
    },
    enabled: !!selectedSubject,
  });

  useState(() => {
    if (studentsData) {
      setGrades(studentsData);
    }
  });

  const saveGradesMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: () => {
      toast.success('Grades saved successfully');
      router.push(`/exams/${examId}`);
    },
    onError: () => {
      toast.error('Failed to save grades');
    },
  });

  const calculateGrade = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  };

  const updateMarks = (studentId: string, marks: number | null) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.studentId === studentId) {
          const grade = marks !== null ? calculateGrade(marks, g.maxMarks) : '';
          return { ...g, marksObtained: marks, grade };
        }
        return g;
      })
    );
  };

  const updateRemarks = (studentId: string, remarks: string) => {
    setGrades((prev) =>
      prev.map((g) => (g.studentId === studentId ? { ...g, remarks } : g))
    );
  };

  const toggleAbsent = (studentId: string) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.studentId === studentId) {
          const isAbsent = !g.isAbsent;
          return {
            ...g,
            isAbsent,
            marksObtained: isAbsent ? null : g.marksObtained,
            grade: isAbsent ? 'AB' : g.grade,
          };
        }
        return g;
      })
    );
  };

  const applyBulkMarks = () => {
    const marks = parseFloat(bulkMarks);
    if (isNaN(marks)) {
      toast.error('Please enter valid marks');
      return;
    }
    setGrades((prev) =>
      prev.map((g) => ({
        ...g,
        marksObtained: marks,
        grade: calculateGrade(marks, g.maxMarks),
      }))
    );
    setBulkMarks('');
    toast.success('Bulk marks applied');
  };

  const handleSave = () => {
    const gradeData = {
      examId,
      subjectId: selectedSubject,
      grades: grades.map((g) => ({
        studentId: g.studentId,
        marksObtained: g.isAbsent ? null : g.marksObtained,
        grade: g.grade,
        remarks: g.remarks,
        isAbsent: g.isAbsent,
      })),
    };
    saveGradesMutation.mutate(gradeData);
  };

  const filteredGrades = grades.filter((g) =>
    g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.rollNumber.includes(searchQuery)
  );

  const stats = {
    total: grades.length,
    graded: grades.filter((g) => g.marksObtained !== null && !g.isAbsent).length,
    absent: grades.filter((g) => g.isAbsent).length,
    pending: grades.filter((g) => g.marksObtained === null && !g.isAbsent).length,
    averageMarks: grades.length > 0
      ? (grades.reduce((sum, g) => sum + (g.marksObtained || 0), 0) / grades.filter(g => g.marksObtained !== null).length).toFixed(2)
      : 0,
  };


  return (
    <Can
      permission={PERMISSIONS.EXAMS_GRADE}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to enter grades</p>
            <Button className="mt-4" onClick={() => router.push(`/exams/${examId}`)}>
              Back to Exam
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/exams/${examId}`)}>
              ← Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Grade Entry</h1>
          <p className="mt-2 text-sm text-gray-600">
            {examData?.name} - {examData?.class}
          </p>
        </div>

        {/* Subject Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {examData?.subjects.map((subject: any) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSubject === subject.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{subject.name}</p>
                  <p className="text-xs text-gray-600 mt-1">Max: {subject.maxMarks}</p>
                  {selectedSubject === subject.id && (
                    <Badge variant="success" className="mt-2 text-xs">✓ Selected</Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedSubject && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Graded</p>
                    <p className="text-3xl font-bold text-green-600">{stats.graded}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Average</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.averageMarks}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tools */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Bulk marks"
                      value={bulkMarks}
                      onChange={(e) => setBulkMarks(e.target.value)}
                    />
                    <Button onClick={applyBulkMarks} variant="outline">
                      Apply to All
                    </Button>
                  </div>

                  <div className="flex items-center justify-end">
                    <span className="text-sm text-gray-600">
                      Progress: {stats.graded}/{stats.total} ({((stats.graded / stats.total) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grade Entry Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Grades ({filteredGrades.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading students...</p>
                  </div>
                ) : filteredGrades.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No students found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredGrades.map((grade) => (
                      <div
                        key={grade.studentId}
                        className={`border rounded-lg p-4 ${
                          grade.isAbsent ? 'bg-red-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {grade.rollNumber}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div>
                                <p className="font-semibold text-gray-900">{grade.studentName}</p>
                                <p className="text-sm text-gray-600">{grade.admissionNumber}</p>
                              </div>

                              <label className="flex items-center gap-2 ml-auto">
                                <input
                                  type="checkbox"
                                  checked={grade.isAbsent}
                                  onChange={() => toggleAbsent(grade.studentId)}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700">Mark Absent</span>
                              </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Marks Obtained *
                                </label>
                                <Input
                                  type="number"
                                  value={grade.marksObtained ?? ''}
                                  onChange={(e) =>
                                    updateMarks(
                                      grade.studentId,
                                      e.target.value ? parseFloat(e.target.value) : null
                                    )
                                  }
                                  min="0"
                                  max={grade.maxMarks}
                                  disabled={grade.isAbsent}
                                  placeholder={`Max: ${grade.maxMarks}`}
                                />
                              </div>

                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Grade</label>
                                <div className="h-10 flex items-center">
                                  {grade.grade && (
                                    <Badge
                                      variant={
                                        grade.grade === 'AB'
                                          ? 'error'
                                          : grade.grade.startsWith('A')
                                          ? 'success'
                                          : grade.grade.startsWith('B')
                                          ? 'info'
                                          : grade.grade === 'F'
                                          ? 'error'
                                          : 'warning'
                                      }
                                      className="text-lg"
                                    >
                                      {grade.grade}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-xs text-gray-600 mb-1">
                                  Remarks (Optional)
                                </label>
                                <Input
                                  value={grade.remarks}
                                  onChange={(e) => updateRemarks(grade.studentId, e.target.value)}
                                  placeholder="Performance feedback..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => router.push(`/exams/${examId}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveGradesMutation.isPending || stats.pending > 0}
                className="flex-1"
              >
                {saveGradesMutation.isPending
                  ? 'Saving...'
                  : stats.pending > 0
                  ? `${stats.pending} Pending - Complete All`
                  : 'Save Grades'}
              </Button>
            </div>
          </>
        )}

        {!selectedSubject && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Please select a subject to start grading</p>
          </div>
        )}
      </div>
    </Can>
  );
}
