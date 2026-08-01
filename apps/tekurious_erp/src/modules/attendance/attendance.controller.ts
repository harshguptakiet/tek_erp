import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Mark student attendance (FR-ATT-001)' })
  mark(@Request() req, @Body() dto: any) {
    return this.service.markAttendance(req.user.userId, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk mark section attendance (FR-ATT-002)' })
  bulkMark(@Request() req, @Body() dto: any) {
    return this.service.bulkMarkAttendance(req.user.userId, dto);
  }

  @Get('sections/:sectionId')
  @ApiOperation({ summary: 'Get section attendance for a date (FR-ATT-003)' })
  sectionAttendance(
    @Param('sectionId') sectionId: string,
    @Query('date') date: string,
    @Query('period') period?: string,
  ) {
    return this.service.getSectionAttendance(sectionId, date, period ? parseInt(period) : undefined);
  }

  @Get('students/:studentId/summary')
  @ApiOperation({ summary: 'Get student attendance summary (FR-ATT-004)' })
  studentSummary(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.service.getStudentAttendanceSummary(studentId, { startDate, endDate, schoolId });
  }

  @Put(':id/correct')
  @ApiOperation({ summary: 'Correct attendance record (FR-ATT-005)' })
  correct(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.correctAttendance(req.user.userId, id, dto);
  }

  @Post('teachers')
  @ApiOperation({ summary: 'Mark teacher attendance (FR-ATT-006)' })
  markTeacher(@Request() req, @Body() dto: any) {
    return this.service.markTeacherAttendance(req.user.userId, dto);
  }

  @Get('teachers/:teacherId')
  @ApiOperation({ summary: 'Get teacher attendance (FR-ATT-007)' })
  teacherAttendance(
    @Param('teacherId') teacherId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getTeacherAttendance(teacherId, startDate, endDate);
  }

  @Get('schools/:schoolId/report')
  @ApiOperation({ summary: 'School attendance report for a date (FR-ATT-008)' })
  schoolReport(@Param('schoolId') schoolId: string, @Query('date') date: string) {
    return this.service.getSchoolAttendanceReport(schoolId, date);
  }

  @Get('sections/:sectionId/analytics')
  @ApiOperation({ summary: 'Monthly attendance analytics (FR-ATT-009)' })
  analytics(@Param('sectionId') sectionId: string, @Query('month') month: string) {
    return this.service.getAttendanceAnalytics(sectionId, month);
  }

  @Get('schools/:schoolId/alerts')
  @ApiOperation({ summary: 'Get absent student alerts (FR-ATT-010)' })
  alerts(
    @Param('schoolId') schoolId: string,
    @Query('date') date: string,
    @Query('threshold') threshold?: string,
  ) {
    return this.service.getAbsentStudents(schoolId, date, threshold ? parseInt(threshold) : undefined);
  }

  // ── Biometric & Device Integration ──────────────────────────────────────
  @Post('devices')
  @ApiOperation({ summary: 'Register biometric device (FR-ATT-011)' })
  registerDevice(@Request() req, @Body() dto: any) {
    return this.service.registerBiometricDevice(req.user.userId, dto);
  }

  @Get('devices')
  @ApiOperation({ summary: 'List biometric devices (FR-ATT-012)' })
  listDevices(
    @Query('schoolId') schoolId: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.listBiometricDevices(schoolId, isActive === 'true');
  }

  @Get('devices/:deviceId')
  @ApiOperation({ summary: 'Get device details' })
  getDevice(@Param('deviceId') deviceId: string) {
    return this.service.getDeviceDetails(deviceId);
  }

  @Post('devices/punch')
  @ApiOperation({ summary: 'Process biometric punch (FR-ATT-013)' })
  processPunch(@Body() dto: any) {
    return this.service.processBiometricPunch(dto);
  }

  @Get('biometric-logs')
  @ApiOperation({ summary: 'Get biometric logs (FR-ATT-014)' })
  getBiometricLogs(
    @Query('deviceId') deviceId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userType') userType?: string,
    @Query('processed') processed?: string,
  ) {
    return this.service.getBiometricLogs({
      deviceId,
      schoolId,
      userId,
      startDate,
      endDate,
      userType,
      processed: processed === 'true' ? true : processed === 'false' ? false : undefined,
    });
  }

  @Post('devices/:deviceId/sync')
  @ApiOperation({ summary: 'Sync biometric data (FR-ATT-015)' })
  syncBiometricData(@Param('deviceId') deviceId: string, @Body() body: { punches: any[] }) {
    return this.service.syncBiometricData(deviceId, body.punches);
  }

  @Put('devices/:deviceId/status')
  @ApiOperation({ summary: 'Update device status' })
  updateDeviceStatus(@Param('deviceId') deviceId: string, @Body() body: { isActive: boolean }) {
    return this.service.updateDeviceStatus(deviceId, body.isActive);
  }

  // ==================== ADVANCED ATTENDANCE METHODS (FR-ATT-012-015) ====================

  @Post('rfid/register')
  @ApiOperation({ summary: 'Register RFID card (FR-ATT-012)' })
  registerRfidCard(@Body() dto: { userId: string; rfidCardId: string }) {
    return this.service.registerRfidCard(dto.userId, dto.rfidCardId);
  }

  @Post('rfid/swipe')
  @ApiOperation({ summary: 'Process RFID card swipe (FR-ATT-012)' })
  processRfidSwipe(@Body() dto: { rfidCardId: string; locationId?: string }) {
    return this.service.processRfidSwipe(dto.rfidCardId, dto.locationId);
  }

  @Post('geofence/configure')
  @ApiOperation({ summary: 'Configure school geofence boundary (FR-ATT-013)' })
  configureGeofence(@Body() dto: { schoolId: string; centerLat: number; centerLng: number; radiusMeters: number }) {
    return this.service.configureGeofence(dto.schoolId, dto.centerLat, dto.centerLng, dto.radiusMeters);
  }

  @Post('geofence/mark')
  @ApiOperation({ summary: 'Mark geo-fenced attendance (FR-ATT-013)' })
  markGeoAttendance(@Request() req, @Body() dto: { lat: number; lng: number; schoolId: string }) {
    return this.service.markGeoAttendance(req.user.userId, dto.lat, dto.lng, dto.schoolId);
  }

  @Post('qr/generate')
  @ApiOperation({ summary: 'Generate attendance QR code token (FR-ATT-014)' })
  generateAttendanceQR(@Body() dto: { schoolId: string; sectionId?: string }) {
    return this.service.generateAttendanceQR(dto.schoolId, dto.sectionId);
  }

  @Post('qr/mark')
  @ApiOperation({ summary: 'Mark QR code attendance (FR-ATT-014)' })
  markQRAttendance(@Request() req, @Body('qrToken') qrToken: string) {
    return this.service.markQRAttendance(req.user.userId, qrToken);
  }

  @Post('face/enroll')
  @ApiOperation({ summary: 'Enroll face template (FR-ATT-015)' })
  enrollFace(@Request() req, @Body('faceEncoding') faceEncoding: string) {
    return this.service.enrollFace(req.user.userId, faceEncoding);
  }

  @Post('face/mark')
  @ApiOperation({ summary: 'Mark face recognition attendance (FR-ATT-015)' })
  markFaceAttendance(@Body() dto: { faceEncoding: string; deviceId: string }) {
    return this.service.markFaceAttendance(dto.faceEncoding, dto.deviceId);
  }
}
