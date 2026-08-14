# Edubharti Platform - Complete Microservices Architecture

**Version**: 2.0.0  
**Last Updated**: 2026-07-09  
**Status**: COMPREHENSIVE - Covers ALL 880 Requirements  
**Target Scale**: 50M+ Users

---

## Executive Summary

This document provides a **complete microservices architecture** for the Edubharti EdTech platform, covering all **880 functional requirements** across **17 modules**. The architecture is designed for massive scale (50M+ users), event-driven integration, multi-tenancy, and comprehensive government reporting.

**Key Metrics**:
- **Total Requirements Covered**: 880/880 (100%)
- **Total Microservices**: 58
- **Total APIs**: 800+ endpoints
- **Database Models**: 268
- **Event Types**: 50+
- **Integration Points**: 15+

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Service Catalog](#service-catalog)
3. [Domain Services](#domain-services)
4. [Platform Services](#platform-services)
5. [Integration Services](#integration-services)
6. [Data Architecture](#data-architecture)
7. [Event Architecture](#event-architecture)
8. [API Gateway and Routing](#api-gateway-and-routing)
9. [Deployment Architecture](#deployment-architecture)
10. [Service Dependencies](#service-dependencies)

---

## Architecture Overview

### Architecture Style
- **Pattern**: Domain-Driven Microservices
- **Communication**: Synchronous (REST/GraphQL) + Asynchronous (Events)
- **Data**: Database per service with shared read replicas for reporting
- **Event Bus**: Redis Streams / Kafka for event distribution
- **API Gateway**: Kong / AWS API Gateway
- **Service Mesh**: Istio (for production scale)
- **Containerization**: Docker + Kubernetes

### Core Principles
1. **Domain Ownership**: Each service owns its domain data
2. **Event-Driven**: Services communicate via events for loose coupling
3. **API-First**: All services expose RESTful/GraphQL APIs
4. **Multi-Tenancy**: Every service is tenant-aware
5. **Scalability**: Horizontal scaling for all services
6. **Resilience**: Circuit breakers, retries, fallbacks
7. **Observability**: Comprehensive logging, metrics, tracing

---

## Service Catalog

### Complete Service List (58 Services)

#### 1. Core Platform Services (8)
1. **auth-service** - Authentication & Authorization
2. **user-service** - User Management
3. **organization-service** - Multi-tenant Organization Management
4. **tenant-service** - Tenant Hierarchy & Configuration
5. **notification-service** - Multi-channel Notifications
6. **workflow-service** - Generic Workflow Engine
7. **integration-service** - External System Integration
8. **api-gateway** - API Gateway & Routing

#### 2. Academic Domain (10)
9. **academic-service** - Academic Structure (Boards, Curriculum)
10. **school-service** - School Management
11. **student-service** - Student Profiles & Enrollment
12. **teacher-service** - Teacher Profiles & Assignment
13. **class-service** - Class & Section Management
14. **timetable-service** - Timetable & Scheduling
15. **attendance-service** - Attendance Tracking
16. **subject-service** - Subject & Curriculum Management
17. **counseling-service** - Student Welfare & Counseling
18. **scholarship-service** - Financial Aid & Scholarships

#### 3. Learning & Content (12)
19. **content-service** - Content Management
20. **media-service** - Media Storage & Processing
21. **ar-vr-service** - AR/VR Content Management
22. **3d-model-service** - 3D Model Management
23. **live-class-service** - Live Classes & Metaverse
24. **recording-service** - Class Recording Management
25. **assignment-service** - Assignment Management
26. **assessment-service** - Assessment Engine
27. **grading-service** - Grading & Evaluation
28. **question-bank-service** - Question Bank Management
29. **learning-path-service** - Learning Paths & Curriculum
30. **gamification-service** - Gamification & Badges

#### 4. Commerce & Billing (8)
31. **subscription-service** - Subscription Management
32. **license-service** - License Pool Management
33. **payment-service** - Payment Processing
34. **billing-service** - Billing & Invoicing
35. **fee-service** - Fee Management
36. **marketplace-service** - Marketplace Operations
37. **payout-service** - Publisher/Creator Payouts
38. **pricing-service** - Dynamic Pricing Engine

#### 5. Analytics & Intelligence (6)
39. **analytics-service** - Comprehensive Analytics
40. **reporting-service** - Report Generation
41. **dashboard-service** - Dashboard Aggregation
42. **ai-recommendation-service** - AI-Powered Recommendations
43. **chatbot-service** - AI Chatbot
44. **search-service** - Search & Discovery

#### 6. ERP & Operations (8)
45. **library-service** - Library Management
46. **transport-service** - Transport Management
47. **hostel-service** - Hostel Management
48. **inventory-service** - Inventory Management
49. **hr-payroll-service** - HR & Payroll
50. **event-service** - Events Management
51. **certificate-service** - Certificates & ID Cards
52. **disciplinary-service** - Disciplinary Management

#### 7. Infrastructure Services (6)
53. **messaging-service** - Chat & Messaging
54. **email-service** - Email Delivery
55. **sms-service** - SMS Delivery
56. **storage-service** - File Storage
57. **cache-service** - Distributed Caching
58. **job-scheduler-service** - Background Jobs

---

## Domain Services


### 1. Authentication & Authorization Service (auth-service)

**Responsibility**: Complete authentication, authorization, and security (Module 01 - 71 requirements)

**Database Models** (12):
- User, UserAuthentication, UserSession, Role, Permission, RolePermission
- UserRole, PasswordResetToken, TwoFactorBackupCode, LoginAttempt
- DeviceToken, UserSecurity

**Core APIs** (45 endpoints):

#### Authentication (18 endpoints)
- `POST /auth/register` - User registration (email, phone, OAuth)
- `POST /auth/register/email` - Email registration with verification
- `POST /auth/register/phone` - Phone registration with OTP
- `POST /auth/register/google` - Google OAuth registration
- `POST /auth/register/microsoft` - Microsoft OAuth registration
- `POST /auth/register/aadhaar` - Aadhaar-based registration
- `POST /auth/login` - User login (multi-factor)
- `POST /auth/login/email` - Email/password login
- `POST /auth/login/phone` - Phone/OTP login
- `POST /auth/login/google` - Google OAuth login
- `POST /auth/login/microsoft` - Microsoft OAuth login
- `POST /auth/login/aadhaar` - Aadhaar login
- `POST /auth/mfa/setup` - Setup 2FA/TOTP
- `POST /auth/mfa/verify` - Verify 2FA code
- `POST /auth/mfa/backup-codes` - Generate backup codes
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/logout` - Logout single session
- `POST /auth/logout-all` - Logout all devices

#### Session Management (8 endpoints)
- `GET /auth/sessions` - List user sessions
- `GET /auth/sessions/:id` - Get session details
- `DELETE /auth/sessions/:id` - Terminate specific session
- `DELETE /auth/sessions/device/:deviceId` - Terminate device sessions
- `GET /auth/active-sessions/count` - Count active sessions
- `POST /auth/sessions/extend` - Extend session expiry
- `GET /auth/session/current` - Get current session info
- `POST /auth/sessions/verify` - Verify session validity


#### Password Management (7 endpoints)
- `POST /auth/password/reset-request` - Request password reset
- `POST /auth/password/reset/:token` - Reset password with token
- `POST /auth/password/change` - Change password (authenticated)
- `GET /auth/password/validate` - Validate password strength
- `GET /auth/password/history` - Get password change history
- `POST /auth/password/expire` - Force password expiry
- `GET /auth/password/policy` - Get password policy

#### RBAC & Permissions (12 endpoints)
- `GET /auth/roles` - List all roles
- `POST /auth/roles` - Create role
- `GET /auth/roles/:id` - Get role details
- `PUT /auth/roles/:id` - Update role
- `DELETE /auth/roles/:id` - Delete role
- `GET /auth/roles/:id/permissions` - Get role permissions
- `POST /auth/roles/:id/permissions` - Assign permissions to role
- `DELETE /auth/roles/:id/permissions/:permissionId` - Remove permission
- `GET /auth/permissions` - List all permissions
- `POST /auth/users/:id/roles` - Assign role to user
- `DELETE /auth/users/:id/roles/:roleId` - Remove user role
- `GET /auth/users/:id/permissions` - Get user effective permissions

**Events Emitted** (12):
- USER_REGISTERED, USER_LOGGED_IN, USER_LOGGED_OUT
- MFA_ENABLED, MFA_DISABLED, PASSWORD_CHANGED
- PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED
- ROLE_ASSIGNED, ROLE_REMOVED, SESSION_EXPIRED
- SUSPICIOUS_LOGIN_DETECTED

**External Dependencies**:
- user-service (user profile creation)
- notification-service (email OTPs, security alerts)
- sms-service (SMS OTPs)
- audit-service (security audit logs)

---

### 2. User Management Service (user-service)

**Responsibility**: User profiles and management (Module 02 - 60 requirements)

**Database Models** (8):
- UserProfile, UserContactInfo, UserVerification, UserSensitiveData
- UserLoginHistory, UserPreference, UserSetting, StudentProfile
- TeacherProfile, ParentProfile, PublisherProfile, CreatorProfile

**Core APIs** (40 endpoints):

#### Profile Management (15 endpoints)
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `PATCH /users/:id` - Partial update
- `DELETE /users/:id` - Soft delete user
- `GET /users/:id/complete` - Get complete profile
- `POST /users/:id/avatar` - Upload avatar
- `PUT /users/:id/contact` - Update contact info
- `PUT /users/:id/preferences` - Update preferences
- `GET /users/:id/settings` - Get user settings
- `PUT /users/:id/settings` - Update settings
- `POST /users/:id/verify-email` - Verify email
- `POST /users/:id/verify-phone` - Verify phone
- `GET /users/:id/verification-status` - Get verification status
- `POST /users/:id/aadhaar` - Link Aadhaar (encrypted)
- `GET /users/:id/aadhaar-status` - Check Aadhaar link status

#### Student Profiles (8 endpoints)
- `GET /users/students/:id` - Get student profile
- `PUT /users/students/:id` - Update student profile
- `POST /users/students/:id/enrollment` - Create enrollment
- `GET /users/students/:id/academic-history` - Get academic history
- `PUT /users/students/:id/emergency-contact` - Update emergency contact
- `GET /users/students/:id/documents` - Get uploaded documents
- `POST /users/students/:id/documents` - Upload document
- `GET /users/students/:id/parent-links` - Get linked parents


#### Teacher Profiles (5 endpoints)
- `GET /users/teachers/:id` - Get teacher profile
- `PUT /users/teachers/:id` - Update teacher profile
- `POST /users/teachers/:id/credentials` - Add credentials/certifications
- `GET /users/teachers/:id/subjects` - Get teaching subjects
- `PUT /users/teachers/:id/availability` - Update availability

#### Parent Profiles & Linking (7 endpoints)
- `GET /users/parents/:id` - Get parent profile
- `PUT /users/parents/:id` - Update parent profile
- `POST /users/parents/:id/link-student` - Link child to parent
- `DELETE /users/parents/:id/unlink-student/:studentId` - Unlink child
- `GET /users/parents/:id/children` - Get all linked children
- `POST /users/parents/:id/verify-relationship` - Verify parent-child relationship
- `GET /users/students/:id/parents` - Get student's parents

#### Publisher & Creator Profiles (5 endpoints)
- `GET /users/publishers/:id` - Get publisher profile
- `PUT /users/publishers/:id` - Update publisher profile
- `GET /users/creators/:id` - Get creator profile
- `PUT /users/creators/:id` - Update creator profile
- `POST /users/publishers/:id/verify` - Submit for verification

**Events Emitted** (10):
- USER_PROFILE_CREATED, USER_PROFILE_UPDATED
- STUDENT_ENROLLED, TEACHER_VERIFIED
- PARENT_CHILD_LINKED, PARENT_CHILD_UNLINKED
- PUBLISHER_VERIFIED, CREATOR_VERIFIED
- USER_VERIFIED, USER_DEACTIVATED

**External Dependencies**:
- auth-service (user authentication)
- organization-service (school enrollment)
- storage-service (avatar, document uploads)
- verification-service (identity verification)

---

### 3. Organization Management Service (organization-service)

**Responsibility**: Multi-tenant organization hierarchy (Module 03 - 35 requirements)

**Database Models** (10):
- Organization, Branch, Department, OrganizationUser
- OrganizationSetting, TenantHierarchy, GovernmentEntity
- OrganizationWhiteLabel, OrganizationRole

**Core APIs** (30 endpoints):

#### Organization CRUD (10 endpoints)
- `POST /organizations` - Create organization
- `GET /organizations` - List organizations (filtered)
- `GET /organizations/:id` - Get organization
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization
- `GET /organizations/:id/hierarchy` - Get hierarchy tree
- `POST /organizations/:id/branches` - Create branch
- `GET /organizations/:id/branches` - List branches
- `POST /organizations/:id/departments` - Create department
- `GET /organizations/:id/users` - List organization users

#### White-Label Configuration (8 endpoints)
- `PUT /organizations/:id/branding` - Configure branding
- `GET /organizations/:id/branding` - Get branding config
- `PUT /organizations/:id/domain` - Configure custom domain
- `PUT /organizations/:id/logo` - Upload logo
- `PUT /organizations/:id/colors` - Set color scheme
- `PUT /organizations/:id/email-templates` - Customize email templates
- `GET /organizations/:id/theme` - Get complete theme
- `POST /organizations/:id/preview-theme` - Preview theme changes

#### Organization Settings (7 endpoints)
- `GET /organizations/:id/settings` - Get settings
- `PUT /organizations/:id/settings` - Update settings
- `PUT /organizations/:id/settings/auth` - Configure SSO/auth
- `PUT /organizations/:id/settings/features` - Enable/disable features
- `GET /organizations/:id/settings/policies` - Get policies
- `PUT /organizations/:id/settings/policies` - Update policies
- `GET /organizations/:id/settings/integrations` - Get integration config

#### Organization Users & Roles (5 endpoints)
- `POST /organizations/:id/users` - Add user to organization
- `DELETE /organizations/:id/users/:userId` - Remove user
- `PUT /organizations/:id/users/:userId/role` - Assign role
- `GET /organizations/:id/roles` - List organization roles
- `POST /organizations/:id/roles` - Create custom role

**Events Emitted** (8):
- ORGANIZATION_CREATED, ORGANIZATION_UPDATED
- BRANCH_CREATED, DEPARTMENT_CREATED
- USER_ADDED_TO_ORG, USER_REMOVED_FROM_ORG
- WHITELABEL_CONFIGURED, ORGANIZATION_SETTINGS_CHANGED

**External Dependencies**:
- user-service (user management)
- auth-service (role management)
- storage-service (logo, assets)
- domain-service (custom domain setup)

---


### 4-10. Academic Domain Services (Module 04 - 50 requirements distributed)

#### 4. Academic Service (academic-service)
**Responsibility**: Boards, Curriculum, Academic Years

**Database Models**: Board Master, Curriculum, SyllabusVersion, AcademicYear, LearningOutcome, Competency

**Core APIs** (25 endpoints):
- Board CRUD: `GET/POST/PUT/DELETE /boards`
- Curriculum management: `GET/POST/PUT/DELETE /curricula`
- Academic year: `POST /academic-years`, `GET /academic-years/current`
- Syllabus versions: `GET /curricula/:id/syllabus`, `POST /curricula/:id/syllabus/version`
- Learning outcomes: `GET /outcomes`, `POST /outcomes`, mapping to content/assessments

**Events**: BOARD_CREATED, CURRICULUM_UPDATED, ACADEMIC_YEAR_STARTED

---

#### 5. School Service (school-service)
**Responsibility**: School management, configuration

**Database Models**: School, SchoolSetting, SchoolMetadata

**Core APIs** (20 endpoints):
- School CRUD: `POST/GET/PUT/DELETE /schools`
- School settings: `GET/PUT /schools/:id/settings`
- School staff: `GET /schools/:id/staff`, `POST /schools/:id/staff`
- School facilities: `GET/POST /schools/:id/facilities`
- School analytics: `GET /schools/:id/dashboard`

**Events**: SCHOOL_CREATED, SCHOOL_ACTIVATED, SCHOOL_DEACTIVATED

---

#### 6. Student Service (student-service)
**Responsibility**: Student lifecycle, enrollment, transfers

**Database Models**: Student, StudentEnrollment, StudentTransfer, StudentFamily

**Core APIs** (30 endpoints):
- Student enrollment: `POST /students/enroll`, `GET /students/:id/enrollment`
- Student transfers: `POST /students/:id/transfer`, approval workflow
- Student promotions: `POST /students/promote-bulk`, `POST /students/:id/promote`
- Family info: `GET/PUT /students/:id/family`
- Academic records: `GET /students/:id/records`
- Attendance summary: `GET /students/:id/attendance-summary`

**Events**: STUDENT_ENROLLED, STUDENT_PROMOTED, STUDENT_TRANSFERRED, STUDENT_DROPPED

---

#### 7. Teacher Service (teacher-service)
**Responsibility**: Teacher assignments, workload management

**Database Models**: Teacher, TeacherAssignment, TeacherWorkload, TeacherQualification

**Core APIs** (25 endpoints):
- Teacher assignments: `POST /teachers/:id/assignments`, `GET /teachers/:id/assignments`
- Workload tracking: `GET /teachers/:id/workload`, auto-calculation
- Subject assignments: `POST /teachers/:id/subjects`
- Class assignments: `POST /teachers/:id/classes`
- Schedule: `GET /teachers/:id/schedule`

**Events**: TEACHER_ASSIGNED, TEACHER_WORKLOAD_EXCEEDED, SUBSTITUTE_REQUESTED

---

#### 8. Class Service (class-service)
**Responsibility**: Class & section management

**Database Models**: Class, Section, SectionStudent, SectionTeacher, SectionSubject

**Core APIs** (30 endpoints):
- Class CRUD: `POST/GET/PUT/DELETE /classes`
- Section management: `POST /classes/:id/sections`, capacity management
- Student assignment: `POST /sections/:id/students`, bulk assign
- Teacher assignment: `POST /sections/:id/teachers`
- Subject assignment: `POST /sections/:id/subjects`
- Roster generation: `GET /sections/:id/roster`

**Events**: CLASS_CREATED, SECTION_FULL, STUDENT_ASSIGNED_TO_SECTION

---

#### 9. Timetable Service (timetable-service)
**Responsibility**: Timetable generation, scheduling

**Database Models**: Timetable, TimeSlot, TimetableEntry, Room, TimetableSubstitution

**Core APIs** (35 endpoints):
- Timetable generation: `POST /timetables/generate` (AI-powered)
- Manual timetable: `POST /timetables`, `POST /timetables/entries`
- Conflict detection: `POST /timetables/validate`
- Substitutions: `POST /timetables/substitute`
- Room allocation: `GET /rooms/available`, `POST /timetables/allocate-room`
- Teacher schedule: `GET /teachers/:id/timetable`
- Student schedule: `GET /students/:id/timetable`

**Events**: TIMETABLE_GENERATED, TIMETABLE_CONFLICT_DETECTED, SUBSTITUTION_CREATED

---

#### 10. Attendance Service (attendance-service)
**Responsibility**: Multi-method attendance tracking

**Database Models**: Attendance, BiometricAttendanceLog, AttendanceDevice, LeaveRequest

**Core APIs** (40 endpoints):
- Mark attendance: `POST /attendance/mark` (manual, biometric, QR, GPS, RFID)
- Biometric integration: `POST /attendance/biometric/sync`
- QR code generation: `GET /attendance/qr-code/:sessionId`
- GPS attendance: `POST /attendance/gps` (location validation)
- Bulk attendance: `POST /attendance/bulk`
- Leave requests: `POST /students/:id/leave`, approval workflow
- Attendance reports: `GET /attendance/reports/daily`, `GET /attendance/reports/monthly`
- Defaulter lists: `GET /attendance/defaulters`

**Events**: ATTENDANCE_MARKED, ABSENCE_DETECTED, LEAVE_APPROVED, LOW_ATTENDANCE_ALERT

---


#### 11. Subject Service (subject-service)
**Responsibility**: Subject, chapter, topic hierarchy

**Database Models**: Subject, Chapter, Topic, SubjectPrerequisite

**Core APIs** (20 endpoints):
- Subject CRUD: `POST/GET/PUT/DELETE /subjects`
- Chapter management: `POST /subjects/:id/chapters`
- Topic management: `POST /chapters/:id/topics`
- Hierarchy: `GET /subjects/:id/hierarchy` (full tree)
- Prerequisites: `POST /subjects/:id/prerequisites`
- Curriculum mapping: `GET /subjects/:id/curriculum-map`

**Events**: SUBJECT_CREATED, CHAPTER_ADDED, TOPIC_COMPLETED

---

#### 12. Counseling Service (counseling-service)
**Responsibility**: Student welfare, counseling sessions (Module 04 subset)

**Database Models**: CounselingSession, StudentWelfareRecord, CounselorAssignment

**Core APIs** (25 endpoints):
- Schedule session: `POST /counseling/sessions`
- Session notes: `POST /counseling/sessions/:id/notes` (private)
- Welfare tracking: `POST /students/:id/welfare-record`
- Crisis interventions: `POST /counseling/crisis-intervention`
- Referrals: `POST /counseling/referrals`
- Reports: `GET /counseling/reports` (aggregated, anonymized)

**Events**: SESSION_SCHEDULED, CRISIS_REPORTED, REFERRAL_MADE

---

#### 13. Scholarship Service (scholarship-service)
**Responsibility**: Financial aid, scholarships (Module 04 subset)

**Database Models**: Scholarship, ScholarshipApplication, ScholarshipAward

**Core APIs** (20 endpoints):
- Scholarship CRUD: `POST/GET/PUT/DELETE /scholarships`
- Applications: `POST /scholarships/:id/apply`, `GET /scholarships/:id/applications`
- Approval workflow: `PUT /scholarships/applications/:id/approve`
- Award tracking: `POST /scholarships/awards`, `GET /students/:id/awards`
- Eligibility check: `POST /scholarships/:id/check-eligibility`

**Events**: SCHOLARSHIP_CREATED, APPLICATION_SUBMITTED, SCHOLARSHIP_AWARDED

---

### 14-25. Learning & Content Services (Modules 05, 06, 09, 10, 11)

#### 14. Content Service (content-service)
**Responsibility**: Core content management (Module 05 - 80 requirements)

**Database Models**: Content, ContentVersion, ContentDraft, ContentWorkflow, ContentTag, ContentCategory

**Core APIs** (60 endpoints):
- Content upload: `POST /content/upload` (documents, videos, images, audio, 3D models)
- Content CRUD: `GET/PUT/DELETE /content/:id`
- Versioning: `POST /content/:id/versions`, `GET /content/:id/versions`, rollback
- Approval workflow: `POST /content/:id/submit-for-review`, approve/reject
- Tagging: `POST /content/:id/tags`, taxonomy tagging
- Categorization: `POST /content/:id/categories`
- Collections: `POST /collections`, `POST /collections/:id/content`
- Access control: `PUT /content/:id/access-rules`
- Ratings: `POST /content/:id/rate`, `GET /content/:id/ratings`
- Search: Handled by search-service
- Analytics: Views, completions tracked and sent to analytics-service

**Events**: CONTENT_UPLOADED, CONTENT_PUBLISHED, CONTENT_UPDATED, CONTENT_RATED, CONTENT_VIEWED

---

#### 15. Media Service (media-service)
**Responsibility**: Media processing, streaming

**Database Models**: Media, MediaFolder, MediaTranscode, MediaPermission

**Core APIs** (30 endpoints):
- Media upload: `POST /media/upload`
- Video transcoding: Automatic multi-resolution (360p, 480p, 720p, 1080p)
- Thumbnail generation: Automatic for videos/images
- Streaming URLs: `GET /media/:id/stream` (adaptive bitrate)
- Download URLs: `GET /media/:id/download` (if permitted)
- Folders: `POST /media/folders`, organize media
- Permissions: `PUT /media/:id/permissions`
- Compression: Automatic optimization

**Events**: MEDIA_UPLOADED, TRANSCODE_COMPLETED, MEDIA_DELETED

---

#### 16. AR/VR Service (ar-vr-service)
**Responsibility**: AR/VR content metadata, marker management (Module 06 - 55 requirements)

**Database Models**: ARMarker, ARContent, VRContent, VRUsageLog, Book, Diagram

**Core APIs** (45 endpoints):
- AR Markers: `POST /ar/markers/generate`, `GET /ar/markers`, mapping to diagrams
- AR content: `POST /ar/content`, `GET /ar/content/:id`, deep linking
- VR labs: `POST /vr/labs`, `GET /vr/labs`, catalog management
- VR sessions: `POST /vr/sessions`, tracking student VR usage
- VR assessments: `POST /vr/labs/:id/assessment`, auto-scoring
- Device compatibility: `GET /ar-vr/devices`, compatibility matrix
- Usage analytics: `GET /ar-vr/analytics`, engagement tracking
- Marker recognition: `POST /ar/markers/recognize` (integration with AR apps)
- 3D content linking: Link 3D models to AR/VR experiences

**Events**: AR_MARKER_SCANNED, VR_SESSION_STARTED, VR_LAB_COMPLETED, AR_CONTENT_ACCESSED

---

#### 17. 3D Model Service (3d-model-service)
**Responsibility**: 3D model management, optimization

**Database Models**: 3DModel, ModelAnnotation, ModelCollection

**Core APIs** (25 endpoints):
- Model upload: `POST /3d-models/upload` (GLB, GLTF, OBJ, FBX)
- Optimization: Automatic LOD generation, compression
- Annotations: `POST /3d-models/:id/annotations`
- Collections: `POST /3d-models/collections`
- AR mode: `GET /3d-models/:id/ar-view`
- VR mode: `GET /3d-models/:id/vr-view`
- Viewer: Web-based 3D viewer integration
- Interactions: Track rotations, zooms, part clicks

**Events**: MODEL_UPLOADED, MODEL_OPTIMIZED, MODEL_VIEWED

---


#### 18. Live Class Service (live-class-service)
**Responsibility**: Live video classes & metaverse classrooms (Module 11 - 45 requirements)

**Database Models**: LiveClass, LiveClassParticipant, MetaverseRoom, ClassRecording

**Core APIs** (50 endpoints):
- Schedule class: `POST /live-classes/schedule`
- Join class: `POST /live-classes/:id/join` (generates Zoom/Meet link or metaverse URL)
- Zoom integration: `POST /live-classes/zoom/create`, webhook for events
- Google Meet integration: `POST /live-classes/meet/create`
- Metaverse classroom: `POST /live-classes/metaverse/create` (Babylon.js-based)
- Participant management: `GET /live-classes/:id/participants`, mute/unmute
- Breakout rooms: `POST /live-classes/:id/breakout-rooms`
- Polls: `POST /live-classes/:id/polls`, real-time results
- Chat: `POST /live-classes/:id/chat/message`
- Recording: `POST /live-classes/:id/start-recording`, automatic upload
- Attendance: Automatic tracking on join/leave
- Metaverse avatars: `POST /live-classes/metaverse/avatars/customize`
- Spatial audio: Enabled in metaverse mode
- 3D content sharing: `POST /live-classes/metaverse/share-3d-model`
- Class analytics: `GET /live-classes/:id/analytics` (engagement, attention)

**Events**: CLASS_SCHEDULED, CLASS_STARTED, CLASS_ENDED, PARTICIPANT_JOINED, POLL_CREATED, BREAKOUT_ROOMS_CREATED

**External Dependencies**:
- Zoom API, Google Meet API
- recording-service (class recordings)
- attendance-service (automatic attendance)
- storage-service (recording storage)
- 3d-model-service (metaverse content)

---

#### 19. Recording Service (recording-service)
**Responsibility**: Class recording management

**Database Models**: ClassRecording, RecordingTranscript, RecordingChapter

**Core APIs** (20 endpoints):
- Upload recording: `POST /recordings/upload`
- Process recording: Automatic transcoding, thumbnail generation
- Transcription: Automatic speech-to-text
- Chapters: `POST /recordings/:id/chapters`, AI-generated or manual
- Access control: `PUT /recordings/:id/access`
- Streaming: `GET /recordings/:id/stream`
- Download: `GET /recordings/:id/download`
- Notes: `POST /recordings/:id/notes`
- Search transcripts: `GET /recordings/search`

**Events**: RECORDING_UPLOADED, TRANSCRIPTION_COMPLETED, RECORDING_VIEWED

---

#### 20. Assignment Service (assignment-service)
**Responsibility**: Assignment creation, submission, grading (Module 10 - 25 requirements)

**Database Models**: Assignment, AssignmentSubmission, AssignmentRubric

**Core APIs** (40 endpoints):
- Create assignment: `POST /assignments`
- Templates: `GET /assignments/templates`, `POST /assignments/from-template`
- Assign to students: `POST /assignments/:id/assign` (class, section, individuals)
- Submit assignment: `POST /assignments/:id/submit`
- Resubmit: `POST /assignments/:id/resubmit`
- Draft & auto-save: `POST /assignments/:id/submissions/draft`, auto-save every 2 min
- Late submissions: Automatic penalty calculation based on rules
- Grading: `POST /assignments/:id/submissions/:sid/grade`
- Rubric grading: `POST /assignments/:id/rubric`, apply rubric
- Feedback: `POST /assignments/:id/submissions/:sid/feedback` (text, audio, video)
- Peer review: `POST /assignments/:id/enable-peer-review`
- Plagiarism check: Integration with Turnitin/Copyscape (via integration-service)
- Submission analytics: `GET /assignments/:id/analytics`
- Bulk grading: `POST /assignments/:id/bulk-grade`

**Events**: ASSIGNMENT_CREATED, ASSIGNMENT_SUBMITTED, ASSIGNMENT_GRADED, LATE_SUBMISSION, RESUBMISSION

**External Dependencies**:
- storage-service (file uploads)
- notification-service (assignment notifications)
- grading-service (rubric-based grading)

---

#### 21. Assessment Service (assessment-service)
**Responsibility**: Exam creation, execution (Module 09 - 70 requirements)

**Database Models**: Exam, ExamQuestion, ExamAttempt, ExamAnswer, ExamBlueprint, Rank

**Core APIs** (60 endpoints):
- Create exam: `POST /exams`
- Blueprint-based generation: `POST /exams/generate-from-blueprint`
- Question management: `POST /exams/:id/questions`, randomization
- Exam configuration: Proctoring, time limits, attempts, negative marking
- Publish exam: `PUT /exams/:id/publish`
- Assign exam: `POST /exams/:id/assign` (class, section, individual)
- Start exam: `POST /exams/:id/start` (student)
- Submit answers: `POST /exams/:id/answers`, auto-save every answer
- Submit exam: `POST /exams/:id/submit`
- Auto-grading: Automatic for MCQs, True/False, Fill-in-blanks
- Manual grading: `POST /exams/:id/attempts/:aid/grade` (subjective questions)
- Proctoring: `POST /exams/:id/proctoring/flags`, webcam integration
- Results: `GET /exams/:id/results`, publish to students
- Ranking: `GET /exams/:id/rankings` (class, school, district, state, national)
- Analytics: `GET /exams/:id/analytics`, difficulty analysis, question-level performance

**Events**: EXAM_CREATED, EXAM_PUBLISHED, EXAM_STARTED, EXAM_SUBMITTED, EXAM_GRADED, RESULTS_PUBLISHED

**External Dependencies**:
- question-bank-service (question retrieval)
- grading-service (rubric-based subjective grading)
- notification-service (exam notifications)

---

#### 22. Grading Service (grading-service)
**Responsibility**: Rubric management, grading workflows

**Database Models**: GradingRubric, RubricCriteria, Grade, StudentReportCard

**Core APIs** (30 endpoints):
- Rubric CRUD: `POST/GET/PUT/DELETE /rubrics`
- Apply rubric: `POST /rubrics/:id/apply` (to exam or assignment)
- Manual grading: `POST /grading/manual` (with rubric or freeform)
- Grade calculation: Automatic aggregation (assignment + exam + attendance weights)
- Report cards: `GET /students/:id/report-card`, `POST /report-cards/generate`
- Transcript generation: `GET /students/:id/transcript`
- Grade distribution: `GET /classes/:id/grade-distribution`

**Events**: GRADE_ASSIGNED, REPORT_CARD_GENERATED

---

#### 23. Question Bank Service (question-bank-service)
**Responsibility**: Question bank management (Module 09 subset)

**Database Models**: QuestionBank, Question, QuestionTag

**Core APIs** (35 endpoints):
- Question CRUD: `POST/GET/PUT/DELETE /questions`
- Question types: MCQ, True/False, Fill-in-blank, Short answer, Long answer, Match, Ordering
- Bulk import: `POST /questions/import` (Excel, CSV)
- Tagging: `POST /questions/:id/tags`, taxonomy (subject, chapter, topic, difficulty, bloom's level)
- Search questions: `GET /questions/search`, advanced filters
- Question sets: `POST /question-sets`, curated collections
- Difficulty calibration: AI-based difficulty scoring
- Usage analytics: Track question usage, effectiveness

**Events**: QUESTION_CREATED, QUESTION_USED_IN_EXAM

---

#### 24. Learning Path Service (learning-path-service)
**Responsibility**: Personalized learning paths

**Database Models**: LearningPath, PathContent, PathProgress

**Core APIs** (25 endpoints):
- Create path: `POST /learning-paths`
- Add content: `POST /learning-paths/:id/content`
- Assign path: `POST /learning-paths/:id/assign`
- Track progress: `GET /learning-paths/:id/progress/:userId`
- Complete milestone: `POST /learning-paths/:id/complete-milestone`
- Adaptive branching: AI-based path adjustments based on performance
- Recommendations: `GET /users/:id/recommended-paths`

**Events**: PATH_ASSIGNED, PATH_COMPLETED, MILESTONE_REACHED

---

#### 25. Gamification Service (gamification-service)
**Responsibility**: Badges, points, leaderboards

**Database Models**: Badge, UserBadge, Point, Leaderboard

**Core APIs** (30 endpoints):
- Badge definitions: `POST /badges`, `GET /badges`
- Award badge: `POST /users/:id/badges/:badgeId`
- Points: `POST /users/:id/points/add`, automatic on achievements
- Leaderboards: `GET /leaderboards/:type` (class, school, global)
- Challenges: `POST /challenges`, compete with peers
- Streaks: Track daily learning streaks

**Events**: BADGE_EARNED, POINTS_AWARDED, LEADERBOARD_UPDATED

---


### 26-33. Commerce & Billing Services (Modules 07, 08, 16)

#### 26. Subscription Service (subscription-service)
**Responsibility**: Subscription lifecycle management (Module 07 - 40 requirements)

**Database Models**: Subscription, SubscriptionPlan, SubscriptionContent, SubscriptionHistory

**Core APIs** (50 endpoints):
- Plans: `GET /subscriptions/plans`, 7 tiers (Free, Basic, Standard, Premium, School, District, Enterprise)
- Subscribe: `POST /subscriptions/subscribe`
- Trial: `POST /subscriptions/trial`, 7/14/30 day trials
- Upgrade/downgrade: `POST /subscriptions/:id/upgrade`, `POST /subscriptions/:id/downgrade`
- Cancel: `POST /subscriptions/:id/cancel`, immediate or end-of-period
- Pause/freeze: `POST /subscriptions/:id/pause`, temporary suspension
- Renew: Automatic renewal with grace periods
- Promo codes: `POST /subscriptions/apply-promo-code`
- Content entitlement: `GET /subscriptions/:id/entitlements`, feature flags
- Subscription analytics: `GET /subscriptions/analytics` (MRR, ARR, churn)
- Grace period handling: Auto-retry failed payments

**Events**: SUBSCRIPTION_CREATED, SUBSCRIPTION_RENEWED, SUBSCRIPTION_CANCELLED, SUBSCRIPTION_UPGRADED, SUBSCRIPTION_EXPIRED, PAYMENT_FAILED

**External Dependencies**:
- payment-service (payment processing)
- billing-service (invoice generation)
- license-service (for organizational subscriptions)
- notification-service (renewal reminders, expiry notifications)

---

#### 27. License Service (license-service)
**Responsibility**: License pool management (Module 07 subset)

**Database Models**: License, LicensePool, LicenseAssignment

**Core APIs** (40 endpoints):
- Create license pool: `POST /licenses/pools` (bulk licenses for organizations)
- Purchase licenses: `POST /licenses/purchase` (seat-based)
- Assign license: `POST /licenses/:id/assign/:userId`
- Revoke license: `POST /licenses/:id/revoke/:userId`
- License reclamation: Automatic for inactive users (30/60/90 day rules)
- Pool analytics: `GET /licenses/pools/:id/analytics`, utilization tracking
- Transfer licenses: `POST /licenses/:id/transfer` (between users)
- Floating licenses: Dynamic allocation, check-out/check-in model
- License compliance: `GET /licenses/compliance-report`

**Events**: LICENSE_ASSIGNED, LICENSE_REVOKED, LICENSE_RECLAIMED, POOL_EXHAUSTED

---

#### 28. Payment Service (payment-service)
**Responsibility**: Payment processing (Module 08 - 35 requirements)

**Database Models**: Payment, PaymentAttempt, PaymentRefund, PaymentMethod

**Core APIs** (45 endpoints):
- Payment gateways: Razorpay (India), Stripe (International), PayPal
- Payment methods: UPI, cards, net banking, wallets, bank transfer, EMI, BNPL
- Process payment: `POST /payments/process`
- Gateway routing: Intelligent routing based on success rates, user location
- Retry logic: Automatic retries on failure with exponential backoff
- Payment status: `GET /payments/:id/status`, webhook handling
- Refunds: `POST /payments/:id/refund`, full or partial
- Disputes: `POST /payments/:id/dispute`
- Payment methods: `POST /users/:id/payment-methods`, secure storage
- Recurring payments: Automatic for subscriptions
- Payment analytics: `GET /payments/analytics`, success rates, gateway performance
- Fraud detection: Integration with gateway fraud tools

**Events**: PAYMENT_INITIATED, PAYMENT_SUCCESS, PAYMENT_FAILED, REFUND_PROCESSED, DISPUTE_RAISED

**External Dependencies**:
- Razorpay API, Stripe API, PayPal API
- billing-service (invoice creation)
- subscription-service (subscription activation)
- notification-service (payment receipts)

---

#### 29. Billing Service (billing-service)
**Responsibility**: Invoicing, tax calculation

**Database Models**: Invoice, InvoiceItem, Tax, Credit

**Core APIs** (35 endpoints):
- Generate invoice: `POST /billing/invoices/generate`, automatic on payments
- Invoice CRUD: `GET/PUT/DELETE /billing/invoices/:id`
- Tax calculation: Automatic based on location (GST, VAT, sales tax)
- Apply credits: `POST /billing/invoices/:id/apply-credit`
- Invoice history: `GET /users/:id/invoices`
- Download invoice: `GET /billing/invoices/:id/download` (PDF)
- Dunning management: Automatic retry schedule for failed payments
- Prorated billing: For mid-cycle upgrades/downgrades
- Tax exemptions: Handle educational institution exemptions
- Reconciliation: `POST /billing/reconcile`, bank statement matching

**Events**: INVOICE_GENERATED, INVOICE_PAID, DUNNING_STARTED

---

#### 30. Fee Service (fee-service)
**Responsibility**: School fee management (Module 08 subset + Module 13 subset)

**Database Models**: FeeStructure, FeeRecord, FeePayment, FeeConcession, FeeInstallment, FeeWaiver, FeeRefund

**Core APIs** (55 endpoints):
- Fee structures: `POST /fees/structures`, flexible structures per class/category
- Create fee record: `POST /students/:id/fee-records`
- Installments: `POST /fee-records/:id/installments`, due dates
- Late fees: Automatic calculation based on rules
- Concessions: `POST /students/:id/fee-concessions`, discounts (merit, need-based, sibling)
- Waivers: `POST /students/:id/fee-waivers`, approval workflow
- Fee payment: `POST /fee-records/:id/pay`, integration with payment-service
- Fee reminders: Automatic notifications before due dates
- Defaulter reports: `GET /fees/defaulters`
- Fee receipts: `GET /fee-payments/:id/receipt` (PDF)
- Refunds: `POST /fee-payments/:id/refund`
- Fee analytics: `GET /schools/:id/fee-analytics`, collection rates
- Transport fees: Separate management, route-based pricing

**Events**: FEE_STRUCTURE_CREATED, FEE_PAYMENT_RECEIVED, FEE_OVERDUE, CONCESSION_APPROVED

**External Dependencies**:
- payment-service (payment processing)
- billing-service (receipt generation)
- student-service (student info)
- notification-service (fee reminders)

---

#### 31. Marketplace Service (marketplace-service)
**Responsibility**: Marketplace operations (Module 15 - 40 requirements)

**Database Models**: MarketplaceProduct, MarketplaceOrder, PublisherMonetizationPlan, CreatorMonetizationPlan, ProductReview

**Core APIs** (60 endpoints):
- Publisher onboarding: `POST /marketplace/publishers/register`, verification workflow
- Creator onboarding: `POST /marketplace/creators/register`
- Product listing: `POST /marketplace/products`
- Product pricing: Multiple models (one-time, subscription, pay-per-use, bundles)
- Purchase product: `POST /marketplace/products/:id/purchase`
- Revenue sharing: Automatic split calculation (platform, publisher, creator)
- Promotions: `POST /marketplace/products/:id/promotions`, discount codes
- Product reviews: `POST /marketplace/products/:id/reviews`
- Content moderation: Approval workflow for new products
- Marketplace analytics: `GET /marketplace/analytics` (GMV, transaction volume, top sellers)
- Seller dashboard: `GET /marketplace/sellers/:id/dashboard`
- Fraud detection: Automatic detection of fake reviews, suspicious transactions

**Events**: PRODUCT_LISTED, PRODUCT_PURCHASED, REVIEW_SUBMITTED, REVENUE_SPLIT_CALCULATED

**External Dependencies**:
- payment-service (purchases)
- payout-service (seller payouts)
- content-service (content delivery)
- notification-service (seller notifications)

---

#### 32. Payout Service (payout-service)
**Responsibility**: Publisher/creator payouts (Module 15 subset)

**Database Models**: PayoutRequest, Payout, PayoutSchedule

**Core APIs** (30 endpoints):
- Payout schedules: Weekly, bi-weekly, monthly
- Calculate payouts: Automatic based on sales and revenue split
- Request payout: `POST /payouts/request`
- Process payouts: `POST /payouts/process`, integration with payment gateways
- Payout methods: Bank transfer, PayPal, Stripe
- Tax withholding: Automatic TDS/withholding tax calculation
- Payout history: `GET /sellers/:id/payouts`
- Failed payout retry: Automatic retries
- Payout analytics: `GET /payouts/analytics`

**Events**: PAYOUT_REQUESTED, PAYOUT_PROCESSED, PAYOUT_FAILED

---

#### 33. Pricing Service (pricing-service)
**Responsibility**: Dynamic pricing (Module 15 subset)

**Database Models**: PricingRule, DynamicPrice

**Core APIs** (25 endpoints):
- Pricing rules: `POST /pricing/rules`, configure dynamic pricing
- Calculate price: `GET /pricing/calculate`, real-time price calculation
- Demand-based pricing: Adjust based on demand
- A/B testing: `POST /pricing/ab-test`, test pricing strategies
- Competitor pricing: Integration with external data sources
- Personalized pricing: User segment-based pricing
- Price optimization: AI-based recommendations

**Events**: PRICE_CHANGED, PRICING_TEST_RESULT

---


### 34-39. Analytics & Intelligence Services (Modules 12, 16)

#### 34. Analytics Service (analytics-service)
**Responsibility**: Comprehensive analytics (Module 12 - 85 requirements)

**Database Models**: StudentAnalytics, TeacherAnalytics, SchoolAnalytics, GovernmentDashboard, AnalyticsSnapshot, KPI, MetricDefinition

**Core APIs** (80 endpoints):
- Student analytics: `GET /analytics/students/:id`, performance, engagement, weak areas
- Class analytics: `GET /analytics/classes/:id`, aggregate metrics
- Teacher analytics: `GET /analytics/teachers/:id`, teaching effectiveness
- School analytics: `GET /analytics/schools/:id`, overall performance
- Government dashboards: `GET /analytics/government/district/:id`, `GET /analytics/government/state/:id`, `GET /analytics/government/national`
- Learning analytics: `GET /analytics/learning/:userId`, personalized insights
- Predictive analytics: `POST /analytics/predict`, dropout risk, exam scores
- Weak area detection: `GET /students/:id/weak-areas`, AI-powered analysis
- Benchmark comparisons: `GET /analytics/benchmark`, compare across schools/districts
- Real-time dashboards: WebSocket connections for live data
- Report generation: `POST /analytics/reports/generate`, scheduled reports
- Export reports: `GET /analytics/reports/:id/export` (PDF, Excel, CSV)
- KPI tracking: `GET /analytics/kpis`, track organizational KPIs
- Cohort analysis: `GET /analytics/cohorts`, retention, performance trends
- Funnel analysis: `GET /analytics/funnels`, enrollment, engagement funnels

**Events**: ANALYTICS_REPORT_GENERATED, WEAK_AREA_DETECTED, PREDICTION_MADE

**External Dependencies**:
- All domain services (data aggregation)
- Data warehouse (historical data)
- ML models (predictive analytics)

---

#### 35. Reporting Service (reporting-service)
**Responsibility**: Report generation, scheduling

**Database Models**: Report, ReportTemplate, ReportSchedule

**Core APIs** (35 endpoints):
- Report templates: `GET /reports/templates`, pre-built templates
- Generate report: `POST /reports/generate`
- Schedule report: `POST /reports/schedule`, daily/weekly/monthly
- Report history: `GET /reports/history`
- Download report: `GET /reports/:id/download`
- Custom reports: `POST /reports/custom`, query builder
- Report sharing: `POST /reports/:id/share`
- Government compliance reports: Pre-configured templates for UDISE+

**Events**: REPORT_GENERATED, REPORT_SCHEDULED

---

#### 36. Dashboard Service (dashboard-service)
**Responsibility**: Dashboard data aggregation

**Database Models**: DashboardCache, DashboardConfig

**Core APIs** (30 endpoints):
- Student dashboard: `GET /dashboards/student/:id`
- Teacher dashboard: `GET /dashboards/teacher/:id`
- Principal dashboard: `GET /dashboards/principal/:schoolId`
- Parent dashboard: `GET /dashboards/parent/:id`
- Dashboard customization: `PUT /dashboards/:type/customize`
- Widget configuration: `POST /dashboards/:id/widgets`
- Real-time updates: WebSocket for live dashboard data
- Dashboard caching: Redis caching for performance

**Events**: DASHBOARD_UPDATED

---

#### 37. AI Recommendation Service (ai-recommendation-service)
**Responsibility**: AI-powered recommendations (Module 05 subset)

**Database Models**: AIRecommendation, AIPrediction, StudentLearningStyle

**Core APIs** (35 endpoints):
- Content recommendations: `GET /ai/recommendations/content/:userId`
- Learning path recommendations: `GET /ai/recommendations/paths/:userId`
- Personalized suggestions: Based on learning style, performance, interests
- Collaborative filtering: Users with similar profiles
- Next best action: `GET /ai/next-best-action/:userId`
- Remedial content: `GET /ai/remedial/:userId/:subjectId`
- Learning style detection: `POST /ai/learning-style/detect`
- Model training: Continuous learning from user interactions
- A/B testing: Test recommendation algorithms

**Events**: RECOMMENDATION_GENERATED, RECOMMENDATION_CLICKED, RECOMMENDATION_COMPLETED

**External Dependencies**:
- content-service (content metadata)
- analytics-service (user behavior data)
- ML infrastructure (TensorFlow/PyTorch models)

---

#### 38. Chatbot Service (chatbot-service)
**Responsibility**: AI chatbot (Module 05 subset)

**Database Models**: ChatbotConversation, ChatbotMessage, AIPrompt, AIFeedback

**Core APIs** (30 endpoints):
- Start conversation: `POST /chatbot/conversations`
- Send message: `POST /chatbot/conversations/:id/messages`
- Get response: AI-powered natural language understanding
- Context awareness: Maintain conversation context
- Intent recognition: Classify user intents
- Entity extraction: Extract key information
- Fallback to human: `POST /chatbot/conversations/:id/escalate`
- Feedback: `POST /chatbot/messages/:id/feedback`, improve responses
- Chatbot analytics: `GET /chatbot/analytics`, popular queries, resolution rates
- Multi-language support: Auto-detect and respond in user's language

**Events**: CONVERSATION_STARTED, MESSAGE_SENT, ESCALATED_TO_HUMAN

**External Dependencies**:
- NLP models (OpenAI GPT, custom models)
- knowledge base (for RAG - Retrieval Augmented Generation)
- user-service (user profile for personalization)

---

#### 39. Search Service (search-service)
**Responsibility**: Search & discovery (Module 16 - 25 requirements)

**Database Models**: SearchIndex, SearchKeyword, SearchAnalytics, RecentSearch

**Core APIs** (40 endpoints):
- Universal search: `GET /search`, search across all content
- Autocomplete: `GET /search/suggest`, real-time suggestions
- Faceted search: `GET /search/facets`, filters (subject, class, type, difficulty)
- Advanced search: `POST /search/advanced`, query builder
- Search filters: Apply multiple filters
- Search within results: Refine existing search
- Recent searches: `GET /search/recent/:userId`
- Popular searches: `GET /search/trending`
- Semantic search: `POST /search/semantic`, natural language understanding
- Search analytics: `GET /search/analytics`, query volume, click-through rates
- Zero-result handling: Suggest alternatives
- Federated search: Search across multiple data sources

**Search Engine**: Elasticsearch / OpenSearch

**Events**: SEARCH_PERFORMED, ZERO_RESULTS, SEARCH_CLICKED

**External Dependencies**:
- All content services (indexing)
- Elasticsearch cluster
- analytics-service (search analytics)

---


### 40-47. ERP & Operations Services (Module 13 - 120 requirements distributed)

#### 40. Library Service (library-service)
**Responsibility**: Library management (Module 13 subset - 12 requirements)

**Database Models**: LibraryBook, LibraryIssue, LibraryReservation, LibraryMember, LibraryFine

**Core APIs** (35 endpoints):
- Book catalog: `POST/GET/PUT/DELETE /library/books`
- Book search: `GET /library/books/search`, by title, author, ISBN, subject
- Issue book: `POST /library/books/:id/issue`
- Return book: `POST /library/books/:id/return`
- Renew book: `POST /library/issues/:id/renew`
- Reserve book: `POST /library/books/:id/reserve`
- Fine calculation: Automatic for overdue books
- Fine payment: `POST /library/fines/:id/pay`, integration with payment-service
- Membership: `POST /library/members`, student/teacher registration
- Barcode/RFID: `POST /library/scan`, barcode/RFID scanning integration
- Library analytics: `GET /library/analytics`, most borrowed, overdue stats
- Digital library: Link to e-books, online resources

**Events**: BOOK_ISSUED, BOOK_RETURNED, BOOK_OVERDUE, FINE_GENERATED

---

#### 41. Transport Service (transport-service)
**Responsibility**: Transport management (Module 13 subset - 12 requirements)

**Database Models**: TransportRoute, TransportVehicle, VehicleGPSLog, VehicleMaintenance, TransportTrip, TransportAttendance, TransportFee

**Core APIs** (45 endpoints):
- Route management: `POST/GET/PUT/DELETE /transport/routes`
- Vehicle management: `POST/GET/PUT/DELETE /transport/vehicles`
- GPS tracking: `POST /transport/vehicles/:id/gps`, real-time location updates
- Live tracking: `GET /transport/vehicles/:id/location`, parents/admins track bus
- Trip management: `POST /transport/trips`, track daily trips
- Attendance tracking: `POST /transport/trips/:id/attendance`, student boarding/alighting
- Maintenance: `POST /transport/vehicles/:id/maintenance`, track service records
- Alerts: `POST /transport/alerts`, breakdown, delays, accidents
- Transport fees: Integration with fee-service, route-based pricing
- Route optimization: AI-based route planning
- Driver management: `POST/GET /transport/drivers`, assign drivers to vehicles
- Safety incidents: `POST /transport/incidents`, incident reporting
- Parent notifications: Real-time updates on bus location, ETA

**Events**: VEHICLE_DEPARTED, VEHICLE_ARRIVED, STUDENT_BOARDED, STUDENT_ALIGHTED, BREAKDOWN_REPORTED, MAINTENANCE_DUE

**External Dependencies**:
- GPS tracking devices/APIs
- maps API (Google Maps, MapBox)
- notification-service (parent alerts)
- fee-service (transport fee management)

---

#### 42. Hostel Service (hostel-service)
**Responsibility**: Hostel management (Module 13 subset - 12 requirements)

**Database Models**: HostelBlock, HostelRoom, HostelRoomAssignment, HostelFee, HostelMaintenance, HostelVisitor

**Core APIs** (40 endpoints):
- Block management: `POST/GET/PUT/DELETE /hostels/blocks`
- Room management: `POST/GET/PUT/DELETE /hostels/rooms`, occupancy tracking
- Room allocation: `POST /hostels/rooms/:id/allocate`, assign students
- Vacate room: `POST /hostels/rooms/:id/vacate`
- Room transfer: `POST /students/:id/transfer-room`
- Hostel fees: Integration with fee-service
- Maintenance requests: `POST /hostels/maintenance`, track repairs
- Visitor management: `POST /hostels/visitors`, visitor logs, entry/exit
- Hostel attendance: `POST /hostels/attendance`, daily roll call
- Mess management: `POST /hostels/mess/menu`, meal planning
- Inventory: Track hostel assets (furniture, appliances)
- Complaint management: `POST /hostels/complaints`, student grievances

**Events**: ROOM_ALLOCATED, ROOM_VACATED, VISITOR_ENTRY, MAINTENANCE_REQUESTED

---

#### 43. Inventory Service (inventory-service)
**Responsibility**: Inventory management (Module 13 subset - 10 requirements)

**Database Models**: InventoryCategory, InventoryItem, InventoryTransaction, Supplier

**Core APIs** (35 endpoints):
- Category management: `POST/GET/PUT/DELETE /inventory/categories`
- Item management: `POST/GET/PUT/DELETE /inventory/items`
- Stock tracking: `GET /inventory/items/:id/stock`, real-time stock levels
- Stock in: `POST /inventory/transactions/stock-in`, purchase, donation
- Stock out: `POST /inventory/transactions/stock-out`, issue, damage, lost
- Reorder alerts: Automatic low-stock alerts
- Supplier management: `POST/GET /inventory/suppliers`
- Purchase orders: `POST /inventory/purchase-orders`
- Inventory audit: `POST /inventory/audit`, physical verification
- Asset tracking: Barcode/RFID integration
- Lab equipment: Track science lab equipment
- Stationery: Track office/classroom stationery

**Events**: STOCK_LOW, STOCK_IN, STOCK_OUT, REORDER_TRIGGERED

---

#### 44. HR & Payroll Service (hr-payroll-service)
**Responsibility**: HR & payroll (Module 13 subset - 10 requirements)

**Database Models**: PayrollStructure, EmployeeSalary, PayrollAdvance, LeaveBalance, LeaveRequest

**Core APIs** (50 endpoints):
- Employee management: `POST/GET/PUT/DELETE /hr/employees`
- Payroll structure: `POST /hr/payroll-structures`, define salary components
- Salary calculation: `POST /hr/payroll/calculate`, automatic monthly calculation
- Generate payslips: `GET /hr/employees/:id/payslips/:month`
- Leave management: `POST /hr/leave/request`, approval workflow
- Leave balance: `GET /hr/employees/:id/leave-balance`
- Attendance integration: Pull from attendance-service for salary calculation
- Advance requests: `POST /hr/advances/request`
- Tax calculations: TDS deduction, Form 16 generation
- Statutory compliances: PF, ESI, gratuity calculations
- Performance appraisal: `POST /hr/appraisals`, link to salary increments
- Resignation: `POST /hr/employees/:id/resign`, exit workflow

**Events**: PAYROLL_GENERATED, LEAVE_APPROVED, ADVANCE_REQUESTED, EMPLOYEE_JOINED, EMPLOYEE_LEFT

**External Dependencies**:
- attendance-service (attendance data)
- payment-service (salary disbursement)
- notification-service (payslip delivery)

---

#### 45. Event Service (event-service)
**Responsibility**: Events management (Module 13 subset - 9 requirements)

**Database Models**: Event, EventRSVP, EventAttendee

**Core APIs** (30 endpoints):
- Event CRUD: `POST/GET/PUT/DELETE /events`
- Event calendar: `GET /events/calendar`, school-wide calendar
- RSVP: `POST /events/:id/rsvp`, accept/decline invitations
- Event reminders: Automatic notifications before events
- Event check-in: `POST /events/:id/check-in`, track attendance
- Recurring events: Support for recurring events (weekly assemblies)
- Event categories: Academic, sports, cultural, admin
- Event participants: `GET /events/:id/participants`
- Event photos/videos: `POST /events/:id/media`, upload event media
- Public events: Publish events on school website

**Events**: EVENT_CREATED, EVENT_CANCELLED, EVENT_REMINDER, EVENT_STARTED

---

#### 46. Certificate Service (certificate-service)
**Responsibility**: Certificates & ID cards (Module 13 subset)

**Database Models**: CertificateTemplate, Certificate, IDCardTemplate, IDCard

**Core APIs** (30 endpoints):
- Certificate templates: `POST/GET/PUT/DELETE /certificates/templates`
- Generate certificate: `POST /certificates/generate`, auto-populate with student data
- Certificate types: Completion, achievement, participation, transfer certificate
- Digital signatures: Sign certificates digitally
- Certificate verification: `GET /certificates/:id/verify`, QR code verification
- ID card templates: `POST/GET /certificates/id-cards/templates`
- Generate ID card: `POST /certificates/id-cards/generate`
- ID card types: Student, teacher, staff, visitor
- Print: `GET /certificates/:id/print`, `GET /certificates/id-cards/:id/print`
- Bulk generation: `POST /certificates/bulk-generate`

**Events**: CERTIFICATE_GENERATED, ID_CARD_GENERATED

---

#### 47. Disciplinary Service (disciplinary-service)
**Responsibility**: Disciplinary management (Module 13 subset - 10 requirements)

**Database Models**: Incident, DisciplinaryAction, BehaviorLog

**Core APIs** (30 endpoints):
- Incident reporting: `POST /disciplinary/incidents`, report misbehavior
- Incident investigation: `PUT /disciplinary/incidents/:id/investigate`
- Disciplinary actions: `POST /disciplinary/actions`, warnings, suspensions
- Behavior tracking: `POST /students/:id/behavior`, positive/negative points
- Parent notifications: Automatic notifications for serious incidents
- Counseling referrals: Link to counseling-service
- Incident analytics: `GET /disciplinary/analytics`, trends, repeat offenders
- Incident history: `GET /students/:id/disciplinary-history`
- Appeal process: `POST /disciplinary/actions/:id/appeal`

**Events**: INCIDENT_REPORTED, ACTION_TAKEN, PARENT_NOTIFIED

---


### 48-58. Infrastructure & Platform Services (Modules 14, 17)

#### 48. Notification Service (notification-service)
**Responsibility**: Multi-channel notifications (Module 14 - 30 requirements)

**Database Models**: Notification, NotificationDelivery, NotificationTemplate, NotificationPreference

**Core APIs** (40 endpoints):
- Send notification: `POST /notifications/send`, multi-channel (in-app, email, SMS, push, WhatsApp)
- Notification templates: `POST/GET/PUT /notifications/templates`, variable substitution
- User preferences: `GET/PUT /users/:id/notification-preferences`
- Mark as read: `PUT /notifications/:id/read`
- Notification history: `GET /users/:id/notifications`
- Bulk send: `POST /notifications/bulk-send`, send to classes, schools
- Priority levels: Low, medium, high, urgent
- Scheduled notifications: `POST /notifications/schedule`
- Delivery status: `GET /notifications/:id/delivery-status`
- Read receipts: Track notification opens
- Notification analytics: `GET /notifications/analytics`, delivery rates, open rates

**Events**: NOTIFICATION_SENT, NOTIFICATION_DELIVERED, NOTIFICATION_READ, NOTIFICATION_FAILED

**External Dependencies**:
- email-service (email delivery)
- sms-service (SMS delivery)
- push notification providers (FCM, APNS)
- WhatsApp Business API

---

#### 49. Messaging Service (messaging-service)
**Responsibility**: Chat & messaging (Module 14 subset)

**Database Models**: Conversation, Message, MessageParticipant, MessageAttachment, MessageReadReceipt

**Core APIs** (35 endpoints):
- Create conversation: `POST /messaging/conversations`, 1-on-1 or group
- Send message: `POST /messaging/conversations/:id/messages`
- Real-time messaging: WebSocket for instant delivery
- Message attachments: `POST /messaging/messages/:id/attachments`
- Read receipts: Automatic tracking
- Typing indicators: Real-time
- Message search: `GET /messaging/search`
- Message reactions: Emoji reactions
- Pin messages: `POST /messaging/messages/:id/pin`
- Delete messages: `DELETE /messaging/messages/:id`
- Group management: Add/remove participants
- Message encryption: End-to-end encryption for sensitive conversations

**Events**: MESSAGE_SENT, MESSAGE_READ, USER_TYPING

**External Dependencies**:
- storage-service (file attachments)
- user-service (user profiles)

---

#### 50. Email Service (email-service)
**Responsibility**: Email delivery (Module 14 subset, Module 17 subset)

**Database Models**: EmailLog, EmailTemplate

**Core APIs** (25 endpoints):
- Send email: `POST /emails/send`
- Email templates: `GET/POST/PUT /emails/templates`, HTML templates
- Bulk email: `POST /emails/bulk-send`, campaign management
- Email providers: SendGrid, AWS SES, SMTP
- Tracking: Open tracking, click tracking
- Email bounces: Handle bounces, update user status
- Unsubscribe: `POST /emails/unsubscribe`, honor unsubscribe requests
- Email analytics: `GET /emails/analytics`, delivery, open, click rates
- Transactional emails: OTPs, receipts, notifications
- Marketing emails: Newsletters, announcements

**Events**: EMAIL_SENT, EMAIL_DELIVERED, EMAIL_OPENED, EMAIL_BOUNCED

---

#### 51. SMS Service (sms-service)
**Responsibility**: SMS delivery (Module 14 subset)

**Database Models**: SMSLog

**Core APIs** (20 endpoints):
- Send SMS: `POST /sms/send`
- SMS providers: Twilio, MSG91, AWS SNS
- Bulk SMS: `POST /sms/bulk-send`
- OTP SMS: `POST /sms/otp`
- SMS templates: Predefined templates
- SMS delivery status: Webhook handling
- SMS analytics: `GET /sms/analytics`, delivery rates, cost tracking
- International SMS: Support for multiple countries

**Events**: SMS_SENT, SMS_DELIVERED, SMS_FAILED

---

#### 52. Storage Service (storage-service)
**Responsibility**: File storage (Module 17 subset)

**Database Models**: File, FileMetadata

**Core APIs** (30 endpoints):
- Upload file: `POST /storage/upload`, multipart upload
- Download file: `GET /storage/files/:id`
- Generate presigned URL: `GET /storage/files/:id/url`, temporary access
- File types: Documents, images, videos, audio, 3D models
- Storage providers: AWS S3, Azure Blob, Google Cloud Storage, On-premise
- Virus scanning: Automatic scanning on upload
- Compression: Automatic compression for images
- CDN integration: Serve files via CDN for performance
- File versioning: Track file versions
- Delete file: `DELETE /storage/files/:id`, soft delete
- Storage quota: Track and enforce user/organization quotas
- Backup: Automatic replication across regions

**Events**: FILE_UPLOADED, FILE_DELETED, VIRUS_DETECTED

**External Dependencies**:
- AWS S3 / Azure / GCS APIs
- CDN (CloudFront, Akamai)
- Virus scanning (ClamAV)

---

#### 53. Cache Service (cache-service)
**Responsibility**: Distributed caching (Module 17 - subset)

**Database Models**: CacheEntry

**Core APIs** (25 endpoints):
- Get from cache: `GET /cache/:key`
- Set cache: `POST /cache/:key`, with TTL
- Delete cache: `DELETE /cache/:key`
- Invalidate patterns: `DELETE /cache/pattern/:pattern`, bulk invalidation
- Cache statistics: `GET /cache/stats`, hit rates, memory usage
- Cache warming: `POST /cache/warm`, preload frequently accessed data
- Distributed caching: Redis Cluster for scalability
- Multi-layer caching: Application cache + Redis

**Cache Strategy**:
- Session data: 30 min TTL
- User profiles: 15 min TTL
- Content metadata: 1 hour TTL
- Dashboard data: 5 min TTL
- Static content: 24 hour TTL

---

#### 54. Job Scheduler Service (job-scheduler-service)
**Responsibility**: Background jobs (Module 17 - 3 requirements)

**Database Models**: BackgroundJob, JobExecution

**Core APIs** (30 endpoints):
- Schedule job: `POST /jobs/schedule`
- Job types: Email sending, report generation, data processing, backups, cache warming
- Job queue: BullMQ-based queue management
- Job priorities: Low, medium, high, critical
- Retry logic: Exponential backoff
- Job status: `GET /jobs/:id/status`
- Job history: `GET /jobs/history`
- Failed jobs: `GET /jobs/failed`, manual retry
- Job monitoring: `GET /jobs/stats`, queue depth, processing rates
- Cron jobs: Scheduled recurring tasks

**Job Examples**:
- Daily attendance reports
- Weekly digest emails
- Monthly billing runs
- Nightly data backups
- Hourly cache warming
- Certificate generation
- Export large datasets

**Events**: JOB_STARTED, JOB_COMPLETED, JOB_FAILED

**Technology**: BullMQ + Redis

---

#### 55. Workflow Service (workflow-service)
**Responsibility**: Generic workflow engine (cross-cutting concern)

**Database Models**: WorkflowDefinition, WorkflowInstance, Approval, ApprovalHistory

**Core APIs** (35 endpoints):
- Define workflow: `POST /workflows/definitions`, configure approval chains
- Start workflow: `POST /workflows/instances/start`
- Workflow types: Admissions, leave requests, fee waivers, content approval, purchase approvals, expense approvals
- Approval actions: `POST /workflows/instances/:id/approve`, `POST /workflows/instances/:id/reject`
- Multi-level approvals: Sequential or parallel approvals
- Conditional routing: Dynamic approval chains based on conditions (e.g., amount > $1000 needs director approval)
- Workflow status: `GET /workflows/instances/:id/status`
- Approval notifications: Automatic notifications to approvers
- Escalations: Auto-escalate if no action within timeframe
- Workflow analytics: `GET /workflows/analytics`, approval times, bottlenecks
- Workflow templates: Pre-configured templates for common workflows

**Events**: WORKFLOW_STARTED, APPROVAL_PENDING, WORKFLOW_APPROVED, WORKFLOW_REJECTED, WORKFLOW_ESCALATED

**External Dependencies**:
- notification-service (approval notifications)
- all services using workflows

---

#### 56. Integration Service (integration-service)
**Responsibility**: External system integrations (cross-cutting)

**Database Models**: Integration, ExternalMapping, OAuthToken, SyncHistory, SyncFailure

**Core APIs** (50 endpoints):
- Integration configuration: `POST/GET/PUT /integrations/config`
- External systems: UDISE+, Google Classroom, Microsoft Teams, Payment gateways, SMS providers, Email providers, Video conferencing (Zoom, Meet)
- OAuth management: `POST /integrations/oauth/authorize`, token refresh
- External ID mapping: `POST /integrations/mappings`, map internal IDs to external IDs
- Sync data: `POST /integrations/:system/sync`, bidirectional sync
- Sync status: `GET /integrations/sync-history`
- Webhook receivers: `POST /integrations/webhooks/:system`, receive webhooks from external systems
- Sync failures: `GET /integrations/sync-failures`, retry failed syncs
- API rate limiting: Respect external API limits
- Integration analytics: `GET /integrations/analytics`, sync frequency, success rates

**Integrations**:
1. **UDISE+**: Government school data sync
2. **Google Classroom**: Import assignments, grades
3. **Microsoft Teams**: Class sync, calendar integration
4. **Zoom**: Meeting creation, recording retrieval
5. **Google Meet**: Meeting creation
6. **Payment Gateways**: Razorpay, Stripe, PayPal webhooks
7. **SMS Providers**: Twilio, MSG91
8. **Email Providers**: SendGrid, AWS SES
9. **Cloud Storage**: AWS S3, Azure, GCS
10. **NCERT**: Curriculum content sync
11. **Aadhaar**: Identity verification (via DigiLocker)
12. **WhatsApp Business**: Message delivery

**Events**: INTEGRATION_SYNC_STARTED, SYNC_COMPLETED, SYNC_FAILED, WEBHOOK_RECEIVED

---


#### 57. API Gateway Service (api-gateway)
**Responsibility**: API routing, authentication, rate limiting

**Core Features**:
- Route requests to appropriate microservices
- JWT authentication validation
- API key management for external clients
- Rate limiting per user/API key
- Request/response transformation
- Load balancing
- Circuit breaking
- Request logging
- API versioning (v1, v2)
- CORS handling
- WebSocket support for real-time features
- GraphQL federation

**Technology**: Kong / AWS API Gateway / custom Node.js gateway

---

#### 58. Tenant Service (tenant-service)
**Responsibility**: Multi-tenant hierarchy management

**Database Models**: TenantHierarchy, TenantConfiguration

**Core APIs** (25 endpoints):
- Tenant resolution: `GET /tenants/resolve`, resolve tenant from domain/subdomain
- Hierarchy management: `GET /tenants/:id/hierarchy`, full hierarchical path
- Tenant isolation: Ensure data isolation across tenants
- Tenant configuration: `GET/PUT /tenants/:id/config`, tenant-specific settings
- Tenant switching: `POST /users/:id/switch-tenant`, multi-organization users
- Tenant analytics: `GET /tenants/:id/analytics`

**Hierarchy Levels**:
1. Platform (root)
2. Government (National → State → District)
3. Organization (school groups)
4. Branch (physical locations)
5. School
6. Class
7. Section

---

## Event Architecture

### Event Bus Technology
**Primary**: Redis Streams (for moderate scale)
**Alternative**: Apache Kafka (for 50M+ users scale)

### Event Types (50+)

#### Authentication Events
- USER_REGISTERED, USER_LOGGED_IN, USER_LOGGED_OUT
- MFA_ENABLED, PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED
- SUSPICIOUS_LOGIN_DETECTED, SESSION_EXPIRED

#### Academic Events
- STUDENT_ENROLLED, STUDENT_PROMOTED, STUDENT_TRANSFERRED
- TEACHER_ASSIGNED, CLASS_CREATED, SECTION_FULL
- TIMETABLE_GENERATED, SUBSTITUTION_CREATED

#### Attendance Events
- ATTENDANCE_MARKED, ABSENCE_DETECTED, LEAVE_APPROVED
- LOW_ATTENDANCE_ALERT, DEFAULTER_IDENTIFIED

#### Content Events
- CONTENT_UPLOADED, CONTENT_PUBLISHED, CONTENT_UPDATED
- CONTENT_VIEWED, CONTENT_RATED, CONTENT_COMPLETED
- AR_MARKER_SCANNED, VR_SESSION_STARTED

#### Assessment Events
- ASSIGNMENT_CREATED, ASSIGNMENT_SUBMITTED, ASSIGNMENT_GRADED
- EXAM_CREATED, EXAM_STARTED, EXAM_COMPLETED, RESULTS_PUBLISHED

#### Live Class Events
- CLASS_SCHEDULED, CLASS_STARTED, CLASS_ENDED
- PARTICIPANT_JOINED, RECORDING_STARTED, BREAKOUT_ROOMS_CREATED

#### Commerce Events
- SUBSCRIPTION_CREATED, SUBSCRIPTION_RENEWED, SUBSCRIPTION_CANCELLED
- PAYMENT_INITIATED, PAYMENT_SUCCESS, PAYMENT_FAILED
- LICENSE_ASSIGNED, LICENSE_REVOKED, FEE_PAYMENT_RECEIVED

#### Marketplace Events
- PRODUCT_LISTED, PRODUCT_PURCHASED, REVIEW_SUBMITTED
- PAYOUT_PROCESSED, REVENUE_SPLIT_CALCULATED

#### Analytics Events
- ANALYTICS_REPORT_GENERATED, WEAK_AREA_DETECTED
- PREDICTION_MADE, DASHBOARD_UPDATED

#### System Events
- JOB_STARTED, JOB_COMPLETED, JOB_FAILED
- INTEGRATION_SYNC_STARTED, SYNC_COMPLETED, WEBHOOK_RECEIVED
- WORKFLOW_STARTED, APPROVAL_PENDING, WORKFLOW_APPROVED

### Event Schema Standard

```json
{
  "eventId": "uuid",
  "eventType": "STUDENT_ENROLLED",
  "timestamp": "ISO8601",
  "tenantId": "uuid",
  "organizationId": "uuid",
  "userId": "uuid",
  "payload": {
    "studentId": "uuid",
    "schoolId": "uuid",
    "classId": "uuid",
    "enrollmentDate": "YYYY-MM-DD"
  },
  "metadata": {
    "source": "student-service",
    "version": "1.0",
    "correlationId": "uuid"
  }
}
```

### Event Processing Patterns

1. **Event Sourcing**: Selected services use event sourcing for complete audit trails
2. **CQRS**: Read models updated via events from write models
3. **Saga Pattern**: Long-running transactions coordinated via events (e.g., student enrollment = create student + assign to class + generate ID card)
4. **Event Replay**: Ability to replay events for debugging, rebuilding read models

### Event Storage
- **Primary**: Redis Streams (append-only log)
- **Archival**: PostgreSQL event_store table for long-term storage
- **Retention**: 30 days in Redis, permanent in PostgreSQL

---

## Data Architecture

### Database Strategy

**Pattern**: Database per service

**Technology Stack**:
- **Primary Database**: PostgreSQL 15+
- **Caching**: Redis 7+
- **Search**: Elasticsearch 8+
- **Time-series**: TimescaleDB (for GPS logs, metrics)
- **Document Store**: MongoDB (for flexible schemas like AR/VR metadata)

### Database Distribution (268 Models across services)

**Auth Service** (12 models): User, UserAuthentication, UserSession, Role, Permission, etc.

**User Service** (12 models): UserProfile, StudentProfile, TeacherProfile, ParentProfile, etc.

**Academic Services** (40 models): School, Class, Section, Subject, Chapter, Topic, Attendance, Timetable, etc.

**Content Services** (35 models): Content, Media, ARMarker, VRContent, 3DModel, Assignment, Exam, Question, etc.

**Commerce Services** (30 models): Subscription, License, Payment, Invoice, Fee, MarketplaceProduct, etc.

**Analytics Services** (25 models): StudentAnalytics, Report, Dashboard, AIRecommendation, SearchIndex, etc.

**ERP Services** (45 models): Library, Transport, Hostel, Inventory, Payroll, Event, Certificate, etc.

**Infrastructure Services** (35 models): Notification, Message, Email, SMS, File, BackgroundJob, Workflow, Integration, etc.

**Shared Services** (34 models): Organization, Tenant, Audit, Error, SystemMetric, etc.

### Data Synchronization

1. **Real-time Replication**: For reporting database (read replicas)
2. **Event-Driven Sync**: Services update local caches via events
3. **ETL Pipelines**: Nightly ETL jobs for data warehouse
4. **CDC (Change Data Capture)**: Debezium for real-time data pipelines

### Data Warehouse

**Purpose**: Centralized analytics, government reporting

**Technology**: PostgreSQL with columnar store (cstore_fdw) or AWS Redshift

**ETL Frequency**: Nightly for most data, real-time for critical metrics

**Schema**: Star schema with fact and dimension tables

---


## API Gateway and Routing

### Routing Strategy

**Gateway Technology**: Kong API Gateway / AWS API Gateway

**Route Examples**:
```
/api/v1/auth/*          → auth-service
/api/v1/users/*         → user-service
/api/v1/organizations/* → organization-service
/api/v1/schools/*       → school-service
/api/v1/students/*      → student-service
/api/v1/teachers/*      → teacher-service
/api/v1/content/*       → content-service
/api/v1/media/*         → media-service
/api/v1/ar-vr/*         → ar-vr-service
/api/v1/live-classes/*  → live-class-service
/api/v1/assignments/*   → assignment-service
/api/v1/exams/*         → assessment-service
/api/v1/subscriptions/* → subscription-service
/api/v1/payments/*      → payment-service
/api/v1/marketplace/*   → marketplace-service
/api/v1/analytics/*     → analytics-service
/api/v1/search/*        → search-service
/api/v1/library/*       → library-service
/api/v1/transport/*     → transport-service
/api/v1/notifications/* → notification-service
/api/v1/messaging/*     → messaging-service
```

### Authentication Flow

1. Client sends request to API Gateway with JWT token
2. Gateway validates JWT signature
3. Gateway extracts user ID and tenant ID from token
4. Gateway adds headers: `X-User-Id`, `X-Tenant-Id`, `X-Organization-Id`
5. Gateway routes request to appropriate service
6. Service uses headers for authorization and data filtering

### Rate Limiting

**Limits by User Type**:
- Free tier: 100 requests/hour
- Basic tier: 1,000 requests/hour
- Premium tier: 10,000 requests/hour
- School tier: 50,000 requests/hour
- Enterprise tier: Unlimited

**Limits by API**:
- Read operations: Higher limits
- Write operations: Lower limits
- Search API: Medium limits
- Public APIs: Strict limits

---

## Deployment Architecture

### Containerization

**Container Platform**: Docker + Kubernetes

**Service Deployment**:
- Each microservice: Separate Docker container
- Horizontal scaling: Kubernetes HPA (Horizontal Pod Autoscaler)
- Auto-scaling based on: CPU, memory, request rate
- Health checks: Liveness and readiness probes
- Resource limits: CPU/memory per container

### Kubernetes Architecture

**Cluster Structure**:
- **Production Cluster**: Multi-region, multi-AZ
- **Staging Cluster**: Single region
- **Development Cluster**: Local (Minikube/Kind)

**Namespace Strategy**:
- `auth`: Authentication services
- `academic`: Academic domain services
- `content`: Content and learning services
- `commerce`: Subscription, payment, marketplace
- `analytics`: Analytics and reporting
- `erp`: ERP and operations services
- `infra`: Infrastructure services (cache, storage, jobs)
- `monitoring`: Monitoring and observability stack

### Load Balancing

**Ingress Controller**: NGINX Ingress Controller / AWS ALB

**Load Balancing Strategy**:
- Round-robin for stateless services
- Session affinity for stateful services (e.g., live classes)
- Geographic routing for multi-region

### Service Mesh (Optional for Scale)

**Technology**: Istio

**Benefits**:
- Service-to-service authentication (mTLS)
- Traffic management (canary deployments, A/B testing)
- Observability (distributed tracing)
- Fault injection and resilience testing

---

### Scaling Strategy

**Horizontal Scaling** (by service):

**High Traffic Services** (10+ replicas in production):
- api-gateway
- content-service
- search-service
- notification-service

**Medium Traffic Services** (3-5 replicas):
- auth-service
- user-service
- student-service
- assignment-service
- assessment-service
- analytics-service

**Low Traffic Services** (1-2 replicas):
- library-service
- hostel-service
- certificate-service
- payout-service

**Background Services** (2-3 replicas):
- job-scheduler-service
- integration-service
- workflow-service

### Database Scaling

**Read Replicas**:
- Primary for writes
- 2-3 read replicas for read-heavy services

**Connection Pooling**:
- PgBouncer for PostgreSQL connection pooling
- Max connections per service: 20-50

**Partitioning**:
- Attendance table: Partition by date (monthly)
- AuditLog table: Partition by timestamp (monthly)
- NotificationDelivery: Partition by createdAt (monthly)

**Sharding** (if needed at extreme scale):
- Shard by tenantId for complete tenant data isolation
- Separate databases per large organization

---

### High Availability

**Multi-Region Deployment**:
- Primary region: Asia-Pacific (Mumbai)
- Secondary region: Asia-Pacific (Singapore)
- Tertiary region: US East (optional for international users)

**Replication**:
- Database: Synchronous replication within region, asynchronous across regions
- Redis: Redis Sentinel for HA, Redis Cluster for partitioning
- Elasticsearch: 3-node cluster per region

**Disaster Recovery**:
- RPO (Recovery Point Objective): 1 hour
- RTO (Recovery Time Objective): 4 hours
- Automated backups: Hourly incremental, daily full
- Backup retention: 30 days hot, 1 year cold storage

---

### Monitoring and Observability

**Metrics** (Prometheus + Grafana):
- Service health: Uptime, response time, error rate
- Infrastructure: CPU, memory, disk, network
- Business metrics: Active users, content uploads, exam submissions
- Database: Query performance, connection pool usage
- Cache: Hit rates, memory usage

**Logging** (ELK Stack: Elasticsearch, Logstash, Kibana):
- Centralized logging from all services
- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Correlation IDs for request tracing
- Log retention: 30 days in hot storage, 1 year in cold

**Tracing** (Jaeger / Zipkin):
- Distributed tracing across services
- Trace every user request
- Performance bottleneck identification
- Service dependency mapping

**Alerting** (Prometheus Alertmanager + PagerDuty):
- Critical alerts: Service down, database unreachable
- Warning alerts: High error rate, slow response time
- Business alerts: Payment failures spike, exam submission errors

---

### Security Architecture

**Network Security**:
- VPC with private subnets for services
- Public subnets only for load balancers
- Security groups restrict traffic between services
- Network policies in Kubernetes

**Authentication & Authorization**:
- JWT tokens for user authentication
- API keys for external integrations
- Service-to-service: mTLS (if using Istio)
- RBAC for all API endpoints

**Data Security**:
- Encryption at rest: Database, file storage
- Encryption in transit: TLS 1.3 for all APIs
- Sensitive data: Application-level encryption (Aadhaar, bank accounts)
- Secrets management: AWS Secrets Manager / HashiCorp Vault

**Compliance**:
- GDPR compliance for EU users
- Data residency requirements met
- Audit logs for all data access
- Right to erasure support

---

## Service Dependencies

### Dependency Graph

**Core Dependencies** (used by most services):
- auth-service → All services (authentication)
- tenant-service → All services (multi-tenancy)
- notification-service → Most services (notifications)
- storage-service → Many services (file uploads)
- cache-service → Most services (performance)

**Domain Dependencies**:

**Academic Flow**:
```
student-service → user-service → auth-service
student-service → class-service → school-service
student-service → attendance-service
student-service → fee-service → payment-service
```

**Learning Flow**:
```
assignment-service → content-service → media-service
assignment-service → student-service
assignment-service → grading-service → notification-service
```

**Assessment Flow**:
```
assessment-service → question-bank-service
assessment-service → student-service
assessment-service → grading-service
assessment-service → analytics-service
```

**Commerce Flow**:
```
subscription-service → payment-service → billing-service
license-service → subscription-service
marketplace-service → payment-service → payout-service
```

**Analytics Flow**:
```
analytics-service → All domain services (data aggregation)
dashboard-service → analytics-service → cache-service
reporting-service → analytics-service
```

### Circuit Breakers

**Pattern**: Hystrix / Resilience4j

**Configuration**:
- Failure threshold: 50% errors in 10 seconds
- Open state duration: 30 seconds
- Half-open state: Allow 3 test requests

**Fallback Strategies**:
- Return cached data
- Return default/empty response
- Degrade gracefully (e.g., show partial data)
- Queue request for later processing

---


## Technology Stack Summary

### Backend Services
- **Language**: Node.js (TypeScript)
- **Framework**: NestJS (enterprise-grade microservices framework)
- **ORM**: Prisma (type-safe database access)
- **API Style**: REST + GraphQL Federation
- **Validation**: class-validator, class-transformer

### Databases
- **Primary**: PostgreSQL 15+ (JSONB support, full-text search)
- **Caching**: Redis 7+ (in-memory data store)
- **Search**: Elasticsearch 8+ (full-text search, analytics)
- **Time-Series**: TimescaleDB (GPS tracking, metrics)
- **Document**: MongoDB (flexible schemas for AR/VR metadata)

### Message Queue & Events
- **Job Queue**: BullMQ (Redis-based job queue)
- **Event Bus**: Redis Streams (moderate scale) / Apache Kafka (extreme scale)
- **Real-time**: Socket.io (WebSocket for live features)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Service Mesh**: Istio (optional)
- **API Gateway**: Kong / AWS API Gateway
- **Load Balancer**: NGINX / AWS ALB

### Storage
- **Object Storage**: AWS S3 / Azure Blob / Google Cloud Storage
- **CDN**: CloudFront / Akamai
- **File System**: On-premise NFS (optional)

### External Services
- **Payment Gateways**: Razorpay, Stripe, PayPal
- **Video Conferencing**: Zoom SDK, Google Meet API
- **SMS**: Twilio, MSG91
- **Email**: SendGrid, AWS SES
- **Maps**: Google Maps, MapBox
- **Push Notifications**: Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNS)

### Monitoring & Observability
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger / Zipkin
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot / Pingdom
- **Alerting**: Prometheus Alertmanager + PagerDuty

### AI/ML Stack
- **ML Framework**: TensorFlow / PyTorch
- **NLP**: OpenAI GPT API / Custom models
- **Vector Database**: pgvector (PostgreSQL extension)
- **ML Ops**: MLflow (model tracking)

### Development Tools
- **Version Control**: Git + GitHub/GitLab
- **CI/CD**: GitHub Actions / GitLab CI / Jenkins
- **Code Quality**: ESLint, Prettier, SonarQube
- **Testing**: Jest (unit), Supertest (integration), Playwright (E2E)
- **Documentation**: Swagger/OpenAPI, Postman
- **API Testing**: Postman, k6 (load testing)

---

## Development Guidelines

### Service Development Template

**Structure**:
```
service-name/
├── src/
│   ├── modules/
│   │   ├── entity/
│   │   │   ├── entity.controller.ts
│   │   │   ├── entity.service.ts
│   │   │   ├── entity.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-entity.dto.ts
│   │   │   │   ├── update-entity.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── entity.entity.ts (Prisma model)
│   ├── common/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── decorators/
│   ├── config/
│   ├── database/
│   ├── events/
│   ├── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
├── test/
├── Dockerfile
├── package.json
├── tsconfig.json
```

### API Design Standards

**RESTful Conventions**:
- GET: Read resources
- POST: Create resources
- PUT: Update entire resource
- PATCH: Partial update
- DELETE: Delete resource

**URL Structure**:
- Resource naming: Plural nouns (`/students`, `/assignments`)
- Nested resources: `/classes/:classId/sections`
- Filtering: Query parameters (`?status=active&class=10`)
- Pagination: `?page=1&limit=20` or cursor-based
- Sorting: `?sort=createdAt:desc`

**Response Format**:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "metadata": {
    "timestamp": "ISO8601",
    "requestId": "uuid"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "metadata": {
    "timestamp": "ISO8601",
    "requestId": "uuid"
  }
}
```

### Multi-Tenancy Implementation

**Tenant Resolution**:
1. Extract tenant from subdomain: `school1.edubharti.com`
2. Extract from custom domain: `school.com` → lookup in database
3. Extract from JWT token: `tenantId` claim
4. Extract from header: `X-Tenant-Id`

**Data Isolation**:
- Every query must filter by `tenantId`
- Prisma middleware to auto-inject tenant filter
- Row-level security in PostgreSQL (optional)

**Example Middleware**:
```typescript
prisma.$use(async (params, next) => {
  const tenantId = getCurrentTenant();
  if (params.model && params.action !== 'findMany') {
    params.args.where = { ...params.args.where, tenantId };
  }
  return next(params);
});
```

### Event Publishing

**Event Publisher**:
```typescript
await eventBus.publish({
  eventType: 'STUDENT_ENROLLED',
  tenantId: student.tenantId,
  payload: {
    studentId: student.id,
    schoolId: student.schoolId,
    classId: student.classId
  }
});
```

**Event Subscriber**:
```typescript
eventBus.subscribe('STUDENT_ENROLLED', async (event) => {
  // Handle event
  await sendWelcomeEmail(event.payload.studentId);
});
```

### Testing Strategy

**Unit Tests**:
- Test services in isolation
- Mock dependencies
- Coverage target: 80%

**Integration Tests**:
- Test API endpoints
- Use test database
- Test with real database queries

**E2E Tests**:
- Test critical user flows
- Use staging environment
- Automated in CI/CD

**Load Tests**:
- Use k6 for load testing
- Test critical endpoints
- Target: 1000 concurrent users

---

## Implementation Roadmap

### Phase 1: Core Platform (Months 1-3)
**Services**:
1. auth-service
2. user-service
3. organization-service
4. tenant-service
5. notification-service
6. storage-service
7. api-gateway

**Deliverables**:
- User registration, login, multi-factor authentication
- Organization onboarding, white-label configuration
- Basic notifications (email, SMS)
- File upload and storage

---

### Phase 2: Academic Foundation (Months 4-6)
**Services**:
8. academic-service
9. school-service
10. student-service
11. teacher-service
12. class-service
13. subject-service
14. timetable-service
15. attendance-service

**Deliverables**:
- School setup and configuration
- Student enrollment and profiles
- Teacher assignments
- Class and section management
- Timetable generation
- Attendance tracking (manual, biometric)

---

### Phase 3: Learning & Content (Months 7-10)
**Services**:
16. content-service
17. media-service
18. assignment-service
19. assessment-service
20. grading-service
21. question-bank-service
22. ar-vr-service
23. 3d-model-service
24. live-class-service
25. recording-service

**Deliverables**:
- Content upload and management
- Video streaming
- Assignment creation and submission
- Exam creation and execution
- AR/VR content integration
- Live video classes (Zoom, Meet)
- Metaverse classrooms

---

### Phase 4: Commerce & Marketplace (Months 11-13)
**Services**:
26. subscription-service
27. license-service
28. payment-service
29. billing-service
30. fee-service
31. marketplace-service
32. payout-service
33. pricing-service

**Deliverables**:
- Subscription management (7 tiers)
- Payment processing (Razorpay, Stripe, PayPal)
- School fee management
- Marketplace for publishers/creators
- Automated payouts

---

### Phase 5: Analytics & Intelligence (Months 14-16)
**Services**:
34. analytics-service
35. reporting-service
36. dashboard-service
37. ai-recommendation-service
38. chatbot-service
39. search-service

**Deliverables**:
- Student, teacher, school analytics
- Government dashboards (district, state, national)
- AI-powered recommendations
- Chatbot for student support
- Advanced search and discovery

---

### Phase 6: ERP & Operations (Months 17-20)
**Services**:
40. library-service
41. transport-service
42. hostel-service
43. inventory-service
44. hr-payroll-service
45. event-service
46. certificate-service
47. disciplinary-service
48. counseling-service
49. scholarship-service

**Deliverables**:
- Complete ERP suite
- Library management
- Transport tracking with GPS
- Hostel management
- HR and payroll
- Certificate and ID card generation

---

### Phase 7: Infrastructure & Scale (Months 21-24)
**Services**:
50. messaging-service
51. email-service
52. sms-service
53. cache-service
54. job-scheduler-service
55. workflow-service
56. integration-service
57. gamification-service
58. learning-path-service

**Deliverables**:
- Real-time messaging
- Workflow automation
- External integrations (UDISE+, Google Classroom, etc.)
- Gamification (badges, leaderboards)
- Performance optimization
- Scale to 50M+ users

---

## Summary

### Architecture Highlights

✅ **58 Microservices** covering all 880 requirements
✅ **800+ API Endpoints** across all domains
✅ **268 Database Models** distributed across services
✅ **50+ Event Types** for event-driven architecture
✅ **15+ External Integrations** (payment, video, messaging, etc.)
✅ **Multi-Tenant** hierarchy (Platform → Government → Organization → School)
✅ **Horizontally Scalable** for 50M+ users
✅ **High Availability** with multi-region deployment
✅ **Comprehensive Monitoring** and observability
✅ **Security-First** design with encryption, RBAC, audit logs

### Key Differentiators

1. **Complete Government Integration**: UDISE+ sync, multi-level government dashboards
2. **AR/VR Learning**: Unique AR marker system, VR labs, 3D models
3. **Metaverse Classrooms**: Babylon.js-based virtual classrooms with spatial audio
4. **AI-Powered**: Recommendations, chatbot, predictive analytics, weak area detection
5. **Comprehensive ERP**: Library, transport, hostel, HR, payroll, inventory
6. **Multi-Tenant SaaS**: White-label, custom domains, organizational hierarchies
7. **Marketplace**: Publisher/creator ecosystem with revenue sharing
8. **Event-Driven**: Loose coupling, scalability, auditability

### Next Steps

1. **Infrastructure Setup**: Set up Kubernetes clusters, databases, message queues
2. **Service Development**: Start with Phase 1 core services
3. **API Documentation**: Generate OpenAPI specs for all services
4. **Testing**: Set up comprehensive testing pipeline
5. **CI/CD**: Automate deployment pipeline
6. **Monitoring**: Set up observability stack
7. **Security Audit**: Third-party security assessment
8. **Performance Testing**: Load testing for scale validation
9. **Documentation**: Developer documentation, API guides, deployment guides
10. **Training**: Team training on microservices, Kubernetes, Prisma, NestJS

---

**Document Version**: 2.0.0  
**Last Updated**: 2026-07-09  
**Status**: Ready for Implementation

---

