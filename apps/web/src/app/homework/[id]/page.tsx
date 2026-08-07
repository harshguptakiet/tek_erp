'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { assignmentService } from '@/services/assignment.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Download,
} from 'lucide-react';

export default function HomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const homeworkId = params.id as string;

  // Fetch homework details
  const { data: homework, isLoading } = useQuery({
    queryKey: ['homework', homeworkId],
    queryFn: () => assignmentService.getHomework(homeworkId),
    enabled: !!homeworkId,
  });

  // Fetch submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['homework-submissions', homeworkId],
    queryFn: () => assignmentService.getHomeworkSubmissions(homeworkId),
    enabled: !!homeworkId,
  });

  if (isLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Homework not found</p>
            <Button onClick={() => router.push('/homework')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Homework
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dueDate = new Date(homework.dueDate);
  const isOverdue = dueDate < new Date() && homework.status !== 'completed';
  const totalStudents = homework.targetStudents || 0;
  const submittedCount = submissions?.filter((s: any) => s.status === 'submitted').length || 0;
  const gradedCount = submissions?.filter((s: any) => s.status === 'graded').length || 0;
  const submissionRate = totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0;

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/homework')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{homework.title}</h1>
              <p className="text-muted-foreground">
                {homework.subject?.name} • {homework.class?.name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {user?.permissions?.includes('homework.edit') && (
            <Button onClick={() => router.push(`/homework/${homeworkId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {user?.permissions?.includes('homework.grade') && submittedCount > 0 && (
            <Button onClick={() => router.push(`/homework/${homeworkId}/grade`)}>
              Grade Submissions
            </Button>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 mb-6">
        <Badge
          variant={
            homework.status === 'active'
              ? 'default'
              : homework.status === 'completed'
                ? 'secondary'
                : 'outline'
          }
        >
          {homework.status?.toUpperCase()}
        </Badge>
        {isOverdue && (
          <Badge variant="destructive" className="bg-red-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            OVERDUE
          </Badge>
        )}
        <Badge variant="outline">
          {homework.difficulty || 'Medium'} Difficulty
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Homework Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            {homework.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {homework.description}
                </p>
              </div>
            )}

            {/* Instructions */}
            {homework.instructions && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Instructions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {homework.instructions}
                  </p>
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            {homework.objectives && homework.objectives.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Learning Objectives</h3>
                <ul className="space-y-2">
                  {homework.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attachments */}
            {homework.attachments && homework.attachments.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Attachments</h3>
                <div className="space-y-2">
                  {homework.attachments.map((file: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.size || 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {homework.references && homework.references.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Reference Materials</h3>
                <ul className="list-disc list-inside space-y-1">
                  {homework.references.map((ref: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Key Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Assigned On</span>
                </div>
                <p className="font-semibold">
                  {new Date(homework.assignedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Due Date</span>
                </div>
                <p className={`font-semibold ${isOverdue ? 'text-red-600' : ''}`}>
                  {dueDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {isOverdue && (
                  <p className="text-xs text-red-600 mt-1">
                    Overdue by{' '}
                    {Math.ceil(
                      (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                )}
              </div>

              {homework.estimatedTime && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Time</p>
                  <p className="font-semibold">{homework.estimatedTime} minutes</p>
                </div>
              )}

              {homework.maxMarks && (
                <div>
                  <p className="text-sm text-muted-foreground">Maximum Marks</p>
                  <p className="font-semibold">{homework.maxMarks}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Teacher</p>
                <p className="font-semibold">{homework.teacher?.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Submission Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submission Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-3xl font-bold">{submittedCount}</p>
                <p className="text-sm text-muted-foreground">
                  of {totalStudents} submitted
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submission Rate</span>
                  <span className="font-semibold">{submissionRate.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${submissionRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Submitted
                  </span>
                  <span className="font-semibold">{submittedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Graded
                  </span>
                  <span className="font-semibold">{gradedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-gray-400" />
                    Pending
                  </span>
                  <span className="font-semibold">
                    {totalStudents - submittedCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        {user?.role?.includes('teacher') && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Student Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {submissions && submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((submission: any) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-sm">
                            {submission.student?.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{submission.student?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.student?.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="font-semibold text-sm">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            submission.status === 'graded'
                              ? 'default'
                              : submission.status === 'submitted'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {submission.status}
                        </Badge>
                        {submission.grade !== null && submission.grade !== undefined && (
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {submission.grade}/{homework.maxMarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No submissions yet
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
