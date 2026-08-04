/**
 * Module 28: Analytics & Reporting - Reports Dashboard
 * FR-REPORTS-001: View and generate various reports
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Real API integration
  const { data: reportsResponse, isLoading } = useQuery({
    queryKey: ['reports', user?.schoolId, selectedCategory, selectedPeriod],
    queryFn: () =>
      analyticsService.getReports(user?.schoolId || '', {
        category: selectedCategory || undefined,
        period: selectedPeriod,
      }),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const reports = Array.isArray(reportsResponse)
    ? reportsResponse
    : reportsResponse?.reports || [];

  const reportCategories = [
    { id: 'academic', name: 'Academic Performance', icon: '📊', color: 'blue' },
    { id: 'attendance', name: 'Attendance', icon: '📅', color: 'green' },
    { id: 'financial', name: 'Financial', icon: '💰', color: 'purple' },
    { id: 'student', name: 'Student Reports', icon: '👨‍🎓', color: 'indigo' },
    { id: 'teacher', name: 'Teacher Reports', icon: '👨‍🏫', color: 'pink' },
    { id: 'infrastructure', name: 'Infrastructure', icon: '🏫', color: 'orange' },
  ];

  const handleGenerateReport = (reportType: string) => {
    toast.success(`Generating ${reportType} report...`);
    // In real implementation: trigger report generation
  };

  const handleDownload = (id: string, format: string) => {
    toast.success(`Downloading report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate and view comprehensive reports across all modules
        </p>
      </div>

      {/* Quick Generate Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {reportCategories.map((category) => (
          <Card
            key={category.id}
            className={`hover:shadow-lg transition-shadow cursor-pointer border-${category.color}-200`}
            onClick={() => handleGenerateReport(category.name)}
          >
            <CardContent className="pt-6 text-center">
              <span className="text-4xl mb-2 block">{category.icon}</span>
              <p className="text-sm font-medium text-gray-900">{category.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {reportCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
            <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Can permission={PERMISSIONS.REPORTS_GENERATE}>
              <Button variant="outline" onClick={() => router.push('/reports/custom')}>
                Create Custom Report
              </Button>
            </Can>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading reports...</p>
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">
                        {report.category === 'academic'
                          ? '📊'
                          : report.category === 'attendance'
                          ? '📅'
                          : report.category === 'financial'
                          ? '💰'
                          : '📄'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{report.title || 'Untitled Report'}</h4>
                      <p className="text-sm text-gray-600">
                        Generated on {new Date(report.generatedAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{report.category || 'General'}</Badge>
                      <Badge
                        variant={
                          report.status === 'ready'
                            ? 'success'
                            : report.status === 'processing'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {report.status || 'Ready'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/reports/${report.id}`)}
                    >
                      View
                    </Button>
                    <Can permission={PERMISSIONS.REPORTS_GENERATE}>
                      <Select
                        className="w-24"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDownload(report.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Export</option>
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </Select>
                    </Can>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <p className="text-gray-600">No reports available</p>
              <Can permission={PERMISSIONS.REPORTS_GENERATE}>
                <Button className="mt-4" onClick={() => router.push('/reports/custom')}>
                  Generate First Report
                </Button>
              </Can>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scheduled Reports</CardTitle>
            <Can permission={PERMISSIONS.REPORTS_GENERATE}>
              <Button variant="outline" size="sm" onClick={() => router.push('/reports/schedule')}>
                Manage Schedule
              </Button>
            </Can>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No scheduled reports configured</p>
            <p className="text-sm mt-2">Set up automated report generation on a schedule</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
