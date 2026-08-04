import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryService } from '@/services/library.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const libraryKeys = {
  all: ['library'] as const,
  books: () => [...libraryKeys.all, 'books'] as const,
  book: (id: string) => [...libraryKeys.books(), id] as const,
  issued: () => [...libraryKeys.all, 'issued'] as const,
  issuedByStudent: (studentId: string) => [...libraryKeys.issued(), studentId] as const,
  overdue: () => [...libraryKeys.all, 'overdue'] as const,
  available: () => [...libraryKeys.all, 'available'] as const,
};

// Fetch books list
export function useBooks(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...libraryKeys.books(), filters],
    queryFn: () => libraryService.listBooks(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single book
export function useBook(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: libraryKeys.book(id),
    queryFn: () => libraryService.getBook(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch issued books
export function useIssuedBooks(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...libraryKeys.issued(), filters],
    queryFn: () => libraryService.getIssuedBooks(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch books issued to a student
export function useStudentIssuedBooks(studentId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: libraryKeys.issuedByStudent(studentId),
    queryFn: () => libraryService.getStudentIssuedBooks(studentId),
    enabled: !!user?.schoolId && !!studentId,
  });
}

// Fetch overdue books
export function useOverdueBooks() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: libraryKeys.overdue(),
    queryFn: () => libraryService.getOverdueBooks(),
    enabled: !!user?.schoolId,
  });
}

// Add book mutation
export function useAddBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => libraryService.addBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      toast.success('Book added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add book: ${error.message}`);
    },
  });
}

// Update book mutation
export function useUpdateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      libraryService.updateBook(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.book(variables.id) });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      toast.success('Book updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update book: ${error.message}`);
    },
  });
}

// Issue book mutation
export function useIssueBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => libraryService.issueBook(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.issued() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.book(variables.bookId) });
      if (variables.studentId) {
        queryClient.invalidateQueries({ queryKey: libraryKeys.issuedByStudent(variables.studentId) });
      }
      toast.success('Book issued successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to issue book: ${error.message}`);
    },
  });
}

// Return book mutation
export function useReturnBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (issueId: string) => libraryService.returnBook(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.issued() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() });
      toast.success('Book returned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to return book: ${error.message}`);
    },
  });
}

// Renew book mutation
export function useRenewBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (issueId: string) => libraryService.renewBook(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.issued() });
      toast.success('Book renewed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to renew book: ${error.message}`);
    },
  });
}
