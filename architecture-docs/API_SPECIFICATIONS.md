# Edubharti Platform - API Specifications

## 📋 Overview

**Architecture**: Microservices  
**API Style**: REST + GraphQL (for complex queries)  
**Authentication**: JWT (Access Token + Refresh Token)  
**Documentation**: OpenAPI 3.0 (Swagger auto-generated)  
**Base URL**: `https://api.edubharti.com/v1`

---

## 🔐 Authentication & Authorization

### **Authentication Flow**

```
POST /auth/login
POST /auth/register
POST /auth/refresh-token
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
POST /auth/verify-phone
POST /auth/enable-2fa
POST /auth/verify-2fa
POST /auth/sso/google
POST /auth/sso/microsoft
POST /auth/sso/aadhaar
```

### **Session Management**

```
GET  /auth/sessions           # List all active sessions
DELETE /auth/sessions/:id     # Revoke specific session
DELETE /auth/sessions/all     # Revoke all sessions
```

---

## 👥 User Management Service

### **User CRUD**

```
GET    /users                 # List users (with filters)
GET    /users/:id             # Get user by ID
POST   /users                 # Create user
PUT    /users/:id             # Update user
DELETE /users/:id             # Soft delete user
PATCH  /users/:id/status      # Change user status
```

### **Role Management**

```
GET    /roles                 # List all roles
GET    /roles/:id             # Get role details
POST   /roles                 # Create custom role (B2B)
PUT    /roles/:id             # Update role
DELETE /roles/:id             # Delete custom role

POST   /roles/:id/permissions # Assign permissions to role
GET    /users/:id/roles       # Get user roles
POST   /users/:id/roles       # Assign role to user
DELETE /users/:id/roles/:roleId # Remove role from user
```

### **Profile Management**

```
GET    /profile               # Get own profile
PUT    /profile               # Update own profile
POST   /profile/avatar        # Upload profile picture

# Student Profile
GET    /students/:id
PUT    /students/:id
GET    /students/:id/parents  # Get linked parents

# Teacher Profile
GET    /teachers/:id
PUT    /teachers/:id
GET    /teachers/:id/classes  # Get assigned classes

# Parent Profile
GET    /parents/:id
PUT    /parents/:id
GET    /parents/:id/children  # Get linked children
POST   /parents/:id/children  # Link child
DELETE /parents/:id/children/:studentId # Unlink child
```

---

## 🏫 Organization Service

```
GET    /organizations                    # List all orgs
GET    /organizations/:id                # Get org details
POST   /organizations                    # Create organization
PUT    /organizations/:id                # Update org
DELETE /organizations/:id                # Delete org

GET    /organizations/:id/hierarchy      # Get org tree
GET    /organizations/:id/users          # List org users
POST   /organizations/:id/users          # Add user to org
DELETE /organizations/:id/users/:userId  # Remove user

# White-label Configuration
GET    /organizations/:id/branding
PUT    /organizations/:id/branding
```

---

## 🎓 School & Academic Service

### **School Management**

```
GET    /schools                 # List schools
GET    /schools/:id             # Get school details
POST   /schools                 # Create school
PUT    /schools/:id             # Update school
DELETE /schools/:id             # Delete school

GET    /schools/:id/students    # List students
GET    /schools/:id/teachers    # List teachers
GET    /schools/:id/classes     # List classes
```

### **Academic Year & Classes**

```
GET    /academic-years                      # List academic years
POST   /academic-years                      # Create academic year
GET    /academic-years/:id/classes          # Get classes in year

GET    /classes                             # List classes
GET    /classes/:id                         # Get class details
POST   /classes                             # Create class
PUT    /classes/:id                         # Update class
DELETE /classes/:id                         # Delete class

GET    /classes/:id/students                # Get class students
POST   /classes/:id/students                # Enroll student
DELETE /classes/:id/students/:studentId     # Unenroll student

GET    /classes/:id/subjects                # Get class subjects
POST   /classes/:id/subjects                # Add subject to class
```

### **Subjects & Curriculum**

```
GET    /subjects                # List all subjects
GET    /subjects/:id            # Get subject details
POST   /subjects                # Create subject
PUT    /subjects/:id            # Update subject

GET    /subjects/:id/chapters   # Get chapters
POST   /subjects/:id/chapters   # Create chapter

GET    /chapters/:id/topics     # Get topics
POST   /chapters/:id/topics     # Create topic

GET    /topics/:id/subtopics    # Get subtopics
POST   /topics/:id/subtopics    # Create subtopic
```

---

## 📚 Content Service

### **Content Discovery**

```
GET    /contents                        # Search & filter content
GET    /contents/:id                    # Get content details
GET    /contents/:id/access-check       # Check user access
GET    /contents/recommendations        # AI-based recommendations
GET    /contents/trending               # Trending content
GET    /contents/featured               # Featured content
```

### **Content Management (Creator/Publisher)**

```
POST   /contents                        # Create content
PUT    /contents/:id                    # Update content
DELETE /contents/:id                    # Delete content
POST   /contents/:id/publish            # Publish content
POST   /contents/:id/archive            # Archive content

# Version Control
GET    /contents/:id/versions           # Get version history
POST   /contents/:id/versions           # Create new version
POST   /contents/:id/lock               # Lock version
POST   /contents/:id/unlock             # Unlock version

# Upload & Processing
POST   /contents/upload/presigned-url   # Get S3 presigned URL
POST   /contents/:id/assets             # Add AR/VR asset
GET    /contents/:id/processing-status  # Check processing status
```

### **Content Reviews**

```
GET    /contents/:id/reviews            # Get reviews
POST   /contents/:id/reviews            # Add review
PUT    /reviews/:id                     # Update review
DELETE /reviews/:id                     # Delete review
```

### **AR/VR Specific**

```
# AR Markers
GET    /ar/markers                      # List markers
GET    /ar/markers/:code                # Get marker by code
POST   /ar/markers                      # Create marker
PUT    /ar/markers/:id                  # Update marker
GET    /ar/markers/:id/contents         # Get linked AR contents

# VR Labs
GET    /vr/experiments                  # List VR experiments
GET    /vr/experiments/:id              # Get experiment details
POST   /vr/sessions                     # Log VR session
GET    /vr/sessions/:id                 # Get session details
```

---

## 💳 Subscription Service

### **Subscription Management**

```
GET    /subscriptions                   # List subscriptions
GET    /subscriptions/:id               # Get subscription details
POST   /subscriptions                   # Create subscription
PUT    /subscriptions/:id               # Update subscription
POST   /subscriptions/:id/cancel        # Cancel subscription
POST   /subscriptions/:id/renew         # Renew subscription

GET    /subscriptions/:id/contents      # Get entitled content
GET    /subscriptions/plans             # List available plans
```

### **License Management (B2B)**

```
GET    /licenses                        # List licenses
GET    /licenses/:id                    # Get license details
POST   /licenses                        # Create license pool
PUT    /licenses/:id                    # Update license

GET    /licenses/:id/assignments        # Get assignments
POST   /licenses/:id/assign             # Assign license to user
DELETE /licenses/:id/assignments/:userId # Revoke license
```

---

## 💰 Payment Service

```
POST   /payments/initiate               # Initiate payment
GET    /payments/:id                    # Get payment status
POST   /payments/:id/verify             # Verify payment
POST   /payments/:id/refund             # Refund payment

GET    /payments/invoices               # List invoices
GET    /payments/invoices/:id           # Download invoice

# Marketplace
POST   /marketplace/purchase            # Direct content purchase
GET    /marketplace/my-purchases        # User purchases

# Payouts (Creator/Publisher)
GET    /payouts                         # List payouts
POST   /payouts/request                 # Request payout
GET    /payouts/:id                     # Get payout status
```

---

## 📝 Assessment Service

### **Question Bank**

```
GET    /questions                       # Search questions
GET    /questions/:id                   # Get question details
POST   /questions                       # Create question
PUT    /questions/:id                   # Update question
DELETE /questions/:id                   # Delete question
POST   /questions/bulk-import           # Bulk import (CSV/Excel)
```

### **Exam Management**

```
GET    /exams                           # List exams
GET    /exams/:id                       # Get exam details
POST   /exams                           # Create exam
PUT    /exams/:id                       # Update exam
DELETE /exams/:id                       # Delete exam
POST   /exams/:id/publish               # Publish exam

# Exam Assignment
POST   /exams/:id/assign                # Assign to students/groups
GET    /exams/:id/assignments           # Get assignments

# Blueprint-based Generation
POST   /exams/generate                  # Auto-generate exam paper
```

### **Exam Attempts**

```
POST   /exams/:id/start                 # Start exam attempt
POST   /exams/:id/submit                # Submit exam
GET    /exams/:id/attempts              # Get all attempts
GET    /attempts/:id                    # Get attempt details
GET    /attempts/:id/answers            # Get submitted answers
POST   /attempts/:id/grade              # Manual grading

# Rankings
GET    /exams/:id/rankings              # Get exam rankings
GET    /exams/:id/rankings/:scope       # Get scope-specific ranking
```

---

## 📋 Assignment Service

```
GET    /assignments                     # List assignments
GET    /assignments/:id                 # Get assignment details
POST   /assignments                     # Create assignment
PUT    /assignments/:id                 # Update assignment
DELETE /assignments/:id                 # Delete assignment
POST   /assignments/:id/publish         # Publish assignment

# Submissions
POST   /assignments/:id/submit          # Submit assignment
GET    /assignments/:id/submissions     # Get all submissions
GET    /submissions/:id                 # Get submission details
POST   /submissions/:id/grade           # Grade submission
```

---

## 🎥 Live Class Service

```
GET    /live-classes                    # List classes
GET    /live-classes/:id                # Get class details
POST   /live-classes                    # Schedule class
PUT    /live-classes/:id                # Update class
DELETE /live-classes/:id                # Cancel class

POST   /live-classes/:id/start          # Start class
POST   /live-classes/:id/end            # End class

# Participants
POST   /live-classes/:id/join           # Join class
POST   /live-classes/:id/leave          # Leave class
GET    /live-classes/:id/participants   # Get participants
POST   /live-classes/:id/remove/:userId # Remove participant

# Controls
POST   /live-classes/:id/mute/:userId   # Mute participant
POST   /live-classes/:id/unmute/:userId # Unmute participant

# Recordings
GET    /live-classes/:id/recordings     # Get recordings
POST   /recordings/:id/download         # Download recording
```

---

## 📊 Analytics Service

### **Learning Analytics**

```
GET    /analytics/progress/:studentId   # Student progress
GET    /analytics/usage/:studentId      # Usage statistics
GET    /analytics/performance/:studentId # Performance metrics
GET    /analytics/weak-areas/:studentId # Weak area detection
GET    /analytics/recommendations/:studentId # Content recommendations

# Teacher Analytics
GET    /analytics/class/:classId        # Class performance
GET    /analytics/teacher/:teacherId    # Teacher metrics

# School Analytics
GET    /analytics/school/:schoolId      # School dashboard
GET    /analytics/attendance/:schoolId  # Attendance trends

# Government Dashboards
GET    /analytics/district/:districtId  # District analytics
GET    /analytics/state/:stateId        # State analytics
GET    /analytics/national              # National analytics
```

### **Rankings**

```
GET    /rankings/student/:studentId/:scope # Get student rank
GET    /rankings/exam/:examId/:scope    # Exam leaderboard
GET    /rankings/global                 # Global rankings
```

---

## 🏫 ERP Service

### **Attendance**

```
GET    /attendance                      # Query attendance
POST   /attendance/mark                 # Mark attendance
PUT    /attendance/:id                  # Update attendance
POST   /attendance/bulk-mark            # Bulk mark attendance

# Correction Requests
POST   /attendance/:id/request-correction
GET    /attendance/corrections          # List pending corrections
POST   /attendance/corrections/:id/approve
POST   /attendance/corrections/:id/reject

# Teacher Attendance
GET    /attendance/teachers             # Teacher attendance
POST   /attendance/teachers/mark        # Mark teacher attendance
```

### **Timetable**

```
GET    /timetables                      # Get timetables
POST   /timetables                      # Create timetable
PUT    /timetables/:id                  # Update timetable
DELETE /timetables/:id                  # Delete timetable

# Conflict Detection
POST   /timetables/validate             # Check for conflicts

# Substitution
POST   /timetables/:id/substitute       # Create substitution
```

### **Fee Management**

```
GET    /fees/structures                 # List fee structures
POST   /fees/structures                 # Create fee structure
PUT    /fees/structures/:id             # Update fee structure

GET    /fees/records/:studentId         # Student fee records
POST   /fees/records                    # Create fee record
PUT    /fees/records/:id                # Update fee record

POST   /fees/payments                   # Record payment
GET    /fees/payments/:id               # Get payment details
GET    /fees/invoices/:id               # Download invoice

# Reports
GET    /fees/reports/pending            # Pending fees report
GET    /fees/reports/collection         # Collection report
```

### **Library**

```
GET    /library/books                   # List books
POST   /library/books                   # Add book
PUT    /library/books/:id               # Update book
DELETE /library/books/:id               # Delete book

POST   /library/issue                   # Issue book
POST   /library/return                  # Return book
GET    /library/issues/:studentId       # Student's issued books
GET    /library/overdue                 # Overdue books
```

### **Transport**

```
GET    /transport/routes                # List routes
POST   /transport/routes                # Create route
PUT    /transport/routes/:id            # Update route
DELETE /transport/routes/:id            # Delete route

GET    /transport/routes/:id/stops      # Get stops
POST   /transport/routes/:id/stops      # Add stop

POST   /transport/assign                # Assign student to route
DELETE /transport/assign/:studentId     # Unassign student
```

### **Hostel**

```
GET    /hostel/blocks                   # List blocks
POST   /hostel/blocks                   # Create block
GET    /hostel/blocks/:id/rooms         # Get rooms
POST   /hostel/blocks/:id/rooms         # Create room

POST   /hostel/assign                   # Assign student to room
DELETE /hostel/assign/:studentId        # Vacate room
```

### **Inventory**

```
GET    /inventory/items                 # List items
POST   /inventory/items                 # Add item
PUT    /inventory/items/:id             # Update item
GET    /inventory/low-stock             # Low stock alerts
```

### **HR & Payroll**

```
GET    /leaves                          # List leave requests
POST   /leaves                          # Apply for leave
PUT    /leaves/:id                      # Update leave
POST   /leaves/:id/approve              # Approve leave
POST   /leaves/:id/reject               # Reject leave
```

### **Events**

```
GET    /events                          # List events
POST   /events                          # Create event
PUT    /events/:id                      # Update event
DELETE /events/:id                      # Delete event
GET    /events/calendar                 # Calendar view
```

---

## 🔔 Notification Service

```
GET    /notifications                   # List notifications
GET    /notifications/:id               # Get notification
POST   /notifications/:id/read          # Mark as read
POST   /notifications/read-all          # Mark all as read
DELETE /notifications/:id               # Delete notification

# Messaging
GET    /messages                        # List messages
POST   /messages                        # Send message
GET    /messages/:id                    # Get message
DELETE /messages/:id                    # Delete message

# Announcements
GET    /announcements                   # List announcements
POST   /announcements                   # Create announcement (admin)
PUT    /announcements/:id               # Update announcement
DELETE /announcements/:id               # Delete announcement
```

---

## 🔍 Search Service

```
GET    /search                          # Universal search
GET    /search/contents                 # Search content
GET    /search/users                    # Search users
GET    /search/schools                  # Search schools
GET    /search/questions                # Search questions

# Advanced Filters
POST   /search/advanced                 # Advanced search with complex filters
```

---

## 📁 File Upload Service

```
POST   /upload/presigned-url            # Get presigned S3 URL
POST   /upload/complete                 # Mark upload complete
GET    /upload/:id/status               # Check processing status
DELETE /upload/:id                      # Delete uploaded file
```

---

## 📈 Reporting Service

```
GET    /reports/attendance              # Attendance report
GET    /reports/performance             # Performance report
GET    /reports/fees                    # Fee collection report
GET    /reports/usage                   # Platform usage report
GET    /reports/content-analytics       # Content analytics

# Export
POST   /reports/export                  # Export report (PDF/Excel)
GET    /reports/exports/:id             # Download exported report
```

---

## 🔄 Sync Service (On-Premise)

```
POST   /sync/initiate                   # Initiate sync
GET    /sync/status                     # Check sync status
GET    /sync/logs                       # Get sync logs
POST   /sync/resolve-conflict           # Resolve conflict
```

---

## ⚙️ Admin Service

```
GET    /admin/system-config             # Get system config
PUT    /admin/system-config             # Update system config
POST   /admin/maintenance-mode          # Toggle maintenance mode

# Audit Logs
GET    /admin/audit-logs                # Get audit logs
GET    /admin/audit-logs/:id            # Get specific log

# User Management
POST   /admin/users/:id/suspend         # Suspend user
POST   /admin/users/:id/activate        # Activate user
POST   /admin/users/:id/reset-password  # Force password reset
```

---

## 📊 Common Patterns

### **Pagination**
```
GET /resources?page=1&limit=20&sort=-createdAt
```

### **Filtering**
```
GET /contents?board=CBSE&grade=10&subject=Math&status=PUBLISHED
```

### **Includes (Eager Loading)**
```
GET /students/:id?include=parents,enrollments,attendance
```

### **Field Selection**
```
GET /users?fields=id,firstName,email
```

### **Error Response**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### **Success Response**
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## 🔐 Authentication Headers

```
Authorization: Bearer <access_token>
X-Tenant-ID: <organization_tenant_id>
X-School-ID: <school_id>  (optional, for school-specific requests)
```

---

## 🚀 Rate Limiting

- **Public APIs**: 100 requests/minute
- **Authenticated APIs**: 1000 requests/minute
- **Admin APIs**: Unlimited

---

**API Version**: 1.0  
**Last Updated**: 2026-07-06  
**OpenAPI Spec**: Available at `/api/docs`
