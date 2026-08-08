/**
 * Create Assignment Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { AssignmentForm } from '@/features/assignments/assignment-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { subjectService } from '@/services/subject.service';
import { sectionService } from '@/services/section.service';

export default function CreateAssignmentPage() {
  const router = useRouter();

  // Fetch subjects and sections for the form
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll({}),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => sectionService.getAll({}),
  });

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
        <h1 className="text-3xl font-bold">Create Assignment</h1>
        <p className="text-muted-foreground mt-2">
          Create a new assignment for your students
        </p>
      </div>

      <AssignmentForm
        subjects={subjects.map((s: any) => ({ id: s.id, name: s.name }))}
        sections={sections.map((s: any) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
