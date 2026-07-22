import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
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
}
