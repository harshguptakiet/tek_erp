import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate payment (FR-PAY-001)' })
  initiate(@Request() req, @Body() dto: any) {
    return this.service.initiatePayment(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments (FR-PAY-003)' })
  list(
    @Query('userId') userId?: string,
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listPayments({ userId, organizationId, status, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 20 });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Payment summary report (FR-REPORT-001)' })
  summary(
    @Query('organizationId') organizationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getPaymentSummary({ organizationId, startDate, endDate });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details (FR-PAY-002)' })
  get(@Param('id') id: string) {
    return this.service.getPayment(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update payment status (webhook) (FR-PAY-004)' })
  updateStatus(@Param('id') id: string, @Body() dto: any) {
    return this.service.updatePaymentStatus(id, dto);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry payment (FR-PAY-005)' })
  retry(@Request() req, @Param('id') id: string) {
    return this.service.retryPayment(req.user.userId, id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Request refund (FR-REFUND-001)' })
  requestRefund(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.requestRefund(req.user.userId, id, dto);
  }

  @Put('refunds/:refundId/process')
  @ApiOperation({ summary: 'Process refund (FR-REFUND-002)' })
  processRefund(@Request() req, @Param('refundId') refundId: string, @Body() body: { approved: boolean; reason?: string }) {
    return this.service.processRefund(req.user.userId, refundId, body.approved, body.reason);
  }
}

// Fee management controller
@ApiTags('Fees')
@Controller('fees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeesController {
  constructor(private readonly service: PaymentsService) {}

  @Post('structures')
  @ApiOperation({ summary: 'Create fee structure (FR-FEE-001)' })
  createStructure(@Request() req, @Body() dto: any) {
    return this.service.createFeeStructure(req.user.userId, dto);
  }

  @Get('structures')
  @ApiOperation({ summary: 'List fee structures (FR-FEE-002)' })
  listStructures(
    @Query('schoolId') schoolId: string,
    @Query('grade') grade?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.service.listFeeStructures(schoolId, grade ? parseInt(grade) : undefined, academicYear);
  }

  @Post('records')
  @ApiOperation({ summary: 'Generate fee record for student (FR-FEE-003)' })
  generateRecord(@Request() req, @Body() dto: any) {
    return this.service.generateFeeRecord(req.user.userId, dto);
  }

  @Post('records/:id/collect')
  @ApiOperation({ summary: 'Collect fee payment (FR-FEE-004)' })
  collectPayment(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.service.collectFeePayment(req.user.userId, id, dto);
  }

  @Get('students/:studentId/statement')
  @ApiOperation({ summary: 'Get student fee statement (FR-FEE-005)' })
  studentStatement(@Param('studentId') studentId: string) {
    return this.service.getStudentFeeStatement(studentId);
  }

  @Get('schools/:schoolId/collection')
  @ApiOperation({ summary: 'Get fee collection report (FR-FEE-006)' })
  feeCollection(
    @Param('schoolId') schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('grade') grade?: string,
  ) {
    return this.service.getFeeCollection(schoolId, { startDate, endDate, grade: grade ? parseInt(grade) : undefined });
  }

  @Post('concessions')
  @ApiOperation({ summary: 'Apply fee concession (FR-FEE-007)' })
  applyConcession(@Request() req, @Body() dto: any) {
    return this.service.applyFeeConcession(req.user.userId, dto);
  }

  @Post('records/:id/installments')
  @ApiOperation({ summary: 'Create installment plan (FR-FEE-008)' })
  createInstallments(@Param('id') id: string, @Body() dto: any) {
    return this.service.createInstallmentPlan({ ...dto, feeRecordId: id });
  }

  @Get('schools/:schoolId/defaulters')
  @ApiOperation({ summary: 'Get fee defaulters (FR-FEE-009)' })
  feeDefaulters(@Param('schoolId') schoolId: string) {
    return this.service.getFeeDefaulters(schoolId);
  }

  @Post('waivers')
  @ApiOperation({ summary: 'Apply fee waiver (FR-FEE-010)' })
  applyWaiver(@Request() req, @Body() dto: any) {
    return this.service.applyFeeWaiver(req.user.userId, dto);
  }
}
