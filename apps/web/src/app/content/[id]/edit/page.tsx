/**
 * Module 05: Content Management - Edit Content
 * FR-CONTENT-003: Edit content item details
 */

'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { contentService } from '@/services/content.service';
import { academicService } from '@/services/academic.service';
import toast from 'react-hot-toast';

const contentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contentType: z.enum(['VIDEO', 'DOCUMENT', 'AUDIO', 'IMAGE', 'PRESENTATION', 'ARVR']),
  subjectId: z.string().optional(),
  tags: z.string().optional(),
});

type ContentForm = z.infer<typeof contentSchema>;

export default function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch content data
  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContent(id),
    enabled: !!id,
  });

  // Fetch subjects
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    values: content
      ? {
          title: content.title || '',
          description: content.description || '',
          contentType: content.contentType || 'DOCUMENT',
          subjectId: content.subjectId || '',
          tags: content.tags?.join(', ') || '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ContentForm) => {
      const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      return contentService.updateContent(id, { ...data, tags });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content updated successfully!');
      router.push(`/content/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update content');
    },
  });

  const onSubmit = (data: ContentForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Content not found</p>
          <Button className="mt-4" onClick={() => router.push('/content')}>
            Back to Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/content/${id}`)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit Content</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <Input {...register('title')} placeholder="Content title" />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea {...register('description')} rows={4} />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <Select {...register('contentType')}>
                  <option value="DOCUMENT">Document</option>
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                  <option value="IMAGE">Image</option>
                  <option value="PRESENTATION">Presentation</option>
                  <option value="ARVR">AR/VR</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select {...register('subjectId')}>
                  <option value="">No subject</option>
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <Input {...register('tags')} placeholder="e.g., physics, mechanics, motion" />
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas for better searchability
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/content/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update Content'}
          </Button>
        </div>
      </form>
    </div>
  );
}
