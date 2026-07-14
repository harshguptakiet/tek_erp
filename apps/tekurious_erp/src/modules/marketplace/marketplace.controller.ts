import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@Controller('marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  // Publisher profiles
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

  // Creator profiles
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

  // Products
  @Post('products')
  @ApiOperation({ summary: 'Create marketplace product (FR-MONET-001)' })
  createProduct(@Body() dto: any) {
    return this.service.createProduct(dto);
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

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details (FR-MARKET-002)' })
  getProduct(@Param('id') id: string) {
    return this.service.getProduct(id);
  }

  // Orders / Purchases
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
}
