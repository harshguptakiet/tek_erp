'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryService } from '@/services/library.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Calendar,
  User,
  Hash,
  Tag,
  AlertCircle,
  CheckCircle,
  Edit,
} from 'lucide-react';
import { useState } from 'react';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const bookId = params.id as string;
  const [issueUserId, setIssueUserId] = useState('');

  // Fetch book details
  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => libraryService.getBook(bookId),
    enabled: !!bookId,
  });

  // Fetch current issues
  const { data: currentIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['book-issues', bookId],
    queryFn: async () => {
      const response = await fetch(`/api/library/books/${bookId}/issues`);
      return response.json();
    },
    enabled: !!bookId,
  });

  // Issue book mutation
  const issueMutation = useMutation({
    mutationFn: (data: { bookId: string; userId: string; dueDate: string }) =>
      libraryService.issueBook(data),
    onSuccess: () => {
      toast.success('Book issued successfully');
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book-issues', bookId] });
      setIssueUserId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    },
  });

  // Return book mutation
  const returnMutation = useMutation({
    mutationFn: (issueId: string) => libraryService.returnBook(issueId),
    onSuccess: () => {
      toast.success('Book returned successfully');
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book-issues', bookId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to return book');
    },
  });

  const handleIssueBook = () => {
    if (!issueUserId) {
      toast.error('Please enter a user ID');
      return;
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    issueMutation.mutate({
      bookId,
      userId: issueUserId,
      dueDate: dueDate.toISOString(),
    });
  };

  if (isLoading || issuesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Book not found</p>
            <Button onClick={() => router.push('/library')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableCopies = book.quantity - (currentIssues?.length || 0);
  const isAvailable = availableCopies > 0;

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/library')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <p className="text-muted-foreground">by {book.author}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/library/${bookId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Book
        </Button>
      </div>

      {/* Availability Status */}
      <div className="mb-6">
        <Badge
          variant={isAvailable ? 'default' : 'secondary'}
          className={isAvailable ? 'bg-green-500' : 'bg-red-500'}
        >
          {isAvailable ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              {availableCopies} Available
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Available
            </>
          )}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>Author</span>
                </div>
                <p className="font-semibold">{book.author}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Hash className="h-4 w-4" />
                  <span>ISBN</span>
                </div>
                <p className="font-mono text-sm">{book.isbn || 'N/A'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Tag className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <Badge variant="outline">{book.category}</Badge>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Publisher</span>
                </div>
                <p className="font-semibold">{book.publisher || 'N/A'}</p>
              </div>

              {book.publishedYear && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Published Year</span>
                  </div>
                  <p className="font-semibold">{book.publishedYear}</p>
                </div>
              )}

              {book.edition && (
                <div>
                  <p className="text-sm text-muted-foreground">Edition</p>
                  <p className="font-semibold">{book.edition}</p>
                </div>
              )}
            </div>

            {book.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed">{book.description}</p>
              </div>
            )}

            {book.language && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Language</p>
                <p className="font-semibold">{book.language}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copy Management */}
        <Card>
          <CardHeader>
            <CardTitle>Copy Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-3xl font-bold">{book.quantity}</p>
              <p className="text-sm text-muted-foreground">Total Copies</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Issued</span>
                <span className="font-semibold">{currentIssues?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className="font-semibold text-green-600">{availableCopies}</span>
              </div>
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${((currentIssues?.length || 0) / book.quantity) * 100}%`,
                }}
              />
            </div>

            {book.shelfLocation && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Shelf Location</p>
                <p className="font-mono font-semibold">{book.shelfLocation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Book Form */}
        {isAvailable && user?.permissions?.includes('library.issue') && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Issue Book</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="userId">Student/Staff ID</Label>
                  <Input
                    id="userId"
                    value={issueUserId}
                    onChange={(e) => setIssueUserId(e.target.value)}
                    placeholder="Enter user ID or admission number"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleIssueBook}
                    disabled={issueMutation.isPending || !issueUserId}
                  >
                    {issueMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Issue Book
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Default due date: 14 days from issue date
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current Issues */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Current Issues ({currentIssues?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {currentIssues && currentIssues.length > 0 ? (
              <div className="space-y-3">
                {currentIssues.map((issue: any) => {
                  const isOverdue = new Date(issue.dueDate) < new Date();
                  const daysOverdue = isOverdue
                    ? Math.floor(
                        (new Date().getTime() - new Date(issue.dueDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0;

                  return (
                    <div
                      key={issue.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isOverdue ? 'border-red-200 bg-red-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{issue.user?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {issue.user?.type} • ID: {issue.user?.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Issue Date</p>
                          <p className="font-semibold">
                            {new Date(issue.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p
                            className={`font-semibold ${
                              isOverdue ? 'text-red-600' : ''
                            }`}
                          >
                            {new Date(issue.dueDate).toLocaleDateString()}
                            {isOverdue && (
                              <span className="block text-xs">
                                ({daysOverdue} days overdue)
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isOverdue ? 'destructive' : 'outline'}
                          onClick={() => returnMutation.mutate(issue.id)}
                          disabled={returnMutation.isPending}
                        >
                          {returnMutation.isPending && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          Return
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No copies currently issued
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
