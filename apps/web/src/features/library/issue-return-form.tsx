/**
 * Issue/Return Book Form Component
 * Handle book issue and return operations
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  BookMarked,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  IndianRupee,
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

const issueSchema = z.object({
  bookId: z.string().min(1, 'Book is required'),
  memberId: z.string().min(1, 'Member is required'),
  dueDate: z.string().min(1, 'Due date is required'),
});

const returnSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  condition: z.enum(['good', 'fair', 'damaged']),
  remarks: z.string().optional(),
});

type IssueFormData = z.infer<typeof issueSchema>;
type ReturnFormData = z.infer<typeof returnSchema>;

interface IssueReturnFormProps {
  onSubmit: (data: any, type: 'issue' | 'return') => Promise<void>;
  onCancel: () => void;
}

export function IssueReturnForm({ onSubmit, onCancel }: IssueReturnFormProps) {
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [fine, setFine] = useState(0);

  const issueForm = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      bookId: '',
      memberId: '',
      dueDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'), // Default 14 days
    },
  });

  const returnForm = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      transactionId: '',
      condition: 'good',
      remarks: '',
    },
  });

  // Mock search functions
  const searchBook = (query: string) => {
    // Mock book data
    setSelectedBook({
      id: '1',
      isbn: '978-0-13-468599-1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      availableCopies: 2,
    });
  };

  const searchMember = (query: string) => {
    // Mock member data
    setSelectedMember({
      id: '1',
      name: 'John Doe',
      membershipId: 'LIB-2026-001',
      type: 'Student',
      issuedBooks: 2,
      maxBooks: 5,
    });
  };

  const searchTransaction = (transactionId: string) => {
    // Mock transaction data
    const transaction = {
      id: transactionId,
      book: {
        title: 'Clean Code',
        author: 'Robert C. Martin',
      },
      member: {
        name: 'John Doe',
        membershipId: 'LIB-2026-001',
      },
      issueDate: '2026-07-20',
      dueDate: '2026-08-03',
      isOverdue: true,
      overdueDays: 4,
    };
    setSelectedTransaction(transaction);
    
    // Calculate fine (₹5 per day)
    if (transaction.isOverdue) {
      setFine(transaction.overdueDays * 5);
    }
  };

  const handleIssueSubmit = async (data: IssueFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          ...data,
          bookDetails: selectedBook,
          memberDetails: selectedMember,
        },
        'issue'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnSubmit = async (data: ReturnFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          ...data,
          transaction: selectedTransaction,
          fine,
        },
        'return'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'issue' | 'return')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="issue">
          <BookOpen className="h-4 w-4 mr-2" />
          Issue Book
        </TabsTrigger>
        <TabsTrigger value="return">
          <BookMarked className="h-4 w-4 mr-2" />
          Return Book
        </TabsTrigger>
      </TabsList>

      {/* Issue Book Tab */}
      <TabsContent value="issue">
        <form onSubmit={issueForm.handleSubmit(handleIssueSubmit)} className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Book Details</h3>
            <div className="space-y-4">
              <div>
                <Label>Search Book (ISBN, Title, or Author)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter ISBN, title, or author..."
                    onChange={(e) => {
                      if (e.target.value.length > 3) {
                        searchBook(e.target.value);
                      }
                    }}
                  />
                  <Button type="button" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedBook && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{selectedBook.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedBook.author}</p>
                      <p className="text-xs text-muted-foreground mt-1">ISBN: {selectedBook.isbn}</p>
                    </div>
                    <Badge className="bg-green-500">
                      {selectedBook.availableCopies} available
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Member Details</h3>
            <div className="space-y-4">
              <div>
                <Label>Search Member (ID or Name)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter member ID or name..."
                    onChange={(e) => {
                      if (e.target.value.length > 2) {
                        searchMember(e.target.value);
                      }
                    }}
                  />
                  <Button type="button" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedMember && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{selectedMember.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedMember.membershipId}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Books issued: {selectedMember.issuedBooks}/{selectedMember.maxBooks}
                      </p>
                    </div>
                    <Badge variant="outline">{selectedMember.type}</Badge>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Issue Details</h3>
            <div className="space-y-4">
              <div>
                <Label>Due Date</Label>
                <div className="relative">
                  <Input type="date" {...issueForm.register('dueDate')} className="pl-10" />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Standard loan period: 14 days
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Fine of ₹5 per day will be charged for late returns
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedBook || !selectedMember}>
              {isSubmitting ? 'Processing...' : 'Issue Book'}
            </Button>
          </div>
        </form>
      </TabsContent>

      {/* Return Book Tab */}
      <TabsContent value="return">
        <form onSubmit={returnForm.handleSubmit(handleReturnSubmit)} className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Search Transaction</h3>
            <div className="space-y-4">
              <div>
                <Label>Transaction ID</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter transaction ID..."
                    {...returnForm.register('transactionId')}
                    onChange={(e) => {
                      if (e.target.value.length > 3) {
                        searchTransaction(e.target.value);
                      }
                    }}
                  />
                  <Button type="button" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedTransaction && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium mb-2">Book Details</p>
                    <p className="text-sm">{selectedTransaction.book.title}</p>
                    <p className="text-xs text-muted-foreground">{selectedTransaction.book.author}</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium mb-2">Member Details</p>
                    <p className="text-sm">{selectedTransaction.member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTransaction.member.membershipId}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Issue Date</p>
                      <p className="text-sm font-medium">
                        {format(new Date(selectedTransaction.issueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="text-sm font-medium">
                        {format(new Date(selectedTransaction.dueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {selectedTransaction.isOverdue && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            <AlertCircle className="h-4 w-4 inline mr-2" />
                            Overdue by {selectedTransaction.overdueDays} days
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Fine: ₹{fine} (₹5 per day)
                          </p>
                        </div>
                        <Badge className="bg-red-500">Overdue</Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {selectedTransaction && (
            <>
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Book Condition</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="good"
                        {...returnForm.register('condition')}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium">Good</p>
                        <p className="text-xs text-muted-foreground">No damage</p>
                      </div>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="fair"
                        {...returnForm.register('condition')}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium">Fair</p>
                        <p className="text-xs text-muted-foreground">Minor wear and tear</p>
                      </div>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="damaged"
                        {...returnForm.register('condition')}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium">Damaged</p>
                        <p className="text-xs text-muted-foreground">Requires repair/replacement</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Remarks (Optional)</Label>
                  <Input
                    {...returnForm.register('remarks')}
                    placeholder="Any additional notes..."
                  />
                </div>
              </Card>

              {fine > 0 && (
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Fine to be Collected</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTransaction.overdueDays} days × ₹5 per day
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        {fine}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedTransaction}>
              {isSubmitting ? 'Processing...' : fine > 0 ? `Return & Collect Fine (₹${fine})` : 'Return Book'}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
