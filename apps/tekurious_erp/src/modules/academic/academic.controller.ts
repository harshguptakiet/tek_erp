import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AcademicService } from './academic.service';
import {
  CreateBoardDto,
  CreateSubjectDto,
  CreateSchoolDto,
  CreateAcademicYearDto,
  CreateClassDto,
  CreateSectionDto,
  EnrollStudentDto,
  AssignTeacherToSectionDto,
  CreateStudentGroupDto,
  AssignStudentToGroupDto,
  AwardGroupPointsDto,
  CreateAcademicEventDto,
  CreateLessonPlanDto,
  UpdateSyllabusProgressDto,
  CreatePTMDto,
  RecordPTMAttendanceDto,
  StudentTransferDto,
  BulkPromoteDto,
  ManualPromotionDto,
  GenerateIDCardDto,
  CreateIDCardTemplateDto,
  AssignSubstituteDto,
  ScheduleMakeupClassDto,
} from './dto/academic.dto';

@ApiTags('Academic')
@Controller('academic')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // FR-ACAD-001
  @Post('boards')
  @ApiOperation({ summary: 'Create educational board' })
  createBoard(@Request() req, @Body() dto: CreateBoardDto) {
    return this.academicService.createBoard(req.user.userId, dto);
  }

  @Get('boards')
  @ApiOperation({ summary: 'List educational boards' })
  listBoards() {
    return this.academicService.listBoards();
  }

  // FR-ACAD-002
  @Post('subjects')
  @ApiOperation({ summary: 'Create subject' })
  createSubject(@Request() req, @Body() dto: CreateSubjectDto) {
    return this.academicService.createSubject(req.user.userId, dto);
  }

  @Get('subjects')
  @ApiOperation({ summary: 'List subjects' })
  listSubjects(@Query('grade') grade?: string) {
    return this.academicService.listSubjects(grade ? parseInt(grade) : undefined);
  }

  // Schools
  @Post('schools')
  @ApiOperation({ summary: 'Create school under organization' })
  createSchool(@Request() req, @Body() dto: CreateSchoolDto) {
    return this.academicService.createSchool(req.user.userId, dto);
  }

  @Get('schools')
  @ApiOperation({ summary: 'List schools' })
  listSchools(@Query('organizationId') organizationId?: string) {
    return this.academicService.listSchools(organizationId);
  }

  @Get('schools/:id')
  @ApiOperation({ summary: 'Get school details with academic structure' })
  getSchool(@Param('id') id: string) {
    return this.academicService.getSchool(id);
  }

  // FR-ACAD-003
  @Post('academic-years')
  @ApiOperation({ summary: 'Create academic year' })
  createAcademicYear(@Request() req, @Body() dto: CreateAcademicYearDto) {
    return this.academicService.createAcademicYear(req.user.userId, dto);
  }

  @Get('schools/:schoolId/academic-years')
  @ApiOperation({ summary: 'List academic years for school' })
  listAcademicYears(@Param('schoolId') schoolId: string) {
    return this.academicService.listAcademicYears(schoolId);
  }

  // FR-ACAD-004
  @Post('classes')
  @ApiOperation({ summary: 'Create class (grade level)' })
  createClass(@Request() req, @Body() dto: CreateClassDto) {
    return this.academicService.createClass(req.user.userId, dto);
  }

  // List all classes
  @Get('classes')
  @ApiOperation({ summary: 'List all classes' })
  listClasses(@Query('schoolId') schoolId?: string, @Query('academicYearId') academicYearId?: string) {
    return this.academicService.listClasses(schoolId, academicYearId);
  }

  @Post('sections')
  @ApiOperation({ summary: 'Create section within class' })
  createSection(@Request() req, @Body() dto: CreateSectionDto) {
    return this.academicService.createSection(req.user.userId, dto);
  }

  @Get('schools/:schoolId/classes')
  @ApiOperation({ summary: 'Get class structure for school' })
  getClassStructure(
    @Param('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.academicService.getClassStructure(schoolId, academicYearId);
  }

  // FR-ACAD-005
  @Post('enrollments')
  @ApiOperation({ summary: 'Enroll student in section' })
  enrollStudent(@Request() req, @Body() dto: EnrollStudentDto) {
    return this.academicService.enrollStudent(req.user.userId, dto);
  }

  @Get('sections/:sectionId/enrollments')
  @ApiOperation({ summary: 'List enrollments for section' })
  listEnrollments(@Param('sectionId') sectionId: string) {
    return this.academicService.listEnrollments(sectionId);
  }

  // FR-ACAD-006
  @Post('sections/:sectionId/teachers')
  @ApiOperation({ summary: 'Assign teacher to section' })
  assignTeacher(
    @Request() req,
    @Param('sectionId') sectionId: string,
    @Body() dto: AssignTeacherToSectionDto,
  ) {
    return this.academicService.assignTeacherToSection(
      req.user.userId,
      sectionId,
      dto,
    );
  }

  @Get('sections/:sectionId/teachers')
  @ApiOperation({ summary: 'List teachers assigned to section' })
  listSectionTeachers(@Param('sectionId') sectionId: string) {
    return this.academicService.listSectionTeachers(sectionId);
  }

  // FR-ACAD-016: Student Groups/Houses
  @Post('schools/:schoolId/groups')
  @ApiOperation({ summary: 'Create student group/house' })
  createStudentGroup(
    @Request() req,
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateStudentGroupDto,
  ) {
    return this.academicService.createStudentGroup(req.user.userId, schoolId, dto);
  }

  @Get('schools/:schoolId/groups')
  @ApiOperation({ summary: 'List student groups for school' })
  listStudentGroups(
    @Param('schoolId') schoolId: string,
    @Query('groupType') groupType?: string,
  ) {
    return this.academicService.listStudentGroups(schoolId, groupType);
  }

  @Post('groups/:groupId/students')
  @ApiOperation({ summary: 'Assign student to group' })
  assignStudentToGroup(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() dto: AssignStudentToGroupDto,
  ) {
    return this.academicService.assignStudentToGroup(req.user.userId, groupId, dto);
  }

  @Post('groups/points')
  @ApiOperation({ summary: 'Award points to group' })
  awardGroupPoints(@Request() req, @Body() dto: AwardGroupPointsDto) {
    return this.academicService.awardGroupPoints(req.user.userId, dto);
  }

  @Get('groups/:groupId/leaderboard')
  @ApiOperation({ summary: 'Get group leaderboard' })
  getGroupLeaderboard(@Param('groupId') groupId: string) {
    return this.academicService.getGroupLeaderboard(groupId);
  }

  // FR-ACAD-014: Academic Calendar & Events
  @Post('schools/:schoolId/events')
  @ApiOperation({ summary: 'Create academic calendar event' })
  createAcademicEvent(
    @Request() req,
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateAcademicEventDto,
  ) {
    return this.academicService.createAcademicEvent(req.user.userId, schoolId, dto);
  }

  @Get('schools/:schoolId/events')
  @ApiOperation({ summary: 'List academic calendar events' })
  listAcademicEvents(
    @Param('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventType') eventType?: string,
  ) {
    return this.academicService.listAcademicEvents(schoolId, startDate, endDate, eventType);
  }

  @Get('schools/:schoolId/calendar')
  @ApiOperation({ summary: 'Get academic calendar view (month/year)' })
  getAcademicCalendar(
    @Param('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('month') month?: string,
  ) {
    return this.academicService.getAcademicCalendar(schoolId, academicYearId, month);
  }

  // FR-ACAD-008: Syllabus & Lesson Plans
  @Post('lesson-plans')
  @ApiOperation({ summary: 'Create lesson plan' })
  createLessonPlan(@Request() req, @Body() dto: CreateLessonPlanDto) {
    return this.academicService.createLessonPlan(req.user.userId, dto);
  }

  @Get('teachers/:teacherId/lesson-plans')
  @ApiOperation({ summary: 'Get lesson plans for a teacher' })
  getLessonPlans(
    @Param('teacherId') teacherId: string,
    @Query('subjectId') subjectId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.academicService.getLessonPlans(teacherId, subjectId, from, to);
  }

  @Put('syllabus-progress')
  @ApiOperation({ summary: 'Update syllabus completion progress' })
  updateSyllabusProgress(@Request() req, @Body() dto: UpdateSyllabusProgressDto) {
    return this.academicService.updateSyllabusProgress(req.user.userId, dto);
  }

  @Get('classes/:classId/syllabus-progress')
  @ApiOperation({ summary: 'Get syllabus progress for a class' })
  getSyllabusProgress(
    @Param('classId') classId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.academicService.getSyllabusProgress(classId, subjectId);
  }

  // FR-ACAD-009: Parent-Teacher Meetings
  @Post('ptm')
  @ApiOperation({ summary: 'Schedule a Parent-Teacher Meeting event' })
  createPTM(@Request() req, @Body() dto: CreatePTMDto) {
    return this.academicService.createPTM(req.user.userId, dto);
  }

  @Get('schools/:schoolId/ptm')
  @ApiOperation({ summary: 'List PTM events for school' })
  listPTMs(
    @Param('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.academicService.listPTMs(schoolId, academicYearId);
  }

  @Post('ptm/:ptmId/attendance')
  @ApiOperation({ summary: 'Record parent attendance at PTM' })
  recordPTMAttendance(
    @Request() req,
    @Param('ptmId') ptmId: string,
    @Body() dto: RecordPTMAttendanceDto,
  ) {
    return this.academicService.recordPTMAttendance(req.user.userId, ptmId, dto);
  }

  // FR-ACAD-010: Student Transfers
  @Post('transfers')
  @ApiOperation({ summary: 'Initiate student transfer' })
  transferStudent(@Request() req, @Body() dto: StudentTransferDto) {
    return this.academicService.transferStudent(req.user.userId, dto);
  }

  @Get('students/:studentId/transfers')
  @ApiOperation({ summary: 'Get transfer history for student' })
  getStudentTransfers(@Param('studentId') studentId: string) {
    return this.academicService.getStudentTransfers(studentId);
  }

  // FR-ACAD-011: Promotions & Detentions
  @Post('promotions/bulk')
  @ApiOperation({ summary: 'Bulk promote/detain students in a class' })
  bulkPromote(@Request() req, @Body() dto: BulkPromoteDto) {
    return this.academicService.bulkPromote(req.user.userId, dto);
  }

  @Post('promotions/manual')
  @ApiOperation({ summary: 'Manually set promotion/detention status for a student' })
  manualPromotion(@Request() req, @Body() dto: ManualPromotionDto) {
    return this.academicService.manualPromotion(req.user.userId, dto);
  }

  @Get('schools/:schoolId/promotions')
  @ApiOperation({ summary: 'Get promotion summary for a school/class' })
  getPromotionSummary(
    @Param('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('classId') classId?: string,
  ) {
    return this.academicService.getPromotionSummary(schoolId, academicYearId, classId);
  }

  // FR-ACAD-015: Student ID Cards
  @Post('id-card-templates')
  @ApiOperation({ summary: 'Create ID card template' })
  createIDCardTemplate(@Request() req, @Body() dto: CreateIDCardTemplateDto) {
    return this.academicService.createIDCardTemplate(req.user.userId, dto);
  }

  @Get('id-card-templates')
  @ApiOperation({ summary: 'List ID card templates' })
  listIDCardTemplates(
    @Query('schoolId') schoolId?: string,
    @Query('cardType') cardType?: string,
  ) {
    return this.academicService.listIDCardTemplates(schoolId, cardType);
  }

  @Post('id-cards/generate')
  @ApiOperation({ summary: 'Generate ID card for a student' })
  generateIDCard(@Request() req, @Body() dto: GenerateIDCardDto) {
    return this.academicService.generateIDCard(req.user.userId, dto);
  }

  @Post('id-cards/bulk-generate')
  @ApiOperation({ summary: 'Bulk generate ID cards for a class/section' })
  bulkGenerateIDCards(
    @Request() req,
    @Body() body: { sectionId: string; templateId: string; academicYearId: string },
  ) {
    return this.academicService.bulkGenerateIDCards(req.user.userId, body);
  }

  @Get('students/:studentId/id-cards')
  @ApiOperation({ summary: 'Get ID cards for a student' })
  getStudentIDCards(@Param('studentId') studentId: string) {
    return this.academicService.getStudentIDCards(studentId);
  }

  // FR-ACAD-019: Substitute Teachers
  @Post('substitutes')
  @ApiOperation({ summary: 'Assign substitute teacher' })
  assignSubstitute(@Request() req, @Body() dto: AssignSubstituteDto) {
    return this.academicService.assignSubstitute(req.user.userId, dto);
  }

  @Get('teachers/:teacherId/substitutes')
  @ApiOperation({ summary: 'Get substitute assignments for a teacher' })
  getSubstituteAssignments(@Param('teacherId') teacherId: string) {
    return this.academicService.getSubstituteAssignments(teacherId);
  }

  // FR-ACAD-020: Makeup Classes
  @Post('makeup-classes')
  @ApiOperation({ summary: 'Schedule a makeup class' })
  scheduleMakeupClass(@Request() req, @Body() dto: ScheduleMakeupClassDto) {
    return this.academicService.scheduleMakeupClass(req.user.userId, dto);
  }

  @Get('sections/:sectionId/makeup-classes')
  @ApiOperation({ summary: 'Get makeup classes for a section' })
  getMakeupClasses(@Param('sectionId') sectionId: string) {
    return this.academicService.getMakeupClasses(sectionId);
  }

  // FR-ACAD-022: Alumni
  @Post('schools/:schoolId/alumni')
  @ApiOperation({ summary: 'Register alumni (FR-ACAD-022)' })
  registerAlumni(@Request() req, @Param('schoolId') schoolId: string, @Body() dto: any) {
    return this.academicService.registerAlumni({ ...dto, schoolId });
  }

  @Get('schools/:schoolId/alumni')
  @ApiOperation({ summary: 'List alumni' })
  listAlumni(@Param('schoolId') schoolId: string, @Query('year') year?: string) {
    return this.academicService.listAlumni(schoolId, year ? parseInt(year) : undefined);
  }

  // FR-ACAD-023: Re-admission
  @Post('schools/:schoolId/readmission')
  @ApiOperation({ summary: 'Submit re-admission request (FR-ACAD-023)' })
  submitReadmission(@Request() req, @Param('schoolId') schoolId: string, @Body() dto: any) {
    return this.academicService.submitReadmissionRequest(req.user.userId, { ...dto, schoolId });
  }

  @Get('schools/:schoolId/readmission')
  @ApiOperation({ summary: 'List re-admission requests' })
  listReadmission(@Param('schoolId') schoolId: string) {
    return this.academicService.listReadmissionRequests(schoolId);
  }

  // FR-ACAD-026/028/029/030/031: Special Programs
  @Post('schools/:schoolId/programs')
  @ApiOperation({ summary: 'Create special program (FR-ACAD-026/028/029/030/031)' })
  createProgram(@Request() req, @Param('schoolId') schoolId: string, @Body() dto: any) {
    return this.academicService.createSpecialProgram(req.user.userId, { ...dto, schoolId });
  }

  @Get('schools/:schoolId/programs')
  @ApiOperation({ summary: 'List special programs' })
  listPrograms(@Param('schoolId') schoolId: string, @Query('programType') programType?: string) {
    return this.academicService.listSpecialPrograms(schoolId, programType);
  }

  @Post('schools/:schoolId/programs/:programId/enroll')
  @ApiOperation({ summary: 'Enroll student in special program' })
  enrollInProgram(@Request() req, @Param('schoolId') schoolId: string, @Param('programId') programId: string, @Body() dto: any) {
    return this.academicService.enrollStudentInProgram(req.user.userId, { ...dto, schoolId, programId });
  }

  // FR-ACAD-033/034/035: Counseling
  @Post('schools/:schoolId/counseling')
  @ApiOperation({ summary: 'Schedule counseling session (FR-ACAD-033/034/035)' })
  scheduleCounseling(@Request() req, @Param('schoolId') schoolId: string, @Body() dto: any) {
    return this.academicService.scheduleCounselingSession(req.user.userId, { ...dto, schoolId });
  }

  @Get('schools/:schoolId/counseling')
  @ApiOperation({ summary: 'Get counseling sessions' })
  getCounseling(@Param('schoolId') schoolId: string, @Query('studentId') studentId?: string) {
    return this.academicService.getCounselingSessions(schoolId, studentId);
  }

  // FR-ACAD-039: Grievance System
  @Post('schools/:schoolId/grievances')
  @ApiOperation({ summary: 'Submit student grievance (FR-ACAD-039)' })
  submitGrievance(@Request() req, @Param('schoolId') schoolId: string, @Body() dto: any) {
    return this.academicService.submitGrievance(req.user.userId, { ...dto, schoolId });
  }

  @Get('schools/:schoolId/grievances')
  @ApiOperation({ summary: 'List grievances' })
  listGrievances(@Param('schoolId') schoolId: string, @Query('status') status?: string) {
    return this.academicService.listGrievances(schoolId, status);
  }

  @Put('grievances/:id/status')
  @ApiOperation({ summary: 'Update grievance status' })
  updateGrievance(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.academicService.updateGrievanceStatus(req.user.userId, id, dto);
  }

  @Get('schools/:schoolId/audit-report')
  @ApiOperation({ summary: 'Get academic audit report (FR-ACAD-050)' })
  getAuditReport(
    @Param('schoolId') schoolId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('actionType') actionType?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.academicService.getAcademicAuditReport(schoolId, {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      actionType,
      userId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  // ==================== EXTENDED ACADEMIC FEATURES (FR-ACAD-012, 013, 017, 018, 024, 025) ====================

  @Post('schools/:schoolId/grading-system')
  @ApiOperation({ summary: 'Configure grading system (FR-ACAD-012)' })
  configureGradingSystem(@Param('schoolId') schoolId: string, @Body() dto: any) {
    return this.academicService.configureGradingSystem(schoolId, dto);
  }

  @Get('schools/:schoolId/grading-system')
  @ApiOperation({ summary: 'Get grading system (FR-ACAD-012)' })
  getGradingSystem(@Param('schoolId') schoolId: string) {
    return this.academicService.getGradingSystem(schoolId);
  }

  @Post('schools/:schoolId/report-card-templates')
  @ApiOperation({ summary: 'Create report card template (FR-ACAD-013)' })
  createReportCardTemplate(@Param('schoolId') schoolId: string, @Body() dto: any) {
    return this.academicService.createReportCardTemplate(schoolId, dto);
  }

  @Post('students/:studentId/report-cards/generate')
  @ApiOperation({ summary: 'Generate report card (FR-ACAD-013)' })
  generateReportCard(@Param('studentId') studentId: string, @Body('academicYearId') academicYearId: string) {
    return this.academicService.generateReportCard(studentId, academicYearId);
  }

  @Post('students/:studentId/leaves')
  @ApiOperation({ summary: 'Apply student leave (FR-ACAD-017)' })
  applyStudentLeave(@Param('studentId') studentId: string, @Body() dto: any) {
    return this.academicService.applyStudentLeave(studentId, dto);
  }

  @Get('students/:studentId/leaves')
  @ApiOperation({ summary: 'List student leaves (FR-ACAD-017)' })
  listStudentLeaves(@Param('studentId') studentId: string) {
    return this.academicService.listStudentLeaves(studentId);
  }

  @Post('teachers/:teacherId/leaves')
  @ApiOperation({ summary: 'Apply teacher leave (FR-ACAD-018)' })
  applyTeacherLeave(@Param('teacherId') teacherId: string, @Body() dto: any) {
    return this.academicService.applyTeacherLeave(teacherId, dto);
  }

  @Get('teachers/:teacherId/leaves')
  @ApiOperation({ summary: 'List teacher leaves (FR-ACAD-018)' })
  listTeacherLeaves(@Param('teacherId') teacherId: string) {
    return this.academicService.listTeacherLeaves(teacherId);
  }

  @Post('schools/:schoolId/sibling-discounts')
  @ApiOperation({ summary: 'Configure sibling discounts (FR-ACAD-024)' })
  configureSiblingDiscount(@Param('schoolId') schoolId: string, @Body('discountPercentage') discountPercentage: number) {
    return this.academicService.configureSiblingDiscount(schoolId, discountPercentage);
  }

  @Post('schools/:schoolId/learning-paths')
  @ApiOperation({ summary: 'Create learning path (FR-ACAD-025)' })
  createLearningPath(@Param('schoolId') schoolId: string, @Body() dto: any) {
    return this.academicService.createLearningPath(schoolId, dto);
  }

  @Post('students/:studentId/learning-paths/assign')
  @ApiOperation({ summary: 'Assign learning path to student (FR-ACAD-025)' })
  assignLearningPath(@Param('studentId') studentId: string, @Body('pathId') pathId: string) {
    return this.academicService.assignLearningPath(studentId, pathId);
  }
}
