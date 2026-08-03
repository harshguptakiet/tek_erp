/**
 * Module 05: Content Management - Content Detail/Viewer Page
 * FR-CONTENT-001 to FR-CONTENT-020: Content viewing, interaction, and metadata
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock data - replace with actual API call
  const { data: content, isLoading } = useQuery({
    queryKey: ['content', params.id],
    queryFn: async () => ({
      id: params.id,
      title: 'Introduction to Photosynthesis',
      description: 'A comprehensive video explaining the process of photosynthesis in plants, including light and dark reactions, chlorophyll structure, and the Calvin cycle.',
      type: 'VIDEO',
      subject: 'Biology',
      class: 'Class 10',
      duration: 720, // seconds
      status: 'PUBLISHED',
      thumbnail: '/thumbnails/photosynthesis.jpg',
      url: 'https://example.com/content/photosynthesis.mp4',
      uploadedBy: {
        id: 'u1',
        name: 'Dr. Anjali Verma',
        role: 'Teacher',
      },
      uploadedAt: '2024-09-15T10:30:00Z',
      views: 1248,
      likes: 342,
      downloads: 89,
      rating: 4.7,
      totalRatings: 156,
      size: 128.5, // MB
      format: 'MP4',
      language: 'English',
      tags: ['Biology', 'Photosynthesis', 'Plants', 'Science', 'Class 10'],
      relatedContent: [
        {
          id: 'c2',
          title: 'Cellular Respiration',
          type: 'VIDEO',
          thumbnail: '/thumbnails/respiration.jpg',
          duration: 600,
          views: 980,
        },
        {
          id: 'c3',
          title: 'Plant Anatomy',
          type: 'DOCUMENT',
          thumbnail: '/thumbnails/plant-anatomy.jpg',
          pages: 24,
          views: 756,
        },
        {
          id: 'c4',
          title: '3D Plant Cell Model',
          type: 'AR_VR',
          thumbnail: '/thumbnails/plant-cell-3d.jpg',
          views: 523,
        },
      ],
      comments: [
        {
          id: 'cm1',
          user: 'Rahul Kumar',
          role: 'Student',
          text: 'Very clear explanation! Helped me understand the concept easily.',
          timestamp: '2024-09-16T14:20:00Z',
          likes: 12,
        },
        {
          id: 'cm2',
          user: 'Priya Sharma',
          role: 'Student',
          text: 'Can you make a video on dark reactions in more detail?',
          timestamp: '2024-09-17T09:15:00Z',
          likes: 8,
        },
      ],
      learningObjectives: [
        'Understand the importance of photosynthesis',
        'Explain the light and dark reactions',
        'Identify the role of chlorophyll',
        'Describe the Calvin cycle process',
      ],
      prerequisites: ['Basic cell structure', 'Plant biology fundamentals'],
    }),
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Content not found</p>
          <Button className="mt-4" onClick={() => router.push('/content')}>
            Back to Content Library
          </Button>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const typeColors = {
    VIDEO: 'info',
    DOCUMENT: 'secondary',
    AR_VR: 'info',
    QUIZ: 'warning',
    AUDIO: 'success',
  } as const;

  const statusColors = {
    PUBLISHED: 'success',
    DRAFT: 'secondary',
    UNDER_REVIEW: 'warning',
    ARCHIVED: 'secondary',
  } as const;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/content')}>
            ← Back to Library
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={typeColors[content.type as keyof typeof typeColors]}>
                {content.type}
              </Badge>
              <Badge variant={statusColors[content.status as keyof typeof statusColors]}>
                {content.status}
              </Badge>
              <span className="text-sm text-gray-600">{content.subject}</span>
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm text-gray-600">{content.class}</span>
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm text-gray-600">{content.views.toLocaleString()} views</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Can permission={PERMISSIONS.CONTENT_MANAGE}>
              <Button variant="outline" onClick={() => router.push(`/content/${params.id}/edit`)}>
                Edit
              </Button>
            </Can>
            <Button variant="outline">Share</Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Content Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {content.type === 'VIDEO' && (
                <div className="aspect-video bg-black relative">
                  {/* Video player placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {!isPlaying ? (
                      <Button
                        size="lg"
                        onClick={() => setIsPlaying(true)}
                        className="rounded-full h-20 w-20"
                      >
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </Button>
                    ) : (
                      <div className="text-white text-center">
                        <p>Video Player</p>
                        <p className="text-sm mt-2">Integrated video player will be here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {content.type === 'DOCUMENT' && (
                <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                    </svg>
                    <p>Document Viewer</p>
                    <Button className="mt-4">Open PDF</Button>
                  </div>
                </div>
              )}
              {content.type === 'AR_VR' && (
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.74 6H3.26C2.01 6 1 7.01 1 8.26v7.48C1 16.99 2.01 18 3.26 18h17.48C21.99 18 23 16.99 23 15.74V8.26C23 7.01 21.99 6 20.74 6zM7 14.5c-1.38 0-2.5-1.12-2.5-2.5S5.62 9.5 7 9.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm10 0c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <p className="text-xl font-bold">AR/VR Experience</p>
                    <Button className="mt-4">Launch 3D Viewer</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description and Details */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>About this content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{content.description}</p>

              {content.learningObjectives.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Learning Objectives:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {content.learningObjectives.map((objective, idx) => (
                      <li key={idx} className="text-gray-700">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {content.prerequisites.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Prerequisites:</p>
                  <div className="flex flex-wrap gap-2">
                    {content.prerequisites.map((prereq, idx) => (
                      <Badge key={idx} variant="secondary">{prereq}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="font-semibold text-gray-900 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Comments ({content.comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.comments.map((comment: any) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {comment.user.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{comment.user}</p>
                          <Badge variant="secondary" className="text-xs">{comment.role}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="text-sm text-gray-600 hover:text-blue-600">
                            👍 {comment.likes}
                          </button>
                          <button className="text-sm text-gray-600 hover:text-blue-600">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Views</span>
                <span className="font-semibold">{content.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Likes</span>
                <span className="font-semibold">{content.likes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Downloads</span>
                <span className="font-semibold">{content.downloads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="font-semibold">⭐ {content.rating} ({content.totalRatings})</span>
              </div>
              {content.type === 'VIDEO' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="font-semibold">{formatDuration(content.duration)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Uploaded by</p>
                <p className="font-semibold text-gray-900">{content.uploadedBy.name}</p>
                <Badge variant="secondary" className="mt-1">{content.uploadedBy.role}</Badge>
              </div>
              <div>
                <p className="text-gray-600">Uploaded on</p>
                <p className="font-semibold text-gray-900">
                  {new Date(content.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">File size</p>
                <p className="font-semibold text-gray-900">{content.size} MB</p>
              </div>
              <div>
                <p className="text-gray-600">Format</p>
                <p className="font-semibold text-gray-900">{content.format}</p>
              </div>
              <div>
                <p className="text-gray-600">Language</p>
                <p className="font-semibold text-gray-900">{content.language}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button className="w-full" variant="outline">
                👍 Like
              </Button>
              <Button className="w-full" variant="outline">
                💾 Save to Library
              </Button>
              <Button className="w-full" variant="outline">
                📥 Download
              </Button>
              <Button className="w-full" variant="outline">
                🏴 Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Content */}
      {content.relatedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.relatedContent.map((related: any) => (
                <div
                  key={related.id}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/content/${related.id}`)}
                >
                  <div className="aspect-video bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <span className="text-gray-400">Thumbnail</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {related.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={typeColors[related.type as keyof typeof typeColors]} className="text-xs">
                      {related.type}
                    </Badge>
                    <span className="text-xs text-gray-500">{related.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
