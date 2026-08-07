/**
 * Module 22: Marketplace - Browse and Purchase Content
 * FR-MARKET-001 to FR-MARKET-010: Browse marketplace offerings
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { marketplaceService } from '@/services/marketplace.service';
import { useAuthStore } from '@/stores/auth.store';

export default function MarketplacePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Real API integration
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['marketplace-products', searchTerm, selectedCategory, selectedPriceRange, sortBy],
    queryFn: () =>
      marketplaceService.browseMarketplace({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        priceRange: selectedPriceRange || undefined,
        sortBy,
      }),
  });

  // Transform API data
  const products = Array.isArray(productsResponse)
    ? productsResponse
    : productsResponse?.products || [];

  const categories = [
    'Courses',
    'Books',
    'Study Materials',
    'Lab Equipment',
    'Digital Content',
    'AR/VR Modules',
    'Assessments',
    'Templates',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse and purchase educational content and resources
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/marketplace/my-purchases')}>
            My Purchases
          </Button>
        </div>
      </div>

      {/* Stats/Featured Banner */}
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-3xl font-bold mt-1">{products.length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Free Resources</p>
              <p className="text-3xl font-bold mt-1">
                {products.filter((p: any) => p.price === 0).length}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Premium Content</p>
              <p className="text-3xl font-bold mt-1">
                {products.filter((p: any) => p.price > 0).length}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Top Rated</p>
              <p className="text-3xl font-bold mt-1">
                {products.filter((p: any) => (p.rating || 0) >= 4.5).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            <Select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="0-1000">₹0 - ₹1,000</option>
              <option value="1000-5000">₹1,000 - ₹5,000</option>
              <option value="5000+">₹5,000+</option>
            </Select>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading marketplace...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Card
              key={product.id}
              className="hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push(`/marketplace/${product.id}`)}
            >
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">{product.icon || '📦'}</span>
                )}
              </div>

              <CardContent className="pt-4">
                {/* Category & Rating */}
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category || 'General'}
                  </Badge>
                  {product.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{product.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-xs">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.title || 'Untitled Product'}
                </h3>

                {/* Seller */}
                <p className="text-sm text-gray-600 mb-3">
                  by {product.sellerName || 'Unknown Seller'}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                {/* Footer: Price & Action */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    {product.price === 0 ? (
                      <Badge variant="success">FREE</Badge>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{product.price?.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/marketplace/${product.id}`);
                    }}
                  >
                    {product.price === 0 ? 'Get' : 'Buy'}
                  </Button>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {product.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🛒</span>
              <p className="text-gray-600">No products found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seller CTA */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Want to sell your content?
              </h3>
              <p className="text-gray-600">
                Join our marketplace and reach thousands of schools and educators
              </p>
            </div>
            <Button onClick={() => router.push('/marketplace/become-seller')}>
              Become a Seller
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
