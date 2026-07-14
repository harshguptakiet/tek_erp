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
}
