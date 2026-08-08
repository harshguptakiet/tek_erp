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

export default function GradeBookPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: gradeBook, isLoading } = useClassGradeBook(selectedClass, {
    examId: selectedExam,
  });

  const filteredGradeBook = gradeBook?.filter((student) =>
    student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grade Book</h1>
          <p className="text-muted-foreground">View and manage student grades</p>
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
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Class</label>
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
            >
              <option value="">Select Class</option>
              <option value="class-1">Class 10 A</option>
              <option value="class-2">Class 10 B</option>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Exam</label>
            <Select
              value={selectedExam}
              onValueChange={setSelectedExam}
            >
              <option value="">All Exams</option>
              <option value="exam-1">Mid Term</option>
              <option value="exam-2">Final Exam</option>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Search Student</label>
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
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Student Name</th>
                  {filteredGradeBook?.[0]?.subjects.map((subject) => (
                    <th key={subject.subjectId} className="px-4 py-3 text-center">
                      {subject.subjectName}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">%</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-center">Rank</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8">
                      Loading grades...
                    </td>
                  </tr>
                ) : filteredGradeBook?.length ? (
                  filteredGradeBook.map((student) => (
                    <tr key={student.studentId} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3">{student.rollNumber}</td>
                      <td className="px-4 py-3 font-medium">{student.studentName}</td>
                      {student.subjects.map((subject) => (
                        <td key={subject.subjectId} className="px-4 py-3 text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold">{subject.marks}</span>
                            <span className="text-xs text-muted-foreground">/{subject.maxMarks}</span>
                          </div>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-semibold">
                        {student.totalMarks}/{student.totalMaxMarks}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.overallPercentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          student.overallGrade === 'A+' ? 'bg-green-100 text-green-800' :
                          student.overallGrade === 'A' ? 'bg-blue-100 text-blue-800' :
                          student.overallGrade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {student.overallGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {student.rank || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-muted-foreground">
                      No grades found. Start by entering grades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Select a class to view grade book</p>
        </Card>
      )}
    </div>
  );
}
