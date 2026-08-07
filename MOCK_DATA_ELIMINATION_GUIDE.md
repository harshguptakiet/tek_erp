# Mock Data Elimination Guide

## Current Status
- **Services Created**: 17/17 (100%) ✅
- **Pages Updated**: 5/97 (5%)
- **Remaining Pages**: 92/97 (95%)

## Pages Already Updated ✅

1. ✅ `apps/web/src/app/classes/page.tsx` - Using academicService
2. ✅ `apps/web/src/app/attendance/mark/page.tsx` - Using attendanceService
3. ✅ `apps/web/src/app/exams/create/page.tsx` - Using academicService & examService
4. ✅ `apps/web/src/app/exams/page.tsx` - Using examService
5. ✅ `apps/web/src/app/content/page.tsx` - Using contentService

---

## Update Pattern - COPY THIS!

### Step 1: Add Service Imports
```typescript
// Add at top of file with other imports
import { academicService } from '@/services/academic.service';
import { attendanceService } from '@/services/attendance.service';
import { examService } from '@/services/exam.service';
import { assignmentService } from '@/services/assignment.service';
import { feeService } from '@/services/fee.service';
import { liveClassService } from '@/services/live-class.service';
import { notificationService } from '@/services/notification.service';
import { messageService } from '@/services/message.service';
import { contentService } from '@/services/content.service';
import { libraryService } from '@/services/library.service';
import { transportService } from '@/services/transport.service';
import { hostelService } from '@/services/hostel.service';
import { eventService } from '@/services/event.service';
import { analyticsService } from '@/services/analytics.service';
import { marketplaceService } from '@/services/marketplace.service';
import { certificateService } from '@/services/certificate.service';
import { useAuthStore } from '@/stores/auth.store';
```

### Step 2: Get User Context
```typescript
export default function YourPage() {
  const { user } = useAuthStore();
  // ... rest of component
```

### Step 3: Replace Mock useQuery

#### BEFORE (Mock):
```typescript
const { data: classes, isLoading } = useQuery({
  queryKey: ['classes'],
  queryFn: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [/* hardcoded mock data */];
  },
});
```

#### AFTER (Real API):
```typescript
const { data: classes, isLoading } = useQuery({
  queryKey: ['classes', user?.schoolId],
  queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
  enabled: !!user?.schoolId, // Only run when user exists
});
```

---

## Priority Order for Updates

### 🔴 CRITICAL (Update First - Week 1)

#### Academic Module
- [ ] `apps/web/src/app/classes/[id]/page.tsx` - academicService.getClass()
- [ ] `apps/web/src/app/classes/create/page.tsx` - academicService.createClass()
- [ ] `apps/web/src/app/subjects/page.tsx` - academicService.listSubjects()
- [ ] `apps/web/src/app/subjects/[id]/page.tsx` - academicService.getSubject()
- [ ] `apps/web/src/app/timetable/page.tsx` - academicService.getTimetable()
- [ ] `apps/web/src/app/timetable/create/page.tsx` - academicService.createTimetable()

#### Attendance Module
- [ ] `apps/web/src/app/attendance/page.tsx` - attendanceService.getSchoolAttendanceReport()
- [ ] `apps/web/src/app/attendance/reports/page.tsx` - attendanceService.getAttendanceAnalytics()

#### Exam & Assessment Module
- [ ] `apps/web/src/app/exams/[id]/page.tsx` - examService.getExam()
- [ ] `apps/web/src/app/exams/[id]/grade/page.tsx` - examService.getExamResults(), examService.submitGrades()

---

### 🟡 HIGH (Update Second - Week 2)

#### Assignment Module
- [ ] `apps/web/src/app/assignments/page.tsx` - assignmentService.listAssignments()
- [ ] `apps/web/src/app/assignments/[id]/page.tsx` - assignmentService.getAssignment()
- [ ] `apps/web/src/app/assignments/create/page.tsx` - assignmentService.createAssignment()
- [ ] `apps/web/src/app/assignments/[id]/grade/page.tsx` - assignmentService.gradeSubmission()
- [ ] `apps/web/src/app/homework/page.tsx` - assignmentService.getHomework()

#### Fee Module
- [ ] `apps/web/src/app/fees/page.tsx` - feeService.listFeeStructures()
- [ ] `apps/web/src/app/fees/history/page.tsx` - feeService.getPaymentHistory()
- [ ] `apps/web/src/app/fees/payment/page.tsx` - feeService.processPayment()
- [ ] `apps/web/src/app/fees/structure/create/page.tsx` - feeService.createFeeStructure()

#### Live Classes Module
- [ ] `apps/web/src/app/live-classes/page.tsx` - liveClassService.listLiveClasses()
- [ ] `apps/web/src/app/live-classes/[id]/page.tsx` - liveClassService.getLiveClass()
- [ ] `apps/web/src/app/live-classes/create/page.tsx` - liveClassService.createLiveClass()

---

### 🟢 MEDIUM (Update Third - Week 3)

#### Notification Module
- [ ] `apps/web/src/app/notifications/page.tsx` - notificationService.getNotifications()
- [ ] `apps/web/src/app/notifications/preferences/page.tsx` - notificationService.getPreferences()

#### Messaging Module
- [ ] `apps/web/src/app/messages/page.tsx` - messageService.getConversations()
- [ ] `apps/web/src/app/parent-teacher/page.tsx` - messageService.getParentTeacherMessages()

#### Content Module
- [ ] `apps/web/src/app/content/[id]/page.tsx` - contentService.getContent()
- [ ] `apps/web/src/app/content/create/page.tsx` - contentService.createContent()
- [ ] `apps/web/src/app/marketplace/page.tsx` - marketplaceService.browseItems()

---

### 🔵 LOW (Update Last - Week 4)

#### ERP Modules
- [ ] `apps/web/src/app/library/page.tsx` - libraryService.listBooks()
- [ ] `apps/web/src/app/transport/page.tsx` - transportService.listBuses()
- [ ] `apps/web/src/app/hostel/page.tsx` - hostelService.listRooms()
- [ ] `apps/web/src/app/events/page.tsx` - eventService.listEvents()

#### Analytics & Reports
- [ ] `apps/web/src/app/analytics/page.tsx` - analyticsService.getOverviewDashboard()
- [ ] `apps/web/src/app/analytics/student-performance/page.tsx` - analyticsService.getStudentPerformance()

#### Certificates & ID Cards
- [ ] `apps/web/src/app/id-cards/page.tsx` - certificateService.listIDCards()
- [ ] `apps/web/src/app/certificates/page.tsx` - certificateService.listCertificates()

#### Dashboard & Profile
- [ ] `apps/web/src/app/dashboard/page.tsx` - Multiple services (analytics, attendance, etc.)
- [ ] `apps/web/src/app/organization/profile/page.tsx` - organizationService.getProfile()

---

## Common Service Methods by Module

### Academic Service
```typescript
academicService.listBoards()
academicService.listSubjects(grade?)
academicService.listSchools(organizationId?)
academicService.getSchool(id)
academicService.listAcademicYears(schoolId)
academicService.getClassStructure(schoolId, academicYearId?)
academicService.createClass(data)
academicService.createSection(data)
academicService.listEnrollments(sectionId)
academicService.assignTeacher(sectionId, data)
```

### Attendance Service
```typescript
attendanceService.markAttendance(data)
attendanceService.bulkMarkAttendance(data)
attendanceService.getSectionAttendance(sectionId, date, period?)
attendanceService.getStudentAttendanceSummary(studentId, filters?)
attendanceService.markTeacherAttendance(data)
attendanceService.getSchoolAttendanceReport(schoolId, date)
attendanceService.getAttendanceAnalytics(sectionId, month)
```

### Exam Service
```typescript
examService.listExams(filters?)
examService.getExam(id)
examService.createExam(data)
examService.submitGrades(examId, grades)
examService.getExamResults(examId)
examService.publishResults(examId)
examService.generateReportCard(studentId, academicYearId)
```

### Assignment Service
```typescript
assignmentService.listAssignments(filters?)
assignmentService.getAssignment(id)
assignmentService.createAssignment(data)
assignmentService.submitAssignment(assignmentId, data)
assignmentService.getSubmissions(assignmentId)
assignmentService.gradeSubmission(submissionId, data)
assignmentService.getHomework(studentId?, filters?)
```

### Fee Service
```typescript
feeService.listFeeStructures(filters?)
feeService.getFeeStructure(id)
feeService.createFeeStructure(data)
feeService.processPayment(data)
feeService.getPaymentHistory(filters?)
feeService.getStudentFeeDetails(studentId)
feeService.generateReceipt(paymentId)
```

### Live Class Service
```typescript
liveClassService.listLiveClasses(filters?)
liveClassService.getLiveClass(id)
liveClassService.createLiveClass(data)
liveClassService.joinClass(id)
liveClassService.endClass(id)
liveClassService.getParticipants(id)
liveClassService.getRecordings(id)
```

### Content Service
```typescript
contentService.searchContent(filters)
contentService.getContent(id)
contentService.createContent(data)
contentService.updateContent(id, data)
contentService.deleteContent(id)
contentService.listCollections(isPublic?)
contentService.createCollection(data)
```

### Notification Service
```typescript
notificationService.getNotifications(filters?)
notificationService.markAsRead(id)
notificationService.markAllAsRead()
notificationService.getPreferences()
notificationService.updatePreferences(preferences)
```

### Message Service
```typescript
messageService.getConversations()
messageService.getConversation(id)
messageService.sendMessage(conversationId, data)
messageService.getParentTeacherMessages(studentId?)
messageService.scheduleMeeting(data)
```

---

## Testing Checklist

After updating each page:

1. **Visual Check**
   - [ ] Page loads without errors
   - [ ] Loading states work
   - [ ] Data displays correctly

2. **Functionality Check**
   - [ ] Search/filter works
   - [ ] Pagination works
   - [ ] Actions (create, edit, delete) work
   - [ ] Navigation works

3. **Error Handling**
   - [ ] Network errors show toast
   - [ ] Empty states display
   - [ ] Invalid data handled

4. **Performance**
   - [ ] No unnecessary re-renders
   - [ ] Query keys are correct
   - [ ] Cache invalidation works

---

## Common Patterns

### Pattern 1: List Pages
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['resource-name', filters],
  queryFn: () => service.list(filters),
});
```

### Pattern 2: Detail Pages
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['resource-name', id],
  queryFn: () => service.get(id),
  enabled: !!id,
});
```

### Pattern 3: Create/Update with Mutation
```typescript
const mutation = useMutation({
  mutationFn: (data) => service.create(data),
  onSuccess: () => {
    toast.success('Created successfully');
    router.push('/list-page');
    queryClient.invalidateQueries({ queryKey: ['resource-name'] });
  },
  onError: (error) => {
    toast.error(error.message || 'Failed to create');
  },
});
```

### Pattern 4: Dependent Queries
```typescript
// First query
const { data: classStructure } = useQuery({
  queryKey: ['classes', schoolId],
  queryFn: () => academicService.getClassStructure(schoolId),
  enabled: !!schoolId,
});

// Second query depends on first
const { data: sections } = useQuery({
  queryKey: ['sections', selectedClassId],
  queryFn: () => academicService.getSections(selectedClassId),
  enabled: !!selectedClassId,
});
```

---

## Quick Reference: Service Import Map

```typescript
// Academic, Classes, Subjects, Timetable
import { academicService } from '@/services/academic.service';

// Attendance (Student & Teacher)
import { attendanceService } from '@/services/attendance.service';

// Exams, Grades, Report Cards
import { examService } from '@/services/exam.service';

// Assignments, Homework, Submissions
import { assignmentService } from '@/services/assignment.service';

// Fees, Payments, Receipts
import { feeService } from '@/services/fee.service';

// Live Classes, Recordings
import { liveClassService } from '@/services/live-class.service';

// Notifications, Preferences
import { notificationService } from '@/services/notification.service';

// Messages, Conversations
import { messageService } from '@/services/message.service';

// Content, Collections, Curriculum
import { contentService } from '@/services/content.service';

// Books, Issue, Return
import { libraryService } from '@/services/library.service';

// Buses, Routes
import { transportService } from '@/services/transport.service';

// Rooms, Allocations
import { hostelService } from '@/services/hostel.service';

// Events, Calendar
import { eventService } from '@/services/event.service';

// Analytics, Reports, Dashboards
import { analyticsService } from '@/services/analytics.service';

// Marketplace, Browse, Purchase
import { marketplaceService } from '@/services/marketplace.service';

// Certificates, ID Cards
import { certificateService } from '@/services/certificate.service';
```

---

## Tips & Best Practices

1. **Always use enabled flag** when query depends on user data
   ```typescript
   enabled: !!user?.schoolId
   ```

2. **Include proper query keys** for caching
   ```typescript
   queryKey: ['resource', id, filters]
   ```

3. **Handle loading and error states**
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage />;
   if (!data) return <EmptyState />;
   ```

4. **Transform API data if needed**
   ```typescript
   const transformedData = data?.items?.map(item => ({
     ...item,
     displayName: `${item.firstName} ${item.lastName}`
   }));
   ```

5. **Use React Query DevTools** for debugging
   ```typescript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   ```

---

**Status**: 5/97 pages updated (5%)
**Next Target**: 20/97 pages updated by end of week
**Final Goal**: 97/97 pages with real APIs (0% mock data)
