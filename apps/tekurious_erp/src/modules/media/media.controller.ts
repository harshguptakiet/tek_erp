import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly service: MediaService) {}

  // ══════════════════════════════════════════════════════════════════════════
  // FR-CONTENT-013–020: FILE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('upload')
  @ApiOperation({ summary: 'Upload media file (FR-CONTENT-013)' })
  uploadMedia(@Request() req, @Body() dto: any) {
    return this.service.uploadMedia(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List media files (FR-CONTENT-014)' })
  listMedia(@Query() filters: any) {
    return this.service.listMedia({
      uploadedBy: filters.uploadedBy,
      mediaType: filters.mediaType,
      category: filters.category,
      folderId: filters.folderId,
      search: filters.search,
      isPublic: filters.isPublic !== undefined ? filters.isPublic === 'true' : undefined,
      page: filters.page ? parseInt(filters.page) : 1,
      limit: filters.limit ? parseInt(filters.limit) : 20,
    });
  }

  @Get(':mediaId')
  @ApiOperation({ summary: 'Get media file details (FR-CONTENT-015)' })
  getMedia(@Param('mediaId') mediaId: string, @Request() req) {
    return this.service.getMedia(mediaId, req.user.userId);
  }

  @Put(':mediaId')
  @ApiOperation({ summary: 'Update media metadata (FR-CONTENT-016)' })
  updateMedia(@Param('mediaId') mediaId: string, @Request() req, @Body() dto: any) {
    return this.service.updateMedia(mediaId, req.user.userId, dto);
  }

  @Delete(':mediaId')
  @ApiOperation({ summary: 'Delete media file (FR-CONTENT-017)' })
  deleteMedia(@Param('mediaId') mediaId: string, @Request() req) {
    return this.service.deleteMedia(mediaId, req.user.userId);
  }

  @Get(':mediaId/download')
  @ApiOperation({ summary: 'Download media file (FR-CONTENT-018)' })
  downloadMedia(@Param('mediaId') mediaId: string, @Request() req) {
    return this.service.downloadMedia(mediaId, req.user.userId);
  }

  @Post(':mediaId/permissions')
  @ApiOperation({ summary: 'Set media permissions (FR-CONTENT-019)' })
  setMediaPermission(@Param('mediaId') mediaId: string, @Request() req, @Body() dto: any) {
    return this.service.setMediaPermission(mediaId, req.user.userId, dto);
  }

  @Get(':mediaId/permissions')
  @ApiOperation({ summary: 'Get media permissions (FR-CONTENT-019)' })
  getMediaPermissions(@Param('mediaId') mediaId: string) {
    return this.service.getMediaPermissions(mediaId);
  }

  @Delete('permissions/:permissionId')
  @ApiOperation({ summary: 'Revoke media permission (FR-CONTENT-019)' })
  revokeMediaPermission(@Param('permissionId') permissionId: string, @Request() req) {
    return this.service.revokeMediaPermission(permissionId, req.user.userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-CONTENT-020: FOLDER MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  @Post('folders')
  @ApiOperation({ summary: 'Create folder (FR-CONTENT-020)' })
  createFolder(@Request() req, @Body() dto: any) {
    return this.service.createFolder(req.user.userId, dto);
  }

  @Get('folders/list')
  @ApiOperation({ summary: 'List folders (FR-CONTENT-020)' })
  listFolders(@Query('parentId') parentId?: string) {
    return this.service.listFolders(parentId);
  }

  @Put('folders/:folderId')
  @ApiOperation({ summary: 'Update folder (FR-CONTENT-020)' })
  updateFolder(@Param('folderId') folderId: string, @Request() req, @Body() dto: any) {
    return this.service.updateFolder(folderId, req.user.userId, dto);
  }

  @Delete('folders/:folderId')
  @ApiOperation({ summary: 'Delete folder (FR-CONTENT-020)' })
  deleteFolder(@Param('folderId') folderId: string, @Request() req) {
    return this.service.deleteFolder(folderId, req.user.userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FR-USER-003: UPLOAD PROFILE PICTURE
  // ══════════════════════════════════════════════════════════════════════════

  @Post('profile-picture')
  @ApiOperation({ summary: 'Upload profile picture (FR-USER-003)' })
  uploadProfilePicture(@Request() req, @Body() dto: any) {
    return this.service.uploadProfilePicture(req.user.userId, dto);
  }
}
