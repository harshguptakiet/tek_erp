/**
 * Exam Grading Page
 * Grade student exam attempts
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { GradingInterface } from '@/features/exams/grading-interface';
import { useGetExamAttempts } from '@/features/exams/use-exams';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ExamGradingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const { data: attempts = [], isLoading } = useGetExamAttempts(examId, {
    status: 'SUBMITTED',
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

  if (attempts.length === 0) {
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
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Submissions to Grade</h1>
          <p className="text-muted-foreground mb-6">
            There are no submitted attempts for this exam yet.
          </p>
          <Button onClick={() => router.push(`/exams/${examId}`)}>
            Back to Exam
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Grade Exam</h1>
        <p className="text-muted-foreground mt-2">
          Review and grade student submissions
        </p>
      </div>

      <GradingInterface examId={examId} attempts={attempts} />
    </div>
  );
}
