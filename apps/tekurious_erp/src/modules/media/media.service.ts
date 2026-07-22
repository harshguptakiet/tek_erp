import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // FR-CONTENT-013: Upload File
  async uploadMedia(uploadedBy: string, dto: {
    fileName: string; originalName: string; fileUrl: string;
    mediaType: string; category: string; mimeType: string;
    fileSize: number; folderId?: string; thumbnailUrl?: string;
    width?: number; height?: number; duration?: number;
    tags?: string[]; isPublic?: boolean;
  }) {
    const media = await this.prisma.media.create({
      data: {
        fileName: dto.fileName,
        originalName: dto.originalName,
        fileUrl: dto.fileUrl,
        thumbnailUrl: dto.thumbnailUrl,
        mediaType: dto.mediaType as any,
        category: dto.category as any,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        folderId: dto.folderId,
        uploadedBy,
        isPublic: dto.isPublic ?? false,
        width: dto.width,
        height: dto.height,
        duration: dto.duration,
        tags: dto.tags || [],
        version: 1,
      },
    });

    await this.eventBus.publish('media.uploaded', {
      mediaId: media.id,
      uploadedBy,
      mediaType: media.mediaType,
      category: media.category,
    });

    return media;
  }

  // FR-CONTENT-014: List Files
  async listMedia(filters: {
    uploadedBy?: string; mediaType?: string; category?: string;
    folderId?: string; search?: string; isPublic?: boolean;
    page?: number; limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const where: any = {
      deletedAt: null,
      ...(filters.uploadedBy ? { uploadedBy: filters.uploadedBy } : {}),
      ...(filters.mediaType ? { mediaType: filters.mediaType } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.folderId ? { folderId: filters.folderId } : {}),
      ...(filters.isPublic !== undefined ? { isPublic: filters.isPublic } : {}),
      ...(filters.search ? {
        OR: [
          { fileName: { contains: filters.search, mode: 'insensitive' } },
          { originalName: { contains: filters.search, mode: 'insensitive' } },
          { tags: { hasSome: [filters.search] } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { folder: { select: { name: true } } },
      }),
      this.prisma.media.count({ where }),
    ]);

    return { data: items, meta: { total, page, limit } };
  }

  // FR-CONTENT-015: Get File Details
  async getMedia(mediaId: string, userId?: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        folder: { select: { name: true } },
        permissions: true,
      },
    });

    if (!media || media.deletedAt) {
      throw new NotFoundException('Media not found');
    }

    // Check permissions
    if (!media.isPublic && userId) {
      const hasPermission = await this.checkMediaPermission(mediaId, userId, 'canView');
      if (!hasPermission && media.uploadedBy !== userId) {
        throw new ForbiddenException('You do not have permission to view this media');
      }
    }

    // Increment view count
    await this.prisma.media.update({
      where: { id: mediaId },
      data: { viewCount: { increment: 1 } },
    });

    return media;
  }

  // FR-CONTENT-016: Update File Metadata
  async updateMedia(mediaId: string, userId: string, dto: {
    fileName?: string; tags?: string[]; isPublic?: boolean;
    category?: string; folderId?: string;
  }) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.deletedAt) {
      throw new NotFoundException('Media not found');
    }

    const hasPermission = await this.checkMediaPermission(mediaId, userId, 'canEdit');
    if (!hasPermission && media.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have permission to edit this media');
    }

    const updated = await this.prisma.media.update({
      where: { id: mediaId },
      data: {
        ...(dto.fileName ? { fileName: dto.fileName } : {}),
        ...(dto.tags ? { tags: dto.tags } : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
        ...(dto.category ? { category: dto.category as any } : {}),
        ...(dto.folderId !== undefined ? { folderId: dto.folderId } : {}),
      },
    });

    await this.eventBus.publish('media.updated', { mediaId, updatedBy: userId });
    return updated;
  }

  // FR-CONTENT-017: Delete File
  async deleteMedia(mediaId: string, userId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.deletedAt) {
      throw new NotFoundException('Media not found');
    }

    const hasPermission = await this.checkMediaPermission(mediaId, userId, 'canDelete');
    if (!hasPermission && media.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have permission to delete this media');
    }

    // Soft delete
    await this.prisma.media.update({
      where: { id: mediaId },
      data: { deletedAt: new Date() },
    });

    await this.eventBus.publish('media.deleted', { mediaId, deletedBy: userId });
    return { message: 'Media deleted successfully' };
  }

  // FR-CONTENT-018: Download File (track downloads)
  async downloadMedia(mediaId: string, userId?: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.deletedAt) {
      throw new NotFoundException('Media not found');
    }

    if (!media.isPublic && userId) {
      const hasPermission = await this.checkMediaPermission(mediaId, userId, 'canDownload');
      if (!hasPermission && media.uploadedBy !== userId) {
        throw new ForbiddenException('You do not have permission to download this media');
      }
    }

    // Increment download count
    await this.prisma.media.update({
      where: { id: mediaId },
      data: { downloadCount: { increment: 1 } },
    });

    await this.eventBus.publish('media.downloaded', { mediaId, downloadedBy: userId });

    return {
      fileUrl: media.fileUrl,
      fileName: media.originalName,
      mimeType: media.mimeType,
      fileSize: media.fileSize,
    };
  }

  // FR-CONTENT-019: Manage File Permissions
  async setMediaPermission(mediaId: string, ownerId: string, dto: {
    userId?: string; roleId?: string; organizationId?: string;
    canView?: boolean; canDownload?: boolean; canEdit?: boolean;
    canDelete?: boolean; canShare?: boolean;
  }) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');
    if (media.uploadedBy !== ownerId) {
      throw new ForbiddenException('Only the owner can set permissions');
    }

    const permission = await this.prisma.mediaPermission.create({
      data: {
        media: { connect: { id: mediaId } },
        userId: dto.userId,
        roleId: dto.roleId,
        organizationId: dto.organizationId,
        canView: dto.canView ?? true,
        canDownload: dto.canDownload ?? false,
        canEdit: dto.canEdit ?? false,
        canDelete: dto.canDelete ?? false,
        canShare: dto.canShare ?? false,
        grantedBy: ownerId,
      },
    });

    return permission;
  }

  async getMediaPermissions(mediaId: string) {
    return this.prisma.mediaPermission.findMany({
      where: { mediaId },
    });
  }

  async revokeMediaPermission(permissionId: string, ownerId: string) {
    const permission = await this.prisma.mediaPermission.findUnique({
      where: { id: permissionId },
      include: { media: true },
    });

    if (!permission) throw new NotFoundException('Permission not found');
    if (permission.media.uploadedBy !== ownerId) {
      throw new ForbiddenException('Only the owner can revoke permissions');
    }

    await this.prisma.mediaPermission.delete({ where: { id: permissionId } });
    return { message: 'Permission revoked successfully' };
  }

  // FR-CONTENT-020: Folder Management
  async createFolder(createdBy: string, dto: { name: string; parentId?: string; ownerType?: string }) {
    const folder = await this.prisma.mediaFolder.create({
      data: {
        name: dto.name,
        parentId: dto.parentId,
        ownerId: createdBy,
        ownerType: dto.ownerType || 'USER',
        isPublic: false,
      },
    });

    return folder;
  }

  async listFolders(parentId?: string) {
    return this.prisma.mediaFolder.findMany({
      where: { parentId: parentId || null },
      include: {
        _count: { select: { media: true, children: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateFolder(folderId: string, userId: string, dto: { name?: string }) {
    const folder = await this.prisma.mediaFolder.findUnique({ where: { id: folderId } });
    if (!folder) throw new NotFoundException('Folder not found');
    if (folder.ownerId !== userId) {
      throw new ForbiddenException('Only the creator can update this folder');
    }

    return this.prisma.mediaFolder.update({
      where: { id: folderId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
      },
    });
  }

  async deleteFolder(folderId: string, userId: string) {
    const folder = await this.prisma.mediaFolder.findUnique({
      where: { id: folderId },
      include: { _count: { select: { media: true } } },
    });

    if (!folder) throw new NotFoundException('Folder not found');
    if (folder.ownerId !== userId) {
      throw new ForbiddenException('Only the creator can delete this folder');
    }

    if (folder._count.media > 0) {
      throw new BadRequestException('Cannot delete folder with media files. Move or delete files first.');
    }

    await this.prisma.mediaFolder.delete({ where: { id: folderId } });
    return { message: 'Folder deleted successfully' };
  }

  // Helper method to check permissions
  private async checkMediaPermission(mediaId: string, userId: string, permission: string): Promise<boolean> {
    const perm = await this.prisma.mediaPermission.findFirst({
      where: {
        mediaId,
        userId,
        [permission]: true,
      },
    });

    return !!perm;
  }

  // FR-USER-003: Upload Profile Picture
  async uploadProfilePicture(userId: string, dto: {
    fileName: string; originalName: string; fileUrl: string;
    mimeType: string; fileSize: number; thumbnailUrl?: string;
    width?: number; height?: number;
  }) {
    // Upload as media
    const media = await this.uploadMedia(userId, {
      ...dto,
      mediaType: 'IMAGE',
      category: 'PROFILE_PHOTO',
      isPublic: true,
      tags: ['profile', 'avatar'],
    });

    // Update user's profileImage
    await this.prisma.user.update({
      where: { id: userId },
      data: { profileImage: media.fileUrl },
    });

    return {
      mediaId: media.id,
      profileImageUrl: media.fileUrl,
      thumbnailUrl: media.thumbnailUrl,
    };
  }
}
