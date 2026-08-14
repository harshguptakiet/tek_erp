# Organization Management - Functional Requirements

## Module: ORG
**Total Requirements**: 35  
**Priority**: P0-P1 (Critical for multi-tenancy)

---

## 1. Organization Onboarding

### FR-ORG-001: Create Organization
**Priority**: P0  
**Description**: System shall allow super admin to onboard new organizations  
**Actor**: Super Admin  
**Preconditions**: User has super admin role  
**Postconditions**: Organization created with unique tenant ID

**Detailed Requirements**:
1. Super admin navigates to "Organizations"
2. Clicks "Add Organization"
3. System displays creation form with sections:
   
   **Basic Information**:
   - Organization name (required, 3-100 chars)
   - Legal name (required, if different from name)
   - Organization type (dropdown):
     - MINISTRY (National level)
     - STATE_DEPARTMENT (State education dept)
     - DISTRICT_OFFICE (District administration)
     - SCHOOL (Individual school)
     - COLLEGE (College/University)
     - UNIVERSITY (Multi-college group)
     - COACHING_CENTER (Coaching institute)
     - INSTITUTION_GROUP (Group of schools)
     - EDTECH_COMPANY (EdTech provider)
   - Registration number (required, unique)
   - Tax ID / GST number (required for billing)
   
   **Contact Information**:
   - Primary email (required, unique)
   - Primary phone (required)
   - Website URL (optional)
   - Physical address (required):
     - Street address
     - City
     - State
     - Country
     - PIN/ZIP code
   - Geo-coordinates (optional, for mapping)
   
   **Hierarchy**:
   - Parent organization (dropdown, optional)
     - For schools: Select district/group
     - For districts: Select state
     - For states: Select ministry
   - Hierarchy level auto-determined from type
   
   **Subscription Tier**:
   - FREE (limited features, trial)
   - BASIC (standard features)
   - PREMIUM (advanced features)
   - ENTERPRISE (full features + customization)
   - GOVERNMENT (special pricing, compliance)
   
   **Configuration**:
   - Max users allowed (based on tier)
   - Storage quota (GB)
   - Bandwidth quota (GB/month)
   - API rate limits
   - Feature flags (toggle modules)

4. Super admin fills form and submits
5. System validates:
   - Name uniqueness within parent org
   - Registration number uniqueness globally
   - Email uniqueness globally
   - Valid parent org selection (hierarchy rules)
6. System generates:
   - Unique tenant ID (UUID)
   - Organization code (human-readable, e.g., ORG-2024-0001)
7. System creates organization record
8. System creates default roles for organization
9. System sends welcome email to primary contact:
   - Organization details
   - Admin account setup instructions
   - Next steps
10. System logs action in audit trail
11. Success message: "Organization [Name] created successfully"

**Business Rules**:
- Tenant ID unique and immutable
- Registration number must be valid format per country
- Cannot create circular hierarchies (A → B → A)
- Parent org must be active
- FREE tier limited to 50 users, 10 GB storage
- Organization code format: ORG-YYYY-NNNN

**Validation Rules**:
- Name: Letters, numbers, spaces, hyphens, periods only
- Email: Valid RFC 5322 format
- Phone: E.164 international format
- Website: Valid URL format (http/https)

---

### FR-ORG-002: Organization Hierarchy Management
**Priority**: P0  
**Description**: System shall support multi-level organization hierarchy

**Detailed Requirements**:
1. System maintains tree structure:
   ```
   Ministry (Level 0)
     └─ State Dept (Level 1)
         └─ District (Level 2)
             └─ School (Level 3)
   ```
2. Each organization has:
   - parentOrganizationId (nullable for root orgs)
   - hierarchyPath (materialized path, e.g., "/1/23/456/")
   - hierarchyLevel (0-5, 0 being highest)
3. System enforces hierarchy rules:
   - Ministry can have State children
   - State can have District children
   - District can have School children
   - Schools cannot have children (leaf nodes)
   - Institution groups can have School children
4. Queries optimized using materialized path
5. Moving organizations:
   - Super admin can change parent
   - System validates new parent compatibility
   - System updates all descendant paths
   - System migrates data if needed
   - Audit log entry created
6. View hierarchy:
   - Tree view (expandable/collapsible)
   - Breadcrumb navigation
   - Organization picker with search

**Business Rules**:
- Max hierarchy depth: 5 levels
- Cannot move organization to its own descendant (circular)
- Moving affects all descendants (cascade)
- Data access follows hierarchy (parent can access children)
- Billing aggregated at group level

---

### FR-ORG-003: Organization Verification
**Priority**: P1  
**Description**: System shall verify organization legitimacy

**Detailed Requirements**:
1. Newly created organizations have status: PENDING_VERIFICATION
2. Verification process:
   - Super admin reviews submitted documents
   - Required documents:
     - Registration certificate
     - Tax registration
     - Identity proof of primary contact
     - Authorization letter (if applicable)
   - Admin verifies:
     - Document authenticity
     - Registration number validity
     - Contact information
3. Admin can:
   - Approve: Status → ACTIVE
   - Reject: Status → REJECTED (with reason)
   - Request more info: Status → INFO_REQUESTED
4. If approved:
   - Organization gets full access
   - Verification badge displayed
   - Welcome package sent
   - Onboarding call scheduled
5. If rejected:
   - Primary contact notified
   - Can resubmit with corrections
   - Previous documents retained
6. Auto-verification (future):
   - Integration with govt databases
   - Instant verification for known entities

**Business Rules**:
- Verification typically within 3-5 business days
- Unverified orgs have limited access
- Can use platform but cannot publish content
- Cannot receive payments until verified

---

### FR-ORG-004: Organization Activation/Deactivation
**Priority**: P0  
**Description**: System shall allow activation/deactivation of organizations

**Detailed Requirements**:
1. Super admin can deactivate organization:
   - Navigates to org details
   - Clicks "Deactivate"
   - System shows impact summary:
     - Active users count
     - Active schools (if group)
     - Active subscriptions
     - Pending payments
   - Admin provides reason (required)
   - Admin confirms
2. On deactivation:
   - Status set to INACTIVE
   - All users' access suspended
   - Active sessions terminated
   - Subscriptions paused
   - Data retained (soft delete)
   - Notification sent to org admin
   - Billing stopped
3. Deactivated organization:
   - Cannot login
   - Data accessible to super admin
   - Can be reactivated
   - Automatically deactivated after 90 days if unpaid
4. Reactivation:
   - Admin clicks "Reactivate"
   - Reason required
   - Users' access restored
   - Subscriptions resume
   - Notification sent

**Business Rules**:
- Grace period: 30 days before deactivation if payment fails
- Deactivated orgs data retained for 1 year
- After 1 year: Archival process begins
- Cannot deactivate parent org without deactivating children first

---

### FR-ORG-005: Organization Deletion
**Priority**: P1  
**Description**: System shall support organization deletion with data handling

**Detailed Requirements**:
1. Super admin initiates deletion
2. System checks deletion eligibility:
   - No active subscriptions
   - No pending payments
   - No children organizations
   - Organization inactive for 30+ days
3. If eligible:
   - Admin provides deletion reason
   - Admin confirms with password
   - System shows checklist:
     - [ ] All users notified
     - [ ] Data backed up
     - [ ] Content archived
     - [ ] Payments settled
     - [ ] Legal team approved (if required)
4. On confirmation:
   - Status set to DELETED
   - Soft delete (data retained)
   - Tenant ID marked as deleted (cannot reuse)
   - All relationships severed
   - Access completely removed
5. Data retention:
   - User data retained for 90 days (GDPR)
   - Financial records retained for 7 years (legal)
   - Content archived permanently
   - Audit logs retained permanently
6. After retention period:
   - Hard delete (data permanently removed)
   - Cannot be recovered

**Business Rules**:
- Deletion is irreversible after hard delete
- Cannot delete if has children
- Cannot delete if has active billing
- Must settle all financial obligations
- Legal approval required for large orgs

---

### FR-ORG-006: Organization Transfer
**Priority**: P2  
**Description**: System shall support organization ownership transfer

**Detailed Requirements**:
1. Current org admin initiates transfer
2. Provides new owner email
3. System validates new owner exists in platform
4. System sends transfer request to new owner
5. New owner reviews and accepts/rejects
6. If accepted:
   - Ownership transferred
   - Roles updated
   - Previous owner becomes regular admin
   - All users notified
   - Audit log entry
7. If rejected:
   - Current owner notified
   - Can retry with different owner

**Business Rules**:
- Only primary owner can initiate transfer
- New owner must have verified account
- Cannot transfer if has pending issues
- Transfer requires super admin approval for enterprise accounts
- 7-day cooling period for disputes

---

## 2. White-Label Branding

### FR-ORG-010: Upload Organization Logo
**Priority**: P1  
**Description**: System shall allow organizations to upload custom logo

**Detailed Requirements**:
1. Org admin navigates to Settings → Branding
2. Clicks "Upload Logo"
3. System shows file picker
4. Admin selects image file
5. System validates:
   - File type: PNG, SVG (transparent bg), JPEG
   - File size: Max 2 MB
   - Dimensions: Min 200x200, Max 2048x2048
   - Aspect ratio: Square (1:1) or wide (16:9)
6. System shows preview
7. Admin can crop/adjust
8. Admin saves
9. System:
   - Uploads to S3
   - Generates multiple sizes (favicon, header, full)
   - Sets CDN cache
   - Updates organization record
10. Logo appears in:
    - Login page (if custom domain)
    - Dashboard header
    - Emails sent to org users
    - Reports and certificates
    - Mobile app (if white-labeled)

**Business Rules**:
- Logo required for white-label deployment
- SVG preferred for scalability
- Transparent background recommended
- Must meet brand guidelines (if set)
- Previous logos retained for 30 days

---

### FR-ORG-011: Customize Color Scheme
**Priority**: P1  
**Description**: System shall allow organizations to customize platform colors

**Detailed Requirements**:
1. Org admin navigates to Branding → Colors
2. System displays color picker for:
   - **Primary color**: Main brand color (buttons, links)
   - **Secondary color**: Accent color
   - **Sidebar color**: Navigation background
   - **Header color**: Top bar background
   - **Text color**: Default text
   - **Background color**: Page background
3. Real-time preview of changes
4. System validates:
   - Hex code format (#RRGGBB or #RGB)
   - Sufficient contrast (WCAG AA compliance)
   - Not too similar to error/warning colors
5. Admin can:
   - Pick from color wheel
   - Enter hex codes manually
   - Use color presets
   - Reset to default
6. Admin saves
7. System generates CSS variables
8. Colors applied immediately (WebSocket push to active users)
9. Colors used in:
   - Web application
   - Mobile app (if white-labeled)
   - Emails
   - PDF reports

**Business Rules**:
- Must pass WCAG AA accessibility standards
- Cannot use system reserved colors (red for errors)
- Preview mode for testing before going live
- Can schedule color change (e.g., theme day)
- Rollback option available

---

### FR-ORG-012: Custom Domain Configuration
**Priority**: P2  
**Description**: System shall support custom domains for organizations

**Detailed Requirements**:
1. Org admin (Enterprise tier) requests custom domain
2. Provides domain name (e.g., school.example.com)
3. System validates:
   - Domain format
   - Domain availability (not already used)
   - DNS ownership verification
4. System provides DNS records to add:
   - CNAME record pointing to platform
   - TXT record for verification
5. Admin adds records to their DNS
6. System periodically checks DNS propagation
7. Once verified:
   - SSL certificate generated (Let's Encrypt)
   - Domain active
   - Users can access via custom domain
   - Redirect from default domain (optional)
8. Custom domain features:
   - Organization logo on login
   - Custom email sender domain
   - Branded URLs for content

**Business Rules**:
- Only Enterprise/Government tiers
- One custom domain per organization
- SSL certificate auto-renewed
- Domain verification required every year
- Cannot use subdomains of edubharti.com

---

### FR-ORG-013: Email Template Customization
**Priority**: P2  
**Description**: System shall allow customization of email templates

**Detailed Requirements**:
1. Org admin navigates to Branding → Email Templates
2. System shows list of templates:
   - Welcome email
   - Password reset
   - Exam notification
   - Fee reminder
   - Report card
3. Admin selects template to customize
4. System shows editor:
   - WYSIWYG editor for content
   - Merge tags for dynamic data
   - Preview with sample data
   - Mobile preview
5. Admin can customize:
   - Header (logo, colors)
   - Content text
   - Footer
   - CTA buttons
   - Social links
6. Admin saves
7. System validates:
   - Merge tags syntax
   - HTML structure
   - Mobile responsiveness
8. Templates used for all org users

**Business Rules**:
- Cannot remove unsubscribe link (compliance)
- Cannot modify transactional emails content (legal)
- Must pass spam filter checks
- Preview sent to admin before activation
- Rollback to default option

---

## 3. Organization Settings

### FR-ORG-020: Configure Organization Details
**Priority**: P0  
**Description**: System shall allow updating organization information

**Detailed Requirements**:
1. Org admin navigates to Settings → Organization Details
2. Can update:
   - Organization name (requires verification)
   - Contact email
   - Contact phone
   - Address
   - Website
   - Description
3. Cannot update:
   - Registration number (immutable)
   - Tenant ID (immutable)
   - Creation date (historical)
4. System validates changes
5. If critical field changed (name, registration):
   - Requires super admin approval
   - Verification documents may be requested
6. System updates record
7. Notifies super admin if approval needed
8. Audit log entry

**Business Rules**:
- Name changes limited to 1 per year
- Contact email must be verified
- Address updates may affect tax calculations
- Historical data retained

---

### FR-ORG-021: Feature Toggle Configuration
**Priority**: P0  
**Description**: System shall allow enabling/disabling features per organization

**Detailed Requirements**:
1. Super admin (or org admin with permission) accesses Feature Management
2. System displays available modules with toggle switches:
   - **Content Modules**:
     - AR Content Access
     - VR Content Access
     - Video Content
     - Interactive Content
   - **Academic Modules**:
     - Live Classes (Traditional)
     - Live Classes (Metaverse)
     - Assignments
     - Exams & Quizzes
   - **ERP Modules**:
     - Attendance
     - Timetable
     - Fee Management
     - Library
     - Transport
     - Hostel
     - Inventory
     - HR & Payroll
   - **Communication**:
     - Messaging
     - Announcements
     - Parent Portal
   - **Analytics**:
     - Student Analytics
     - Teacher Analytics
     - Government Dashboards
   - **Marketplace**:
     - Content Marketplace
     - Direct Purchases
3. For each module:
   - Toggle on/off
   - View feature description
   - See pricing impact (if applicable)
   - Set effective date (immediate or scheduled)
4. Changing feature status:
   - Shows impact: "X users will lose access"
   - Requires confirmation
   - Notifies affected users
   - Updates billing if cost change
5. Feature dependencies handled:
   - Disabling parent feature warns about dependents
   - Can force disable all dependents
   - Or cancel action
6. Changes logged in audit trail

**Business Rules**:
- Features tied to subscription tier
- Cannot enable premium features on free tier
- Disabling feature doesn't delete data (suspended)
- Re-enabling restores access
- Some features cannot be disabled (core: authentication, profile)

---

### FR-ORG-022: User Limit Configuration
**Priority**: P0  
**Description**: System shall enforce user limits based on subscription

**Detailed Requirements**:
1. Organization has user limit based on tier:
   - FREE: 50 users
   - BASIC: 500 users
   - PREMIUM: 2,000 users
   - ENTERPRISE: Custom (unlimited with approval)
   - GOVERNMENT: Custom based on contract
2. System tracks:
   - Total users
   - Active users
   - Inactive users (don't count toward limit)
3. When approaching limit (90%):
   - Admin notified
   - Warning message on dashboard
   - Upgrade suggestion
4. At limit:
   - Cannot add new users
   - Must deactivate users or upgrade
   - Clear error message shown
5. Grace period:
   - 10 users over limit allowed (1 week grace)
   - After grace: Forced to resolve
6. Upgrade process:
   - One-click upgrade to higher tier
   - Pro-rated billing
   - Immediate limit increase

**Business Rules**:
- Deleted/inactive users don't count
- Student users count as 0.5 (cost optimization)
- Bulk imports blocked if exceeds limit
- Can request temporary limit increase (events)

---

### FR-ORG-023: Data Retention Policy
**Priority**: P1  
**Description**: System shall allow organizations to configure data retention

**Detailed Requirements**:
1. Org admin navigates to Settings → Data Retention
2. Can configure retention periods for:
   - **User Data**:
     - Login history: 6 months - 5 years
     - Activity logs: 3 months - 2 years
     - Deleted users: 30 - 90 days
   - **Academic Data**:
     - Exam records: 1 year - Permanent
     - Assignments: 1 year - 5 years
     - Attendance: 1 year - 10 years
   - **Communication**:
     - Messages: 3 months - 2 years
     - Announcements: 6 months - 5 years
   - **Files**:
     - Uploaded content: 6 months - Permanent
     - Recordings: 30 days - 1 year
3. System validates against:
   - Legal minimums (cannot be less)
   - Storage quota (cannot store more than quota allows)
4. System runs nightly cleanup job:
   - Identifies data exceeding retention
   - Archives to cold storage
   - After archive period: Permanently deletes
5. Admin can:
   - Preview data to be deleted
   - Exclude specific records from deletion
   - Download before deletion

**Business Rules**:
- Financial records: 7 years minimum (legal)
- Student academic records: 10 years minimum
- Audit logs: Permanent (cannot delete)
- GDPR: User can request immediate deletion
- Retention policy cannot reduce storage retroactively

---

This continues with additional organization management requirements...

**Status**: Module 3 in progress (23 of 35 requirements)

Continuing to next section?


## 4. Organization Users

### FR-ORG-030: Add Users to Organization
**Priority**: P0  
**Description**: System shall allow organization admins to add users to their organization  
**Actor**: Organization Admin, Super Admin  
**Preconditions**: Organization is active  
**Postconditions**: User linked to organization with appropriate role

**Detailed Requirements**:
1. Org admin navigates to Organization → Users
2. Clicks "Add User" button
3. System shows two options:
   - **Invite Existing User** (if user already has account)
   - **Create New User** (if new to platform)
4. For existing user:
   - Admin enters email or user ID
   - System searches and displays user profile
   - Admin confirms user identity
   - Admin selects role(s) for this organization
   - Admin sets designation (optional)
   - Admin sets department (optional)
   - Admin sets permissions (if custom role)
   - Admin clicks "Add to Organization"
5. For new user:
   - Admin fills user creation form (as per FR-USER-XXX)
   - Admin selects role for organization
   - System creates user account
   - System sends invitation email
6. System creates organization_users record with:
   - organizationId
   - userId
   - roles (can be multiple)
   - designation
   - department
   - joinedAt timestamp
   - isActive = true
7. User receives notification:
   - Welcome to organization
   - Role assignment
   - Login instructions (if new user)
8. User appears in organization's user list
9. User can now access organization resources
10. Audit log entry created

**Business Rules**:
- One user can belong to multiple organizations
- Same user can have different roles in different organizations
- User inherits organization-level permissions
- Cannot add users beyond organization limit
- Cannot add users to inactive organization
- Super admin can add users to any organization

**Validation**:
- Email uniqueness checked if creating new user
- Role must be valid for organization type
- At least one admin role must exist in organization

**Error Handling**:
- USER_LIMIT_REACHED: "Organization has reached maximum user limit"
- USER_ALREADY_EXISTS: "User is already part of this organization"
- INVALID_ROLE: "Selected role is not available for this organization"

---

### FR-ORG-031: Remove Users from Organization
**Priority**: P0  
**Description**: System shall allow removal of users from organization

**Detailed Requirements**:
1. Org admin views organization users list
2. Selects user to remove
3. Clicks "Remove from Organization" option
4. System shows confirmation dialog:
   - User name and role
   - Impact assessment:
     - Active classes teaching
     - Assigned students
     - Pending tasks
     - Access to content
   - Warning about data retention
5. Admin can choose:
   - **Soft remove**: User becomes inactive, data retained
   - **Transfer responsibilities**: Assign to another user first
   - **Hard remove**: Complete removal with data handling
6. If soft remove:
   - Set isActive = false
   - Revoke access to organization resources
   - User can still login to platform (other orgs)
   - Data retained and associated with user
7. If transfer responsibilities:
   - Admin selects replacement user
   - System transfers:
     - Class assignments
     - Students
     - Pending exams/assignments
   - Then removes original user
8. System sends notifications:
   - To removed user
   - To replacement user (if any)
   - To affected students/parents
9. Audit log entry with reason
10. User removed from organization users list

**Business Rules**:
- Cannot remove last admin of organization
- Cannot remove self (must have another admin do it)
- Cannot remove users with pending financial transactions
- Must transfer responsibilities before removal (if any)
- Removed users retained in historical records
- Can be re-added later if needed

**Data Handling**:
- User's created content remains (attributed to user)
- User's messages archived
- User's activity logs retained
- User's access logs retained for audit
- User profile remains in platform (if in other orgs)

---

### FR-ORG-032: Manage User Roles in Organization
**Priority**: P0  
**Description**: System shall allow changing user roles within organization

**Detailed Requirements**:
1. Org admin views user details
2. Clicks "Change Role" option
3. System shows current role(s)
4. System displays available roles for this organization:
   - System roles (Teacher, Admin, etc.)
   - Custom roles (if any created)
5. Admin selects new role(s)
6. If role has fewer permissions:
   - System shows warning about access reduction
   - Lists features user will lose access to
7. If role has more permissions:
   - System shows confirmation about access increase
   - Lists new features user will gain
8. Admin provides reason for change (required)
9. Admin confirms change
10. System validates:
    - At least one admin role remains in organization
    - User qualifies for new role
11. System updates user_role_mapping
12. System revokes old permissions
13. System grants new permissions
14. System invalidates permission cache
15. System forces user re-login if currently active
16. User receives notification:
    - Role change notification
    - New permissions listed
    - Effective immediately
17. Audit log entry with reason

**Business Rules**:
- Role change effective immediately
- Cannot demote last admin
- Cannot demote self without another admin present
- Role change may affect billing (if role-based pricing)
- Custom roles must be pre-created
- Can assign multiple roles to single user

**Special Cases**:
- If user has active session: Force logout and re-login
- If user teaching classes: Notify about schedule impact
- If user has pending approvals: Transfer to another admin

---

### FR-ORG-033: View Organization Users List
**Priority**: P0  
**Description**: System shall display comprehensive organization users list

**Detailed Requirements**:
1. Org admin navigates to Organization → Users
2. System displays users list with columns:
   - Profile picture (thumbnail)
   - Name (first, last)
   - Email
   - Role(s) (badges)
   - Department
   - Status (Active/Inactive)
   - Last login
   - Joined date
   - Actions (view, edit, remove)
3. Default sorting: Alphabetical by name
4. User can sort by:
   - Name
   - Email  
   - Role
   - Last login
   - Joined date
5. Filters available:
   - Role (multi-select)
   - Status (active, inactive, invited)
   - Department
   - Date range (joined date)
   - Last login (active in last X days)
6. Search box:
   - Search by name, email, ID
   - Real-time filtering as user types
   - Highlights matching text
7. Pagination:
   - 20 users per page (configurable: 10, 20, 50, 100)
   - Page numbers shown
   - "Load more" option
8. Bulk actions:
   - Select multiple users (checkboxes)
   - Bulk role change
   - Bulk status change
   - Bulk export
9. Quick actions per user:
   - View profile
   - Edit details
   - Change role
   - Send message
   - Remove from organization
10. Export options:
    - Export filtered results to CSV/Excel
    - Include selected columns only
    - Email download link when ready

**Performance**:
- List cached (5-minute TTL)
- Lazy loading for large lists
- Server-side pagination
- Indexed database queries
- Real-time updates via WebSocket for status changes

**Business Rules**:
- Shows only users of current organization
- Hierarchical orgs can view child org users
- Super admin can view all organization users
- Sensitive data (phone, address) visible only to admins

---

### FR-ORG-034: Invite External Users to Organization
**Priority**: P1  
**Description**: System shall support email invitations for external users

**Detailed Requirements**:
1. Org admin clicks "Invite User" button
2. System shows invitation form:
   - Email address (required)
   - Suggested role (dropdown)
   - Personal message (optional, max 500 chars)
   - Expiry period (default: 7 days)
3. Admin fills and sends invitation
4. System validates:
   - Email format
   - Email not already in organization
   - Organization has available user slots
5. System creates invitation record:
   - Unique invitation code (UUID)
   - Inviter ID
   - Invitee email
   - Suggested role
   - Expires at (timestamp)
   - Status: PENDING
6. System sends invitation email:
   - Organization name and logo
   - Inviter name
   - Personal message (if provided)
   - Role description
   - Acceptance link with invitation code
   - Expiry date clearly stated
7. Invitee clicks acceptance link
8. If invitee has account:
   - System auto-links to organization
   - Assigns suggested role
   - Status: ACCEPTED
9. If invitee doesn't have account:
   - Redirect to registration
   - Pre-fill email
   - Complete registration
   - Auto-link to organization on signup
10. Inviter receives notification when:
    - Invitation accepted
    - Invitation expired
    - Invitation declined
11. Admin can:
    - View pending invitations
    - Resend invitation
    - Cancel invitation
    - Extend expiry

**Business Rules**:
- Invitation valid for 7 days by default
- Can extend before expiry
- Cannot invite same email twice (pending state)
- Invitation counts toward user limit on acceptance
- Declined invitations can be re-sent
- Max 3 reminders per invitation

**Invitation States**:
- PENDING: Sent, awaiting response
- ACCEPTED: User joined organization
- EXPIRED: Past expiry date
- CANCELLED: Admin cancelled
- DECLINED: User explicitly declined

---

## 5. Organization Licensing

### FR-ORG-040: Create License Pool
**Priority**: P0  
**Description**: System shall allow organizations to create license pools  
**Actor**: Organization Admin, Super Admin  
**Preconditions**: Organization has active subscription  
**Postconditions**: License pool created with available seats

**Detailed Requirements**:
1. Org admin navigates to Organization → Licenses
2. Clicks "Create License Pool"
3. System shows license creation form:
   - **License Type** (dropdown):
     - AR_ONLY: AR content access only
     - VR_ONLY: VR content access only
     - AR_VR_BUNDLE: Both AR and VR
     - LMS_ONLY: Learning management features
     - COMPETITIVE_EXAM: Exam prep content
     - FULL_ACCESS: All features
     - CUSTOM: Select specific modules
   - **Number of Seats** (input):
     - Total licenses to create
     - Must be within purchased quantity
   - **Validity Period**:
     - Start date (default: today)
     - End date (required)
     - Or duration in months
   - **Pricing Model** (dropdown):
     - PER_STUDENT: Cost per student license
     - PER_SCHOOL: Flat rate per school
     - PER_DISTRICT: District-wide pricing
     - FLAT_FEE: One-time payment
   - **Price** (input):
     - Cost amount
     - Currency (INR default)
   - **Features Included** (checkboxes):
     - Content categories
     - Module access
     - Support level
   - **Restrictions** (optional):
     - Grade levels allowed
     - Subject restrictions
     - Usage limits (hours/day, content views)
4. Admin fills form and creates license pool
5. System validates:
   - Seats available in organization quota
   - Valid date range (start < end)
   - Price is reasonable (if set)
   - No overlapping license pools (if applicable)
6. System generates:
   - License pool ID (unique)
   - License codes (if needed for distribution)
7. System creates license record:
   - organizationId
   - licenseType
   - totalSeats
   - usedSeats = 0
   - startDate, endDate
   - pricingModel, price
   - features (JSON)
   - isActive = true
8. System deducts seats from organization quota
9. License pool appears in list
10. Admin can now assign licenses from pool
11. Audit log entry created

**Business Rules**:
- Cannot create more licenses than purchased
- License validity cannot exceed organization subscription
- Different license types can coexist
- Unused seats don't expire with license (reusable)
- Can create multiple pools for different purposes
- Custom licenses require approval

**Validation Rules**:
- totalSeats > 0
- startDate >= today
- endDate > startDate
- price >= 0
- At least one feature must be selected

---

### FR-ORG-041: Assign License to User
**Priority**: P0  
**Description**: System shall allow assigning licenses from pool to users

**Detailed Requirements**:
1. Org admin views license pool details
2. Sees available seats count
3. Clicks "Assign License" button
4. System shows user selection:
   - Search users by name, email, ID
   - Filter by role, class, department
   - Multi-select for bulk assignment
5. Admin selects user(s)
6. System validates:
   - User is member of organization
   - User doesn't already have this license
   - Seats available in pool
7. For each user:
   - System creates license_assignment record
   - System increments usedSeats
   - System grants content/feature access
   - System sends notification to user
8. If bulk assignment:
   - Progress indicator shown
   - Results summary displayed:
     - Successfully assigned: X
     - Failed: Y (with reasons)
9. Assigned users can now:
   - Access licensed content
   - Use licensed features
   - View license details in their profile
10. Assignment logged in audit trail

**Business Rules**:
- One user can have multiple license types
- License assignment immediate (no approval)
- User retains license until revoked or expired
- Expired licenses auto-revoked (nightly job)
- Cannot assign expired licenses
- Can reassign revoked licenses to new users

**Notifications**:
- User receives email: "License activated"
- Email includes:
  - License type
  - Features unlocked
  - Validity period
  - Usage instructions

---

### FR-ORG-042: Revoke License from User
**Priority**: P0  
**Description**: System shall allow revoking licenses from users

**Detailed Requirements**:
1. Admin views assigned licenses list
2. Selects user's license to revoke
3. Clicks "Revoke License"
4. System shows confirmation:
   - User name
   - License type
   - Impact: "User will lose access to [features]"
   - Reason required (dropdown + text):
     - User left organization
     - License reallocated
     - Policy violation
     - End of academic year
     - Other (specify)
5. Admin confirms revocation
6. System:
   - Marks license_assignment as revoked
   - Sets revokedAt timestamp
   - Records revocation reason
   - Decrements usedSeats in pool
   - Revokes user's access to licensed features
   - Sends notification to user
7. License becomes available for reassignment
8. User cannot access previously licensed content
9. Audit log entry created

**Business Rules**:
- Revocation immediate (no grace period)
- Cannot revoke if user has active sessions (warning shown)
- Revoked licenses return to pool
- User's work/data created using license retained
- Can re-assign same license later
- Bulk revocation supported

**User Impact**:
- Immediate loss of access
- Downloads/offline content disabled
- In-progress activities stopped
- Can purchase individual license if desired

---

### FR-ORG-043: View License Usage Analytics
**Priority**: P1  
**Description**: System shall provide license utilization analytics

**Detailed Requirements**:
1. Org admin navigates to Licenses → Analytics
2. System displays dashboard with:
   - **Overview Cards**:
     - Total licenses purchased
     - Total licenses assigned
     - Available licenses
     - Utilization percentage
     - Expiring soon (within 30 days)
   - **License Type Breakdown** (pie chart):
     - AR-only: X assigned
     - VR-only: Y assigned
     - Full access: Z assigned
   - **Usage Trends** (line chart):
     - License assignments over time
     - Peak usage periods
     - Churn rate (revocations)
   - **Top Users** (table):
     - Most active license users
     - Usage hours
     - Content consumed
   - **Expiry Timeline** (gantt chart):
     - License pools expiry dates
     - Renewal reminders
   - **Cost Analysis**:
     - Total cost
     - Cost per active user
     - ROI metrics
3. Filters available:
   - Date range
   - License type
   - Department/class
   - User role
4. Export reports:
   - PDF summary
   - Excel detailed report
   - Schedule monthly reports
5. Alerts configured:
   - Low utilization (<50%)
   - High utilization (>90%)
   - Expiring licenses (30 days before)
   - Unused licenses (assigned but not used in 30 days)

**Business Rules**:
- Analytics updated daily (batch job)
- Real-time data for current day
- Historical data retained for 2 years
- Comparative analysis (month-over-month, year-over-year)
- Benchmark against industry averages (if available)

---

### FR-ORG-044: License Renewal Process
**Priority**: P1  
**Description**: System shall handle license pool renewals

**Detailed Requirements**:
1. System monitors license pool expiry dates
2. Automated reminders sent:
   - 30 days before expiry: First reminder
   - 15 days before expiry: Second reminder
   - 7 days before expiry: Urgent reminder
   - 1 day before expiry: Final reminder
3. Admin receives reminder email:
   - License pool details
   - Current usage statistics
   - Renewal options
   - One-click renewal link
4. Admin clicks renewal link
5. System shows renewal form:
   - Current license details
   - Proposed renewal (same or modified):
     - Number of seats (can increase/decrease)
     - License type (can change)
     - Duration (months)
   - Pricing (auto-calculated with discounts)
   - Payment method selection
6. Admin confirms renewal
7. System processes:
   - Creates new license pool
   - Migrates active assignments to new pool
   - Extends validity for all users
   - Processes payment
   - Sends confirmation
8. If not renewed by expiry:
   - License pool marked as EXPIRED
   - All assignments remain but inactive
   - Users notified of expiration
   - Grace period: 7 days (read-only access)
   - After grace period: Access fully revoked
9. Can renew during grace period:
   - All access restored immediately
   - No data loss

**Business Rules**:
- Early renewal discount (renew 30+ days early: 10% off)
- Bulk renewal discount (500+ seats: 15% off)
- Auto-renewal option (credit card required)
- Cannot renew with fewer seats than currently assigned
- Must settle pending payments before renewal
- Renewal prices may change (notified 60 days prior)

---

## 6. Organization Analytics

### FR-ORG-050: Organization Dashboard Overview
**Priority**: P0  
**Description**: System shall provide comprehensive organization dashboard  
**Actor**: Organization Admin  
**Preconditions**: User has admin access to organization  
**Postconditions**: Dashboard displays current organization metrics

**Detailed Requirements**:
1. Org admin logs in and views dashboard
2. System displays overview with key metrics:
   
   **Header Section**:
   - Organization name and logo
   - Current tier badge
   - Verification status badge
   - Quick actions (Settings, Upgrade, Support)
   
   **Metrics Cards** (4 cards across):
   - **Total Users**:
     - Count with trend (↑↓)
     - Breakdown: Active, Inactive, Invited
     - Click to view user list
   - **Active Licenses**:
     - Assigned vs Available
     - Utilization percentage
     - Expiring soon count
   - **Storage Used**:
     - Used / Total quota
     - Progress bar
     - Top consumers link
   - **This Month Activity**:
     - Active users count
     - Content views
     - Exam attempts
   
   **Charts Section**:
   - **User Growth** (line chart, 6 months):
     - New users added per month
     - User churn
     - Net growth trend
   - **Feature Usage** (bar chart):
     - Attendance: X uses
     - Assignments: Y uses
     - Exams: Z uses
     - Content views: N
   - **Performance Metrics** (area chart):
     - Average exam scores trend
     - Attendance percentage trend
     - Engagement rate
   
   **Recent Activity Feed**:
   - Last 10 significant activities:
     - New user added
     - License assigned
     - Exam created
     - Content published
     - Payment received
   - Timestamp and actor for each
   - "View all activity" link
   
   **Quick Links Section**:
   - Add Users
   - Create License Pool
   - View Reports
   - Manage Settings
   - Contact Support
   
   **Alerts & Notifications Panel**:
   - Pending actions requiring attention
   - Expiring licenses
   - Low storage warning
   - Approaching user limit
   - Pending approvals
   - System announcements

3. Dashboard auto-refreshes every 5 minutes
4. User can manually refresh with button
5. Widgets customizable (drag & drop to reorder)
6. Can add/remove widgets based on preference
7. Export dashboard as PDF report

**Performance Requirements**:
- Initial load time: <2 seconds
- Auto-refresh: Every 5 minutes (configurable)
- Real-time updates via WebSocket for critical metrics
- Cached data with 5-minute TTL
- Lazy loading for charts

**Business Rules**:
- Dashboard shows data for current organization only
- Hierarchical organizations see aggregated child org data
- Data filtered by date range (default: current month)
- Historical comparison available (vs last month/year)
- Can set dashboard as default landing page

---

### FR-ORG-051: Organization Usage Report
**Priority**: P1  
**Description**: System shall generate detailed usage reports for organizations

**Detailed Requirements**:
1. Org admin navigates to Reports → Usage Report
2. System shows report configuration:
   - **Date Range**:
     - Predefined: This week, This month, Last month, This year
     - Custom: Select start and end dates
   - **Report Type**:
     - Summary: High-level overview
     - Detailed: Granular breakdown
     - Comparative: Compare periods
   - **Include Sections** (checkboxes):
     - User statistics
     - Content usage
     - Feature adoption
     - Academic performance
     - Financial summary
     - Technical metrics (API calls, storage)
   - **Format**:
     - PDF (for viewing/printing)
     - Excel (for analysis)
     - CSV (for data processing)
3. Admin configures and generates report
4. System processes (background job if large):
   - Aggregates data from multiple sources
   - Calculates metrics
   - Generates charts and tables
   - Formats per selected output type
5. Report includes:
   
   **Executive Summary** (1 page):
   - Organization details
   - Reporting period
   - Key highlights
   - Top 5 metrics with trends
   
   **User Statistics**:
   - Total users by role
   - New users added
   - User churn
   - Active users (daily, weekly, monthly)
   - Login frequency distribution
   - User engagement score
   
   **Content Usage**:
   - Total content items
   - Most viewed content (top 20)
   - Content by category
   - AR/VR usage statistics
   - Video watch time
   - Download counts
   
   **Feature Adoption**:
   - Attendance usage %
   - Assignment completion rate
   - Exam participation rate
   - Live class attendance
   - Communication activity (messages sent)
   
   **Academic Performance**:
   - Average exam scores
   - Pass/fail rates
   - Subject-wise performance
   - Class-wise rankings
   - Improvement trends
   
   **Financial Summary**:
   - Subscription costs
   - License costs
   - Additional charges
   - Total spent
   - Cost per active user
   
   **Technical Metrics**:
   - Storage used (GB)
   - Bandwidth consumed (GB)
   - API calls made
   - Average response time
   - Uptime percentage
   - Error rate

6. System sends notification when report ready
7. Admin downloads report
8. Report can be scheduled:
   - Daily, weekly, monthly
   - Auto-email to recipients
   - Saved to cloud storage

**Business Rules**:
- Reports retained for 2 years
- Can re-generate historical reports
- Comparative reports require at least 2 periods
- Large reports (>100 pages) split into sections
- Sensitive financial data visible only to authorized admins
- Can white-label reports (organization branding)

**Export Options**:
- PDF: Formatted, ready to print/present
- Excel: Interactive, with pivot tables
- CSV: Raw data for custom analysis
- PowerPoint: Summary slides for presentations

---

### FR-ORG-052: Real-Time Organization Monitoring
**Priority**: P2  
**Description**: System shall provide real-time monitoring of organization activities

**Detailed Requirements**:
1. Org admin navigates to Dashboard → Live Monitoring
2. System displays real-time metrics (WebSocket updates):
   
   **Active Now Section**:
   - Currently logged in users count
   - Live classes in session count
   - Ongoing exams count
   - Active content viewers count
   - Current concurrent users (last minute)
   
   **Live Activity Stream**:
   - Scrolling feed of activities as they happen:
     - "Student A logged in" (2 seconds ago)
     - "Teacher B started live class" (5 seconds ago)
     - "Student C submitted assignment" (10 seconds ago)
     - "Admin D created exam" (15 seconds ago)
   - Each entry shows:
     - Actor (name + role)
     - Action performed
     - Target (if applicable)
     - Timestamp
   - Auto-scrolls with new entries
   - Pause/resume scrolling button
   
   **Geographic Distribution** (world map):
   - Markers showing user locations
   - Size represents concurrent users
   - Hover shows city and count
   
   **System Health Indicators**:
   - API response time (ms)
   - Server load (CPU, memory %)
   - Database query time (ms)
   - Storage available (%)
   - All green/yellow/red status indicators
   
   **Alerts & Anomalies**:
   - Unusual activity detected
   - Spike in errors
   - Performance degradation
   - Security incidents
   - Immediate notification for critical issues

3. Filters available:
   - Activity type (login, content view, exam, etc.)
   - User role
   - Date/time
4. Can drill down into specific activities
5. Export activity log for analysis
6. Set up custom alerts based on thresholds

**Performance**:
- WebSocket connection for real-time updates
- Updates pushed every 1-2 seconds
- Client-side buffering if too many updates
- Automatic reconnection if connection drops
- Graceful degradation to polling if WebSocket unavailable

**Business Rules**:
- Real-time monitoring available on Premium+ tiers
- Activity retention in feed: Last 1000 events
- Historical activity in separate log
- Privacy filters applied (admins see all, others limited)
- Can screenshot/record monitoring session

---

This continues the detailed Organization Management requirements. I'm maintaining the same level of granularity without summaries.

Shall I continue with the remaining requirements in Module 3, or move to Module 4 (Academic Management)?


### FR-ORG-053: Organization Comparison Report
**Priority**: P2  
**Description**: System shall allow comparison between multiple organizations (for groups)  
**Actor**: Organization Owner (Group level)  
**Preconditions**: User manages multiple organizations in hierarchy  
**Postconditions**: Comparative report generated

**Detailed Requirements**:
1. Group owner navigates to Reports → Organization Comparison
2. System shows organization selector:
   - Lists all child organizations
   - Multi-select checkboxes
   - Select All option
   - Filter by type, region, size
3. Owner selects organizations to compare (2-10 orgs)
4. System shows comparison criteria selector:
   - **Performance Metrics**:
     - Average student performance
     - Attendance rates
     - Assignment completion
     - Exam pass rates
   - **Engagement Metrics**:
     - Active users percentage
     - Content usage
     - Feature adoption
     - Login frequency
   - **Operational Metrics**:
     - User count
     - License utilization
     - Storage usage
     - Cost per student
   - **Growth Metrics**:
     - New users added
     - Retention rate
     - Growth rate
5. Owner selects date range and metrics
6. Owner clicks "Generate Comparison"
7. System generates report with:
   
   **Summary Dashboard**:
   - Side-by-side comparison cards
   - Each organization in column
   - Selected metrics in rows
   - Color coding (green/yellow/red)
   - Best performer highlighted
   
   **Detailed Comparison Tables**:
   - Metric by metric breakdown
   - Absolute values
   - Percentage differences
   - Rank order
   - Statistical significance indicators
   
   **Visualizations**:
   - Bar charts for each metric
   - Radar chart for overall performance
   - Trend lines (if historical data)
   - Gap analysis
   
   **Insights & Recommendations**:
   - Best practices from top performers
   - Areas needing attention for low performers
   - Suggestions for improvement
   - Benchmarking against group average
   
   **Ranking Summary**:
   - Overall score per organization
   - Rank order (1st, 2nd, 3rd...)
   - Category-wise rankings
   - Movement from previous period

8. Report exportable as PDF or Excel
9. Can schedule periodic comparisons
10. Can set up alerts for significant changes

**Business Rules**:
- Only accessible to group-level admins
- Minimum 2 organizations required for comparison
- Maximum 10 organizations per report
- Organizations must be at same hierarchy level
- Data normalized for fair comparison (per-capita metrics)
- Anonymous comparison option (hide org names)

**Comparison Algorithms**:
- Weighted scoring system
- Normalization for size differences
- Statistical outlier detection
- Trend analysis over time
- Peer group benchmarking

---

## 7. Organization Billing & Financials

### FR-ORG-060: View Organization Billing Summary
**Priority**: P0  
**Description**: System shall display comprehensive billing information  
**Actor**: Organization Admin, Finance Manager  
**Preconditions**: Organization has active subscription  
**Postconditions**: Current billing status displayed

**Detailed Requirements**:
1. Org admin navigates to Billing & Payments
2. System displays billing dashboard:
   
   **Current Subscription Card**:
   - Subscription tier (FREE, BASIC, PREMIUM, etc.)
   - Billing cycle (Monthly, Quarterly, Annual)
   - Renewal date
   - Auto-renewal status (ON/OFF toggle)
   - Amount charged per cycle
   - Next billing date
   - Payment method on file
   - "Upgrade" or "Downgrade" buttons
   
   **Current Month Summary**:
   - Base subscription cost
   - Additional user charges
   - License costs
   - Storage overages
   - Bandwidth overages
   - Other add-on costs
   - Total amount (before tax)
   - Tax/GST amount
   - **Total Payable** (prominent)
   
   **Payment Status**:
   - Last payment: Amount, Date, Method, Status
   - Outstanding balance (if any)
   - Overdue amount (if any, in red)
   - Days overdue
   - Grace period remaining
   - "Pay Now" button if balance due
   
   **Billing History Table** (last 12 months):
   - Invoice number (clickable)
   - Date
   - Description (subscription, licenses, etc.)
   - Amount
   - Status (Paid, Pending, Failed, Refunded)
   - Download PDF invoice button
   - Download receipt button (if paid)
   
   **Payment Methods Section**:
   - Saved payment methods list:
     - Card: **** **** **** 1234 (Visa, Exp: 12/25)
     - Bank: SBI ***5678
     - UPI: user@paytm
   - Default payment method indicator
   - "Add Payment Method" button
   - "Edit" and "Delete" options per method
   
   **Usage-Based Charges** (if applicable):
   - Storage used: X GB / Y GB (base)
   - Overage: Z GB @ ₹N per GB = ₹M
   - Bandwidth: Similar breakdown
   - API calls: Similar breakdown
   - SMS sent: Count @ ₹X per SMS = ₹Y
   
   **Cost Projections**:
   - Estimated next month cost
   - Based on current usage trends
   - Alerts if projected overage
   
   **Tax Information**:
   - Tax ID / GST number
   - Billing address
   - Tax rate applied
   - Tax exemption status (if any)
   - "Update Tax Info" button

3. All sections collapsible/expandable
4. Data refreshed daily (00:00 UTC)
5. Can manually refresh
6. Export options:
   - PDF billing summary
   - Excel itemized statement
   - CSV transaction history

**Business Rules**:
- Billing updates daily
- Real-time for critical info (outstanding balance)
- Historical data retained indefinitely (financial compliance)
- All amounts shown in organization's currency
- Multi-currency support for international orgs
- Tax calculations automatic based on location
- Invoices auto-generated monthly
- Receipts auto-sent on successful payment

**Access Control**:
- Organization admin: Full access
- Finance role: View + payment actions
- Other admins: View only (no payment actions)
- Regular users: No access

---

### FR-ORG-061: Manage Payment Methods
**Priority**: P0  
**Description**: System shall allow adding and managing payment methods

**Detailed Requirements**:
1. Org admin clicks "Add Payment Method"
2. System shows payment method selector:
   - **Credit/Debit Card**
   - **Bank Account** (Direct debit)
   - **UPI** (India)
   - **Net Banking**
   - **Digital Wallet** (PayTM, PhonePe, etc.)
3. For Credit/Debit Card:
   - Card number input (with live validation)
   - Expiry date (MM/YY)
   - CVV (not stored, one-time use)
   - Cardholder name
   - Billing address (zip code required)
   - "Save for future use" checkbox
   - Powered by Razorpay/Stripe badge (secure)
4. System validates card:
   - Luhn algorithm check
   - Expiry date valid (future date)
   - CVV format correct
   - Address verification (AVS)
5. For UPI:
   - UPI ID input (email@bank format)
   - Verify UPI ID via payment gateway
   - One-time mandate setup for recurring
6. For Bank Account:
   - Account holder name
   - Account number
   - IFSC code
   - Bank name (auto-fetched from IFSC)
   - Account type (Savings/Current)
   - Mandate authorization (NACH)
7. System tokenizes payment method:
   - Card: Store token, last 4 digits, brand
   - Bank: Store token, last 4 digits, bank name
   - UPI: Store VPA handle
   - Never store full card/account numbers
   - PCI DSS compliant storage
8. System adds payment method to list
9. User can:
   - Set as default payment method
   - Edit (limited fields)
   - Delete (with confirmation)
   - Verify (small test charge)
10. For failed payments:
    - System retries with other saved methods
    - Notifies user of failure
    - Requests method update

**Business Rules**:
- Must have at least one payment method for paid subscriptions
- Cannot delete default payment method without setting another
- Cannot delete payment method with pending charges
- Payment methods auto-verified before first use
- Expired cards flagged 30 days before expiry
- Can store up to 5 payment methods
- Last used payment method becomes default

**Security**:
- Payment details encrypted at rest (AES-256)
- Tokenization via payment gateway (never store raw data)
- PCI DSS Level 1 compliance
- 3D Secure authentication for cards
- HTTPS only for payment pages
- CVV never stored (entered each time)
- Audit log for all payment method changes

**Validation**:
- Card number: Luhn algorithm valid
- Expiry: Future date (at least 1 month ahead)
- CVV: 3-4 digits based on card type
- IFSC: Valid Indian bank code
- UPI: Valid VPA format (name@bank)

---

### FR-ORG-062: Process Payment
**Priority**: P0  
**Description**: System shall process payments for subscriptions and charges

**Detailed Requirements**:
1. Payment triggered by:
   - Scheduled: Auto-renewal date reached
   - Manual: User clicks "Pay Now"
   - Usage-based: Monthly usage charges
2. System prepares payment:
   - Calculates total amount
   - Adds applicable taxes
   - Fetches default payment method
   - Generates invoice draft
3. For auto-renewal:
   - System attempts charge 2 days before due date
   - If successful: Done
   - If failed: Retry after 24 hours
   - If still failed: Retry after 48 hours
   - If all retries fail: Suspend subscription
4. For manual payment:
   - User reviews invoice
   - Selects payment method
   - Confirms payment
   - Redirects to payment gateway (if needed)
5. Payment processing:
   - System calls payment gateway API
   - Gateway processes transaction
   - 3D Secure authentication (if required)
   - Gateway returns status
6. If payment successful:
   - Status: COMPLETED
   - Invoice marked as PAID
   - Receipt generated
   - Payment record created
   - Services activated/renewed
   - Confirmation email sent
   - SMS notification sent
7. If payment failed:
   - Status: FAILED
   - Error message captured
   - User notified with failure reason
   - Retry mechanism initiated
   - Grace period started
   - Admin notified if critical
8. Payment record includes:
   - Transaction ID (from gateway)
   - Payment method used
   - Amount (with currency)
   - Gateway charges
   - Net amount received
   - Status
   - Timestamp
   - Failure reason (if failed)
   - Receipt URL
   - Invoice URL

**Business Rules**:
- Auto-retry failed payments: 3 attempts over 7 days
- Grace period after failed payment: 7 days
- Services continue during grace period (with warnings)
- After grace period: Services suspended
- Manual payment bypasses retry delays
- Partial payments not allowed
- Overpayments credited to account balance
- Refunds processed within 5-7 business days

**Payment Gateway Integration**:
- Razorpay (primary, India)
- Stripe (international)
- PayPal (alternative international)
- UPI direct integration (India)
- Fallback to secondary gateway if primary fails

**Error Handling**:
- Insufficient funds: "Payment failed due to insufficient balance"
- Card declined: "Card was declined by your bank"
- Network error: "Connection issue, please try again"
- Gateway timeout: "Payment processing, status will update shortly"
- Invalid details: "Please verify payment information"

**Notifications**:
- Email on success: Payment confirmation, receipt attached
- Email on failure: Payment failed, action required
- SMS on success: Payment received, services active
- SMS on failure: Payment pending, retry or update method
- Dashboard alert: Payment status prominently displayed

---

### FR-ORG-063: Download Invoice/Receipt
**Priority**: P0  
**Description**: System shall generate and provide invoices and receipts

**Detailed Requirements**:
1. User navigates to Billing → Invoices
2. System lists all invoices with details
3. User clicks "Download" for specific invoice
4. System generates invoice PDF with:
   
   **Invoice Header**:
   - Organization logo (if white-labeled)
   - Platform logo (Edubharti)
   - Invoice title: "TAX INVOICE" (prominent)
   - Invoice number: INV-2024-000123
   - Invoice date
   - Due date
   - Payment status badge (PAID/UNPAID/OVERDUE)
   
   **Seller Information** (left column):
   - Company name: Edubharti Pvt Ltd
   - Registered address
   - GST number (India) / Tax ID
   - Email, Phone
   - Website
   
   **Buyer Information** (right column):
   - Organization name
   - Registered address
   - GST number (if applicable)
   - Email, Phone
   - State code (for GST)
   
   **Invoice Details Table**:
   - S.No | Description | Quantity | Unit Price | Amount
   - Row 1: Subscription (Premium, Annual) | 1 | ₹50,000 | ₹50,000
   - Row 2: Additional users (50 users) | 50 | ₹100 | ₹5,000
   - Row 3: Storage overage (20 GB) | 20 | ₹50 | ₹1,000
   - Subtotal: ₹56,000
   - CGST (9%): ₹5,040
   - SGST (9%): ₹5,040
   - **Total Amount: ₹66,080**
   
   **Amount in Words**:
   - Sixty-Six Thousand and Eighty Rupees Only
   
   **Payment Information**:
   - Payment method: Credit Card (**** 1234)
   - Transaction ID: TXN123456789
   - Payment date: DD-MM-YYYY
   - Payment status: Paid
   
   **Terms & Conditions**:
   - Due date for payment
   - Late payment charges
   - Refund policy
   - Jurisdiction clause
   
   **Footer**:
   - Digital signature (if applicable)
   - "Computer generated invoice, no signature required"
   - Page numbers
   - Generated timestamp

5. For receipts (post-payment):
   - Similar format as invoice
   - Title: "PAYMENT RECEIPT"
   - Receipt number instead of invoice number
   - Emphasizes "PAID" status
   - "Thank you for your payment" message
6. System caches generated PDFs (30 days)
7. User can email invoice to self or others
8. Bulk download option (multiple invoices as ZIP)

**Business Rules**:
- Invoices generated automatically on billing
- Invoices immutable once generated (cannot edit)
- If error found: Credit note issued, new invoice generated
- Invoices stored permanently (compliance)
- Sequential invoice numbering (no gaps)
- GST-compliant format (India)
- Multi-currency invoices for international clients
- Company letterhead for enterprise clients

**Formats**:
- PDF (standard, for all)
- Excel (itemized, for accounting)
- XML (e-invoice format, India GST portal)

**Compliance**:
- India: GST-compliant, e-invoice ready
- International: Standard commercial invoice format
- Tax rates based on billing location
- Reverse charge mechanism (if applicable)
- HSN/SAC codes included (India)

---

### FR-ORG-064: Subscription Upgrade/Downgrade
**Priority**: P1  
**Description**: System shall allow changing subscription tier

**Detailed Requirements**:
1. Org admin clicks "Upgrade" or "Change Plan"
2. System shows available tiers:
   - FREE (if currently paid)
   - BASIC
   - PREMIUM
   - ENTERPRISE
3. For each tier, displays:
   - Tier name and badge
   - Monthly/annual pricing
   - Feature comparison table
   - User limits
   - Storage limits
   - Recommended for (size/type)
   - "Current Plan" indicator
   - "Upgrade" or "Downgrade" button
4. User selects new tier
5. System shows change summary:
   - Current tier details
   - New tier details
   - Feature changes (gained/lost)
   - Pricing changes
   - Pro-rated amount calculation:
     - If upgrade: Charge difference (pro-rated)
     - If downgrade: Credit difference (applied to next bill)
   - Effective date: Immediate or next billing cycle
6. For upgrades:
   - User selects immediate or scheduled
   - If immediate: Payment required now
   - If scheduled: Takes effect on renewal date
7. For downgrades:
   - System checks eligibility:
     - Current users <= new tier limit
     - Current storage <= new tier limit
     - No incompatible features in use
   - If eligible: Can proceed
   - If not eligible: Shows what needs adjustment
   - Must reduce usage before downgrade
8. User confirms change
9. System processes:
   - Updates subscription tier
   - Adjusts limits
   - Enables/disables features
   - Processes payment (if upgrade)
   - Issues credit (if downgrade)
   - Updates billing cycle
   - Sends confirmation
10. Services updated immediately or on schedule

**Pro-ration Calculation**:
- Days remaining in current cycle
- Price difference per day
- Charge = (New price - Old price) × (Days left / Total days)
- Credit for downgrade applied to next invoice

**Business Rules**:
- Can upgrade anytime
- Downgrades require eligibility check
- Cannot downgrade below usage level
- Upgrades effective immediately
- Downgrades effective next billing cycle (default)
- Pro-rated charges calculated to the day
- Minimum subscription period: 1 month
- Annual subscriptions: Change at renewal only
- Custom/Enterprise: Contact sales for changes

**Feature Impact**:
- Upgrading: New features available immediately
- Downgrading: Lost features disabled gracefully
- Data retained for 30 days (downgrade)
- Users notified of feature changes
- Can revert within 24 hours (upgrade only)

**Validation**:
- Cannot downgrade if:
  - Users > new tier limit
  - Storage > new tier limit
  - Using premium-only features
  - Active contracts/commitments
- Must resolve above before downgrade allowed

---

Module 3 (Organization Management) now has 29 of 35 requirements documented in extreme detail. Continuing with remaining 6 requirements, then moving to Module 4 (Academic Management). No summaries, maintaining full detailed format throughout.

Shall I continue with the last 6 requirements of Module 3?


### FR-ORG-065: Request Refund
**Priority**: P2  
**Description**: System shall handle refund requests for subscriptions and payments  
**Actor**: Organization Admin, Super Admin  
**Preconditions**: Organization has made payment(s)  
**Postconditions**: Refund request processed and tracked

**Detailed Requirements**:
1. Org admin navigates to Billing → Refunds
2. Clicks "Request Refund"
3. System displays refund request form:
   
   **Payment Selection**:
   - Lists all payments made in last 90 days
   - Each payment shows:
     - Invoice number
     - Date
     - Amount
     - Description
     - Refund eligibility status
   - Admin selects payment to refund
   
   **Refund Type**:
   - Full refund (100%)
   - Partial refund (specify amount)
   - Pro-rated refund (automatic calculation)
   
   **Reason for Refund** (required, dropdown):
   - Service not as described
   - Technical issues preventing usage
   - Duplicate payment
   - Subscription cancelled early
   - Accidental purchase
   - Other (specify in detail)
   
   **Detailed Explanation** (required, min 50 chars):
   - Text area for detailed reason
   - Supporting documents upload (optional):
     - Screenshots
     - Error logs
     - Communication history
   
   **Refund Method** (auto-selected based on original payment):
   - Original payment method (default)
   - Bank transfer (if original method unavailable)
   - Platform credit (for future purchases)
   
4. System validates refund eligibility:
   - Payment within refund window (90 days)
   - Not already refunded
   - No chargebacks initiated
   - Service not extensively used (usage check)
   - No policy violations by organization
5. If eligible:
   - System calculates refund amount:
     - If unused subscription: Pro-rated amount
     - If used services: Amount minus usage charges
     - Processing fee deducted (if applicable)
   - Displays refund amount breakdown
6. Admin reviews and submits request
7. System creates refund request record:
   - Request ID: RFD-2024-000123
   - Status: PENDING_REVIEW
   - Requested by: User ID
   - Requested at: Timestamp
   - Original payment ID
   - Refund amount
   - Reason
   - Supporting documents
8. System notifies:
   - Super admin for approval
   - Finance team for review
   - Org admin: "Request submitted, review in 3-5 days"
9. Super admin reviews request:
   - Views request details
   - Checks payment history
   - Reviews usage statistics
   - Validates reason
   - Can request additional information
   - Makes decision: Approve/Reject/Partial Approve
10. If approved:
    - Status: APPROVED
    - Refund initiated with payment gateway
    - Gateway processes refund (3-7 business days)
    - Status: PROCESSING
    - Once completed by gateway: COMPLETED
    - Organization notified
    - Invoice updated (marked as refunded)
    - Credit note generated
    - Subscription adjusted if applicable
11. If rejected:
    - Status: REJECTED
    - Rejection reason provided
    - Org admin notified with reason
    - Can resubmit with more information
    - Or dispute via support ticket
12. If partial approval:
    - Revised amount stated
    - Reason for reduction explained
    - Org admin can accept or reject revised amount
    - If accepted: Process as approved
    - If rejected: Request escalated

**Refund Processing Timeline**:
- Review: 3-5 business days
- Approval to initiation: 1 business day
- Gateway processing: 5-7 business days
- Total: 9-13 business days typical

**Business Rules**:
- Refund window: 90 days from payment date
- Pro-rated refunds for unused subscription time
- Processing fee: 2% (min ₹50, max ₹500) deducted if applicable
- Usage beyond 30%: Refund may be denied or partial
- Annual subscriptions: Min 30-day notice before cancellation refund
- Custom/Enterprise: Refer to contract terms
- Chargebacks: If initiated, refund request auto-denied
- Multiple refund requests: Max 3 per organization per year
- Refunds reduce organization's trust score
- Abuse of refund policy: Account suspension risk

**Eligibility Criteria**:
- Payment made within 90 days: ✓ Eligible
- Service used < 30%: ✓ Full refund eligible
- Service used 30-70%: ⚠️ Partial refund eligible
- Service used > 70%: ✗ Refund denied (case-by-case review)
- Technical issues documented: ✓ Eligible regardless of usage
- Policy violation by platform: ✓ Full refund eligible

**Refund Methods**:
- Credit/Debit card: Refund to original card (5-7 days)
- UPI: Refund to original UPI ID (3-5 days)
- Bank transfer: Refund to bank account (7-10 days)
- Platform credit: Immediate (usable for future purchases)
- Cash/Cheque: Not supported (digital only)

**Documentation**:
- Credit note generated for all approved refunds
- Invoice marked with "REFUNDED" stamp
- Refund receipt issued
- Accounting entries auto-created
- GST/tax adjustments handled
- Audit trail maintained

**Error Handling**:
- OUTSIDE_REFUND_WINDOW: "Payment is older than 90 days, not eligible for refund"
- ALREADY_REFUNDED: "This payment has already been refunded"
- CHARGEBACK_INITIATED: "Cannot process refund, chargeback is in progress"
- EXCESSIVE_USAGE: "Service usage exceeds refund policy threshold"
- GATEWAY_ERROR: "Unable to process refund, please contact support"

**Notifications**:
- Request submitted: Email to org admin
- Under review: Status update email
- Approved: Email with refund details and timeline
- Rejected: Email with reason and appeal process
- Completed: Email with transaction ID and receipt
- Each status change: In-app notification

**Acceptance Criteria**:
1. Org admin can submit refund request with required details
2. System validates eligibility before submission
3. Super admin can review and approve/reject requests
4. Refund amount correctly calculated with pro-ration
5. Payment gateway integration processes refund
6. Status updates sent to all stakeholders
7. Credit note and receipt generated
8. Audit trail maintained for compliance
9. Rejected requests allow resubmission with more info
10. All refunds complete within stated timeline

---

### FR-ORG-066: View Billing Audit Trail
**Priority**: P1  
**Description**: System shall maintain comprehensive audit trail of all billing activities  
**Actor**: Organization Admin, Super Admin, Auditor  
**Preconditions**: Organization exists with billing activity  
**Postconditions**: Complete audit trail displayed

**Detailed Requirements**:
1. Authorized user navigates to Billing → Audit Trail
2. System displays audit log with entries:
   
   **Log Entry Structure**:
   - Timestamp (date and time, with timezone)
   - Event type (category badge)
   - Actor (who performed action):
     - User name
     - User role
     - User ID
     - IP address
     - Device/browser info
   - Action performed (detailed description)
   - Target entity (what was affected):
     - Invoice ID
     - Subscription ID
     - Payment ID
     - Refund ID
   - Before state (JSON snapshot)
   - After state (JSON snapshot)
   - Changes summary (human-readable)
   - Result (Success/Failed/Partial)
   - Error message (if failed)
   - Associated transaction ID
   - Reference documents (links)
   
   **Event Types** (color-coded badges):
   - 🟢 SUBSCRIPTION_CREATED
   - 🟢 SUBSCRIPTION_RENEWED
   - 🟡 SUBSCRIPTION_UPGRADED
   - 🟡 SUBSCRIPTION_DOWNGRADED
   - 🔴 SUBSCRIPTION_CANCELLED
   - 🔴 SUBSCRIPTION_SUSPENDED
   - 🟢 PAYMENT_INITIATED
   - 🟢 PAYMENT_COMPLETED
   - 🔴 PAYMENT_FAILED
   - 🔴 PAYMENT_REFUNDED
   - 🟡 PAYMENT_METHOD_ADDED
   - 🟡 PAYMENT_METHOD_UPDATED
   - 🔴 PAYMENT_METHOD_DELETED
   - 🟢 INVOICE_GENERATED
   - 🟢 INVOICE_SENT
   - 🟢 INVOICE_PAID
   - 🔴 INVOICE_CANCELLED
   - 🟡 CREDIT_APPLIED
   - 🟡 DISCOUNT_APPLIED
   - 🔴 CHARGEBACK_INITIATED
   - 🔴 CHARGEBACK_RESOLVED
   - 🟡 REFUND_REQUESTED
   - 🟡 REFUND_APPROVED
   - 🔴 REFUND_REJECTED
   - 🟢 REFUND_COMPLETED
   - 🟡 TAX_INFO_UPDATED
   - 🟡 BILLING_ADDRESS_UPDATED
   - 🟡 PRICING_CHANGED
   - 🔴 DUNNING_INITIATED
   - 🔴 ACCOUNT_SUSPENDED
   - 🟢 ACCOUNT_REACTIVATED

3. **Filtering Options**:
   - Date range picker:
     - Presets: Today, Last 7 days, Last 30 days, Last 90 days, Last year, All time
     - Custom: Select start and end dates
   - Event type (multi-select):
     - Group by category: Subscriptions, Payments, Invoices, Refunds, Admin actions
   - Actor (dropdown):
     - Specific user
     - All admins
     - System actions
     - Super admin actions
   - Result status:
     - Success only
     - Failed only
     - All
   - Search:
     - Full-text search across all fields
     - Search by transaction ID, invoice number, user email

4. **Sorting Options**:
   - Timestamp (newest first, oldest first)
   - Event type (alphabetical)
   - Actor (alphabetical)
   - Result (failures first)

5. **Detail View**:
   - Click any log entry to expand
   - Shows complete details:
     - Full JSON of before/after states
     - Complete metadata
     - Related entries (timeline)
     - Associated documents (invoices, receipts)
     - Actions taken by system (auto-retries, notifications)
   - Can copy transaction ID
   - Can export entry as JSON
   - Can generate report for entry

6. **Timeline View** (alternative display):
   - Visual timeline of events
   - Group by day/week/month
   - Color-coded by event type
   - Milestones highlighted (subscription start, renewal, cancellation)
   - Clickable events to view details

7. **Export Options**:
   - Export filtered results:
     - CSV (for spreadsheet analysis)
     - JSON (for programmatic processing)
     - PDF (formatted report)
   - Include options:
     - Summary only
     - Detailed (with before/after states)
     - Attachments (invoices, receipts)
   - Email export link when ready
   - Scheduled exports (daily, weekly, monthly)

8. **Analytics Dashboard**:
   - Event frequency chart (events per day/week)
   - Event type distribution (pie chart)
   - Failed transactions trend
   - Most active users (who made most changes)
   - Peak activity times
   - Anomaly detection (unusual patterns)

9. **Compliance Features**:
   - Audit log immutable (cannot be edited/deleted)
   - Digital signatures on critical events
   - Tamper-proof storage (blockchain hash)
   - Retention: Permanent (financial compliance)
   - Access log (who viewed audit trail)
   - Export for regulatory reporting
   - Integration with external audit systems

10. **Alerting**:
    - Set up alerts for specific event types
    - Notification channels: Email, SMS, Webhook
    - Alert conditions:
      - Payment failure
      - Subscription cancellation
      - Refund requested
      - Multiple failed transactions
      - Suspicious activity detected

**Performance**:
- Indexed for fast searching (timestamp, event type, actor)
- Pagination: 50 entries per page
- Lazy loading for timeline view
- Cached aggregations for analytics
- Archive old entries (>2 years) to cold storage (still accessible)

**Business Rules**:
- All billing actions logged automatically (no exceptions)
- System actions logged with "SYSTEM" as actor
- Background jobs logged with job ID
- Webhook calls logged with request/response
- Failed actions logged with full error details
- Logs retained permanently (compliance)
- Sensitive data (card numbers) masked in logs
- Access to audit trail requires specific permission
- External auditors can be granted read-only access

**Access Control**:
- Organization admin: View own org's audit trail
- Finance role: View billing-related entries only
- Super admin: View all organizations' audit trails
- Auditor role: Read-only access, export capabilities
- Regular users: No access

**Audit Trail for Audit Trail**:
- Viewing audit trail is itself logged
- Exporting audit trail logged
- Filtering/searching logged
- Who accessed what and when

**Acceptance Criteria**:
1. All billing events automatically logged
2. Complete before/after state captured
3. Logs immutable (cannot be altered)
4. Filtering and searching work correctly
5. Export generates accurate reports
6. Timeline view displays events correctly
7. Analytics provide meaningful insights
8. Compliance requirements met (retention, security)
9. Performance remains fast even with large log volumes
10. Access control enforced properly

---

### FR-ORG-067: Organization Data Export
**Priority**: P1  
**Description**: System shall allow organizations to export their complete data  
**Actor**: Organization Admin  
**Preconditions**: Organization has active subscription  
**Postconditions**: Complete data package prepared for download

**Detailed Requirements**:
1. Org admin navigates to Settings → Data Management
2. Clicks "Export Organization Data"
3. System displays data export configuration:
   
   **Export Scope** (checkboxes, all selected by default):
   - ☑ Organization details
   - ☑ User accounts and profiles
   - ☑ Academic data (classes, subjects, syllabus)
   - ☑ Content data (uploaded materials)
   - ☑ Assessment data (exams, assignments, grades)
   - ☑ Attendance records
   - ☑ Financial records (invoices, payments)
   - ☑ Communication logs (messages, announcements)
   - ☑ Activity logs and analytics
   - ☑ Configuration and settings
   - ☑ Uploaded files (documents, images, videos)
   
   **Export Format**:
   - Structured data:
     - JSON (machine-readable, preserves structure)
     - CSV (spreadsheet-friendly, multiple files)
     - XML (interoperable, standard format)
     - SQL dump (database import ready)
   - Files:
     - Original format (preserve as uploaded)
     - Organized in folders by category
   
   **Date Range** (optional, for time-based data):
   - All time (default)
   - Custom: Select start and end dates
   - Applies to: Activity logs, attendance, communications
   
   **Privacy Options**:
   - ☑ Anonymize personal data (emails, phones masked)
   - ☐ Exclude sensitive fields (passwords, payment details)
   - ☐ GDPR-compliant export (minimal data)
   
   **Additional Options**:
   - ☑ Include audit trail
   - ☑ Include system metadata
   - ☐ Compress data (ZIP archive)
   - ☐ Encrypt archive (password-protected)
   - ☐ Split large files (max 2GB per file)

4. Admin configures export and clicks "Start Export"
5. System validates request:
   - User has permission
   - No export in progress
   - Storage available for export
   - No active restrictions on account
6. System creates export job:
   - Job ID: EXP-2024-000123
   - Status: QUEUED
   - Progress: 0%
   - Estimated time: Based on data volume
7. Background job processes export:
   - **Phase 1: Data Collection** (30% progress)
     - Query databases for selected data
     - Collect from multiple microservices
     - Aggregate related records
     - Resolve foreign key relationships
   - **Phase 2: File Gathering** (20% progress)
     - List all uploaded files
     - Download from S3/storage
     - Organize in folder structure:
       ```
       organization-export/
       ├── data/
       │   ├── organization.json
       │   ├── users.json
       │   ├── classes.json
       │   ├── content.json
       │   ├── exams.json
       │   ├── attendance.json
       │   ├── finances.json
       │   └── ...
       ├── files/
       │   ├── content/
       │   │   ├── videos/
       │   │   ├── documents/
       │   │   └── images/
       │   ├── submissions/
       │   ├── reports/
       │   └── ...
       ├── audit-trail.json
       ├── metadata.json
       └── README.txt
       ```
   - **Phase 3: Format Conversion** (20% progress)
     - Convert data to selected format(s)
     - Apply privacy options (anonymization)
     - Generate CSV files from JSON
     - Create SQL dump if selected
   - **Phase 4: Package Creation** (20% progress)
     - Compress into ZIP archive
     - Apply encryption if requested
     - Split into parts if size exceeds limit
     - Calculate checksums for integrity
   - **Phase 5: Finalization** (10% progress)
     - Upload to secure download location
     - Generate download link (pre-signed URL)
     - Update job status to COMPLETED
     - Send notification

8. Admin receives notification:
   - Email: "Your data export is ready"
   - Includes:
     - Download link (valid for 7 days)
     - Export details (size, format, scope)
     - Checksum for verification
     - Expiry date

9. Admin downloads export package:
   - Click link in email or from dashboard
   - Browser download or bulk download tool
   - Multiple downloads allowed within validity period
   - Download logged in audit trail

10. Export package includes:
    - **README.txt**: Instructions for using the export
    - **metadata.json**: Export details, schema versions, timestamps
    - **data/**: All structured data in selected format
    - **files/**: All uploaded files in original format
    - **audit-trail.json**: Complete activity history
    - **checksums.txt**: File integrity checksums (SHA-256)
    - **schema/**: Database schema documentation

11. System manages export lifecycle:
    - Export stored for 7 days
    - After 7 days: Automatically deleted
    - Can re-export anytime (creates new package)
    - Old exports listed with download links (if not expired)
    - Can request extension of download period

**Business Rules**:
- Max one export per organization at a time
- Large exports (>10GB) may take several hours
- Files over 5GB split into 2GB chunks
- Export download valid for 7 days
- Can request multiple exports (new package each time)
- Deleted organizations can request final export within 30 days
- Data export right: GDPR compliance (must be provided)
- No limit on number of exports (reasonable use)
- Enterprise clients: Can schedule periodic auto-exports

**Performance**:
- Small organizations (<500 users): 15-30 minutes
- Medium organizations (500-2000 users): 1-3 hours
- Large organizations (2000+ users): 3-8 hours
- Queue-based processing (background jobs)
- Progress updates every 5%
- Real-time status on dashboard

**Storage**:
- Exports stored in isolated S3 bucket
- Pre-signed URLs for secure download
- Automatic expiry and cleanup
- No permanent storage (temp files only)

**Security**:
- Download link unique and time-limited
- Encryption option (AES-256)
- Password separate from link (sent via SMS)
- Access logged (who downloaded, when)
- Cannot share link (tied to requesting user's session)
- Two-factor authentication required for export (if enabled)

**Data Completeness**:
- All data as of export timestamp
- Consistent snapshot (no partial updates)
- Related records included (referential integrity)
- Metadata explains relationships
- Schema documentation included

**Error Handling**:
- If export fails: Admin notified with reason
- Partial exports not provided (all or nothing)
- Can retry failed exports
- Common errors:
  - Insufficient storage: "Please free up space and retry"
  - Data access error: "Some data inaccessible, contact support"
  - Timeout: "Export too large, try smaller date range"

**Acceptance Criteria**:
1. Admin can configure export scope and format
2. Export job processes in background
3. Progress updates displayed in real-time
4. Complete data package generated correctly
5. Download link sent and accessible
6. Data integrity verified (checksums)
7. Export package structure follows documented format
8. Privacy options applied correctly
9. Large exports handled without timeout
10. Export lifecycle managed (creation, download, expiry, deletion)

---

### FR-ORG-068: Organization Suspension Handling
**Priority**: P1  
**Description**: System shall handle automatic and manual suspension of organizations  
**Actor**: System (automated), Super Admin (manual)  
**Preconditions**: Organization exists and has specific trigger conditions  
**Postconditions**: Organization suspended with appropriate notifications and data handling

**Detailed Requirements**:
1. **Suspension Triggers** (system monitors):
   
   **Payment-Related**:
   - Payment failed 3+ times
   - Outstanding balance >30 days overdue
   - Credit card expired and not updated
   - Chargeback initiated
   - Refund abuse detected
   
   **Policy Violations**:
   - Terms of service violation
   - Content policy breach
   - Fraudulent activity detected
   - Unauthorized access attempts
   - Data scraping detected
   - Spamming/abuse reports
   
   **Usage Anomalies**:
   - Excessive API calls (>150% of tier limit)
   - Storage abuse (uploading non-permitted content)
   - Bandwidth abuse
   - Multiple failed login attempts (security threat)
   
   **Administrative**:
   - Manual suspension by super admin
   - Legal/compliance order
   - Account deletion request (temporary state)
   - License violation

2. When trigger condition met:
   - System evaluates severity (Low/Medium/High/Critical)
   - System determines suspension type:
     - **Soft suspension**: Limited access, read-only mode
     - **Hard suspension**: Complete access block
     - **Temporary suspension**: Auto-resolves after condition fixed
     - **Permanent suspension**: Requires admin review

3. **Pre-Suspension Actions**:
   - System sends warning notifications:
     - Email to org admin
     - In-app banner warning
     - SMS to registered phone
   - Warning includes:
     - Reason for pending suspension
     - Action required to prevent
     - Deadline to resolve
     - Contact information for support
   - Warning timing:
     - Payment issues: 7 days before suspension
     - Policy violations: 48 hours before suspension
     - Critical issues: Immediate suspension (no warning)

4. **Suspension Process**:
   - System updates organization status to SUSPENDED
   - System logs suspension event with:
     - Reason code
     - Trigger details
     - Timestamp
     - Actor (system or admin)
     - Suspension level (soft/hard)
     - Expected resolution steps
   - System executes suspension actions based on level:
     
     **Soft Suspension**:
     - Users can login and view data
     - Cannot create/edit/delete content
     - Cannot make purchases
     - Cannot invite new users
     - Existing schedules continue (read-only)
     - Banner: "Account suspended - Action required"
     
     **Hard Suspension**:
     - All users logged out immediately
     - Login blocked with message
     - All API access revoked
     - Scheduled jobs paused
     - Webhooks disabled
     - Email services paused
     - Content publishing blocked
     - Marketplace listings hidden

5. **User Impact**:
   - Login attempt shows suspension notice:
     - Suspension reason (appropriate level of detail)
     - Action required
     - Support contact
     - Appeal process link
   - Active sessions terminated
   - Mobile app access blocked
   - API keys deactivated
   - Integrations disconnected

6. **Data Handling During Suspension**:
   - All data retained (no deletion)
   - Read access for admins (soft suspension)
   - Data exports allowed (compliance)
   - Backups continue running
   - Logs continue recording
   - Billing history accessible
   - Can download invoices/reports

7. **Notifications Sent**:
   - **To Organization Admin**:
     - Suspension notice email
     - Reason for suspension
     - Resolution steps
     - Appeal process
     - Support contact
     - Expected timeline
   - **To All Users** (optional, based on reason):
     - Service interruption notice
     - Expected resolution timeframe
     - Alternative arrangements (if applicable)
   - **To Super Admin**:
     - Suspension executed notification
     - Requires manual review if critical
   - **To Support Team**:
     - Alert for follow-up
     - Case created automatically

8. **Resolution Process**:
   - Organization takes corrective action:
     - **Payment issues**: Update payment method, clear balance
     - **Policy violations**: Acknowledge, remove violating content, accept terms
     - **Usage abuse**: Reduce usage, upgrade tier if needed
     - **Security issues**: Reset credentials, enable 2FA
   - System validates resolution:
     - Payment received: Auto-unsuspend
     - Content removed: Pending review
     - Upgrade completed: Auto-unsuspend
     - Security fixed: Pending verification
   - If validated: Move to unsuspension
   - If not resolved: Remain suspended

9. **Unsuspension Process**:
   - Automatic (if conditions met):
     - Payment cleared: Immediate
     - Temporary suspension period expired: Automatic
   - Manual review required:
     - Super admin reviews case
     - Verifies resolution
     - Approves unsuspension
     - Can add conditions (probation, reduced limits)
   - System executes unsuspension:
     - Status changed to ACTIVE
     - Access restored
     - Services re-enabled
     - Users notified
     - Grace period monitoring (30 days)

10. **Probation Period** (if applicable):
    - Organization marked as "On Probation"
    - Increased monitoring for 30-90 days
    - Lower thresholds for re-suspension
    - Limited features (if repeat offender)
    - Regular compliance checks

11. **Appeals Process**:
    - Organization can appeal suspension:
      - Submit appeal form
      - Provide justification
      - Upload supporting evidence
      - Request expedited review
    - Super admin reviews appeal:
      - Within 24-48 hours
      - Can overturn or uphold
      - Can modify suspension type
      - Provides detailed response
    - Appeal result communicated:
      - Approved: Immediate unsuspension
      - Denied: Reason explained, next steps
      - Modified: Adjusted suspension terms

**Business Rules**:
- Payment suspensions: 7-day grace period before hard suspension
- Policy violations: Immediate hard suspension for severe violations
- First-time minor violations: Soft suspension with warning
- Repeat offenders: Hard suspension, longer resolution requirements
- Critical security threats: Immediate suspension, no grace period
- Suspended organizations: Data retained for 90 days
- After 90 days: Escalate to deletion process if unresolved
- Cannot delete account while suspended (must resolve first)
- Probation period resets on repeat violation

**Monitoring During Suspension**:
- Track resolution attempts
- Monitor for repeated violations
- Log all access attempts
- Alert on suspicious activity
- Daily status review (automated)

**Financial Impact**:
- Subscription charges paused during suspension
- Usage charges continue (storage, existing services)
- Reactivation may require payment of suspended period
- Refunds considered on case-by-case basis

**Communication Templates**:
- Pre-suspension warning
- Suspension notice
- Resolution instructions
- Unsuspension confirmation
- Probation terms
- Appeal acknowledgment
- Appeal decision

**Acceptance Criteria**:
1. System detects suspension triggers correctly
2. Appropriate suspension level applied
3. Pre-suspension warnings sent timely
4. Suspension executes correctly (access levels)
5. Users notified with clear information
6. Data remains secure and accessible (where appropriate)
7. Resolution process works smoothly
8. Automatic unsuspension when conditions met
9. Manual review process functional
10. Appeals handled within SLA
11. Audit trail complete for compliance

---

### FR-ORG-069: Organization Merger/Split
**Priority**: P3  
**Description**: System shall support merging multiple organizations or splitting one organization into multiple  
**Actor**: Super Admin  
**Preconditions**: Organizations exist and meet merger/split criteria  
**Postconditions**: Organizations merged or split with data migrated correctly

**Detailed Requirements**:

## A. Organization Merger

1. Super admin initiates merger:
   - Navigates to Organizations → Advanced Operations
   - Selects "Merge Organizations"
   
2. System displays merger form:
   
   **Source Organizations** (to be merged):
   - Multi-select dropdown
   - Shows: Name, Type, User count, Status
   - Can select 2-10 organizations
   - All must be same type (all schools, or all districts)
   - All must be ACTIVE status
   
   **Target Organization** (result after merger):
   - Option A: Select existing organization (absorb into)
   - Option B: Create new organization (fresh start)
   
   **Merger Strategy**:
   - **Data Consolidation**:
     - Merge all data (default)
     - Keep source orgs' data separate (tagged)
   - **User Handling**:
     - Merge user accounts (deduplicate by email)
     - Keep separate user accounts (add org tag)
     - Transfer ownership to target org
   - **Content Handling**:
     - Merge content libraries
     - Keep separate (organized by source org)
     - Remove duplicates automatically
   - **Financial Handling**:
     - Combine subscriptions (upgrade if needed)
     - Transfer balances to target org
     - Settle individual accounts first
   
   **Effective Date**:
   - Immediate
   - Scheduled (future date/time)
   - End of billing cycle

3. System validates merger eligibility:
   - All source orgs must be ACTIVE
   - No pending disputes or legal issues
   - All financial obligations settled
   - Organizations in same hierarchy (peers)
   - No circular dependencies
   - Total users <= target org tier limit (or must upgrade)
   - Total storage <= target org quota (or must increase)

4. Admin reviews merger plan:
   - System generates impact analysis:
     - Total users after merger
     - Total content items
     - Storage requirements
     - Bandwidth projections
     - Subscription cost changes
     - Conflicting data (duplicate users, content)
     - Required actions before merger
   - System shows data migration plan
   - Admin can adjust merger strategy

5. Admin confirms merger:
   - Provides reason for merger (required)
   - Acknowledges data migration impact
   - Confirms with password
   - System creates merger job

6. **Merger Execution Process**:
   
   **Phase 1: Pre-Merger Preparation** (10% progress)
   - Create merger record with unique ID (MRG-2024-0001)
   - Lock source organizations (read-only mode)
   - Notify all affected users
   - Create rollback checkpoint
   - Backup all data
   - Status: PREPARING
   
   **Phase 2: User Account Consolidation** (20% progress)
   - Identify duplicate users (by email)
   - For duplicates:
     - Merge profiles (combine data from both)
     - Preserve roles from all source orgs
     - Keep highest permission level
     - Merge activity history
     - Update references in all tables
   - For unique users:
     - Transfer to target organization
     - Update organizationId
     - Preserve all data
   - Create user mapping table (old ID → new ID)
   - Update authentication records
   - Status: MIGRATING_USERS
   
   **Phase 3: Content Migration** (25% progress)
   - Detect duplicate content (by hash, title, metadata)
   - For duplicates:
     - Keep most recent version
     - Or merge if both have unique data
     - Update references to point to merged content
   - For unique content:
     - Transfer ownership to target org
     - Update organizationId
     - Maintain creator attribution
   - Migrate content categories and tags
   - Update content access permissions
   - Rebuild search indexes
   - Status: MIGRATING_CONTENT
   
   **Phase 4: Academic Data Migration** (20% progress)
   - Merge classes (handle conflicts):
     - Same class name: Append source org name as suffix
     - Or combine if truly same class
   - Merge student enrollments
   - Transfer exam records
   - Migrate assignments and submissions
   - Consolidate gradebooks
   - Update teacher assignments
   - Merge timetables (resolve conflicts)
   - Status: MIGRATING_ACADEMIC_DATA
   
   **Phase 5: Financial Consolidation** (10% progress)
   - Transfer subscription to target org (upgrade if needed)
   - Combine license pools
   - Migrate payment methods (verify with owners)
   - Consolidate invoices (keep separate, tag by source)
   - Transfer outstanding balances
   - Update billing address (use target org's)
   - Adjust subscription tier if usage increased
   - Status: MIGRATING_FINANCIAL_DATA
   
   **Phase 6: Communication & History** (10% progress)
   - Merge message threads
   - Consolidate announcements
   - Transfer activity logs (tag by source org)
   - Merge notification preferences
   - Update email templates (target org's branding)
   - Status: MIGRATING_COMMUNICATION
   
   **Phase 7: Settings & Configuration** (5% progress)
   - Merge feature flags (enable union of features)
   - Consolidate roles (preserve custom roles from all)
   - Merge permission sets
   - Update white-label settings (use target org's)
   - Merge integrations (deduplicate)
   - Status: MIGRATING_SETTINGS

   **Phase 8: Finalization & Cleanup** (10% progress)
   - Update all foreign key references
   - Rebuild database indexes
   - Clear caches
   - Update search indexes
   - Mark source orgs as MERGED (soft delete)
   - Set redirects from source to target org
   - Validate data integrity
   - Run consistency checks
   - Status: FINALIZING
   
   **Phase 9: Post-Merger** (completion)
   - Unlock target organization
   - Status: COMPLETED
   - Send completion notifications
   - Generate merger report
   - Schedule post-merger review (7 days)

7. **Notifications**:
   - Before merger: All users notified 48 hours in advance
   - During merger: Progress updates to admins
   - After merger: All users notified of completion
   - Email includes:
     - New organization details
     - Login instructions (if changed)
     - What changed for them
     - Support contact

8. **Post-Merger Actions**:
   - Source organizations marked as MERGED
   - Redirects set up (old URLs → new org URLs)
   - Historical data tagged with source org ID
   - Audit trail maintained for both source and target
   - Source org data retained for 90 days (compliance)
   - After 90 days: Can be archived or deleted

9. **Rollback Process**:
   - Available for 7 days post-merger
   - Super admin can initiate rollback
   - System restores from checkpoint
   - Users notified of rollback
   - Merger marked as ROLLED_BACK

## B. Organization Split

1. Super admin initiates split:
   - Selects "Split Organization"
   - Chooses source organization to split
   
2. System displays split configuration:
   
   **Split Strategy**:
   - By department
   - By location/branch
   - By user groups
   - By class/grade levels
   - Custom (manual selection)
   
   **New Organizations** (result of split):
   - Number of organizations to create (2-10)
   - For each new org:
     - Name (required)
     - Type (inherit or change)
     - Admin assignment (who will manage)
     - Subscription tier (can differ)
   
   **Data Distribution**:
   - **Users**: Assign each user to specific new org
   - **Content**: Duplicate across all or distribute uniquely
   - **Financial**: How to split subscriptions and licenses
   - **Historical data**: Duplicate or split based on relevance

3. **User Assignment**:
   - Upload CSV with user-to-org mapping
   - Or manual assignment (drag & drop interface)
   - Or rule-based:
     - All users in Department X → Org A
     - All users in Location Y → Org B
   - Must assign every user
   - Can assign users to multiple orgs (if needed)

4. System validates split:
   - All users assigned
   - Each new org has at least one admin
   - Subscription costs calculated for each
   - Storage distribution feasible
   - No orphaned data

5. Admin reviews split plan:
   - System shows impact analysis:
     - Users per new org
     - Content distribution
     - Storage per org
     - Subscription costs (total may increase)
     - Data relationships to handle
   - Admin can adjust assignments

6. Admin confirms split:
   - Provides reason for split
   - Confirms subscription changes
   - Confirms with password
   - System creates split job

7. **Split Execution Process**:
   
   **Phase 1: Pre-Split Preparation** (10% progress)
   - Create split record (SPL-2024-0001)
   - Lock source organization (read-only)
   - Create new organization records
   - Generate new tenant IDs
   - Notify all users
   - Backup all data
   - Status: PREPARING
   
   **Phase 2: Organization Setup** (15% progress)
   - Create new organization records
   - Set up infrastructure (databases, storage)
   - Configure settings for each new org
   - Copy white-label settings (if applicable)
   - Set up subscriptions
   - Status: SETTING_UP_ORGS
   
   **Phase 3: User Distribution** (20% progress)
   - For each user:
     - Determine target org(s) from mapping
     - Clone user profile to new org(s)
     - Update organizationId
     - Preserve authentication
     - Maintain user history
   - Update user-org relationships
   - Assign roles in new orgs
   - Status: DISTRIBUTING_USERS
   
   **Phase 4: Content Distribution** (25% progress)
   - For content marked as "Duplicate":
     - Copy to all new orgs
     - Each gets full copy
     - Update ownership references
   - For content marked as "Distribute":
     - Move to assigned org based on rules
     - Update references
   - For shared content:
     - Keep in platform library
     - Grant access to all relevant orgs
   - Update content permissions
   - Status: DISTRIBUTING_CONTENT
   
   **Phase 5: Academic Data Distribution** (20% progress)
   - Distribute classes to new orgs based on:
     - Teacher assignment
     - Department
     - Grade level
     - Custom mapping
   - Migrate student enrollments with classes
   - Split exam records by student org
   - Distribute assignments
   - Split gradebooks
   - Update teacher-student relationships
   - Status: DISTRIBUTING_ACADEMIC_DATA
   
   **Phase 6: Financial Distribution** (10% progress)
   - Create separate subscriptions for each new org
   - Distribute license pools:
     - Based on user counts
     - Or proportional split
     - Or custom allocation
   - Handle payment methods:
     - Can share or separate
     - Verify with org admins
   - Split invoices (historical remain with source)
   - Set up new billing for each org
   - Status: DISTRIBUTING_FINANCIAL

   **Phase 7: Communication & Settings** (5% progress)
   - Distribute messages based on participants
   - Copy announcements (all get copy of general announcements)
   - Split activity logs by user
   - Set up notification preferences for each org
   - Configure email templates (each org can customize)
   - Status: DISTRIBUTING_COMMUNICATION
   
   **Phase 8: Finalization** (5% progress)
   - Update all references and relationships
   - Rebuild indexes for each new org
   - Validate data integrity for each
   - Mark source org as SPLIT (archived)
   - Set up redirects if needed
   - Activate new organizations
   - Status: FINALIZING
   
   **Phase 9: Post-Split** (completion)
   - Status: COMPLETED
   - Unlock all new organizations
   - Send completion notifications
   - Generate split report
   - Schedule post-split review (7 days)

8. **Notifications**:
   - Before split: Users notified 72 hours in advance
   - Includes: Which new org they'll be in
   - During split: Progress updates to admins
   - After split: Each user notified:
     - New organization details
     - New login URL (if applicable)
     - What changed
     - Support contact
   - Admins of new orgs: Onboarding package sent

9. **Post-Split Actions**:
   - Source organization marked as SPLIT (archived)
   - Source org data retained for 90 days
   - New orgs fully independent
   - Can customize settings separately
   - Historical data preserved with tags
   - Audit trails maintained
   - Each org starts fresh billing cycle

10. **Rollback Process**:
    - Available for 7 days post-split
    - Super admin can merge back into original
    - System reverses all changes
    - Users notified of rollback

**Business Rules - Merger**:
- Only organizations at same hierarchy level can merge
- All source orgs must be ACTIVE
- Minimum 2, maximum 10 organizations in one merger
- Merger can take 2-24 hours depending on data volume
- Users notified 48 hours before merger
- Subscription of largest org becomes base (upgraded if needed)
- Cost may increase due to combined usage
- Rollback available for 7 days
- Original org IDs preserved in historical records
- Cannot merge if any org has legal disputes

**Business Rules - Split**:
- Only organizations with 50+ users can be split
- Minimum 2, maximum 10 new organizations
- Each new org must have designated admin
- Each new org needs valid subscription (may increase total cost)
- Split can take 3-48 hours depending on complexity
- Users notified 72 hours before split
- Each new org starts with base features (can upgrade)
- Cannot split if active legal/compliance issues
- Rollback available for 7 days
- Source org archived (not deleted) for audit

**Data Integrity**:
- All mergers/splits use database transactions
- Rollback checkpoints created
- No data loss permitted
- Referential integrity maintained
- Audit trails complete
- Checksums verified after migration
- Consistency checks run automatically

**Performance**:
- Small orgs (<500 users): 2-4 hours
- Medium orgs (500-2000 users): 4-12 hours
- Large orgs (2000+ users): 12-48 hours
- Background job processing
- Progress updates every 5%
- Can pause/resume if needed

**Financial Impact**:
- Merger: Combined subscription (usually higher tier needed)
- Split: Multiple subscriptions (total cost usually higher)
- Pro-rated billing adjustments
- Existing invoices remain separate
- New billing cycles start after completion
- Discounts may apply for bulk (merger)

**Acceptance Criteria**:
1. Super admin can initiate merger/split with proper validation
2. Impact analysis shows accurate projections
3. User and data assignment works correctly
4. Migration process handles all data types
5. No data loss during migration
6. New organizations properly configured
7. Users notified at all stages
8. Rollback functions correctly if needed
9. Audit trail complete for compliance
10. Financial transitions handled correctly
11. All integrations updated with new org IDs

---

### FR-ORG-070: Organization Compliance Reporting
**Priority**: P1  
**Description**: System shall generate compliance reports for regulatory and governance requirements  
**Actor**: Organization Admin, Super Admin, Compliance Officer  
**Preconditions**: Organization has activity data  
**Postconditions**: Compliance reports generated and available

**Detailed Requirements**:
1. Authorized user navigates to Compliance → Reports
2. System displays compliance reporting dashboard:
   
   **Report Categories**:
   - Data Privacy & Protection (GDPR, local laws)
   - Financial Compliance (GST, tax reporting)
   - Educational Standards (accreditation, board requirements)
   - Security & Access (ISO 27001, security audits)
   - User Activity (audit requirements)
   - Content Compliance (copyright, licensing)
   
3. User selects report type to generate:

## A. Data Privacy Compliance Report

**Purpose**: Demonstrate GDPR/data protection law compliance

**Report Sections**:
1. **Data Inventory**:
   - Types of personal data collected:
     - User profiles (name, email, phone, address)
     - Student data (academic records, attendance, grades)
     - Payment information (tokenized)
     - Usage data (activity logs, analytics)
     - Communication data (messages, emails)
   - Data volume: Count of records per category
   - Data location: Server locations, regions
   - Data retention periods: Per data type
   - Backup locations and frequencies

2. **Legal Basis for Processing**:
   - Consent records:
     - Total users with active consent
     - Consent capture date
     - Consent version
     - Withdrawal count
   - Legitimate interest assessments
   - Contractual necessity documentation
   - Legal obligation compliance

3. **User Rights Fulfillment**:
   - Data access requests: Count, avg response time
   - Rectification requests: Count, completion rate
   - Erasure requests (right to be forgotten): Count, fulfillment
   - Data portability: Export requests handled
   - Objection to processing: Cases and resolutions
   - Automated decision-making: Instances and human review

4. **Data Security Measures**:
   - Encryption in transit: TLS 1.3
   - Encryption at rest: AES-256
   - Access controls: RBAC implementation
   - Authentication: 2FA adoption rate
   - Incident log: Security events, breaches (if any)
   - DPO contact information

5. **Third-Party Processors**:
   - List of data processors (cloud providers, email services)
   - Data processing agreements status
   - Sub-processor notifications
   - Data transfer mechanisms (SCCs, adequacy decisions)

6. **Data Breach Log**:
   - Incidents in reporting period
   - Nature of breach
   - Data affected
   - Users impacted
   - Notification timeline
   - Remedial actions taken
   - Status (resolved/ongoing)

**Configuration Options**:
- Date range: Month, quarter, year, custom
- Organization scope: Single org or group
- Format: PDF (detailed), Excel (data), XML (machine-readable)
- Include attachments: Consent forms, DPAs, policies
- Language: English, Hindi, regional languages

**Generation Time**: 5-15 minutes
**Retention**: 7 years (legal requirement)

## B. Financial Compliance Report (India GST/Tax)

**Purpose**: Support tax filing and financial audits

**Report Sections**:
1. **Revenue Summary**:
   - Subscription revenue: Monthly breakdown
   - License sales: By type and quantity
   - Content marketplace: Creator earnings, platform fees
   - Service charges: Setup, support, customization
   - Total revenue: Gross and net
   - Tax collected: CGST, SGST, IGST, separate totals

2. **GST Filing Details**:
   - GSTIN: Organization's GST number
   - Taxable supplies: B2B, B2C breakdown
   - Input tax credit: ITC claimed
   - Tax liability: Calculated amounts
   - Payment details: GSTR-3B data
   - HSN/SAC codes: Service classification
   - Place of supply: State-wise distribution
   - Reverse charge mechanism: Applicable transactions

3. **Invoice Register**:
   - All invoices issued:
     - Invoice number (sequential)
     - Date
     - Customer details (GSTIN, name, address)
     - Taxable value
     - Tax rates and amounts
     - Total invoice value
     - Payment status
     - E-invoice IRN (if applicable)
   - Export format: GSTR-1 compatible

4. **Payment Receipts**:
   - Payment mode wise: Card, UPI, bank transfer, cash
   - Gateway charges: Transaction fees
   - Net amount received: After gateway fees
   - Bank deposits: Reconciliation data
   - Refunds issued: With reasons

5. **Expense & Purchase Register** (if applicable):
   - Vendor purchases
   - Input tax credit eligible
   - Capital expenditure
   - Operating expenses

6. **TDS Details** (if applicable):
   - TDS deducted on payments
   - TDS deposited
   - Form 26AS reconciliation
   - TDS certificates issued

7. **Annual Financial Summary**:
   - Year-over-year comparison
   - Quarter-wise breakdown
   - Profit and loss statement
   - Balance sheet relevant items
   - Audit trail references

**Configuration Options**:
- Financial year: Select year
- Quarter: Q1/Q2/Q3/Q4 or custom date range
- Report format: PDF (presentation), Excel (working), XML (e-filing)
- Include: Bank statements, payment gateway reports
- Certification: Digital signature, CA certification placeholder

**Generation Time**: 10-20 minutes
**Retention**: 7 years (Income Tax Act requirement)
**Special Features**:
- Direct GSTN portal data format export
- E-filing ready (GSTR-1, GSTR-3B formats)
- Reconciliation with bank statements
- Variance reports (expected vs actual)

## C. Educational Standards Compliance Report

**Purpose**: Meet accreditation and board requirements

**Report Sections**:
1. **Academic Delivery**:
   - Curriculum coverage: Percentage completed per subject
   - Board alignment: CBSE/ICSE/State board compliance
   - Learning outcomes: Achievement metrics
   - Remedial actions: For students below threshold
   - Teacher qualifications: Credentials verified

2. **Student Attendance**:
   - Overall attendance percentage
   - Class-wise attendance
   - Below 75% attendance: Student list (detention risk)
   - Leave patterns: Authorized vs unauthorized
   - Attendance improvement measures

3. **Assessment Compliance**:
   - Exams conducted: Frequency, coverage
   - Continuous assessment: Formative assessments
   - Grading distribution: Grade-wise student count
   - Retest/reassessment: Provisions and utilization
   - Result declaration timeliness

4. **Infrastructure Utilization**:
   - Digital resources: Usage statistics
   - AR/VR labs: Utilization hours
   - Library resources: Borrowed items, popular books
   - Online classes: Attendance, completion rates

5. **Teacher Performance**:
   - Teaching hours delivered
   - Student-teacher ratio
   - Professional development: Training hours
   - Student feedback scores
   - Lesson plan completion

6. **Parental Engagement**:
   - PTM attendance: Parent-teacher meetings
   - Communication frequency
   - Issue resolution time
   - Parent satisfaction scores

7. **Safety & Security**:
   - Data security measures
   - Child safety compliance
   - Content moderation: Flagged content handled
   - Incident reports: Bullying, harassment cases

**Configuration Options**:
- Academic year: Select year
- Term: 1st/2nd/Annual
- Classes: Select specific or all
- Format: PDF (official), Excel (analysis)
- Comparison: Previous year benchmarking

**Generation Time**: 15-30 minutes
**Retention**: 10 years (NCERT guidelines)

## D. Security & Access Audit Report

**Purpose**: Demonstrate security controls and access management

**Report Sections**:
1. **Access Control Matrix**:
   - Role definitions: Permissions per role
   - User-role assignments: Current state
   - Privileged access: Admin accounts list
   - Access reviews: Last review date, findings
   - Segregation of duties: Conflicts identified

2. **Authentication & Authorization**:
   - Login success/failure rates
   - Failed login attempts: By user, IP
   - 2FA adoption: Percentage of users
   - Password policy compliance
   - Session management: Timeout settings, active sessions
   - Lockout incidents: Reasons and resolutions

3. **System Access Log**:
   - User logins: Timestamp, IP, device, location
   - Admin actions: Privileged operations performed
   - Configuration changes: System settings modified
   - Data access: Sensitive data viewed/exported
   - Suspicious activities: Anomalies detected

4. **Data Access & Modifications**:
   - Database queries: Read operations on sensitive tables
   - Data modifications: Creates, updates, deletes
   - Bulk operations: Mass data changes
   - Export activities: Who exported what data
   - API access: External integrations, rate limits

5. **Security Incidents**:
   - Incident type: Unauthorized access, data breach, etc.
   - Severity: Critical, high, medium, low
   - Detection time: When discovered
   - Response time: Time to contain
   - Resolution status: Resolved, ongoing, under investigation
   - Root cause: Analysis and findings
   - Preventive measures: Actions taken

6. **Vulnerability Management**:
   - Security scans: Frequency and results
   - Vulnerabilities identified: Count by severity
   - Patching status: Critical patches applied
   - Penetration testing: Last test date, findings
   - Remediation: Issues fixed, pending

7. **Compliance Controls**:
   - ISO 27001 controls: Implemented vs required
   - SOC 2 Type II: Control effectiveness
   - Encryption status: Data at rest and in transit
   - Backup verification: Last successful backup
   - Disaster recovery: DR tests conducted

8. **Third-Party Access**:
   - Vendors with system access
   - API keys issued: Active, expired, revoked
   - Integration security: OAuth tokens, webhooks
   - Vendor security assessments: Compliance status

**Configuration Options**:
- Period: Week, month, quarter, year
- Severity: All, critical only, high+
- Include: Full logs, summary only
- Format: PDF (executive), CSV (detailed logs), SIEM-compatible
- Anonymize: Remove PII if required

**Generation Time**: 20-40 minutes
**Retention**: 7 years (audit requirement)
**Compliance Standards**:
- ISO 27001
- SOC 2 Type II
- NIST Cybersecurity Framework
- PCI DSS (if handling payments)
- Indian IT Act 2000

## E. Content Compliance Report

**Purpose**: Verify content licensing and copyright compliance

**Report Sections**:
1. **Content Inventory**:
   - Total content items: Count by type
   - Uploaded content: User-generated
   - Licensed content: Third-party
   - Open educational resources: Public domain
   - Proprietary content: Platform-owned

2. **Copyright & Licensing**:
   - Content with valid licenses: Percentage
   - License types: Creative Commons, proprietary, OER
   - License expiry: Upcoming renewals
   - Attribution compliance: Proper credits given
   - Usage restrictions: Enforced limits

3. **Content Moderation**:
   - Flagged content: User reports
   - Moderation actions: Approved, removed, edited
   - Policy violations: Copyright infringement, inappropriate
   - Appeals: Submitted, resolved
   - Response time: Average moderation time

4. **Creator Compliance**:
   - Content creators: Verified count
   - Creator agreements: Signed, active
   - Revenue sharing: Payments made
   - Quality standards: Content meeting criteria
   - DMCA takedown notices: Received and processed

5. **Student Content**:
   - Student submissions: Assignments, projects
   - Plagiarism checks: Percentage flagged
   - Original work verification
   - Student content rights: Storage, deletion policies

**Configuration Options**:
- Date range: Custom period
- Content type: Video, document, AR/VR, all
- Creator: Specific creator or all
- Format: PDF (summary), Excel (inventory)

**Generation Time**: 10-20 minutes
**Retention**: Duration of content + 3 years

## F. User Activity Audit Report

**Purpose**: Track user activities for compliance and governance

**Report Sections**:
1. **User Activity Summary**:
   - Total active users: Daily, weekly, monthly actives
   - Login patterns: Peak hours, days
   - Session duration: Average, distribution
   - Feature usage: Most used features
   - Inactive users: Not logged in >30 days

2. **Content Interaction**:
   - Content viewed: Most popular items
   - Downloads: Files downloaded
   - Video watch time: Total hours
   - AR/VR sessions: Duration and completion
   - Assignment submissions: On-time vs late

3. **Communication Activity**:
   - Messages sent: Count by user type
   - Announcements: Posted and viewed
   - Comments: On content, discussions
   - Collaboration: Group activities
   - Support tickets: Created and resolved

4. **Assessment Activity**:
   - Exams attempted: Completion rates
   - Quiz participation: By class, subject
   - Average scores: Trends over time
   - Improvement tracking: Student progress
   - Retest utilization: Second attempt rates

5. **Administrative Actions**:
   - User management: Additions, deletions, role changes
   - Content management: Uploads, approvals, removals
   - System configuration: Settings changed
   - Report generation: Reports created
   - Data exports: Who exported what

6. **Compliance-Related Activities**:
   - Consent updates: Acceptance, withdrawals
   - Privacy settings: Changes made
   - Data access requests: Submitted and fulfilled
   - Policy acknowledgments: Terms accepted
   - Training completions: Mandatory courses

**Configuration Options**:
- Period: Daily, weekly, monthly, custom
- User roles: All, specific roles
- Activity type: All, specific categories
- Aggregation: By user, by department, by class
- Format: PDF (graphs), Excel (raw data), CSV

**Generation Time**: 15-25 minutes
**Retention**: 2 years (standard practice)

## General Report Features (All Reports)

**Report Generation Process**:
1. User configures report parameters
2. System validates selections
3. User clicks "Generate Report"
4. System creates background job:
   - Job ID: REP-2024-000123
   - Status: QUEUED → PROCESSING → COMPLETED
   - Progress: 0% to 100%
5. User can monitor progress in real-time
6. Notification sent when complete
7. Download link provided (valid 30 days)

**Report Metadata** (included in all reports):
- Report title and type
- Organization details
- Generation date and time
- Report period covered
- Generated by (user name, role)
- Report version/revision
- Confidentiality level
- Page numbers and total pages
- Digital signature (optional)
- Watermark (if configured)

**Distribution Options**:
- Download directly: PDF, Excel, CSV, XML
- Email to recipients: Multiple addresses
- Schedule recurring: Daily, weekly, monthly
- Upload to cloud: Google Drive, OneDrive, Dropbox
- API export: JSON format for integrations
- Print-ready: Formatted for physical printing

**Customization**:
- White-label: Organization branding
- Logo: Header and footer logos
- Colors: Custom color scheme
- Sections: Include/exclude specific sections
- Charts: Select chart types
- Language: Multi-language support

**Security & Access**:
- Role-based access: Who can generate/view
- Watermarking: "CONFIDENTIAL" for sensitive reports
- Encryption: Password-protected downloads
- Audit trail: Report access logged
- Expiry: Auto-delete after retention period
- Redaction: Mask sensitive data if needed

**Compliance Features**:
- Digital signatures: Cryptographic signing
- Tamper-evident: Hash verification
- Version control: Track report versions
- Certification: Include compliance certifications
- Attestation: Admin sign-off
- Archival: Long-term storage format (PDF/A)

**Scheduling & Automation**:
- Schedule recurring reports:
  - Frequency: Daily, weekly, monthly, quarterly, annually
  - Time: Specific time of day
  - Recipients: Email distribution list
  - Format: Default format per recipient
- Auto-generation: On specific events
- Dashboard widgets: Summary on main dashboard
- Alerts: If compliance thresholds breached

**Integration & Export**:
- API endpoints: RESTful API for report data
- Webhooks: Notify external systems
- SFTP: Upload to customer servers
- ERP integration: Push to Tally, QuickBooks
- Government portals: Direct filing (GST, etc.)
- Blockchain: Immutable audit trail

**Business Rules**:
- Compliance reports retained per legal requirements
- Minimum retention: 2 years (general), 7 years (financial)
- Access restricted to authorized roles
- Super admin can access all org reports
- Cannot modify generated reports (immutable)
- Can regenerate with same parameters
- Sensitive data masked based on viewer role
- Large reports (>100 pages) may take up to 1 hour
- Concurrent generation limit: 3 per organization
- Historical reports: Can regenerate for any past period

**Performance**:
- Small reports (<50 pages): 5-10 minutes
- Medium reports (50-200 pages): 10-30 minutes
- Large reports (200+ pages): 30-60 minutes
- Background processing (non-blocking)
- Queue priority for regulatory deadlines
- Cached reports for repeated requests

**Error Handling**:
- Insufficient data: "Not enough data for selected period"
- Access denied: "You don't have permission for this report type"
- Generation failed: "Report generation failed, please retry"
- Timeout: "Report too large, try shorter period"
- Export error: "Unable to export, check format compatibility"

**Acceptance Criteria**:
1. All six report types can be generated successfully
2. Report configuration options work correctly
3. Data in reports is accurate and complete
4. Reports comply with respective regulations
5. Scheduling and automation function properly
6. Distribution methods work as expected
7. Security and access controls enforced
8. Reports are tamper-evident and auditable
9. Performance meets stated SLAs
10. Integration with external systems functional
11. Retention policies automatically enforced
12. Users receive notifications appropriately

---

## Module Summary

**Module**: Organization Management (ORG)  
**Total Requirements**: 35 (COMPLETE)  
**Priority**: P0-P3 (Critical to Optional)  
**Status**: ✅ All requirements documented

**Requirements Breakdown**:
- Organization Onboarding: 6 requirements (FR-ORG-001 to FR-ORG-006)
- White-Label Branding: 4 requirements (FR-ORG-010 to FR-ORG-013)
- Organization Settings: 4 requirements (FR-ORG-020 to FR-ORG-023)
- Organization Users: 5 requirements (FR-ORG-030 to FR-ORG-034)
- Organization Licensing: 5 requirements (FR-ORG-040 to FR-ORG-044)
- Organization Analytics: 4 requirements (FR-ORG-050 to FR-ORG-053)
- Billing & Financials: 5 requirements (FR-ORG-060 to FR-ORG-064)
- Advanced Operations: 2 requirements (FR-ORG-065 to FR-ORG-066)
- Data Management: 1 requirement (FR-ORG-067)
- Organization Operations: 3 requirements (FR-ORG-068 to FR-ORG-070)

**Next Module**: Academic Management (50 requirements)

---


---

## Summary

**Total Requirements**: 35 (Complete)

**Sections Covered**:
1. Organization Onboarding (FR-ORG-001 to FR-ORG-006): 6 requirements
2. White-Label Branding (FR-ORG-010 to FR-ORG-013): 4 requirements
3. Organization Settings (FR-ORG-020 to FR-ORG-023): 4 requirements
4. Organization Users (FR-ORG-030 to FR-ORG-034): 5 requirements
5. Organization Licensing (FR-ORG-040 to FR-ORG-044): 5 requirements
6. Organization Analytics (FR-ORG-050 to FR-ORG-053): 4 requirements
7. Organization Billing & Financials (FR-ORG-060 to FR-ORG-070): 7 requirements

**Priority Distribution**:
- P0 (Critical): 18 requirements (51.4%)
- P1 (High): 13 requirements (37.1%)
- P2 (Medium): 3 requirements (8.6%)
- P3 (Low): 1 requirement (2.9%)

**Key Capabilities**:
- Multi-level organization hierarchy (Ministry → State → District → School)
- Organization onboarding and verification workflow
- White-label branding: Custom logos, colors, domains, email templates
- Feature toggles for modular functionality per organization
- User management within organizations with role-based access
- License pool creation and management
- Organization-level analytics and dashboards
- Usage monitoring and reporting
- Billing and subscription management
- Payment method management
- Invoice and receipt generation
- Subscription upgrade/downgrade
- Refund request handling
- Data export (GDPR compliance)
- Organization suspension and reactivation
- Organization merger and split capabilities
- Compliance reporting for regulatory requirements

---

**Module Status**: ✅ **COMPLETE** (35/35 requirements documented with medium-level detail)

**Overall Progress**: 166 of 880 requirements (18.9%)

---
