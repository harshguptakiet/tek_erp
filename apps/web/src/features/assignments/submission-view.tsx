'use client';

import { useAssignmentSubmissions, useGradeSubmission } from './use-assignments';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface SubmissionViewProps {
  assignmentId: string;
}

export function SubmissionView({ assignmentId }: SubmissionViewProps) {
  const { data: submissions, isLoading } = useAssignmentSubmissions(assignmentId);
  const gradeSubmission = useGradeSubmission();
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [marks, setMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');

  if (isLoading) {
    return <SubmissionViewSkeleton />;
  }

  const handleGrade = async (submissionId: string) => {
    await gradeSubmission.mutateAsync({
      submissionId,
      data: { marksObtained: marks, feedback },
    });
    setGradingSubmission(null);
    setMarks(0);
    setFeedback('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'GRADED':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'LATE':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-green-100 text-green-800';
      case 'GRADED':
        return 'bg-blue-100 text-blue-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Submissions</h2>
          <div className="text-sm text-muted-foreground">
            {submissions?.length || 0} submissions
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {submissions?.map((submission: any) => (
              <Card key={submission.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar>
                      <AvatarImage src={submission.student?.avatar} />
                      <AvatarFallback>
                        {submission.student?.firstName[0]}
                        {submission.student?.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          {submission.student?.firstName} {submission.student?.lastName}
                        </h3>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        {getStatusIcon(submission.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {submission.content && (
                        <p className="text-sm mt-2">{submission.content}</p>
                      )}
                      {submission.attachments?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {submission.attachments.map((file: string, idx: number) => (
                            <Button key={idx} variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              {file}
                            </Button>
                          ))}
                        </div>
                      )}

                      {submission.status === 'GRADED' && submission.grade && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Grade</span>
                            <span className="text-lg font-bold">
                              {submission.marksObtained}/{submission.assignment?.totalMarks}
                            </span>
                          </div>
                          {submission.feedback && (
                            <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                          )}
                        </div>
                      )}

                      {gradingSubmission === submission.id && (
                        <div className="mt-4 p-4 border rounded-lg space-y-4">
                          <div>
                            <label className="text-sm font-medium">Marks Obtained</label>
                            <Input
                              type="number"
                              value={marks}
                              onChange={(e) => setMarks(Number(e.target.value))}
                              max={submission.assignment?.totalMarks}
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Feedback</label>
                            <Textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={3}
                              placeholder="Provide feedback..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleGrade(submission.id)} size="sm">
                              Submit Grade
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setGradingSubmission(null)}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {submission.status !== 'GRADED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGradingSubmission(submission.id)}
                      >
                        Grade
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function SubmissionViewSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
