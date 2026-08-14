-- Add admin user
-- Password is: admin123
INSERT INTO users (
  id, email, first_name, last_name, password_hash, role, status, 
  email_verified, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'admin@tekurious.com',
  'Admin',
  'User',
  '$2b$10$YourHashedPasswordHere',
  'SUPER_ADMIN',
  'ACTIVE',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
