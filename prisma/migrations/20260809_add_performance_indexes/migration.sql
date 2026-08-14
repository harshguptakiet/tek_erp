-- Performance Optimization: Add Missing Database Indexes
-- This migration adds indexes on frequently queried columns to dramatically improve performance

-- ============================================================
-- USER & AUTHENTICATION INDEXES
-- ============================================================

-- Email is used in every login - CRITICAL INDEX
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");

-- Username lookups
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users"("username");

-- Role-based queries
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");

-- Active users filter
CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "users"("is_active");

-- Soft delete queries
CREATE INDEX IF NOT EXISTS "idx_users_deleted_at" ON "users"("deleted_at");

-- ============================================================
-- STUDENT INDEXES
-- ============================================================

-- Admission number is unique identifier - CRITICAL
CREATE INDEX IF NOT EXISTS "idx_student_profiles_admission_number" ON "student_profiles"("admission_number");

-- User relationship lookup
CREATE INDEX IF NOT EXISTS "idx_student_profiles_user_id" ON "student_profiles"("user_id");

-- School-based queries
CREATE INDEX IF NOT EXISTS "idx_student_profiles_school_id" ON "student_profiles"("school_id");

-- Status filtering
CREATE INDEX IF NOT EXISTS "idx_student_profiles_status" ON "student_profiles"("status");

-- Soft deletes
CREATE INDEX IF NOT EXISTS "idx_student_profiles_deleted_at" ON "student_profiles"("deleted_at");

-- ============================================================
-- TEACHER INDEXES
-- ============================================================

-- Employee number lookups
CREATE INDEX IF NOT EXISTS "idx_teacher_profiles_employee_number" ON "teacher_profiles"("employee_number");

-- User relationship
CREATE INDEX IF NOT EXISTS "idx_teacher_profiles_user_id" ON "teacher_profiles"("user_id");

-- School-based queries
CREATE INDEX IF NOT EXISTS "idx_teacher_profiles_school_id" ON "teacher_profiles"("school_id");

-- Status filtering
CREATE INDEX IF NOT EXISTS "idx_teacher_profiles_status" ON "teacher_profiles"("status");

-- ============================================================
-- ENROLLMENT INDEXES
-- ============================================================

-- Section-based queries - VERY FREQUENT
CREATE INDEX IF NOT EXISTS "idx_enrollments_section_id" ON "enrollments"("section_id");

-- Student enrollments lookup
CREATE INDEX IF NOT EXISTS "idx_enrollments_student_id" ON "enrollments"("student_id");

-- Status filtering
CREATE INDEX IF NOT EXISTS "idx_enrollments_status" ON "enrollments"("status");

-- Academic year queries
CREATE INDEX IF NOT EXISTS "idx_enrollments_academic_year_id" ON "enrollments"("academic_year_id");

-- ============================================================
-- ATTENDANCE INDEXES
-- ============================================================

-- Date-based queries - VERY FREQUENT
CREATE INDEX IF NOT EXISTS "idx_attendance_date" ON "attendance"("date");

-- Student attendance lookup
CREATE INDEX IF NOT EXISTS "idx_attendance_student_id" ON "attendance"("student_id");

-- Section attendance
CREATE INDEX IF NOT EXISTS "idx_attendance_section_id" ON "attendance"("section_id");

-- Status filtering
CREATE INDEX IF NOT EXISTS "idx_attendance_status" ON "attendance"("status");

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS "idx_attendance_section_date" ON "attendance"("section_id", "date");

-- ============================================================
-- CLASS & SECTION INDEXES
-- ============================================================

-- School-based class queries
CREATE INDEX IF NOT EXISTS "idx_classes_school_id" ON "classes"("school_id");

-- Academic year filtering
CREATE INDEX IF NOT EXISTS "idx_classes_academic_year_id" ON "classes"("academic_year_id");

-- Grade filtering
CREATE INDEX IF NOT EXISTS "idx_classes_grade" ON "classes"("grade");

-- Section class relationship
CREATE INDEX IF NOT EXISTS "idx_sections_class_id" ON "sections"("class_id");

-- ============================================================
-- CONTENT INDEXES
-- ============================================================

-- Content type filtering
CREATE INDEX IF NOT EXISTS "idx_content_content_type" ON "content"("content_type");

-- Subject filtering
CREATE INDEX IF NOT EXISTS "idx_content_subject_id" ON "content"("subject_id");

-- Grade filtering
CREATE INDEX IF NOT EXISTS "idx_content_grade" ON "content"("grade");

-- Status filtering (published/draft)
CREATE INDEX IF NOT EXISTS "idx_content_status" ON "content"("status");

-- Creator lookup
CREATE INDEX IF NOT EXISTS "idx_content_creator_id" ON "content"("creator_id");

-- Composite for search queries
CREATE INDEX IF NOT EXISTS "idx_content_status_type_grade" ON "content"("status", "content_type", "grade");

-- ============================================================
-- EXAM & ASSESSMENT INDEXES
-- ============================================================

-- Section-based exam queries
CREATE INDEX IF NOT EXISTS "idx_exams_section_id" ON "exams"("section_id");

-- Subject filtering
CREATE INDEX IF NOT EXISTS "idx_exams_subject_id" ON "exams"("subject_id");

-- Date-based queries
CREATE INDEX IF NOT EXISTS "idx_exams_exam_date" ON "exams"("exam_date");

-- Status filtering
CREATE INDEX IF NOT EXISTS "idx_exams_status" ON "exams"("status");

-- ============================================================
-- FEE INDEXES
-- ============================================================

-- Student fee records
CREATE INDEX IF NOT EXISTS "idx_fee_records_student_id" ON "fee_records"("student_id");

-- Academic year filtering
CREATE INDEX IF NOT EXISTS "idx_fee_records_academic_year_id" ON "fee_records"("academic_year_id");

-- Payment status filtering - CRITICAL
CREATE INDEX IF NOT EXISTS "idx_fee_records_payment_status" ON "fee_records"("payment_status");

-- Due date queries
CREATE INDEX IF NOT EXISTS "idx_fee_records_due_date" ON "fee_records"("due_date");

-- ============================================================
-- TIMETABLE INDEXES
-- ============================================================

-- Section timetable lookup
CREATE INDEX IF NOT EXISTS "idx_timetable_slots_section_id" ON "timetable_slots"("section_id");

-- Day filtering
CREATE INDEX IF NOT EXISTS "idx_timetable_slots_day_of_week" ON "timetable_slots"("day_of_week");

-- Teacher schedule
CREATE INDEX IF NOT EXISTS "idx_timetable_slots_teacher_id" ON "timetable_slots"("teacher_id");

-- ============================================================
-- NOTIFICATION INDEXES
-- ============================================================

-- User notifications
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");

-- Unread notifications - VERY FREQUENT
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications"("is_read");

-- Date sorting
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("created_at" DESC);

-- Composite for inbox queries
CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread" ON "notifications"("user_id", "is_read");

-- ============================================================
-- MESSAGE INDEXES
-- ============================================================

-- Sender messages
CREATE INDEX IF NOT EXISTS "idx_messages_sender_id" ON "messages"("sender_id");

-- Recipient messages
CREATE INDEX IF NOT EXISTS "idx_messages_recipient_id" ON "messages"("recipient_id");

-- Read status
CREATE INDEX IF NOT EXISTS "idx_messages_is_read" ON "messages"("is_read");

-- Date sorting
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages"("created_at" DESC);

-- ============================================================
-- ACADEMIC YEAR INDEXES
-- ============================================================

-- School academic years
CREATE INDEX IF NOT EXISTS "idx_academic_years_school_id" ON "academic_years"("school_id");

-- Current year queries
CREATE INDEX IF NOT EXISTS "idx_academic_years_is_current" ON "academic_years"("is_current");

-- Date range queries
CREATE INDEX IF NOT EXISTS "idx_academic_years_start_date" ON "academic_years"("start_date");
CREATE INDEX IF NOT EXISTS "idx_academic_years_end_date" ON "academic_years"("end_date");

-- ============================================================
-- SUBJECT INDEXES
-- ============================================================

-- Grade filtering
CREATE INDEX IF NOT EXISTS "idx_subjects_grade" ON "subjects"("grade");

-- Soft deletes
CREATE INDEX IF NOT EXISTS "idx_subjects_deleted_at" ON "subjects"("deleted_at");

-- ============================================================
-- ANALYTICS IMPROVEMENT
-- ============================================================

-- Composite indexes for common dashboard queries

-- Student count by school and status
CREATE INDEX IF NOT EXISTS "idx_students_school_status" ON "student_profiles"("school_id", "status");

-- Active enrollments count
CREATE INDEX IF NOT EXISTS "idx_enrollments_section_status" ON "enrollments"("section_id", "status");

-- Attendance rate calculations
CREATE INDEX IF NOT EXISTS "idx_attendance_date_status" ON "attendance"("date", "status");

-- Fee collection tracking
CREATE INDEX IF NOT EXISTS "idx_fee_records_year_status" ON "fee_records"("academic_year_id", "payment_status");
