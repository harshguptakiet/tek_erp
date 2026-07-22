import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SystemService } from './system.service';

@ApiTags('System')
@Controller('system')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SystemController {
  constructor(private readonly service: SystemService) {}

  // Health
  @Get('health')
  @ApiOperation({ summary: 'System health check (FR-ERROR-002)' })
  health() {
    return this.service.getSystemHealth();
  }

  // Jobs
  @Post('jobs')
  @ApiOperation({ summary: 'Create background job (FR-SYS-001)' })
  createJob(@Body() dto: any) {
    return this.service.createJob(dto);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List background jobs (FR-SYS-001)' })
  listJobs(
    @Query('status') status?: string,
    @Query('jobType') jobType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listJobs({ status, jobType, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 20 });
  }

  @Get('jobs/dead-letters')
  @ApiOperation({ summary: 'Get dead letter jobs' })
  deadLetters() {
    return this.service.getDeadLetterJobs();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get job details' })
  getJob(@Param('id') id: string) {
    return this.service.getJob(id);
  }

  @Put('jobs/:id/status')
  @ApiOperation({ summary: 'Update job status' })
  updateJobStatus(@Param('id') id: string, @Body() body: { status: string; result?: any; error?: string }) {
    return this.service.updateJobStatus(id, body.status, body.result, body.error);
  }

  @Post('jobs/:id/retry')
  @ApiOperation({ summary: 'Retry failed job (FR-SYS-002)' })
  retryJob(@Param('id') id: string) {
    return this.service.retryJob(id);
  }

  // Cache
  @Get('cache/:key')
  @ApiOperation({ summary: 'Get cache entry (FR-CACHE-001)' })
  getCache(@Param('key') key: string) {
    return this.service.getCache(key);
  }

  @Post('cache')
  @ApiOperation({ summary: 'Set cache entry (FR-CACHE-001)' })
  setCache(@Body() body: { key: string; value: string; ttl?: number; tags?: string[] }) {
    return this.service.setCache(body.key, body.value, body.ttl, body.tags);
  }

  @Post('cache/invalidate')
  @ApiOperation({ summary: 'Invalidate cache by tags (FR-CACHE-002)' })
  invalidateCache(@Body() body: { tags: string[] }) {
    return this.service.invalidateCache(body.tags);
  }

  @Post('cache/clear-expired')
  @ApiOperation({ summary: 'Clear expired cache entries' })
  clearExpired() {
    return this.service.clearExpiredCache();
  }

  // Audit Logs
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs (FR-AUDIT-001)' })
  getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('tableName') tableName?: string,
    @Query('organizationId') organizationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getAuditLogs({
      userId, action, tableName, organizationId, startDate, endDate,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  // Error Logs
  @Get('error-logs')
  @ApiOperation({ summary: 'Get error logs (FR-ERROR-001)' })
  getErrorLogs(
    @Query('level') level?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getErrorLogs({ level, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 50 });
  }

  @Post('error-logs')
  @ApiOperation({ summary: 'Log error event' })
  logError(@Request() req, @Body() dto: any) {
    return this.service.logError({ ...dto, userId: req.user.userId });
  }

  // System Config
  @Get('config')
  @ApiOperation({ summary: 'Get system configuration (FR-SYS-003)' })
  getConfig(@Query('organizationId') organizationId?: string) {
    return this.service.getSystemConfig(organizationId);
  }

  @Put('config')
  @ApiOperation({ summary: 'Update system configuration' })
  updateConfig(@Body() dto: any) {
    return this.service.updateSystemConfig(dto);
  }

  // Feature Flags
  @Get('feature-flags')
  @ApiOperation({ summary: 'List all feature flags (FR-SYS-001)' })
  getFlags() {
    return this.service.getFeatureFlags();
  }

  @Get('feature-flags/:name')
  @ApiOperation({ summary: 'Get feature flag status' })
  getFlag(@Param('name') name: string, @Query('userId') userId?: string) {
    return this.service.isFeatureEnabled(name, userId);
  }

  @Put('feature-flags/:name')
  @ApiOperation({ summary: 'Set feature flag (FR-SYS-001)' })
  setFlag(@Param('name') name: string, @Body() body: { isEnabled: boolean; enabledFor?: string[] }) {
    return this.service.setFeatureFlag(name, body.isEnabled, body.enabledFor);
  }

  // ── Cloud Sync & Offline (FR-SYNC-001/002) ──────────────────────────────

  @Get('sync/status')
  @ApiOperation({ summary: 'Get sync status (FR-SYNC-001)' })
  getSyncStatus(@Query('organizationId') organizationId?: string) {
    return this.service.getSyncStatus(organizationId);
  }

  @Post('sync/trigger')
  @ApiOperation({ summary: 'Trigger cloud sync (FR-SYNC-001)' })
  triggerSync(@Body() dto: any) {
    return this.service.triggerSync(dto);
  }

  @Get('sync/offline-config/:organizationId')
  @ApiOperation({ summary: 'Get offline configuration (FR-SYNC-002)' })
  getOfflineConfig(@Param('organizationId') organizationId: string) {
    return this.service.getOfflineConfig(organizationId);
  }

  // ── Backups & Data Retention (FR-DATA-001/002) ──────────────────────────

  @Post('backups/trigger')
  @ApiOperation({ summary: 'Trigger backup (FR-DATA-001)' })
  triggerBackup(@Body() dto: any) {
    return this.service.triggerBackup(dto);
  }

  @Get('backups/history')
  @ApiOperation({ summary: 'Get backup history (FR-DATA-001)' })
  getBackupHistory(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.getBackupHistory(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Get('data/retention-policy')
  @ApiOperation({ summary: 'Get data retention policy (FR-DATA-002)' })
  getRetentionPolicy() {
    return this.service.getRetentionPolicy();
  }

  @Post('data/cleanup')
  @ApiOperation({ summary: 'Run data cleanup (FR-DATA-002)' })
  runDataCleanup(@Body() dto: any) {
    return this.service.runDataCleanup(dto);
  }
}
