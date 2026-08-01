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

  @Post('curriculum')
  @ApiOperation({ summary: 'Create curriculum (FR-CONTENT-021)' })
  createCurriculum(@Request() req, @Body() dto: any) {
    return this.contentService.createCurriculum(req.user.userId, dto);
  }

  @Get('curriculum')
  @ApiOperation({ summary: 'List curricula (FR-CONTENT-022)' })
  listCurricula(@Query('boardId') boardId?: string, @Query('isActive') isActive?: string) {
    return this.contentService.listCurricula(
      boardId,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
  }

  @Get('curriculum/:curriculumId')
  @ApiOperation({ summary: 'Get curriculum details (FR-CONTENT-023)' })
  getCurriculum(@Param('curriculumId') curriculumId: string) {
    return this.contentService.getCurriculum(curriculumId);
  }

  @Put('curriculum/:curriculumId')
  @ApiOperation({ summary: 'Update curriculum (FR-CONTENT-024)' })
  updateCurriculum(@Request() req, @Param('curriculumId') curriculumId: string, @Body() dto: any) {
    return this.contentService.updateCurriculum(req.user.userId, curriculumId, dto);
  }

  @Delete('curriculum/:curriculumId')
  @ApiOperation({ summary: 'Delete curriculum (FR-CONTENT-025)' })
  deleteCurriculum(@Request() req, @Param('curriculumId') curriculumId: string) {
    return this.contentService.deleteCurriculum(req.user.userId, curriculumId);
  }

  @Post('curriculum/:curriculumId/subjects')
  @ApiOperation({ summary: 'Add subject to curriculum (FR-CONTENT-026)' })
  addSubjectToCurriculum(@Request() req, @Param('curriculumId') curriculumId: string, @Body() dto: any) {
    return this.contentService.addSubjectToCurriculum(req.user.userId, curriculumId, dto);
  }

  @Delete('curriculum/:curriculumId/subjects/:curriculumSubjectId')
  @ApiOperation({ summary: 'Remove subject from curriculum (FR-CONTENT-027)' })
  removeSubjectFromCurriculum(@Request() req, @Param('curriculumId') cId: string, @Param('curriculumSubjectId') csId: string) {
    return this.contentService.removeSubjectFromCurriculum(req.user.userId, cId, csId);
  }

  @Get('curriculum/board/:boardId/grade/:grade')
  @ApiOperation({ summary: 'Get curriculum by grade (FR-CONTENT-028)' })
  getCurriculumByGrade(@Param('boardId') boardId: string, @Param('grade') grade: string) {
    return this.contentService.getCurriculumByGrade(boardId, parseInt(grade));
  }

  @Post('bulk-upload')
  @ApiOperation({ summary: 'Bulk upload content (FR-CONTENT-066)' })
  bulkUploadContent(@Request() req, @Body() body: { contents: any[] }) {
    return this.contentService.bulkUploadContent(req.user.userId, body.contents);
  }

  @Post('tags/popular')
  @ApiOperation({ summary: 'Get popular tags (FR-CONTENT-067)' })
  getPopularTags(@Body() body: { limit?: number }) {
    return this.contentService.getPopularTags(body.limit);
  }

  @Post('recommendations')
  @ApiOperation({ summary: 'Get content recommendations (FR-CONTENT-068)' })
  getContentRecommendations(@Request() req, @Body() body: { contentId?: string; limit?: number }) {
    return this.contentService.getContentRecommendations(req.user.userId, body.contentId, body.limit);
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

  @Post(':id/tag')
  @ApiOperation({ summary: 'Tag content (FR-CONTENT-069)' })
  tagContent(@Request() req, @Param('id') id: string, @Body() body: { tags: string[] }) {
    return this.contentService.tagContent(req.user.userId, id, body.tags);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate content (FR-CONTENT-070)' })
  duplicateContent(@Request() req, @Param('id') id: string) {
    return this.contentService.duplicateContent(req.user.userId, id);
  }

  // ==================== CURRICULUM EXPANSION (FR-CONTENT-021-030) ====================

  @Post('curriculum/:curriculumSubjectId/units')
  @ApiOperation({ summary: 'Create curriculum unit' })
  createCurriculumUnit(
    @Param('curriculumSubjectId') curriculumSubjectId: string,
    @Body() dto: { name: string; description?: string },
  ) {
    return this.contentService.createCurriculumUnit(curriculumSubjectId, dto.name, dto.description);
  }

  @Post('curriculum/:curriculumSubjectId/units/reorder')
  @ApiOperation({ summary: 'Reorder curriculum units' })
  reorderUnits(
    @Param('curriculumSubjectId') curriculumSubjectId: string,
    @Body('unitIds') unitIds: string[],
  ) {
    return this.contentService.reorderUnits(curriculumSubjectId, unitIds);
  }

  @Post('curriculum/units/:unitId/map/:contentId')
  @ApiOperation({ summary: 'Map content to curriculum unit' })
  mapContentToUnit(
    @Param('unitId') unitId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.contentService.mapContentToUnit(unitId, contentId);
  }

  @Get('curriculum/:curriculumId/progress')
  @ApiOperation({ summary: 'Get student curriculum progress' })
  getCurriculumProgress(
    @Request() req,
    @Param('curriculumId') curriculumId: string,
  ) {
    return this.contentService.getCurriculumProgress(req.user.userId, curriculumId);
  }

  @Post('curriculum/:curriculumId/clone')
  @ApiOperation({ summary: 'Clone curriculum' })
  cloneCurriculum(
    @Param('curriculumId') curriculumId: string,
    @Body('targetName') targetName: string,
  ) {
    return this.contentService.cloneCurriculum(curriculumId, targetName);
  }

  // ==================== ADVANCED CONTENT MANAGEMENT (FR-CONTENT-066-080) ====================

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive content' })
  archiveContent(@Request() req, @Param('id') id: string) {
    return this.contentService.archiveContent(req.user.userId, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore content' })
  restoreContent(@Request() req, @Param('id') id: string) {
    return this.contentService.restoreContent(req.user.userId, id);
  }

  @Post(':id/transfer-ownership')
  @ApiOperation({ summary: 'Transfer content ownership' })
  transferContentOwnership(
    @Request() req,
    @Param('id') id: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    return this.contentService.transferContentOwnership(req.user.userId, id, targetUserId);
  }

  @Get(':id/access-log')
  @ApiOperation({ summary: 'Get content access log' })
  getContentAccessLog(@Param('id') id: string) {
    return this.contentService.getContentAccessLog(id);
  }

  @Post(':id/access-rules')
  @ApiOperation({ summary: 'Set content access rules' })
  setContentAccessRules(@Param('id') id: string, @Body() rules: any) {
    return this.contentService.setContentAccessRules(id, rules);
  }

  @Post(':id/schedule-publish')
  @ApiOperation({ summary: 'Schedule content publishing' })
  scheduleContentPublish(
    @Request() req,
    @Param('id') id: string,
    @Body('publishAt') publishAt: string,
  ) {
    return this.contentService.scheduleContentPublish(req.user.userId, id, publishAt);
  }

  @Get(':id/dependencies')
  @ApiOperation({ summary: 'Get content dependencies' })
  getContentDependencies(@Param('id') id: string) {
    return this.contentService.getContentDependencies(id);
  }

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate content structure' })
  validateContentStructure(@Param('id') id: string) {
    return this.contentService.validateContentStructure(id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export content metadata' })
  getContentExport(@Param('id') id: string) {
    return this.contentService.getContentImportExport(id);
  }

  // ==================== EXTENDED CONTENT FEATURES (FR-CONTENT-029–035) ====================

  @Post(':id/outcomes')
  @ApiOperation({ summary: 'Track learning outcomes (FR-CONTENT-029)' })
  trackLearningOutcomes(@Param('id') id: string, @Body('outcomes') outcomes: string[]) {
    return this.contentService.trackLearningOutcomes(id, outcomes);
  }

  @Get(':id/effectiveness')
  @ApiOperation({ summary: 'Get content effectiveness report (FR-CONTENT-030)' })
  getContentEffectiveness(@Param('id') id: string) {
    return this.contentService.getContentEffectiveness(id);
  }

  @Post('subject-libraries')
  @ApiOperation({ summary: 'Create subject-wise content library (FR-CONTENT-032)' })
  createSubjectLibrary(@Body() dto: { schoolId: string; subjectId: string; contentIds: string[] }) {
    return this.contentService.createSubjectLibrary(dto.schoolId, dto.subjectId, dto.contentIds);
  }

  @Post('featured-collections')
  @ApiOperation({ summary: 'Create featured collection (FR-CONTENT-033)' })
  createFeaturedCollection(@Body() dto: { schoolId: string; title: string; contentIds: string[] }) {
    return this.contentService.createFeaturedCollection(dto.schoolId, dto);
  }

  @Post('bundles')
  @ApiOperation({ summary: 'Create content bundle (FR-CONTENT-034)' })
  bundleContent(@Body() dto: { title: string; contentIds: string[]; price?: number }) {
    return this.contentService.bundleContent(dto.title, dto.contentIds, dto.price);
  }

  @Get('recommendations/personalized')
  @ApiOperation({ summary: 'Get personalized content recommendations (FR-CONTENT-035)' })
  getPersonalizedRecommendations(@Request() req) {
    return this.contentService.getContentRecommendations(req.user.userId);
  }
}
