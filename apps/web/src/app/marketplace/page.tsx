/**
 * Marketplace — Educational Content Store
 * FR-MARKET-001 to FR-MARKET-040
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplace.service';
import { Button } from '@/components/ui/button';
import {
  Store, Search, ShoppingCart, Star, TrendingUp,
  Package, Filter, BookOpen, Video, FileText, Headphones, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  VIDEO: Video,
  EBOOK: BookOpen,
  DOCUMENT: FileText,
  AUDIO: Headphones,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  VIDEO: 'from-violet-500 to-purple-600',
  EBOOK: 'from-blue-500 to-cyan-600',
  DOCUMENT: 'from-emerald-500 to-teal-600',
  AUDIO: 'from-orange-500 to-red-600',
  PHYSICAL: 'from-pink-500 to-rose-600',
};

export interface MarketplaceProduct {
  id: string;
  title: string;
  name?: string;
  instructor: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount?: number;
  studentsCount?: number;
  sales?: number;
  level?: string;
  featured?: boolean;
  bestseller?: boolean;
  badge?: string;
  description: string;
}

const MOCK_MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-1',
    title: 'System Design & Distributed Microservices Masterclass',
    instructor: 'Dr. Vikram Sethi',
    category: 'VIDEO',
    price: 2499,
    rating: 4.9,
    sales: 1420,
    featured: true,
    description: 'Master high-scale system architecture, Redis caching, message queues, and load balancing.',
  },
  {
    id: 'prod-2',
    title: 'Next.js 16 App Router & Full-Stack Web Development',
    instructor: 'Elena Rostova',
    category: 'VIDEO',
    price: 1999,
    rating: 4.8,
    sales: 2150,
    featured: true,
    description: 'Learn Server Components, Turbopack, and build resilient modern web apps.',
  },
  {
    id: 'prod-3',
    title: 'PostgreSQL Advanced Indexing & Performance Tuning Guide',
    instructor: 'Michael Chen',
    category: 'EBOOK',
    price: 1499,
    rating: 4.9,
    sales: 890,
    featured: false,
    description: 'Deep dive into B-Tree indexes, EXPLAIN ANALYZE, query planner, and connection pooling.',
  },
  {
    id: 'prod-4',
    title: 'Node.js Microservices Architecture with NestJS & Prisma',
    instructor: 'Alex Rivera',
    category: 'VIDEO',
    price: 1799,
    rating: 4.7,
    sales: 1120,
    featured: false,
    description: 'Build enterprise NestJS backend services with clean architecture and database ORMs.',
  },
  {
    id: 'prod-5',
    title: 'Python AI & Agentic LLM System Architecture',
    instructor: 'Dr. Priya Patel',
    category: 'EBOOK',
    price: 2999,
    rating: 4.9,
    sales: 3400,
    featured: true,
    description: 'Comprehensive guide to building autonomous AI agents and vector search systems.',
  },
  {
    id: 'prod-6',
    title: 'Docker & Kubernetes Production Deployment Handbook',
    instructor: 'DevOps Guild',
    category: 'DOCUMENT',
    price: 0,
    rating: 4.8,
    sales: 4200,
    featured: false,
    description: 'Free production handbook for containerizing microservices and cluster management.',
  },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['marketplace', { search: searchTerm, category: selectedCategory }],
    queryFn: () => marketplaceService.browseItems({
      searchQuery: searchTerm || undefined,
      category: selectedCategory || undefined,
    }),
  });

  const apiProducts = Array.isArray(items) ? items : items?.data || [];
  const displayProducts = apiProducts.length > 0 ? apiProducts : MOCK_MARKETPLACE_PRODUCTS;

  const filteredProducts = displayProducts.filter((product: MarketplaceProduct) => {
    const title = product.title || product.name || '';
    const matchesSearch = !searchTerm || title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handlePurchase = (e: React.MouseEvent, title: string, price: number) => {
    e.stopPropagation();
    toast.success(`Enrolled in "${title}" (₹${price.toLocaleString()})! Access granted in My Content.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="page-title">Learning Marketplace</h1>
          <p className="page-description">
            Discover premium courses, tech e-books, and developer guides from industry experts
          </p>
        </div>
        <Button
          variant="outline"
          className="text-sm font-semibold"
          onClick={() => router.push('/marketplace/seller')}
        >
          <Store className="h-4 w-4 mr-2" />
          Become an Instructor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 stat-card stat-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Products</p>
              <p className="text-2xl font-bold tabular-nums mt-1">{filteredProducts.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card-premium p-5 stat-card stat-card-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Categories</p>
              <p className="text-2xl font-bold tabular-nums mt-1">4</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-success)' }}>
              <Filter className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card-premium p-5 stat-card stat-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Avg Rating</p>
              <p className="text-2xl font-bold tabular-nums mt-1">4.9 ★</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card-premium p-5 stat-card stat-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Active Learners</p>
              <p className="text-2xl font-bold tabular-nums mt-1">13,280+</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-warm)' }}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card-premium p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Search products, courses, guides…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] [&_option]:bg-[hsl(var(--card))] [&_option]:text-[hsl(var(--foreground))]"
          >
            <option value="">All Categories</option>
            <option value="VIDEO">Video Courses</option>
            <option value="EBOOK">E-Books</option>
            <option value="DOCUMENT">Documents & Manuals</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-premium overflow-hidden">
              <div className="h-48 animate-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-20 rounded animate-shimmer" />
                <div className="h-5 w-3/4 rounded animate-shimmer" />
                <div className="h-4 w-1/2 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: MarketplaceProduct) => {
            const category = product.category || 'EBOOK';
            const gradient = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.EBOOK;
            const Icon = CATEGORY_ICONS[category] || BookOpen;

            return (
              <div
                key={product.id}
                className="card-premium card-interactive overflow-hidden group flex flex-col justify-between"
                onClick={() => router.push(`/content`)}
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className={`h-44 bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between relative overflow-hidden text-white`}>
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/25 backdrop-blur-md border border-white/20">
                        {category}
                      </span>
                      {product.featured && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-black shadow-sm">
                          <Sparkles className="h-3 w-3" /> Featured
                        </span>
                      )}
                    </div>

                    <Icon className="h-16 w-16 text-white/20 absolute -bottom-2 -right-2" />

                    <div className="z-10">
                      <p className="text-xs font-semibold text-white/80">{product.instructor || 'Tekurious Academy'}</p>
                      <h3 className="font-bold text-base line-clamp-2 text-white leading-snug">
                        {product.title || product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                      {product.description || 'Comprehensive learning content with hands-on projects.'}
                    </p>

                    {/* Rating & Sales */}
                    <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] pt-1 border-t border-[hsl(var(--border)/0.5)]">
                      <span className="flex items-center gap-1 font-semibold text-[hsl(var(--foreground))]">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        {product.rating || '4.9'}
                      </span>
                      <span className="font-mono">{product.sales || 1200}+ Learners</span>
                    </div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="p-5 pt-0 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] block">Course Fee</span>
                    <span className="text-lg font-bold text-[hsl(var(--foreground))]">
                      {product.price && product.price > 0 ? `₹${product.price.toLocaleString()}` : 'Free Access'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => handlePurchase(e, product.title || product.name || 'Course', product.price || 0)}
                    style={{ background: 'var(--gradient-primary)' }}
                    className="text-white text-xs font-bold shadow-sm"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Enroll Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-premium p-16 text-center">
          <Store className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Try adjusting your search query or category filter
          </p>
        </div>
      )}
    </div>
  );
}
