import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // ── Notifications ────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Send notification (FR-NOTIF-001)' })
  send(@Body() dto: any) {
    return this.service.sendNotification(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk notification (FR-NOTIF-002)' })
  sendBulk(@Body() dto: any) {
    return this.service.sendBulkNotification(dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my notifications (FR-NOTIF-003)' })
  getMyNotifications(
    @Request() req,
    @Query('isRead') isRead?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getUserNotifications(req.user.userId, {
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      type,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read (FR-NOTIF-004)' })
  markRead(@Request() req, @Param('id') id: string) {
    return this.service.markAsRead(req.user.userId, id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read (FR-NOTIF-005)' })
  markAllRead(@Request() req) {
    return this.service.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification (FR-NOTIF-006)' })
  delete(@Request() req, @Param('id') id: string) {
    return this.service.deleteNotification(req.user.userId, id);
  }

  // ── Preferences ──────────────────────────────────────────────────────────
  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences (FR-NOTIF-007)' })
  getPreferences(@Request() req) {
    return this.service.getPreferences(req.user.userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences (FR-NOTIF-008)' })
  updatePreferences(@Request() req, @Body() dto: any) {
    return this.service.updatePreferences(req.user.userId, dto);
  }

  // ── Templates ────────────────────────────────────────────────────────────
  @Post('templates')
  @ApiOperation({ summary: 'Create notification template (FR-EMAIL-001)' })
  createTemplate(@Request() req, @Body() dto: any) {
    return this.service.createTemplate(req.user.userId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List notification templates' })
  listTemplates(@Query('type') type?: string) {
    return this.service.listTemplates(type);
  }

  // ── Delivery Status ──────────────────────────────────────────────────────
  @Get(':id/delivery')
  @ApiOperation({ summary: 'Get notification delivery status' })
  deliveryStatus(@Param('id') id: string) {
    return this.service.getDeliveryStatus(id);
  }

  // ── Logs ─────────────────────────────────────────────────────────────────
  @Get('logs/email')
  @ApiOperation({ summary: 'Get email logs (FR-EMAIL-002)' })
  emailLogs(@Query('userId') userId?: string, @Query('status') status?: string) {
    return this.service.getEmailLogs(userId, status);
  }

  @Get('logs/sms')
  @ApiOperation({ summary: 'Get SMS logs (FR-SMS-001)' })
  smsLogs(@Query('userId') userId?: string) {
    return this.service.getSMSLogs(userId);
  }
}

// ── Messaging Controller (separate prefix) ───────────────────────────────────
import { Controller as MsgController } from '@nestjs/common';

@ApiTags('Messaging')
@MsgController('messaging')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly service: NotificationsService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create conversation (FR-MSG-001)' })
  createConversation(@Request() req, @Body() dto: any) {
    return this.service.createConversation(req.user.userId, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get my conversations (FR-MSG-002)' })
  getConversations(@Request() req) {
    return this.service.getUserConversations(req.user.userId);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message (FR-MSG-003)' })
  sendMessage(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.sendMessage(req.user.userId, id, dto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in conversation (FR-MSG-004)' })
  getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getMessages(
      req.user.userId, id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
