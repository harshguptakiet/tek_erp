-- Critical Security Features Migration
-- Adds: Account lockout tracking, token blacklist, enhanced session management

-- 1. Add missing fields to User table for account lockout
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastFailedLogin" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "permanentLockReason" TEXT;

-- 2. Create TokenBlacklist table for logout/revoked tokens
CREATE TABLE IF NOT EXISTS "token_blacklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL, -- 'LOGOUT', 'PASSWORD_CHANGE', 'ADMIN_REVOKE', 'SECURITY_BREACH'
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "token_blacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "token_blacklist_token_idx" ON "token_blacklist"("token");
CREATE INDEX IF NOT EXISTS "token_blacklist_expiresAt_idx" ON "token_blacklist"("expiresAt");
CREATE INDEX IF NOT EXISTS "token_blacklist_userId_idx" ON "token_blacklist"("userId");

-- 3. Enhance UserSession table for refresh token rotation
ALTER TABLE "user_sessions" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_sessions" ADD COLUMN IF NOT EXISTS "tokenHash" TEXT; -- Hash of refresh token
ALTER TABLE "user_sessions" ADD COLUMN IF NOT EXISTS "previousTokenHash" TEXT; -- For rotation detection
ALTER TABLE "user_sessions" ADD COLUMN IF NOT EXISTS "rotatedAt" TIMESTAMP(3);
ALTER TABLE "user_sessions" ADD COLUMN IF NOT EXISTS "csrfToken" TEXT; -- CSRF protection

-- Update existing sessions to have default tokenVersion
UPDATE "user_sessions" SET "tokenVersion" = 0 WHERE "tokenVersion" IS NULL;

-- 4. Create LoginAttempt table for detailed tracking (already exists, but ensure it has all fields)
CREATE TABLE IF NOT EXISTS "login_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX "login_attempts_email_idx"("email"),
    INDEX "login_attempts_ipAddress_idx"("ipAddress"),
    INDEX "login_attempts_timestamp_idx"("timestamp")
);

-- 5. Create SecurityEvent table for suspicious activity tracking
CREATE TABLE IF NOT EXISTS "security_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL, -- 'SUSPICIOUS_LOGIN', 'NEW_DEVICE', 'PASSWORD_CHANGE', 'LOCKOUT', etc.
    "severity" TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    "details" JSONB,
    "ipAddress" TEXT,
    "deviceInfo" TEXT,
    "location" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "security_events_userId_idx" ON "security_events"("userId");
CREATE INDEX IF NOT EXISTS "security_events_eventType_idx" ON "security_events"("eventType");
CREATE INDEX IF NOT EXISTS "security_events_createdAt_idx" ON "security_events"("createdAt");

-- 6. Add indexes for performance on existing tables
CREATE INDEX IF NOT EXISTS "users_lockedUntil_idx" ON "users"("lockedUntil");
CREATE INDEX IF NOT EXISTS "users_lastLogin_idx" ON "users"("lastLogin");
CREATE INDEX IF NOT EXISTS "user_sessions_lastActivity_idx" ON "user_sessions"("lastActivity");

-- 7. Clean up expired tokens periodically (PostgreSQL function)
CREATE OR REPLACE FUNCTION cleanup_expired_blacklist()
RETURNS void AS $$
BEGIN
    DELETE FROM "token_blacklist" WHERE "expiresAt" < NOW();
END;
$$ LANGUAGE plpgsql;

-- 8. Clean up old login attempts (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM "login_attempts" WHERE "timestamp" < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE "token_blacklist" IS 'Stores revoked JWT access tokens to prevent reuse after logout';
COMMENT ON TABLE "security_events" IS 'Tracks suspicious activities and security-related events';
COMMENT ON COLUMN "user_sessions"."tokenVersion" IS 'Incremented on each token rotation to detect reuse';
COMMENT ON COLUMN "user_sessions"."tokenHash" IS 'SHA-256 hash of current refresh token';
COMMENT ON COLUMN "user_sessions"."csrfToken" IS 'CSRF token for this session';
