import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssessmentService } from './assessment.service';
import {
  CreateQuestionDto, CreateExamDto, SubmitExamDto,
  BulkGradeDto, CreateBlueprintDto, CreateRubricDto,
} from './dto/assessment.dto';

@ApiTags('Assessment')
@Controller('assessment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  // ── Question Bank ────────────────────────────────────────────────────────

  @Post('questions')
  @ApiOperation({ summary: 'Create question in bank (FR-QUEST-001)' })
  createQuestion(@Request() req, @Body() dto: CreateQuestionDto) {
    return this.assessmentService.createQuestion(req.user.userId, dto);
  }

  @Get('questions/search')
  @ApiOperation({ summary: 'Search question bank (FR-QUEST-002)' })
  searchQuestions(
    @Query('q') q?: string,
    @Query('grade') grade?: string,
    @Query('board') board?: string,
    @Query('subjectId') subjectId?: string,
    @Query('topicId') topicId?: string,
    @Query('difficultyLevel') difficultyLevel?: string,
    @Query('questionType') questionType?: string,
    @Query('isPublic') isPublic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.assessmentService.searchQuestions({
      q,
      grade: grade ? parseInt(grade) : undefined,
      board,
      subjectId,
      topicId,
      difficultyLevel,
      questionType,
      isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question details (FR-QUEST-003)' })
  getQuestion(@Param('id') id: string) {
    return this.assessmentService.getQuestion(id);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update question (FR-QUEST-004)' })
  updateQuestion(@Param('id') id: string, @Body() dto: Partial<CreateQuestionDto>) {
    return this.assessmentService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Delete question (FR-QUEST-005)' })
  deleteQuestion(@Param('id') id: string) {
    return this.assessmentService.deleteQuestion(id);
  }

  @Post('questions/bulk-import')
  @ApiOperation({ summary: 'Bulk import questions (FR-QUEST-006)' })
  bulkImportQuestions(@Request() req, @Body() body: { questions: CreateQuestionDto[] }) {
    return this.assessmentService.bulkImportQuestions(req.user.userId, body.questions);
  }

  // ── Exam Management ──────────────────────────────────────────────────────

  @Post('exams')
  @ApiOperation({ summary: 'Create exam (FR-EXAM-001)' })
  createExam(@Request() req, @Body() dto: CreateExamDto) {
    return this.assessmentService.createExam(req.user.userId, dto);
  }

  @Get('exams')
  @ApiOperation({ summary: 'List exams (FR-EXAM-002)' })
  listExams(
    @Query('teacherId') teacherId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('examType') examType?: string,
    @Query('isPublished') isPublished?: string,
    @Query('grade') grade?: string,
  ) {
    return this.assessmentService.listExams({
      teacherId,
      sectionId,
      examType,
      isPublished: isPublished !== undefined ? isPublished === 'true' : undefined,
      grade: grade ? parseInt(grade) : undefined,
    });
  }

  @Get('exams/:id')
  @ApiOperation({ summary: 'Get exam details (FR-EXAM-003)' })
  getExam(
    @Param('id') id: string,
    @Query('withAnswers') withAnswers?: string,
  ) {
    return this.assessmentService.getExam(id, withAnswers === 'true');
  }

  @Post('exams/:id/questions')
  @ApiOperation({ summary: 'Add questions to exam (FR-EXAM-004)' })
  addQuestionsToExam(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { questions: any[] },
  ) {
    return this.assessmentService.addQuestionsToExam(req.user.userId, id, body.questions);
  }

  @Post('exams/:id/publish')
  @ApiOperation({ summary: 'Publish exam (FR-EXAM-005)' })
  publishExam(@Request() req, @Param('id') id: string) {
    return this.assessmentService.publishExam(req.user.userId, id);
  }

  @Delete('exams/:id')
  @ApiOperation({ summary: 'Delete exam (FR-EXAM-006)' })
  deleteExam(@Request() req, @Param('id') id: string) {
    return this.assessmentService.deleteExam(req.user.userId, id);
  }

  @Post('exams/:id/assign')
  @ApiOperation({ summary: 'Assign exam to students/class (FR-EXAM-007)' })
  assignExam(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { studentIds?: string[]; classId?: string },
  ) {
    return this.assessmentService.assignExam(req.user.userId, id, body);
  }

  // ── Exam Attempts ────────────────────────────────────────────────────────

  @Post('exams/:id/start')
  @ApiOperation({ summary: 'Start exam attempt (FR-ATTEMPT-001)' })
  startExam(@Request() req, @Param('id') id: string) {
    return this.assessmentService.startExam(req.user.userId, id);
  }

  @Post('attempts/:attemptId/submit')
  @ApiOperation({ summary: 'Submit exam answers (FR-ATTEMPT-002)' })
  submitExam(
    @Request() req,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitExamDto,
  ) {
    return this.assessmentService.submitExam(req.user.userId, attemptId, dto);
  }

  @Get('attempts/:attemptId/result')
  @ApiOperation({ summary: 'Get attempt result (FR-RESULT-001)' })
  getAttemptResult(@Request() req, @Param('attemptId') attemptId: string) {
    return this.assessmentService.getAttemptResult(attemptId, req.user.userId);
  }

  @Get('students/:studentId/attempts')
  @ApiOperation({ summary: 'List student exam attempts (FR-RESULT-002)' })
  listStudentAttempts(
    @Param('studentId') studentId: string,
    @Query('examId') examId?: string,
  ) {
    return this.assessmentService.listStudentAttempts(studentId, examId);
  }

  // ── Manual Grading ───────────────────────────────────────────────────────

  @Post('attempts/:attemptId/grade')
  @ApiOperation({ summary: 'Manually grade attempt (FR-GRADE-001)' })
  manualGradeAttempt(
    @Request() req,
    @Param('attemptId') attemptId: string,
    @Body() dto: BulkGradeDto,
  ) {
    return this.assessmentService.manualGradeAttempt(req.user.userId, attemptId, dto);
  }

  // ── Results & Rankings ───────────────────────────────────────────────────

  @Get('exams/:id/results')
  @ApiOperation({ summary: 'Get full exam results with rankings (FR-RESULT-003)' })
  getExamResults(@Param('id') id: string) {
    return this.assessmentService.getExamResults(id);
  }

  @Get('students/:studentId/report')
  @ApiOperation({ summary: 'Get student performance report (FR-REPORT-001)' })
  getStudentReport(
    @Param('studentId') studentId: string,
    @Query('examType') examType?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.assessmentService.getStudentReport(studentId, { examType, subjectId });
  }

  // FR-RESULT-004: Rankings
  @Post('exams/:id/compute-rankings')
  @ApiOperation({ summary: 'Compute/assign exam rankings (FR-RESULT-004)' })
  computeRankings(@Param('id') id: string) {
    return this.assessmentService.computeExamRankings(id);
  }

  // FR-SECURITY-001: Check attempt validity
  @Get('exams/:id/validity/:studentId')
  @ApiOperation({ summary: 'Check if student can attempt exam (FR-SECURITY-001)' })
  checkValidity(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.assessmentService.checkAttemptValidity(studentId, id);
  }

  // FR-REPORT-002: Subject-wise report
  @Get('reports/subject-wise')
  @ApiOperation({ summary: 'Subject-wise performance report (FR-REPORT-002)' })
  subjectWiseReport(
    @Query('teacherId') teacherId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.assessmentService.getSubjectWiseReport({ teacherId, sectionId, subjectId });
  }

  // FR-REPORT-003: Export results
  @Get('exams/:id/results/export')
  @ApiOperation({ summary: 'Export exam results as CSV (FR-REPORT-003)' })
  exportResults(@Param('id') id: string) {
    return this.assessmentService.exportExamResults(id);
  }

  // ── Blueprints & Rubrics ─────────────────────────────────────────────────

  @Post('blueprints')
  @ApiOperation({ summary: 'Create exam blueprint (FR-EXAM-008)' })
  createBlueprint(@Request() req, @Body() dto: CreateBlueprintDto) {
    return this.assessmentService.createBlueprint(req.user.userId, dto);
  }

  @Get('blueprints')
  @ApiOperation({ summary: 'List exam blueprints' })
  listBlueprints(
    @Query('grade') grade?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.assessmentService.listBlueprints(
      grade ? parseInt(grade) : undefined,
      subjectId,
    );
  }

  @Post('rubrics')
  @ApiOperation({ summary: 'Create grading rubric (FR-GRADE-002)' })
  createRubric(@Request() req, @Body() dto: CreateRubricDto) {
    return this.assessmentService.createRubric(req.user.userId, dto);
  }

  @Get('rubrics')
  @ApiOperation({ summary: 'List grading rubrics' })
  listRubrics(@Query('isPublic') isPublic?: string) {
    return this.assessmentService.listRubrics(
      isPublic !== undefined ? isPublic === 'true' : undefined,
    );
  }

  // ── Exam Proctoring & Security (FR-SECURITY-001-008) ──────────────────

  @Post('exams/:examId/proctoring/enable')
  @ApiOperation({ summary: 'Enable proctoring for exam (FR-SECURITY-001)' })
  enableProctoring(@Request() req, @Param('examId') examId: string, @Body() config: any) {
    return this.assessmentService.enableProctoring(req.user.userId, examId, config);
  }

  @Post('attempts/:attemptId/proctoring/start')
  @ApiOperation({ summary: 'Start proctoring session (FR-SECURITY-002)' })
  startProctoringSession(@Param('attemptId') attemptId: string, @Body() metadata?: any) {
    return this.assessmentService.startProctoringSession(attemptId, metadata);
  }

  @Post('attempts/:attemptId/proctoring/events')
  @ApiOperation({ summary: 'Log proctoring event (FR-SECURITY-003)' })
  logProctoringEvent(@Param('attemptId') attemptId: string, @Body() event: any) {
    return this.assessmentService.logProctoringEvent(attemptId, event);
  }

  @Get('attempts/:attemptId/proctoring/status')
  @ApiOperation({ summary: 'Get proctoring status (FR-SECURITY-004)' })
  getProctoringStatus(@Param('attemptId') attemptId: string) {
    return this.assessmentService.getProctoringStatus(attemptId);
  }

  @Post('attempts/:attemptId/proctoring/review')
  @ApiOperation({ summary: 'Review flagged attempt (FR-SECURITY-005)' })
  reviewFlaggedAttempt(@Request() req, @Param('attemptId') attemptId: string, @Body() review: any) {
    return this.assessmentService.reviewFlaggedAttempt(req.user.userId, attemptId, review);
  }

  @Post('exams/:examId/access-control')
  @ApiOperation({ summary: 'Set exam access controls (FR-SECURITY-006)' })
  setExamAccessControl(@Request() req, @Param('examId') examId: string, @Body() controls: any) {
    return this.assessmentService.setExamAccessControl(req.user.userId, examId, controls);
  }

  @Post('exams/:examId/security/log')
  @ApiOperation({ summary: 'Log security event (FR-SECURITY-007)' })
  logSecurityEvent(@Param('examId') examId: string, @Body() event: any) {
    return this.assessmentService.logSecurityEvent(examId, event);
  }

  @Get('exams/:examId/analytics-report')
  @ApiOperation({ summary: 'Generate exam analytics report (FR-SECURITY-008)' })
  generateExamAnalyticsReport(@Param('examId') examId: string) {
    return this.assessmentService.generateExamAnalyticsReport(examId);
  }
}
