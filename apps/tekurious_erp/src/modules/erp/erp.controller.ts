import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErpService } from './erp.service';

@ApiTags('ERP')
@Controller('erp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ErpController {
  constructor(private readonly service: ErpService) {}

  // ── Library ──────────────────────────────────────────────────────────────
  @Post('library/books')
  @ApiOperation({ summary: 'Add book to library (FR-LIB-001)' })
  addBook(@Request() req, @Body() dto: any) {
    return this.service.addBook(req.user.userId, dto);
  }

  @Get('library/books')
  @ApiOperation({ summary: 'List library books (FR-LIB-002)' })
  listBooks(
    @Query('schoolId') schoolId: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('available') available?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listBooks(schoolId, {
      category, search,
      available: available !== undefined ? available === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('library/books/:id')
  @ApiOperation({ summary: 'Get book details (FR-LIB-003)' })
  getBook(@Param('id') id: string) {
    return this.service.getBook(id);
  }

  @Post('library/members')
  @ApiOperation({ summary: 'Register library member (FR-LIB-004)' })
  registerMember(@Body() dto: any) {
    return this.service.registerLibraryMember(dto);
  }

  @Post('library/issue')
  @ApiOperation({ summary: 'Issue book to member (FR-LIB-005)' })
  issueBook(@Request() req, @Body() dto: any) {
    return this.service.issueBook(req.user.userId, dto);
  }

  @Post('library/return/:issueId')
  @ApiOperation({ summary: 'Return book (FR-LIB-006)' })
  returnBook(@Request() req, @Param('issueId') issueId: string) {
    return this.service.returnBook(req.user.userId, issueId);
  }

  @Post('library/reserve')
  @ApiOperation({ summary: 'Reserve book (FR-LIB-007)' })
  reserveBook(@Request() req, @Body() dto: any) {
    return this.service.reserveBook(req.user.userId, dto);
  }

  @Post('library/renew/:issueId')
  @ApiOperation({ summary: 'Renew book issue (FR-LIB-008)' })
  renewBook(@Request() req, @Param('issueId') issueId: string) {
    return this.service.renewBook(req.user.userId, issueId);
  }

  @Get('library/stats')
  @ApiOperation({ summary: 'Library statistics (FR-LIB-009)' })
  libraryStats(@Query('schoolId') schoolId: string) {
    return this.service.getLibraryStats(schoolId);
  }

  // ── Transport ─────────────────────────────────────────────────────────────
  @Post('transport/vehicles')
  @ApiOperation({ summary: 'Add transport vehicle (FR-TRANS-001)' })
  addVehicle(@Body() dto: any) {
    return this.service.addVehicle(dto);
  }

  @Get('transport/vehicles')
  @ApiOperation({ summary: 'List vehicles (FR-TRANS-002)' })
  listVehicles(@Query('schoolId') schoolId?: string, @Query('organizationId') organizationId?: string) {
    return this.service.listVehicles(schoolId, organizationId);
  }

  @Post('transport/routes')
  @ApiOperation({ summary: 'Create transport route (FR-TRANS-003)' })
  createRoute(@Body() dto: any) {
    return this.service.createRoute(dto);
  }

  @Get('transport/routes')
  @ApiOperation({ summary: 'List transport routes (FR-TRANS-004)' })
  listRoutes(@Query('schoolId') schoolId: string) {
    return this.service.listRoutes(schoolId);
  }

  @Post('transport/assign')
  @ApiOperation({ summary: 'Assign student to route (FR-TRANS-005)' })
  assignStudent(@Request() req, @Body() dto: any) {
    return this.service.assignStudentToRoute(req.user.userId, dto);
  }

  @Get('transport/students/:studentId')
  @ApiOperation({ summary: 'Get student transport assignment (FR-TRANS-006)' })
  getStudentTransport(@Param('studentId') studentId: string) {
    return this.service.getStudentTransportAssignment(studentId);
  }

  @Get('transport/routes/:routeId/students')
  @ApiOperation({ summary: 'Get students on route (FR-TRANS-007)' })
  getRouteStudents(@Param('routeId') routeId: string) {
    return this.service.getRouteStudents(routeId);
  }

  // ── Hostel ────────────────────────────────────────────────────────────────
  @Post('hostel/blocks')
  @ApiOperation({ summary: 'Create hostel block (FR-HOSTEL-001)' })
  createBlock(@Body() dto: any) {
    return this.service.createHostelBlock(dto);
  }

  @Get('hostel/blocks')
  @ApiOperation({ summary: 'List hostel blocks (FR-HOSTEL-002)' })
  listBlocks(@Query('schoolId') schoolId: string) {
    return this.service.listHostelBlocks(schoolId);
  }

  @Post('hostel/rooms')
  @ApiOperation({ summary: 'Create hostel room (FR-HOSTEL-003)' })
  createRoom(@Body() dto: any) {
    return this.service.createHostelRoom(dto);
  }

  @Get('hostel/blocks/:blockId/rooms')
  @ApiOperation({ summary: 'List rooms in block (FR-HOSTEL-004)' })
  listRooms(@Param('blockId') blockId: string, @Query('available') available?: string) {
    return this.service.listHostelRooms(blockId, available !== undefined ? available === 'true' : undefined);
  }

  @Post('hostel/assign')
  @ApiOperation({ summary: 'Assign student to hostel room (FR-HOSTEL-005)' })
  assignRoom(@Request() req, @Body() dto: any) {
    return this.service.assignStudentToRoom(req.user.userId, dto);
  }

  @Post('hostel/vacate/:assignmentId')
  @ApiOperation({ summary: 'Vacate hostel room (FR-HOSTEL-006)' })
  vacateRoom(@Request() req, @Param('assignmentId') assignmentId: string) {
    return this.service.vacateRoom(req.user.userId, assignmentId);
  }

  @Get('hostel/stats')
  @ApiOperation({ summary: 'Hostel statistics (FR-HOSTEL-007)' })
  hostelStats(@Query('schoolId') schoolId: string) {
    return this.service.getHostelStats(schoolId);
  }

  // ── Discipline ────────────────────────────────────────────────────────────
  @Post('discipline')
  @ApiOperation({ summary: 'Record disciplinary action (FR-DISC-001)' })
  recordDiscipline(@Request() req, @Body() dto: any) {
    return this.service.recordDisciplinaryAction(req.user.userId, dto);
  }

  @Get('discipline/students/:studentId')
  @ApiOperation({ summary: 'Get student disciplinary records (FR-DISC-002)' })
  studentDiscipline(@Param('studentId') studentId: string) {
    return this.service.getStudentDisciplinaryRecords(studentId);
  }

  @Get('discipline/report')
  @ApiOperation({ summary: 'School disciplinary report (FR-DISC-003)' })
  disciplineReport(
    @Query('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getDisciplinaryReport(schoolId, { startDate, endDate });
  }

  // ── Announcements ─────────────────────────────────────────────────────────
  @Post('announcements')
  @ApiOperation({ summary: 'Create announcement (FR-EVENT-001)' })
  createAnnouncement(@Request() req, @Body() dto: any) {
    return this.service.createAnnouncement(req.user.userId, dto);
  }

  @Get('announcements')
  @ApiOperation({ summary: 'List announcements (FR-EVENT-002)' })
  listAnnouncements(
    @Query('schoolId') schoolId?: string,
    @Query('organizationId') organizationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listAnnouncements({
      schoolId, organizationId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('announcements/:id')
  @ApiOperation({ summary: 'Get announcement (FR-EVENT-003)' })
  getAnnouncement(@Param('id') id: string) {
    return this.service.getAnnouncement(id);
  }

  // ── HR & Payroll ──────────────────────────────────────────────────────────
  @Post('hr/payroll-structures')
  @ApiOperation({ summary: 'Create payroll structure (FR-HR-001)' })
  createPayrollStructure(@Body() dto: any) {
    return this.service.createPayrollStructure(dto);
  }

  @Get('hr/payroll-structures')
  @ApiOperation({ summary: 'List payroll structures (FR-HR-002)' })
  listPayrollStructures(@Query('schoolId') schoolId?: string, @Query('organizationId') organizationId?: string) {
    return this.service.listPayrollStructures(schoolId, organizationId);
  }

  @Post('hr/salaries')
  @ApiOperation({ summary: 'Generate employee salary (FR-HR-003)' })
  generateSalary(@Request() req, @Body() dto: any) {
    return this.service.generateEmployeeSalary(req.user.userId, dto);
  }

  @Post('hr/salaries/:id/pay')
  @ApiOperation({ summary: 'Process salary payment (FR-HR-004)' })
  processSalary(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.processSalaryPayment(req.user.userId, id, dto);
  }

  @Get('hr/employees/:employeeId/salary-history')
  @ApiOperation({ summary: 'Get employee salary history (FR-HR-005)' })
  salaryHistory(@Param('employeeId') employeeId: string, @Query('year') year?: string) {
    return this.service.getEmployeeSalaryHistory(employeeId, year);
  }

  @Get('hr/payroll-report')
  @ApiOperation({ summary: 'Get payroll report (FR-HR-006)' })
  payrollReport(
    @Query('schoolId') schoolId?: string,
    @Query('organizationId') organizationId?: string,
    @Query('monthYear') monthYear?: string,
  ) {
    return this.service.getPayrollReport({ schoolId, organizationId, monthYear });
  }

  // ── Inventory ─────────────────────────────────────────────────────────────
  @Post('inventory/categories')
  @ApiOperation({ summary: 'Create inventory category (FR-INV-001)' })
  createCategory(@Body() dto: any) {
    return this.service.createInventoryCategory(dto);
  }

  @Get('inventory/categories')
  @ApiOperation({ summary: 'List inventory categories (FR-INV-002)' })
  listCategories() {
    return this.service.listInventoryCategories();
  }

  @Post('inventory/items')
  @ApiOperation({ summary: 'Add inventory item (FR-INV-003)' })
  addItem(@Body() dto: any) {
    return this.service.addInventoryItem(dto);
  }

  @Get('inventory/items')
  @ApiOperation({ summary: 'List inventory items (FR-INV-004)' })
  listItems(
    @Query('schoolId') schoolId?: string,
    @Query('organizationId') organizationId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.service.listInventoryItems({
      schoolId, organizationId, categoryId, search,
      lowStock: lowStock === 'true',
    });
  }

  @Post('inventory/transactions')
  @ApiOperation({ summary: 'Record inventory transaction (FR-INV-005)' })
  recordTransaction(@Request() req, @Body() dto: any) {
    return this.service.recordInventoryTransaction(req.user.userId, dto);
  }

  @Post('inventory/requisitions')
  @ApiOperation({ summary: 'Create inventory requisition (FR-INV-006)' })
  createRequisition(@Request() req, @Body() dto: any) {
    return this.service.createRequisition(req.user.userId, dto);
  }

  @Post('inventory/requisitions/:id/approve')
  @ApiOperation({ summary: 'Approve/reject inventory requisition (FR-INV-007)' })
  approveRequisition(@Request() req, @Param('id') id: string, @Body() body: { approved: boolean }) {
    return this.service.approveRequisition(req.user.userId, id, body.approved);
  }

  @Get('inventory/stats')
  @ApiOperation({ summary: 'Inventory statistics (FR-INV-008)' })
  inventoryStats(@Query('schoolId') schoolId?: string, @Query('organizationId') organizationId?: string) {
    return this.service.getInventoryStats({ schoolId, organizationId });
  }

  @Get('inventory/reports')
  @ApiOperation({ summary: 'Generate inventory reports (FR-INV-009)' })
  inventoryReports(
    @Query('schoolId') schoolId?: string,
    @Query('organizationId') organizationId?: string,
    @Query('reportType') reportType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    if (!reportType) throw new BadRequestException('reportType is required');
    return this.service.getInventoryReports({
      schoolId,
      organizationId,
      reportType,
      startDate,
      endDate,
      categoryId,
    });
  }

  @Post('inventory/lab/reserve')
  @ApiOperation({ summary: 'Reserve lab equipment (FR-INV-010)' })
  reserveLabEquipment(@Request() req, @Body() dto: any) {
    return this.service.reserveLabEquipment(req.user.userId, dto);
  }

  @Post('inventory/lab/usage')
  @ApiOperation({ summary: 'Record lab equipment usage (FR-INV-010)' })
  recordLabUsage(@Request() req, @Body() dto: any) {
    return this.service.recordLabEquipmentUsage(req.user.userId, dto);
  }

  @Post('inventory/lab/calibration')
  @ApiOperation({ summary: 'Schedule equipment calibration (FR-INV-010)' })
  scheduleCalibration(@Request() req, @Body() dto: any) {
    return this.service.scheduleEquipmentCalibration(req.user.userId, dto);
  }

  @Get('inventory/lab/report')
  @ApiOperation({ summary: 'Lab equipment report (FR-INV-010)' })
  labEquipmentReport(
    @Query('schoolId') schoolId?: string,
    @Query('labName') labName?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getLabEquipmentReport({ schoolId, labName, startDate, endDate });
  }

  // ── Certificates ──────────────────────────────────────────────────────────
  @Post('certificates/templates')
  @ApiOperation({ summary: 'Create certificate template (FR-CERT-001)' })
  createCertTemplate(@Request() req, @Body() dto: any) {
    return this.service.createCertificateTemplate(req.user.userId, dto);
  }

  @Get('certificates/templates')
  @ApiOperation({ summary: 'List certificate templates (FR-CERT-002)' })
  listCertTemplates(@Query('certificateType') type?: string) {
    return this.service.listCertificateTemplates(type);
  }

  @Post('certificates/issue')
  @ApiOperation({ summary: 'Issue certificate (FR-CERT-003)' })
  issueCert(@Request() req, @Body() dto: any) {
    return this.service.issueCertificate(req.user.userId, dto);
  }

  @Post('certificates/bulk-issue')
  @ApiOperation({ summary: 'Bulk issue certificates (FR-CERT-004)' })
  bulkIssueCert(@Request() req, @Body() dto: any) {
    return this.service.bulkIssueCertificates(req.user.userId, dto);
  }

  @Get('certificates/recipients/:recipientId')
  @ApiOperation({ summary: 'Get recipient certificates (FR-CERT-005)' })
  recipientCerts(
    @Param('recipientId') recipientId: string,
    @Query('recipientType') recipientType: string,
  ) {
    return this.service.getRecipientCertificates(recipientId, recipientType);
  }

  @Get('certificates/verify/:certNumber')
  @ApiOperation({ summary: 'Verify certificate (FR-CERT-006)' })
  verifyCert(@Param('certNumber') certNumber: string) {
    return this.service.verifyCertificate(certNumber);
  }

  // ── Scholarships ───────────────────────────────────────────────────────────
  @Post('scholarships')
  @ApiOperation({ summary: 'Create scholarship (FR-ACAD-037)' })
  createScholarship(@Body() dto: any) {
    return this.service.createScholarship(dto);
  }

  @Get('scholarships')
  @ApiOperation({ summary: 'List scholarships (FR-ACAD-037)' })
  listScholarships(@Query('schoolId') schoolId?: string, @Query('type') type?: string) {
    return this.service.listScholarships(schoolId, type);
  }

  @Post('scholarships/:id/apply')
  @ApiOperation({ summary: 'Apply for scholarship (FR-ACAD-038)' })
  applyScholarship(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.applyForScholarship(req.user.userId, { ...dto, scholarshipId: id });
  }

  @Put('scholarships/applications/:id/review')
  @ApiOperation({ summary: 'Review scholarship application (FR-ACAD-037)' })
  reviewScholarship(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.reviewScholarshipApplication(req.user.userId, id, dto);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-LIB-010: Library Access Control
  // ══════════════════════════════════════════════════════════════════════════

  @Post('library/access')
  @ApiOperation({ summary: 'Record library check-in/out (FR-LIB-010)' })
  recordLibraryAccess(@Body() dto: any) {
    return this.service.recordLibraryAccess(dto);
  }

  @Get('library/access-logs')
  @ApiOperation({ summary: 'Get library access logs (FR-LIB-010)' })
  getLibraryAccessLogs(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return this.service.getLibraryAccessLogs(schoolId, filters);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-LIB-011: Book Recommendations
  // ══════════════════════════════════════════════════════════════════════════

  @Get('library/recommendations/:userId')
  @ApiOperation({ summary: 'Get personalized book recommendations (FR-LIB-011)' })
  getBookRecommendations(
    @Param('userId') userId: string,
    @Query('userType') userType: string,
    @Query() options: any
  ) {
    return this.service.getBookRecommendations(userId, userType, options);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-LIB-007: E-Library Digital Resources
  // ══════════════════════════════════════════════════════════════════════════

  @Post('library/digital-resources')
  @ApiOperation({ summary: 'Add digital resource (FR-LIB-007)' })
  addDigitalResource(@Request() req, @Body() dto: any) {
    return this.service.addDigitalResource(req.user.userId, dto);
  }

  @Get('library/digital-resources')
  @ApiOperation({ summary: 'List digital resources (FR-LIB-007)' })
  listDigitalResources(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return this.service.listDigitalResources(schoolId, filters);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-008: Vehicle Maintenance Tracking
  // ══════════════════════════════════════════════════════════════════════════

  @Post('transport/maintenance/schedule')
  @ApiOperation({ summary: 'Schedule vehicle maintenance (FR-TRANS-008)' })
  scheduleVehicleMaintenance(@Request() req, @Body() dto: any) {
    return this.service.scheduleVehicleMaintenance(req.user.userId, dto);
  }

  @Put('transport/maintenance/:vehicleId/:maintenanceId/complete')
  @ApiOperation({ summary: 'Log maintenance completion (FR-TRANS-008)' })
  logMaintenanceCompletion(
    @Request() req,
    @Param('vehicleId') vehicleId: string,
    @Param('maintenanceId') maintenanceId: string,
    @Body() dto: any
  ) {
    return this.service.logVehicleMaintenanceCompletion(req.user.userId, vehicleId, maintenanceId, dto);
  }

  @Get('transport/maintenance/:vehicleId/history')
  @ApiOperation({ summary: 'Get vehicle maintenance history (FR-TRANS-008)' })
  getMaintenanceHistory(@Param('vehicleId') vehicleId: string) {
    return this.service.getVehicleMaintenanceHistory(vehicleId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-010: Transport Safety and Compliance
  // ══════════════════════════════════════════════════════════════════════════

  @Post('transport/safety/inspection')
  @ApiOperation({ summary: 'Record safety inspection (FR-TRANS-010)' })
  recordSafetyInspection(@Request() req, @Body() dto: any) {
    const { vehicleId, ...inspectionData } = dto;
    return this.service.recordSafetyInspection(req.user.userId, vehicleId, inspectionData);
  }

  @Get('transport/safety/compliance')
  @ApiOperation({ summary: 'Get safety compliance report (FR-TRANS-010)' })
  getSafetyCompliance(@Query('schoolId') schoolId: string) {
    return this.service.getSafetyComplianceReport(schoolId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-011: Transport Reports and Analytics
  // ══════════════════════════════════════════════════════════════════════════

  @Get('transport/analytics')
  @ApiOperation({ summary: 'Get transport analytics (FR-TRANS-011)' })
  getTransportAnalytics(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return this.service.getTransportAnalytics(schoolId, filters);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-012: Emergency Response System
  // ══════════════════════════════════════════════════════════════════════════

  @Post('transport/emergency')
  @ApiOperation({ summary: 'Log emergency incident (FR-TRANS-012)' })
  logEmergency(@Request() req, @Body() dto: any) {
    return this.service.logEmergencyIncident(req.user.userId, dto);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-008: Leave and Outing Management
  // ══════════════════════════════════════════════════════════════════════════

  @Post('hostel/leave/apply')
  @ApiOperation({ summary: 'Apply for hostel leave (FR-HOSTEL-008)' })
  applyHostelLeave(@Request() req, @Body() dto: any) {
    return this.service.applyHostelLeave(req.user.userId, dto);
  }

  @Put('hostel/leave/:leaveId/approve')
  @ApiOperation({ summary: 'Approve/reject hostel leave (FR-HOSTEL-008)' })
  approveHostelLeave(@Request() req, @Param('leaveId') leaveId: string, @Body() dto: any) {
    return this.service.approveHostelLeave(req.user.userId, leaveId, dto.approved, dto.remarks);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-009: Hostel Inventory Management
  // ══════════════════════════════════════════════════════════════════════════

  @Post('hostel/inventory')
  @ApiOperation({ summary: 'Add hostel inventory item (FR-HOSTEL-009)' })
  addHostelInventory(@Request() req, @Body() dto: any) {
    return this.service.addHostelInventoryItem(req.user.userId, dto);
  }

  @Get('hostel/inventory/report')
  @ApiOperation({ summary: 'Get hostel inventory report (FR-HOSTEL-009)' })
  getHostelInventoryReport(@Query('blockId') blockId?: string) {
    return this.service.getHostelInventoryReport(blockId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-010: Discipline and Complaints
  // ══════════════════════════════════════════════════════════════════════════

  @Post('hostel/discipline')
  @ApiOperation({ summary: 'Record hostel disciplinary action (FR-HOSTEL-010)' })
  recordHostelDiscipline(@Request() req, @Body() dto: any) {
    return this.service.recordHostelDisciplinaryAction(req.user.userId, dto);
  }

  @Post('hostel/complaints')
  @ApiOperation({ summary: 'Register hostel complaint (FR-HOSTEL-010)' })
  registerHostelComplaint(@Request() req, @Body() dto: any) {
    return this.service.registerHostelComplaint(req.user.userId, dto);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-011: Hostel Maintenance
  // ══════════════════════════════════════════════════════════════════════════

  @Post('hostel/maintenance')
  @ApiOperation({ summary: 'Create hostel maintenance request (FR-HOSTEL-011)' })
  createHostelMaintenance(@Request() req, @Body() dto: any) {
    return this.service.createHostelMaintenanceRequest(req.user.userId, dto);
  }

  @Put('hostel/maintenance/:requestId')
  @ApiOperation({ summary: 'Update hostel maintenance status (FR-HOSTEL-011)' })
  updateHostelMaintenance(@Request() req, @Param('requestId') requestId: string, @Body() dto: any) {
    return this.service.updateHostelMaintenanceStatus(req.user.userId, requestId, dto);
  }

  @Get('hostel/maintenance/report')
  @ApiOperation({ summary: 'Get hostel maintenance report (FR-HOSTEL-011)' })
  getHostelMaintenanceReport(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return this.service.getHostelMaintenanceReport(schoolId, filters);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-HOSTEL-012: Hostel Reports and Analytics
  // ══════════════════════════════════════════════════════════════════════════

  @Get('hostel/analytics')
  @ApiOperation({ summary: 'Get hostel analytics (FR-HOSTEL-012)' })
  getHostelAnalytics(@Query('schoolId') schoolId: string) {
    return this.service.getHostelAnalytics(schoolId);
  }
  // ══════════════════════════════════════════════════════════════════════════
  // FR-EVENT-001 to FR-EVENT-009: EVENT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('events')
  @ApiOperation({ summary: 'Create event (FR-EVENT-001)' })
  createEvent(@Request() req, @Body() dto: any) {
    return this.service.createEvent(req.user.userId, dto);
  }

  @Get('events')
  @ApiOperation({ summary: 'List events (FR-EVENT-001)' })
  listEvents(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return this.service.listEvents(schoolId, filters);
  }

  @Get('events/calendar')
  @ApiOperation({ summary: 'Get event calendar (FR-EVENT-002)' })
  getEventCalendar(@Query('schoolId') schoolId: string, @Query('month') month: string, @Query('year') year: string) {
    return this.service.getEventCalendar(schoolId, { month: month ? parseInt(month) : undefined, year: year ? parseInt(year) : undefined });
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get event by ID (FR-EVENT-001)' })
  getEvent(@Param('id') id: string) {
    return this.service.getEvent(id);
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Update event (FR-EVENT-001)' })
  updateEvent(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateEvent(id, req.user.userId, dto);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete event (FR-EVENT-001)' })
  deleteEvent(@Request() req, @Param('id') id: string) {
    return this.service.deleteEvent(id, req.user.userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-HR-007: TRAINING AND DEVELOPMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('hr/training')
  @ApiOperation({ summary: 'Schedule training event (FR-HR-007)' })
  scheduleTraining(@Request() req, @Body() dto: any) {
    return this.service.scheduleTraining(req.user.userId, dto);
  }

  @Get('hr/training/calendar')
  @ApiOperation({ summary: 'Get training calendar (FR-HR-007)' })
  getTrainingCalendar(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return this.service.getTrainingCalendar(schoolId, filters);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-HR-002: LEAVE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('hr/leave/apply')
  @ApiOperation({ summary: 'Apply for leave (FR-HR-002)' })
  applyLeave(@Request() req, @Body() dto: any) {
    return this.service.applyLeave(req.user.userId, dto);
  }

  @Put('hr/leave/:leaveId/approve')
  @ApiOperation({ summary: 'Approve or reject leave (FR-HR-002)' })
  approveLeave(@Request() req, @Param('leaveId') leaveId: string, @Body() dto: any) {
    return this.service.approveLeave(leaveId, req.user.userId, dto.approved, dto.remarks);
  }

  @Get('hr/leave/balance/:employeeId')
  @ApiOperation({ summary: 'Get leave balance (FR-HR-002)' })
  getLeaveBalance(@Param('employeeId') employeeId: string) {
    return this.service.getLeaveBalance(employeeId);
  }

  @Get('hr/leave/history/:employeeId')
  @ApiOperation({ summary: 'Get leave history (FR-HR-002)' })
  getLeaveHistory(@Param('employeeId') employeeId: string, @Query() filters: any) {
    return this.service.getLeaveHistory(employeeId, filters);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-HR-010: HR REPORTS AND ANALYTICS
  // ══════════════════════════════════════════════════════════════════════════

  @Get('hr/analytics')
  @ApiOperation({ summary: 'Get HR analytics (FR-HR-010)' })
  getHRAnalytics(@Query() filters: any) {
    return this.service.getHRAnalytics(filters);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-DISC-003 to FR-DISC-010: EXPANDED DISCIPLINE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('discipline/behavior')
  @ApiOperation({ summary: 'Log student behavior (FR-DISC-003)' })
  logStudentBehavior(@Request() req, @Body() dto: any) {
    return this.service.logStudentBehavior(req.user.userId, dto);
  }

  @Get('discipline/behavior/:studentId')
  @ApiOperation({ summary: 'Get student behavior history (FR-DISC-003)' })
  getStudentBehaviorHistory(@Param('studentId') studentId: string, @Query() filters: any) {
    return this.service.getStudentBehaviorHistory(studentId, filters);
  }

  @Post('discipline/counseling')
  @ApiOperation({ summary: 'Schedule counseling session (FR-DISC-004)' })
  scheduleCounseling(@Request() req, @Body() dto: any) {
    return this.service.scheduleCounseling(req.user.userId, dto);
  }

  @Get('discipline/counseling/:studentId')
  @ApiOperation({ summary: 'Get counseling history (FR-DISC-004)' })
  getCounselingHistory(@Param('studentId') studentId: string) {
    return this.service.getCounselingHistory(studentId);
  }

  @Post('discipline/parent-notification')
  @ApiOperation({ summary: 'Send parent discipline notification (FR-DISC-005)' })
  sendParentDisciplineNotification(@Request() req, @Body() dto: any) {
    return this.service.sendParentDisciplineNotification(req.user.userId, dto);
  }

  @Get('discipline/analytics')
  @ApiOperation({ summary: 'Get discipline analytics and reports (FR-DISC-009)' })
  getDisciplineAnalytics(@Query('schoolId') schoolId: string, @Query() filters: any) {
    return this.service.getDisciplineAnalytics(schoolId, filters);
  }

  @Post('discipline/positive')
  @ApiOperation({ summary: 'Log positive behavior (FR-DISC-010)' })
  logPositiveBehavior(@Request() req, @Body() dto: any) {
    return this.service.logPositiveBehavior(req.user.userId, dto);
  }

  @Get('discipline/positive/:studentId')
  @ApiOperation({ summary: 'Get positive behavior records (FR-DISC-010)' })
  getPositiveBehaviorRecords(@Param('studentId') studentId: string) {
    return this.service.getPositiveBehaviorRecords(studentId);
  }

  @Get('discipline/leaderboard')
  @ApiOperation({ summary: 'Get positive behavior leaderboard (FR-DISC-010)' })
  getBehaviorLeaderboard(@Query('schoolId') schoolId: string, @Query('limit') limit: string) {
    return this.service.getBehaviorLeaderboard(schoolId, limit ? parseInt(limit) : 20);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-TRANS-009: GPS TRACKING AND TRIP MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('transport/gps/update')
  @ApiOperation({ summary: 'Update vehicle GPS location (FR-TRANS-009)' })
  updateVehicleGPS(@Body() dto: any) {
    const { vehicleId, ...gpsData } = dto;
    return this.service.updateVehicleGPS(vehicleId, gpsData);
  }

  @Get('transport/gps/:vehicleId/history')
  @ApiOperation({ summary: 'Get vehicle GPS history (FR-TRANS-009)' })
  getVehicleGPSHistory(
    @Param('vehicleId') vehicleId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getVehicleGPSHistory(vehicleId, {
      startTime,
      endTime,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @Post('transport/trips')
  @ApiOperation({ summary: 'Create transport trip (FR-TRANS-009)' })
  createTrip(@Request() req, @Body() dto: any) {
    return this.service.createTrip(req.user.userId, dto);
  }

  @Post('transport/trips/:tripId/start')
  @ApiOperation({ summary: 'Start trip (FR-TRANS-009)' })
  startTrip(@Request() req, @Param('tripId') tripId: string, @Body() dto: any) {
    return this.service.startTrip(tripId, req.user.userId, dto);
  }

  @Post('transport/trips/:tripId/end')
  @ApiOperation({ summary: 'End trip (FR-TRANS-009)' })
  endTrip(@Request() req, @Param('tripId') tripId: string, @Body() dto: any) {
    return this.service.endTrip(tripId, req.user.userId, dto);
  }

  @Get('transport/trips/:tripId')
  @ApiOperation({ summary: 'Get trip details (FR-TRANS-009)' })
  getTripDetails(@Param('tripId') tripId: string) {
    return this.service.getTripDetails(tripId);
  }

  @Get('transport/trips')
  @ApiOperation({ summary: 'List trips (FR-TRANS-009)' })
  listTrips(@Query() filters: any) {
    return this.service.listTrips({
      routeId: filters.routeId,
      vehicleId: filters.vehicleId,
      date: filters.date,
      status: filters.status,
      page: filters.page ? parseInt(filters.page) : 1,
      limit: filters.limit ? parseInt(filters.limit) : 20,
    });
  }

  @Post('transport/attendance/mark')
  @ApiOperation({ summary: 'Mark student transport attendance (FR-TRANS-009)' })
  markStudentTransportAttendance(@Request() req, @Body() dto: any) {
    return this.service.markStudentAttendance(req.user.userId, dto);
  }

  @Get('transport/attendance/report')
  @ApiOperation({ summary: 'Get transport attendance report (FR-TRANS-009)' })
  getTransportAttendanceReport(@Query() filters: any) {
    return this.service.getTransportAttendanceReport({
      routeId: filters.routeId,
      studentId: filters.studentId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-FEE-HOSTEL: HOSTEL FEE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('hostel/fees')
  @ApiOperation({ summary: 'Create hostel fee structure (FR-FEE-HOSTEL)' })
  createHostelFee(@Request() req, @Body() dto: any) {
    return this.service.createHostelFee(req.user.userId, dto);
  }

  @Get('hostel/fees')
  @ApiOperation({ summary: 'List hostel fees (FR-FEE-HOSTEL)' })
  listHostelFees(@Query('blockId') blockId?: string) {
    return this.service.listHostelFees(blockId);
  }

  @Put('hostel/fees/:feeId')
  @ApiOperation({ summary: 'Update hostel fee (FR-FEE-HOSTEL)' })
  updateHostelFee(@Request() req, @Param('feeId') feeId: string, @Body() dto: any) {
    return this.service.updateHostelFee(feeId, req.user.userId, dto);
  }

  @Delete('hostel/fees/:feeId')
  @ApiOperation({ summary: 'Delete hostel fee (FR-FEE-HOSTEL)' })
  deleteHostelFee(@Request() req, @Param('feeId') feeId: string) {
    return this.service.deleteHostelFee(feeId, req.user.userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-INV-SUPPLIERS: SUPPLIER MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('inventory/suppliers')
  @ApiOperation({ summary: 'Create supplier (FR-INV-SUPPLIERS)' })
  createSupplier(@Request() req, @Body() dto: any) {
    return this.service.createSupplier(req.user.userId, dto);
  }

  @Get('inventory/suppliers')
  @ApiOperation({ summary: 'List suppliers (FR-INV-SUPPLIERS)' })
  listSuppliers(@Query() filters: any) {
    return this.service.listSuppliers({
      category: filters.category,
      search: filters.search,
      active: filters.active !== undefined ? filters.active === 'true' : undefined,
    });
  }

  @Get('inventory/suppliers/:supplierId')
  @ApiOperation({ summary: 'Get supplier details (FR-INV-SUPPLIERS)' })
  getSupplier(@Param('supplierId') supplierId: string) {
    return this.service.getSupplier(supplierId);
  }

  @Put('inventory/suppliers/:supplierId')
  @ApiOperation({ summary: 'Update supplier (FR-INV-SUPPLIERS)' })
  updateSupplier(@Request() req, @Param('supplierId') supplierId: string, @Body() dto: any) {
    return this.service.updateSupplier(supplierId, req.user.userId, dto);
  }

  @Delete('inventory/suppliers/:supplierId')
  @ApiOperation({ summary: 'Delete/deactivate supplier (FR-INV-SUPPLIERS)' })
  deleteSupplier(@Request() req, @Param('supplierId') supplierId: string) {
    return this.service.deleteSupplier(supplierId, req.user.userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-TIME-001–012: TIMETABLE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('timetable/time-slots')
  @ApiOperation({ summary: 'Create time slot (FR-TIME-001)' })
  createTimeSlot(@Request() req, @Body() dto: any) {
    return this.service.createTimeSlot(req.user.userId, dto);
  }

  @Get('timetable/time-slots')
  @ApiOperation({ summary: 'List time slots for school (FR-TIME-001)' })
  listTimeSlots(@Query('schoolId') schoolId: string) {
    return this.service.listTimeSlots(schoolId);
  }

  @Post('timetable/entries')
  @ApiOperation({ summary: 'Create timetable entry (FR-TIME-002)' })
  createTimetableEntry(@Request() req, @Body() dto: any) {
    return this.service.createTimetableEntry(req.user.userId, dto);
  }

  @Get('timetable/section/:sectionId')
  @ApiOperation({ summary: 'Get section timetable (FR-TIME-004)' })
  getSectionTimetable(@Param('sectionId') sectionId: string) {
    return this.service.getSectionTimetable(sectionId);
  }

  @Get('timetable/teacher/:teacherId')
  @ApiOperation({ summary: 'Get teacher timetable (FR-TIME-004)' })
  getTeacherTimetable(@Param('teacherId') teacherId: string) {
    return this.service.getTeacherTimetable(teacherId);
  }

  @Get('timetable/room/:roomId')
  @ApiOperation({ summary: 'Get room schedule (FR-TIME-012)' })
  getRoomSchedule(@Param('roomId') roomId: string) {
    return this.service.getRoomSchedule(roomId);
  }

  @Put('timetable/entries/:id')
  @ApiOperation({ summary: 'Update timetable entry (FR-TIME-005)' })
  updateTimetableEntry(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateTimetableEntry(id, dto);
  }

  @Delete('timetable/entries/:id')
  @ApiOperation({ summary: 'Delete timetable entry (FR-TIME-006)' })
  deleteTimetableEntry(@Param('id') id: string) {
    return this.service.deleteTimetableEntry(id);
  }

  @Post('timetable/conflicts/check')
  @ApiOperation({ summary: 'Check timetable conflicts (FR-TIME-007)' })
  checkTimetableConflicts(@Body() dto: any) {
    return this.service.checkTimetableConflicts(dto);
  }

  @Post('timetable/auto-generate')
  @ApiOperation({ summary: 'Auto-generate timetable (FR-TIME-008)' })
  autoGenerateTimetable(@Body() dto: any) {
    return this.service.autoGenerateTimetable(dto);
  }

  @Post('timetable/entries/:id/substitute')
  @ApiOperation({ summary: 'Assign substitute teacher to period (FR-TIME-009)' })
  assignTimetableSubstitute(
    @Param('id') id: string,
    @Body('substituteTeacherId') substituteTeacherId: string,
    @Body('reason') reason: string,
  ) {
    return this.service.assignTimetableSubstitute(id, substituteTeacherId, reason);
  }

  @Post('timetable/swap')
  @ApiOperation({ summary: 'Swap two timetable periods (FR-TIME-010)' })
  swapTimetablePeriods(@Body('entryId1') entryId1: string, @Body('entryId2') entryId2: string) {
    return this.service.swapTimetablePeriods(entryId1, entryId2);
  }

  @Get('timetable/teacher/:teacherId/workload')
  @ApiOperation({ summary: 'Get teacher timetable workload (FR-TIME-011)' })
  getTimetableTeacherWorkload(@Param('teacherId') teacherId: string) {
    return this.service.getTimetableTeacherWorkload(teacherId);
  }
}
