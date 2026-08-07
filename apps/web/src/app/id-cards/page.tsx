/**
 * Module 30: Certificates & ID Cards - ID Cards Management
 * FR-ID-001 to FR-ID-010: Generate and manage ID cards
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
  import {Badge} from '@/components/ui/badge';
  import {Input} from '@/components/ui/input';
  import {Select} from '@/components/ui/select';
  import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
  import {Can} from '@/components/auth/can';
  import {PERMISSIONS} from '@/config/permissions';
  import {academicService} from '@/services/academic.service';
  import {useAuthStore} from '@/stores/auth.store';
  import toast from 'react-hot-toast';

  export default function IDCardsPage() {
  const router = useRouter();
  const {user} = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardType, setSelectedCardType] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Real API integration
  const {data: templatesResponse, isLoading: templatesLoading } = useQuery({
    queryKey: ['id-card-templates', user?.schoolId, selectedCardType],
    queryFn: () =>
  academicService.listIDCardTemplates({
    schoolId: user?.schoolId,
  cardType: selectedCardType || undefined,
      }),
  enabled: !!user?.schoolId,
  });

  const {data: classesResponse } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
  enabled: !!user?.schoolId,
  });

  const {data: academicYearsResponse } = useQuery({
    queryKey: ['academic-years', user?.schoolId],
    queryFn: () => academicService.listAcademicYears(user?.schoolId || ''),
  enabled: !!user?.schoolId,
  });

  // Transform API data
  const templates = Array.isArray(templatesResponse)
  ? templatesResponse
  : templatesResponse?.data || [];
  const classes = Array.isArray(classesResponse) ? classesResponse : classesResponse?.data || [];
  const academicYears = Array.isArray(academicYearsResponse)
  ? academicYearsResponse
  : academicYearsResponse?.data || [];

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = template.templateName
  ?.toLowerCase()
  .includes(searchTerm.toLowerCase());
  return matchesSearch;
  });

  const handleBulkGenerate = () => {
    if (!selectedClass || !selectedYear) {
    toast.error('Please select class and academic year');
  return;
    }
  router.push(`/id-cards/bulk-generate?class=${selectedClass}&year=${selectedYear}`);
  };

  return (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ID Cards</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate and manage student and staff ID cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Can permission={PERMISSIONS.ID_CARDS_GENERATE}>
            <Button variant="outline" onClick={() => router.push('/id-cards/templates')}>
              Manage Templates
            </Button>
            <Button onClick={() => router.push('/id-cards/generate')}>
              + Generate ID Card
            </Button>
          </Can>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Total Templates</p>
          <p className="text-3xl font-bold text-gray-900">{templates.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Student Cards</p>
          <p className="text-3xl font-bold text-blue-600">
            {templates.filter((t: any) => t.cardType === 'STUDENT').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Staff Cards</p>
          <p className="text-3xl font-bold text-green-600">
            {templates.filter((t: any) => t.cardType === 'STAFF').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Active Cards</p>
          <p className="text-3xl font-bold text-purple-600">
            {templates.filter((t: any) => t.isActive).length}
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Bulk Generate Section */}
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Bulk Generate ID Cards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select class...</option>
            {classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Select>
          <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">Select academic year...</option>
            {academicYears.map((year: any) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </Select>
          <Select value={selectedCardType} onChange={(e) => setSelectedCardType(e.target.value)}>
            <option value="">Card type...</option>
            <option value="STUDENT">Student</option>
            <option value="STAFF">Staff</option>
          </Select>
          <Button
            onClick={handleBulkGenerate}
            disabled={!selectedClass || !selectedYear}
            className="w-full"
          >
            Bulk Generate
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select class and academic year to generate ID cards for all students in that class
        </p>
      </CardContent>
    </Card>

    {/* Search & Filter */}
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>

    {/* Templates Table */}
    <Card>
      <CardHeader>
        <CardTitle>ID Card Templates ({filteredTemplates.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {templatesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading templates...</p>
          </div>
        ) : filteredTemplates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Card Type</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template: any) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.templateName || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={template.cardType === 'STUDENT' ? 'info' : 'success'}
                    >
                      {template.cardType || 'STUDENT'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.layout?.orientation || 'Portrait'} •{' '}
                    {template.layout?.size || 'Standard'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? 'success' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.createdAt
                      ? new Date(template.createdAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/id-cards/templates/${template.id}`)}
                      >
                        View
                      </Button>
                      <Can permission={PERMISSIONS.ID_CARDS_GENERATE}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/id-cards/generate?template=${template.id}`)
                          }
                        >
                          Use Template
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
            <span className="text-6xl mb-4 block">🪪</span>
            <p className="text-gray-600">No ID card templates found</p>
            <Can permission={PERMISSIONS.ID_CARDS_GENERATE}>
              <Button className="mt-4" onClick={() => router.push('/id-cards/templates/create')}>
                Create First Template
              </Button>
            </Can>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
  );
}
