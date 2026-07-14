import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create subscription (FR-SUB-001)' })
  create(@Request() req, @Body() dto: any) {
    return this.service.createSubscription(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions (FR-SUB-003)' })
  list(
    @Query('organizationId') organizationId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('tier') tier?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listSubscriptions({
      organizationId, userId, status, tier,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Subscription analytics (FR-ANALYTICS-001)' })
  analytics(@Query('organizationId') organizationId?: string) {
    return this.service.getSubscriptionAnalytics(organizationId);
  }

  @Get('upcoming-renewals')
  @ApiOperation({ summary: 'Get upcoming auto-renewals (FR-BILLING-001)' })
  upcomingRenewals(@Query('daysAhead') daysAhead?: string) {
    return this.service.getUpcomingRenewals(daysAhead ? parseInt(daysAhead) : 30);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring subscriptions (FR-BILLING-002)' })
  expiring(@Query('daysAhead') daysAhead?: string) {
    return this.service.getExpiringSubscriptions(daysAhead ? parseInt(daysAhead) : 14);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription (FR-SUB-002)' })
  get(@Param('id') id: string) {
    return this.service.getSubscription(id);
  }

  @Put(':id/upgrade')
  @ApiOperation({ summary: 'Upgrade subscription (FR-LIFECYCLE-001)' })
  upgrade(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.upgradeSubscription(req.user.userId, id, dto);
  }

  @Put(':id/downgrade')
  @ApiOperation({ summary: 'Downgrade subscription (FR-LIFECYCLE-002)' })
  downgrade(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.downgradeSubscription(req.user.userId, id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription (FR-LIFECYCLE-003)' })
  cancel(@Request() req, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.service.cancelSubscription(req.user.userId, id, body.reason);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew subscription (FR-LIFECYCLE-004)' })
  renew(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.renewSubscription(req.user.userId, id, dto);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause subscription (FR-LIFECYCLE-005)' })
  pause(@Request() req, @Param('id') id: string) {
    return this.service.pauseSubscription(req.user.userId, id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume subscription (FR-LIFECYCLE-006)' })
  resume(@Request() req, @Param('id') id: string) {
    return this.service.resumeSubscription(req.user.userId, id);
  }
}

// License controller
@ApiTags('Licenses')
@Controller('licenses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LicensesController {
  constructor(private readonly service: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create license pool (FR-LICENSE-001)' })
  create(@Request() req, @Body() dto: any) {
    return this.service.createLicense(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List licenses for organization (FR-LICENSE-005)' })
  list(@Query('organizationId') organizationId: string, @Query('isActive') isActive?: string) {
    return this.service.listLicenses(organizationId, isActive !== undefined ? isActive === 'true' : undefined);
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get license usage analytics (FR-LICENSE-004)' })
  usage(@Param('id') id: string) {
    return this.service.getLicenseUsage(id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign license to user (FR-LICENSE-002)' })
  assign(@Request() req, @Param('id') id: string, @Body() body: { userId: string }) {
    return this.service.assignLicense(req.user.userId, id, body.userId);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke license from user (FR-LICENSE-003)' })
  revoke(@Request() req, @Param('id') id: string, @Body() body: { userId: string }) {
    return this.service.revokeLicense(req.user.userId, id, body.userId);
  }
}
