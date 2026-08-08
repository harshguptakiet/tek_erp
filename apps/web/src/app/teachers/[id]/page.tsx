/**
 * Teacher Detail Page
 * Shows comprehensive teacher information with tabs
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { TeacherDetails } from '@/features/teachers/teacher-details';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <TeacherDetails teacherId={teacherId} />
    </div>
  );
}
