import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LiveClassesService } from './live-classes.service';

@ApiTags('Live Classes')
@Controller('live-classes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LiveClassesController {
  constructor(private readonly service: LiveClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule live class (FR-LIVE-001)' })
  schedule(@Request() req, @Body() dto: any) {
    return this.service.scheduleClass(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List live classes (FR-LIVE-005)' })
  list(
    @Query('teacherId') teacherId?: string,
    @Query('classId') classId?: string,
    @Query('status') status?: string,
    @Query('classMode') classMode?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.listClasses({ teacherId, classId, status, classMode, startDate, endDate });
  }

  @Get('teacher/:teacherId/schedule')
  @ApiOperation({ summary: 'Get teacher upcoming schedule (FR-ADMIN-001)' })
  teacherSchedule(@Param('teacherId') teacherId: string) {
    return this.service.getTeacherSchedule(teacherId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get live class details (FR-META-001)' })
  get(@Param('id') id: string) {
    return this.service.getClass(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start live class (FR-LIVE-002)' })
  start(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.startClass(req.user.userId, id, dto);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End live class (FR-LIVE-003)' })
  end(@Request() req, @Param('id') id: string) {
    return this.service.endClass(req.user.userId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel live class (FR-LIVE-004)' })
  cancel(@Request() req, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.service.cancelClass(req.user.userId, id, body.reason);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join live class (FR-VIDEO-001)' })
  join(@Request() req, @Param('id') id: string) {
    return this.service.joinClass(req.user.userId, id);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave live class (FR-VIDEO-002)' })
  leave(@Request() req, @Param('id') id: string) {
    return this.service.leaveClass(req.user.userId, id);
  }

  @Post(':id/remove-participant')
  @ApiOperation({ summary: 'Remove participant (FR-META-002)' })
  removeParticipant(@Request() req, @Param('id') id: string, @Body() body: { userId: string }) {
    return this.service.removeParticipant(req.user.userId, id, body.userId);
  }

  @Post(':id/recordings')
  @ApiOperation({ summary: 'Add class recording (FR-POST-001)' })
  addRecording(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.addRecording(req.user.userId, id, dto);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get class analytics (FR-POST-002)' })
  analytics(@Param('id') id: string) {
    return this.service.getClassAnalytics(id);
  }
}
