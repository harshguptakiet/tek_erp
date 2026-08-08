/**
 * Grade Entry Page - ENHANCED
 * Teachers enter grades for students with bulk operations
 */

'use client';

import { useState } from 'react';
import { useEnterGrades } from '@/features/gradebook/use-gradebook';
import { GradeEntryGrid } from '@/features/gradebook/grade-entry-grid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import type { GradeEntry } from '@/services/gradebook.service';

export default function GradeEntryPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');

  const enterGradesMutation = useEnterGrades();

  // Mock student data - replace with actual API call
  const students = selectedClass ? [
    { id: '1', name: 'John Doe', rollNumber: '101', status: 'ACTIVE' },
    { id: '2', name: 'Jane Smith', rollNumber: '102', status: 'ACTIVE' },
    { id: '3', name: 'Bob Johnson', rollNumber: '103', status: 'ACTIVE' },
    { id: '4', name: 'Alice Williams', rollNumber: '104', status: 'ACTIVE' },
    { id: '5', name: 'Charlie Brown', rollNumber: '105', status: 'ACTIVE' },
  ] : [];

  const maxMarks = 100; // Get from exam configuration

  const handleSaveGrades = async (gradeEntries: any[]) => {
    const formattedGrades: GradeEntry[] = gradeEntries.map((entry) => ({
      studentId: entry.studentId,
      subjectId: selectedSubject,
      examId: selectedExam,
      marks: entry.marks!,
      maxMarks,
      remarks: entry.remarks,
    }));

    await enterGradesMutation.mutateAsync(formattedGrades);
    router.push('/gradebook');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enter Grades</h1>
          <p className="text-muted-foreground">Enter marks for students</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {/* Selection */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Class *</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <option value="">Select Class</option>
              <option value="class-1">Class 10 A</option>
              <option value="class-2">Class 10 B</option>
            </Select>
          </div>

          <div>
            <Label>Subject *</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <option value="">Select Subject</option>
              <option value="subject-1">Mathematics</option>
              <option value="subject-2">Science</option>
              <option value="subject-3">English</option>
            </Select>
          </div>

          <div>
            <Label>Exam *</Label>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <option value="">Select Exam</option>
              <option value="exam-1">Mid Term Exam</option>
              <option value="exam-2">Final Exam</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Enhanced Grade Entry Grid */}
      {selectedClass && selectedSubject && selectedExam ? (
        <GradeEntryGrid
          students={students}
          maxMarks={maxMarks}
          subjectName={selectedSubject === 'subject-1' ? 'Mathematics' : selectedSubject === 'subject-2' ? 'Science' : 'English'}
          examName={selectedExam === 'exam-1' ? 'Mid Term Exam' : 'Final Exam'}
          onSave={handleSaveGrades}
        />
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Please select class, subject, and exam to start entering grades
          </p>
        </Card>
      )}
    </div>
  );
}
