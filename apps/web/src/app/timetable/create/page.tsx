/**
 * Create Timetable Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { TimetableWizard } from '@/features/timetable/timetable-wizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { classService } from '@/services/class.service';
import { sectionService } from '@/services/section.service';

export default function CreateTimetablePage() {
  const router = useRouter();

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll({}),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => sectionService.getAll({}),
  });

  // Mock academic years - replace with actual service call
  const academicYears = [
    { id: '1', name: '2023-2024' },
    { id: '2', name: '2024-2025' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Timetable</h1>
        <p className="text-muted-foreground mt-2">
          Create a new timetable or auto-generate one
        </p>
      </div>

      <TimetableWizard
        classes={classes.map((c: any) => ({ id: c.id, name: c.name }))}
        sections={sections.map((s: any) => ({ id: s.id, name: s.name }))}
        academicYears={academicYears}
      />
    </div>
  );
}
