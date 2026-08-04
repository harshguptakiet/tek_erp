'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExamResults, usePublishResults } from './use-exams';
import { Download, Eye, TrendingUp, TrendingDown } from 'lucide-react';

interface ExamResultsTableProps {
  examId: string;
  isPublished?: boolean;
}

export function ExamResultsTable({ examId, isPublished = false }: ExamResultsTableProps) {
  const { data: results, isLoading } = useExamResults(examId);
  const publishResults = usePublishResults();
  const [sortBy, setSortBy] = useState<'name' | 'marks'>('marks');

  const handlePublish = async () => {
    if (confirm('Are you sure you want to publish these results? Students will be able to view them.')) {
      await publishResults.mutateAsync(examId);
    }
  };

  const handleExportCSV = () => {
    if (!results?.results) return;

    const csvContent = [
      ['Student Name', 'Roll Number', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade', 'Status'],
      ...results.results.map((result: any) => [
        result.studentName,
        result.rollNumber,
        result.marksObtained,
        result.totalMarks,
        result.percentage.toFixed(2),
        result.grade,
        result.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${examId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!results?.results?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No results available yet
      </div>
    );
  }

  const sortedResults = [...results.results].sort((a: any, b: any) => {
    if (sortBy === 'name') {
      return a.studentName.localeCompare(b.studentName);
    }
    return b.marksObtained - a.marksObtained;
  });

  const stats = {
    totalStudents: results.results.length,
    passed: results.results.filter((r: any) => r.status === 'pass').length,
    failed: results.results.filter((r: any) => r.status === 'fail').length,
    averageMarks: (
      results.results.reduce((sum: number, r: any) => sum + r.marksObtained, 0) /
      results.results.length
    ).toFixed(2),
    highestMarks: Math.max(...results.results.map((r: any) => r.marksObtained)),
    lowestMarks: Math.min(...results.results.map((r: any) => r.marksObtained)),
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-card rounded-lg border">
          <div className="text-sm text-muted-foreground">Total Students</div>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-700">Passed</div>
          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm text-red-700">Failed</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="text-sm text-muted-foreground">Average</div>
          <div className="text-2xl font-bold">{stats.averageMarks}</div>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Highest
          </div>
          <div className="text-2xl font-bold">{stats.highestMarks}</div>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            Lowest
          </div>
          <div className="text-2xl font-bold">{stats.lowestMarks}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === 'name' ? 'marks' : 'name')}
          >
            Sort by: {sortBy === 'name' ? 'Name' : 'Marks'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {!isPublished && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishResults.isPending}
            >
              {publishResults.isPending ? '⏳ Publishing...' : 'Publish Results'}
            </Button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Student Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Roll Number</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Marks</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Percentage</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Grade</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedResults.map((result: any, index: number) => (
              <tr key={result.studentId} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  {sortBy === 'marks' && (
                    <Badge variant="outline" className="font-mono">
                      #{index + 1}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{result.studentName}</td>
                <td className="px-4 py-3 text-muted-foreground">{result.rollNumber}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium">
                    {result.marksObtained}/{result.totalMarks}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium">{result.percentage.toFixed(2)}%</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={
                      result.grade === 'A+' || result.grade === 'A'
                        ? 'default'
                        : result.grade === 'F'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {result.grade}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={result.status === 'pass' ? 'default' : 'destructive'}
                  >
                    {result.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
