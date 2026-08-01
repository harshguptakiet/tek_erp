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

  // ==================== LIVE INTERACTIVITY (FR-VIDEO-003-010) ====================

  @Post(':id/chat')
  @ApiOperation({ summary: 'Send chat message (FR-VIDEO-003)' })
  sendChatMessage(@Request() req, @Param('id') id: string, @Body('message') message: string) {
    return this.service.sendChatMessage(id, req.user.userId, message);
  }

  @Get(':id/chat')
  @ApiOperation({ summary: 'Get chat history (FR-VIDEO-003)' })
  getChatHistory(@Param('id') id: string) {
    return this.service.getChatHistory(id);
  }

  @Post(':id/raise-hand')
  @ApiOperation({ summary: 'Raise hand in live class (FR-VIDEO-004)' })
  raiseHand(@Request() req, @Param('id') id: string) {
    return this.service.raiseHand(id, req.user.userId);
  }

  @Post(':id/lower-hand')
  @ApiOperation({ summary: 'Lower hand in live class (FR-VIDEO-004)' })
  lowerHand(@Request() req, @Param('id') id: string) {
    return this.service.lowerHand(id, req.user.userId);
  }

  @Get(':id/raised-hands')
  @ApiOperation({ summary: 'Get list of raised hands (FR-VIDEO-004)' })
  getRaisedHands(@Param('id') id: string) {
    return this.service.getRaisedHands(id);
  }

  @Post(':id/screen-share/start')
  @ApiOperation({ summary: 'Start screen share (FR-VIDEO-005)' })
  startScreenShare(@Request() req, @Param('id') id: string, @Body('streamId') streamId?: string) {
    return this.service.startScreenShare(id, req.user.userId, streamId);
  }

  @Post(':id/screen-share/stop')
  @ApiOperation({ summary: 'Stop screen share (FR-VIDEO-005)' })
  stopScreenShare(@Request() req, @Param('id') id: string) {
    return this.service.stopScreenShare(id, req.user.userId);
  }

  @Post(':id/whiteboard')
  @ApiOperation({ summary: 'Create whiteboard session (FR-VIDEO-006)' })
  createWhiteboardSession(@Request() req, @Param('id') id: string) {
    return this.service.createWhiteboardSession(id, req.user.userId);
  }

  @Get(':id/whiteboard')
  @ApiOperation({ summary: 'Get whiteboard data (FR-VIDEO-006)' })
  getWhiteboardData(@Param('id') id: string) {
    return this.service.getWhiteboardData(id);
  }

  @Put(':id/whiteboard')
  @ApiOperation({ summary: 'Update whiteboard canvas (FR-VIDEO-006)' })
  updateWhiteboard(@Param('id') id: string, @Body('elements') elements: any[]) {
    return this.service.updateWhiteboard(id, elements);
  }

  @Post(':id/breakout-rooms')
  @ApiOperation({ summary: 'Create breakout room (FR-VIDEO-007)' })
  createBreakoutRoom(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('participantUserIds') participantUserIds: string[],
  ) {
    return this.service.createBreakoutRoom(id, name, participantUserIds);
  }

  @Get(':id/breakout-rooms')
  @ApiOperation({ summary: 'List breakout rooms (FR-VIDEO-007)' })
  listBreakoutRooms(@Param('id') id: string) {
    return this.service.listBreakoutRooms(id);
  }

  @Post(':id/polls')
  @ApiOperation({ summary: 'Create live poll/quiz (FR-VIDEO-008)' })
  createPoll(
    @Request() req,
    @Param('id') id: string,
    @Body('question') question: string,
    @Body('options') options: string[],
  ) {
    return this.service.createPoll(id, req.user.userId, question, options);
  }

  @Post('polls/:pollId/respond')
  @ApiOperation({ summary: 'Submit response to live poll (FR-VIDEO-008)' })
  submitPollResponse(
    @Request() req,
    @Param('pollId') pollId: string,
    @Body('optionIndex') optionIndex: number,
  ) {
    return this.service.submitPollResponse(pollId, req.user.userId, optionIndex);
  }

  @Get('polls/:pollId/results')
  @ApiOperation({ summary: 'Get live poll results (FR-VIDEO-008)' })
  getPollResults(@Param('pollId') pollId: string) {
    return this.service.getPollResults(pollId);
  }

  @Get(':id/auto-attendance')
  @ApiOperation({ summary: 'Get auto-tracked class attendance (FR-VIDEO-009)' })
  getAutoAttendance(@Param('id') id: string) {
    return this.service.getAutoAttendance(id);
  }

  @Post(':id/resources')
  @ApiOperation({ summary: 'Add class resource file (FR-VIDEO-010)' })
  addClassResource(
    @Request() req,
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('fileUrl') fileUrl: string,
  ) {
    return this.service.addClassResource(id, req.user.userId, title, fileUrl);
  }

  @Get(':id/resources')
  @ApiOperation({ summary: 'List class resources (FR-VIDEO-010)' })
  listClassResources(@Param('id') id: string) {
    return this.service.listClassResources(id);
  }
}
