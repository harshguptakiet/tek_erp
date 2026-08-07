'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assignmentService } from '@/services/assignment.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const id = params?.id as string;

  const { data: assignment, isLoading, isError } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentService.getAssignment(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-48 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Assignment Not Found</h2>
        <p className="text-gray-500 mt-2">The requested assignment could not be loaded.</p>
        <Button className="mt-4" onClick={() => router.push('/assignments')}>
          Back to Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push('/assignments')}>
          ← Back to Assignments
        </Button>
        {user?.role === 'TEACHER' && (
          <Button onClick={() => router.push(`/assignments/${id}/grade`)}>
            Grade Submissions
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Subject: {assignment.subject || 'N/A'} | Class: {assignment.class || 'N/A'}
              </p>
            </div>
            <Badge variant={assignment.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {assignment.status || 'ACTIVE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-gray-700">Description</h3>
            <p className="text-gray-600 mt-1 whitespace-pre-wrap">
              {assignment.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
            <div>
              <span className="font-semibold text-gray-700">Assigned Date: </span>
              {assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Due Date: </span>
              {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Total Marks: </span>
              {assignment.totalMarks ?? 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}