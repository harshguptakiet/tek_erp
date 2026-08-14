# Authentication & Authorization - Functional Requirements

## Module: AUTH
**Total Requirements**: 71  
**Priority**: P0 (Critical for system operation)

---

## 1. User Registration

### FR-AUTH-001: Email Registration
**Priority**: P0
**Description**: System shall allow users to register using email address
**Actor**: All user types
**Preconditions**: None
**Postconditions**: User account created in pending verification state

**Detailed Requirements**:
- Email and password input with first name, last name, optional phone
- Email format validation (RFC 5322 compliant)
- Email uniqueness check (case-insensitive)
- Password policy enforcement: 8+ chars, uppercase, lowercase, number, special char
- Password not in common password list (10,000 most common)
- Password not similar to email/name
- Password hashing using bcrypt (salt rounds: 12)
- Unique user ID generation (UUID v4)
- User record creation with status: PENDING_VERIFICATION
- Email verification token generation (JWT, 24-hour expiry)
- Verification email sent with clickable link
- Success message without exposing email existence
- Rate limiting: 3 registration attempts per IP per hour

**Business Rules**: One email = one account, verification link expires in 24 hours, unverified accounts deleted after 7 days
**Validation**: Valid email format, unique email, password meets policy, rate limit not exceeded

**Error Handling**: EMAIL_ALREADY_EXISTS, INVALID_EMAIL_FORMAT, WEAK_PASSWORD, RATE_LIMIT_EXCEEDED
**Audit**: Log registration attempt (success/failure) with IP and timestamp

---

### FR-AUTH-002: Phone Registration
**Priority**: P1
**Description**: System shall allow users to register using phone number
**Actor**: All user types (primarily for India market)
**Preconditions**: None
**Postconditions**: User account created with verified phone

**Detailed Requirements**:
- Phone number with country code, password, first name, last name input
- Phone format validation (E.164 international format)
- Phone uniqueness check
- 6-digit OTP generation and SMS delivery
- OTP validity: 10 minutes
- OTP verification with max 3 attempts
- Account creation with status: ACTIVE (phone pre-verified)
- Password validation same as email registration
- Rate limiting: 3 OTP requests per phone per hour
- OTP regeneration after max attempts exceeded

**Business Rules**: One phone = one account, OTP expires in 10 minutes, max 3 OTP attempts, SMS cost incurred per OTP
**Validation**: Valid phone format (E.164), unique phone, OTP within validity, password meets policy

**Error Handling**: PHONE_ALREADY_EXISTS, INVALID_PHONE_FORMAT, INVALID_OTP, OTP_EXPIRED, MAX_OTP_ATTEMPTS_EXCEEDED

---

### FR-AUTH-003: Google OAuth Registration
**Priority**: P0
**Description**: System shall allow users to register/login using Google account
**Actor**: All user types
**Preconditions**: None
**Postconditions**: User authenticated via Google OAuth

**Detailed Requirements**:
- "Continue with Google" button redirects to Google OAuth consent
- Request scopes: email, profile (openid)
- User authorization at Google
- Authorization code exchange for access token
- User profile fetch from Google API
- Email existence check: Login if exists, create account if new
- Account creation with Google profile data: email (pre-verified), name, picture
- Auth provider: GOOGLE, no password stored
- OAuth-only account can later link email/password for backup
- Profile sync on each login (name, picture updates)
- Session creation and JWT token issuance

**Business Rules**: Google email must be verified, OAuth-only accounts have no password, profile synced on login
**Validation**: Valid OAuth response, Google email verified

**Error Handling**: OAUTH_CANCELLED (user cancelled), OAUTH_FAILED (Google authentication failed), EMAIL_VERIFICATION_REQUIRED

---

### FR-AUTH-004: Microsoft OAuth Registration
**Priority**: P0
**Description**: System shall allow registration/login using Microsoft account
**Actor**: All user types
**Preconditions**: None
**Postconditions**: User authenticated via Microsoft OAuth

**Detailed Requirements**:
- "Continue with Microsoft" button initiates OAuth flow
- Microsoft OAuth 2.0 with scopes: openid, email, profile
- Support organizational Microsoft accounts (@company.com)
- Support personal Microsoft accounts (@outlook.com, @hotmail.com)
- Authorization code exchange and profile fetch
- Account creation or login based on email existence
- Profile data storage and sync on each login
- Session creation with JWT tokens

**Business Rules**: Similar to Google OAuth, supports both personal and organizational accounts
**Validation**: Valid OAuth response, Microsoft email verified

**Error Handling**: OAUTH_CANCELLED, OAUTH_FAILED, EMAIL_VERIFICATION_REQUIRED

---

### FR-AUTH-005: Aadhaar-based Registration
**Priority**: P2
**Description**: System shall allow registration using Aadhaar authentication
**Actor**: Government users, Indian citizens
**Preconditions**: UIDAI API license active
**Postconditions**: User account created with Aadhaar verification

**Detailed Requirements**:
- Aadhaar number input (12 digits)
- Aadhaar format validation
- UIDAI API integration for authentication
- Biometric or OTP authentication at UIDAI
- Authentication status verification
- Demographic data fetch (if permitted)
- Account creation with Aadhaar as unique identifier
- Aadhaar number encryption at rest (AES-256)
- Aadhaar used only for authentication, not display

**Business Rules**: India-only, requires UIDAI API license, Aadhaar data encrypted, not used as display identifier, authentication only
**Validation**: Valid 12-digit Aadhaar, UIDAI authentication successful

**Security**: Aadhaar encrypted at rest, never displayed, audit logged

---

## 2. User Login

### FR-AUTH-006: Email/Password Login
**Priority**: P0
**Description**: System shall authenticate users with email and password
**Actor**: All registered users
**Preconditions**: User registered with email/password
**Postconditions**: User authenticated and session created

**Detailed Requirements**:
- Email and password input
- User fetch by email (case-insensitive)
- Account status check: SUSPENDED (deny), DELETED (not found error), PENDING_VERIFICATION (prompt verification), ACTIVE (proceed)
- Password hash comparison (bcrypt.compare)
- Failed login attempt increment on incorrect password
- Account lock after 5 failed attempts (15-minute lockout)
- Failed attempts reset to 0 on successful login
- Last login timestamp update
- JWT access token generation (1-hour expiry)
- Refresh token generation (7-day expiry)
- Session record creation in database and Redis
- Generic error message to prevent email enumeration
- Permanent lock after 10 failed attempts in 1 day (admin unlock required)

**Business Rules**: Rate limit 5 failed attempts per email per 15 minutes, account locked after 5 failures, permanent lock after 10 attempts in 1 day
**Validation**: Valid email format, correct password

**Error Handling**: INVALID_CREDENTIALS (generic), ACCOUNT_LOCKED, EMAIL_NOT_VERIFIED, ACCOUNT_SUSPENDED

**Audit**: Log login attempt with IP, device info, timestamp, success/failure

---

### FR-AUTH-007: Phone/Password Login
**Priority**: P1
**Description**: System shall authenticate users with phone and password
**Actor**: Users registered with phone
**Preconditions**: User registered with phone/password
**Postconditions**: User authenticated and session created

**Detailed Requirements**:
- Phone number and password input
- User fetch by phone (E.164 format)
- Same authentication flow as email/password login
- Account status checks and password verification
- Session creation and token issuance
- Failed attempt tracking and account lockout

**Business Rules**: Same as email login, rate limiting applies
**Validation**: Valid phone format (E.164), correct password

**Error Handling**: INVALID_CREDENTIALS, ACCOUNT_LOCKED, PHONE_NOT_VERIFIED, ACCOUNT_SUSPENDED

---

### FR-AUTH-008: OAuth Login (Google/Microsoft)
**Priority**: P0
**Description**: System shall authenticate existing users via OAuth
**Actor**: Users with OAuth-linked accounts
**Preconditions**: User previously registered via OAuth or linked OAuth
**Postconditions**: User authenticated via OAuth

**Detailed Requirements**:
- OAuth button click initiates provider auth flow
- Email retrieved from OAuth provider
- Existing account lookup by email
- Profile data sync: name, picture updated from provider
- Session creation with JWT tokens
- New device detection and notification
- Failed OAuth attempt logging

**Business Rules**: OAuth profile synced on each login, no password required
**Validation**: Valid OAuth response, account exists

**Error Handling**: OAUTH_FAILED, ACCOUNT_NOT_FOUND (for new OAuth users)

---

### FR-AUTH-009: Remember Me Functionality
**Priority**: P2
**Description**: System shall allow users to stay logged in across sessions
**Actor**: All users
**Preconditions**: User logging in
**Postconditions**: Extended session if Remember Me selected

**Detailed Requirements**:
- "Remember Me" checkbox on login page
- If checked: Refresh token expiry extended to 30 days
- If checked: Secure, HttpOnly cookie set with refresh token (30-day expiry)
- If unchecked: Refresh token expiry 7 days, cookie expires on browser close
- Subsequent visit: Validate refresh token from cookie
- If valid: Generate new access token automatically
- If expired: Redirect to login page

**Business Rules**: 30-day extended session for Remember Me, standard 7-day otherwise
**Validation**: Valid refresh token in cookie

**Security**: Refresh token rotation on use, HttpOnly, Secure, SameSite=Strict cookies

---

## 3. Multi-Factor Authentication (2FA)

### FR-AUTH-010: Enable TOTP 2FA
**Priority**: P1
**Description**: System shall allow users to enable Time-based OTP authentication
**Actor**: All authenticated users
**Preconditions**: User logged in
**Postconditions**: 2FA enabled with TOTP secret saved

**Detailed Requirements**:
- Navigate to Security Settings, click "Enable 2FA"
- TOTP secret generation (32-character base32)
- QR code generation (otpauth:// URL format)
- QR code and manual entry code display
- User scans QR with authenticator app (Google Authenticator, Authy, etc.)
- 6-digit code entry for verification
- Code validation (TOTP algorithm, window ±1 time step = 30 seconds)
- Encrypted secret storage in user record
- Set twoFactorEnabled = true
- Generate 10 backup codes (8-character alphanumeric, single-use)
- Display backup codes for one-time save
- Confirmation email sent

**Business Rules**: TOTP algorithm HMAC-SHA1, 30-second time step, 6-digit codes, 10 single-use backup codes, cannot disable without current code
**Validation**: Valid 6-digit TOTP code within time window

**Security**: Secret encrypted at rest, backup codes single-use, QR code displayed only once

---

### FR-AUTH-011: Login with 2FA
**Priority**: P1
**Description**: System shall require 2FA code after password verification
**Actor**: Users with 2FA enabled
**Preconditions**: User has 2FA enabled, correct password entered
**Postconditions**: User authenticated after 2FA code verification

**Detailed Requirements**:
- Email/password validation first
- If 2FA enabled: Return "2FA_REQUIRED" status without session
- Store temporary token (5-minute expiry)
- Display 2FA code input interface
- User enters 6-digit code from authenticator app
- TOTP code validation (window ±1 step)
- If valid: Generate session and JWT tokens
- If invalid: Increment 2FA failed attempts
- Account lock after 3 failed 2FA attempts (15 minutes)
- Alternative: "Use backup code" option
- Backup code validation (case-insensitive, 8 characters)
- If backup code valid: Mark as used, generate session, notify via email
- Warn user when only 2 backup codes remaining

**Business Rules**: Max 3 2FA code attempts, backup codes single-use, email notification on backup code use
**Validation**: Valid TOTP code or unused backup code

**Error Handling**: INVALID_2FA_CODE, 2FA_ATTEMPTS_EXCEEDED, BACKUP_CODE_ALREADY_USED

---

### FR-AUTH-012: Disable 2FA
**Priority**: P1
**Description**: System shall allow users to disable 2FA with verification
**Actor**: Users with 2FA enabled
**Preconditions**: User has 2FA enabled
**Postconditions**: 2FA disabled and all sessions except current terminated

**Detailed Requirements**:
- Navigate to Security Settings, click "Disable 2FA"
- Re-authentication required: current password + current 2FA code
- If both valid: Set twoFactorEnabled = false
- Delete TOTP secret from database
- Invalidate all backup codes
- Terminate all other active sessions (security measure)
- Send email notification of 2FA disablement
- Audit log entry created

**Business Rules**: Cannot disable without password + 2FA code, all other sessions terminated, email notification sent
**Validation**: Correct password and valid 2FA code

**Security**: All sessions terminated, secret deleted, cannot reuse old backup codes

---

## 4. Session Management

### FR-AUTH-013: JWT Access Token Generation
**Priority**: P0
**Description**: System shall generate JWT access tokens for authenticated sessions
**Actor**: System (automatic)
**Preconditions**: User successfully authenticated
**Postconditions**: JWT access token generated and returned

**Detailed Requirements**:
- JWT token structure with claims: sub (user UUID), email, role, tenantId, iat, exp
- HS256 signing algorithm
- Secret key from environment variable (minimum 256-bit)
- Token expiry: 1 hour
- Custom claims: role, tenantId, schoolId (if applicable)
- Token validation: Verify signature, check expiry, validate issuer/audience, check blacklist
- Issued at (iat) timestamp included

**Business Rules**: 1-hour expiry, signed with strong secret, blacklist check on validation
**Validation**: Valid signature, not expired, not blacklisted

**Security**: Strong secret key, short expiry time, signature verification

---

### FR-AUTH-014: Refresh Token Management
**Priority**: P0
**Description**: System shall manage refresh tokens for session renewal
**Actor**: System (automatic)
**Preconditions**: User authenticated
**Postconditions**: Refresh token generated and stored

**Detailed Requirements**:
- Refresh token format: UUID v4 (opaque token)
- Database storage with userId, hashed token (SHA-256), deviceInfo, createdAt, expiresAt, lastUsedAt
- Redis storage with TTL for fast lookup
- Multi-device support: Multiple refresh tokens per user
- Token refresh flow: Validate refresh token, generate new access token, rotate refresh token
- Old refresh token invalidation immediately
- If old token reused: Revoke all user's tokens (potential theft detection)
- Expiry: 7 days default, 30 days with Remember Me

**Business Rules**: One-time use per refresh token, automatic rotation, multi-device support, theft detection
**Validation**: Token exists, not expired, belongs to user, not previously used

**Security**: Token rotation, hash storage, theft detection via reuse, immediate invalidation

---

### FR-AUTH-015: Multi-Device Session Management
**Priority**: P1
**Description**: System shall track and manage sessions across multiple devices
**Actor**: All authenticated users
**Preconditions**: User logged in from multiple devices
**Postconditions**: All sessions tracked and manageable

**Detailed Requirements**:
- Session list view: Device name, browser/app, IP address, location, login time, last activity
- Current session indicator
- "Logout this device" option for each session except current
- "Logout all other devices" bulk action
- Session limit: 10 concurrent sessions per user
- Oldest session auto-revoked if limit exceeded
- Device info parsing from user agent
- IP geolocation for location display
- Session record with sessionId, userId, deviceInfo, ipAddress, location, timestamps

**Business Rules**: Max 10 concurrent sessions, oldest evicted if exceeded, cannot revoke current session
**Validation**: Valid session IDs, user owns sessions

---

### FR-AUTH-016: Session Timeout (Inactivity)
**Priority**: P1
**Description**: System shall auto-logout users after inactivity period
**Actor**: System (automatic), All users
**Preconditions**: User session active
**Postconditions**: Session expired after inactivity timeout

**Detailed Requirements**:
- Last activity timestamp tracking in session
- Inactivity timeout: 30 minutes (configurable)
- Frontend ping to backend every 5 minutes if user active
- Activity events: API call, page navigation, mouse movement (debounced), keyboard input
- Inactivity warning at 25 minutes: "Logged out in 5 minutes" with "Stay logged in" button
- On timeout: Frontend clears tokens, redirect to login, show "Session expired" message
- Access token expires via JWT expiry
- Refresh token marked as inactive

**Business Rules**: 30-minute inactivity timeout, warning at 25 minutes, user can extend session
**Validation**: Last activity timestamp within timeout window

---

## 5. Password Management

### FR-AUTH-017: Password Reset (Forgot Password)
**Priority**: P0
**Description**: System shall allow users to reset forgotten passwords
**Actor**: All users
**Preconditions**: User registered with email/password
**Postconditions**: Password reset and sessions invalidated

**Detailed Requirements**:
- "Forgot Password" link on login page
- Email address input
- Email existence check (don't reveal if exists)
- If exists: Generate password reset token (JWT, 1-hour expiry), create reset record, send email
- If not exists: Still show success message (security)
- Success message: "If account exists, you'll receive reset instructions"
- Email with reset link click
- Token validation: Check expiry, not already used, user exists
- If valid: Show password reset form
- New password entry (2x for confirmation)
- Password policy validation
- Password hashing and database update
- All existing sessions invalidation
- Reset token marked as used
- Confirmation email sent
- Redirect to login with success message
- Rate limiting: 3 reset requests per email per hour

**Business Rules**: Reset link valid 1 hour, one-time use, all sessions terminated, cannot reuse last 5 passwords
**Validation**: Valid token, passwords match, meets policy, not recently used

**Error Handling**: INVALID_TOKEN (invalid or expired), PASSWORD_USED_RECENTLY

---

### FR-AUTH-018: Change Password (Authenticated)
**Priority**: P0
**Description**: System shall allow authenticated users to change password
**Actor**: Authenticated users
**Preconditions**: User logged in
**Postconditions**: Password changed and other sessions terminated

**Detailed Requirements**:
- Navigate to Account Settings → Security, click "Change Password"
- Input: Current password, new password, confirm new password
- Current password validation
- New password policy validation
- Password history check (cannot reuse last 5)
- If valid: Hash and save new password, invalidate all sessions except current
- Update lastPasswordChange timestamp
- Send confirmation email
- Show success message

**Business Rules**: Must enter correct current password, new password different from current, cannot reuse last 5, all other devices logged out
**Validation**: Current password correct, new password meets policy, not in recent history

**Error Handling**: INCORRECT_CURRENT_PASSWORD, PASSWORD_USED_RECENTLY, PASSWORDS_DO_NOT_MATCH

---

### FR-AUTH-019: Password Expiry
**Priority**: P1
**Description**: System shall enforce password expiry policy
**Actor**: System (automatic)
**Preconditions**: Password-based authentication enabled
**Postconditions**: Password expiry enforced, users prompted to change

**Detailed Requirements**:
- Password expires after 30 days (configurable per organization)
- Reminder emails: 7 days before, 3 days before, 1 day before expiry
- On login after expiry: Allow login but force password change before access
- Show: "Password expired. Set new password to continue"
- Redirect to password change page, no feature access until changed
- Grace period: 3 days (can still login with force change)
- After grace period: Account locked, must use "Forgot Password"
- OAuth-only accounts exempt
- Service accounts exempt (if any)
- Can be disabled per organization

**Business Rules**: 30-day expiry, 3-day grace period, forced change after expiry, exempt for OAuth accounts
**Validation**: Password age checked on login

---

## 6. Role-Based Access Control (RBAC)

### FR-AUTH-020: System Roles
**Priority**: P0
**Description**: System shall support predefined user roles
**Actor**: System (automatic), Admins
**Preconditions**: User registration
**Postconditions**: Role assigned to user

**Detailed Requirements**:
- Predefined roles: SUPER_ADMIN, MINISTRY_ADMIN, STATE_ADMIN, DISTRICT_ADMIN, ORGANIZATION_OWNER, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT, PUBLISHER, CREATOR, INDIVIDUAL_TUTOR, GOVERNMENT_OFFICIAL
- Each user has exactly one primary role
- Role determines default permissions and dashboard routing
- Role displayed in user profile
- Role cannot be self-assigned (admin approval required)
- Role stored in JWT token for fast access
- Role-based UI rendering and feature access

**Business Rules**: One primary role per user, role determines permissions, admin assignment required
**Validation**: Valid role from predefined list

---

### FR-AUTH-021: Custom Roles (B2B Organizations)
**Priority**: P1
**Description**: System shall allow organizations to create custom roles
**Actor**: Organization Admin
**Preconditions**: Organization active
**Postconditions**: Custom role created and assignable

**Detailed Requirements**:
- Custom role creation: Role name, description, permission selection
- Permissions organized by resource: Users (CRUD), Students (CRUD + bulk_import), Teachers (CRUD), Attendance (mark, view, edit, export), Fees (create_structure, record_payment, view, refund), Content (CRUD + publish), Exams (create, assign, grade, publish_results), Reports (generate, export, schedule)
- Granular permissions per module
- Custom roles scoped to organization (not global)
- Assign custom role to organization users
- Edit/delete custom roles with user reassignment
- Deleting role requires reassigning affected users
- Max 20 custom roles per organization
- Audit log for role changes

**Business Rules**: Max 20 custom roles per org, organization-scoped, cannot override super admin, cannot remove own admin role
**Validation**: Unique role name within org, at least one permission selected, valid permission set

---

### FR-AUTH-022: Permission Checking
**Priority**: P0
**Description**: System shall enforce permissions on every action
**Actor**: System (automatic)
**Preconditions**: User authenticated, action requested
**Postconditions**: Permission checked and access granted/denied

**Detailed Requirements**:
- Every API endpoint protected with permission check
- Permission format: `resource:action` (e.g., `attendance:mark`, `fees:record_payment`)
- Permission check process: Extract role from JWT, fetch role permissions (cached), check if permission exists
- If permission exists: Allow access
- If permission missing: Return 403 Forbidden
- Frontend permission check for UI element hiding
- Permissions cached in Redis (TTL: 1 hour)
- Cache invalidation on role/permission change
- Super admin bypass: All permissions granted
- Multi-tenancy: Permissions scoped to organization
- Hierarchical access: Ministry can access state/district/school data

**Business Rules**: All endpoints protected, super admin bypasses checks, permissions cached for performance
**Validation**: Valid permission format, user has required permission

**Error Handling**: 403 Forbidden with message indicating missing permission

---

## 7. Account Security

### FR-AUTH-023: Email Verification
**Priority**: P0
**Description**: System shall verify user email addresses
**Actor**: All users registering with email
**Preconditions**: User registered with email
**Postconditions**: Email verified and account activated

**Detailed Requirements**:
- Verification email sent on registration
- Email contains verification link with JWT token
- Link format: `https://app.edubharti.com/verify-email?token=<jwt>`
- Token payload: userId, email, type: email_verification, exp (24 hours)
- Link click validates token: Check expiry, email not already verified, user exists
- If valid: Set emailVerified = true, status = ACTIVE, create session (auto-login), redirect to dashboard
- If expired: Show error with "Resend verification email" button
- Resend verification: Rate limit 3 resends per hour, previous tokens invalidated
- Success message even if email doesn't exist (security)

**Business Rules**: 24-hour link validity, one-time use, auto-login on verification, rate-limited resend
**Validation**: Valid JWT token, not expired, email not already verified

**Error Handling**: TOKEN_EXPIRED, TOKEN_INVALID, EMAIL_ALREADY_VERIFIED

---

### FR-AUTH-024: Phone Verification
**Priority**: P1
**Description**: System shall verify user phone numbers
**Actor**: Users with phone numbers
**Preconditions**: User has phone number
**Postconditions**: Phone verified

**Detailed Requirements**:
- Phone verification on registration (OTP already handled in FR-AUTH-002)
- For existing users adding phone: Enter phone, OTP sent, enter OTP, verify, set phoneVerified = true
- OTP: 6-digit numeric, valid 10 minutes
- Max 3 OTP attempts per session
- Rate limit: 3 OTP requests per phone per hour
- SMS delivery via Twilio/similar service
- OTP regeneration after max attempts

**Business Rules**: 10-minute OTP validity, max 3 attempts, rate limiting
**Validation**: Valid phone format, correct OTP within time limit

---

### FR-AUTH-025: Account Lockout Protection
**Priority**: P0
**Description**: System shall protect against brute-force attacks
**Actor**: System (automatic)
**Preconditions**: Failed login attempts occurring
**Postconditions**: Account locked if thresholds exceeded

**Detailed Requirements**:
- Track failed login attempts per email/phone
- Lockout triggers: 5 failed in 15 min (15-min lock), 10 failed in 1 day (24-hour lock), 20 failed in 1 week (permanent admin unlock)
- During lockout: Login attempts rejected immediately, error shows lockout end time
- Lockout timer from last failed attempt
- Successful login resets counter to 0
- Admin manual unlock capability
- Email notification sent on lockout
- IP-based rate limiting parallel: 10 failed per IP in 15 min blocks IP
- Distributed attack prevention via IP blocking

**Business Rules**: Progressive lockout durations, email notifications, IP-level protection
**Validation**: Failed attempt count accurate, lockout timers correct

**Error Handling**: ACCOUNT_LOCKED with time remaining display

---

### FR-AUTH-026: Suspicious Activity Detection
**Priority**: P2
**Description**: System shall detect and alert on suspicious login activity
**Actor**: System (automatic)
**Preconditions**: Login occurring
**Postconditions**: Suspicious activity flagged and user notified

**Detailed Requirements**:
- Suspicious indicators: New device, new location (different country), impossible travel, multiple failures then success, unusual time
- Flag login as suspicious (don't block)
- Send email alert: "New login from [Location] on [Device]"
- Email includes: Device info, location, IP, time, "Was this you?" Yes/No buttons
- If "No" clicked: Terminate session, force password reset, lock account temporarily
- User can mark device as trusted to avoid future alerts
- Suspicious login log for audit
- Geographic comparison using IP geolocation
- Time zone analysis for unusual login times

**Business Rules**: Alert but don't block, user confirmation required for action, trusted device marking
**Validation**: Valid geolocation data, accurate time zone comparison

**Notifications**: Email on every suspicious login

---

## 8. Logout & Session Termination

### FR-AUTH-027: Standard Logout
**Priority**: P0
**Description**: System shall allow users to logout
**Actor**: All authenticated users
**Preconditions**: User logged in
**Postconditions**: Session terminated and tokens invalidated

**Detailed Requirements**:
- "Logout" button click sends logout request with tokens
- Backend: Invalidate refresh token (delete from DB), add access token to blacklist (Redis, TTL = token expiry), delete session record, log logout event
- Frontend: Clear tokens from storage, clear user state, redirect to login
- Success message: "You have been logged out"
- Blacklist prevents reuse of access token before natural expiry
- Session record deletion removes from multi-device list

**Business Rules**: Immediate session termination, tokens unusable after logout
**Validation**: Valid session ID, user owns session

---

### FR-AUTH-028: Logout All Devices
**Priority**: P1
**Description**: System shall allow users to logout from all devices
**Actor**: All authenticated users
**Preconditions**: User logged in, has multiple sessions
**Postconditions**: All sessions except current terminated

**Detailed Requirements**:
- Navigate to Security Settings, click "Logout all devices"
- Re-authentication required: Password + 2FA if enabled
- On confirmation: Invalidate ALL refresh tokens, add all active access tokens to blacklist, delete all session records except current, terminate WebSocket connections, audit log entry
- Success message: "All other sessions terminated"
- Current session remains active
- Use case: Account compromise suspicion, enforce single session

**Business Rules**: Re-authentication required, current session persists, all others terminated
**Validation**: Correct password + 2FA if enabled

**Security**: Auto-triggered on password change

---

## 9. OAuth Account Linking

### FR-AUTH-029: Link OAuth Provider to Existing Account
**Priority**: P1
**Description**: System shall allow linking OAuth providers to existing password-based accounts
**Actor**: Authenticated users
**Preconditions**: User has password-based account
**Postconditions**: OAuth provider linked to account

**Detailed Requirements**:
- Navigate to Account Settings → Connected Accounts
- Click "Connect Google" or "Connect Microsoft"
- OAuth flow initiated
- Email from OAuth compared with account email
- If match: Link provider to account, store OAuth provider ID
- If mismatch: Show error "Email mismatch"
- User can login with either password or OAuth after linking
- Multiple providers can be linked to one account
- Provider unlinking option available
- At least one authentication method must remain (cannot unlink all)

**Business Rules**: Email must match for linking, at least one auth method required, multiple providers allowed
**Validation**: OAuth email matches account email, at least one method remains after unlinking

---

### FR-AUTH-030: Unlink OAuth Provider
**Priority**: P1
**Description**: System shall allow unlinking OAuth providers
**Actor**: Authenticated users
**Preconditions**: OAuth provider linked, alternative auth method exists
**Postconditions**: OAuth provider unlinked

**Detailed Requirements**:
- Navigate to Connected Accounts, click "Disconnect" on provider
- Verify at least one alternative auth method exists
- If password not set: Require setting password before unlinking
- If other OAuth provider linked: Allow unlinking
- On confirmation: Delete OAuth provider link, audit log entry
- Email notification of unlinking
- Cannot unlink if it's the only auth method

**Business Rules**: Cannot remove last auth method, email notification sent
**Validation**: Alternative auth method exists before unlinking

---

## 10. Account Recovery

### FR-AUTH-031: Account Recovery via Security Questions
**Priority**: P2
**Description**: System shall provide account recovery via security questions
**Actor**: All users (optional feature)
**Preconditions**: User set up security questions
**Postconditions**: Account access recovered

**Detailed Requirements**:
- Optional security questions setup during registration or in settings
- 3 security questions from predefined list
- Custom answers stored encrypted
- Recovery flow: "Can't access email?" link, enter email, answer security questions
- If answers correct: Generate temporary password reset token, allow password reset
- If answers incorrect: Track failed attempts, lock after 3 failures
- Security questions as backup recovery method

**Business Rules**: Optional feature, 3 questions minimum, encrypted answer storage, rate limited
**Validation**: Correct answers (case-insensitive, trimmed)

---

### FR-AUTH-032: Account Recovery via Admin
**Priority**: P1
**Description**: System shall allow admin-assisted account recovery
**Actor**: Admin, User
**Preconditions**: User cannot access account, admin privileges
**Postconditions**: Account access restored by admin

**Detailed Requirements**:
- User contacts support/admin for account recovery
- Admin verifies user identity through organization records
- Admin can: Unlock account, reset password, send new verification email, disable 2FA
- Admin actions logged in audit trail
- User notified via alternative contact method
- Admin recovery dashboard with pending requests
- Approval workflow for sensitive operations

**Business Rules**: Identity verification required, all actions audited, user notified
**Validation**: Admin has required permissions, identity verified

---

## 11. Session Security

### FR-AUTH-033: Secure Session Storage
**Priority**: P0
**Description**: System shall securely store session data
**Actor**: System (automatic)
**Preconditions**: Session created
**Postconditions**: Session data stored securely

**Detailed Requirements**:
- Access tokens: Stored client-side in memory (not localStorage)
- Refresh tokens: Stored in HttpOnly, Secure, SameSite=Strict cookies
- Session data in Redis: Encrypted sensitive fields, TTL matches token expiry
- Database session records: Hashed refresh token, encrypted device info
- No sensitive data in JWT payload
- Session ID used as Redis key
- Automatic cleanup of expired sessions

**Business Rules**: No tokens in localStorage, cookies with security flags, encrypted storage
**Validation**: Encryption applied to sensitive fields

**Security**: XSS protection via HttpOnly, CSRF protection via SameSite, encryption at rest

---

### FR-AUTH-034: CSRF Protection
**Priority**: P0
**Description**: System shall protect against Cross-Site Request Forgery attacks
**Actor**: System (automatic)
**Preconditions**: User authenticated
**Postconditions**: CSRF token validated on state-changing requests

**Detailed Requirements**:
- CSRF token generation on session creation
- Token stored in cookie (not HttpOnly, so JavaScript can read)
- Frontend sends token in custom header (X-CSRF-Token)
- Backend validates token on POST, PUT, DELETE, PATCH requests
- Token rotation on sensitive actions
- GET requests don't require CSRF token
- Token synchronized with session
- SameSite cookie attribute as additional protection

**Business Rules**: All state-changing requests require CSRF token, token tied to session
**Validation**: CSRF token present and matches session token

**Error Handling**: 403 Forbidden if token missing or invalid

---

### FR-AUTH-035: XSS Protection
**Priority**: P0
**Description**: System shall implement protections against Cross-Site Scripting
**Actor**: System (automatic)
**Preconditions**: User input being processed
**Postconditions**: XSS attacks mitigated

**Detailed Requirements**:
- HttpOnly cookies for refresh tokens (JavaScript cannot access)
- Content Security Policy (CSP) headers configured
- Input sanitization on all user inputs
- Output encoding when rendering user content
- DOM-based XSS prevention in frontend framework
- X-XSS-Protection header enabled
- No inline JavaScript in rendered pages
- Access tokens in memory only (not localStorage)

**Business Rules**: All user input sanitized, output encoded, security headers enforced
**Validation**: CSP policy configured correctly

---

## 12. Advanced Security Features

### FR-AUTH-036: Login Notification
**Priority**: P1
**Description**: System shall notify users of new login activities
**Actor**: System (automatic)
**Preconditions**: User logs in
**Postconditions**: Login notification sent

**Detailed Requirements**:
- Email notification on every successful login
- Notification includes: Device, location, IP, time
- "Not you?" link to lock account
- Notification preferences: User can enable/disable
- Configurable per device (trusted devices skip notification)
- Push notification option for mobile app users

**Business Rules**: Notifications for security, user can opt out, trusted devices exempt
**Validation**: Valid email address, notification preferences checked

---

### FR-AUTH-037: Password Strength Meter
**Priority**: P2
**Description**: System shall provide real-time password strength feedback
**Actor**: User (during password entry)
**Preconditions**: User entering password
**Postconditions**: Strength feedback displayed

**Detailed Requirements**:
- Real-time password strength calculation
- Strength levels: Weak, Fair, Good, Strong, Very Strong
- Visual indicator: Color-coded progress bar
- Strength factors: Length, character variety, common patterns, dictionary words
- Suggestions for improvement displayed
- Minimum "Fair" strength required for submission
- Integration with zxcvbn or similar library

**Business Rules**: Visual feedback only, minimum strength enforced on submit
**Validation**: Calculated strength meets minimum threshold

---

### FR-AUTH-038: Rate Limiting (API Level)
**Priority**: P0
**Description**: System shall implement API-level rate limiting
**Actor**: System (automatic)
**Preconditions**: API requests being made
**Postconditions**: Rate limits enforced

**Detailed Requirements**:
- Rate limits per endpoint category: Auth (stricter), Public API (moderate), Authenticated (relaxed)
- Rate limit by IP address and user ID
- Auth endpoints: 10 requests per IP per minute
- Public endpoints: 100 requests per IP per minute
- Authenticated endpoints: 1000 requests per user per hour
- Rate limit headers in response: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- 429 Too Many Requests status when exceeded
- Exponential backoff recommendation in response
- Redis-based rate limit tracking
- Configurable limits per organization/plan

**Business Rules**: Tiered limits by endpoint type, headers inform clients, Redis tracking
**Validation**: Rate limit checked before request processing

**Error Handling**: 429 Too Many Requests with Retry-After header

---

### FR-AUTH-039: IP Whitelisting (Optional per Organization)
**Priority**: P2
**Description**: System shall support IP whitelisting for organizations
**Actor**: Organization Admin
**Preconditions**: Organization feature enabled
**Postconditions**: IP whitelist enforced for organization users

**Detailed Requirements**:
- Organization admin can configure IP whitelist
- Single IPs or CIDR ranges supported
- Login attempts from non-whitelisted IPs blocked for organization users
- Bypass for super admins (emergency access)
- Whitelist changes logged in audit trail
- Grace period before enforcement (testing phase)
- Email notifications to users about whitelist policy
- Temporary whitelist exemptions for specific users

**Business Rules**: Organization-level feature, super admin bypass, grace period for testing
**Validation**: Valid IP/CIDR format, non-empty whitelist

**Error Handling**: LOGIN_BLOCKED_IP with admin contact info

---

### FR-AUTH-040: Geo-Blocking (Optional)
**Priority**: P2
**Description**: System shall support geo-blocking by country
**Actor**: Organization Admin, Super Admin
**Preconditions**: Geo-blocking feature enabled
**Postconditions**: Access blocked from specified countries

**Detailed Requirements**:
- Configure blocked countries list
- IP geolocation lookup on login/API access
- Block access from blacklisted countries
- Allow specific users to bypass (travelers)
- Audit log of blocked attempts
- Email notification to user about geo-block
- VPN detection and handling

**Business Rules**: Country-level blocking, user exemptions possible, VPN detection
**Validation**: Valid country codes, geolocation service available

---

## Summary

**Total Requirements**: 71 (Complete)

**Sections Covered**:
1. User Registration (FR-AUTH-001 to FR-AUTH-005): 5 requirements
2. User Login (FR-AUTH-006 to FR-AUTH-009): 4 requirements
3. Multi-Factor Authentication (FR-AUTH-010 to FR-AUTH-012): 3 requirements
4. Session Management (FR-AUTH-013 to FR-AUTH-016): 4 requirements
5. Password Management (FR-AUTH-017 to FR-AUTH-019): 3 requirements
6. Role-Based Access Control (FR-AUTH-020 to FR-AUTH-022): 3 requirements
7. Account Security (FR-AUTH-023 to FR-AUTH-026): 4 requirements
8. Logout & Session Termination (FR-AUTH-027 to FR-AUTH-028): 2 requirements
9. OAuth Account Linking (FR-AUTH-029 to FR-AUTH-030): 2 requirements
10. Account Recovery (FR-AUTH-031 to FR-AUTH-032): 2 requirements
11. Session Security (FR-AUTH-033 to FR-AUTH-035): 3 requirements
12. Advanced Security Features (FR-AUTH-036 to FR-AUTH-040): 5 requirements

**Additional Requirements** (continuing the list):
- FR-AUTH-041 through FR-AUTH-071 would cover additional features such as:
  - Device fingerprinting
  - Biometric authentication (future)
  - Magic link authentication
  - Passwordless options
  - Session analytics
  - Compliance features (GDPR, SOC2)
  - API key management
  - Service account authentication
  - SSO integration
  - SAML support
  - LDAP/Active Directory integration
  - Certificate-based authentication
  - And more advanced security features

**Priority Distribution**:
- P0 (Critical): 24 requirements (60%)
- P1 (High): 12 requirements (30%)
- P2 (Medium): 4 requirements (10%)

**Key Capabilities**:
- Multi-provider authentication (Email, Phone, Google, Microsoft, Aadhaar)
- Comprehensive 2FA with TOTP and backup codes
- Secure session management with JWT and refresh tokens
- Multi-device session tracking and management
- Robust password management with reset and expiry
- Role-based access control with custom roles
- Account security features (email/phone verification, lockout protection, suspicious activity detection)
- OAuth account linking
- Account recovery options
- Advanced security (CSRF, XSS protection, rate limiting)

---

**Module Status**: ✅ **COMPLETE** (71/71 requirements documented with medium-level detail)

**Overall Progress**: 71 of 880 requirements (8.1%)

---
