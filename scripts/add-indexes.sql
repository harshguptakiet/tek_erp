-- Quick Performance Indexes
-- Run this directly in PostgreSQL if migration is slow

-- Critical indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_profiles_admission ON student_profiles(admission_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_student ON enrollments(student_id) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_section ON enrollments(section_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_status_type ON content(status, content_type) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);

-- Analyze tables after index creation
ANALYZE users;
ANALYZE student_profiles;
ANALYZE enrollments;
ANALYZE content;
ANALYZE attendance;
