import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@Controller('marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  // ── Publisher profiles ───────────────────────────────────────────────────
  @Post('publishers')
  @ApiOperation({ summary: 'Create publisher profile (FR-PUB-001)' })
  createPublisher(@Request() req, @Body() dto: any) {
    return this.service.createPublisherProfile(req.user.userId, dto);
  }

  @Get('publishers/me')
  @ApiOperation({ summary: 'Get my publisher profile (FR-PUB-002)' })
  getMyPublisher(@Request() req) {
    return this.service.getPublisherProfile(req.user.userId);
  }

  @Post('publishers/verify')
  @ApiOperation({ summary: 'Submit publisher for verification (FR-PUB-003)' })
  submitVerification(@Request() req) {
    return this.service.submitPublisherForVerification(req.user.userId);
  }

  @Put('publishers/:publisherId/verify')
  @ApiOperation({ summary: 'Approve/reject publisher verification (FR-PUB-004, admin)' })
  processVerification(
    @Request() req,
    @Param('publisherId') publisherId: string,
    @Body() dto: { approved: boolean; rejectionReason?: string },
  ) {
    return this.service.processPublisherVerification(req.user.userId, publisherId, dto);
  }

  @Get('verifications/pending')
  @ApiOperation({ summary: 'List pending publisher/creator verifications (FR-PUB-005)' })
  pendingVerifications(@Query('type') type: 'publisher' | 'creator' = 'publisher') {
    return this.service.listPendingVerifications(type);
  }

  @Get('publishers/:publisherId/revenue')
  @ApiOperation({ summary: 'Get publisher revenue dashboard' })
  publisherRevenue(@Param('publisherId') publisherId: string) {
    return this.service.getPublisherRevenue(publisherId);
  }

  // ── Creator profiles ─────────────────────────────────────────────────────
  @Post('creators')
  @ApiOperation({ summary: 'Create creator profile (FR-CREATOR-001)' })
  createCreator(@Request() req, @Body() dto: any) {
    return this.service.createCreatorProfile(req.user.userId, dto);
  }

  @Get('creators/me')
  @ApiOperation({ summary: 'Get my creator profile (FR-CREATOR-002)' })
  getMyCreator(@Request() req) {
    return this.service.getCreatorProfile(req.user.userId);
  }

  @Get('creators/:creatorId/revenue')
  @ApiOperation({ summary: 'Get creator revenue dashboard (FR-CREATOR-003)' })
  creatorRevenue(@Param('creatorId') creatorId: string) {
    return this.service.getCreatorRevenue(creatorId);
  }

  // ── Products ─────────────────────────────────────────────────────────────
  @Post('products')
  @ApiOperation({ summary: 'Create marketplace product (FR-MONET-001)' })
  createProduct(@Body() dto: any) {
    return this.service.createProduct(dto);
  }

  @Post('products/subscription')
  @ApiOperation({ summary: 'Create subscription product (FR-MONET-004)' })
  createSubscriptionProduct(@Body() dto: any) {
    return this.service.createSubscriptionProduct(dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'List marketplace products (FR-MARKET-001)' })
  listProducts(
    @Query('productType') productType?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listProducts({
      productType,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('products/featured')
  @ApiOperation({ summary: 'Get featured products (FR-MARKET-003)' })
  featuredProducts(@Query('limit') limit?: string) {
    return this.service.getFeaturedProducts(limit ? parseInt(limit) : 10);
  }

  @Get('products/trending')
  @ApiOperation({ summary: 'Get trending products (FR-MARKET-004)' })
  trendingProducts(@Query('limit') limit?: string) {
    return this.service.getTrendingProducts(limit ? parseInt(limit) : 10);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details (FR-MARKET-002)' })
  getProduct(@Param('id') id: string) {
    return this.service.getProduct(id);
  }

  @Get('products/:id/related')
  @ApiOperation({ summary: 'Get related products (FR-MARKET-005)' })
  relatedProducts(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.service.getRelatedProducts(id, limit ? parseInt(limit) : 6);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product (FR-MONET-005)' })
  updateProduct(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateProduct(id, dto);
  }

  // ── Search & Discovery ───────────────────────────────────────────────────
  @Get('search')
  @ApiOperation({ summary: 'Marketplace search with facets (FR-MARKET-006)' })
  searchMarketplace(
    @Query('q') q?: string,
    @Query('productType') productType?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.searchMarketplace({
      q, productType,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      sortBy: sortBy as any,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  // ── Orders / Purchases ───────────────────────────────────────────────────
  @Post('products/:id/purchase')
  @ApiOperation({ summary: 'Purchase product (FR-PAYOUT-001)' })
  purchase(@Request() req, @Param('id') id: string) {
    return this.service.purchaseProduct(req.user.userId, id);
  }

  @Get('orders/my')
  @ApiOperation({ summary: 'Get my orders (FR-PAYOUT-002)' })
  myOrders(@Request() req) {
    return this.service.getBuyerOrders(req.user.userId);
  }

  // ── Operations / Moderation ──────────────────────────────────────────────
  @Put('products/:id/moderate')
  @ApiOperation({ summary: 'Moderate a product (FR-OPS-001)' })
  moderateProduct(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: { action: 'approve' | 'reject' | 'suspend' | 'feature' | 'unfeature'; reason?: string },
  ) {
    return this.service.moderateProduct(req.user.userId, id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Marketplace admin statistics (FR-OPS-002)' })
  marketplaceStats(@Request() req) {
    return this.service.getMarketplaceStats(req.user.userId);
  }

  // ── Subscription Management (FR-MONET-006 to FR-MONET-008) ────────────────

  @Put('subscriptions/:orderId')
  @ApiOperation({ summary: 'Manage subscription (pause/resume/cancel) (FR-MONET-006)' })
  manageSubscription(@Request() req, @Param('orderId') orderId: string, @Body() dto: { action: 'PAUSE' | 'RESUME' | 'CANCEL' }) {
    return this.service.manageSubscription(req.user.userId, orderId, dto.action);
  }

  @Get('subscriptions/my')
  @ApiOperation({ summary: 'Get my subscriptions (FR-MONET-007)' })
  mySubscriptions(@Request() req) {
    return this.service.getSubscriptionDetails(req.user.userId);
  }

  @Get('subscriptions/product/:productId')
  @ApiOperation({ summary: 'Get product subscribers (FR-MONET-008)' })
  productSubscribers(@Param('productId') productId: string) {
    return this.service.getProductSubscribers(productId);
  }

  // ── Reviews & Ratings (FR-OPS-003 to FR-OPS-004) ──────────────────────────

  @Post('products/:productId/reviews')
  @ApiOperation({ summary: 'Submit product review (FR-OPS-003)' })
  submitReview(@Request() req, @Param('productId') productId: string, @Body() dto: any) {
    return this.service.submitProductReview(req.user.userId, { ...dto, productId });
  }

  @Get('products/:productId/reviews')
  @ApiOperation({ summary: 'Get product reviews (FR-OPS-004)' })
  getReviews(
    @Param('productId') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getProductReviews(productId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }
}
