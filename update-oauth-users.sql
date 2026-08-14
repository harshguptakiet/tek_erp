-- Update all OAuth users to ACTIVE status
UPDATE "User" 
SET 
  status = 'ACTIVE',
  "emailVerified" = true,
  role = 'ORG_OWNER'
WHERE 
  "authProvider" IN ('GOOGLE', 'MICROSOFT')
  OR email IN ('guptasecular1@gmail.com', 'xxhgme@gmail.com');
