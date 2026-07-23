import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddUserToOrgDto,
  FeatureToggleDto,
  CreateBranchDto,
  CreateDepartmentDto,
  VerifyOrganizationDto,
  ChangeUserRoleDto,
  InviteUserDto,
} from './dto/organization.dto';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  // FR-ORG-001: Create Organization
  @Post()
  @ApiOperation({ summary: 'Create new organization (Admin)' })
  async createOrganization(
    @Request() req,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.orgsService.createOrganization(req.user.userId, dto);
  }

  // List all organizations
  @Get()
  @ApiOperation({ summary: 'List organizations' })
  async listOrganizations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.orgsService.listOrganizations(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      type,
      parentId,
    );
  }

  // Get organization details
  @Get(':id')
  @ApiOperation({ summary: 'Get organization details' })
  async getOrganization(@Param('id') id: string) {
    return this.orgsService.getOrganization(id);
  }

  // FR-ORG-020: Configure Organization Details
  @Put(':id')
  @ApiOperation({ summary: 'Update organization details' })
  async updateOrganization(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.orgsService.updateOrganization(req.user.userId, id, dto);
  }

  // FR-ORG-004: Deactivate Organization
  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate organization (Admin)' })
  async deactivateOrganization(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.orgsService.deactivateOrganization(req.user.userId, id, reason);
  }

  // FR-ORG-004: Reactivate Organization
  @Post(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate organization (Admin)' })
  async reactivateOrganization(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.orgsService.reactivateOrganization(req.user.userId, id, reason);
  }

  // FR-ORG-002: Organization Hierarchy
  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get organization hierarchy tree' })
  async getHierarchy(@Param('id') id: string) {
    return this.orgsService.getHierarchy(id);
  }

  // Organization stats
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  async getStats(@Param('id') id: string) {
    return this.orgsService.getOrganizationStats(id);
  }

  // FR-ORG-021: Feature Toggle
  @Post(':id/features/toggle')
  @ApiOperation({ summary: 'Toggle organization feature/module' })
  async toggleFeature(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: FeatureToggleDto,
  ) {
    return this.orgsService.toggleFeature(req.user.userId, id, dto);
  }

  // FR-ORG-033: View Organization Users
  @Get(':id/users')
  @ApiOperation({ summary: 'Get organization users list' })
  async getOrganizationUsers(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.orgsService.getOrganizationUsers(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      role,
      search,
    );
  }

  // FR-ORG-030: Add User to Organization
  @Post(':id/users')
  @ApiOperation({ summary: 'Add user to organization (Admin)' })
  async addUser(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddUserToOrgDto,
  ) {
    return this.orgsService.addUserToOrganization(
      req.user.userId,
      id,
      dto.userId,
      dto.designation,
      dto.department,
    );
  }

  // FR-ORG-031: Remove User from Organization
  @Delete(':id/users/:userId')
  @ApiOperation({ summary: 'Remove user from organization (Admin)' })
  async removeUser(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.orgsService.removeUserFromOrganization(
      req.user.userId,
      id,
      userId,
      reason,
    );
  }

  // FR-ORG-022: User limit status
  @Get(':id/user-limit')
  @ApiOperation({ summary: 'Get user limit status for organization' })
  async getUserLimitStatus(@Param('id') id: string) {
    return this.orgsService.getUserLimitStatus(id);
  }

  // Branches
  @Post(':id/branches')
  @ApiOperation({ summary: 'Create branch in organization' })
  async createBranch(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.orgsService.createBranch(req.user.userId, id, dto);
  }

  @Get(':id/branches')
  @ApiOperation({ summary: 'Get branches of organization' })
  async getBranches(@Param('id') id: string) {
    return this.orgsService.getBranches(id);
  }

  // Departments
  @Post(':id/departments')
  @ApiOperation({ summary: 'Create department in organization' })
  async createDepartment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.orgsService.createDepartment(req.user.userId, id, dto);
  }

  @Get(':id/departments')
  @ApiOperation({ summary: 'Get departments of organization' })
  async getDepartments(
    @Param('id') id: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.orgsService.getDepartments(id, branchId);
  }

  // FR-ORG-003: Organization Verification
  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify organization (Admin)' })
  async verifyOrganization(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: VerifyOrganizationDto,
  ) {
    return this.orgsService.verifyOrganization(req.user.userId, id, dto);
  }

  @Get(':id/verification-status')
  @ApiOperation({ summary: 'Get organization verification status' })
  async getVerificationStatus(@Param('id') id: string) {
    return this.orgsService.getVerificationStatus(id);
  }

  // FR-ORG-032: Manage User Roles in Organization
  @Put(':id/users/:userId/role')
  @ApiOperation({ summary: 'Change user role in organization (Admin)' })
  async changeUserRole(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: ChangeUserRoleDto,
  ) {
    return this.orgsService.changeUserRole(
      req.user.userId,
      id,
      userId,
      dto.roleId,
      dto.reason,
      dto.additionalRoles,
    );
  }

  @Get(':id/users/:userId/roles')
  @ApiOperation({ summary: 'Get user roles in organization' })
  async getUserRoles(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.orgsService.getUserRoles(id, userId);
  }

  // FR-ORG-005: Organization Deletion
  @Post(':id/delete')
  @ApiOperation({ summary: 'Soft-delete an organization (Super Admin)' })
  async deleteOrganization(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { reason: string; confirmName: string },
  ) {
    return this.orgsService.deleteOrganization(req.user.userId, id, body.reason, body.confirmName);
  }

  // FR-ORG-034: Invite External Users
  @Post(':id/invitations')
  @ApiOperation({ summary: 'Invite external user to organization' })
  async inviteUser(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.orgsService.inviteUser(req.user.userId, id, dto);
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'List pending invitations for organization' })
  async listInvitations(@Param('id') id: string) {
    return this.orgsService.listInvitations(id);
  }

  @Post(':id/invitations/:invitationId/cancel')
  @ApiOperation({ summary: 'Cancel a pending invitation' })
  async cancelInvitation(
    @Request() req,
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.orgsService.cancelInvitation(req.user.userId, id, invitationId);
  }

  // ── White-Label Configuration (FR-ORG-010–013) ───────────────────────────

  @Get(':id/white-label')
  @ApiOperation({ summary: 'Get all white-label config (FR-ORG-010–013)' })
  async getWhiteLabel(@Param('id') id: string) {
    return this.orgsService.getWhiteLabelConfig(id);
  }

  @Put(':id/white-label/logo')
  @ApiOperation({ summary: 'Set organization logo URL (FR-ORG-010)' })
  async setLogo(
    @Request() req,
    @Param('id') id: string,
    @Body('logoUrl') logoUrl: string,
  ) {
    return this.orgsService.setOrganizationLogo(req.user.userId, id, logoUrl);
  }

  @Put(':id/white-label/colors')
  @ApiOperation({ summary: 'Customize color scheme (FR-ORG-011)' })
  async setColors(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: {
      primaryColor?: string; secondaryColor?: string; accentColor?: string;
      backgroundColor?: string; textColor?: string;
    },
  ) {
    return this.orgsService.setColorScheme(req.user.userId, id, dto);
  }

  @Put(':id/white-label/domain')
  @ApiOperation({ summary: 'Configure custom domain (FR-ORG-012)' })
  async setDomain(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: { domain: string; subdomain?: string; sslEnabled?: boolean },
  ) {
    return this.orgsService.setCustomDomain(req.user.userId, id, dto);
  }

  @Put(':id/white-label/email-templates')
  @ApiOperation({ summary: 'Customize email templates (FR-ORG-013)' })
  async setEmailTemplates(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.orgsService.setEmailTemplates(req.user.userId, id, dto);
  }

  // ── Data Retention Policy (FR-ORG-023) ──────────────────────────────────

  @Get(':id/retention-policy')
  @ApiOperation({ summary: 'Get data retention policy (FR-ORG-023)' })
  async getRetentionPolicy(@Param('id') id: string) {
    return this.orgsService.getDataRetentionPolicy(id);
  }

  @Put(':id/retention-policy')
  @ApiOperation({ summary: 'Set data retention policy (FR-ORG-023)' })
  async setRetentionPolicy(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: {
      auditLogRetentionDays: number; userDataRetentionDays: number;
      mediaRetentionDays: number; reportRetentionDays: number;
    },
  ) {
    return this.orgsService.setDataRetentionPolicy(req.user.userId, id, dto);
  }

  // ── Organization Analytics & Reporting (FR-ORG-051 to FR-ORG-053) ─────

  @Get(':id/usage-report')
  @ApiOperation({ summary: 'Get organization usage report (FR-ORG-051)' })
  async getUsageReport(
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.orgsService.getOrganizationUsageReport(
      id,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }

  @Get(':id/monitoring')
  @ApiOperation({ summary: 'Real-time organization monitoring (FR-ORG-052)' })
  async getMonitoring(@Param('id') id: string) {
    return this.orgsService.getOrganizationMonitoring(id);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare multiple organizations (FR-ORG-053)' })
  async compareOrganizations(@Body() dto: { organizationIds: string[] }) {
    return this.orgsService.getOrganizationComparison(dto.organizationIds);
  }

  @Post(':id/export')
  @ApiOperation({ summary: 'Export organization data (FR-ORG-067)' })
  async exportData(
    @Param('id') id: string,
    @Body() dto: { format?: 'JSON' | 'CSV' },
  ) {
    return this.orgsService.exportOrganizationData(id, dto.format);
  }
}
