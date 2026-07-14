import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignmentsService } from './assignments.service';

@ApiTags('Assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create assignment (FR-ASSIGN-001)' })
  create(@Request() req, @Body() dto: any) {
    return this.service.createAssignment(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List assignments (FR-ASSIGN-002)' })
  list(
    @Query('teacherId') teacherId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    return this.service.listAssignments({
      teacherId, sectionId, subjectId,
      isPublished: isPublished !== undefined ? isPublished === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment details (FR-ASSIGN-003)' })
  get(@Param('id') id: string) {
    return this.service.getAssignment(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update assignment (FR-ASSIGN-004)' })
  update(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateAssignment(req.user.userId, id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish assignment (FR-ASSIGN-005)' })
  publish(@Request() req, @Param('id') id: string) {
    return this.service.publishAssignment(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete assignment (FR-ASSIGN-006)' })
  delete(@Request() req, @Param('id') id: string) {
    return this.service.deleteAssignment(req.user.userId, id);
  }

  // Submissions
  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit assignment (FR-SUBMIT-001)' })
  submit(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.submitAssignment(req.user.userId, id, dto);
  }

  @Put(':id/resubmit')
  @ApiOperation({ summary: 'Resubmit assignment (FR-SUBMIT-002)' })
  resubmit(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.resubmitAssignment(req.user.userId, id, dto);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'List submissions for assignment (FR-SUBMIT-003)' })
  listSubmissions(@Param('id') id: string, @Query('status') status?: string) {
    return this.service.listSubmissions(id, status);
  }

  @Get(':id/submissions/:studentId')
  @ApiOperation({ summary: 'Get student submission (FR-SUBMIT-004)' })
  getStudentSubmission(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.service.getStudentSubmission(id, studentId);
  }

  // Grading
  @Post('submissions/:submissionId/grade')
  @ApiOperation({ summary: 'Grade submission (FR-GRADE-001)' })
  gradeSubmission(@Request() req, @Param('submissionId') submissionId: string, @Body() dto: any) {
    return this.service.gradeSubmission(req.user.userId, submissionId, dto);
  }

  @Post(':id/bulk-grade')
  @ApiOperation({ summary: 'Bulk grade submissions (FR-GRADE-002)' })
  bulkGrade(@Request() req, @Body() body: { grades: any[] }) {
    return this.service.bulkGradeSubmissions(req.user.userId, body.grades);
  }

  // Analytics
  @Get(':id/analytics')
  @ApiOperation({ summary: 'Assignment analytics (FR-ANALYTICS-001)' })
  analytics(@Param('id') id: string) {
    return this.service.getAssignmentAnalytics(id);
  }

  @Get('students/:studentId/report')
  @ApiOperation({ summary: 'Student assignment report (FR-ANALYTICS-002)' })
  studentReport(@Param('studentId') studentId: string) {
    return this.service.getStudentAssignmentReport(studentId);
  }
}
