/**
 * Module 15: Analytics & Reports - Reports Dashboard
 * FR-REPORT-001: Generate and view various reports
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

type ReportCategory = 
  | 'ACADEMIC'
  | 'ATTENDANCE'
  | 'FINANCIAL'
  | 'STUDENT'
  | 'TEACHER'
  | 'EXAM'
  | 'LIBRARY'
  | 'TRANSPORT';

interface Report {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: string;
  lastGenerated?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';
}

export default function ReportsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Mock data
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        // Academic Reports
        {
          id: 'r1',
          name: 'Student Performance Report',
          description: 'Comprehensive academic performance analysis',
          category: 'ACADEMIC' as ReportCategory,
          icon: '📊',
          lastGenerated: '2024-08-01',
          frequency: 'MONTHLY' as const,
        },
        {
          id: 'r2',
          name: 'Class-wise Results Analysis',
          description: 'Comparative analysis across classes and sections',
          category: 'ACADEMIC' as ReportCategory,
          icon: '📈',
          lastGenerated: '2024-07-28',
          frequency: 'MONTHLY' as const,
        },
        {
          id: 'r3',
          name: 'Subject Performance Report',
          description: 'Subject-wise student performance tracking',
          category: 'ACADEMIC' as ReportCategory,
          icon: '📚',
          frequency: 'ON_DEMAND' as const,
        },
        // Attendance Reports
        {
          id: 'r4',
          name: 'Daily Attendance Report',
          description: 'Day-wise attendance summary for all classes',
          category: 'ATTENDANCE' as ReportCategory,
          icon: '📅',
          lastGenerated: '2024-08-02',
          frequency: 'DAILY' as const,
        },
        {
          id: 'r5',
          name: 'Monthly Attendance Summary',
          description: 'Student-wise monthly attendance percentage',
          category: 'ATTENDANCE' as ReportCategory,
          icon: '📋',
          lastGenerated: '2024-07-31',
          frequency: 'MONTHLY' as const,
        },
        {
          id: 'r6',
          name: 'Defaulter List',
          description: 'Students with attendance below threshold',
          category: 'ATTENDANCE' as ReportCategory,
          icon: '⚠️',
          frequency: 'WEEKLY' as const,
        },
        // Financial Reports
        {
          id: 'r7',
          name: 'Fee Collection Report',
          description: 'Detailed fee collection and pending payments',
          category: 'FINANCIAL' as ReportCategory,
          icon: '💰',
          lastGenerated: '2024-08-01',
          frequency: 'MONTHLY' as const,
        },
        {
          id: 'r8',
          name: 'Fee Defaulters Report',
          description: 'List of students with pending fee payments',
          category: 'FINANCIAL' as ReportCategory,
          icon: '💳',
          lastGenerated: '2024-08-02',
          frequency: 'WEEKLY' as const,
        },
        {
          id: 'r9',
          name: 'Income & Expense Report',
          description: 'Monthly financial summary and analysis',
          category: 'FINANCIAL' as ReportCategory,
          icon: '💵',
          frequency: 'MONTHLY' as const,
        },
        // Student Reports
        {
          id: 'r10',
          name: 'Student Enrollment Report',
          description: 'New admissions and enrollment statistics',
          category: 'STUDENT' as ReportCategory,
          icon: '👥',
          lastGenerated: '2024-07-30',
          frequency: 'MONTHLY' as const,
        },
        {
          id: 'r11',
          name: 'Student Demographics',
          description: 'Age, gender, and category-wise distribution',
          category: 'STUDENT' as ReportCategory,
          icon: '📊',
          frequency: 'ON_DEMAND' as const,
        },
        // Teacher Reports
        {
          id: 'r12',
          name: 'Teacher Performance Report',
          description: 'Teaching effectiveness and student feedback',
          category: 'TEACHER' as ReportCategory,
          icon: '👨‍🏫',
          frequency: 'MONTHLY' as const,
        },
        {
          id: 'r13',
          name: 'Staff Attendance Report',
          description: 'Teacher and staff attendance tracking',
          category: 'TEACHER' as ReportCategory,
          icon: '📅',
          lastGenerated: '2024-08-02',
          frequency: 'DAILY' as const,
        },
        // Exam Reports
        {
          id: 'r14',
          name: 'Exam Results Summary',
          description: 'Overall exam results and pass percentage',
          category: 'EXAM' as ReportCategory,
          icon: '📝',
          frequency: 'ON_DEMAND' as const,
        },
        {
          id: 'r15',
          name: 'Topper List',
          description: 'Top performers by class and subject',
          category: 'EXAM' as ReportCategory,
          icon: '🏆',
          frequency: 'ON_DEMAND' as const,
        },
        // Library Reports
        {
          id: 'r16',
          name: 'Book Issue Report',
          description: 'Library book circulation statistics',
          category: 'LIBRARY' as ReportCategory,
          icon: '📚',
          lastGenerated: '2024-07-31',
          frequency: 'MONTHLY' as const,
        },
        {
          id: 'r17',
          name: 'Overdue Books Report',
          description: 'List of overdue books and fines',
          category: 'LIBRARY' as ReportCategory,
          icon: '⏰',
          lastGenerated: '2024-08-02',
          frequency: 'WEEKLY' as const,
        },
        // Transport Reports
        {
          id: 'r18',
          name: 'Transport Utilization',
          description: 'Bus-wise student allocation and routes',
          category: 'TRANSPORT' as ReportCategory,
          icon: '🚌',
          frequency: 'MONTHLY' as const,
        },
      ] as Report[];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return reportId;
    },
    onSuccess: () => {
      toast.success('Report generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate report');
    },
  });


  const filteredReports = reportsData?.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'ALL', label: 'All Categories', icon: '📁' },
    { value: 'ACADEMIC', label: 'Academic', icon: '📊' },
    { value: 'ATTENDANCE', label: 'Attendance', icon: '📅' },
    { value: 'FINANCIAL', label: 'Financial', icon: '💰' },
    { value: 'STUDENT', label: 'Student', icon: '👥' },
    { value: 'TEACHER', label: 'Teacher', icon: '👨‍🏫' },
    { value: 'EXAM', label: 'Exam', icon: '📝' },
    { value: 'LIBRARY', label: 'Library', icon: '📚' },
    { value: 'TRANSPORT', label: 'Transport', icon: '🚌' },
  ];

  const stats = {
    total: reportsData?.length || 0,
    academic: reportsData?.filter((r) => r.category === 'ACADEMIC').length || 0,
    attendance: reportsData?.filter((r) => r.category === 'ATTENDANCE').length || 0,
    financial: reportsData?.filter((r) => r.category === 'FINANCIAL').length || 0,
  };

  return (
    <Can
      permission={PERMISSIONS.REPORTS_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to view reports</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate and download various reports for analysis
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Academic</p>
                <p className="text-3xl font-bold text-blue-600">{stats.academic}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-3xl font-bold text-green-600">{stats.attendance}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Financial</p>
                <p className="text-3xl font-bold text-purple-600">{stats.financial}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range & Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Input
                type="date"
                placeholder="From Date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
              <Input
                type="date"
                placeholder="To Date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
              <Button variant="outline">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading reports...</p>
          </div>
        ) : filteredReports && filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">{report.icon}</span>
                      </div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        report.frequency === 'DAILY'
                          ? 'info'
                          : report.frequency === 'WEEKLY'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {report.frequency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>

                  {report.lastGenerated && (
                    <p className="text-xs text-gray-500 mb-4">
                      Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Can permission={PERMISSIONS.REPORTS_GENERATE}>
                      <Button
                        size="sm"
                        onClick={() => generateMutation.mutate(report.id)}
                        disabled={generateMutation.isPending}
                        className="flex-1"
                      >
                        {generateMutation.isPending ? 'Generating...' : 'Generate'}
                      </Button>
                    </Can>

                    {report.lastGenerated && (
                      <Can permission={PERMISSIONS.REPORTS_EXPORT}>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </Can>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reports found matching your criteria</p>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                📊 Export as Excel
              </Button>
              <Button variant="outline" className="justify-start">
                📄 Export as PDF
              </Button>
              <Button variant="outline" className="justify-start">
                📧 Email Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
