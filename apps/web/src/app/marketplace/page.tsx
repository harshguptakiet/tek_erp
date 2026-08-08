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
  Package, Filter, BookOpen, Video, FileText, Headphones,
} from 'lucide-react';

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

  const products = Array.isArray(items) ? items : items?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="page-title">Marketplace</h1>
          <p className="page-description">
            Browse and purchase educational content from publishers and creators
          </p>
        </div>
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => router.push('/marketplace/seller')}
        >
          <Store className="h-4 w-4 mr-2" />
          Seller Dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 stat-card stat-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Products</p>
              <p className="text-2xl font-bold tabular-nums mt-1">{products.length || '—'}</p>
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
              <p className="text-2xl font-bold tabular-nums mt-1">4.5</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card-premium p-5 stat-card stat-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Trending</p>
              <p className="text-2xl font-bold tabular-nums mt-1">12</p>
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
              placeholder="Search products, courses, books…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <option value="">All Categories</option>
            <option value="VIDEO">Video Courses</option>
            <option value="EBOOK">E-Books</option>
            <option value="DOCUMENT">Documents</option>
            <option value="AUDIO">Audio Content</option>
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
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const category = product.category || 'EBOOK';
            const gradient = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.EBOOK;
            const Icon = CATEGORY_ICONS[category] || BookOpen;

            return (
              <div
                key={product.id}
                className="card-premium card-interactive overflow-hidden group"
                onClick={() => router.push(`/marketplace/${product.id}`)}
              >
                {/* Thumbnail */}
                <div className={`h-48 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                  <Icon className="h-16 w-16 text-white/30" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  {product.featured && (
                    <span className="absolute top-3 left-3 badge-gradient">Featured</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] mb-2`}>
                    {category}
                  </span>
                  <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                    {product.title || product.name}
                  </h3>

                  {/* Rating & Sales */}
                  <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))] mb-4">
                    {product.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        {product.rating}
                      </span>
                    )}
                    {product.sales && (
                      <span>{product.sales} sales</span>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">
                      {product.price ? `₹${product.price.toLocaleString()}` : 'Free'}
                    </span>
                    <Button size="sm" style={{ background: 'var(--gradient-primary)' }} className="text-white text-xs">
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      Purchase
                    </Button>
                  </div>
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
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
