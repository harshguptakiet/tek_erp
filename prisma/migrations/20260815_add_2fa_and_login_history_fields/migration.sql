-- Add 2FA pending fields for setup flow
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "usedBackupCodes" TEXT[] DEFAULT '{}';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorPendingSecret" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorPendingBackupCodes" TEXT[] DEFAULT '{}';

-- Add login attempt tracking fields
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "os" TEXT;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "isSuspicious" BOOLEAN DEFAULT false;

-- Add indexes
CREATE INDEX IF NOT EXISTS "login_attempts_userId_idx" ON "login_attempts"("userId");
CREATE INDEX IF NOT EXISTS "login_attempts_isSuspicious_idx" ON "login_attempts"("isSuspicious");
