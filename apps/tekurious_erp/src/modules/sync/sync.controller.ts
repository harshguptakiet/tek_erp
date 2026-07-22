import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncService } from './sync.service';

@ApiTags('Sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // FR-SYNC-001: Manual Sync Trigger
  @Post('trigger')
  @ApiOperation({ summary: 'Trigger manual sync (FR-SYNC-001)' })
  async triggerSync(
    @Request() req,
    @Body()
    dto: {
      organizationId: string;
      syncType: string;
      entityTypes: string[];
    },
  ) {
    return this.syncService.triggerManualSync(
      req.user.userId,
      dto.organizationId,
      dto.syncType,
      dto.entityTypes,
    );
  }

  // FR-SYNC-002: Sync Status Monitoring
  @Get('status/:syncId')
  @ApiOperation({ summary: 'Get sync status (FR-SYNC-002)' })
  async getSyncStatus(@Param('syncId') syncId: string) {
    return this.syncService.getSyncStatus(syncId);
  }

  @Get('history/:organizationId')
  @ApiOperation({ summary: 'Get sync history for organization' })
  async getSyncHistory(
    @Param('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dataType') dataType?: string,
  ) {
    return this.syncService.getSyncHistory(
      organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      dataType,
    );
  }

  @Get('failures/:organizationId')
  @ApiOperation({ summary: 'Get recent sync failures' })
  async getSyncFailures(
    @Param('organizationId') organizationId: string,
    @Query('limit') limit?: string,
  ) {
    return this.syncService.getSyncFailures(
      organizationId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('retry/:syncId')
  @ApiOperation({ summary: 'Retry failed sync' })
  async retrySync(@Request() req, @Param('syncId') syncId: string) {
    return this.syncService.retryFailedSync(req.user.userId, syncId);
  }
}
