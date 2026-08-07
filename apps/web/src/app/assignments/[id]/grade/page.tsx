/**
 * Module 13: Assignments - Grading Interface
 * FR-ASSIGN-015: Grade student submissions with scores and feedback
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import { assignmentService } from '@/services/assignment.service';

export default function AssignmentGradingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [grades, setGrades] = useState<Record<string, { score: number; feedback: string }>>({});

  // Real API integration
  const { data: assignmentResponse, isLoading } = useQuery({
    queryKey: ['assignment-grading', params.id],
    queryFn: () => assignmentService.getAssignment(params.id),
    enabled: !!params.id,
  });

  const { data: submissionsResponse } = useQuery({
    queryKey: ['ungraded-submissions', params.id],
    queryFn: () => assignmentService.getSubmissions(params.id, { status: 'SUBMITTED' }),
    enabled: !!params.id,
  });

  // Transform API data
  const assignment = assignmentResponse || {
    id: params.id,
    title: '',
    totalMarks: 0,
    passingMarks: 0,
    submissions: [],
  };

  const submissions = Array.isArray(submissionsResponse)
    ? submissionsResponse
    : submissionsResponse?.submissions?.filter((s: any) => s.status === 'SUBMITTED') || [];


const currentSubmission = assignment?.submissions[currentSubmissionIndex];

const [score, setScore] = useState<string>('');
const [feedback, setFeedback] = useState<string>('');

const saveMutation = useMutation({
  mutationFn: async (data: { submissionId: string; score: number; feedback: string }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data;
  },
  onSuccess: (data) => {
    setGrades((prev) => ({
      ...prev,
      [data.submissionId]: { score: data.score, feedback: data.feedback },
    }));
    toast.success('Grade saved');
  },
  onError: () => {
    toast.error('Failed to save grade');
  },
});

const submitAllMutation = useMutation({
  mutationFn: async (allGrades: typeof grades) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return allGrades;
  },
  onSuccess: () => {
    toast.success('All grades submitted successfully');
    router.push(`/assignments/${params.id}`);
  },
  onError: () => {
    toast.error('Failed to submit grades');
  },
});

const handleSaveAndNext = () => {
  if (!assignment || !currentSubmission || !score) {
    toast.error('Please enter a score');
    return;
  }

  const scoreNum = parseFloat(score);
  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > assignment.totalMarks) {
    toast.error(`Score must be between 0 and ${assignment.totalMarks}`);
    return;
  }

  saveMutation.mutate({
    submissionId: currentSubmission.id,
    score: scoreNum,
    feedback,
  });

  // Move to next submission
  if (currentSubmissionIndex < assignment.submissions.length - 1) {
    const nextIndex = currentSubmissionIndex + 1;
    setCurrentSubmissionIndex(nextIndex);
    const nextSubmission = assignment.submissions[nextIndex];
    setScore(grades[nextSubmission.id]?.score?.toString() || '');
    setFeedback(grades[nextSubmission.id]?.feedback || '');
  }
};

const handlePrevious = () => {
  if (!assignment || currentSubmissionIndex <= 0) return;

  const prevIndex = currentSubmissionIndex - 1;
  setCurrentSubmissionIndex(prevIndex);
  const prevSubmission = assignment.submissions[prevIndex];
  setScore(grades[prevSubmission.id]?.score?.toString() || '');
  setFeedback(grades[prevSubmission.id]?.feedback || '');
};

const handleSubmitAll = () => {
  if (!assignment) return;

  const ungradedCount = assignment.submissions.length - Object.keys(grades).length;
  if (ungradedCount > 0) {
    if (!confirm(`${ungradedCount} submission(s) are not graded. Submit anyway?`)) {
      return;
    }
  }
  submitAllMutation.mutate(grades);
};

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

if (!assignment || assignment.submissions.length === 0) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-12">
        <p className="text-gray-600">No submissions to grade</p>
        <Button className="mt-4" onClick={() => router.push(`/assignments/${params.id}`)}>
          Back to Assignment
        </Button>
      </div>
    </div>
  );
}

const activeSubmission = assignment.submissions[currentSubmissionIndex];
if (!activeSubmission) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-12">
        <p className="text-gray-600">Submission not found</p>
        <Button className="mt-4" onClick={() => router.push(`/assignments/${params.id}`)}>
          Back to Assignment
        </Button>
      </div>
    </div>
  );
}

const gradedCount = Object.keys(grades).length;
const progress = Math.round((gradedCount / assignment.submissions.length) * 100);

return (
  <Can
    permission={PERMISSIONS.ASSIGNMENTS_GRADE}
    fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">You don't have permission to grade assignments</p>
          <Button className="mt-4" onClick={() => router.push(`/assignments/${params.id}`)}>
            Back to Assignment
          </Button>
        </div>
      </div>
    }
  >
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/assignments/${params.id}`)}>
            ← Back
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Submissions</h1>
            <p className="mt-2 text-sm text-gray-600">{assignment.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {gradedCount}/{assignment.submissions.length}
            </p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submission Navigation */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSubmissionIndex === 0}
            >
              ← Previous
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-600">Submission</p>
              <p className="text-lg font-bold text-gray-900">
                {currentSubmissionIndex + 1} of {assignment.submissions.length}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (currentSubmissionIndex < assignment.submissions.length - 1) {
                  setCurrentSubmissionIndex(currentSubmissionIndex + 1);
                  const nextSubmission = assignment.submissions[currentSubmissionIndex + 1];
                  setScore(grades[nextSubmission.id]?.score?.toString() || '');
                  setFeedback(grades[nextSubmission.id]?.feedback || '');
                }
              }}
              disabled={currentSubmissionIndex === assignment.submissions.length - 1}
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Info & Submission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {activeSubmission.student.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900">{activeSubmission.student.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-600">Roll No: {activeSubmission.student.rollNumber}</p>
                    <p className="text-sm text-gray-600">{activeSubmission.student.admissionNumber}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(activeSubmission.submittedAt).toLocaleString()}
                    </p>
                    {activeSubmission.lateSubmission && (
                      <Badge variant="warning">Late Submission</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Files */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Files ({activeSubmission.attachments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSubmission.attachments.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">PDF</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Viewer Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                  <p>PDF Viewer</p>
                  <Button className="mt-4" size="sm">
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Grading Form */}
        <div className="space-y-6">
          {/* Grading Card */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Grade & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score (out of {assignment.totalMarks}) *
                </label>
                <Input
                  type="number"
                  min="0"
                  max={assignment.totalMarks}
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Passing: {assignment.passingMarks}</span>
                  <span>Max: {assignment.totalMarks}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback to the student..."
                  rows={6}
                />
              </div>

              {/* Quick Feedback Templates */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Quick Feedback:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Excellent work!',
                    'Well done',
                    'Needs improvement',
                    'Good effort',
                    'Please revise',
                  ].map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setFeedback((prev) => (prev ? `${prev}\n${template}` : template))}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={handleSaveAndNext}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save & Next'}
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    if (score) {
                      saveMutation.mutate({
                        submissionId: activeSubmission.id,
                        score: parseFloat(score),
                        feedback,
                      });
                    }
                  }}
                  disabled={saveMutation.isPending}
                >
                  Save Only
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit All Button */}
          {gradedCount > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={handleSubmitAll}
                  disabled={submitAllMutation.isPending}
                >
                  {submitAllMutation.isPending ? 'Submitting...' : `Submit All Grades (${gradedCount})`}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  This will finalize and publish grades to students
                </p>
              </CardContent>
            </Card>
          )}

          {/* Grading Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Grading Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Graded</span>
                <span className="font-medium">{gradedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Remaining</span>
                <span className="font-medium">{assignment.submissions.length - gradedCount}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </Can>
);
}
