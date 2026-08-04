/**
 * Module 18: ERP - Library Management
 * FR-LIB-001 to FR-LIB-015: Library catalog and circulation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { libraryService } from '@/services/library.service';
import { useAuthStore } from '@/stores/auth.store';

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'catalog' | 'borrowed'>('catalog');

  // Real API integration
  const { data: libraryResponse, isLoading } = useQuery({
    queryKey: ['library', user?.schoolId, searchTerm, selectedCategory, selectedStatus],
    queryFn: () => libraryService.listBooks({
      searchQuery: searchTerm,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      isAvailable: selectedStatus === 'AVAILABLE' ? true : selectedStatus === 'OUT_OF_STOCK' ? false : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  const { data: borrowedResponse } = useQuery({
    queryKey: ['borrowed-books', user?.id],
    queryFn: () => libraryService.getBorrowedBooks(user?.id || ''),
    enabled: !!user?.id && viewMode === 'borrowed',
  });

  // Transform API data
  const books = Array.isArray(libraryResponse) ? libraryResponse : libraryResponse?.books || [];
  const myBorrowedBooks = Array.isArray(borrowedResponse) ? borrowedResponse : borrowedResponse?.borrowed || [];
  
  const libraryData = {
    stats: {
      totalBooks: books.length,
      availableBooks: books.filter((b: any) => b.availableCopies > 0 || b.isAvailable).length,
      borrowedBooks: books.filter((b: any) => b.availableCopies === 0 || !b.isAvailable).length,
      overdueBooks: myBorrowedBooks.filter((b: any) => b.status === 'OVERDUE').length,
    },
    books,
    myBorrowedBooks,
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

  const filteredBooks = libraryData?.books.filter((book: any) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse catalog and manage borrowed books
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Can permission={PERMISSIONS.LIBRARY_MANAGE}>
              <Button variant="outline" onClick={() => router.push('/library/add')}>
                + Add Book
              </Button>
            </Can>
            <Button variant="outline" onClick={() => router.push('/library/scan')}>
              📷 Scan ISBN
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Books</p>
            <p className="text-3xl font-bold text-gray-900">{libraryData?.stats.totalBooks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Available</p>
            <p className="text-3xl font-bold text-green-600">{libraryData?.stats.availableBooks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Borrowed</p>
            <p className="text-3xl font-bold text-blue-600">{libraryData?.stats.borrowedBooks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Overdue</p>
            <p className="text-3xl font-bold text-red-600">{libraryData?.stats.overdueBooks}</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg border p-1 bg-white">
          <button
            onClick={() => setViewMode('catalog')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'catalog'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Catalog
          </button>
          <button
            onClick={() => setViewMode('borrowed')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'borrowed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📖 My Borrowed Books
          </button>
        </div>
      </div>

      {/* Catalog View */}
      {viewMode === 'catalog' && (
        <>
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:col-span-2"
                />
                <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="COMPUTER_SCIENCE">Computer Science</option>
                  <option value="MATHEMATICS">Mathematics</option>
                  <option value="PHYSICS">Physics</option>
                  <option value="CHEMISTRY">Chemistry</option>
                  <option value="BIOLOGY">Biology</option>
                  <option value="LITERATURE">Literature</option>
                  <option value="HISTORY">History</option>
                </Select>
                <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Books Table */}
          <Card>
            <CardHeader>
              <CardTitle>Books Catalog ({filteredBooks?.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks?.map((book: any) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{book.title}</p>
                          <p className="text-sm text-gray-600">{book.author}</p>
                          <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{book.category.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-900">{book.publisher}</p>
                        <p className="text-xs text-gray-500">{book.year} • {book.edition} Ed.</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {book.availableCopies}/{book.totalCopies}
                          </p>
                          <Badge
                            variant={book.availableCopies > 0 ? 'success' : 'error'}
                            className="mt-1"
                          >
                            {book.status === 'AVAILABLE' ? 'Available' : 'Out of Stock'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">{book.location}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => router.push(`/library/${book.id}`)}>
                            View
                          </Button>
                          {book.availableCopies > 0 && (
                            <Button size="sm" variant="outline">
                              Borrow
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* My Borrowed Books View */}
      {viewMode === 'borrowed' && (
        <Card>
          <CardHeader>
            <CardTitle>My Borrowed Books ({libraryData?.myBorrowedBooks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {libraryData?.myBorrowedBooks.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📚</span>
                <p className="text-gray-600">You haven't borrowed any books yet</p>
                <Button className="mt-4" onClick={() => setViewMode('catalog')}>
                  Browse Catalog
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Borrow Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {libraryData?.myBorrowedBooks.map((borrowed: any) => (
                    <TableRow key={borrowed.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{borrowed.book.title}</p>
                          <p className="text-sm text-gray-600">{borrowed.book.author}</p>
                          <p className="text-xs text-gray-500">ISBN: {borrowed.book.isbn}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(borrowed.borrowDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(borrowed.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {borrowed.status === 'OVERDUE' ? (
                          <div>
                            <Badge variant="error">OVERDUE</Badge>
                            <p className="text-xs text-red-600 mt-1">
                              {borrowed.daysOverdue} days overdue
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Badge variant="success">BORROWED</Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {borrowed.daysRemaining} days remaining
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Return Book
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
