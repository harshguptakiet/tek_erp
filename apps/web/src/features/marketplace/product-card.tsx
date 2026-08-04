'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  ShoppingCart,
  Star,
  Eye,
  Heart,
  Share2,
  BookOpen,
  Video,
  FileText,
} from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    discountedPrice?: number;
    thumbnail?: string;
    category: string;
    type: 'COURSE' | 'BOOK' | 'VIDEO' | 'DOCUMENT' | 'BUNDLE';
    seller: {
      id: string;
      name: string;
      avatar?: string;
      rating: number;
    };
    rating: number;
    reviewCount: number;
    purchaseCount: number;
    tags?: string[];
    isFavorite?: boolean;
  };
  onPurchase?: (productId: string) => void;
  onView?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isPurchasing?: boolean;
}

export function ProductCard({
  product,
  onPurchase,
  onView,
  onToggleFavorite,
  isPurchasing,
}: ProductCardProps) {
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'COURSE':
        return BookOpen;
      case 'VIDEO':
        return Video;
      case 'BOOK':
      case 'DOCUMENT':
        return FileText;
      default:
        return BookOpen;
    }
  };

  const Icon = getProductIcon(product.type);
  const discount = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-3 left-3 font-bold"
          >
            {discount}% OFF
          </Badge>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite?.(product.id)}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${
              product.isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400'
            }`}
          />
        </button>

        {/* Type Badge */}
        <Badge
          variant="secondary"
          className="absolute bottom-3 left-3 bg-white/90 backdrop-blur"
        >
          {product.type}
        </Badge>
      </div>

      <div className="p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-gray-500">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
          onClick={() => onView?.(product.id)}
        >
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b">
          <Avatar className="w-6 h-6">
            {product.seller.avatar ? (
              <img src={product.seller.avatar} alt={product.seller.name} />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs">
                {product.seller.name[0]}
              </div>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{product.seller.name}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.seller.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{product.purchaseCount} purchases</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            {product.discountedPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  ₹{product.discountedPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                ₹{product.price}
              </span>
            )}
          </div>
          <Button
            onClick={() => onPurchase?.(product.id)}
            disabled={isPurchasing}
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {isPurchasing ? 'Buying...' : 'Buy Now'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(product.id)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
