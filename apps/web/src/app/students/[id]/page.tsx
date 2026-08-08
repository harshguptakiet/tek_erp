/**
 * Student Detail Page
 * Shows comprehensive student information with tabs
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { StudentDetails } from '@/features/students/student-details';
import {
  useStudent,
  useStudentDocuments,
  useStudentHealthRecords,
  useStudentAttendance,
  useStudentPerformance,
} from '@/features/students/use-students';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  const { data: documents = [] } = useStudentDocuments(studentId);
  const { data: healthRecords = [] } = useStudentHealthRecords(studentId);
  const { data: attendance } = useStudentAttendance(studentId);
  const { data: performance } = useStudentPerformance(studentId);

  if (studentLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Student Not Found</h1>
          <Button onClick={() => router.push('/students')}>
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

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

      <StudentDetails
        student={student}
        documents={documents}
        healthRecords={healthRecords}
        attendance={attendance}
        performance={performance}
        isLoading={false}
      />
    </div>
  );
}
