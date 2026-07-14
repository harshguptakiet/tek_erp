import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  // ── Student Analytics ────────────────────────────────────────────────────
  @Get('students/:studentId')
  @ApiOperation({ summary: 'Get student analytics (FR-STU-ANALYTICS-001)' })
  studentAnalytics(@Param('studentId') studentId: string) {
    return this.service.getStudentAnalytics(studentId);
  }

  @Get('students/:studentId/trend')
  @ApiOperation({ summary: 'Get student performance trend (FR-STU-ANALYTICS-002)' })
  studentTrend(@Param('studentId') studentId: string) {
    return this.service.getStudentPerformanceTrend(studentId);
  }

  @Get('students/:studentId/attendance')
  @ApiOperation({ summary: 'Get student attendance analytics (FR-STU-ANALYTICS-003)' })
  studentAttendance(
    @Param('studentId') studentId: string,
    @Query('schoolId') schoolId: string,
  ) {
    return this.service.getStudentAttendanceAnalytics(studentId, schoolId);
  }

  // ── Teacher Analytics ────────────────────────────────────────────────────
  @Get('teachers/:teacherId')
  @ApiOperation({ summary: 'Get teacher analytics (FR-TEACH-ANALYTICS-001)' })
  teacherAnalytics(@Param('teacherId') teacherId: string) {
    return this.service.getTeacherAnalytics(teacherId);
  }

  @Get('teachers/:teacherId/class-performance')
  @ApiOperation({ summary: 'Get teacher class performance (FR-TEACH-ANALYTICS-002)' })
  teacherClassPerformance(@Param('teacherId') teacherId: string) {
    return this.service.getTeacherClassPerformance(teacherId);
  }

  // ── School/Principal Analytics ───────────────────────────────────────────
  @Get('schools/:schoolId')
  @ApiOperation({ summary: 'Get school analytics dashboard (FR-PRINCIPAL-001)' })
  schoolAnalytics(
    @Param('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.service.getSchoolAnalytics(schoolId, academicYearId);
  }

  @Get('schools/:schoolId/class-comparison')
  @ApiOperation({ summary: 'Class performance comparison (FR-PRINCIPAL-003)' })
  classComparison(
    @Param('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.service.getClassPerformanceComparison(schoolId, academicYearId);
  }

  @Get('schools/:schoolId/early-warnings')
  @ApiOperation({ summary: 'Early warning system - at-risk students (FR-PRINCIPAL-005)' })
  earlyWarnings(@Param('schoolId') schoolId: string) {
    return this.service.getEarlyWarningAlerts(schoolId);
  }

  @Get('subjects/:subjectId')
  @ApiOperation({ summary: 'Subject-wise analytics (FR-LEARN-005)' })
  subjectAnalytics(
    @Param('subjectId') subjectId: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.service.getSubjectAnalytics(subjectId, schoolId);
  }

  // ── Government Dashboards ────────────────────────────────────────────────
  @Get('government/dashboard')
  @ApiOperation({ summary: 'Government analytics dashboard (FR-GOV-001)' })
  govDashboard(
    @Query('level') level: string,
    @Query('stateCode') stateCode?: string,
    @Query('districtCode') districtCode?: string,
  ) {
    return this.service.getGovernmentDashboard(level, stateCode, districtCode);
  }

  @Post('government/reports')
  @ApiOperation({ summary: 'Create government report (FR-GOV-002)' })
  createGovReport(@Request() req, @Body() dto: any) {
    return this.service.createGovernmentReport(req.user.userId, dto);
  }

  @Get('government/reports')
  @ApiOperation({ summary: 'List government reports (FR-GOV-003)' })
  listGovReports(
    @Query('schoolId') schoolId?: string,
    @Query('reportType') reportType?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listGovernmentReports({ schoolId, reportType, status });
  }

  @Post('government/reports/:id/submit')
  @ApiOperation({ summary: 'Submit government report (FR-GOV-004)' })
  submitGovReport(@Request() req, @Param('id') id: string) {
    return this.service.submitGovernmentReport(id, req.user.userId);
  }

  // ── Content & Learning Analytics ─────────────────────────────────────────
  @Get('content/engagement')
  @ApiOperation({ summary: 'Content engagement analytics (FR-LEARN-001)' })
  contentEngagement(@Query('organizationId') organizationId?: string) {
    return this.service.getContentEngagementAnalytics(organizationId);
  }

  @Get('learning-paths')
  @ApiOperation({ summary: 'Learning path analytics (FR-LEARN-002)' })
  learningPathAnalytics() {
    return this.service.getLearningPathAnalytics();
  }

  // ── Custom Reports ───────────────────────────────────────────────────────
  @Post('reports')
  @ApiOperation({ summary: 'Generate custom report (FR-REPORT-001)' })
  generateReport(@Request() req, @Body() dto: any) {
    return this.service.generateCustomReport(req.user.userId, dto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'List generated reports (FR-REPORT-002)' })
  listReports(
    @Query('organizationId') organizationId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('reportType') reportType?: string,
  ) {
    return this.service.listReports({ organizationId, schoolId, reportType });
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get report data (FR-REPORT-003)' })
  getReport(@Param('id') id: string) {
    return this.service.getReport(id);
  }

  // ── Snapshots ─────────────────────────────────────────────────────────────
  @Post('snapshots')
  @ApiOperation({ summary: 'Create analytics snapshot' })
  createSnapshot(@Body() dto: any) {
    return this.service.createSnapshot(dto);
  }
}
