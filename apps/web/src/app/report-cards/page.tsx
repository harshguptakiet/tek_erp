/**
 * Module 09: Assessment - Report Cards Management
 * FR-REPORT-001 to FR-REPORT-010: Generate and manage report cards
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { examService } from '@/services/exam.service';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

export default function ReportCardsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateStudentId, setGenerateStudentId] = useState('');

  // Real API integration
  const { data: reportCardsResponse, isLoading } = useQuery({
    queryKey: ['report-cards', selectedAcademicYear, selectedClass],
    queryFn: () =>
      examService.listReportCards({
        academicYearId: selectedAcademicYear || undefined,
      }),
    enabled: !!user?.schoolId,
  });

  const { data: academicYearsResponse } = useQuery({
    queryKey: ['academic-years', user?.schoolId],
    queryFn: () => academicService.listAcademicYears(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const reportCards = Array.isArray(reportCardsResponse)
    ? reportCardsResponse
    : reportCardsResponse?.data || [];
  const academicYears = Array.isArray(academicYearsResponse)
    ? academicYearsResponse
    : academicYearsResponse?.data || [];
  const classes = Array.isArray(classesResponse) ? classesResponse : classesResponse?.data || [];

  // Generate report card mutation
  const generateMutation = useMutation({
    mutationFn: (data: { studentId: string; academicYearId: string }) =>
      examService.generateReportCard(data.studentId, data.academicYearId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-cards'] });
      toast.success('Report card generated successfully!');
      setShowGenerateDialog(false);
      setGenerateStudentId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate report card');
    },
  });

  const handleGenerateReportCard = () => {
    if (!generateStudentId || !selectedAcademicYear) {
      toast.error('Please select student and academic year');
      return;
    }

    generateMutation.mutate({
      studentId: generateStudentId,
      academicYearId: selectedAcademicYear,
    });
  };

  const handleDownloadReportCard = (reportCardId: string) => {
    // This would trigger a download from the backend
    toast.success('Downloading report card...');
    // In real implementation: window.open(`/api/report-cards/${reportCardId}/download`);
  };

  const filteredReportCards = reportCards.filter((card: any) => {
    const matchesSearch =
      card.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || card.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const totalCards = reportCards.length;
  const publishedCards = reportCards.filter((c: any) => c.status === 'published').length;
  const draftCards = reportCards.filter((c: any) => c.status === 'draft').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Cards</h1>
            <p className="mt-2 text-sm text-gray-600">
              Generate and manage student report cards
            </p>
          </div>
          <Can permission={PERMISSIONS.REPORTS_GENERATE}>
            <Button onClick={() => setShowGenerateDialog(true)}>
              + Generate Report Card
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Report Cards</p>
            <p className="text-3xl font-bold text-gray-900">{totalCards}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-3xl font-bold text-green-600">{publishedCards}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Drafts</p>
            <p className="text-3xl font-bold text-orange-600">{draftCards}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-3xl font-bold text-blue-600">
              {reportCards.filter((c: any) => {
                const date = new Date(c.generatedAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
            >
              <option value="">All Academic Years</option>
              {academicYears.map((year: any) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </Select>
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Report Cards ({filteredReportCards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading report cards...</p>
            </div>
          ) : filteredReportCards.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Overall %</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReportCards.map((card: any) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.rollNumber || '-'}</TableCell>
                    <TableCell>{card.studentName || 'Unknown'}</TableCell>
                    <TableCell>{card.className || '-'}</TableCell>
                    <TableCell>{card.academicYear || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          (card.overallPercentage || 0) >= 75
                            ? 'text-green-600'
                            : (card.overallPercentage || 0) >= 60
                            ? 'text-blue-600'
                            : (card.overallPercentage || 0) >= 40
                            ? 'text-orange-600'
                            : 'text-red-600'
                        }`}
                      >
                        {(card.overallPercentage || 0).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          card.overallGrade === 'F'
                            ? 'error'
                            : card.overallGrade?.startsWith('A')
                            ? 'success'
                            : card.overallGrade?.startsWith('B')
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {card.overallGrade || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          card.status === 'published'
                            ? 'success'
                            : card.status === 'draft'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {card.status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {card.generatedAt
                        ? new Date(card.generatedAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/report-cards/${card.id}`)}
                        >
                          View
                        </Button>
                        <Can permission={PERMISSIONS.REPORTS_GENERATE}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReportCard(card.id)}
                          >
                            Download
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📄</span>
              <p className="text-gray-600">No report cards found</p>
              <Can permission={PERMISSIONS.REPORTS_GENERATE}>
                <Button className="mt-4" onClick={() => setShowGenerateDialog(true)}>
                  Generate First Report Card
                </Button>
              </Can>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Report Card Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <Select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                <option value="">Select academic year...</option>
                {academicYears.map((year: any) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">Filter by class...</option>
                {classes.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID *
              </label>
              <Input
                value={generateStudentId}
                onChange={(e) => setGenerateStudentId(e.target.value)}
                placeholder="Enter student ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Or select from student list after filtering by class
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Report card will include all exam results for the selected
                academic year. Make sure all grades are entered and verified before generating.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReportCard}
              disabled={generateMutation.isPending || !generateStudentId || !selectedAcademicYear}
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Report Card'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
