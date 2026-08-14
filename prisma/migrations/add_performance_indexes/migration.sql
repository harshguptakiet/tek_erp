-- AddPerformanceIndexes Migration
-- Adds critical indexes to speed up common queries

-- Users table indexes
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");
CREATE INDEX IF NOT EXISTS "idx_users_deleted_at" ON "users"("deleted_at");

-- Student profiles indexes
CREATE INDEX IF NOT EXISTS "idx_student_profiles_admission_number" ON "student_profiles"("admission_number");
CREATE INDEX IF NOT EXISTS "idx_student_profiles_user_id" ON "student_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_student_profiles_deleted_at" ON "student_profiles"("deleted_at");

-- Teacher profiles indexes
CREATE INDEX IF NOT EXISTS "idx_teacher_profiles_user_id" ON "teacher_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_teacher_profiles_employee_id" ON "teacher_profiles"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_teacher_profiles_deleted_at" ON "teacher_profiles"("deleted_at");

-- Enrollments indexes
CREATE INDEX IF NOT EXISTS "idx_enrollments_student_id" ON "enrollments"("student_id");
CREATE INDEX IF NOT EXISTS "idx_enrollments_section_id" ON "enrollments"("section_id");
CREATE INDEX IF NOT EXISTS "idx_enrollments_academic_year" ON "enrollments"("academic_year_id");
CREATE INDEX IF NOT EXISTS "idx_enrollments_deleted_at" ON "enrollments"("deleted_at");

-- Sections indexes
CREATE INDEX IF NOT EXISTS "idx_sections_class_id" ON "sections"("class_id");
CREATE INDEX IF NOT EXISTS "idx_sections_deleted_at" ON "sections"("deleted_at");

-- Classes indexes
CREATE INDEX IF NOT EXISTS "idx_classes_school_id" ON "classes"("school_id");
CREATE INDEX IF NOT EXISTS "idx_classes_academic_year" ON "classes"("academic_year_id");
CREATE INDEX IF NOT EXISTS "idx_classes_deleted_at" ON "classes"("deleted_at");

-- Subjects indexes
CREATE INDEX IF NOT EXISTS "idx_subjects_deleted_at" ON "subjects"("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_subjects_grade" ON "subjects"("grade");

-- Content indexes
CREATE INDEX IF NOT EXISTS "idx_content_status" ON "content"("status");
CREATE INDEX IF NOT EXISTS "idx_content_type" ON "content"("content_type");
CREATE INDEX IF NOT EXISTS "idx_content_creator" ON "content"("creator_id");
CREATE INDEX IF NOT EXISTS "idx_content_deleted_at" ON "content"("deleted_at");

-- Attendance indexes
CREATE INDEX IF NOT EXISTS "idx_attendance_student_id" ON "attendance"("student_id");
CREATE INDEX IF NOT EXISTS "idx_attendance_date" ON "attendance"("date");
CREATE INDEX IF NOT EXISTS "idx_attendance_section_id" ON "attendance"("section_id");

-- Exams indexes
CREATE INDEX IF NOT EXISTS "idx_exams_section_id" ON "exams"("section_id");
CREATE INDEX IF NOT EXISTS "idx_exams_date" ON "exams"("exam_date");
CREATE INDEX IF NOT EXISTS "idx_exams_deleted_at" ON "exams"("deleted_at");

-- Exam results indexes
CREATE INDEX IF NOT EXISTS "idx_exam_results_exam_id" ON "exam_results"("exam_id");
CREATE INDEX IF NOT EXISTS "idx_exam_results_student_id" ON "exam_results"("student_id");

-- Assignments indexes
CREATE INDEX IF NOT EXISTS "idx_assignments_section_id" ON "assignments"("section_id");
CREATE INDEX IF NOT EXISTS "idx_assignments_due_date" ON "assignments"("due_date");
CREATE INDEX IF NOT EXISTS "idx_assignments_deleted_at" ON "assignments"("deleted_at");

-- Assignment submissions indexes
CREATE INDEX IF NOT EXISTS "idx_assignment_submissions_assignment_id" ON "assignment_submissions"("assignment_id");
CREATE INDEX IF NOT EXISTS "idx_assignment_submissions_student_id" ON "assignment_submissions"("student_id");

-- Fees indexes
CREATE INDEX IF NOT EXISTS "idx_fees_student_id" ON "fees"("student_id");
CREATE INDEX IF NOT EXISTS "idx_fees_status" ON "fees"("payment_status");
CREATE INDEX IF NOT EXISTS "idx_fees_due_date" ON "fees"("due_date");

-- Notifications indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "notifications"("is_read");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("created_at");

-- Messages indexes
CREATE INDEX IF NOT EXISTS "idx_messages_sender_id" ON "messages"("sender_id");
CREATE INDEX IF NOT EXISTS "idx_messages_recipient_id" ON "messages"("recipient_id");
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages"("created_at");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_enrollments_student_academic_year" ON "enrollments"("student_id", "academic_year_id");
CREATE INDEX IF NOT EXISTS "idx_attendance_student_date" ON "attendance"("student_id", "date");
CREATE INDEX IF NOT EXISTS "idx_users_email_deleted" ON "users"("email", "deleted_at");
