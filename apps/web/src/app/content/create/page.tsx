/**
 * Module 05: Content Management - Create Content
 * FR-CONTENT-001 to FR-CONTENT-010: Upload and manage learning content
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

// Validation schema
const contentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contentType: z.enum(['VIDEO', 'DOCUMENT', 'PRESENTATION', 'AUDIO', 'IMAGE', 'AR_VR', 'LINK']),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().optional(),
  topicId: z.string().optional(),
  tags: z.string().optional(),
  duration: z.number().optional(),
  fileUrl: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  language: z.string(),
  isPublic: z.boolean(),
  allowDownload: z.boolean(),
});

type ContentForm = z.infer<typeof contentSchema>;

export default function CreateContentPage() {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ContentForm>({
    resolver: formResolver(contentSchema),
    defaultValues: {
      contentType: 'DOCUMENT',
      difficulty: 'INTERMEDIATE',
      language: 'English',
      isPublic: false,
      allowDownload: true,
    },
  });

  const contentType = watch('contentType');

  // Mock data - replace with actual API calls
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => [
      { id: 'sub1', name: 'Mathematics', code: 'MATH' },
      { id: 'sub2', name: 'Physics', code: 'PHY' },
      { id: 'sub3', name: 'Chemistry', code: 'CHEM' },
      { id: 'sub4', name: 'English', code: 'ENG' },
      { id: 'sub5', name: 'Biology', code: 'BIO' },
    ],
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate file upload
      setIsUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setValue('fileUrl', `https://cdn.example.com/uploads/${file.name}`);
            toast.success('File uploaded successfully');
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: ContentForm) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { id: 'new-content-id', ...data };
    },
    onSuccess: (data) => {
      toast.success('Content created successfully');
      router.push(`/content/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create content');
    },
  });

  const onSubmit = (data: ContentForm) => {
    createMutation.mutate(data);
  };

  return (
    <Can
      permission={PERMISSIONS.CONTENT_CREATE}
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create content</p>
            <Button className="mt-4" onClick={() => router.push('/content')}>
              Back to Content Library
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/content')}>
              ← Back to Content Library
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Learning Content</h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload and share educational materials with students
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Title *
                </label>
                <Input {...register('title')} placeholder="e.g., Introduction to Algebra" />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Provide a detailed description of the content..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type *
                  </label>
                  <Select {...register('contentType')}>
                    <option value="VIDEO">📹 Video</option>
                    <option value="DOCUMENT">📄 Document (PDF, Word)</option>
                    <option value="PRESENTATION">📊 Presentation (PPT, Slides)</option>
                    <option value="AUDIO">🎵 Audio</option>
                    <option value="IMAGE">🖼️ Image</option>
                    <option value="AR_VR">🥽 AR/VR Experience</option>
                    <option value="LINK">🔗 External Link</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level *
                  </label>
                  <Select {...register('difficulty')}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <Select {...register('subjectId')}>
                    <option value="">Select Subject</option>
                    {subjectsData?.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </Select>
                  {errors.subjectId && (
                    <p className="text-sm text-red-600 mt-1">{errors.subjectId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class (Optional)
                  </label>
                  <Select {...register('classId')}>
                    <option value="">All Classes</option>
                    {classesData?.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language *
                  </label>
                  <Select {...register('language')}>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    {...register('duration', { valueAsNumber: true })}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <Input
                  {...register('tags')}
                  placeholder="e.g., algebra, equations, mathematics"
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload/Link Section */}
          <Card>
            <CardHeader>
              <CardTitle>Content File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contentType === 'LINK' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External URL *
                  </label>
                  <Input
                    type="url"
                    {...register('externalUrl')}
                    placeholder="https://example.com/content"
                  />
                  {errors.externalUrl && (
                    <p className="text-sm text-red-600 mt-1">{errors.externalUrl.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-2xl">📄</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-600">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                          >
                            Remove
                          </Button>
                        </div>
                        {isUploading && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Uploading...</span>
                              <span className="text-sm font-medium">{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept={
                            contentType === 'VIDEO' ? 'video/*' :
                            contentType === 'AUDIO' ? 'audio/*' :
                            contentType === 'IMAGE' ? 'image/*' :
                            contentType === 'DOCUMENT' ? '.pdf,.doc,.docx' :
                            contentType === 'PRESENTATION' ? '.ppt,.pptx' :
                            '*'
                          }
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex flex-col items-center"
                        >
                          <span className="text-4xl mb-2">📁</span>
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            Click to upload
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            or drag and drop your file here
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...register('isPublic')}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Make this content publicly accessible
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowDownload"
                  {...register('allowDownload')}
                  className="rounded"
                />
                <label htmlFor="allowDownload" className="text-sm font-medium text-gray-700">
                  Allow students to download this content
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/content')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending || isUploading}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Content'}
            </Button>
          </div>
        </form>
      </div>
    </Can>
  );
}
