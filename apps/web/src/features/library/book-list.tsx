'use client';

import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BookOpen, BookCheck, BookX, Plus, Edit, Eye } from 'lucide-react';
import { useBooks } from './use-library';

export function BookList() {
  const { data: books, isLoading } = useBooks();

  const columns: DataTableColumn<any>[] = [
    {
      header: 'Book Details',
      cell: (book) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{book.title}</div>
            <div className="text-sm text-gray-500">{book.author}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'ISBN',
      accessor: 'isbn',
      cell: (book) => (
        <span className="font-mono text-sm">{book.isbn}</span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      cell: (book) => (
        <Badge variant="secondary">{book.category}</Badge>
      ),
    },
    {
      header: 'Total Copies',
      accessor: 'totalCopies',
      sortable: true,
      className: 'text-center',
    },
    {
      header: 'Available',
      accessor: 'availableCopies',
      sortable: true,
      cell: (book) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={book.availableCopies > 0 ? 'default' : 'destructive'}
          >
            {book.availableCopies}
          </Badge>
          {book.availableCopies === 0 && (
            <span className="text-xs text-red-600">Out of stock</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (book) => {
        const availability = (book.availableCopies / book.totalCopies) * 100;
        if (availability === 0) {
          return <Badge variant="destructive">Unavailable</Badge>;
        } else if (availability < 20) {
          return <Badge variant="warning">Low Stock</Badge>;
        } else {
          return <Badge variant="success">Available</Badge>;
        }
      },
    },
    {
      header: 'Actions',
      cell: (book) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Library Books</h2>
          <p className="text-gray-600">Manage your school library collection</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Books</p>
              <p className="text-2xl font-bold">{books?.length || 0}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {books?.reduce((sum: number, b: any) => sum + b.availableCopies, 0) || 0}
              </p>
            </div>
            <BookCheck className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issued</p>
              <p className="text-2xl font-bold text-amber-600">
                {books?.reduce((sum: number, b: any) => sum + (b.totalCopies - b.availableCopies), 0) || 0}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-amber-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {books?.filter((b: any) => b.availableCopies === 0).length || 0}
              </p>
            </div>
            <BookX className="w-8 h-8 text-red-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-6">
        <DataTable
          data={books || []}
          columns={columns}
          searchable
          searchPlaceholder="Search by title, author, or ISBN..."
          pagination
          pageSize={10}
          isLoading={isLoading}
          emptyMessage="No books found in the library"
        />
      </Card>
    </div>
  );
}
