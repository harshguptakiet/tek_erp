'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';
import { useGradeAttempt } from './use-exams';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const gradingSchema = z.object({
  marks: z.record(z.string(), z.number()),
  feedback: z.string().optional(),
  remarks: z.string().optional(),
});

type GradingFormData = z.infer<typeof gradingSchema>;

interface Attempt {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  startedAt: string;
  submittedAt?: string;
  obtainedMarks?: number;
  totalMarks: number;
  answers: Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    questionMarks: number;
    answer: string;
    isCorrect?: boolean;
    marksAwarded?: number;
  }>;
}

interface GradingInterfaceProps {
  examId: string;
  attempts: Attempt[];
}

export function GradingInterface({ examId, attempts }: GradingInterfaceProps) {
  const router = useRouter();
  const gradeAttempt = useGradeAttempt();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const currentAttempt = attempts[currentIndex];
  const currentQuestion = currentAttempt?.answers[questionIndex];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<GradingFormData>({
    resolver: zodResolver(gradingSchema),
    defaultValues: {
      marks: {},
    },
  });

  const marks = watch('marks');

  const getTotalAwarded = () => {
    return Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);
  };

  const onSubmit = async (data: GradingFormData) => {
    try {
      const totalMarks = getTotalAwarded();
      await gradeAttempt.mutateAsync({
        attemptId: currentAttempt.id,
        marks: data.marks,
        totalMarks,
        feedback: data.feedback,
        remarks: data.remarks,
      });
      
      toast.success('Grading saved successfully');
      
      // Move to next attempt
      if (currentIndex < attempts.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setQuestionIndex(0);
      } else {
        router.push(`/exams/${examId}`);
      }
    } catch (error) {
      toast.error('Failed to save grading');
    }
  };

  const handleQuestionGrade = (questionId: string, grade: number) => {
    setValue(`marks.${questionId}`, grade);
  };

  if (!currentAttempt) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No attempts to grade</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentAttempt.studentAvatar} alt={currentAttempt.studentName} />
              <AvatarFallback>
                {currentAttempt.studentName.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{currentAttempt.studentName}</h2>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="info">
                  Attempt {currentIndex + 1} of {attempts.length}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Submitted: {new Date(currentAttempt.submittedAt!).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold">
              {getTotalAwarded()} / {currentAttempt.totalMarks}
            </p>
            <p className="text-sm text-muted-foreground">Total Marks</p>
            <Progress 
              value={(getTotalAwarded() / currentAttempt.totalMarks) * 100} 
              className="w-32 mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Question Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuestionIndex(Math.max(0, questionIndex - 1))}
              disabled={questionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium">
              Question {questionIndex + 1} of {currentAttempt.answers.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuestionIndex(Math.min(currentAttempt.answers.length - 1, questionIndex + 1))}
              disabled={questionIndex === currentAttempt.answers.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            {currentAttempt.answers.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuestionIndex(idx)}
                className={`w-8 h-8 rounded ${
                  idx === questionIndex
                    ? 'bg-primary text-primary-foreground'
                    : marks[currentAttempt.answers[idx].questionId] !== undefined
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Question & Answer */}
      <Card className="p-6">
        <Tabs defaultValue="answer" className="w-full">
          <TabsList>
            <TabsTrigger value="answer">Student Answer</TabsTrigger>
            <TabsTrigger value="marking">Marking</TabsTrigger>
          </TabsList>

          <TabsContent value="answer" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="info">
                  {currentQuestion.questionType}
                </Badge>
                <span className="font-bold text-lg">
                  {currentQuestion.questionMarks} marks
                </span>
              </div>
              <p className="font-medium mt-2">{currentQuestion.questionText}</p>
            </div>

            <Separator />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Student's Answer:</h4>
              <div className="bg-white p-4 rounded border">
                {currentQuestion.answer ? (
                  <p className="whitespace-pre-wrap">{currentQuestion.answer}</p>
                ) : (
                  <p className="text-muted-foreground italic">No answer provided</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marking" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Marks Awarded (out of {currentQuestion.questionMarks})
                </label>
                <Input
                  type="number"
                  min="0"
                  max={currentQuestion.questionMarks}
                  value={marks[currentQuestion.questionId] || 0}
                  onChange={(e) => handleQuestionGrade(currentQuestion.questionId, Number(e.target.value))}
                  className="w-32"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuestionGrade(currentQuestion.questionId, 0)}
                >
                  0 marks
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuestionGrade(currentQuestion.questionId, currentQuestion.questionMarks / 2)}
                >
                  Half marks
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuestionGrade(currentQuestion.questionId, currentQuestion.questionMarks)}
                >
                  Full marks
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Overall Feedback */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Overall Feedback</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback</label>
            <Textarea
              {...register('feedback')}
              placeholder="Provide constructive feedback to the student..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Internal Remarks</label>
            <Textarea
              {...register('remarks')}
              placeholder="Internal notes (not visible to student)..."
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setQuestionIndex(0);
            }
          }}
          disabled={currentIndex === 0}
        >
          Previous Student
        </Button>

        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 
             currentIndex < attempts.length - 1 ? 'Save & Next' : 'Submit All Grades'}
          </Button>
        </div>
      </div>
    </form>
  );
}
