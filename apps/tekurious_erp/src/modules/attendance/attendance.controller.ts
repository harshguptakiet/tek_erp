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
}
