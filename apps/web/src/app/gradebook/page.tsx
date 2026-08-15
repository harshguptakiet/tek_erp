/**
 * Grade Book - Main Page
 * Teachers and admins can view and manage grades
 */

'use client';

import { useState } from 'react';
import { useClassGradeBook } from '@/features/gradebook/use-gradebook';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const MOCK_GRADEBOOK = [
  {
    studentId: 'std-1',
    studentName: 'Jane Student',
    rollNumber: '1001',
    subjects: [
      { subjectId: 'sb-1', subjectName: 'Mathematics', marks: 94, maxMarks: 100 },
      { subjectId: 'sb-2', subjectName: 'Physics', marks: 88, maxMarks: 100 },
      { subjectId: 'sb-3', subjectName: 'Chemistry', marks: 91, maxMarks: 100 },
      { subjectId: 'sb-4', subjectName: 'English', marks: 95, maxMarks: 100 },
      { subjectId: 'sb-5', subjectName: 'Computer Science', marks: 98, maxMarks: 100 },
    ],
    totalMarks: 466,
    totalMaxMarks: 500,
    overallPercentage: 93.2,
    overallGrade: 'A+',
    rank: 1,
  },
  {
    studentId: 'std-2',
    studentName: 'Alex Rivera',
    rollNumber: '1002',
    subjects: [
      { subjectId: 'sb-1', subjectName: 'Mathematics', marks: 82, maxMarks: 100 },
      { subjectId: 'sb-2', subjectName: 'Physics', marks: 85, maxMarks: 100 },
      { subjectId: 'sb-3', subjectName: 'Chemistry', marks: 80, maxMarks: 100 },
      { subjectId: 'sb-4', subjectName: 'English', marks: 88, maxMarks: 100 },
      { subjectId: 'sb-5', subjectName: 'Computer Science', marks: 92, maxMarks: 100 },
    ],
    totalMarks: 427,
    totalMaxMarks: 500,
    overallPercentage: 85.4,
    overallGrade: 'A',
    rank: 4,
  },
  {
    studentId: 'std-3',
    studentName: 'Priya Patel',
    rollNumber: '1003',
    subjects: [
      { subjectId: 'sb-1', subjectName: 'Mathematics', marks: 90, maxMarks: 100 },
      { subjectId: 'sb-2', subjectName: 'Physics', marks: 92, maxMarks: 100 },
      { subjectId: 'sb-3', subjectName: 'Chemistry', marks: 89, maxMarks: 100 },
      { subjectId: 'sb-4', subjectName: 'English', marks: 94, maxMarks: 100 },
      { subjectId: 'sb-5', subjectName: 'Computer Science', marks: 96, maxMarks: 100 },
    ],
    totalMarks: 461,
    totalMaxMarks: 500,
    overallPercentage: 92.2,
    overallGrade: 'A+',
    rank: 2,
  },
];

export default function GradeBookPage() {
  const [selectedClass, setSelectedClass] = useState('class-1');
  const [selectedExam, setSelectedExam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: apiGradeBook, isLoading } = useClassGradeBook(selectedClass, {
    examId: selectedExam,
  });

  const gradeBook = (apiGradeBook && apiGradeBook.length > 0) ? apiGradeBook : MOCK_GRADEBOOK;

  const filteredGradeBook = gradeBook?.filter((student) =>
    student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Grade Book</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">View and manage student grades</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Export
          </Button>
          <Link href="/gradebook/enter">
            <Button>Enter Grades</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-premium p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Class</label>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="class-1">Class 10 A</option>
              <option value="class-2">Class 10 B</option>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Exam</label>
            <Select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">All Exams</option>
              <option value="exam-1">Mid Term</option>
              <option value="exam-2">Final Exam</option>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Search Student</label>
            <Input
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Grade Book Table */}
      {selectedClass ? (
        <Card className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[hsl(var(--muted)/0.4)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[hsl(var(--foreground))]">Roll No</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[hsl(var(--foreground))]">Student Name</th>
                  {filteredGradeBook?.[0]?.subjects.map((subject) => (
                    <th key={subject.subjectId} className="px-4 py-3 text-center text-sm font-bold text-[hsl(var(--foreground))]">
                      {subject.subjectName}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm font-bold text-[hsl(var(--foreground))]">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-[hsl(var(--foreground))]">%</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-[hsl(var(--foreground))]">Grade</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-[hsl(var(--foreground))]">Rank</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                      Loading grades...
                    </td>
                  </tr>
                ) : filteredGradeBook?.length ? (
                  filteredGradeBook.map((student) => (
                    <tr key={student.studentId} className="border-t border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--muted)/0.5)]">
                      <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">{student.rollNumber}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[hsl(var(--foreground))]">{student.studentName}</td>
                      {student.subjects.map((subject) => (
                        <td key={subject.subjectId} className="px-4 py-3 text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[hsl(var(--foreground))]">{subject.marks}</span>
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">/{subject.maxMarks}</span>
                          </div>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-semibold text-[hsl(var(--foreground))]">
                        {student.totalMarks}/{student.totalMaxMarks}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-[hsl(var(--foreground))]">
                        {student.overallPercentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                          student.overallGrade === 'A+' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                          student.overallGrade === 'A' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                          student.overallGrade === 'B' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                          'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                        }`}>
                          {student.overallGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-500">
                        #{student.rank || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                      No grades found. Start by entering grades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="card-premium p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">Select a class to view grade book</p>
        </Card>
      )}
    </div>
  );
}
