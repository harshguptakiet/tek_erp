/**
 * Exam Rankings Page
 * Display top performers and rankings
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { RankingsBoard } from '@/features/exams/rankings-board';
import { useGetExamRankings } from '@/features/exams/use-exams';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ExamRankingsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const { data: rankingsData, isLoading } = useGetExamRankings(examId);

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

  const {
    rankings = [],
    classRankings = [],
    sectionRankings = [],
    totalStudents = 0,
  } = rankingsData || {};

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
        <h1 className="text-3xl font-bold">Exam Rankings</h1>
        <p className="text-muted-foreground mt-2">
          Top performers and complete rankings
        </p>
      </div>

      <RankingsBoard
        examId={examId}
        rankings={rankings}
        classRankings={classRankings}
        sectionRankings={sectionRankings}
        totalStudents={totalStudents}
      />
    </div>
  );
}
