import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-PUB-001: Create Publisher Profile
  async createPublisherProfile(userId: string, dto: {
    companyName: string; registrationNumber?: string; taxId?: string;
    website?: string; description?: string;
  }) {
    const existing = await this.prisma.publisherProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Publisher profile already exists');
    const profile = await this.prisma.publisherProfile.create({
      data: { userId, companyName: dto.companyName, registrationNumber: dto.registrationNumber,
        taxId: dto.taxId, website: dto.website, description: dto.description },
    });
    this.eventBus.publish('marketplace.publisher.created', { publisherId: profile.id, userId });
    return profile;
  }

  async getPublisherProfile(userId: string) {
    const p = await this.prisma.publisherProfile.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Publisher profile not found');
    return p;
  }

  // FR-CREATOR-001: Create Creator Profile
  async createCreatorProfile(userId: string, dto: {
    displayName: string; bio?: string; expertise?: string[];
  }) {
    const existing = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Creator profile already exists');
    const profile = await this.prisma.creatorProfile.create({
      data: { userId, displayName: dto.displayName, bio: dto.bio, expertise: dto.expertise || [] },
    });
    this.eventBus.publish('marketplace.creator.created', { creatorId: profile.id, userId });
    return profile;
  }

  async getCreatorProfile(userId: string) {
    const p = await this.prisma.creatorProfile.findUnique({
      where: { userId },
      include: { contents: { where: { deletedAt: null }, take: 10, orderBy: { viewCount: 'desc' } } },
    });
    if (!p) throw new NotFoundException('Creator profile not found');
    return p;
  }

  // FR-MONET-001: Create Marketplace Product
  async createProduct(dto: {
    contentId?: string; publisherId?: string; creatorId?: string;
    productName: string; description?: string; productType: string;
    price: number; currency?: string; discountPercent?: number;
  }) {
    const discountedPrice = dto.discountPercent
      ? dto.price * (1 - dto.discountPercent / 100) : null;
    const product = await this.prisma.marketplaceProduct.create({
      data: {
        contentId: dto.contentId, publisherId: dto.publisherId, creatorId: dto.creatorId,
        productName: dto.productName, description: dto.description,
        productType: dto.productType, price: dto.price as any,
        currency: dto.currency || 'INR',
        discountPercent: dto.discountPercent as any,
        discountedPrice: discountedPrice as any,
      },
    });
    this.eventBus.publish('marketplace.product.created', { productId: product.id });
    return product;
  }

  async listProducts(filters: {
    productType?: string; isFeatured?: boolean; isActive?: boolean;
    page?: number; limit?: number;
  }) {
    const page = filters.page || 1; const limit = filters.limit || 20;
    const where: any = {
      isActive: filters.isActive ?? true,
      ...(filters.productType ? { productType: filters.productType } : {}),
      ...(filters.isFeatured !== undefined ? { isFeatured: filters.isFeatured } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.marketplaceProduct.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: [{ isFeatured: 'desc' }, { salesCount: 'desc' }],
      }),
      this.prisma.marketplaceProduct.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit } };
  }

  async getProduct(productId: string) {
    const p = await this.prisma.marketplaceProduct.findUnique({ where: { id: productId } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  // FR-PAYOUT-001: Purchase product
  async purchaseProduct(buyerId: string, productId: string) {
    const product = await this.prisma.marketplaceProduct.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new NotFoundException('Product not available');

    const existing = await this.prisma.marketplaceOrder.findFirst({
      where: { productId, buyerId, status: 'COMPLETED' },
    });
    if (existing) throw new ConflictException('Product already purchased');

    const finalPrice = product.discountedPrice || product.price;
    const platformFee = Number(finalPrice) * 0.2; // 20% platform fee
    const sellerEarnings = Number(finalPrice) - platformFee;

    const order = await this.prisma.marketplaceOrder.create({
      data: {
        productId, buyerId, quantity: 1,
        totalAmount: finalPrice, platformFee: platformFee as any,
        sellerEarnings: sellerEarnings as any, status: 'COMPLETED',
        orderedAt: new Date(), completedAt: new Date(),
      },
    });

    // Update product stats
    await this.prisma.marketplaceProduct.update({
      where: { id: productId },
      data: { salesCount: { increment: 1 }, revenueGenerated: { increment: Number(finalPrice) } },
    });

    this.eventBus.publish('marketplace.product.purchased', { orderId: order.id, buyerId, productId });
    return order;
  }

  async getBuyerOrders(buyerId: string) {
    return this.prisma.marketplaceOrder.findMany({
      where: { buyerId },
      include: { product: { select: { productName: true, productType: true, price: true } } },
      orderBy: { orderedAt: 'desc' },
    });
  }

  // FR-CREATOR-003: Creator Revenue Dashboard
  async getCreatorRevenue(creatorId: string) {
    const [products, totalOrders, revenue] = await Promise.all([
      this.prisma.marketplaceProduct.count({ where: { creatorId } }),
      this.prisma.marketplaceOrder.count({
        where: { product: { creatorId }, status: 'COMPLETED' },
      }),
      this.prisma.marketplaceProduct.aggregate({
        where: { creatorId },
        _sum: { revenueGenerated: true },
      }),
    ]);
    return {
      creatorId, totalProducts: products, totalSales: totalOrders,
      totalRevenue: revenue._sum.revenueGenerated || 0,
    };
  }

  // FR-PUB-003–005: Publisher Verification Flow
  async submitPublisherForVerification(userId: string) {
    const profile = await this.prisma.publisherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Publisher profile not found');
    if (profile.isVerified) throw new ConflictException('Publisher already verified');

    // Log the verification request via event
    this.eventBus.publish('marketplace.publisher.verification.requested', { publisherId: profile.id, userId });
    return { message: 'Verification request submitted. An admin will review your profile.', publisherId: profile.id };
  }

  async processPublisherVerification(adminId: string, publisherId: string, dto: {
    approved: boolean; rejectionReason?: string;
  }) {
    const profile = await this.prisma.publisherProfile.findUnique({ where: { id: publisherId } });
    if (!profile) throw new NotFoundException('Publisher not found');

    const updated = await this.prisma.publisherProfile.update({
      where: { id: publisherId },
      data: {
        isVerified: dto.approved,
        verifiedAt: dto.approved ? new Date() : null,
      },
    });

    this.eventBus.publish('marketplace.publisher.verification.processed', {
      publisherId, approved: dto.approved, processedBy: adminId, rejectionReason: dto.rejectionReason,
    });
    return { success: true, approved: dto.approved, publisher: updated };
  }

  async listPendingVerifications(type: 'publisher' | 'creator') {
    if (type === 'publisher') {
      return this.prisma.publisherProfile.findMany({
        where: { isVerified: false },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      });
    }
    return this.prisma.creatorProfile.findMany({
      where: { isVerified: false },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // FR-MONET-004–008: Subscription / Bundle Products
  async createSubscriptionProduct(dto: {
    publisherId?: string; creatorId?: string; productName: string; description?: string;
    price: number; currency?: string; billingCycle: string; trialDays?: number;
    features: string[]; maxUsers?: number;
  }) {
    // Encode subscription config into the description field as JSON prefix
    const subscriptionMeta = JSON.stringify({
      billingCycle: dto.billingCycle,
      trialDays: dto.trialDays || 0,
      features: dto.features,
      maxUsers: dto.maxUsers,
    });
    const product = await this.prisma.marketplaceProduct.create({
      data: {
        publisherId: dto.publisherId,
        creatorId: dto.creatorId,
        productName: dto.productName,
        description: dto.description
          ? `${dto.description}\n__meta:${subscriptionMeta}`
          : `__meta:${subscriptionMeta}`,
        productType: 'SUBSCRIPTION',
        price: dto.price as any,
        currency: dto.currency || 'INR',
      },
    });
    this.eventBus.publish('marketplace.subscription.product.created', { productId: product.id });
    return product;
  }

  async updateProduct(productId: string, dto: {
    productName?: string; description?: string; price?: number;
    discountPercent?: number; isActive?: boolean; isFeatured?: boolean;
  }) {
    const product = await this.prisma.marketplaceProduct.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const discountedPrice = dto.discountPercent != null && dto.price != null
      ? dto.price * (1 - dto.discountPercent / 100)
      : dto.discountPercent != null
      ? Number(product.price) * (1 - dto.discountPercent / 100)
      : undefined;

    return this.prisma.marketplaceProduct.update({
      where: { id: productId },
      data: {
        ...(dto.productName ? { productName: dto.productName } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.price !== undefined ? { price: dto.price as any } : {}),
        ...(dto.discountPercent !== undefined ? { discountPercent: dto.discountPercent as any } : {}),
        ...(discountedPrice !== undefined ? { discountedPrice: discountedPrice as any } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
      },
    });
  }

  // FR-MARKET-003–006: Marketplace Search & Discovery
  async searchMarketplace(dto: {
    q?: string; productType?: string; minPrice?: number; maxPrice?: number;
    isFeatured?: boolean; sortBy?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
    page?: number; limit?: number;
  }) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);

    const where: any = {
      isActive: true,
      ...(dto.q ? { OR: [
        { productName: { contains: dto.q, mode: 'insensitive' } },
        { description: { contains: dto.q, mode: 'insensitive' } },
      ]} : {}),
      ...(dto.productType ? { productType: dto.productType } : {}),
      ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
      ...(dto.minPrice !== undefined || dto.maxPrice !== undefined ? {
        price: {
          ...(dto.minPrice !== undefined ? { gte: dto.minPrice } : {}),
          ...(dto.maxPrice !== undefined ? { lte: dto.maxPrice } : {}),
        },
      } : {}),
    };

    const sortMap: Record<string, any> = {
      popular: [{ salesCount: 'desc' }],
      newest: [{ createdAt: 'desc' }],
      price_asc: [{ price: 'asc' }],
      price_desc: [{ price: 'desc' }],
    };
    const orderBy = sortMap[dto.sortBy || 'popular'] || [{ salesCount: 'desc' }];

    const [items, total, facets] = await Promise.all([
      this.prisma.marketplaceProduct.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy,
      }),
      this.prisma.marketplaceProduct.count({ where }),
      this.prisma.marketplaceProduct.groupBy({
        by: ['productType'],
        where: { isActive: true },
        _count: { productType: true },
      }),
    ]);

    return {
      query: dto.q, total, page, limit,
      totalPages: Math.ceil(total / limit),
      facets: {
        productTypes: facets.map((f) => ({ value: f.productType, count: f._count.productType })),
      },
      results: items,
    };
  }

  async getFeaturedProducts(limit = 10) {
    return this.prisma.marketplaceProduct.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: [{ salesCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  async getTrendingProducts(limit = 10) {
    // Trending = most sales in last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = await this.prisma.marketplaceOrder.groupBy({
      by: ['productId'],
      where: { status: 'COMPLETED', orderedAt: { gte: since } },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const productIds = recentOrders.map((o) => o.productId);
    if (productIds.length === 0) return [];

    const products = await this.prisma.marketplaceProduct.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    // Preserve trending order
    return productIds.map((id) => ({
      ...products.find((p) => p.id === id),
      recentSales: recentOrders.find((o) => o.productId === id)?._count.productId || 0,
    })).filter((p) => p.id);
  }

  async getRelatedProducts(productId: string, limit = 6) {
    const product = await this.prisma.marketplaceProduct.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.marketplaceProduct.findMany({
      where: {
        isActive: true,
        productType: product.productType,
        id: { not: productId },
      },
      orderBy: [{ salesCount: 'desc' }],
      take: limit,
    });
  }

  // FR-OPS-001–004: Marketplace Operations / Moderation
  async moderateProduct(adminId: string, productId: string, dto: {
    action: 'approve' | 'reject' | 'suspend' | 'feature' | 'unfeature';
    reason?: string;
  }) {
    const product = await this.prisma.marketplaceProduct.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const updateData: any = {};
    if (dto.action === 'approve') updateData.isActive = true;
    else if (dto.action === 'reject' || dto.action === 'suspend') updateData.isActive = false;
    else if (dto.action === 'feature') updateData.isFeatured = true;
    else if (dto.action === 'unfeature') updateData.isFeatured = false;

    const updated = await this.prisma.marketplaceProduct.update({
      where: { id: productId },
      data: updateData,
    });

    this.eventBus.publish('marketplace.product.moderated', {
      productId, action: dto.action, moderatedBy: adminId, reason: dto.reason,
    });

    return { success: true, action: dto.action, product: updated };
  }

  async getMarketplaceStats(adminId: string) {
    const [totalProducts, activeProducts, totalOrders, totalRevenue,
      publishers, creators, pendingVerifications] = await Promise.all([
      this.prisma.marketplaceProduct.count(),
      this.prisma.marketplaceProduct.count({ where: { isActive: true } }),
      this.prisma.marketplaceOrder.count({ where: { status: 'COMPLETED' } }),
      this.prisma.marketplaceOrder.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      this.prisma.publisherProfile.count({ where: { isVerified: true } }),
      this.prisma.creatorProfile.count(),
      this.prisma.publisherProfile.count({ where: { isVerified: false } }),
    ]);

    return {
      products: { total: totalProducts, active: activeProducts, inactive: totalProducts - activeProducts },
      orders: { total: totalOrders },
      revenue: { total: totalRevenue._sum.totalAmount || 0 },
      sellers: { publishers, creators, pendingVerifications },
    };
  }

  async getPublisherRevenue(publisherId: string) {
    const [products, totalOrders, revenue] = await Promise.all([
      this.prisma.marketplaceProduct.count({ where: { publisherId } }),
      this.prisma.marketplaceOrder.count({
        where: { product: { publisherId }, status: 'COMPLETED' },
      }),
      this.prisma.marketplaceProduct.aggregate({
        where: { publisherId },
        _sum: { revenueGenerated: true },
      }),
    ]);
    return {
      publisherId, totalProducts: products, totalSales: totalOrders,
      totalRevenue: revenue._sum.revenueGenerated || 0,
    };
  }
}
