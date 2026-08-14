-- Fix ALL existing users to be ACTIVE with ORG_OWNER role
-- Run this in your Render PostgreSQL database

-- Update all users to be ACTIVE and email verified
UPDATE "User" 
SET 
  status = 'ACTIVE',
  "emailVerified" = true,
  role = 'ORG_OWNER'
WHERE status = 'PENDING_VERIFICATION';

-- Show the updated users
SELECT 
  id, 
  email, 
  "firstName", 
  "lastName", 
  role, 
  status, 
  "emailVerified", 
  "authProvider",
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 20;
