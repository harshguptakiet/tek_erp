/**
 * Module 05: Content Management - Resources Library
 * FR-RESOURCES-001: Browse and manage learning resources
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { contentService } from '@/services/content.service';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

export default function ResourcesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Real API integration
  const { data: resourcesResponse, isLoading } = useQuery({
    queryKey: ['resources', user?.schoolId, selectedType, selectedSubject],
    queryFn: () =>
      contentService.listContent({
        schoolId: user?.schoolId,
        contentType: selectedType || undefined,
        subjectId: selectedSubject || undefined,
      }),
    enabled: !!user?.schoolId,
  });

  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  // Transform API data
  const resources = Array.isArray(resourcesResponse)
    ? resourcesResponse
    : resourcesResponse?.data || [];
  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data || [];

  const filteredResources = resources.filter((resource: any) => {
    const matchesSearch =
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDownload = (id: string) => {
    toast.success('Downloading resource...');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resources Library</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse and access learning resources and materials
            </p>
          </div>
          <Can permission={PERMISSIONS.CONTENT_CREATE}>
            <Button onClick={() => router.push('/resources/upload')}>
              + Upload Resource
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Resources</p>
            <p className="text-3xl font-bold text-gray-900">{resources.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Documents</p>
            <p className="text-3xl font-bold text-blue-600">
              {resources.filter((r: any) => r.fileType?.includes('pdf') || r.contentType === 'DOCUMENT').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Videos</p>
            <p className="text-3xl font-bold text-purple-600">
              {resources.filter((r: any) => r.contentType === 'VIDEO').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Downloads</p>
            <p className="text-3xl font-bold text-green-600">
              {resources.reduce((sum: number, r: any) => sum + (r.downloadCount || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((subject: any) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
            <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">All Types</option>
              <option value="DOCUMENT">Documents</option>
              <option value="VIDEO">Videos</option>
              <option value="AUDIO">Audio</option>
              <option value="IMAGE">Images</option>
              <option value="PRESENTATION">Presentations</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resources ({filteredResources.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading resources...</p>
            </div>
          ) : filteredResources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource: any) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>
                          {resource.contentType === 'VIDEO'
                            ? '🎥'
                            : resource.contentType === 'DOCUMENT'
                            ? '📄'
                            : resource.contentType === 'AUDIO'
                            ? '🎵'
                            : resource.contentType === 'IMAGE'
                            ? '🖼️'
                            : '📎'}
                        </span>
                        {resource.title || 'Untitled'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {resource.contentType || 'FILE'}
                      </Badge>
                    </TableCell>
                    <TableCell>{resource.subjectName || '-'}</TableCell>
                    <TableCell>
                      {resource.fileSize
                        ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB`
                        : '-'}
                    </TableCell>
                    <TableCell>{resource.downloadCount || 0}</TableCell>
                    <TableCell>
                      {resource.createdAt
                        ? new Date(resource.createdAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/resources/${resource.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(resource.id)}
                        >
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📚</span>
              <p className="text-gray-600">No resources found</p>
              <Can permission={PERMISSIONS.CONTENT_CREATE}>
                <Button className="mt-4" onClick={() => router.push('/resources/upload')}>
                  Upload First Resource
                </Button>
              </Can>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
