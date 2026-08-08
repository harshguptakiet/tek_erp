/**
 * Book Catalog Component
 * Browse, search, and manage library books
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  Search,
  Book,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  BookMarked,
  AlertCircle,
} from 'lucide-react';

interface BookCatalogProps {
  onIssueBook?: (bookId: string) => void;
  onViewDetails?: (bookId: string) => void;
  mode?: 'browse' | 'manage';
}

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher?: string;
  publishYear?: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  shelf: string;
  status: 'available' | 'low-stock' | 'unavailable';
  coverImage?: string;
}

export function BookCatalog({ onIssueBook, onViewDetails, mode = 'browse' }: BookCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data
  const books: Book[] = [
    {
      id: '1',
      isbn: '978-0-13-468599-1',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      category: 'Programming',
      publisher: 'Prentice Hall',
      publishYear: 2008,
      totalCopies: 5,
      availableCopies: 2,
      issuedCopies: 3,
      shelf: 'A-12',
      status: 'available',
    },
    {
      id: '2',
      isbn: '978-0-321-12521-7',
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      category: 'Programming',
      publisher: 'Addison-Wesley',
      publishYear: 1999,
      totalCopies: 3,
      availableCopies: 1,
      issuedCopies: 2,
      shelf: 'A-13',
      status: 'low-stock',
    },
    {
      id: '3',
      isbn: '978-0-596-52068-7',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      category: 'Programming',
      publisher: "O'Reilly Media",
      publishYear: 2008,
      totalCopies: 4,
      availableCopies: 0,
      issuedCopies: 4,
      shelf: 'B-05',
      status: 'unavailable',
    },
    {
      id: '4',
      isbn: '978-1-4493-3276-4',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      category: 'Database',
      publisher: "O'Reilly Media",
      publishYear: 2017,
      totalCopies: 3,
      availableCopies: 3,
      issuedCopies: 0,
      shelf: 'C-20',
      status: 'available',
    },
    {
      id: '5',
      isbn: '978-0-13-475759-9',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      category: 'Computer Science',
      publisher: 'MIT Press',
      publishYear: 2009,
      totalCopies: 6,
      availableCopies: 4,
      issuedCopies: 2,
      shelf: 'D-08',
      status: 'available',
    },
  ];

  const categories = ['all', 'Programming', 'Database', 'Computer Science', 'Mathematics', 'Physics'];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'low-stock':
        return <Badge className="bg-yellow-500">Low Stock</Badge>;
      case 'unavailable':
        return <Badge className="bg-red-500">Unavailable</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <option value="all">All Categories</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="low-stock">Low Stock</option>
              <option value="unavailable">Unavailable</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredBooks.length} of {books.length} books
        </p>
        {mode === 'manage' && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        )}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Book Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                {getStatusBadge(book.status)}
              </div>

              {/* Book Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ISBN:</span>
                  <span className="font-mono text-xs">{book.isbn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="outline">{book.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shelf:</span>
                  <span className="font-medium">{book.shelf}</span>
                </div>
                {book.publisher && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Publisher:</span>
                    <span className="text-xs">{book.publisher}</span>
                  </div>
                )}
                {book.publishYear && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Year:</span>
                    <span>{book.publishYear}</span>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="font-medium">
                    {book.availableCopies}/{book.totalCopies} copies
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      book.availableCopies === 0
                        ? 'bg-red-500'
                        : book.availableCopies <= 1
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                  />
                </div>
                {book.issuedCopies > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {book.issuedCopies} {book.issuedCopies === 1 ? 'copy' : 'copies'} currently issued
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {mode === 'browse' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onViewDetails?.(book.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={book.availableCopies === 0}
                      onClick={() => onIssueBook?.(book.id)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      {book.availableCopies === 0 ? 'Unavailable' : 'Issue'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Low stock warning */}
              {book.status === 'low-stock' && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                  <AlertCircle className="h-3 w-3 mt-0.5" />
                  <span>Low stock - Consider ordering more copies</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <Card className="p-12 text-center">
          <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No books found matching your search</p>
        </Card>
      )}
    </div>
  );
}
