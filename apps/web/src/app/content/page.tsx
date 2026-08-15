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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { contentService } from '@/services/content.service';

const MOCK_LEARNING_CONTENT = [
  {
    id: 'cnt-1',
    title: 'Next.js 16 App Router & Microservices Architecture',
    contentType: 'VIDEO',
    board: 'Computer Science',
    grade: 'Advanced',
    duration: '4h 30m',
    viewCount: 2450,
    rating: '4.9 ★',
    status: 'ACTIVE',
    progress: 68,
  },
  {
    id: 'cnt-2',
    title: 'PostgreSQL Advanced Indexing & Query Performance Guide',
    contentType: 'DOCUMENT',
    board: 'Database Systems',
    grade: 'Intermediate',
    duration: '45 Pages',
    viewCount: 1890,
    rating: '5.0 ★',
    status: 'COMPLETED',
    progress: 100,
  },
  {
    id: 'cnt-3',
    title: 'Node.js Event Loop & Microservice Message Queue Architecture',
    contentType: 'VIDEO',
    board: 'Backend Engineering',
    grade: 'Advanced',
    duration: '3h 15m',
    viewCount: 1200,
    rating: '4.8 ★',
    status: 'ACTIVE',
    progress: 45,
  },
  {
    id: 'cnt-4',
    title: 'System Design Architecture Blueprints & Case Studies',
    contentType: 'DOCUMENT',
    board: 'Software Engineering',
    grade: 'Expert',
    duration: '60 Pages',
    viewCount: 3100,
    rating: '4.9 ★',
    status: 'COMPLETED',
    progress: 100,
  },
  {
    id: 'cnt-5',
    title: 'AR/VR Virtual Physics & Interactive Simulation Lab',
    contentType: 'AR_VR',
    board: 'Applied Science',
    grade: 'All Levels',
    duration: 'Interactive',
    viewCount: 950,
    rating: '4.7 ★',
    status: 'ACTIVE',
    progress: 30,
  },
];

export default function ContentPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Real API integration
  const { data: contentsResponse, isLoading } = useQuery({
    queryKey: ['content', searchQuery, contentType, subjectFilter],
    queryFn: () =>
      contentService.searchContent({
        query: searchQuery || undefined,
        contentType: contentType !== 'all' ? contentType : undefined,
        subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
      }),
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

  // Extract data array from paginated response with mock fallback
  const apiContents = contentsResponse?.data || [];
  const contents = apiContents.length > 0 ? apiContents : MOCK_LEARNING_CONTENT;
  const videoContent = contents.filter((c: any) => c.contentType === 'VIDEO');
  const documentContent = contents.filter(
    (c: any) => c.contentType === 'DOCUMENT',
  );
  const arvrContent = contents.filter((c: any) => c.contentType === 'AR_VR');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              Learning Content
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
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
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Content</p>
              <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-1">
                {contents.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Videos</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {videoContent.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Documents</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {documentContent.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">AR/VR</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {arvrContent.length}
              </p>
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
              <select
                className="flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] [&_option]:bg-[hsl(var(--card))] [&_option]:text-[hsl(var(--foreground))]"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="VIDEO">Videos</option>
                <option value="DOCUMENT">Documents</option>
                <option value="AR_VR">AR/VR</option>
                <option value="QUIZ">Quizzes</option>
                <option value="AUDIO">Audio</option>
              </select>
            </div>
            <div>
              <select
                className="flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] [&_option]:bg-[hsl(var(--card))] [&_option]:text-[hsl(var(--foreground))]"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content: any) => (
          <Card
            key={content.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/content/${content.id}`)}
          >
            <CardContent className="pt-6">
              {/* Thumbnail */}
              <div className="aspect-video bg-[hsl(var(--muted))] rounded-lg mb-4 flex items-center justify-center border border-[hsl(var(--border))]">
                <svg
                  className="w-12 h-12 text-[hsl(var(--muted-foreground))]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {content.contentType === 'VIDEO' && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  )}
                  {content.contentType === 'DOCUMENT' && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  )}
                  {content.contentType === 'AR_VR' && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
              </div>

              {/* Content Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-[hsl(var(--foreground))] line-clamp-2">
                    {content.title}
                  </h3>
                  <Badge
                    variant={
                      content.contentType === 'VIDEO'
                        ? 'info'
                        : content.contentType === 'DOCUMENT'
                          ? 'secondary'
                          : content.contentType === 'AR_VR'
                            ? 'success'
                            : 'warning'
                    }
                    className="ml-2"
                  >
                    {content.contentType}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <span>{content.board || 'N/A'}</span>
                  <span>•</span>
                  <span>Grade {content.grade || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{content.duration || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>{content.viewCount || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {content.rating}
                    </span>
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
