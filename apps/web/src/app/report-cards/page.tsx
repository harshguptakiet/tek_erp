/**
 * Module 09: Assessment - Report Card Generation
 * FR-REPORT-001: Generate student report cards and grade sheets
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

type ReportCardStatus = 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'DOWNLOADED';

interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  class: string;
  section: string;
  rollNumber: string;
  academicYear: string;
  term: string;
  status: ReportCardStatus;
  overallPercentage: number;
  overallGrade: string;
  rank: number;
  totalStudents: number;
  generatedDate?: string;
  publishedDate?: string;
  subjects: {
    name: string;
    marks: number;
    maxMarks: number;
    grade: string;
    teacherRemarks?: string;
  }[];
  attendance: {
    present: number;
    total: number;
    percentage: number;
  };
  remarks: {
    classTeacher?: string;
    principal?: string;
    strengths?: string;
    improvements?: string;
  };
}

export default function ReportCardsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterTerm, setFilterTerm] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<ReportCardStatus | 'ALL'>('ALL');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  // Mock data
  const { data: reportCardsData, isLoading } = useQuery({
    queryKey: ['report-cards', searchQuery, filterClass, filterTerm, filterStatus],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'rc1',
          studentId: 's1',
          studentName: 'Aarav Kumar',
          admissionNumber: 'ADM001',
          class: 'Class 10',
          section: 'A',
          rollNumber: '1',
          academicYear: '2024-2025',
          term: 'Term 1',
          status: 'PUBLISHED' as ReportCardStatus,
          overallPercentage: 88.5,
          overallGrade: 'A',
          rank: 2,
          totalStudents: 40,
          generatedDate: '2024-07-30T10:00:00Z',
          publishedDate: '2024-08-01T14:00:00Z',
          subjects: [
            { name: 'Mathematics', marks: 92, maxMarks: 100, grade: 'A+', teacherRemarks: 'Excellent performance' },
            { name: 'Physics', marks: 88, maxMarks: 100, grade: 'A', teacherRemarks: 'Good understanding of concepts' },
            { name: 'Chemistry', marks: 85, maxMarks: 100, grade: 'A', teacherRemarks: 'Consistent performance' },
            { name: 'English', marks: 90, maxMarks: 100, grade: 'A+', teacherRemarks: 'Outstanding work' },
            { name: 'Hindi', marks: 87, maxMarks: 100, grade: 'A', teacherRemarks: 'Very good' },
          ],
          attendance: { present: 92, total: 100, percentage: 92 },
          remarks: {
            classTeacher: 'Aarav is a dedicated student with excellent academic performance.',
            principal: 'Keep up the good work.',
            strengths: 'Mathematics, Problem-solving',
            improvements: 'Time management in exams',
          },
        },
        {
          id: 'rc2',
          studentId: 's2',
          studentName: 'Priya Sharma',
          admissionNumber: 'ADM002',
          class: 'Class 10',
          section: 'A',
          rollNumber: '2',
          academicYear: '2024-2025',
          term: 'Term 1',
          status: 'GENERATED' as ReportCardStatus,
          overallPercentage: 92.8,
          overallGrade: 'A+',
          rank: 1,
          totalStudents: 40,
          generatedDate: '2024-07-30T10:05:00Z',
          subjects: [
            { name: 'Mathematics', marks: 95, maxMarks: 100, grade: 'A+' },
            { name: 'Physics', marks: 94, maxMarks: 100, grade: 'A+' },
            { name: 'Chemistry', marks: 91, maxMarks: 100, grade: 'A+' },
            { name: 'English', marks: 93, maxMarks: 100, grade: 'A+' },
            { name: 'Hindi', marks: 91, maxMarks: 100, grade: 'A+' },
          ],
          attendance: { present: 98, total: 100, percentage: 98 },
          remarks: {
            classTeacher: 'Outstanding performance across all subjects.',
            strengths: 'All subjects, Leadership',
            improvements: 'Continue the excellent work',
          },
        },
        {
          id: 'rc3',
          studentId: 's3',
          studentName: 'Rahul Verma',
          admissionNumber: 'ADM003',
          class: 'Class 11',
          section: 'B',
          rollNumber: '3',
          academicYear: '2024-2025',
          term: 'Term 1',
          status: 'DRAFT' as ReportCardStatus,
          overallPercentage: 75.4,
          overallGrade: 'B+',
          rank: 8,
          totalStudents: 35,
          subjects: [
            { name: 'Mathematics', marks: 78, maxMarks: 100, grade: 'B+' },
            { name: 'Physics', marks: 72, maxMarks: 100, grade: 'B' },
            { name: 'Chemistry', marks: 76, maxMarks: 100, grade: 'B+' },
            { name: 'English', marks: 80, maxMarks: 100, grade: 'A' },
            { name: 'Hindi', marks: 71, maxMarks: 100, grade: 'B' },
          ],
          attendance: { present: 88, total: 100, percentage: 88 },
          remarks: {},
        },
      ] as ReportCard[];
    },
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => [
      { id: 'c1', name: 'Class 9' },
      { id: 'c2', name: 'Class 10' },
      { id: 'c3', name: 'Class 11' },
      { id: 'c4', name: 'Class 12' },
    ],
  });

  const generateMutation = useMutation({
    mutationFn: async (cardIds: string[]) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return cardIds;
    },
    onSuccess: () => {
      toast.success('Report cards generated successfully');
      setSelectedCards([]);
    },
    onError: () => {
      toast.error('Failed to generate report cards');
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (cardIds: string[]) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return cardIds;
    },
    onSuccess: () => {
      toast.success('Report cards published successfully');
      setSelectedCards([]);
    },
    onError: () => {
      toast.error('Failed to publish report cards');
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (cardId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return cardId;
    },
    onSuccess: () => {
      toast.success('Report card downloaded successfully');
    },
    onError: () => {
      toast.error('Failed to download report card');
    },
  });

  const filteredCards = reportCardsData?.filter((card) => {
    const matchesSearch = 
      card.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.rollNumber.includes(searchQuery);
    const matchesClass = filterClass === 'ALL' || card.class === filterClass;
    const matchesTerm = filterTerm === 'ALL' || card.term === filterTerm;
    const matchesStatus = filterStatus === 'ALL' || card.status === filterStatus;
    return matchesSearch && matchesClass && matchesTerm && matchesStatus;
  });

  const stats = {
    total: reportCardsData?.length || 0,
    draft: reportCardsData?.filter((c) => c.status === 'DRAFT').length || 0,
    generated: reportCardsData?.filter((c) => c.status === 'GENERATED').length || 0,
    published: reportCardsData?.filter((c) => c.status === 'PUBLISHED').length || 0,
    downloaded: reportCardsData?.filter((c) => c.status === 'DOWNLOADED').length || 0,
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const selectAll = () => {
    if (selectedCards.length === filteredCards?.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(filteredCards?.map((c) => c.id) || []);
    }
  };

  const getStatusBadge = (status: ReportCardStatus) => {
    const badges = {
      DRAFT: <Badge variant="warning">Draft</Badge>,
      GENERATED: <Badge variant="info">Generated</Badge>,
      PUBLISHED: <Badge variant="success">Published</Badge>,
      DOWNLOADED: <Badge className="bg-purple-600 text-white">Downloaded</Badge>,
    };
    return badges[status];
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-orange-600';
    if (grade === 'D') return 'text-yellow-600';
    return 'text-red-600';
  };


  return (
    <Can
      permission={PERMISSIONS.REPORTS_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to view report cards</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Cards</h1>
              <p className="mt-2 text-sm text-gray-600">
                Generate and manage student report cards
              </p>
            </div>
            <Can permission={PERMISSIONS.REPORTS_GENERATE}>
              <Button onClick={() => router.push('/report-cards/generate')}>
                + Generate Report Cards
              </Button>
            </Can>
          </div>
        </div>

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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('DRAFT')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-3xl font-bold text-orange-600">{stats.draft}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('GENERATED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Generated</p>
                <p className="text-3xl font-bold text-blue-600">{stats.generated}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('PUBLISHED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-3xl font-bold text-green-600">{stats.published}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('DOWNLOADED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Downloaded</p>
                <p className="text-3xl font-bold text-purple-600">{stats.downloaded}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="ALL">All Classes</option>
                {classesData?.map((cls: any) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </Select>

              <Select
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
              >
                <option value="ALL">All Terms</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Annual">Annual</option>
              </Select>

              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="GENERATED">Generated</option>
                <option value="PUBLISHED">Published</option>
                <option value="DOWNLOADED">Downloaded</option>
              </Select>

              <Button variant="outline" onClick={selectAll}>
                {selectedCards.length === filteredCards?.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {selectedCards.length > 0 && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCards.length} card(s) selected
                </span>
                <div className="flex-1" />
                <Can permission={PERMISSIONS.REPORTS_GENERATE}>
                  <Button
                    size="sm"
                    onClick={() => generateMutation.mutate(selectedCards)}
                    disabled={generateMutation.isPending}
                  >
                    Generate Selected
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => publishMutation.mutate(selectedCards)}
                    disabled={publishMutation.isPending}
                  >
                    Publish Selected
                  </Button>
                </Can>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Cards List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading report cards...</p>
          </div>
        ) : filteredCards && filteredCards.length > 0 ? (
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <Card
                key={card.id}
                className={`hover:shadow-lg transition-shadow ${
                  selectedCards.includes(card.id) ? 'ring-2 ring-indigo-600' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => toggleCardSelection(card.id)}
                        className="rounded"
                      />

                      <div className="flex-1">
                        {/* Student Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {card.studentName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {card.admissionNumber} • Roll No: {card.rollNumber} • {card.class}-{card.section}
                            </p>
                          </div>
                          {getStatusBadge(card.status)}
                        </div>

                        {/* Performance Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600 mb-1">Overall</p>
                            <p className={`text-2xl font-bold ${getGradeColor(card.overallGrade)}`}>
                              {card.overallGrade}
                            </p>
                            <p className="text-xs text-gray-600">{card.overallPercentage}%</p>
                          </div>

                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600 mb-1">Rank</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {card.rank}
                            </p>
                            <p className="text-xs text-gray-600">of {card.totalStudents}</p>
                          </div>

                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600 mb-1">Attendance</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {card.attendance.percentage}%
                            </p>
                            <p className="text-xs text-gray-600">
                              {card.attendance.present}/{card.attendance.total}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600 mb-1">Term</p>
                            <p className="text-sm font-bold text-gray-900">{card.term}</p>
                            <p className="text-xs text-gray-600">{card.academicYear}</p>
                          </div>

                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600 mb-1">Subjects</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {card.subjects.length}
                            </p>
                          </div>
                        </div>

                        {/* Subject Details */}
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">Subject Performance:</p>
                          <div className="flex flex-wrap gap-2">
                            {card.subjects.map((subject, index) => (
                              <div
                                key={index}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-xs"
                              >
                                <span className="font-medium text-gray-900">{subject.name}:</span>
                                <span className={`ml-1 font-bold ${getGradeColor(subject.grade)}`}>
                                  {subject.grade}
                                </span>
                                <span className="ml-1 text-gray-600">
                                  ({subject.marks}/{subject.maxMarks})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Remarks */}
                        {(card.remarks.classTeacher || card.remarks.principal) && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded">
                            {card.remarks.classTeacher && (
                              <p className="text-xs text-green-800 mb-1">
                                <span className="font-medium">Class Teacher:</span> {card.remarks.classTeacher}
                              </p>
                            )}
                            {card.remarks.principal && (
                              <p className="text-xs text-green-800">
                                <span className="font-medium">Principal:</span> {card.remarks.principal}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/report-cards/${card.id}`)}
                      >
                        View Full
                      </Button>

                      {card.status === 'PUBLISHED' && (
                        <Can permission={PERMISSIONS.REPORTS_EXPORT}>
                          <Button
                            size="sm"
                            onClick={() => downloadMutation.mutate(card.id)}
                            disabled={downloadMutation.isPending}
                          >
                            Download PDF
                          </Button>
                        </Can>
                      )}

                      {card.status === 'DRAFT' && (
                        <Can permission={PERMISSIONS.REPORTS_GENERATE}>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/report-cards/${card.id}/edit`)}
                          >
                            Edit
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
            <p className="text-gray-600 mb-4">No report cards found</p>
            <Can permission={PERMISSIONS.REPORTS_GENERATE}>
              <Button onClick={() => router.push('/report-cards/generate')}>
                Generate Report Cards
              </Button>
            </Can>
          </div>
        )}
      </div>
    </Can>
  );
}
