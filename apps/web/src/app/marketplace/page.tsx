/**
 * Module 22: Marketplace - Educational Content Marketplace
 * FR-MARKET-001: Browse and purchase educational content
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

type ContentType = 'COURSE' | 'VIDEO' | 'EBOOK' | 'WORKSHEET' | 'QUIZ' | 'LAB';
type PricingType = 'FREE' | 'PAID' | 'SUBSCRIPTION';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  category: string;
  subject: string;
  grade: string;
  author: string;
  authorRating: number;
  price: number;
  pricingType: PricingType;
  rating: number;
  reviews: number;
  enrolled: number;
  duration?: string;
  thumbnail: string;
  tags: string[];
  lastUpdated: string;
  isPurchased?: boolean;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'ALL'>('ALL');
  const [filterPricing, setFilterPricing] = useState<PricingType | 'ALL'>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'NEWEST' | 'RATING' | 'PRICE'>('POPULAR');

  // Mock data
  const { data: marketplaceData, isLoading } = useQuery({
    queryKey: ['marketplace', searchQuery, filterType, filterPricing, filterSubject, filterGrade, sortBy],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'item1',
          title: 'Complete Mathematics Course - Class 10',
          description: 'Comprehensive mathematics course covering all CBSE topics with practice problems',
          type: 'COURSE' as ContentType,
          category: 'Academic',
          subject: 'Mathematics',
          grade: 'Class 10',
          author: 'Dr. Rajesh Kumar',
          authorRating: 4.8,
          price: 2999,
          pricingType: 'PAID' as PricingType,
          rating: 4.7,
          reviews: 234,
          enrolled: 1520,
          duration: '40 hours',
          thumbnail: '/thumbnails/math-course.jpg',
          tags: ['CBSE', 'Algebra', 'Geometry', 'Board Exam'],
          lastUpdated: '2024-07-15',
          isPurchased: false,
        },
        {
          id: 'item2',
          title: 'Physics Lab Simulations - Newton\'s Laws',
          description: 'Interactive virtual lab experiments for understanding Newton\'s laws of motion',
          type: 'LAB' as ContentType,
          category: 'Practical',
          subject: 'Physics',
          grade: 'Class 11',
          author: 'Prof. Priya Singh',
          authorRating: 4.9,
          price: 0,
          pricingType: 'FREE' as PricingType,
          rating: 4.9,
          reviews: 567,
          enrolled: 3240,
          duration: '5 experiments',
          thumbnail: '/thumbnails/physics-lab.jpg',
          tags: ['Virtual Lab', 'Simulations', 'Practical'],
          lastUpdated: '2024-07-20',
          isPurchased: false,
        },
        {
          id: 'item3',
          title: 'Chemistry E-Book - Organic Chemistry Fundamentals',
          description: 'Digital textbook with animations and practice questions for organic chemistry',
          type: 'EBOOK' as ContentType,
          category: 'Textbook',
          subject: 'Chemistry',
          grade: 'Class 12',
          author: 'Ms. Anjali Sharma',
          authorRating: 4.7,
          price: 599,
          pricingType: 'PAID' as PricingType,
          rating: 4.6,
          reviews: 189,
          enrolled: 890,
          duration: '250 pages',
          thumbnail: '/thumbnails/chemistry-ebook.jpg',
          tags: ['Organic Chemistry', 'NEET', 'JEE'],
          lastUpdated: '2024-07-10',
          isPurchased: true,
        },
        {
          id: 'item4',
          title: 'English Grammar Worksheets Bundle',
          description: '100+ worksheets covering all grammar topics with answer keys',
          type: 'WORKSHEET' as ContentType,
          category: 'Practice',
          subject: 'English',
          grade: 'Class 9',
          author: 'Mr. Suresh Verma',
          authorRating: 4.5,
          price: 499,
          pricingType: 'PAID' as PricingType,
          rating: 4.4,
          reviews: 112,
          enrolled: 650,
          duration: '100+ worksheets',
          thumbnail: '/thumbnails/english-worksheets.jpg',
          tags: ['Grammar', 'Practice', 'Worksheets'],
          lastUpdated: '2024-06-25',
          isPurchased: false,
        },
        {
          id: 'item5',
          title: 'Biology Video Series - Human Anatomy',
          description: '3D animated video series explaining human body systems',
          type: 'VIDEO' as ContentType,
          category: 'Video Lecture',
          subject: 'Biology',
          grade: 'Class 11',
          author: 'Dr. Meera Gupta',
          authorRating: 4.9,
          price: 1499,
          pricingType: 'PAID' as PricingType,
          rating: 4.8,
          reviews: 345,
          enrolled: 1890,
          duration: '15 hours',
          thumbnail: '/thumbnails/biology-videos.jpg',
          tags: ['3D Animation', 'Human Body', 'NEET'],
          lastUpdated: '2024-07-25',
          isPurchased: false,
        },
        {
          id: 'item6',
          title: 'Mathematics Quiz Bank - Competitive Exams',
          description: 'Mock tests and quizzes for JEE and other competitive exams',
          type: 'QUIZ' as ContentType,
          category: 'Assessment',
          subject: 'Mathematics',
          grade: 'Class 12',
          author: 'Dr. Rajesh Kumar',
          authorRating: 4.8,
          price: 799,
          pricingType: 'SUBSCRIPTION' as PricingType,
          rating: 4.7,
          reviews: 278,
          enrolled: 1340,
          duration: '500+ questions',
          thumbnail: '/thumbnails/math-quiz.jpg',
          tags: ['JEE', 'Mock Tests', 'Competitive'],
          lastUpdated: '2024-07-28',
          isPurchased: false,
        },
      ] as MarketplaceItem[];
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return itemId;
    },
    onSuccess: () => {
      toast.success('Content purchased successfully');
    },
    onError: () => {
      toast.error('Failed to purchase content');
    },
  });

  const filteredItems = marketplaceData?.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesPricing = filterPricing === 'ALL' || item.pricingType === filterPricing;
    const matchesSubject = filterSubject === 'ALL' || item.subject === filterSubject;
    const matchesGrade = filterGrade === 'ALL' || item.grade === filterGrade;
    return matchesSearch && matchesType && matchesPricing && matchesSubject && matchesGrade;
  });

  const stats = {
    total: marketplaceData?.length || 0,
    free: marketplaceData?.filter((i) => i.pricingType === 'FREE').length || 0,
    paid: marketplaceData?.filter((i) => i.pricingType === 'PAID').length || 0,
    subscription: marketplaceData?.filter((i) => i.pricingType === 'SUBSCRIPTION').length || 0,
  };

  const getTypeIcon = (type: ContentType) => {
    const icons = {
      COURSE: '📚',
      VIDEO: '🎥',
      EBOOK: '📖',
      WORKSHEET: '📝',
      QUIZ: '📊',
      LAB: '🔬',
    };
    return icons[type];
  };

  const getTypeColor = (type: ContentType) => {
    const colors = {
      COURSE: 'bg-blue-100 text-blue-800',
      VIDEO: 'bg-purple-100 text-purple-800',
      EBOOK: 'bg-green-100 text-green-800',
      WORKSHEET: 'bg-orange-100 text-orange-800',
      QUIZ: 'bg-pink-100 text-pink-800',
      LAB: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type];
  };


  return (
    <Can
      permission={PERMISSIONS.CONTENT_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to access marketplace</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Educational Marketplace</h1>
          <p className="mt-2 text-sm text-gray-600">
            Discover courses, e-books, videos, and more from expert educators
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterPricing('FREE')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Free</p>
                <p className="text-3xl font-bold text-green-600">{stats.free}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterPricing('PAID')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-3xl font-bold text-blue-600">{stats.paid}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterPricing('SUBSCRIPTION')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Subscription</p>
                <p className="text-3xl font-bold text-purple-600">{stats.subscription}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="COURSE">Courses</option>
                <option value="VIDEO">Videos</option>
                <option value="EBOOK">E-Books</option>
                <option value="WORKSHEET">Worksheets</option>
                <option value="QUIZ">Quizzes</option>
                <option value="LAB">Virtual Labs</option>
              </Select>

              <Select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="ALL">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </Select>

              <Select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
              >
                <option value="ALL">All Grades</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </Select>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="POPULAR">Most Popular</option>
                <option value="NEWEST">Newest First</option>
                <option value="RATING">Highest Rated</option>
                <option value="PRICE">Price: Low to High</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Items */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading content...</p>
          </div>
        ) : filteredItems && filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/marketplace/${item.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getTypeColor(item.type)}>
                      {getTypeIcon(item.type)} {item.type}
                    </Badge>
                    {item.isPurchased && (
                      <Badge variant="success" className="text-xs">✓ Purchased</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{item.subject}</Badge>
                    <Badge variant="secondary" className="text-xs">{item.grade}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{item.rating}</span>
                      <span>({item.reviews})</span>
                    </div>
                    <div>
                      <span className="font-medium">{item.enrolled}</span> enrolled
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <span>👤 {item.author}</span>
                    <span>•</span>
                    <span>{item.duration}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    {item.pricingType === 'FREE' ? (
                      <span className="text-lg font-bold text-green-600">FREE</span>
                    ) : item.pricingType === 'SUBSCRIPTION' ? (
                      <span className="text-lg font-bold text-purple-600">
                        ₹{item.price}/month
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-blue-600">
                        ₹{item.price.toLocaleString()}
                      </span>
                    )}

                    {item.isPurchased ? (
                      <Button size="sm" variant="outline">
                        Access Now
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          purchaseMutation.mutate(item.id);
                        }}
                        disabled={purchaseMutation.isPending}
                      >
                        {item.pricingType === 'FREE' ? 'Enroll' : 'Purchase'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No content found matching your criteria</p>
          </div>
        )}

        {/* Featured Categories */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { icon: '📚', name: 'Courses', count: 45 },
                { icon: '🎥', name: 'Videos', count: 120 },
                { icon: '📖', name: 'E-Books', count: 78 },
                { icon: '📝', name: 'Worksheets', count: 156 },
                { icon: '📊', name: 'Quizzes', count: 89 },
                { icon: '🔬', name: 'Labs', count: 34 },
              ].map((category, index) => (
                <button
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                  <p className="text-xs text-gray-600">{category.count} items</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
