# Complete Backend Implementation Guide
**Tekurious ERP - Production-Ready Backend APIs**

---

## 🎯 GOAL
Connect frontend to backend with complete, working CRUD operations for all modules, eliminating mock data and creating a fully functional ERP system.

---

## 📊 CURRENT STATE ANALYSIS

### ✅ What We Have:
1. **Database Schema**: Complete Prisma schema with 100+ models
2. **Frontend**: 84 pages, 40+ feature modules, comprehensive React Query hooks
3. **Frontend Services**: All API service files defined with expected endpoints
4. **Auth System**: Working JWT authentication
5. **Docker**: PostgreSQL and Redis running
6. **Seed Data**: 4 test users with different roles

### ❌ What's Missing:
1. **Backend Controllers**: Empty or non-existent
2. **Backend Services**: Missing business logic
3. **DTOs**: Missing validation classes
4. **API Routes**: Not registered in app.module
5. **Integration**: Frontend → Backend → Database chain broken

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 14 + React Query + Zod + TypeScript               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │   Features   │  │   Services   │     │
│  │   (84)       │→ │   (40+)      │→ │   (25)       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │ (axios with JWT)
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  NestJS + Prisma + PostgreSQL + TypeScript                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │→ │   Services   │→ │   Prisma     │     │
│  │  (REST API)  │  │   (Logic)    │  │   (ORM)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   (Database)     │
                    └──────────────────┘
```

---

## 📋 MODULE-BY-MODULE IMPLEMENTATION

### **PHASE 1: CRITICAL MODULES (Week 1)**

---

## 🎓 MODULE 1: STUDENTS (Priority: CRITICAL)

### Database Model:
```prisma
model StudentProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  schoolId        String?
  rollNumber      String?
  admissionNumber String?  @unique
  admissionDate   DateTime?
  bloodGroup      String?
  emergencyContact Json?
  previousSchool  String?
  transportOpted  Boolean  @default(false)
  hostelOpted     Boolean  @default(false)
  
  user            User     @relation(...)
  school          School?  @relation(...)
  enrollments     StudentEnrollment[]
  parents         ParentStudent[]
  attendance      Attendance[]
  feeRecords      FeeRecord[]
  // ... more relations
}
```

### Files to Create:

#### 1. DTOs (`apps/tekurious_erp/src/modules/students/dto/`)
```typescript
// create-student.dto.ts
export class CreateStudentDto {
  @IsString() @IsNotEmpty()
  firstName: string;
  
  @IsString() @IsNotEmpty()
  lastName: string;
  
  @IsString() @IsOptional()
  middleName?: string;
  
  @IsString() @IsNotEmpty() @IsUnique()
  admissionNumber: string;
  
  @IsString() @IsOptional()
  rollNumber?: string;
  
  @IsDateString() @IsNotEmpty()
  dateOfBirth: string;
  
  @IsEnum(Gender) @IsNotEmpty()
  gender: Gender;
  
  @IsEmail() @IsOptional()
  email?: string;
  
  @IsString() @IsOptional()
  phone?: string;
  
  @IsEnum(BloodGroup) @IsOptional()
  bloodGroup?: BloodGroup;
  
  @IsString() @IsNotEmpty()
  address: string;
  
  @IsString() @IsNotEmpty()
  city: string;
  
  @IsString() @IsNotEmpty()
  state: string;
  
  @IsString() @IsNotEmpty()
  pincode: string;
  
  @IsString() @IsOptional()
  nationality?: string;
  
  @IsString() @IsOptional()
  religion?: string;
  
  @IsString() @IsOptional()
  caste?: string;
  
  @IsString() @IsOptional()
  category?: string; // GEN, OBC, SC, ST
  
  @IsString() @IsNotEmpty()
  schoolId: string;
  
  @IsString() @IsNotEmpty()
  classId: string;
  
  @IsString() @IsOptional()
  sectionId?: string;
  
  @IsString() @IsOptional()
  academicYearId?: string;
  
  @IsString() @IsOptional()
  previousSchool?: string;
  
  @IsString() @IsOptional()
  previousClass?: string;
  
  @IsString() @IsOptional()
  tcNumber?: string;
  
  @IsString() @IsOptional()
  aadhaarNumber?: string;
  
  @IsString() @IsOptional()
  birthCertificateNumber?: string;
  
  // Emergency Contact
  @IsString() @IsOptional()
  emergencyContactName?: string;
  
  @IsString() @IsOptional()
  emergencyContactPhone?: string;
  
  @IsString() @IsOptional()
  emergencyContactRelation?: string;
  
  // Transport & Hostel
  @IsBoolean() @IsOptional()
  transportOpted?: boolean;
  
  @IsBoolean() @IsOptional()
  hostelOpted?: boolean;
}

// update-student.dto.ts
export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @IsEnum(StudentStatus) @IsOptional()
  status?: StudentStatus;
}

// student-filters.dto.ts
export class StudentFiltersDto {
  @IsOptional() @IsString()
  search?: string;
  
  @IsOptional() @IsString()
  classId?: string;
  
  @IsOptional() @IsString()
  sectionId?: string;
  
  @IsOptional() @IsEnum(Gender)
  gender?: Gender;
  
  @IsOptional() @IsString()
  bloodGroup?: string;
  
  @IsOptional() @IsEnum(StudentStatus)
  status?: StudentStatus;
  
  @IsOptional() @IsString()
  academicYearId?: string;
  
  @IsOptional() @IsInt() @Min(1)
  page?: number = 1;
  
  @IsOptional() @IsInt() @Min(1) @Max(100)
  limit?: number = 20;
  
  @IsOptional() @IsString()
  sortBy?: string = 'createdAt';
  
  @IsOptional() @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

#### 2. Service (`apps/tekurious_erp/src/modules/students/students.service.ts`)
```typescript
@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // ==================== BASIC CRUD ====================
  
  async findAll(filters: StudentFiltersDto) {
    const { page, limit, sortBy, sortOrder, search, classId, sectionId, gender, bloodGroup, status, academicYearId } = filters;
    
    const skip = (page - 1) * limit;
    
    const where: Prisma.StudentProfileWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { admissionNumber: { contains: search, mode: 'insensitive' } },
          { rollNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(classId && {
        enrollments: {
          some: {
            classId,
            academicYearId: academicYearId || undefined,
            isActive: true,
          },
        },
      }),
      ...(sectionId && {
        enrollments: {
          some: {
            sectionId,
            academicYearId: academicYearId || undefined,
            isActive: true,
          },
        },
      }),
      ...(gender && { user: { gender } }),
      ...(bloodGroup && { bloodGroup }),
      ...(status && { user: { status } }),
    };
    
    const [students, total] = await Promise.all([
      this.prisma.studentProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              email: true,
              phone: true,
              gender: true,
              dateOfBirth: true,
              profileImage: true,
              status: true,
            },
          },
          school: {
            select: {
              id: true,
              name: true,
            },
          },
          enrollments: {
            where: {
              isActive: true,
            },
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  grade: true,
                },
              },
              section: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.studentProfile.count({ where }),
    ]);
    
    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  async findOne(id: string, include?: string[]) {
    const includeOptions: any = {
      user: true,
      school: true,
      enrollments: {
        where: { isActive: true },
        include: {
          class: true,
          section: true,
          academicYear: true,
        },
      },
    };
    
    if (include) {
      if (include.includes('parents')) {
        includeOptions.parents = {
          include: {
            parent: {
              include: { user: true },
            },
          },
        };
      }
      if (include.includes('attendance')) {
        includeOptions.attendance = {
          take: 30,
          orderBy: { date: 'desc' },
        };
      }
      if (include.includes('fees')) {
        includeOptions.feeRecords = {
          include: {
            feeStructure: true,
            payments: true,
          },
        };
      }
    }
    
    const student = await this.prisma.studentProfile.findUnique({
      where: { id },
      include: includeOptions,
    });
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    
    return student;
  }
  
  async create(dto: CreateStudentDto) {
    // 1. Check if admission number already exists
    const existing = await this.prisma.studentProfile.findUnique({
      where: { admissionNumber: dto.admissionNumber },
    });
    
    if (existing) {
      throw new BadRequestException('Admission number already exists');
    }
    
    // 2. Create user first
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        role: SystemRole.STUDENT,
        status: UserStatus.ACTIVE,
      },
    });
    
    // 3. Create student profile
    const studentProfile = await this.prisma.studentProfile.create({
      data: {
        userId: user.id,
        schoolId: dto.schoolId,
        admissionNumber: dto.admissionNumber,
        rollNumber: dto.rollNumber,
        admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : new Date(),
        bloodGroup: dto.bloodGroup,
        emergencyContact: dto.emergencyContactName ? {
          name: dto.emergencyContactName,
          phone: dto.emergencyContactPhone,
          relation: dto.emergencyContactRelation,
        } : undefined,
        previousSchool: dto.previousSchool,
        transportOpted: dto.transportOpted || false,
        hostelOpted: dto.hostelOpted || false,
      },
      include: {
        user: true,
        school: true,
      },
    });
    
    // 4. Create enrollment if classId provided
    if (dto.classId) {
      await this.prisma.studentEnrollment.create({
        data: {
          studentId: studentProfile.id,
          classId: dto.classId,
          sectionId: dto.sectionId,
          academicYearId: dto.academicYearId,
          enrollmentDate: new Date(),
          isActive: true,
        },
      });
    }
    
    // 5. Emit event
    await this.eventBus.publish('student.created', {
      studentId: studentProfile.id,
      userId: user.id,
      schoolId: dto.schoolId,
      timestamp: new Date(),
    });
    
    return studentProfile;
  }
  
  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.findOne(id);
    
    // Update user
    if (dto.firstName || dto.lastName || dto.middleName || dto.email || dto.phone || dto.dateOfBirth || dto.gender) {
      await this.prisma.user.update({
        where: { id: student.userId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          middleName: dto.middleName,
          email: dto.email,
          phone: dto.phone,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender,
          status: dto.status as any,
        },
      });
    }
    
    // Update student profile
    const updatedStudent = await this.prisma.studentProfile.update({
      where: { id },
      data: {
        rollNumber: dto.rollNumber,
        bloodGroup: dto.bloodGroup,
        emergencyContact: dto.emergencyContactName ? {
          name: dto.emergencyContactName,
          phone: dto.emergencyContactPhone,
          relation: dto.emergencyContactRelation,
        } : undefined,
        previousSchool: dto.previousSchool,
        transportOpted: dto.transportOpted,
        hostelOpted: dto.hostelOpted,
      },
      include: {
        user: true,
        school: true,
        enrollments: {
          where: { isActive: true },
          include: {
            class: true,
            section: true,
          },
        },
      },
    });
    
    await this.eventBus.publish('student.updated', {
      studentId: id,
      timestamp: new Date(),
    });
    
    return updatedStudent;
  }
  
  async remove(id: string) {
    const student = await this.findOne(id);
    
    // Soft delete
    await this.prisma.user.update({
      where: { id: student.userId },
      data: {
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      },
    });
    
    await this.eventBus.publish('student.deleted', {
      studentId: id,
      timestamp: new Date(),
    });
  }
  
  // ==================== ADDITIONAL METHODS ====================
  
  async findByAdmissionNumber(admissionNumber: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { admissionNumber },
      include: {
        user: true,
        school: true,
        enrollments: {
          where: { isActive: true },
          include: {
            class: true,
            section: true,
          },
        },
      },
    });
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    
    return student;
  }
  
  async getAttendanceSummary(id: string, filters?: any) {
    const student = await this.findOne(id);
    
    const where: any = {
      studentId: id,
    };
    
    if (filters?.startDate) {
      where.date = { ...where.date, gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      where.date = { ...where.date, lte: new Date(filters.endDate) };
    }
    
    const [total, present, absent, late, excused] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'LATE' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'EXCUSED' } }),
    ]);
    
    return {
      total,
      present,
      absent,
      late,
      excused,
      percentage: total > 0 ? (present / total) * 100 : 0,
    };
  }
  
  async getPerformanceSummary(id: string) {
    const student = await this.findOne(id);
    
    const examAttempts = await this.prisma.examAttempt.findMany({
      where: { studentId: id },
      include: {
        exam: true,
      },
    });
    
    const totalMarks = examAttempts.reduce((sum, attempt) => sum + (attempt.marksObtained || 0), 0);
    const totalPossible = examAttempts.reduce((sum, attempt) => sum + (attempt.exam.totalMarks || 0), 0);
    
    return {
      totalExams: examAttempts.length,
      averagePercentage: totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0,
      totalMarks,
      totalPossible,
    };
  }
  
  async bulkImport(file: Express.Multer.File) {
    // TODO: Implement CSV/Excel import
    throw new NotImplementedException('Bulk import not yet implemented');
  }
  
  async bulkExport(filters: StudentFiltersDto) {
    // TODO: Implement CSV export
    throw new NotImplementedException('Bulk export not yet implemented');
  }
}
```

#### 3. Controller (`apps/tekurious_erp/src/modules/students/students.controller.ts`)
```typescript
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
  async bulkImport(@UploadedFile() file: Express.Multer.File) {
    return this.studentsService.bulkImport(file);
  }

  @Get('export')
  @RequirePermissions('students:view')
  async bulkExport(@Query() filters: StudentFiltersDto) {
    return this.studentsService.bulkExport(filters);
  }
}
```

#### 4. Module (`apps/tekurious_erp/src/modules/students/students.module.ts`)
```typescript
@Module({
  imports: [
    DatabaseModule, // Provides PrismaService
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
```

#### 5. Register in App Module
```typescript
// apps/tekurious_erp/src/app.module.ts
@Module({
  imports: [
    // ... existing imports
    StudentsModule,
  ],
})
export class AppModule {}
```

---

## ✅ TESTING CHECKLIST FOR STUDENTS MODULE

### 1. Manual API Testing (Postman/Thunder Client)
```bash
# 1. Get all students (paginated)
GET http://localhost:3000/api/students
Headers: Authorization: Bearer {token}
Query: page=1&limit=20&classId=xxx

# 2. Get single student
GET http://localhost:3000/api/students/{id}
Headers: Authorization: Bearer {token}
Query: include=parents,attendance,fees

# 3. Create student
POST http://localhost:3000/api/students
Headers: Authorization: Bearer {token}
Body: {CreateStudentDto}

# 4. Update student
PATCH http://localhost:3000/api/students/{id}
Headers: Authorization: Bearer {token}
Body: {UpdateStudentDto}

# 5. Delete student
DELETE http://localhost:3000/api/students/{id}
Headers: Authorization: Bearer {token}

# 6. Search by admission number
GET http://localhost:3000/api/students/admission/ADM001
Headers: Authorization: Bearer {token}

# 7. Get attendance summary
GET http://localhost:3000/api/students/{id}/attendance-summary
Headers: Authorization: Bearer {token}
Query: startDate=2024-01-01&endDate=2024-12-31

# 8. Get performance summary
GET http://localhost:3000/api/students/{id}/performance-summary
Headers: Authorization: Bearer {token}
```

### 2. Frontend Integration Testing
```typescript
// Test in browser console or React component
import { studentService } from '@/services';

// Test getAll
const students = await studentService.getAll({ page: 1, limit: 20 });
console.log('Students:', students);

// Test create
const newStudent = await studentService.create({
  firstName: 'John',
  lastName: 'Doe',
  // ... rest of fields
});
console.log('Created:', newStudent);
```

### 3. Database Verification
```sql
-- Check if student was created
SELECT * FROM student_profiles WHERE admission_number = 'ADM001';

-- Check user was created
SELECT * FROM users WHERE id = '{userId}';

-- Check enrollment was created
SELECT * FROM student_enrollments WHERE student_id = '{studentId}';
```

---

## 🔄 IMPLEMENTATION WORKFLOW

### Day 1-2: Students Module
1. ✅ Create DTOs
2. ✅ Create Service with basic CRUD
3. ✅ Create Controller
4. ✅ Create Module
5. ✅ Register in App Module
6. ✅ Test with Postman
7. ✅ Test with Frontend
8. ✅ Fix bugs
9. ✅ Add advanced features (bulk import, etc.)

### Day 3: Attendance Module
- Follow same pattern as Students

### Day 4: Classes Module
- Follow same pattern

### Day 5-7: Continue with remaining modules

---

## 📝 NEXT STEPS

1. **Review this complete plan**
2. **Confirm approach**
3. **Start implementing Students module**
4. **Test thoroughly**
5. **Move to next module**

---

**Status**: ✅ Complete plan ready for implementation
**Next Action**: Create Students backend module files and test
