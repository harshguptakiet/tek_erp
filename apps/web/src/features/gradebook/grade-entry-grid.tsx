/**
 * Grade Entry Grid Component
 * Spreadsheet-like interface for bulk grade entry
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Download, Upload, Calculator, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface GradeEntry {
  studentId: string;
  marks: number | null;
  grade: string;
  percentage: number;
  remarks?: string;
}

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  status: string;
}

interface GradeEntryGridProps {
  students: Student[];
  maxMarks: number;
  subjectName: string;
  examName: string;
  onSave: (grades: GradeEntry[]) => Promise<void>;
  initialGrades?: Record<string, GradeEntry>;
}

export function GradeEntryGrid({
  students,
  maxMarks,
  subjectName,
  examName,
  onSave,
  initialGrades = {},
}: GradeEntryGridProps) {
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statistics, setStatistics] = useState({
    average: 0,
    highest: 0,
    lowest: 0,
    passed: 0,
    failed: 0,
  });

  // Initialize grades
  useEffect(() => {
    const initialState: Record<string, GradeEntry> = {};
    students.forEach((student) => {
      initialState[student.id] = initialGrades[student.id] || {
        studentId: student.id,
        marks: null,
        grade: '',
        percentage: 0,
      };
    });
    setGrades(initialState);
  }, [students, initialGrades]);

  // Calculate grade from marks
  const calculateGrade = (marks: number, max: number): string => {
    const percentage = (marks / max) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  // Update marks
  const handleMarksChange = (studentId: string, value: string) => {
    const marks = value === '' ? null : parseFloat(value);
    
    if (marks !== null && (marks < 0 || marks > maxMarks)) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setGrades((prev) => {
      const updated = { ...prev };
      if (marks !== null) {
        const percentage = (marks / maxMarks) * 100;
        updated[studentId] = {
          ...prev[studentId],
          marks,
          percentage,
          grade: calculateGrade(marks, maxMarks),
        };
      } else {
        updated[studentId] = {
          ...prev[studentId],
          marks: null,
          percentage: 0,
          grade: '',
        };
      }
      return updated;
    });
  };

  // Update remarks
  const handleRemarksChange = (studentId: string, remarks: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  // Calculate statistics
  useEffect(() => {
    const validGrades = Object.values(grades).filter((g) => g.marks !== null);
    if (validGrades.length === 0) {
      setStatistics({ average: 0, highest: 0, lowest: 0, passed: 0, failed: 0 });
      return;
    }

    const marksArray = validGrades.map((g) => g.marks!);
    const average = marksArray.reduce((a, b) => a + b, 0) / marksArray.length;
    const highest = Math.max(...marksArray);
    const lowest = Math.min(...marksArray);
    const passingMarks = maxMarks * 0.4; // 40% passing
    const passed = validGrades.filter((g) => g.marks! >= passingMarks).length;
    const failed = validGrades.filter((g) => g.marks! < passingMarks).length;

    setStatistics({ average, highest, lowest, passed, failed });
  }, [grades, maxMarks]);

  // Save grades
  const handleSave = async () => {
    const gradeEntries = Object.values(grades).filter((g) => g.marks !== null);
    
    if (gradeEntries.length === 0) {
      toast.error('Please enter at least one grade');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(gradeEntries);
      toast.success(`${gradeEntries.length} grades saved successfully`);
    } catch (error) {
      toast.error('Failed to save grades');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-fill functionality
  const handleAutoFill = () => {
    const defaultMarks = prompt(`Enter default marks (0-${maxMarks}):`);
    if (!defaultMarks) return;

    const marks = parseFloat(defaultMarks);
    if (isNaN(marks) || marks < 0 || marks > maxMarks) {
      toast.error(`Invalid marks. Must be between 0 and ${maxMarks}`);
      return;
    }

    const updated = { ...grades };
    students.forEach((student) => {
      if (!updated[student.id]?.marks) {
        const percentage = (marks / maxMarks) * 100;
        updated[student.id] = {
          studentId: student.id,
          marks,
          percentage,
          grade: calculateGrade(marks, maxMarks),
        };
      }
    });
    setGrades(updated);
    toast.success('Empty fields filled');
  };

  // Export to CSV
  const handleExport = () => {
    let csv = 'Roll Number,Student Name,Marks,Grade,Percentage,Remarks\n';
    students.forEach((student) => {
      const grade = grades[student.id];
      csv += `${student.rollNumber},"${student.name}",${grade?.marks || ''},${grade?.grade || ''},${grade?.percentage?.toFixed(2) || 0},"${grade?.remarks || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades_${subjectName}_${examName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Grades exported');
  };

  const gradeColorClass = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade === 'D') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-semibold">{subjectName}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Exam</p>
              <p className="font-semibold">{examName}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Max Marks</p>
              <p className="font-semibold">{maxMarks}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoFill}>
              <Calculator className="h-4 w-4 mr-2" />
              Auto Fill
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Grades'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-bold">{statistics.average.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Highest</p>
          <p className="text-lg font-bold text-green-600">{statistics.highest}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Lowest</p>
          <p className="text-lg font-bold text-red-600">{statistics.lowest}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Passed</p>
          <p className="text-lg font-bold text-green-600">{statistics.passed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-lg font-bold text-red-600">{statistics.failed}</p>
        </Card>
      </div>

      {/* Grade Entry Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left w-24">Roll No</th>
                <th className="px-4 py-3 text-left">Student Name</th>
                <th className="px-4 py-3 text-center w-32">Marks</th>
                <th className="px-4 py-3 text-center w-24">Grade</th>
                <th className="px-4 py-3 text-center w-24">%</th>
                <th className="px-4 py-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const grade = grades[student.id] || {
                  marks: null,
                  grade: '',
                  percentage: 0,
                };

                return (
                  <tr key={student.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono">{student.rollNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{student.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max={maxMarks}
                          step="0.5"
                          placeholder="0"
                          value={grade.marks ?? ''}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-muted-foreground">/ {maxMarks}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {grade.grade && (
                        <Badge className={gradeColorClass(grade.grade)}>
                          {grade.grade}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {grade.marks !== null ? `${grade.percentage.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        placeholder="Optional remarks..."
                        value={grade.remarks || ''}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        className="w-full"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span>
            <strong>{Object.values(grades).filter((g) => g.marks !== null).length}</strong> of{' '}
            <strong>{students.length}</strong> grades entered
          </span>
          <span className="text-muted-foreground">
            Unsaved changes - Click 'Save Grades' to submit
          </span>
        </div>
      </Card>
    </div>
  );
}
