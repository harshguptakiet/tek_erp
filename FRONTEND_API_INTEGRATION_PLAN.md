# Frontend API Integration Plan

## Current Status
- **Total Pages**: 97 ✅
- **Backend APIs**: 758 endpoints (92.9% complete) ✅
- **Service Files Created**: 4/17 (24%)
- **Pages Using Real APIs**: ~25 pages (26%)
- **Pages Using Mock Data**: ~72 pages (74%) ⚠️

## Existing Services (Connected to Real APIs)
1. ✅ `auth.service.ts` - Authentication & authorization
2. ✅ `auth-complete.service.ts` - Complete auth features (2FA, sessions, etc.)
3. ✅ `user.service.ts` - User management (CRUD operations)
4. ✅ `student.service.ts` - Student-specific operations

## Services to Create (Priority Order)

### 🔴 CRITICAL PRIORITY (Core Functionality)

#### 1. academic.service.ts
**Backend Controller**: `apps/tekurious_erp/src/modules/academic/`
**Endpoints Needed**:
- GET /academic/classes - List all classes
- POST /academic/classes - Create class
- GET /academic/classes/:id - Get class details
- PUT /academic/classes/:id - Update class
- GET /academic/subjects - List subjects
- POST /academic/subjects - Create subject
- GET /academic/timetable - Get timetable
- POST /academic/timetable - Create timetable slots

**Pages Using This**:
- `/classes/page.tsx`
- `/classes/[id]/page.tsx`
- `/classes/create/page.tsx`
- `/subjects/page.tsx`
- `/timetable/page.tsx`
- `/timetable/create/page.tsx`

---

#### 2. attendance.service.ts
**Backend Controller**: `apps/tekurious_erp/src/modules/attendance/`
**Endpoints Needed**:
- POST /attendance/mark - Mark attendance
- GET /attendance/reports - Get attendance reports
- GET /attendance/student/:id - Student attendance history
- GET /attendance/class/:id - Class attendance summary

**Pages Using This**:
- `/attendance/page.tsx`
- `/attendance/mark/page.tsx`
- `/attendance/reports/page.tsx`

---

#### 3. exam.service.ts
**Backend**: Likely in `academic` or separate `exam` module
**Endpoints Needed**:
- GET /exams - List exams
- POST /exams - Create exam
- GET /exams/:id - Get exam details
- POST /exams/:id/grades - Submit grades
- GET /exams/:id/results - Get results
- POST /exams/:id/publish - Publish results

**Pages Using This**:
- `/exams/page.tsx`
- `/exams/create/page.tsx`
- `/exams/[id]/page.tsx`
- `/exams/[id]/grade/page.tsx`
- `/report-cards/page.tsx`

---

### 🟡 HIGH PRIORITY (Student/Parent Engagement)

#### 4. assignment.service.ts
**Backend**: Check `academic` or `content` modules
**Endpoints Needed**:
- GET /assignments - List assignments
- POST /assignments - Create assignment
- POST /assignments/:id/submit - Submit assignment
- POST /assignments/:id/grade - Grade assignment
- GET /homework - Get homework list

**Pages Using This**:
- `/assignments/page.tsx`
- `/assignments/create/page.tsx`
- `/assignments/[id]/page.tsx`
- `/assignments/[id]/grade/page.tsx`
- `/homework/page.tsx`

---

#### 5. fee.service.ts
**Backend**: Likely in `finance` or `fees` module
**Endpoints Needed**:
- GET /fees/structures - Get fee structures
- POST /fees/structures - Create fee structure
- GET /fees/payments - Payment history
- POST /fees/pay - Process payment
- GET /fees/student/:id - Student fee details

**Pages Using This**:
- `/fees/page.tsx`
- `/fees/structure/create/page.tsx`
- `/fees/payment/page.tsx`
- `/fees/history/page.tsx`

---

#### 6. live-class.service.ts
**Backend Controller**: `apps/tekurious_erp/src/modules/live-classes/`
**Endpoints Needed**:
- GET /live-classes - List live classes
- POST /live-classes - Schedule class
- GET /live-classes/:id - Get class details
- POST /live-classes/:id/join - Join class
- POST /live-classes/:id/end - End class

**Pages Using This**:
- `/live-classes/page.tsx`
- `/live-classes/create/page.tsx`
- `/live-classes/[id]/page.tsx`

---

### 🟢 MEDIUM PRIORITY (Communication & Management)

#### 7. notification.service.ts
**Backend**: Check `notifications` module
**Endpoints Needed**:
- GET /notifications - Get user notifications
- POST /notifications/mark-read/:id - Mark as read
- GET /notifications/preferences - Get preferences
- PUT /notifications/preferences - Update preferences

**Pages Using This**:
- `/notifications/page.tsx`
- `/notifications/preferences/page.tsx`

---

#### 8. message.service.ts
**Backend**: Check `messaging` or `communication` module
**Endpoints Needed**:
- GET /messages - Get message threads
- POST /messages - Send message
- GET /messages/:id - Get conversation
- POST /parent-teacher/messages - Parent-teacher messaging
- GET /parent-teacher/meetings - Get meetings
- POST /parent-teacher/meetings - Schedule meeting

**Pages Using This**:
- `/messages/page.tsx`
- `/parent-teacher/page.tsx`

---

#### 9. content.service.ts
**Backend Controller**: `apps/tekurious_erp/src/modules/content/`
**Endpoints Needed**:
- GET /content - List content
- POST /content - Upload content
- GET /content/:id - Get content details
- PUT /content/:id - Update content
- DELETE /content/:id - Delete content

**Pages Using This**:
- `/content/page.tsx`
- `/content/create/page.tsx`
- `/content/[id]/page.tsx`

---

### 🔵 LOWER PRIORITY (ERP & Advanced Features)

#### 10. library.service.ts
**Backend**: Check `erp` module
**Endpoints Needed**:
- GET /library/books - List books
- POST /library/issue - Issue book
- POST /library/return - Return book
- GET /library/borrowed/:userId - User's borrowed books

**Pages Using This**:
- `/library/page.tsx`

---

#### 11. transport.service.ts
**Backend Controller**: `apps/tekurious_erp/src/modules/erp/` (transport section)
**Endpoints Needed**:
- GET /transport/buses - List buses
- GET /transport/routes - List routes
- POST /transport/assign - Assign student to bus

**Pages Using This**:
- `/transport/page.tsx`

---

#### 12. hostel.service.ts
**Backend Controller**: `apps/tekurious_erp/src/modules/erp/` (hostel section)
**Endpoints Needed**:
- GET /hostel/rooms - List rooms
- POST /hostel/allocate - Allocate room
- GET /hostel/residents - Get residents

**Pages Using This**:
- `/hostel/page.tsx`

---

#### 13. event.service.ts
**Backend**: Check `events` or `calendar` module
**Endpoints Needed**:
- GET /events - List events
- POST /events - Create event
- GET /events/:id - Get event details

**Pages Using This**:
- `/events/page.tsx`

---

#### 14. certificate.service.ts
**Backend**: Check `certificates` or `documents` module
**Endpoints Needed**:
- GET /certificates - List certificates
- POST /certificates/generate - Generate certificate
- GET /id-cards - List ID cards
- POST /id-cards/generate - Generate ID card

**Pages Using This**:
- `/certificates/page.tsx`
- `/id-cards/page.tsx`

---

#### 15. analytics.service.ts
**Backend**: Check `analytics` or `reports` module
**Endpoints Needed**:
- GET /analytics/student-performance - Performance data
- GET /analytics/attendance - Attendance analytics
- GET /reports - List available reports
- POST /reports/generate - Generate report

**Pages Using This**:
- `/analytics/page.tsx`
- `/analytics/student-performance/page.tsx`
- `/reports/page.tsx`

---

#### 16. resource.service.ts
**Backend**: Check `resources` or `facilities` module
**Endpoints Needed**:
- GET /resources - List resources/rooms
- POST /resources/book - Book resource
- GET /resources/availability - Check availability

**Pages Using This**:
- `/resources/page.tsx`

---

#### 17. marketplace.service.ts
**Backend**: Check `marketplace` module
**Endpoints Needed**:
- GET /marketplace/items - Browse content
- POST /marketplace/purchase - Purchase item
- GET /marketplace/my-purchases - User's purchases

**Pages Using This**:
- `/marketplace/page.tsx`

---

## Implementation Pattern

### Example Service File Structure:
```typescript
// academic.service.ts
import { api } from '@/lib/axios';

export const academicService = {
  // Classes
  getClasses: async (params) => {
    const { data } = await api.get('/academic/classes', { params });
    return data;
  },
  
  createClass: async (classData) => {
    const { data } = await api.post('/academic/classes', classData);
    return data;
  },
  
  // Subjects
  getSubjects: async (params) => {
    const { data } = await api.get('/academic/subjects', { params });
    return data;
  },
  
  // Timetable
  getTimetable: async (classId) => {
    const { data } = await api.get(`/academic/timetable/${classId}`);
    return data;
  },
};
```

### Update Page to Use Service:
```typescript
// Before (Mock Data):
const { data } = useQuery({
  queryKey: ['classes'],
  queryFn: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [/* mock data */];
  },
});

// After (Real API):
const { data } = useQuery({
  queryKey: ['classes'],
  queryFn: () => academicService.getClasses(),
});
```

## Next Steps

1. **Start with Critical Services** (academic, attendance, exam)
2. **Create each service file** following the pattern from auth.service.ts
3. **Update pages** to import and use the new services
4. **Test with real backend** running on localhost:3333
5. **Handle errors properly** with try-catch and error boundaries
6. **Remove all mock data** from pages

## Backend API Base URL
- Development: `http://localhost:3333/api`
- Configured in: `apps/web/src/lib/axios.ts`
