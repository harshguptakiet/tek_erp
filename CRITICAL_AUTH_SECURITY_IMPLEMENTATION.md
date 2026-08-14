# Critical Auth Security Implementation Strategy

## Priority Order & Implementation Plan

### Phase 1: Database Schema Updates (30 mins)
1. **Account Lockout Tracking**
   - Add `failedLoginAttempts`, `lockedUntil`, `lastFailedLogin` to User table
   
2. **Token Blacklist**
   - Create `TokenBlacklist` table for revoked access tokens
   
3. **Session Management**
   - Enhance Session table with `deviceInfo`, `ipAddress`, `location`, `lastActivity`
   
4. **Refresh Token Tracking**
   - Add `tokenVersion`, `lastRotation`, `isRevoked` to refresh token tracking

### Phase 2: Backend Implementation (2-3 hours)

#### 1. Account Lockout Protection (45 mins)
**Files**: 
- `auth.service.ts`: Add lockout logic to login()
- `auth.service.ts`: Add recordFailedAttempt(), checkAccountLock(), unlockAccount()

**Implementation**:
- Track failed attempts on User model
- Lock after 5 failures (15 min), 10 failures (24 hour)
- Reset counter on successful login
- Email notification on lockout

#### 2. Token Blacklist (30 mins)
**Files**:
- `auth.service.ts`: Add addToBlacklist(), isTokenBlacklisted()
- `jwt.strategy.ts`: Check blacklist on token validation
- `auth.service.ts`: Update logout() to blacklist tokens

**Implementation**:
- Redis-based blacklist with TTL = token expiry
- Check on every authenticated request
- Invalidate on logout and password change

#### 3. Refresh Token Rotation (45 mins)
**Files**:
- `auth.service.ts`: Update refreshToken() method
- `auth.service.ts`: Add detectTokenReuse()

**Implementation**:
- Generate new refresh token on each use
- Invalidate old token immediately
- If old token reused → revoke all user's tokens (theft detection)
- Store token hash in database

#### 4. Session Timeout (30 mins)
**Files**:
- `auth.service.ts`: Add updateLastActivity()
- `jwt.strategy.ts`: Check session activity on validation
- `auth.middleware.ts`: Create activity tracking middleware

**Implementation**:
- Update lastActivity timestamp on each request
- Check if last activity > 30 minutes
- Return 401 if session timed out
- Frontend: Clear tokens and redirect to login

#### 5. Multi-Device Session Tracking (45 mins)
**Files**:
- `auth.service.ts`: Enhance session creation with device info
- `auth.service.ts`: Add getAllSessions(), revokeSession(), revokeAllSessions()
- `auth.controller.ts`: Add session management endpoints (already exist)

**Implementation**:
- Parse user agent for device info
- Extract IP geolocation
- Limit to 10 concurrent sessions
- Provide session list in user settings

#### 6. CSRF Protection (30 mins)
**Files**:
- `auth.service.ts`: Add generateCSRFToken()
- `csrf.guard.ts`: Create CSRF validation guard
- `main.ts`: Add CSRF middleware

**Implementation**:
- Generate CSRF token on session creation
- Store in session, send as cookie
- Validate on POST/PUT/DELETE/PATCH
- Use csurf package or custom implementation

### Phase 3: Database Migration (10 mins)
- Create migration for schema changes
- Run migration on dev/prod

### Phase 4: Frontend Updates (1 hour)
1. **Session Timeout Handler**
   - Add activity tracker in auth provider
   - Show inactivity warning modal at 25 mins
   - Auto-logout at 30 mins

2. **Token Storage Fix**
   - Move access token from localStorage to memory
   - Use HttpOnly cookies for refresh tokens

3. **CSRF Token Handling**
   - Include CSRF token in request headers
   - Handle CSRF errors

### Phase 5: Testing & Validation (1 hour)
- Test account lockout scenarios
- Test token blacklist on logout
- Test refresh token rotation
- Test session timeout
- Test CSRF protection

## Total Estimated Time: 6-7 hours

## Implementation Order
1. ✅ Schema updates (migration)
2. ✅ Account Lockout Protection
3. ✅ Token Blacklist
4. ✅ Refresh Token Rotation
5. ✅ Session Timeout
6. ✅ Multi-Device Sessions
7. ✅ CSRF Protection
8. ✅ Frontend updates
9. ✅ Testing

## Success Criteria
- [ ] Account locks after 5 failed login attempts
- [ ] Logged out users cannot reuse their tokens
- [ ] Refresh tokens rotate on every use
- [ ] Sessions expire after 30 minutes of inactivity
- [ ] Users can view and manage active sessions
- [ ] CSRF protection prevents cross-site attacks

---

**Note**: All changes will be backward compatible. Existing sessions will continue to work but won't have enhanced security features until next login.
