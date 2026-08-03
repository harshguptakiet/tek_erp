/**
 * Module 05: Content Management
 * FR-CONTENT-001 to FR-CONTENT-010: Learning Content Library
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function ContentPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Mock data
  const { data: contents, isLoading } = useQuery({
    queryKey: ['content', searchQuery, contentType, subjectFilter],
    queryFn: async () => [
      {
        id: '1',
        title: 'Introduction to Algebra',
        type: 'VIDEO',
        subject: 'Mathematics',
        class: 'Class 9',
        duration: '45 min',
        views: 1250,
        rating: 4.5,
        thumbnail: null,
        status: 'PUBLISHED',
      },
      {
        id: '2',
        title: 'Newton\'s Laws of Motion',
        type: 'DOCUMENT',
        subject: 'Physics',
        class: 'Class 11',
        duration: '20 pages',
        views: 850,
        rating: 4.8,
        thumbnail: null,
        status: 'PUBLISHED',
      },
      {
        id: '3',
        title: 'Virtual Lab - Chemistry Experiments',
        type: 'AR_VR',
        subject: 'Chemistry',
        class: 'Class 10',
        duration: 'Interactive',
        views: 620,
        rating: 4.9,
        thumbnail: null,
        status: 'PUBLISHED',
      },
      {
        id: '4',
        title: 'English Grammar Practice',
        type: 'QUIZ',
        subject: 'English',
        class: 'Class 8',
        duration: '30 questions',
        views: 2100,
        rating: 4.3,
        thumbnail: null,
        status: 'PUBLISHED',
      },
    ],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const videoContent = contents?.filter((c: any) => c.type === 'VIDEO') || [];
  const documentContent = contents?.filter((c: any) => c.type === 'DOCUMENT') || [];
  const arvrContent = contents?.filter((c: any) => c.type === 'AR_VR') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Content</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse and manage educational content library
            </p>
          </div>
          <Can permission={PERMISSIONS.CONTENT_CREATE}>
            <Button onClick={() => router.push('/content/create')}>
              Upload Content
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{contents?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{videoContent.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{documentContent.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">AR/VR</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{arvrContent.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                type="search"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="VIDEO">Videos</option>
                <option value="DOCUMENT">Documents</option>
                <option value="AR_VR">AR/VR</option>
                <option value="QUIZ">Quizzes</option>
                <option value="AUDIO">Audio</option>
              </Select>
            </div>
            <div>
              <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="all">All Subjects</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="english">English</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents?.map((content: any) => (
          <Card 
            key={content.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/content/${content.id}`)}
          >
            <CardContent className="pt-6">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {content.type === 'VIDEO' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  )}
                  {content.type === 'DOCUMENT' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                  {content.type === 'AR_VR' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </div>

              {/* Content Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{content.title}</h3>
                  <Badge variant={
                    content.type === 'VIDEO' ? 'info' :
                    content.type === 'DOCUMENT' ? 'secondary' :
                    content.type === 'AR_VR' ? 'success' :
                    'warning'
                  } className="ml-2">
                    {content.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{content.subject}</span>
                  <span>•</span>
                  <span>{content.class}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{content.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{content.views}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{content.rating}</span>
                  </div>
                  <Badge variant="success" className="text-xs">
                    {content.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
