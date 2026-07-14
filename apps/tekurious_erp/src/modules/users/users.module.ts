import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StudentProfileService } from './services/student-profile.service';
import { TeacherProfileService } from './services/teacher-profile.service';
import { ParentProfileService } from './services/parent-profile.service';
import { UserStatusService } from './services/user-status.service';
import { BulkOperationsService } from './services/bulk-operations.service';
import { UserSearchService } from './services/user-search.service';
import { UserPermissionsService } from './services/user-permissions.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    StudentProfileService,
    TeacherProfileService,
    ParentProfileService,
    UserStatusService,
    BulkOperationsService,
    UserSearchService,
    UserPermissionsService,
  ],
  exports: [
    UsersService,
    StudentProfileService,
    TeacherProfileService,
    ParentProfileService,
    UserStatusService,
    BulkOperationsService,
    UserSearchService,
    UserPermissionsService,
  ],
})
export class UsersModule {}
