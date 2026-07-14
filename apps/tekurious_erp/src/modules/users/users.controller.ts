import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { BulkOperationsService } from './services/bulk-operations.service';
import { UserSearchService } from './services/user-search.service';
import { UserPermissionsService } from './services/user-permissions.service';
import { UserStatusService } from './services/user-status.service';
import { StudentProfileService } from './services/student-profile.service';
import { TeacherProfileService } from './services/teacher-profile.service';
import { ParentProfileService } from './services/parent-profile.service';
import {
  UpdateUserProfileDto,
  ChangeEmailDto,
  ChangePhoneDto,
  PrivacySettingsDto,
  DeactivateAccountDto,
} from './dto/user-profile.dto';
import {
  BulkUserImportDto,
  BulkStatusChangeDto,
  SearchUsersDto,
} from './dto/bulk-operations.dto';
import {
  CreateStudentProfileDto,
  UpdateStudentProfileDto,
} from './dto/student-profile.dto';
import {
  CreateTeacherProfileDto,
  UpdateTeacherProfileDto,
} from './dto/teacher-profile.dto';
import {
  CreateParentProfileDto,
  LinkParentStudentDto,
  UpdateParentProfileDto,
} from './dto/parent-profile.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly bulkOperationsService: BulkOperationsService,
    private readonly userSearchService: UserSearchService,
    private readonly userPermissionsService: UserPermissionsService,
    private readonly userStatusService: UserStatusService,
    private readonly studentProfileService: StudentProfileService,
    private readonly teacherProfileService: TeacherProfileService,
    private readonly parentProfileService: ParentProfileService,
  ) {}

  // FR-USER-001: View User Profile
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getUserProfile(@Request() req) {
    return this.usersService.getUserProfile(req.user.userId);
  }

  // FR-USER-002: Edit User Profile
  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateUserProfile(
    @Request() req,
    @Body() updateData: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(req.user.userId, updateData);
  }

  // FR-USER-004: Change Email Address
  @Post('change-email')
  @ApiOperation({ summary: 'Initiate email change' })
  async changeEmail(@Request() req, @Body() changeEmailDto: ChangeEmailDto) {
    return this.usersService.initiateEmailChange(
      req.user.userId,
      changeEmailDto,
    );
  }

  // FR-USER-005: Change Phone Number
  @Post('change-phone')
  @ApiOperation({ summary: 'Initiate phone change' })
  async changePhone(@Request() req, @Body() changePhoneDto: ChangePhoneDto) {
    return this.usersService.initiatePhoneChange(
      req.user.userId,
      changePhoneDto,
    );
  }

  // FR-USER-006: Deactivate Account
  @Post('deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  async deactivateAccount(
    @Request() req,
    @Body() deactivateDto: DeactivateAccountDto,
  ) {
    return this.usersService.deactivateAccount(req.user.userId, deactivateDto);
  }

  // FR-USER-007: Delete Account Permanently
  @Delete('delete-permanently')
  @ApiOperation({ summary: 'Delete user account permanently' })
  async deleteAccountPermanently(
    @Request() req,
    @Body() body: { password: string; reason?: string },
  ) {
    return this.usersService.deleteAccountPermanently(
      req.user.userId,
      body.password,
      body.reason,
    );
  }

  // FR-USER-013: Student Academic History
  @Get('students/:studentId/academic-history')
  @ApiOperation({ summary: 'Get student academic history (enrollments, grades, results)' })
  async getStudentAcademicHistory(@Param('studentId') studentId: string) {
    return this.usersService.getStudentAcademicHistory(studentId);
  }

  // FR-USER-014: Student Health Records
  @Get('students/:studentId/health')
  @ApiOperation({ summary: 'Get student health / emergency info' })
  async getStudentHealth(@Param('studentId') studentId: string) {
    return this.usersService.getStudentHealth(studentId);
  }

  @Put('students/:studentId/health')
  @ApiOperation({ summary: 'Update student health / emergency info' })
  async updateStudentHealth(
    @Request() req,
    @Param('studentId') studentId: string,
    @Body() body: { bloodGroup?: string; emergencyContact?: Record<string, any>; medicalNotes?: string },
  ) {
    return this.usersService.updateStudentHealth(req.user.userId, studentId, body);
  }

  // FR-USER-046: Bulk User Deletion
  @Post('admin/bulk-delete')
  @ApiOperation({ summary: 'Bulk soft-delete users (Admin)' })
  async bulkDeleteUsers(
    @Request() req,
    @Body() body: { userIds: string[]; reason: string },
  ) {
    return this.usersService.bulkDeleteUsers(req.user.userId, body.userIds, body.reason);
  }

  // FR-USER-010: Download User Data (GDPR)
  @Get('gdpr/export')
  @ApiOperation({ summary: 'Export all user data (GDPR subject access request)' })
  async exportUserData(@Request() req) {
    return this.usersService.exportUserData(req.user.userId);
  }

  // FR-USER-025: Teacher Payroll Summary (unblocked by HR module)
  @Get('teachers/:teacherId/payroll-summary')
  @ApiOperation({ summary: 'Get teacher payroll summary (FR-USER-025)' })
  async getTeacherPayrollSummary(@Param('teacherId') teacherId: string) {
    return this.usersService.getTeacherPayrollSummary(teacherId);
  }

  // FR-USER-056: User Analytics Dashboard
  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'User analytics dashboard (FR-USER-056)' })
  async getUserAnalytics(@Request() req) {
    return this.usersService.getUserAnalyticsDashboard(req.user.userId);
  }

  // FR-USER-057: Generate User Reports
  @Post('admin/reports')
  @ApiOperation({ summary: 'Generate user report (FR-USER-057)' })
  async generateUserReport(
    @Request() req,
    @Body() dto: any,
  ) {
    return this.usersService.generateUserReport(req.user.userId, dto);
  }

  // FR-USER-058: User Activity Monitoring
  @Get('admin/activity/:userId')
  @ApiOperation({ summary: 'Get user activity monitoring (FR-USER-058)' })
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('days') days?: string,
  ) {
    return this.usersService.getUserActivityMonitoring(userId, days ? parseInt(days) : 30);
  }

  // FR-USER-060: User Feedback
  @Post('feedback')
  @ApiOperation({ summary: 'Submit user feedback (FR-USER-060)' })
  async submitFeedback(@Request() req, @Body() dto: any) {
    return this.usersService.submitUserFeedback(req.user.userId, dto);
  }
  @ApiOperation({ summary: 'Update teacher qualifications (FR-USER-021)' })
  async updateTeacherQualifications(@Request() req, @Param('teacherId') teacherId: string, @Body() dto: any) {
    return this.usersService.updateTeacherQualifications(req.user.userId, teacherId, dto);
  }

  // FR-USER-024: Teacher Performance Metrics
  @Get('teachers/:teacherId/performance')
  @ApiOperation({ summary: 'Get teacher performance metrics (FR-USER-024)' })
  async getTeacherPerformance(@Param('teacherId') teacherId: string) {
    return this.usersService.getTeacherPerformanceMetrics(teacherId);
  }

  // FR-USER-026: Teacher Professional Development
  @Post('teachers/:teacherId/professional-development')
  @ApiOperation({ summary: 'Record professional development activity (FR-USER-026)' })
  async recordProfessionalDevelopment(@Request() req, @Param('teacherId') teacherId: string, @Body() dto: any) {
    return this.usersService.recordProfessionalDevelopment(req.user.userId, teacherId, dto);
  }

  @Get('teachers/:teacherId/professional-development')
  @ApiOperation({ summary: 'Get professional development history' })
  async getProfessionalDevelopment(@Param('teacherId') teacherId: string) {
    return this.usersService.getTeacherProfessionalDevelopment(teacherId);
  }

  // FR-USER-030: Parent Communication Preferences
  @Put('parents/:parentId/communication-preferences')
  @ApiOperation({ summary: 'Update parent communication preferences (FR-USER-030)' })
  async updateParentCommPrefs(@Request() req, @Param('parentId') parentId: string, @Body() dto: any) {
    return this.usersService.updateParentCommunicationPreferences(parentId, dto);
  }

  // FR-USER-008: View Activity Log
  @Get('activity-log')
  @ApiOperation({ summary: 'Get user activity log' })
  async getActivityLog(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 50;
    return this.usersService.getActivityLog(req.user.userId, pageNum, limitNum);
  }

  // FR-USER-009: Privacy Settings Management
  @Put('privacy-settings')
  @ApiOperation({ summary: 'Update privacy settings' })
  async updatePrivacySettings(
    @Request() req,
    @Body() privacySettings: PrivacySettingsDto,
  ) {
    return this.usersService.updatePrivacySettings(
      req.user.userId,
      privacySettings,
    );
  }

  // FR-USER-039: Search Users
  @Post('search')
  @ApiOperation({ summary: 'Search users' })
  async searchUsers(
    @Body() searchDto: SearchUsersDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.userSearchService.searchUsers(searchDto, pageNum, limitNum);
  }

  // FR-USER-040: User Directory
  @Get('directory')
  @ApiOperation({ summary: 'Get user directory' })
  async getUserDirectory(
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 50;
    return this.userSearchService.getUserDirectory(role, pageNum, limitNum);
  }

  // FR-USER-042: View Public Profile
  @Get(':userId/public')
  @ApiOperation({ summary: 'Get public user profile' })
  async getPublicProfile(@Param('userId') userId: string) {
    return this.userSearchService.getPublicProfile(userId);
  }

  // FR-USER-053: View User Permissions
  @Get('permissions')
  @ApiOperation({ summary: 'Get user permissions' })
  async getUserPermissions(@Request() req) {
    return this.userPermissionsService.getUserPermissions(req.user.userId);
  }

  // Admin endpoints

  // FR-USER-043: Bulk User Import
  @Post('admin/bulk-import')
  @ApiOperation({ summary: 'Bulk import users (Admin)' })
  async bulkImportUsers(
    @Request() req,
    @Body() importDto: BulkUserImportDto,
  ) {
    return this.bulkOperationsService.bulkImportUsers(
      req.user.userId,
      importDto,
    );
  }

  // FR-USER-044: Bulk User Export
  @Get('admin/bulk-export')
  @ApiOperation({ summary: 'Bulk export users (Admin)' })
  async bulkExportUsers(
    @Request() req,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.bulkOperationsService.bulkExportUsers(req.user.userId, {
      role,
      status,
      organizationId,
    });
  }

  // FR-USER-045: Bulk User Update
  @Put('admin/bulk-update')
  @ApiOperation({ summary: 'Bulk update users (Admin)' })
  async bulkUpdateUsers(
    @Request() req,
    @Body()
    updateDto: {
      userIds: string[];
      updates: { status?: string; role?: string };
    },
  ) {
    return this.bulkOperationsService.bulkUpdateUsers(
      req.user.userId,
      updateDto.userIds,
      updateDto.updates,
    );
  }

  // FR-USER-047: Activate User Account
  @Post('admin/activate/:userId')
  @ApiOperation({ summary: 'Activate user account (Admin)' })
  async activateUser(
    @Request() req,
    @Param('userId') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.usersService.activateUserAccount(
      req.user.userId,
      userId,
      reason,
    );
  }

  // FR-USER-048: Suspend User Account
  @Post('admin/suspend/:userId')
  @ApiOperation({ summary: 'Suspend user account (Admin)' })
  async suspendUser(
    @Request() req,
    @Param('userId') userId: string,
    @Body('reason') reason: string,
    @Body('duration') duration?: number,
  ) {
    return this.usersService.suspendUserAccount(
      req.user.userId,
      userId,
      reason,
      duration,
    );
  }

  // FR-USER-049: User Status History
  @Get('admin/status-history/:userId')
  @ApiOperation({ summary: 'Get user status history (Admin)' })
  async getUserStatusHistory(@Param('userId') userId: string) {
    return this.userStatusService.getUserStatusHistory(userId);
  }

  // FR-USER-050: Bulk Status Change
  @Post('admin/bulk-status-change')
  @ApiOperation({ summary: 'Bulk change user status (Admin)' })
  async bulkStatusChange(
    @Request() req,
    @Body() bulkStatusDto: BulkStatusChangeDto,
  ) {
    return this.userStatusService.bulkStatusChange(
      req.user.userId,
      bulkStatusDto.userIds,
      bulkStatusDto.newStatus,
      bulkStatusDto.reason,
    );
  }

  // FR-USER-051: Assign Role to User
  @Post('admin/assign-role/:userId')
  @ApiOperation({ summary: 'Assign role to user (Admin)' })
  async assignRole(
    @Request() req,
    @Param('userId') userId: string,
    @Body('role') role: string,
  ) {
    return this.usersService.assignRole(req.user.userId, userId, role);
  }

  // FR-USER-052: Change User Role
  @Put('admin/change-role/:userId')
  @ApiOperation({ summary: 'Change user role (Admin)' })
  async changeRole(
    @Request() req,
    @Param('userId') userId: string,
    @Body('role') newRole: string,
    @Body('reason') reason: string,
  ) {
    return this.usersService.changeUserRole(
      req.user.userId,
      userId,
      newRole,
      reason,
    );
  }

  // FR-USER-053: View User Permissions (Admin viewing others)
  @Get('admin/permissions/:userId')
  @ApiOperation({ summary: 'Get user permissions (Admin)' })
  async getUserPermissionsAdmin(@Param('userId') userId: string) {
    return this.userPermissionsService.getUserPermissions(userId);
  }

  // FR-USER-054: Grant Custom Permission
  @Post('admin/grant-permission/:userId')
  @ApiOperation({ summary: 'Grant custom permission (Admin)' })
  async grantPermission(
    @Request() req,
    @Param('userId') userId: string,
    @Body('resource') resource: string,
    @Body('action') action: string,
    @Body('reason') reason: string,
  ) {
    return this.userPermissionsService.grantCustomPermission(
      req.user.userId,
      userId,
      resource,
      action,
      reason,
    );
  }

  // FR-USER-055: Revoke Custom Permission
  @Post('admin/revoke-permission/:userId')
  @ApiOperation({ summary: 'Revoke custom permission (Admin)' })
  async revokePermission(
    @Request() req,
    @Param('userId') userId: string,
    @Body('resource') resource: string,
    @Body('action') action: string,
    @Body('reason') reason: string,
  ) {
    return this.userPermissionsService.revokeCustomPermission(
      req.user.userId,
      userId,
      resource,
      action,
      reason,
    );
  }

  // ========== Student Profile Endpoints ==========

  // FR-USER-011: Create Student Profile
  @Post('admin/students')
  @ApiOperation({ summary: 'Create student profile (Admin)' })
  async createStudentProfile(
    @Request() req,
    @Body() createDto: CreateStudentProfileDto,
  ) {
    return this.studentProfileService.createStudentProfile(
      req.user.userId,
      createDto,
    );
  }

  // FR-USER-012: Edit Student Profile
  @Put('admin/students/:studentId')
  @ApiOperation({ summary: 'Update student profile (Admin)' })
  async updateStudentProfile(
    @Request() req,
    @Param('studentId') studentId: string,
    @Body() updateDto: UpdateStudentProfileDto,
  ) {
    return this.studentProfileService.updateStudentProfile(
      req.user.userId,
      studentId,
      updateDto,
    );
  }

  // Get student profile
  @Get('students/:studentId')
  @ApiOperation({ summary: 'Get student profile' })
  async getStudentProfile(@Param('studentId') studentId: string) {
    return this.studentProfileService.getStudentProfile(studentId);
  }

  // Get student profile by user ID
  @Get('students/by-user/:userId')
  @ApiOperation({ summary: 'Get student profile by user ID' })
  async getStudentProfileByUserId(@Param('userId') userId: string) {
    return this.studentProfileService.getStudentProfileByUserId(userId);
  }

  // ========== Teacher Profile Endpoints ==========

  // FR-USER-019: Create Teacher Profile
  @Post('admin/teachers')
  @ApiOperation({ summary: 'Create teacher profile (Admin)' })
  async createTeacherProfile(
    @Request() req,
    @Body() createDto: CreateTeacherProfileDto,
  ) {
    return this.teacherProfileService.createTeacherProfile(
      req.user.userId,
      createDto,
    );
  }

  // FR-USER-020: Edit Teacher Profile
  @Put('admin/teachers/:teacherId')
  @ApiOperation({ summary: 'Update teacher profile (Admin)' })
  async updateTeacherProfile(
    @Request() req,
    @Param('teacherId') teacherId: string,
    @Body() updateDto: UpdateTeacherProfileDto,
  ) {
    return this.teacherProfileService.updateTeacherProfile(
      req.user.userId,
      teacherId,
      updateDto,
    );
  }

  // Get teacher profile
  @Get('teachers/:teacherId')
  @ApiOperation({ summary: 'Get teacher profile' })
  async getTeacherProfile(@Param('teacherId') teacherId: string) {
    return this.teacherProfileService.getTeacherProfile(teacherId);
  }

  // Get teacher profile by user ID
  @Get('teachers/by-user/:userId')
  @ApiOperation({ summary: 'Get teacher profile by user ID' })
  async getTeacherProfileByUserId(@Param('userId') userId: string) {
    return this.teacherProfileService.getTeacherProfileByUserId(userId);
  }

  // ========== Parent Profile Endpoints ==========

  // FR-USER-027: Create Parent Profile
  @Post('admin/parents')
  @ApiOperation({ summary: 'Create parent profile (Admin)' })
  async createParentProfile(
    @Request() req,
    @Body() createDto: CreateParentProfileDto,
  ) {
    return this.parentProfileService.createParentProfile(
      req.user.userId,
      createDto,
    );
  }

  // FR-USER-028: Link Parent to Student
  @Post('admin/parents/link-student')
  @ApiOperation({ summary: 'Link parent to student (Admin)' })
  async linkParentToStudent(
    @Request() req,
    @Body() linkDto: LinkParentStudentDto,
  ) {
    return this.parentProfileService.linkParentToStudent(
      req.user.userId,
      linkDto,
    );
  }

  // FR-USER-029: Parent Dashboard
  @Get('parents/:parentId/dashboard')
  @ApiOperation({ summary: 'Get parent dashboard' })
  async getParentDashboard(@Param('parentId') parentId: string) {
    return this.parentProfileService.getParentDashboard(parentId);
  }

  // Update parent profile
  @Put('admin/parents/:parentId')
  @ApiOperation({ summary: 'Update parent profile (Admin)' })
  async updateParentProfile(
    @Request() req,
    @Param('parentId') parentId: string,
    @Body() updateDto: UpdateParentProfileDto,
  ) {
    return this.parentProfileService.updateParentProfile(
      req.user.userId,
      parentId,
      updateDto,
    );
  }

  // Get parent profile
  @Get('parents/:parentId')
  @ApiOperation({ summary: 'Get parent profile' })
  async getParentProfile(@Param('parentId') parentId: string) {
    return this.parentProfileService.getParentProfile(parentId);
  }
}
