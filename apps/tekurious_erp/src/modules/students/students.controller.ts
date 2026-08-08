import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentFiltersDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../auth/decorators';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @RequirePermissions('students:view')
  async findAll(@Query() filters: StudentFiltersDto) {
    return this.studentsService.findAll(filters);
  }

  @Get(':id')
  @RequirePermissions('students:view')
  async findOne(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.studentsService.findOne(id, includeArray);
  }

  @Post()
  @RequirePermissions('students:create')
  async create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('students:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('students:delete')
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Get('admission/:number')
  @RequirePermissions('students:view')
  async findByAdmissionNumber(@Param('number') number: string) {
    return this.studentsService.findByAdmissionNumber(number);
  }

  @Get(':id/attendance-summary')
  @RequirePermissions('students:view')
  async getAttendanceSummary(
    @Param('id') id: string,
    @Query() filters: any,
  ) {
    return this.studentsService.getAttendanceSummary(id, filters);
  }

  @Get(':id/performance-summary')
  @RequirePermissions('students:view')
  async getPerformanceSummary(@Param('id') id: string) {
    return this.studentsService.getPerformanceSummary(id);
  }

  @Post('bulk-import')
  @RequirePermissions('students:create')
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(@UploadedFile() file: any) {
    return this.studentsService.bulkImport(file);
  }

  @Get('export')
  @RequirePermissions('students:view')
  async bulkExport(@Query() filters: StudentFiltersDto) {
    return this.studentsService.bulkExport(filters);
  }
}
