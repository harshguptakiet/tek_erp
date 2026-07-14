import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentService } from './content.service';
import {
  CreateContentDto, UpdateContentDto, ReviewContentDto,
  ContentWorkflowActionDto, CreateCollectionDto, SaveDraftDto,
  ModerateContentDto, CreateLearningPathDto, ContentSearchDto,
} from './dto/content.dto';

@ApiTags('Content')
@Controller('content')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ── Static routes FIRST (must come before /:id wildcard) ─────────────────

  @Post()
  @ApiOperation({ summary: 'Create new content (FR-CONTENT-001)' })
  createContent(@Request() req, @Body() dto: CreateContentDto) {
    return this.contentService.createContent(req.user.userId, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search & filter content (FR-CONTENT-004)' })
  searchContent(@Query() dto: ContentSearchDto) {
    return this.contentService.searchContent(dto);
  }

  @Post('drafts')
  @ApiOperation({ summary: 'Save content draft (FR-CONTENT-008)' })
  saveDraft(@Request() req, @Body() dto: SaveDraftDto) {
    return this.contentService.saveDraft(req.user.userId, dto);
  }

  @Get('drafts/my')
  @ApiOperation({ summary: 'List my drafts' })
  listDrafts(@Request() req) {
    return this.contentService.listDrafts(req.user.userId);
  }

  @Post('collections')
  @ApiOperation({ summary: 'Create content collection (FR-CONTENT-009)' })
  createCollection(@Request() req, @Body() dto: CreateCollectionDto) {
    return this.contentService.createCollection(req.user.userId, dto);
  }

  @Get('collections')
  @ApiOperation({ summary: 'List content collections' })
  listCollections(@Request() req, @Query('isPublic') isPublic?: string) {
    return this.contentService.listCollections(
      req.user.userId,
      isPublic !== undefined ? isPublic === 'true' : undefined,
    );
  }

  @Get('collections/:collectionId')
  @ApiOperation({ summary: 'Get collection with items' })
  getCollection(@Param('collectionId') collectionId: string) {
    return this.contentService.getCollection(collectionId);
  }

  @Post('collections/:collectionId/items/:contentId')
  @ApiOperation({ summary: 'Add content to collection' })
  addToCollection(@Request() req, @Param('collectionId') cId: string, @Param('contentId') ctId: string) {
    return this.contentService.addToCollection(req.user.userId, cId, ctId);
  }

  @Delete('collections/:collectionId/items/:contentId')
  @ApiOperation({ summary: 'Remove content from collection' })
  removeFromCollection(@Request() req, @Param('collectionId') cId: string, @Param('contentId') ctId: string) {
    return this.contentService.removeFromCollection(req.user.userId, cId, ctId);
  }

  @Get('moderation/queue')
  @ApiOperation({ summary: 'Get moderation queue' })
  getModerationQueue(@Query('status') status?: string) {
    return this.contentService.getModerationQueue(status);
  }

  @Post('learning-paths')
  @ApiOperation({ summary: 'Create learning path (FR-CONTENT-011)' })
  createLearningPath(@Request() req, @Body() dto: CreateLearningPathDto) {
    return this.contentService.createLearningPath(req.user.userId, dto);
  }

  @Get('learning-paths')
  @ApiOperation({ summary: 'List learning paths' })
  listLearningPaths(@Request() req, @Query('grade') grade?: string, @Query('subjectId') subjectId?: string) {
    return this.contentService.listLearningPaths(
      grade ? parseInt(grade) : undefined, subjectId, req.user.userId,
    );
  }

  @Get('learning-paths/:pathId')
  @ApiOperation({ summary: 'Get learning path details' })
  getLearningPath(@Param('pathId') pathId: string) {
    return this.contentService.getLearningPath(pathId);
  }

  @Post('learning-paths/:pathId/enroll')
  @ApiOperation({ summary: 'Enroll in a learning path' })
  enrollInLearningPath(@Request() req, @Param('pathId') pathId: string) {
    return this.contentService.enrollInLearningPath(req.user.userId, pathId);
  }

  @Put('learning-paths/:pathId/progress')
  @ApiOperation({ summary: 'Update learning path progress' })
  updateLearningProgress(@Request() req, @Param('pathId') pathId: string, @Body() body: { progress: number }) {
    return this.contentService.updateLearningProgress(req.user.userId, pathId, body.progress);
  }

  @Get('analytics/creator/:creatorId')
  @ApiOperation({ summary: 'Get creator analytics dashboard' })
  getCreatorAnalytics(@Param('creatorId') creatorId: string) {
    return this.contentService.getCreatorAnalytics(creatorId);
  }

  // ── Dynamic /:id routes LAST ───────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get content details (FR-CONTENT-002)' })
  getContent(@Param('id') id: string) {
    return this.contentService.getContent(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content (FR-CONTENT-002)' })
  updateContent(@Request() req, @Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.contentService.updateContent(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content (FR-CONTENT-003)' })
  deleteContent(@Request() req, @Param('id') id: string) {
    return this.contentService.deleteContent(req.user.userId, id);
  }

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Rate and review content (FR-CONTENT-005)' })
  reviewContent(@Request() req, @Param('id') id: string, @Body() dto: ReviewContentDto) {
    return this.contentService.reviewContent(req.user.userId, id, dto);
  }

  @Post(':id/workflow')
  @ApiOperation({ summary: 'Perform content workflow action (FR-CONTENT-006)' })
  workflowAction(@Request() req, @Param('id') id: string, @Body() dto: ContentWorkflowActionDto) {
    return this.contentService.workflowAction(req.user.userId, id, dto);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get content version history (FR-CONTENT-007)' })
  getVersionHistory(@Param('id') id: string) {
    return this.contentService.getVersionHistory(id);
  }

  @Post(':id/moderate')
  @ApiOperation({ summary: 'Moderate content (FR-CONTENT-010)' })
  moderateContent(@Request() req, @Param('id') id: string, @Body() dto: ModerateContentDto) {
    return this.contentService.moderateContent(req.user.userId, id, dto);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get content analytics (FR-CONTENT-012)' })
  getContentAnalytics(@Param('id') id: string) {
    return this.contentService.getContentAnalytics(id);
  }
}
