/**
 * Content Upload Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { ContentUploader } from '@/features/content/content-uploader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { subjectService } from '@/services/subject.service';
import { classService } from '@/services/class.service';

export default function ContentUploadPage() {
  const router = useRouter();

  const { data: subjectsResponse = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll({}),
  });

  const { data: classesResponse = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll({}),
  });

  // Handle paginated or direct array responses
  const subjects = Array.isArray(subjectsResponse) 
    ? subjectsResponse 
    : (subjectsResponse?.data || []);
  
  const classes = Array.isArray(classesResponse) 
    ? classesResponse 
    : (classesResponse?.data || []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload Content</h1>
        <p className="text-muted-foreground mt-2">
          Upload educational content for students
        </p>
      </div>

      <ContentUploader
        subjects={subjects.map((s: any) => ({ id: s.id, name: s.name }))}
        classes={classes.map((c: any) => ({ 
          id: c.id, 
          name: c.gradeName || `Grade ${c.grade}${c.stream ? ` - ${c.stream}` : ''}` 
        }))}
        onSuccess={() => router.push('/content')}
      />
    </div>
  );
}
