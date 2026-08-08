/**
 * Create Student Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { StudentForm } from '@/features/students/student-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function CreateStudentPage() {
  const router = useRouter();
  const { user } = useAuthStore();

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
        <h1 className="text-3xl font-bold">Add New Student</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the student information below
        </p>
      </div>

      <StudentForm schoolId={user?.schoolId || ''} />
    </div>
  );
}
