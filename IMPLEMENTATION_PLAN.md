# Backend API Implementation Plan

## Priority: Start with Students Module (Most Critical)

### Current Status:
- ✅ Frontend: Complete with 40+ React Query hooks
- ✅ Frontend Service: student.service.ts with all API calls defined
- ❌ Backend: Empty module (no controller, service, DTOs)
- ❌ Integration: No working data flow

---

## Module 1: STUDENTS (Priority 1)

### Backend Files to Create:
1. `apps/tekurious_erp/src/modules/students/students.module.ts`
2. `apps/tekurious_erp/src/modules/students/students.controller.ts`
3. `apps/tekurious_erp/src/modules/students/students.service.ts`
4. `apps/tekurious_erp/src/modules/students/dto/create-student.dto.ts`
5. `apps/tekurious_erp/src/modules/students/dto/update-student.dto.ts`
6. `apps/tekurious_erp/src/modules/students/dto/student-filters.dto.ts`

### API Endpoints to Implement:
```
GET    /students                    # List with pagination & filters
GET    /students/:id                # Get by ID with includes
POST   /students                    # Create student
PATCH  /students/:id                # Update student
DELETE /students/:id                # Delete student
PATCH  /students/:id/status         # Update status

# Bulk Operations
POST   /students/bulk-import        # Import from CSV/Excel
GET    /students/export             # Export to CSV
POST   /students/bulk-update-class  # Move students to different class
POST   /students/bulk-delete        # Delete multiple
POST   /students/bulk-promote       # Promote to next class

# Enrollment
GET    /students/:id/enrollments    # Get enrollment history
POST   /students/:id/enroll         # Enroll in class
GET    /students/admission/:number  # Find by admission number

# Documents
GET    /students/:id/documents      # Get documents
POST   /students/:id/documents      # Upload document
DELETE /students/:id/documents/:docId # Delete document

# Health
GET    /students/:id/health         # Get health records
PATCH  /students/:id/health         # Update health record
POST   /students/:id/health/medical # Add medical record

# Parents
GET    /students/:id/parents        # Get parents
POST   /students/:id/parents        # Link parent
DELETE /students/:id/parents/:parentId # Unlink parent

# Analytics
GET    /students/:id/attendance-summary  # Attendance stats
GET    /students/:id/performance-summary # Performance stats
GET    /students/:id/grades             # Grades
GET    /students/:id/academic-history   # Academic history

# Actions
POST   /students/:id/transfer       # Transfer to another school
POST   /students/:id/graduate       # Mark as graduated

# Search
GET    /students/search             # Search students
```

### Total Endpoints: 29

---

## Module 2: ATTENDANCE (Priority 2)

### Endpoints:
```
GET    /attendance                  # List attendance
POST   /attendance/mark             # Mark attendance (single/bulk)
GET    /attendance/class/:classId   # Class attendance
GET    /attendance/student/:id      # Student attendance
GET    /attendance/reports          # Generate reports
PATCH  /attendance/:id              # Update attendance
```

---

## Module 3: CLASSES (Priority 3)

### Endpoints:
```
GET    /classes                     # List classes
POST   /classes                     # Create class
GET    /classes/:id                 # Get class
PATCH  /classes/:id                 # Update class
DELETE /classes/:id                 # Delete class
GET    /classes/:id/students        # Get students
POST   /classes/:id/students        # Enroll student
```

---

## Module 4: TEACHERS (Priority 4)

### Endpoints:
```
GET    /teachers                    # List teachers
POST   /teachers                    # Create teacher
GET    /teachers/:id                # Get teacher
PATCH  /teachers/:id                # Update teacher
DELETE /teachers/:id                # Delete teacher
GET    /teachers/:id/classes        # Get assigned classes
POST   /teachers/:id/assign-class   # Assign to class
```

---

## Module 5: EXAMS (Priority 5)

### Endpoints:
```
GET    /exams                       # List exams
POST   /exams                       # Create exam
GET    /exams/:id                   # Get exam
PATCH  /exams/:id                   # Update exam
DELETE /exams/:id                   # Delete exam
POST   /exams/:id/grades            # Submit grades
GET    /exams/:id/results           # Get results
```

---

## Module 6: ASSIGNMENTS (Priority 6)

### Endpoints:
```
GET    /assignments                 # List assignments
POST   /assignments                 # Create assignment
GET    /assignments/:id             # Get assignment
PATCH  /assignments/:id             # Update assignment
DELETE /assignments/:id             # Delete assignment
POST   /assignments/:id/submit      # Submit assignment
POST   /assignments/:id/grade       # Grade assignment
```

---

## Module 7: FEES (Priority 7)

### Endpoints:
```
GET    /fees/structures             # List fee structures
POST   /fees/structures             # Create structure
GET    /fees/records                # Fee records
POST   /fees/records                # Create fee record
POST   /fees/payments               # Record payment
GET    /fees/history/:studentId     # Payment history
```

---

## Module 8: CONTENT (Priority 8)

### Endpoints:
```
GET    /content                     # List content
POST   /content                     # Create content
POST   /content/upload              # Upload file
GET    /content/:id                 # Get content
PATCH  /content/:id                 # Update content
DELETE /content/:id                 # Delete content
```

---

## Module 9: LIVE CLASSES (Priority 9)

### Endpoints:
```
GET    /live-classes                # List classes
POST   /live-classes                # Create class
GET    /live-classes/:id            # Get class
PATCH  /live-classes/:id            # Update class
DELETE /live-classes/:id            # Delete class
POST   /live-classes/:id/join       # Join class
POST   /live-classes/:id/end        # End class
```

---

## Module 10: TIMETABLE (Priority 10)

### Endpoints:
```
GET    /timetable                   # Get timetable
POST   /timetable                   # Create timetable
GET    /timetable/class/:classId    # Class timetable
GET    /timetable/teacher/:teacherId # Teacher timetable
PATCH  /timetable/:id               # Update timetable
```

---

## Implementation Strategy:

### Phase 1: Students Module (Week 1)
1. Create backend module structure
2. Implement basic CRUD (GET, POST, PATCH, DELETE)
3. Add pagination & filtering
4. Test with frontend
5. Implement bulk operations
6. Add document management
7. Add parent linking
8. Add analytics endpoints

### Phase 2: Core Academic Modules (Week 2)
1. Attendance
2. Classes  
3. Exams

### Phase 3: Teaching Modules (Week 3)
1. Teachers
2. Assignments
3. Content

### Phase 4: Operations Modules (Week 4)
1. Fees
2. Live Classes
3. Timetable

---

## Technical Stack:

### Backend:
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL
- Class Validator for DTOs
- JWT Authentication

### Frontend:
- Next.js 14
- TanStack Query (React Query)
- Axios
- Zod for validation

---

## Next Steps:

1. ✅ Start with Students module
2. Create backend structure
3. Implement controllers
4. Implement services
5. Create DTOs
6. Test endpoints with Postman
7. Connect frontend
8. Test end-to-end
9. Move to next module

**Status**: Ready to start implementation
**Current Focus**: Students Module - Backend Implementation
