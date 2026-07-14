-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('PLATFORM_ADMIN', 'GOVERNMENT', 'ORG_OWNER', 'ORG_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'PUBLISHER', 'CREATOR', 'GUEST');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'MICROSOFT', 'AADHAAR', 'SCHOOL_ID');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DELETED');

-- CreateEnum
CREATE TYPE "TenantLevel" AS ENUM ('PLATFORM', 'GOVERNMENT_NATIONAL', 'GOVERNMENT_STATE', 'GOVERNMENT_DISTRICT', 'ORGANIZATION', 'SCHOOL', 'BRANCH', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('MINISTRY', 'STATE_DEPARTMENT', 'DISTRICT_OFFICE', 'SCHOOL', 'COLLEGE', 'UNIVERSITY', 'COACHING_CENTER', 'INSTITUTION_GROUP', 'EDTECH_COMPANY');

-- CreateEnum
CREATE TYPE "OrganizationTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "Board" AS ENUM ('CBSE', 'ICSE', 'STATE_BOARD', 'IB', 'IGCSE', 'NIOS', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('AR', 'VR', 'VIDEO', 'PDF', 'BOOK', 'THREE_D_MODEL', 'TWO_D_IMAGE', 'GAME', 'ANIMATION', 'PPT', 'DOCUMENT', 'QUIZ', 'SIMULATION', 'AUDIO', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'AR_ONLY', 'VR_ONLY', 'AR_VR_BUNDLE', 'LMS_ONLY', 'COMPETITIVE_EXAM', 'FULL_ACCESS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET', 'RAZORPAY', 'STRIPE', 'PAYPAL', 'BANK_TRANSFER', 'CASH', 'CHEQUE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'FILL_IN_BLANK', 'SHORT_ANSWER', 'LONG_ANSWER', 'MATCH_FOLLOWING', 'DIAGRAM_BASED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('QUIZ', 'MOCK_TEST', 'ASSIGNMENT', 'MID_TERM', 'FINAL_EXAM', 'COMPETITIVE_EXAM', 'PRACTICE_TEST');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUBMITTED', 'GRADED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ClassMode" AS ENUM ('TRADITIONAL_VIDEO', 'METAVERSE');

-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RankingScope" AS ENUM ('CLASS', 'SCHOOL', 'DISTRICT', 'STATE', 'NATIONAL', 'GLOBAL');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('MANUAL', 'BIOMETRIC_FINGERPRINT', 'BIOMETRIC_FACE', 'RFID_CARD', 'QR_CODE', 'GPS_LOCATION', 'ONLINE_CLASS', 'MOBILE_APP');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'PDF', 'SPREADSHEET', 'PRESENTATION', 'ARCHIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('PROFILE_PHOTO', 'ASSIGNMENT', 'SUBMISSION', 'CERTIFICATE', 'REPORT', 'QUESTION_PAPER', 'ANSWER_SHEET', 'CONTENT', 'ANNOUNCEMENT', 'ID_CARD', 'LESSON_MATERIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('PAYMENT_GATEWAY', 'SMS_PROVIDER', 'EMAIL_PROVIDER', 'VIDEO_CONFERENCE', 'CLOUD_STORAGE', 'ANALYTICS', 'SSO', 'LMS', 'ERP', 'GOVERNMENT_API', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('USER_CREATED', 'USER_UPDATED', 'STUDENT_ENROLLED', 'ASSIGNMENT_SUBMITTED', 'EXAM_COMPLETED', 'PAYMENT_RECEIVED', 'FEE_OVERDUE', 'ATTENDANCE_MARKED', 'CONTENT_PUBLISHED', 'NOTIFICATION_SENT', 'INTEGRATION_SYNC', 'CUSTOM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "aadhaarLast4" TEXT,
    "username" TEXT,
    "passwordHash" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "profileImage" TEXT,
    "role" "SystemRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "passwordExpiry" TIMESTAMP(3),
    "lastPasswordChange" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "deviceInfo" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "userId" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_mappings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "organizationId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "user_role_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "permission_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "groupId" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'ORGANIZATION',
    "isSystemPermission" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "conditions" JSONB,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_dependencies" (
    "id" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "requiredPermissionId" TEXT NOT NULL,
    "isStrict" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "permission_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_inheritances" (
    "id" TEXT NOT NULL,
    "parentRoleId" TEXT NOT NULL,
    "childRoleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_inheritances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "scopeType" TEXT,
    "scopeId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_authentications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT,
    "passwordExpiry" TIMESTAMP(3),
    "lastPasswordChange" TIMESTAMP(3),
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "googleId" TEXT,
    "microsoftId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_authentications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_security" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false,
    "securityQuestions" JSONB,
    "trustedDevices" TEXT[],
    "lastSecurityAudit" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "bio" TEXT,
    "about" TEXT,
    "bloodGroup" TEXT,
    "nationality" TEXT,
    "religion" TEXT,
    "category" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "guardianName" TEXT,
    "languages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_contact_info" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "alternateEmail" TEXT,
    "alternatePhone" TEXT,
    "whatsappNumber" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "aadhaarVerified" BOOLEAN NOT NULL DEFAULT false,
    "aadhaarVerifiedAt" TIMESTAMP(3),
    "documentVerified" BOOLEAN NOT NULL DEFAULT false,
    "documentVerifiedAt" TIMESTAMP(3),
    "documentsSubmitted" JSONB,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "location" JSONB,
    "loginMethod" TEXT NOT NULL DEFAULT 'PASSWORD',
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failureReason" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "user_login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "notificationSettings" JSONB,
    "privacySettings" JSONB,
    "contentPreferences" JSONB,
    "accessibility" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sensitive_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aadhaarHash" TEXT,
    "aadhaarEncrypted" TEXT,
    "aadhaarMasked" TEXT,
    "panNumber" TEXT,
    "passportNumber" TEXT,
    "bankAccountEncrypted" JSONB,
    "medicalConditions" TEXT[],
    "allergies" TEXT[],
    "encryptionKeyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sensitive_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneCode" TEXT,
    "currency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villages" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "pincode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "villages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "addressType" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "landmark" TEXT,
    "cityTown" TEXT NOT NULL,
    "stateId" TEXT,
    "districtId" TEXT,
    "blockId" TEXT,
    "villageId" TEXT,
    "pincode" TEXT,
    "countryId" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_hierarchy" (
    "id" TEXT NOT NULL,
    "level" "TenantLevel" NOT NULL,
    "parentId" TEXT,
    "hierarchyPath" TEXT NOT NULL,
    "hierarchyLevel" INTEGER NOT NULL DEFAULT 0,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_hierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_entities" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "countryId" TEXT,
    "stateId" TEXT,
    "districtId" TEXT,
    "parentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "officerInCharge" TEXT,
    "designation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "type" "OrganizationType" NOT NULL,
    "tier" "OrganizationTier" NOT NULL DEFAULT 'BASIC',
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "gstin" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "countryId" TEXT,
    "stateId" TEXT,
    "districtId" TEXT,
    "coordinates" JSONB,
    "logo" TEXT,
    "banner" TEXT,
    "brandingConfig" JSONB,
    "parentOrganizationId" TEXT,
    "tenantId" TEXT NOT NULL,
    "hierarchyPath" TEXT,
    "hierarchyLevel" INTEGER NOT NULL DEFAULT 0,
    "enabledModules" TEXT[],
    "customDomain" TEXT,
    "maxSchools" INTEGER,
    "maxStudents" INTEGER,
    "maxTeachers" INTEGER,
    "storageLimit" INTEGER,
    "primaryContactName" TEXT,
    "primaryContactEmail" TEXT,
    "primaryContactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "onboardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardedBy" TEXT,
    "dataResidency" TEXT,
    "complianceFlags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "branchType" TEXT NOT NULL,
    "countryId" TEXT,
    "stateId" TEXT,
    "districtId" TEXT,
    "tenantId" TEXT NOT NULL,
    "hierarchyPath" TEXT,
    "headOfBranch" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "departmentType" TEXT NOT NULL,
    "parentDepartmentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "hierarchyPath" TEXT,
    "headOfDepartment" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_users" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "designation" TEXT,
    "department" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "organization_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "udiseCode" TEXT,
    "schoolType" TEXT,
    "board" "Board",
    "affiliationNumber" TEXT,
    "recognitionNumber" TEXT,
    "principalId" TEXT,
    "vicePrincipalIds" TEXT[],
    "countryId" TEXT,
    "stateId" TEXT,
    "districtId" TEXT,
    "blockId" TEXT,
    "coordinates" JSONB,
    "tenantId" TEXT NOT NULL,
    "hierarchyPath" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "totalCapacity" INTEGER,
    "currentStrength" INTEGER NOT NULL DEFAULT 0,
    "facilities" TEXT[],
    "schoolTiming" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accreditationStatus" TEXT,
    "accreditationGrade" TEXT,
    "establishedDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_masters" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IN',
    "stateCode" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curricula" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "gradeRange" JSONB NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" DATE,
    "effectiveTo" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_subjects" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "isElective" BOOLEAN NOT NULL DEFAULT false,
    "credits" INTEGER,
    "hoursPerWeek" INTEGER,

    CONSTRAINT "curriculum_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "gradeName" TEXT,
    "stream" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionName" TEXT NOT NULL,
    "capacity" INTEGER,
    "currentStrength" INTEGER NOT NULL DEFAULT 0,
    "classTeacherId" TEXT,
    "roomNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_teachers" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "section_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_subjects" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "periodsPerWeek" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "section_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "board" "Board",
    "grade" INTEGER,
    "isElective" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_subjects" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "class_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT,
    "rollNumber" TEXT,
    "admissionNumber" TEXT,
    "admissionDate" TIMESTAMP(3),
    "bloodGroup" TEXT,
    "emergencyContact" JSONB,
    "previousSchool" TEXT,
    "transportOpted" BOOLEAN NOT NULL DEFAULT false,
    "hostelOpted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT,
    "employeeId" TEXT,
    "designation" TEXT,
    "qualification" TEXT,
    "experience" INTEGER,
    "joiningDate" TIMESTAMP(3),
    "leavingDate" TIMESTAMP(3),
    "salary" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occupation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_students" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publisher_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "website" TEXT,
    "description" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "bankDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publisher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "expertise" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "bankDetails" JSONB,
    "totalEarnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "rollNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "chapterNumber" INTEGER,
    "description" TEXT,
    "board" "Board",
    "grade" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "topicNumber" INTEGER,
    "description" TEXT,
    "estimatedDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtopics" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "estimatedDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subtopics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_subtopics" (
    "id" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "estimatedDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_subtopics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "contentType" "ContentType" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "board" "Board",
    "grade" INTEGER,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "topicId" TEXT,
    "subtopicId" TEXT,
    "subSubtopicId" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "fileMimeType" TEXT,
    "duration" INTEGER,
    "difficultyLevel" "DifficultyLevel",
    "language" TEXT NOT NULL DEFAULT 'en',
    "tags" TEXT[],
    "keywords" TEXT[],
    "learningOutcomes" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2),
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2),
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "versionNumber" TEXT NOT NULL DEFAULT '1.0',
    "previousVersionId" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reviews" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "versionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "fileMimeType" TEXT,
    "metadata" JSONB NOT NULL,
    "status" "WorkflowStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changeNotes" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_drafts" (
    "id" TEXT NOT NULL,
    "contentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "contentType" "ContentType" NOT NULL,
    "fileUrl" TEXT,
    "metadata" JSONB,
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_workflows" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "status" "WorkflowStatus" NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "publishedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "comments" JSONB,
    "currentStep" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isbn" TEXT,
    "edition" TEXT,
    "board" "Board",
    "grade" INTEGER,
    "subject" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "totalPages" INTEGER,
    "publishedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagrams" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "chapterName" TEXT,
    "resolution" TEXT,
    "fileSize" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ar_markers" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "diagramId" TEXT,
    "markerCode" TEXT NOT NULL,
    "markerImage" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ar_markers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ar_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "markerId" TEXT,
    "assetType" TEXT NOT NULL,
    "assetUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER,
    "format" TEXT,
    "optimized" BOOLEAN NOT NULL DEFAULT false,
    "compressionLevel" TEXT,
    "lodLevels" JSONB,
    "targetLevel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ar_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vr_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "experimentName" TEXT,
    "assetType" TEXT NOT NULL,
    "assetUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER,
    "format" TEXT,
    "optimized" BOOLEAN NOT NULL DEFAULT false,
    "supportedHeadsets" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vr_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vr_usage_logs" (
    "id" TEXT NOT NULL,
    "vrContentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "headsetType" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "interactions" JSONB,
    "completionRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vr_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "tier" "SubscriptionTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 7,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "billingCycle" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "usedSeats" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "pricingModel" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_assignments" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "license_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_contents" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "userId" TEXT,
    "organizationId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "gatewayTransactionId" TEXT,
    "gatewayResponse" JSONB,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "invoice" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentGateway" TEXT NOT NULL,
    "gatewayRequest" JSONB,
    "gatewayResponse" JSONB,
    "status" TEXT NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_refunds" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "refundAmount" DECIMAL(10,2) NOT NULL,
    "refundReason" TEXT NOT NULL,
    "refundType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "gatewayRefundId" TEXT,
    "gatewayResponse" JSONB,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_reconciliations" (
    "id" TEXT NOT NULL,
    "reconciliationDate" DATE NOT NULL,
    "gateway" TEXT NOT NULL,
    "totalPayments" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "successfulPayments" INTEGER NOT NULL DEFAULT 0,
    "successfulAmount" DECIMAL(12,2) NOT NULL,
    "failedPayments" INTEGER NOT NULL DEFAULT 0,
    "refundedPayments" INTEGER NOT NULL DEFAULT 0,
    "refundedAmount" DECIMAL(12,2) NOT NULL,
    "discrepancies" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reconciledBy" TEXT,
    "reconciledAt" TIMESTAMP(3),
    "gatewayReport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway_logs" (
    "id" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "httpMethod" TEXT NOT NULL,
    "requestHeaders" JSONB,
    "requestBody" JSONB,
    "responseStatus" INTEGER,
    "responseHeaders" JSONB,
    "responseBody" JSONB,
    "duration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_gateway_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publisher_monetization_plans" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "maxUploads" INTEGER,
    "maxStorage" INTEGER,
    "platformCommissionPercent" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publisher_monetization_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_monetization_plans" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "maxUploads" INTEGER,
    "maxStorage" INTEGER,
    "platformCommissionPercent" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_monetization_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_purchases" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchasePrice" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "creatorEarnings" DECIMAL(10,2) NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "payoutMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_bank" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT,
    "question" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "explanation" TEXT,
    "board" "Board",
    "grade" INTEGER,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "topicId" TEXT,
    "difficultyLevel" "DifficultyLevel",
    "bloomsTaxonomy" TEXT,
    "marks" DECIMAL(5,2) NOT NULL,
    "negativeMarks" DECIMAL(5,2),
    "estimatedTime" INTEGER,
    "boardExamFrequency" INTEGER,
    "lastAppearedYear" INTEGER,
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "hasVideo" BOOLEAN NOT NULL DEFAULT false,
    "hasAR" BOOLEAN NOT NULL DEFAULT false,
    "hasVR" BOOLEAN NOT NULL DEFAULT false,
    "mediaUrls" TEXT[],
    "tags" TEXT[],
    "keywords" TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT,
    "sectionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "examType" "ExamType" NOT NULL,
    "board" "Board",
    "grade" INTEGER,
    "subjectId" TEXT,
    "totalMarks" DECIMAL(7,2) NOT NULL,
    "passingMarks" DECIMAL(7,2),
    "duration" INTEGER NOT NULL,
    "hasNegativeMarking" BOOLEAN NOT NULL DEFAULT false,
    "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
    "randomizeOptions" BOOLEAN NOT NULL DEFAULT false,
    "showResultsImmediately" BOOLEAN NOT NULL DEFAULT true,
    "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT true,
    "allowReview" BOOLEAN NOT NULL DEFAULT true,
    "blueprint" JSONB,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionBankId" TEXT,
    "questionOrder" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "explanation" TEXT,
    "marks" DECIMAL(5,2) NOT NULL,
    "negativeMarks" DECIMAL(5,2),
    "sectionName" TEXT,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_assignments" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT,
    "classId" TEXT,
    "groupName" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "exam_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeTaken" INTEGER,
    "totalMarks" DECIMAL(7,2),
    "obtainedMarks" DECIMAL(7,2),
    "percentage" DECIMAL(5,2),
    "rank" INTEGER,
    "isPassed" BOOLEAN,
    "evaluatedAt" TIMESTAMP(3),
    "evaluatedBy" TEXT,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN,
    "marksAwarded" DECIMAL(5,2),
    "timeTaken" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "exam_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "sectionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" TEXT,
    "topicId" TEXT,
    "maxMarks" DECIMAL(7,2),
    "dueDate" TIMESTAMP(3),
    "attachments" TEXT[],
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionFiles" TEXT[],
    "submissionText" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "marksObtained" DECIMAL(7,2),
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "gradedBy" TEXT,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_classes" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "classMode" "ClassMode" NOT NULL,
    "classId" TEXT,
    "subjectId" TEXT,
    "topicId" TEXT,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "status" "ClassStatus" NOT NULL DEFAULT 'SCHEDULED',
    "maxParticipants" INTEGER NOT NULL DEFAULT 200,
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "meetingPassword" TEXT,
    "metaverseRoomId" TEXT,
    "recordingUrl" TEXT,
    "enableChat" BOOLEAN NOT NULL DEFAULT true,
    "enableScreenShare" BOOLEAN NOT NULL DEFAULT true,
    "enableWhiteboard" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_class_participants" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "duration" INTEGER,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "isVideoOff" BOOLEAN NOT NULL DEFAULT false,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "live_class_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_recordings" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "recordingUrl" TEXT NOT NULL,
    "duration" INTEGER,
    "fileSize" INTEGER,
    "perspective" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "class_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metaverse_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomUrl" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "environmentConfig" JSONB,
    "spatialAudioEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metaverse_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "three_d_models" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "modelUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "format" TEXT NOT NULL,
    "fileSize" INTEGER,
    "polyCount" INTEGER,
    "optimized" BOOLEAN NOT NULL DEFAULT false,
    "lodLevels" JSONB,
    "subjectId" TEXT,
    "topicId" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "three_d_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" TEXT,
    "metadata" JSONB,

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "deviceInfo" JSONB,
    "ipAddress" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "subjectId" TEXT,
    "topicId" TEXT,
    "score" DECIMAL(5,2),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rankings" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examId" TEXT,
    "scope" "RankingScope" NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalParticipants" INTEGER NOT NULL,
    "percentile" DECIMAL(5,2),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_devices" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "location" TEXT,
    "roomId" TEXT,
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "sectionId" TEXT,
    "date" DATE NOT NULL,
    "period" INTEGER,
    "status" "AttendanceStatus" NOT NULL,
    "method" "AttendanceMethod" NOT NULL DEFAULT 'MANUAL',
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "location" JSONB,
    "deviceId" TEXT,
    "remarks" TEXT,
    "markedBy" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctionRequested" BOOLEAN NOT NULL DEFAULT false,
    "correctionReason" TEXT,
    "correctedBy" TEXT,
    "correctedAt" TIMESTAMP(3),
    "biometricLogId" TEXT,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_attendance" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "method" "AttendanceMethod" NOT NULL DEFAULT 'MANUAL',
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "location" JSONB,
    "deviceId" TEXT,
    "remarks" TEXT,
    "markedBy" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "biometricLogId" TEXT,

    CONSTRAINT "teacher_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_attendance_logs" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "biometricType" TEXT NOT NULL,
    "biometricData" TEXT,
    "matchScore" DECIMAL(5,2),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "biometric_attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "roomName" TEXT,
    "roomType" TEXT NOT NULL DEFAULT 'CLASSROOM',
    "floor" TEXT,
    "building" TEXT,
    "capacity" INTEGER,
    "facilities" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "slotName" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_entries" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "subjectId" TEXT,
    "teacherId" TEXT,
    "roomId" TEXT,
    "isSubstitution" BOOLEAN NOT NULL DEFAULT false,
    "substitutionReason" TEXT,
    "originalTeacherId" TEXT,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetable_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "grade" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "frequency" TEXT NOT NULL,
    "dueDate" DATE,
    "lateFeeAmount" DECIMAL(10,2),
    "lateFeeDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "academicYear" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balanceAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountReason" TEXT,
    "lateFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_payments" (
    "id" TEXT NOT NULL,
    "feeRecordId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentDate" DATE NOT NULL,
    "transactionId" TEXT,
    "receiptNumber" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_concessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeStructureId" TEXT,
    "concessionType" TEXT NOT NULL,
    "concessionAmount" DECIMAL(10,2) NOT NULL,
    "concessionPercent" DECIMAL(5,2),
    "reason" TEXT,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_concessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_installments" (
    "id" TEXT NOT NULL,
    "feeRecordId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "installmentAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "paidDate" DATE,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_refunds" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feePaymentId" TEXT,
    "refundAmount" DECIMAL(10,2) NOT NULL,
    "refundReason" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "refundMethod" TEXT,
    "refundDate" DATE,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_waivers" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "waiverPercent" DECIMAL(5,2) NOT NULL,
    "waiverAmount" DECIMAL(10,2) NOT NULL,
    "waiverReason" TEXT NOT NULL,
    "waiverCategory" TEXT NOT NULL,
    "supportingDocs" TEXT[],
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_waivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "scholarshipName" TEXT NOT NULL,
    "scholarshipType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "amountType" TEXT NOT NULL,
    "eligibilityCriteria" JSONB NOT NULL,
    "totalSlots" INTEGER,
    "availableSlots" INTEGER,
    "applicationStart" DATE NOT NULL,
    "applicationEnd" DATE NOT NULL,
    "disbursementSchedule" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_applications" (
    "id" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "applicationData" JSONB NOT NULL,
    "documents" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewComments" TEXT,
    "approvedAmount" DECIMAL(10,2),
    "disbursedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "scholarship_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_fees" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "monthYear" TEXT NOT NULL,
    "feeAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_books" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "isbn" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "publisher" TEXT,
    "edition" TEXT,
    "publicationYear" INTEGER,
    "category" TEXT,
    "subCategory" TEXT,
    "language" TEXT,
    "totalCopies" INTEGER NOT NULL,
    "availableCopies" INTEGER NOT NULL,
    "issuedCopies" INTEGER NOT NULL DEFAULT 0,
    "damagedCopies" INTEGER NOT NULL DEFAULT 0,
    "lostCopies" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "deweyDecimal" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "purchaseDate" DATE,
    "purchasePrice" DECIMAL(10,2),
    "condition" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isReferenceOnly" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "library_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_issues" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "issueDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "returnDate" DATE,
    "renewalCount" INTEGER NOT NULL DEFAULT 0,
    "maxRenewals" INTEGER NOT NULL DEFAULT 2,
    "fineAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "finePaid" BOOLEAN NOT NULL DEFAULT false,
    "isReturned" BOOLEAN NOT NULL DEFAULT false,
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "condition" TEXT,
    "damageRemarks" TEXT,
    "remarks" TEXT,
    "issuedBy" TEXT,
    "returnedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_reservations" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "library_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "membershipNumber" TEXT NOT NULL,
    "membershipType" TEXT NOT NULL,
    "maxBooksAllowed" INTEGER NOT NULL DEFAULT 3,
    "maxDays" INTEGER NOT NULL DEFAULT 14,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "library_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    "modelVersion" TEXT,
    "confidence" DECIMAL(5,4),
    "reasons" JSONB,
    "isAccepted" BOOLEAN,
    "acceptedAt" TIMESTAMP(3),
    "clickedItems" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_predictions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "subjectId" TEXT,
    "examId" TEXT,
    "predictedValue" JSONB NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "actualValue" JSONB,
    "features" JSONB,
    "modelVersion" TEXT NOT NULL,
    "predictedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "conversationData" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "satisfaction" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "chatbot_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "intent" TEXT,
    "entities" JSONB,
    "confidence" DECIMAL(5,4),
    "isHelpful" BOOLEAN,
    "feedback" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_embeddings" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "embeddingModel" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_learning_styles" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "visualScore" DECIMAL(5,2) NOT NULL,
    "auditoryScore" DECIMAL(5,2) NOT NULL,
    "kinestheticScore" DECIMAL(5,2) NOT NULL,
    "readingWritingScore" DECIMAL(5,2) NOT NULL,
    "preferredContentTypes" TEXT[],
    "optimalStudyTime" TEXT,
    "attentionSpan" INTEGER,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_learning_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "promptType" TEXT NOT NULL,
    "context" JSONB,
    "responseText" TEXT,
    "responseTime" INTEGER,
    "modelUsed" TEXT,
    "tokensUsed" INTEGER,
    "wasSuccessful" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedback" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER,
    "isHelpful" BOOLEAN,
    "feedbackText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vector_indexes" (
    "id" TEXT NOT NULL,
    "indexName" TEXT NOT NULL,
    "indexType" TEXT NOT NULL,
    "dimension" INTEGER NOT NULL,
    "totalVectors" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vector_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vector_embeddings" (
    "id" TEXT NOT NULL,
    "indexId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vector_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "chunkText" TEXT NOT NULL,
    "embeddingId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retrieval_queries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "retrievedChunks" JSONB NOT NULL,
    "wasHelpful" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retrieval_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "modelProvider" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "cost" DECIMAL(10,6),
    "requestType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "responseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "availableModels" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rateLimits" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "variables" TEXT[],
    "modelProvider" TEXT,
    "modelName" TEXT,
    "temperature" DECIMAL(3,2),
    "maxTokens" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inference_logs" (
    "id" TEXT NOT NULL,
    "modelProvider" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "inputText" TEXT,
    "outputText" TEXT,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "userId" TEXT,
    "organizationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inference_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_blocks" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "blockName" TEXT NOT NULL,
    "blockNumber" TEXT,
    "blockType" TEXT,
    "totalFloors" INTEGER NOT NULL DEFAULT 1,
    "totalRooms" INTEGER NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "wardenName" TEXT,
    "wardenPhone" TEXT,
    "wardenId" TEXT,
    "facilities" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "hostel_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_rooms" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "roomType" TEXT NOT NULL DEFAULT 'STANDARD',
    "capacity" INTEGER NOT NULL,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "floor" INTEGER,
    "facilities" TEXT[],
    "monthlyRent" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_room_assignments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bedNumber" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vacatedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "monthlyRent" DECIMAL(10,2) NOT NULL,
    "securityDeposit" DECIMAL(10,2),

    CONSTRAINT "hostel_room_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_fees" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "feeType" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,

    CONSTRAINT "hostel_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_maintenance" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "cost" DECIMAL(10,2),

    CONSTRAINT "hostel_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "organizationId" TEXT,
    "itemName" TEXT NOT NULL,
    "itemCode" TEXT,
    "barcode" TEXT,
    "categoryId" TEXT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT,
    "minimumStock" INTEGER,
    "reorderLevel" INTEGER,
    "maximumStock" INTEGER,
    "location" TEXT,
    "unitPrice" DECIMAL(10,2),
    "totalValue" DECIMAL(12,2),
    "isConsumable" BOOLEAN NOT NULL DEFAULT false,
    "isAsset" BOOLEAN NOT NULL DEFAULT false,
    "purchaseDate" DATE,
    "expiryDate" DATE,
    "supplierId" TEXT,
    "warrantyPeriod" INTEGER,
    "warrantyExpiry" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT,
    "reference" TEXT,
    "unitPrice" DECIMAL(10,2),
    "totalValue" DECIMAL(12,2),
    "performedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "reason" TEXT,
    "remarks" TEXT,
    "transactionDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_requisitions" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedFor" TEXT,
    "quantity" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "issuedAt" TIMESTAMP(3),
    "issuedBy" TEXT,
    "issuedQuantity" INTEGER,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "inventory_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierCode" TEXT,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "category" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "bankDetails" JSONB,
    "rating" DECIMAL(3,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_structures" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "organizationId" TEXT,
    "structureName" TEXT NOT NULL,
    "designation" TEXT,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "allowances" JSONB NOT NULL,
    "deductions" JSONB NOT NULL,
    "grossSalary" DECIMAL(10,2) NOT NULL,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salaries" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeType" TEXT NOT NULL,
    "payrollStructureId" TEXT,
    "monthYear" TEXT NOT NULL,
    "workingDays" INTEGER NOT NULL,
    "presentDays" INTEGER NOT NULL,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "allowances" JSONB NOT NULL,
    "bonuses" JSONB,
    "deductions" JSONB NOT NULL,
    "penalties" JSONB,
    "grossSalary" DECIMAL(10,2) NOT NULL,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidOn" DATE,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_advances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "advanceAmount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "disbursedAt" TIMESTAMP(3),
    "disbursedAmount" DECIMAL(10,2),
    "repaymentMode" TEXT,
    "installments" INTEGER,
    "installmentAmount" DECIMAL(10,2),
    "balanceAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "payroll_advances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_leaves" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "reason" TEXT,
    "attachments" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "substituteTeacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeType" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "totalLeaves" INTEGER NOT NULL,
    "usedLeaves" INTEGER NOT NULL DEFAULT 0,
    "balanceLeaves" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_routes" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "routeNumber" TEXT NOT NULL,
    "startPoint" TEXT NOT NULL,
    "endPoint" TEXT NOT NULL,
    "totalDistance" DECIMAL(8,2),
    "estimatedTime" INTEGER,
    "pickupTime" TEXT,
    "dropTime" TEXT,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "attendantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "transport_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_route_stops" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "stopName" TEXT NOT NULL,
    "stopSequence" INTEGER NOT NULL,
    "address" TEXT,
    "landmark" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "pickupTime" TEXT,
    "dropTime" TEXT,
    "fare" DECIMAL(8,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "transport_route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_vehicles" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "organizationId" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "capacity" INTEGER NOT NULL,
    "registrationNumber" TEXT,
    "insuranceNumber" TEXT,
    "insuranceExpiry" DATE,
    "fitnessExpiry" DATE,
    "pollutionExpiry" DATE,
    "gpsDeviceId" TEXT,
    "gpsDeviceIMEI" TEXT,
    "gpsProvider" TEXT,
    "rfidReaderId" TEXT,
    "rfidReaderSerial" TEXT,
    "lastKnownLat" DECIMAL(10,8),
    "lastKnownLng" DECIMAL(11,8),
    "lastTrackedAt" TIMESTAMP(3),
    "currentSpeed" DECIMAL(5,2),
    "fuelLevel" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "maintenanceSchedule" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "transport_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_gps_logs" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "speed" DECIMAL(5,2),
    "heading" DECIMAL(5,2),
    "altitude" DECIMAL(8,2),
    "accuracy" DECIMAL(6,2),
    "ignitionOn" BOOLEAN,
    "fuelLevel" DECIMAL(5,2),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_gps_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_maintenance" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "serviceDate" DATE NOT NULL,
    "nextServiceDate" DATE,
    "serviceProvider" TEXT,
    "invoiceNumber" TEXT,
    "odometer" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "vehicle_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_student_assignments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "stopId" TEXT,
    "rfidCardNumber" TEXT,
    "rfidCardIssued" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "transport_student_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_attendance" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "tripId" TEXT,
    "date" DATE NOT NULL,
    "tripType" TEXT NOT NULL,
    "boardedAt" TIMESTAMP(3),
    "boardedLocation" JSONB,
    "alightedAt" TIMESTAMP(3),
    "alightedLocation" JSONB,
    "status" TEXT NOT NULL,
    "rfidScanIn" TIMESTAMP(3),
    "rfidScanOut" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "parentNotified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "transport_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_trips" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "tripType" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "attendantId" TEXT,
    "plannedStartTime" TEXT NOT NULL,
    "plannedEndTime" TEXT NOT NULL,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "startOdometer" INTEGER,
    "endOdometer" INTEGER,
    "distance" DECIMAL(8,2),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "incidents" JSONB,

    CONSTRAINT "transport_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "notifyUsers" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplinary_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "incidentDate" DATE NOT NULL,
    "incidentType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionTaken" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplinary_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channels" "NotificationChannel"[],
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "resourceType" TEXT,
    "resourceId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "templateId" TEXT,
    "templateData" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "error" TEXT,
    "gatewayId" TEXT,
    "gatewayResponse" JSONB,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "conversationType" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "avatarUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "lastMessagePreview" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "lastReadAt" TIMESTAMP(3),
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "message_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "groupId" TEXT,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "replyToId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedFor" TEXT[],
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "thumbnailUrl" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_read_receipts" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_read_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pinned_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "pinnedBy" TEXT NOT NULL,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinned_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "members" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "organizationId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetRoleIds" TEXT[],
    "targetClasses" TEXT[],
    "attachments" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "schoolId" TEXT,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "columnName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "resource" TEXT,
    "resourceId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "location" JSONB,
    "reason" TEXT,
    "metadata" JSONB,
    "apiEndpoint" TEXT,
    "httpMethod" TEXT,
    "riskLevel" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "favicon" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "companyName" TEXT,
    "tagline" TEXT,
    "customDomain" TEXT,
    "features" JSONB,
    "smtpConfig" JSONB,
    "smsConfig" JSONB,
    "paymentGatewayConfig" JSONB,
    "analyticsConfig" JSONB,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "metadata" JSONB,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_dashboards" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "stateCode" TEXT,
    "districtCode" TEXT,
    "metrics" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "government_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_reports" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "schoolId" TEXT,
    "reportType" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "filters" JSONB,
    "data" JSONB NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "format" TEXT NOT NULL DEFAULT 'JSON',
    "fileUrl" TEXT,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "schedule" JSONB,

    CONSTRAINT "analytics_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_analytics" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "overallGPA" DECIMAL(4,2),
    "overallPercentage" DECIMAL(5,2),
    "attendancePercent" DECIMAL(5,2),
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "learningStyle" TEXT,
    "engagementScore" DECIMAL(5,2),
    "predictedPerformance" JSONB,
    "recommendations" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_analytics" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "averageStudentScore" DECIMAL(5,2),
    "classCompletionRate" DECIMAL(5,2),
    "syllabusCompletionRate" DECIMAL(5,2),
    "attendancePercent" DECIMAL(5,2),
    "studentSatisfaction" DECIMAL(5,2),
    "assignmentsCreated" INTEGER NOT NULL DEFAULT 0,
    "examsCreated" INTEGER NOT NULL DEFAULT 0,
    "gradingTurnaround" DECIMAL(7,2),
    "professionalDevelopmentHours" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_analytics" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "totalTeachers" INTEGER NOT NULL DEFAULT 0,
    "averageAttendance" DECIMAL(5,2),
    "passPercentage" DECIMAL(5,2),
    "averageGPA" DECIMAL(4,2),
    "revenueCollected" DECIMAL(12,2),
    "outstandingFees" DECIMAL(12,2),
    "infraUtilization" DECIMAL(5,2),
    "studentTeacherRatio" DECIMAL(5,2),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_queries" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "clickedResultId" TEXT,
    "clickPosition" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "score" DECIMAL(5,4) NOT NULL,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trending_content" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "timeWindow" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" DECIMAL(7,2) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trending_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_products" (
    "id" TEXT NOT NULL,
    "contentId" TEXT,
    "publisherId" TEXT,
    "creatorId" TEXT,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "productType" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "discountPercent" DECIMAL(5,2),
    "discountedPrice" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "revenueGenerated" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_orders" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "sellerEarnings" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "marketplace_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedAmount" DECIMAL(10,2) NOT NULL,
    "availableBalance" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bankAccountDetails" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_backup_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "username" TEXT,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" JSONB,
    "failureReason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceId" TEXT,
    "deviceName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_plans" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "objectives" TEXT[],
    "duration" INTEGER NOT NULL,
    "activities" JSONB,
    "resources" TEXT[],
    "assessment" JSONB,
    "homework" TEXT,
    "plannedFor" DATE,
    "completedAt" TIMESTAMP(3),
    "effectiveness" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syllabus_progress" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "completedPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lastTaughtDate" DATE,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "syllabus_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_groups" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "groupType" TEXT NOT NULL,
    "color" TEXT,
    "motto" TEXT,
    "emblem" TEXT,
    "captainId" TEXT,
    "viceCaptainId" TEXT,
    "members" TEXT[],
    "points" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_calendar" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "description" TEXT,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_blueprints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "board" "Board",
    "grade" INTEGER,
    "subjectId" TEXT,
    "distribution" JSONB NOT NULL,
    "totalMarks" DECIMAL(7,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "difficultyDistribution" JSONB,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_rubrics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL,
    "totalPoints" DECIMAL(7,2) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grading_rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_report_cards" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "term" TEXT,
    "grades" JSONB NOT NULL,
    "overallGrade" TEXT,
    "overallPercentage" DECIMAL(5,2),
    "overallGPA" DECIMAL(4,2),
    "classRank" INTEGER,
    "totalStudents" INTEGER,
    "attendancePercent" DECIMAL(5,2),
    "teacherRemarks" JSONB,
    "principalRemarks" TEXT,
    "coScholastic" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,

    CONSTRAINT "student_report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "preferences" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "gateway" TEXT,
    "gatewayId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "cost" DECIMAL(6,4),

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "providerId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "contentIds" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "board" "Board",
    "grade" INTEGER,
    "subjectId" TEXT,
    "steps" JSONB NOT NULL,
    "estimatedDuration" INTEGER,
    "difficulty" "DifficultyLevel",
    "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DECIMAL(5,2),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_enrollments" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "completedSteps" INTEGER[],
    "progressPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "learning_path_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_moderation" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "moderatedBy" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT,
    "feedback" TEXT,
    "moderatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_moderation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_jobs" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "result" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "lastError" TEXT,
    "errorHistory" JSONB,
    "isDeadLetter" BOOLEAN NOT NULL DEFAULT false,
    "deadLetterAt" TIMESTAMP(3),
    "deadLetterReason" TEXT,
    "executionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_executions" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "executionTime" INTEGER,
    "error" TEXT,
    "stackTrace" TEXT,
    "result" JSONB,

    CONSTRAINT "job_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache_entries" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "ttl" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cache_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "unit" TEXT,
    "tags" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "stackTrace" TEXT,
    "userId" TEXT,
    "requestPath" TEXT,
    "requestMethod" TEXT,
    "requestBody" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "flagName" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "enabledFor" TEXT[],
    "rolloutPercent" DECIMAL(5,2),
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_rollouts" (
    "id" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "rolloutStage" TEXT NOT NULL,
    "targetAudience" TEXT,
    "targetIds" TEXT[],
    "rolloutPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "metrics" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_rollouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hypothesis" TEXT,
    "experimentType" TEXT NOT NULL,
    "variants" JSONB NOT NULL,
    "targetAudience" JSONB,
    "sampleSize" INTEGER,
    "trafficAllocation" JSONB,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "winningVariant" TEXT,
    "results" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "metrics" JSONB,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT,
    "scopes" TEXT[],
    "rateLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "responseStatus" INTEGER,
    "responseBody" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_rate_limits" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "apiKeyId" TEXT,
    "endpoint" TEXT,
    "requestsPerMinute" INTEGER,
    "requestsPerHour" INTEGER,
    "requestsPerDay" INTEGER,
    "burstLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "apiKeyId" TEXT,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_quotas" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "quotaType" TEXT NOT NULL,
    "maxQuota" INTEGER NOT NULL,
    "usedQuota" INTEGER NOT NULL DEFAULT 0,
    "resetPeriod" TEXT NOT NULL,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextResetAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "criteria" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_awards" (
    "id" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "awardedFor" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badge_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "filters" JSONB,
    "entries" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_points" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "pointsBreakdown" JSONB,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastEarnedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_transactions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "ownerId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "category" "MediaCategory" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "folderId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "tags" TEXT[],
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_permissions" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "userId" TEXT,
    "roleId" TEXT,
    "organizationId" TEXT,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canDownload" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canShare" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_settings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "category" TEXT,
    "overridesPlatform" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_settings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "category" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "integrationType" "IntegrationType" NOT NULL,
    "providerName" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenType" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_mappings" (
    "id" TEXT NOT NULL,
    "internalEntityType" TEXT NOT NULL,
    "internalEntityId" TEXT NOT NULL,
    "externalSystem" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "mappingData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_events" (
    "id" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "eventName" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "targetSystem" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_subscriptions" (
    "id" TEXT NOT NULL,
    "subscriberName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "endpoint" TEXT,
    "subscriptionType" TEXT NOT NULL,
    "filters" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "retryPolicy" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_retries" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_retries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_failures" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "payload" JSONB NOT NULL,
    "failureReason" TEXT NOT NULL,
    "errorDetails" JSONB,
    "attempts" INTEGER NOT NULL,
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "event_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workflowType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "stepHistory" JSONB NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syllabus_versions" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "versionName" TEXT,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "changes" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "syllabus" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "syllabus_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_outcomes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "curriculumId" TEXT,
    "subjectId" TEXT,
    "topicId" TEXT,
    "bloomsLevel" TEXT,
    "competencies" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_reports" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "reportingPeriod" TEXT NOT NULL,
    "schoolId" TEXT,
    "districtId" TEXT,
    "stateId" TEXT,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checks" (
    "id" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "findings" JSONB,
    "score" DECIMAL(5,2),
    "checkedBy" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextCheckDue" TIMESTAMP(3),

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archival_policies" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "archiveAfterDays" INTEGER NOT NULL,
    "deleteAfterDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archival_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archived_data" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteAt" TIMESTAMP(3),

    CONSTRAINT "archived_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_indexes" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "searchableText" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_keywords" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "relatedKeywords" TEXT[],
    "lastSearchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "clickedResults" JSONB,
    "refinements" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER,
    "wasSuccessful" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "entityType" TEXT,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recent_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_facets" (
    "id" TEXT NOT NULL,
    "facetType" TEXT NOT NULL,
    "facetKey" TEXT NOT NULL,
    "facetValue" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "search_facets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synonyms" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "synonyms" TEXT[],
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "synonyms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_suggestions" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "relevanceScore" DECIMAL(5,4) NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSearchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_definitions" (
    "id" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "calculationFormula" TEXT,
    "unit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metric_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpis" (
    "id" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetValue" DECIMAL(12,2) NOT NULL,
    "currentValue" DECIMAL(12,2) NOT NULL,
    "threshold" JSONB,
    "entityType" TEXT,
    "entityId" TEXT,
    "period" TEXT NOT NULL,
    "periodDate" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ON_TRACK',

    CONSTRAINT "kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_cache" (
    "id" TEXT NOT NULL,
    "dashboardKey" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "cacheData" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dashboard_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_history" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "externalSystem" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsSuccess" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "metadata" JSONB,

    CONSTRAINT "sync_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_failures" (
    "id" TEXT NOT NULL,
    "syncHistoryId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "errorMessage" TEXT NOT NULL,
    "errorDetails" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "category" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "activityType" TEXT NOT NULL,
    "page" TEXT,
    "action" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "pagesViewed" INTEGER NOT NULL DEFAULT 0,
    "actionsPerformed" INTEGER NOT NULL DEFAULT 0,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "referrer" TEXT,

    CONSTRAINT "session_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentApproverId" TEXT,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "dueDate" TIMESTAMP(3),
    "approvalChain" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_history" (
    "id" TEXT NOT NULL,
    "approvalId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "attachments" TEXT[],
    "actionedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "certificateType" TEXT NOT NULL,
    "templateHtml" TEXT NOT NULL,
    "templateCss" TEXT,
    "variables" TEXT[],
    "signaturePositions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "issuedFor" TEXT,
    "data" JSONB NOT NULL,
    "generatedPdfUrl" TEXT,
    "issuedBy" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "verificationCode" TEXT NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_card_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "schoolId" TEXT,
    "organizationId" TEXT,
    "templateFront" TEXT NOT NULL,
    "templateBack" TEXT,
    "dimensions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "id_card_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_cards" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "holderId" TEXT NOT NULL,
    "holderType" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "qrCode" TEXT,
    "barcode" TEXT,
    "photoUrl" TEXT,
    "validFrom" DATE NOT NULL,
    "validUntil" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "generatedPdfUrl" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "id_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refreshToken_key" ON "user_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "custom_roles_organizationId_idx" ON "custom_roles"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_name_organizationId_key" ON "custom_roles"("name", "organizationId");

-- CreateIndex
CREATE INDEX "custom_permissions_roleId_idx" ON "custom_permissions"("roleId");

-- CreateIndex
CREATE INDEX "custom_permissions_userId_idx" ON "custom_permissions"("userId");

-- CreateIndex
CREATE INDEX "user_role_mappings_userId_idx" ON "user_role_mappings"("userId");

-- CreateIndex
CREATE INDEX "user_role_mappings_roleId_idx" ON "user_role_mappings"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_mappings_userId_roleId_organizationId_key" ON "user_role_mappings"("userId", "roleId", "organizationId");

-- CreateIndex
CREATE INDEX "roles_organizationId_idx" ON "roles"("organizationId");

-- CreateIndex
CREATE INDEX "roles_isActive_idx" ON "roles"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_organizationId_key" ON "roles"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "permission_categories_name_key" ON "permission_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permission_groups_name_key" ON "permission_groups"("name");

-- CreateIndex
CREATE INDEX "permission_groups_categoryId_idx" ON "permission_groups"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "permissions_resource_action_idx" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "permissions_categoryId_idx" ON "permissions"("categoryId");

-- CreateIndex
CREATE INDEX "permissions_groupId_idx" ON "permissions"("groupId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "permission_dependencies_permissionId_idx" ON "permission_dependencies"("permissionId");

-- CreateIndex
CREATE INDEX "permission_dependencies_requiredPermissionId_idx" ON "permission_dependencies"("requiredPermissionId");

-- CreateIndex
CREATE UNIQUE INDEX "permission_dependencies_permissionId_requiredPermissionId_key" ON "permission_dependencies"("permissionId", "requiredPermissionId");

-- CreateIndex
CREATE INDEX "role_inheritances_parentRoleId_idx" ON "role_inheritances"("parentRoleId");

-- CreateIndex
CREATE INDEX "role_inheritances_childRoleId_idx" ON "role_inheritances"("childRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "role_inheritances_parentRoleId_childRoleId_key" ON "role_inheritances"("parentRoleId", "childRoleId");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE INDEX "user_roles_scopeType_scopeId_idx" ON "user_roles"("scopeType", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_scopeType_scopeId_key" ON "user_roles"("userId", "roleId", "scopeType", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_authentications_userId_key" ON "user_authentications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_authentications_googleId_key" ON "user_authentications"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_authentications_microsoftId_key" ON "user_authentications"("microsoftId");

-- CreateIndex
CREATE INDEX "user_authentications_userId_idx" ON "user_authentications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_security_userId_key" ON "user_security"("userId");

-- CreateIndex
CREATE INDEX "user_security_userId_idx" ON "user_security"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_userId_idx" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_contact_info_userId_key" ON "user_contact_info"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_contact_info_email_key" ON "user_contact_info"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_contact_info_phone_key" ON "user_contact_info"("phone");

-- CreateIndex
CREATE INDEX "user_contact_info_userId_idx" ON "user_contact_info"("userId");

-- CreateIndex
CREATE INDEX "user_contact_info_email_idx" ON "user_contact_info"("email");

-- CreateIndex
CREATE INDEX "user_contact_info_phone_idx" ON "user_contact_info"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_verifications_userId_key" ON "user_verifications"("userId");

-- CreateIndex
CREATE INDEX "user_verifications_userId_idx" ON "user_verifications"("userId");

-- CreateIndex
CREATE INDEX "user_login_history_userId_idx" ON "user_login_history"("userId");

-- CreateIndex
CREATE INDEX "user_login_history_loginAt_idx" ON "user_login_history"("loginAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sensitive_data_userId_key" ON "user_sensitive_data"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sensitive_data_aadhaarHash_key" ON "user_sensitive_data"("aadhaarHash");

-- CreateIndex
CREATE INDEX "user_sensitive_data_userId_idx" ON "user_sensitive_data"("userId");

-- CreateIndex
CREATE INDEX "user_sensitive_data_aadhaarHash_idx" ON "user_sensitive_data"("aadhaarHash");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE INDEX "states_countryId_idx" ON "states"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "states_countryId_code_key" ON "states"("countryId", "code");

-- CreateIndex
CREATE INDEX "districts_stateId_idx" ON "districts"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "districts_stateId_code_key" ON "districts"("stateId", "code");

-- CreateIndex
CREATE INDEX "blocks_districtId_idx" ON "blocks"("districtId");

-- CreateIndex
CREATE INDEX "villages_blockId_idx" ON "villages"("blockId");

-- CreateIndex
CREATE INDEX "addresses_entityType_entityId_idx" ON "addresses"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "addresses_stateId_idx" ON "addresses"("stateId");

-- CreateIndex
CREATE INDEX "addresses_districtId_idx" ON "addresses"("districtId");

-- CreateIndex
CREATE INDEX "addresses_pincode_idx" ON "addresses"("pincode");

-- CreateIndex
CREATE INDEX "tenant_hierarchy_parentId_idx" ON "tenant_hierarchy"("parentId");

-- CreateIndex
CREATE INDEX "tenant_hierarchy_hierarchyPath_idx" ON "tenant_hierarchy"("hierarchyPath");

-- CreateIndex
CREATE INDEX "tenant_hierarchy_entityType_entityId_idx" ON "tenant_hierarchy"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_hierarchy_entityType_entityId_key" ON "tenant_hierarchy"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "government_entities_code_key" ON "government_entities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "government_entities_tenantId_key" ON "government_entities"("tenantId");

-- CreateIndex
CREATE INDEX "government_entities_tenantId_idx" ON "government_entities"("tenantId");

-- CreateIndex
CREATE INDEX "government_entities_level_idx" ON "government_entities"("level");

-- CreateIndex
CREATE INDEX "government_entities_stateId_idx" ON "government_entities"("stateId");

-- CreateIndex
CREATE INDEX "government_entities_districtId_idx" ON "government_entities"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_registrationNumber_key" ON "organizations"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_tenantId_key" ON "organizations"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_customDomain_key" ON "organizations"("customDomain");

-- CreateIndex
CREATE INDEX "organizations_tenantId_idx" ON "organizations"("tenantId");

-- CreateIndex
CREATE INDEX "organizations_type_idx" ON "organizations"("type");

-- CreateIndex
CREATE INDEX "organizations_parentOrganizationId_idx" ON "organizations"("parentOrganizationId");

-- CreateIndex
CREATE INDEX "organizations_hierarchyPath_idx" ON "organizations"("hierarchyPath");

-- CreateIndex
CREATE INDEX "organizations_stateId_idx" ON "organizations"("stateId");

-- CreateIndex
CREATE INDEX "organizations_districtId_idx" ON "organizations"("districtId");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "branches_tenantId_key" ON "branches"("tenantId");

-- CreateIndex
CREATE INDEX "branches_organizationId_idx" ON "branches"("organizationId");

-- CreateIndex
CREATE INDEX "branches_tenantId_idx" ON "branches"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "branches_organizationId_code_key" ON "branches"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenantId_key" ON "departments"("tenantId");

-- CreateIndex
CREATE INDEX "departments_organizationId_idx" ON "departments"("organizationId");

-- CreateIndex
CREATE INDEX "departments_branchId_idx" ON "departments"("branchId");

-- CreateIndex
CREATE INDEX "departments_tenantId_idx" ON "departments"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_organizationId_code_key" ON "departments"("organizationId", "code");

-- CreateIndex
CREATE INDEX "organization_users_organizationId_idx" ON "organization_users"("organizationId");

-- CreateIndex
CREATE INDEX "organization_users_userId_idx" ON "organization_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_users_organizationId_userId_key" ON "organization_users"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");

-- CreateIndex
CREATE UNIQUE INDEX "schools_udiseCode_key" ON "schools"("udiseCode");

-- CreateIndex
CREATE UNIQUE INDEX "schools_tenantId_key" ON "schools"("tenantId");

-- CreateIndex
CREATE INDEX "schools_organizationId_idx" ON "schools"("organizationId");

-- CreateIndex
CREATE INDEX "schools_branchId_idx" ON "schools"("branchId");

-- CreateIndex
CREATE INDEX "schools_code_idx" ON "schools"("code");

-- CreateIndex
CREATE INDEX "schools_tenantId_idx" ON "schools"("tenantId");

-- CreateIndex
CREATE INDEX "schools_stateId_idx" ON "schools"("stateId");

-- CreateIndex
CREATE INDEX "schools_districtId_idx" ON "schools"("districtId");

-- CreateIndex
CREATE INDEX "schools_isActive_idx" ON "schools"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "board_masters_code_key" ON "board_masters"("code");

-- CreateIndex
CREATE INDEX "board_masters_code_idx" ON "board_masters"("code");

-- CreateIndex
CREATE INDEX "board_masters_stateCode_idx" ON "board_masters"("stateCode");

-- CreateIndex
CREATE UNIQUE INDEX "curricula_code_key" ON "curricula"("code");

-- CreateIndex
CREATE INDEX "curricula_boardId_idx" ON "curricula"("boardId");

-- CreateIndex
CREATE INDEX "curricula_code_idx" ON "curricula"("code");

-- CreateIndex
CREATE INDEX "curriculum_subjects_curriculumId_idx" ON "curriculum_subjects"("curriculumId");

-- CreateIndex
CREATE INDEX "curriculum_subjects_subjectId_idx" ON "curriculum_subjects"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_subjects_curriculumId_subjectId_grade_key" ON "curriculum_subjects"("curriculumId", "subjectId", "grade");

-- CreateIndex
CREATE INDEX "academic_years_schoolId_isCurrent_idx" ON "academic_years"("schoolId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_schoolId_year_key" ON "academic_years"("schoolId", "year");

-- CreateIndex
CREATE INDEX "classes_schoolId_idx" ON "classes"("schoolId");

-- CreateIndex
CREATE INDEX "classes_academicYearId_idx" ON "classes"("academicYearId");

-- CreateIndex
CREATE INDEX "classes_schoolId_academicYearId_idx" ON "classes"("schoolId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_schoolId_academicYearId_grade_stream_key" ON "classes"("schoolId", "academicYearId", "grade", "stream");

-- CreateIndex
CREATE INDEX "sections_classId_idx" ON "sections"("classId");

-- CreateIndex
CREATE INDEX "sections_classTeacherId_idx" ON "sections"("classTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "sections_classId_sectionName_key" ON "sections"("classId", "sectionName");

-- CreateIndex
CREATE INDEX "section_teachers_sectionId_idx" ON "section_teachers"("sectionId");

-- CreateIndex
CREATE INDEX "section_teachers_teacherId_idx" ON "section_teachers"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "section_teachers_sectionId_teacherId_subjectId_key" ON "section_teachers"("sectionId", "teacherId", "subjectId");

-- CreateIndex
CREATE INDEX "section_subjects_sectionId_idx" ON "section_subjects"("sectionId");

-- CreateIndex
CREATE INDEX "section_subjects_subjectId_idx" ON "section_subjects"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "section_subjects_sectionId_subjectId_key" ON "section_subjects"("sectionId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE INDEX "subjects_board_grade_idx" ON "subjects"("board", "grade");

-- CreateIndex
CREATE INDEX "class_subjects_classId_idx" ON "class_subjects"("classId");

-- CreateIndex
CREATE INDEX "class_subjects_subjectId_idx" ON "class_subjects"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "class_subjects_classId_subjectId_key" ON "class_subjects"("classId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_admissionNumber_key" ON "student_profiles"("admissionNumber");

-- CreateIndex
CREATE INDEX "student_profiles_userId_idx" ON "student_profiles"("userId");

-- CreateIndex
CREATE INDEX "student_profiles_schoolId_idx" ON "student_profiles"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_userId_key" ON "teacher_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_employeeId_key" ON "teacher_profiles"("employeeId");

-- CreateIndex
CREATE INDEX "teacher_profiles_userId_idx" ON "teacher_profiles"("userId");

-- CreateIndex
CREATE INDEX "teacher_profiles_schoolId_idx" ON "teacher_profiles"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "parent_profiles_userId_key" ON "parent_profiles"("userId");

-- CreateIndex
CREATE INDEX "parent_profiles_userId_idx" ON "parent_profiles"("userId");

-- CreateIndex
CREATE INDEX "parent_students_parentId_idx" ON "parent_students"("parentId");

-- CreateIndex
CREATE INDEX "parent_students_studentId_idx" ON "parent_students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "parent_students_parentId_studentId_key" ON "parent_students"("parentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "publisher_profiles_userId_key" ON "publisher_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "publisher_profiles_registrationNumber_key" ON "publisher_profiles"("registrationNumber");

-- CreateIndex
CREATE INDEX "publisher_profiles_userId_idx" ON "publisher_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_userId_key" ON "creator_profiles"("userId");

-- CreateIndex
CREATE INDEX "creator_profiles_userId_idx" ON "creator_profiles"("userId");

-- CreateIndex
CREATE INDEX "student_enrollments_studentId_idx" ON "student_enrollments"("studentId");

-- CreateIndex
CREATE INDEX "student_enrollments_sectionId_idx" ON "student_enrollments"("sectionId");

-- CreateIndex
CREATE INDEX "student_enrollments_academicYearId_idx" ON "student_enrollments"("academicYearId");

-- CreateIndex
CREATE INDEX "student_enrollments_studentId_academicYearId_status_idx" ON "student_enrollments"("studentId", "academicYearId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_studentId_academicYearId_key" ON "student_enrollments"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "chapters_subjectId_idx" ON "chapters"("subjectId");

-- CreateIndex
CREATE INDEX "chapters_board_grade_idx" ON "chapters"("board", "grade");

-- CreateIndex
CREATE INDEX "topics_chapterId_idx" ON "topics"("chapterId");

-- CreateIndex
CREATE INDEX "subtopics_topicId_idx" ON "subtopics"("topicId");

-- CreateIndex
CREATE INDEX "sub_subtopics_subtopicId_idx" ON "sub_subtopics"("subtopicId");

-- CreateIndex
CREATE INDEX "contents_creatorId_idx" ON "contents"("creatorId");

-- CreateIndex
CREATE INDEX "contents_status_idx" ON "contents"("status");

-- CreateIndex
CREATE INDEX "contents_contentType_idx" ON "contents"("contentType");

-- CreateIndex
CREATE INDEX "contents_board_grade_idx" ON "contents"("board", "grade");

-- CreateIndex
CREATE INDEX "contents_subjectId_idx" ON "contents"("subjectId");

-- CreateIndex
CREATE INDEX "contents_topicId_idx" ON "contents"("topicId");

-- CreateIndex
CREATE INDEX "contents_status_contentType_idx" ON "contents"("status", "contentType");

-- CreateIndex
CREATE INDEX "contents_board_grade_subjectId_idx" ON "contents"("board", "grade", "subjectId");

-- CreateIndex
CREATE INDEX "contents_creatorId_status_idx" ON "contents"("creatorId", "status");

-- CreateIndex
CREATE INDEX "contents_title_description_keywords_idx" ON "contents"("title", "description", "keywords");

-- CreateIndex
CREATE INDEX "content_reviews_contentId_idx" ON "content_reviews"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "content_reviews_contentId_userId_key" ON "content_reviews"("contentId", "userId");

-- CreateIndex
CREATE INDEX "content_versions_contentId_idx" ON "content_versions"("contentId");

-- CreateIndex
CREATE INDEX "content_versions_versionNumber_idx" ON "content_versions"("versionNumber");

-- CreateIndex
CREATE INDEX "content_versions_status_idx" ON "content_versions"("status");

-- CreateIndex
CREATE INDEX "content_drafts_contentId_idx" ON "content_drafts"("contentId");

-- CreateIndex
CREATE INDEX "content_drafts_createdBy_idx" ON "content_drafts"("createdBy");

-- CreateIndex
CREATE INDEX "content_workflows_contentId_idx" ON "content_workflows"("contentId");

-- CreateIndex
CREATE INDEX "content_workflows_status_idx" ON "content_workflows"("status");

-- CreateIndex
CREATE INDEX "content_workflows_assignedTo_idx" ON "content_workflows"("assignedTo");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE INDEX "books_publisherId_idx" ON "books"("publisherId");

-- CreateIndex
CREATE INDEX "books_board_grade_idx" ON "books"("board", "grade");

-- CreateIndex
CREATE INDEX "diagrams_bookId_idx" ON "diagrams"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ar_markers_diagramId_key" ON "ar_markers"("diagramId");

-- CreateIndex
CREATE UNIQUE INDEX "ar_markers_markerCode_key" ON "ar_markers"("markerCode");

-- CreateIndex
CREATE INDEX "ar_markers_publisherId_idx" ON "ar_markers"("publisherId");

-- CreateIndex
CREATE INDEX "ar_markers_markerCode_idx" ON "ar_markers"("markerCode");

-- CreateIndex
CREATE INDEX "ar_contents_contentId_idx" ON "ar_contents"("contentId");

-- CreateIndex
CREATE INDEX "ar_contents_markerId_idx" ON "ar_contents"("markerId");

-- CreateIndex
CREATE INDEX "vr_contents_contentId_idx" ON "vr_contents"("contentId");

-- CreateIndex
CREATE INDEX "vr_usage_logs_vrContentId_idx" ON "vr_usage_logs"("vrContentId");

-- CreateIndex
CREATE INDEX "vr_usage_logs_userId_idx" ON "vr_usage_logs"("userId");

-- CreateIndex
CREATE INDEX "vr_usage_logs_sessionId_idx" ON "vr_usage_logs"("sessionId");

-- CreateIndex
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "licenses_organizationId_idx" ON "licenses"("organizationId");

-- CreateIndex
CREATE INDEX "licenses_isActive_idx" ON "licenses"("isActive");

-- CreateIndex
CREATE INDEX "license_assignments_licenseId_idx" ON "license_assignments"("licenseId");

-- CreateIndex
CREATE INDEX "license_assignments_userId_idx" ON "license_assignments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "license_assignments_licenseId_userId_key" ON "license_assignments"("licenseId", "userId");

-- CreateIndex
CREATE INDEX "subscription_contents_subscriptionId_idx" ON "subscription_contents"("subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_contents_contentId_idx" ON "subscription_contents"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_contents_subscriptionId_contentId_key" ON "subscription_contents"("subscriptionId", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gatewayTransactionId_key" ON "payments"("gatewayTransactionId");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_organizationId_idx" ON "payments"("organizationId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE INDEX "payments_userId_status_idx" ON "payments"("userId", "status");

-- CreateIndex
CREATE INDEX "payments_organizationId_status_idx" ON "payments"("organizationId", "status");

-- CreateIndex
CREATE INDEX "payments_status_createdAt_idx" ON "payments"("status", "createdAt");

-- CreateIndex
CREATE INDEX "payment_attempts_paymentId_idx" ON "payment_attempts"("paymentId");

-- CreateIndex
CREATE INDEX "payment_attempts_status_idx" ON "payment_attempts"("status");

-- CreateIndex
CREATE INDEX "payment_refunds_paymentId_idx" ON "payment_refunds"("paymentId");

-- CreateIndex
CREATE INDEX "payment_refunds_status_idx" ON "payment_refunds"("status");

-- CreateIndex
CREATE INDEX "payment_reconciliations_reconciliationDate_idx" ON "payment_reconciliations"("reconciliationDate");

-- CreateIndex
CREATE INDEX "payment_reconciliations_gateway_idx" ON "payment_reconciliations"("gateway");

-- CreateIndex
CREATE INDEX "payment_reconciliations_status_idx" ON "payment_reconciliations"("status");

-- CreateIndex
CREATE INDEX "payment_gateway_logs_gateway_idx" ON "payment_gateway_logs"("gateway");

-- CreateIndex
CREATE INDEX "payment_gateway_logs_timestamp_idx" ON "payment_gateway_logs"("timestamp");

-- CreateIndex
CREATE INDEX "publisher_monetization_plans_publisherId_idx" ON "publisher_monetization_plans"("publisherId");

-- CreateIndex
CREATE INDEX "creator_monetization_plans_creatorId_idx" ON "creator_monetization_plans"("creatorId");

-- CreateIndex
CREATE INDEX "content_purchases_contentId_idx" ON "content_purchases"("contentId");

-- CreateIndex
CREATE INDEX "content_purchases_userId_idx" ON "content_purchases"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "content_purchases_contentId_userId_key" ON "content_purchases"("contentId", "userId");

-- CreateIndex
CREATE INDEX "payouts_userId_idx" ON "payouts"("userId");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "question_bank_board_grade_subjectId_idx" ON "question_bank"("board", "grade", "subjectId");

-- CreateIndex
CREATE INDEX "question_bank_difficultyLevel_idx" ON "question_bank"("difficultyLevel");

-- CreateIndex
CREATE INDEX "question_bank_board_grade_subjectId_difficultyLevel_idx" ON "question_bank"("board", "grade", "subjectId", "difficultyLevel");

-- CreateIndex
CREATE INDEX "question_bank_isPublic_isActive_idx" ON "question_bank"("isPublic", "isActive");

-- CreateIndex
CREATE INDEX "question_bank_question_keywords_idx" ON "question_bank"("question", "keywords");

-- CreateIndex
CREATE INDEX "exams_teacherId_idx" ON "exams"("teacherId");

-- CreateIndex
CREATE INDEX "exams_sectionId_idx" ON "exams"("sectionId");

-- CreateIndex
CREATE INDEX "exams_examType_idx" ON "exams"("examType");

-- CreateIndex
CREATE INDEX "exam_questions_examId_idx" ON "exam_questions"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_questions_examId_questionOrder_key" ON "exam_questions"("examId", "questionOrder");

-- CreateIndex
CREATE INDEX "exam_assignments_examId_idx" ON "exam_assignments"("examId");

-- CreateIndex
CREATE INDEX "exam_assignments_studentId_idx" ON "exam_assignments"("studentId");

-- CreateIndex
CREATE INDEX "exam_assignments_classId_idx" ON "exam_assignments"("classId");

-- CreateIndex
CREATE INDEX "exam_attempts_examId_idx" ON "exam_attempts"("examId");

-- CreateIndex
CREATE INDEX "exam_attempts_studentId_idx" ON "exam_attempts"("studentId");

-- CreateIndex
CREATE INDEX "exam_attempts_examId_studentId_idx" ON "exam_attempts"("examId", "studentId");

-- CreateIndex
CREATE INDEX "exam_attempts_studentId_submittedAt_idx" ON "exam_attempts"("studentId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempts_examId_studentId_attemptNumber_key" ON "exam_attempts"("examId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "exam_answers_attemptId_idx" ON "exam_answers"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_answers_attemptId_questionId_key" ON "exam_answers"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "assignments_teacherId_idx" ON "assignments"("teacherId");

-- CreateIndex
CREATE INDEX "assignments_sectionId_idx" ON "assignments"("sectionId");

-- CreateIndex
CREATE INDEX "assignment_submissions_assignmentId_idx" ON "assignment_submissions"("assignmentId");

-- CreateIndex
CREATE INDEX "assignment_submissions_studentId_idx" ON "assignment_submissions"("studentId");

-- CreateIndex
CREATE INDEX "assignment_submissions_assignmentId_studentId_idx" ON "assignment_submissions"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX "assignment_submissions_status_idx" ON "assignment_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignmentId_studentId_key" ON "assignment_submissions"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX "live_classes_teacherId_idx" ON "live_classes"("teacherId");

-- CreateIndex
CREATE INDEX "live_classes_status_idx" ON "live_classes"("status");

-- CreateIndex
CREATE INDEX "live_classes_scheduledStart_idx" ON "live_classes"("scheduledStart");

-- CreateIndex
CREATE INDEX "live_classes_teacherId_status_idx" ON "live_classes"("teacherId", "status");

-- CreateIndex
CREATE INDEX "live_classes_scheduledStart_status_idx" ON "live_classes"("scheduledStart", "status");

-- CreateIndex
CREATE INDEX "live_classes_classMode_status_idx" ON "live_classes"("classMode", "status");

-- CreateIndex
CREATE INDEX "live_class_participants_liveClassId_idx" ON "live_class_participants"("liveClassId");

-- CreateIndex
CREATE INDEX "live_class_participants_userId_idx" ON "live_class_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "live_class_participants_liveClassId_userId_key" ON "live_class_participants"("liveClassId", "userId");

-- CreateIndex
CREATE INDEX "class_recordings_liveClassId_idx" ON "class_recordings"("liveClassId");

-- CreateIndex
CREATE INDEX "three_d_models_subjectId_idx" ON "three_d_models"("subjectId");

-- CreateIndex
CREATE INDEX "learning_progress_studentId_idx" ON "learning_progress"("studentId");

-- CreateIndex
CREATE INDEX "learning_progress_contentId_idx" ON "learning_progress"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_progress_studentId_contentId_key" ON "learning_progress"("studentId", "contentId");

-- CreateIndex
CREATE INDEX "usage_logs_userId_idx" ON "usage_logs"("userId");

-- CreateIndex
CREATE INDEX "usage_logs_sessionId_idx" ON "usage_logs"("sessionId");

-- CreateIndex
CREATE INDEX "usage_logs_activityType_idx" ON "usage_logs"("activityType");

-- CreateIndex
CREATE INDEX "usage_logs_timestamp_idx" ON "usage_logs"("timestamp");

-- CreateIndex
CREATE INDEX "performance_metrics_studentId_idx" ON "performance_metrics"("studentId");

-- CreateIndex
CREATE INDEX "performance_metrics_metricType_idx" ON "performance_metrics"("metricType");

-- CreateIndex
CREATE INDEX "rankings_studentId_idx" ON "rankings"("studentId");

-- CreateIndex
CREATE INDEX "rankings_examId_scope_idx" ON "rankings"("examId", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_devices_deviceId_key" ON "attendance_devices"("deviceId");

-- CreateIndex
CREATE INDEX "attendance_devices_schoolId_idx" ON "attendance_devices"("schoolId");

-- CreateIndex
CREATE INDEX "attendance_devices_deviceId_idx" ON "attendance_devices"("deviceId");

-- CreateIndex
CREATE INDEX "attendance_studentId_idx" ON "attendance"("studentId");

-- CreateIndex
CREATE INDEX "attendance_schoolId_date_idx" ON "attendance"("schoolId", "date");

-- CreateIndex
CREATE INDEX "attendance_sectionId_date_idx" ON "attendance"("sectionId", "date");

-- CreateIndex
CREATE INDEX "attendance_status_idx" ON "attendance"("status");

-- CreateIndex
CREATE INDEX "attendance_method_idx" ON "attendance"("method");

-- CreateIndex
CREATE INDEX "attendance_schoolId_sectionId_date_idx" ON "attendance"("schoolId", "sectionId", "date");

-- CreateIndex
CREATE INDEX "attendance_studentId_status_idx" ON "attendance"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_studentId_date_period_key" ON "attendance"("studentId", "date", "period");

-- CreateIndex
CREATE INDEX "teacher_attendance_teacherId_idx" ON "teacher_attendance"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_attendance_schoolId_date_idx" ON "teacher_attendance"("schoolId", "date");

-- CreateIndex
CREATE INDEX "teacher_attendance_date_idx" ON "teacher_attendance"("date");

-- CreateIndex
CREATE INDEX "teacher_attendance_status_idx" ON "teacher_attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_attendance_teacherId_date_key" ON "teacher_attendance"("teacherId", "date");

-- CreateIndex
CREATE INDEX "biometric_attendance_logs_deviceId_idx" ON "biometric_attendance_logs"("deviceId");

-- CreateIndex
CREATE INDEX "biometric_attendance_logs_userId_timestamp_idx" ON "biometric_attendance_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "biometric_attendance_logs_processed_idx" ON "biometric_attendance_logs"("processed");

-- CreateIndex
CREATE INDEX "biometric_attendance_logs_deviceId_timestamp_idx" ON "biometric_attendance_logs"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "rooms_schoolId_idx" ON "rooms"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_schoolId_roomNumber_key" ON "rooms"("schoolId", "roomNumber");

-- CreateIndex
CREATE INDEX "time_slots_schoolId_idx" ON "time_slots"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_schoolId_slotNumber_effectiveFrom_key" ON "time_slots"("schoolId", "slotNumber", "effectiveFrom");

-- CreateIndex
CREATE INDEX "timetable_entries_schoolId_idx" ON "timetable_entries"("schoolId");

-- CreateIndex
CREATE INDEX "timetable_entries_sectionId_idx" ON "timetable_entries"("sectionId");

-- CreateIndex
CREATE INDEX "timetable_entries_teacherId_idx" ON "timetable_entries"("teacherId");

-- CreateIndex
CREATE INDEX "timetable_entries_timeSlotId_idx" ON "timetable_entries"("timeSlotId");

-- CreateIndex
CREATE INDEX "timetable_entries_roomId_idx" ON "timetable_entries"("roomId");

-- CreateIndex
CREATE INDEX "timetable_entries_dayOfWeek_idx" ON "timetable_entries"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_entries_schoolId_sectionId_dayOfWeek_timeSlotId_e_key" ON "timetable_entries"("schoolId", "sectionId", "dayOfWeek", "timeSlotId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "fee_structures_schoolId_idx" ON "fee_structures"("schoolId");

-- CreateIndex
CREATE INDEX "fee_records_studentId_idx" ON "fee_records"("studentId");

-- CreateIndex
CREATE INDEX "fee_records_feeStructureId_idx" ON "fee_records"("feeStructureId");

-- CreateIndex
CREATE INDEX "fee_records_status_idx" ON "fee_records"("status");

-- CreateIndex
CREATE INDEX "fee_records_studentId_status_idx" ON "fee_records"("studentId", "status");

-- CreateIndex
CREATE INDEX "fee_records_feeStructureId_status_idx" ON "fee_records"("feeStructureId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fee_payments_receiptNumber_key" ON "fee_payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "fee_payments_feeRecordId_idx" ON "fee_payments"("feeRecordId");

-- CreateIndex
CREATE INDEX "fee_payments_receiptNumber_idx" ON "fee_payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "fee_concessions_studentId_idx" ON "fee_concessions"("studentId");

-- CreateIndex
CREATE INDEX "fee_concessions_feeStructureId_idx" ON "fee_concessions"("feeStructureId");

-- CreateIndex
CREATE INDEX "fee_installments_feeRecordId_idx" ON "fee_installments"("feeRecordId");

-- CreateIndex
CREATE INDEX "fee_installments_status_idx" ON "fee_installments"("status");

-- CreateIndex
CREATE INDEX "fee_refunds_studentId_idx" ON "fee_refunds"("studentId");

-- CreateIndex
CREATE INDEX "fee_refunds_feePaymentId_idx" ON "fee_refunds"("feePaymentId");

-- CreateIndex
CREATE INDEX "fee_refunds_status_idx" ON "fee_refunds"("status");

-- CreateIndex
CREATE INDEX "fee_waivers_studentId_idx" ON "fee_waivers"("studentId");

-- CreateIndex
CREATE INDEX "fee_waivers_feeStructureId_idx" ON "fee_waivers"("feeStructureId");

-- CreateIndex
CREATE INDEX "fee_waivers_status_idx" ON "fee_waivers"("status");

-- CreateIndex
CREATE INDEX "scholarships_schoolId_idx" ON "scholarships"("schoolId");

-- CreateIndex
CREATE INDEX "scholarships_isActive_idx" ON "scholarships"("isActive");

-- CreateIndex
CREATE INDEX "scholarship_applications_scholarshipId_idx" ON "scholarship_applications"("scholarshipId");

-- CreateIndex
CREATE INDEX "scholarship_applications_studentId_idx" ON "scholarship_applications"("studentId");

-- CreateIndex
CREATE INDEX "scholarship_applications_status_idx" ON "scholarship_applications"("status");

-- CreateIndex
CREATE INDEX "scholarship_applications_scholarshipId_status_idx" ON "scholarship_applications"("scholarshipId", "status");

-- CreateIndex
CREATE INDEX "scholarship_applications_studentId_status_idx" ON "scholarship_applications"("studentId", "status");

-- CreateIndex
CREATE INDEX "transport_fees_studentId_idx" ON "transport_fees"("studentId");

-- CreateIndex
CREATE INDEX "transport_fees_routeId_idx" ON "transport_fees"("routeId");

-- CreateIndex
CREATE INDEX "transport_fees_status_idx" ON "transport_fees"("status");

-- CreateIndex
CREATE INDEX "library_books_schoolId_idx" ON "library_books"("schoolId");

-- CreateIndex
CREATE INDEX "library_books_isbn_idx" ON "library_books"("isbn");

-- CreateIndex
CREATE INDEX "library_books_category_idx" ON "library_books"("category");

-- CreateIndex
CREATE INDEX "library_books_title_author_idx" ON "library_books"("title", "author");

-- CreateIndex
CREATE INDEX "library_issues_bookId_idx" ON "library_issues"("bookId");

-- CreateIndex
CREATE INDEX "library_issues_userId_idx" ON "library_issues"("userId");

-- CreateIndex
CREATE INDEX "library_issues_userType_idx" ON "library_issues"("userType");

-- CreateIndex
CREATE INDEX "library_issues_isReturned_idx" ON "library_issues"("isReturned");

-- CreateIndex
CREATE INDEX "library_issues_isOverdue_idx" ON "library_issues"("isOverdue");

-- CreateIndex
CREATE INDEX "library_issues_dueDate_idx" ON "library_issues"("dueDate");

-- CreateIndex
CREATE INDEX "library_issues_userId_isReturned_idx" ON "library_issues"("userId", "isReturned");

-- CreateIndex
CREATE INDEX "library_issues_dueDate_isReturned_idx" ON "library_issues"("dueDate", "isReturned");

-- CreateIndex
CREATE INDEX "library_reservations_bookId_idx" ON "library_reservations"("bookId");

-- CreateIndex
CREATE INDEX "library_reservations_userId_idx" ON "library_reservations"("userId");

-- CreateIndex
CREATE INDEX "library_reservations_status_idx" ON "library_reservations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "library_members_userId_key" ON "library_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "library_members_membershipNumber_key" ON "library_members"("membershipNumber");

-- CreateIndex
CREATE INDEX "library_members_userId_idx" ON "library_members"("userId");

-- CreateIndex
CREATE INDEX "library_members_membershipNumber_idx" ON "library_members"("membershipNumber");

-- CreateIndex
CREATE INDEX "ai_recommendations_userId_idx" ON "ai_recommendations"("userId");

-- CreateIndex
CREATE INDEX "ai_recommendations_recommendationType_idx" ON "ai_recommendations"("recommendationType");

-- CreateIndex
CREATE INDEX "ai_recommendations_generatedAt_idx" ON "ai_recommendations"("generatedAt");

-- CreateIndex
CREATE INDEX "ai_recommendations_userId_recommendationType_idx" ON "ai_recommendations"("userId", "recommendationType");

-- CreateIndex
CREATE INDEX "ai_predictions_studentId_idx" ON "ai_predictions"("studentId");

-- CreateIndex
CREATE INDEX "ai_predictions_predictionType_idx" ON "ai_predictions"("predictionType");

-- CreateIndex
CREATE INDEX "ai_predictions_predictedAt_idx" ON "ai_predictions"("predictedAt");

-- CreateIndex
CREATE INDEX "ai_predictions_studentId_predictionType_idx" ON "ai_predictions"("studentId", "predictionType");

-- CreateIndex
CREATE INDEX "chatbot_conversations_userId_idx" ON "chatbot_conversations"("userId");

-- CreateIndex
CREATE INDEX "chatbot_conversations_sessionId_idx" ON "chatbot_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "chatbot_conversations_startedAt_idx" ON "chatbot_conversations"("startedAt");

-- CreateIndex
CREATE INDEX "chatbot_messages_conversationId_idx" ON "chatbot_messages"("conversationId");

-- CreateIndex
CREATE INDEX "chatbot_messages_timestamp_idx" ON "chatbot_messages"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "content_embeddings_contentId_key" ON "content_embeddings"("contentId");

-- CreateIndex
CREATE INDEX "content_embeddings_contentId_idx" ON "content_embeddings"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_learning_styles_studentId_key" ON "student_learning_styles"("studentId");

-- CreateIndex
CREATE INDEX "student_learning_styles_studentId_idx" ON "student_learning_styles"("studentId");

-- CreateIndex
CREATE INDEX "ai_prompts_userId_idx" ON "ai_prompts"("userId");

-- CreateIndex
CREATE INDEX "ai_prompts_createdAt_idx" ON "ai_prompts"("createdAt");

-- CreateIndex
CREATE INDEX "ai_feedback_entityType_entityId_idx" ON "ai_feedback"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ai_feedback_userId_idx" ON "ai_feedback"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vector_indexes_indexName_key" ON "vector_indexes"("indexName");

-- CreateIndex
CREATE INDEX "vector_embeddings_indexId_idx" ON "vector_embeddings"("indexId");

-- CreateIndex
CREATE INDEX "vector_embeddings_entityType_entityId_idx" ON "vector_embeddings"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "vector_embeddings_indexId_entityType_entityId_key" ON "vector_embeddings"("indexId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "document_chunks_documentId_idx" ON "document_chunks"("documentId");

-- CreateIndex
CREATE INDEX "document_chunks_documentType_idx" ON "document_chunks"("documentType");

-- CreateIndex
CREATE INDEX "retrieval_queries_userId_idx" ON "retrieval_queries"("userId");

-- CreateIndex
CREATE INDEX "retrieval_queries_createdAt_idx" ON "retrieval_queries"("createdAt");

-- CreateIndex
CREATE INDEX "token_usage_userId_idx" ON "token_usage"("userId");

-- CreateIndex
CREATE INDEX "token_usage_organizationId_idx" ON "token_usage"("organizationId");

-- CreateIndex
CREATE INDEX "token_usage_modelProvider_modelName_idx" ON "token_usage"("modelProvider", "modelName");

-- CreateIndex
CREATE INDEX "token_usage_createdAt_idx" ON "token_usage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "model_providers_name_key" ON "model_providers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_name_key" ON "prompt_templates"("name");

-- CreateIndex
CREATE INDEX "prompt_templates_category_idx" ON "prompt_templates"("category");

-- CreateIndex
CREATE INDEX "inference_logs_modelProvider_modelName_idx" ON "inference_logs"("modelProvider", "modelName");

-- CreateIndex
CREATE INDEX "inference_logs_userId_idx" ON "inference_logs"("userId");

-- CreateIndex
CREATE INDEX "inference_logs_createdAt_idx" ON "inference_logs"("createdAt");

-- CreateIndex
CREATE INDEX "hostel_blocks_schoolId_idx" ON "hostel_blocks"("schoolId");

-- CreateIndex
CREATE INDEX "hostel_blocks_blockType_idx" ON "hostel_blocks"("blockType");

-- CreateIndex
CREATE INDEX "hostel_rooms_blockId_idx" ON "hostel_rooms"("blockId");

-- CreateIndex
CREATE INDEX "hostel_rooms_roomType_idx" ON "hostel_rooms"("roomType");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_rooms_blockId_roomNumber_key" ON "hostel_rooms"("blockId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_room_assignments_studentId_key" ON "hostel_room_assignments"("studentId");

-- CreateIndex
CREATE INDEX "hostel_room_assignments_roomId_idx" ON "hostel_room_assignments"("roomId");

-- CreateIndex
CREATE INDEX "hostel_room_assignments_status_idx" ON "hostel_room_assignments"("status");

-- CreateIndex
CREATE INDEX "hostel_fees_blockId_idx" ON "hostel_fees"("blockId");

-- CreateIndex
CREATE INDEX "hostel_maintenance_roomId_idx" ON "hostel_maintenance"("roomId");

-- CreateIndex
CREATE INDEX "hostel_maintenance_status_idx" ON "hostel_maintenance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_itemCode_key" ON "inventory_items"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_barcode_key" ON "inventory_items"("barcode");

-- CreateIndex
CREATE INDEX "inventory_items_schoolId_idx" ON "inventory_items"("schoolId");

-- CreateIndex
CREATE INDEX "inventory_items_organizationId_idx" ON "inventory_items"("organizationId");

-- CreateIndex
CREATE INDEX "inventory_items_categoryId_idx" ON "inventory_items"("categoryId");

-- CreateIndex
CREATE INDEX "inventory_items_barcode_idx" ON "inventory_items"("barcode");

-- CreateIndex
CREATE INDEX "inventory_transactions_itemId_idx" ON "inventory_transactions"("itemId");

-- CreateIndex
CREATE INDEX "inventory_transactions_transactionType_idx" ON "inventory_transactions"("transactionType");

-- CreateIndex
CREATE INDEX "inventory_transactions_transactionDate_idx" ON "inventory_transactions"("transactionDate");

-- CreateIndex
CREATE INDEX "inventory_transactions_itemId_transactionDate_idx" ON "inventory_transactions"("itemId", "transactionDate");

-- CreateIndex
CREATE INDEX "inventory_transactions_transactionType_transactionDate_idx" ON "inventory_transactions"("transactionType", "transactionDate");

-- CreateIndex
CREATE INDEX "inventory_requisitions_itemId_idx" ON "inventory_requisitions"("itemId");

-- CreateIndex
CREATE INDEX "inventory_requisitions_status_idx" ON "inventory_requisitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE INDEX "payroll_structures_schoolId_idx" ON "payroll_structures"("schoolId");

-- CreateIndex
CREATE INDEX "payroll_structures_organizationId_idx" ON "payroll_structures"("organizationId");

-- CreateIndex
CREATE INDEX "employee_salaries_employeeId_idx" ON "employee_salaries"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salaries_monthYear_idx" ON "employee_salaries"("monthYear");

-- CreateIndex
CREATE INDEX "employee_salaries_status_idx" ON "employee_salaries"("status");

-- CreateIndex
CREATE INDEX "employee_salaries_employeeId_monthYear_idx" ON "employee_salaries"("employeeId", "monthYear");

-- CreateIndex
CREATE INDEX "employee_salaries_monthYear_status_idx" ON "employee_salaries"("monthYear", "status");

-- CreateIndex
CREATE UNIQUE INDEX "employee_salaries_employeeId_monthYear_key" ON "employee_salaries"("employeeId", "monthYear");

-- CreateIndex
CREATE INDEX "payroll_advances_employeeId_idx" ON "payroll_advances"("employeeId");

-- CreateIndex
CREATE INDEX "payroll_advances_status_idx" ON "payroll_advances"("status");

-- CreateIndex
CREATE INDEX "teacher_leaves_teacherId_idx" ON "teacher_leaves"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_leaves_status_idx" ON "teacher_leaves"("status");

-- CreateIndex
CREATE INDEX "teacher_leaves_startDate_idx" ON "teacher_leaves"("startDate");

-- CreateIndex
CREATE INDEX "leave_balances_employeeId_idx" ON "leave_balances"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employeeId_leaveType_year_key" ON "leave_balances"("employeeId", "leaveType", "year");

-- CreateIndex
CREATE INDEX "transport_routes_schoolId_idx" ON "transport_routes"("schoolId");

-- CreateIndex
CREATE INDEX "transport_routes_vehicleId_idx" ON "transport_routes"("vehicleId");

-- CreateIndex
CREATE INDEX "transport_route_stops_routeId_idx" ON "transport_route_stops"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_route_stops_routeId_stopSequence_key" ON "transport_route_stops"("routeId", "stopSequence");

-- CreateIndex
CREATE UNIQUE INDEX "transport_vehicles_vehicleNumber_key" ON "transport_vehicles"("vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transport_vehicles_registrationNumber_key" ON "transport_vehicles"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transport_vehicles_gpsDeviceId_key" ON "transport_vehicles"("gpsDeviceId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_vehicles_gpsDeviceIMEI_key" ON "transport_vehicles"("gpsDeviceIMEI");

-- CreateIndex
CREATE UNIQUE INDEX "transport_vehicles_rfidReaderId_key" ON "transport_vehicles"("rfidReaderId");

-- CreateIndex
CREATE INDEX "transport_vehicles_schoolId_idx" ON "transport_vehicles"("schoolId");

-- CreateIndex
CREATE INDEX "transport_vehicles_organizationId_idx" ON "transport_vehicles"("organizationId");

-- CreateIndex
CREATE INDEX "transport_vehicles_vehicleNumber_idx" ON "transport_vehicles"("vehicleNumber");

-- CreateIndex
CREATE INDEX "transport_vehicles_gpsDeviceId_idx" ON "transport_vehicles"("gpsDeviceId");

-- CreateIndex
CREATE INDEX "transport_vehicles_status_idx" ON "transport_vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicle_gps_logs_vehicleId_timestamp_idx" ON "vehicle_gps_logs"("vehicleId", "timestamp");

-- CreateIndex
CREATE INDEX "vehicle_gps_logs_timestamp_idx" ON "vehicle_gps_logs"("timestamp");

-- CreateIndex
CREATE INDEX "vehicle_gps_logs_vehicleId_idx" ON "vehicle_gps_logs"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_maintenance_vehicleId_idx" ON "vehicle_maintenance"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_maintenance_serviceDate_idx" ON "vehicle_maintenance"("serviceDate");

-- CreateIndex
CREATE UNIQUE INDEX "transport_student_assignments_studentId_key" ON "transport_student_assignments"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_student_assignments_rfidCardNumber_key" ON "transport_student_assignments"("rfidCardNumber");

-- CreateIndex
CREATE INDEX "transport_student_assignments_routeId_idx" ON "transport_student_assignments"("routeId");

-- CreateIndex
CREATE INDEX "transport_student_assignments_rfidCardNumber_idx" ON "transport_student_assignments"("rfidCardNumber");

-- CreateIndex
CREATE INDEX "transport_attendance_assignmentId_idx" ON "transport_attendance"("assignmentId");

-- CreateIndex
CREATE INDEX "transport_attendance_tripId_idx" ON "transport_attendance"("tripId");

-- CreateIndex
CREATE INDEX "transport_attendance_date_idx" ON "transport_attendance"("date");

-- CreateIndex
CREATE INDEX "transport_attendance_assignmentId_date_idx" ON "transport_attendance"("assignmentId", "date");

-- CreateIndex
CREATE INDEX "transport_attendance_date_status_idx" ON "transport_attendance"("date", "status");

-- CreateIndex
CREATE INDEX "transport_trips_routeId_idx" ON "transport_trips"("routeId");

-- CreateIndex
CREATE INDEX "transport_trips_vehicleId_idx" ON "transport_trips"("vehicleId");

-- CreateIndex
CREATE INDEX "transport_trips_date_idx" ON "transport_trips"("date");

-- CreateIndex
CREATE INDEX "transport_trips_status_idx" ON "transport_trips"("status");

-- CreateIndex
CREATE INDEX "transport_trips_routeId_date_idx" ON "transport_trips"("routeId", "date");

-- CreateIndex
CREATE INDEX "transport_trips_vehicleId_date_idx" ON "transport_trips"("vehicleId", "date");

-- CreateIndex
CREATE INDEX "transport_trips_date_status_idx" ON "transport_trips"("date", "status");

-- CreateIndex
CREATE INDEX "events_schoolId_idx" ON "events"("schoolId");

-- CreateIndex
CREATE INDEX "events_startDate_idx" ON "events"("startDate");

-- CreateIndex
CREATE INDEX "disciplinary_records_studentId_idx" ON "disciplinary_records"("studentId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_scheduledAt_idx" ON "notifications"("scheduledAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_type_idx" ON "notifications"("userId", "type");

-- CreateIndex
CREATE INDEX "notification_deliveries_notificationId_idx" ON "notification_deliveries"("notificationId");

-- CreateIndex
CREATE INDEX "notification_deliveries_channel_idx" ON "notification_deliveries"("channel");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_idx" ON "notification_deliveries"("status");

-- CreateIndex
CREATE INDEX "notification_deliveries_sentAt_idx" ON "notification_deliveries"("sentAt");

-- CreateIndex
CREATE INDEX "conversations_conversationType_idx" ON "conversations"("conversationType");

-- CreateIndex
CREATE INDEX "conversations_lastMessageAt_idx" ON "conversations"("lastMessageAt");

-- CreateIndex
CREATE INDEX "message_participants_conversationId_idx" ON "message_participants"("conversationId");

-- CreateIndex
CREATE INDEX "message_participants_userId_idx" ON "message_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_participants_conversationId_userId_key" ON "message_participants"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_recipientId_idx" ON "messages"("recipientId");

-- CreateIndex
CREATE INDEX "messages_groupId_idx" ON "messages"("groupId");

-- CreateIndex
CREATE INDEX "messages_sentAt_idx" ON "messages"("sentAt");

-- CreateIndex
CREATE INDEX "messages_replyToId_idx" ON "messages"("replyToId");

-- CreateIndex
CREATE INDEX "messages_conversationId_sentAt_idx" ON "messages"("conversationId", "sentAt");

-- CreateIndex
CREATE INDEX "messages_senderId_sentAt_idx" ON "messages"("senderId", "sentAt");

-- CreateIndex
CREATE INDEX "message_attachments_messageId_idx" ON "message_attachments"("messageId");

-- CreateIndex
CREATE INDEX "message_read_receipts_messageId_idx" ON "message_read_receipts"("messageId");

-- CreateIndex
CREATE INDEX "message_read_receipts_userId_idx" ON "message_read_receipts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_read_receipts_messageId_userId_key" ON "message_read_receipts"("messageId", "userId");

-- CreateIndex
CREATE INDEX "message_reactions_messageId_idx" ON "message_reactions"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_messageId_userId_emoji_key" ON "message_reactions"("messageId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "pinned_messages_conversationId_idx" ON "pinned_messages"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "pinned_messages_conversationId_messageId_key" ON "pinned_messages"("conversationId", "messageId");

-- CreateIndex
CREATE INDEX "announcements_schoolId_idx" ON "announcements"("schoolId");

-- CreateIndex
CREATE INDEX "announcements_publishedAt_idx" ON "announcements"("publishedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_idx" ON "audit_logs"("organizationId");

-- CreateIndex
CREATE INDEX "audit_logs_schoolId_idx" ON "audit_logs"("schoolId");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_idx" ON "audit_logs"("tableName");

-- CreateIndex
CREATE INDEX "audit_logs_recordId_idx" ON "audit_logs"("recordId");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_recordId_idx" ON "audit_logs"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_ipAddress_idx" ON "audit_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "audit_logs_flagged_idx" ON "audit_logs"("flagged");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_timestamp_idx" ON "audit_logs"("tenantId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_timestamp_idx" ON "audit_logs"("organizationId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_action_timestamp_idx" ON "audit_logs"("tableName", "action", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_organizationId_key" ON "system_config"("organizationId");

-- CreateIndex
CREATE INDEX "sync_logs_organizationId_idx" ON "sync_logs"("organizationId");

-- CreateIndex
CREATE INDEX "sync_logs_status_idx" ON "sync_logs"("status");

-- CreateIndex
CREATE INDEX "sync_logs_startedAt_idx" ON "sync_logs"("startedAt");

-- CreateIndex
CREATE INDEX "sync_logs_organizationId_status_idx" ON "sync_logs"("organizationId", "status");

-- CreateIndex
CREATE INDEX "sync_logs_startedAt_status_idx" ON "sync_logs"("startedAt", "status");

-- CreateIndex
CREATE INDEX "government_dashboards_level_idx" ON "government_dashboards"("level");

-- CreateIndex
CREATE INDEX "government_dashboards_stateCode_idx" ON "government_dashboards"("stateCode");

-- CreateIndex
CREATE INDEX "government_dashboards_districtCode_idx" ON "government_dashboards"("districtCode");

-- CreateIndex
CREATE INDEX "analytics_reports_organizationId_idx" ON "analytics_reports"("organizationId");

-- CreateIndex
CREATE INDEX "analytics_reports_schoolId_idx" ON "analytics_reports"("schoolId");

-- CreateIndex
CREATE INDEX "analytics_reports_reportType_idx" ON "analytics_reports"("reportType");

-- CreateIndex
CREATE INDEX "analytics_reports_generatedAt_idx" ON "analytics_reports"("generatedAt");

-- CreateIndex
CREATE INDEX "analytics_reports_organizationId_reportType_idx" ON "analytics_reports"("organizationId", "reportType");

-- CreateIndex
CREATE INDEX "analytics_reports_schoolId_reportType_idx" ON "analytics_reports"("schoolId", "reportType");

-- CreateIndex
CREATE INDEX "student_analytics_studentId_idx" ON "student_analytics"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_analytics_studentId_key" ON "student_analytics"("studentId");

-- CreateIndex
CREATE INDEX "teacher_analytics_teacherId_idx" ON "teacher_analytics"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_analytics_teacherId_key" ON "teacher_analytics"("teacherId");

-- CreateIndex
CREATE INDEX "school_analytics_schoolId_idx" ON "school_analytics"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "school_analytics_schoolId_academicYearId_key" ON "school_analytics"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "search_queries_userId_idx" ON "search_queries"("userId");

-- CreateIndex
CREATE INDEX "search_queries_timestamp_idx" ON "search_queries"("timestamp");

-- CreateIndex
CREATE INDEX "search_queries_query_idx" ON "search_queries"("query");

-- CreateIndex
CREATE INDEX "content_recommendations_userId_idx" ON "content_recommendations"("userId");

-- CreateIndex
CREATE INDEX "content_recommendations_contentId_idx" ON "content_recommendations"("contentId");

-- CreateIndex
CREATE INDEX "trending_content_timeWindow_idx" ON "trending_content"("timeWindow");

-- CreateIndex
CREATE UNIQUE INDEX "trending_content_contentId_timeWindow_key" ON "trending_content"("contentId", "timeWindow");

-- CreateIndex
CREATE INDEX "marketplace_products_publisherId_idx" ON "marketplace_products"("publisherId");

-- CreateIndex
CREATE INDEX "marketplace_products_creatorId_idx" ON "marketplace_products"("creatorId");

-- CreateIndex
CREATE INDEX "marketplace_products_isActive_isFeatured_idx" ON "marketplace_products"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "marketplace_orders_productId_idx" ON "marketplace_orders"("productId");

-- CreateIndex
CREATE INDEX "marketplace_orders_buyerId_idx" ON "marketplace_orders"("buyerId");

-- CreateIndex
CREATE INDEX "marketplace_orders_status_idx" ON "marketplace_orders"("status");

-- CreateIndex
CREATE INDEX "marketplace_orders_productId_status_idx" ON "marketplace_orders"("productId", "status");

-- CreateIndex
CREATE INDEX "marketplace_orders_buyerId_status_idx" ON "marketplace_orders"("buyerId", "status");

-- CreateIndex
CREATE INDEX "payout_requests_userId_idx" ON "payout_requests"("userId");

-- CreateIndex
CREATE INDEX "payout_requests_status_idx" ON "payout_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_backup_codes_code_key" ON "two_factor_backup_codes"("code");

-- CreateIndex
CREATE INDEX "two_factor_backup_codes_userId_idx" ON "two_factor_backup_codes"("userId");

-- CreateIndex
CREATE INDEX "login_attempts_email_idx" ON "login_attempts"("email");

-- CreateIndex
CREATE INDEX "login_attempts_phone_idx" ON "login_attempts"("phone");

-- CreateIndex
CREATE INDEX "login_attempts_success_idx" ON "login_attempts"("success");

-- CreateIndex
CREATE INDEX "login_attempts_timestamp_idx" ON "login_attempts"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_userId_idx" ON "device_tokens"("userId");

-- CreateIndex
CREATE INDEX "device_tokens_token_idx" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "lesson_plans_teacherId_idx" ON "lesson_plans"("teacherId");

-- CreateIndex
CREATE INDEX "lesson_plans_subjectId_idx" ON "lesson_plans"("subjectId");

-- CreateIndex
CREATE INDEX "syllabus_progress_classId_idx" ON "syllabus_progress"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "syllabus_progress_classId_subjectId_topicId_key" ON "syllabus_progress"("classId", "subjectId", "topicId");

-- CreateIndex
CREATE INDEX "student_groups_schoolId_idx" ON "student_groups"("schoolId");

-- CreateIndex
CREATE INDEX "academic_calendar_schoolId_idx" ON "academic_calendar"("schoolId");

-- CreateIndex
CREATE INDEX "academic_calendar_academicYearId_idx" ON "academic_calendar"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "question_tags_name_key" ON "question_tags"("name");

-- CreateIndex
CREATE INDEX "exam_blueprints_board_grade_subjectId_idx" ON "exam_blueprints"("board", "grade", "subjectId");

-- CreateIndex
CREATE INDEX "student_report_cards_studentId_idx" ON "student_report_cards"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_report_cards_studentId_academicYearId_term_key" ON "student_report_cards"("studentId", "academicYearId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "sms_logs_userId_idx" ON "sms_logs"("userId");

-- CreateIndex
CREATE INDEX "sms_logs_status_idx" ON "sms_logs"("status");

-- CreateIndex
CREATE INDEX "sms_logs_sentAt_idx" ON "sms_logs"("sentAt");

-- CreateIndex
CREATE INDEX "email_logs_userId_idx" ON "email_logs"("userId");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_sentAt_idx" ON "email_logs"("sentAt");

-- CreateIndex
CREATE INDEX "content_collections_createdBy_idx" ON "content_collections"("createdBy");

-- CreateIndex
CREATE INDEX "learning_paths_board_grade_subjectId_idx" ON "learning_paths"("board", "grade", "subjectId");

-- CreateIndex
CREATE INDEX "learning_path_enrollments_pathId_idx" ON "learning_path_enrollments"("pathId");

-- CreateIndex
CREATE INDEX "learning_path_enrollments_studentId_idx" ON "learning_path_enrollments"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_path_enrollments_pathId_studentId_key" ON "learning_path_enrollments"("pathId", "studentId");

-- CreateIndex
CREATE INDEX "content_moderation_contentId_idx" ON "content_moderation"("contentId");

-- CreateIndex
CREATE INDEX "background_jobs_status_idx" ON "background_jobs"("status");

-- CreateIndex
CREATE INDEX "background_jobs_jobType_idx" ON "background_jobs"("jobType");

-- CreateIndex
CREATE INDEX "background_jobs_scheduledAt_idx" ON "background_jobs"("scheduledAt");

-- CreateIndex
CREATE INDEX "background_jobs_nextRetryAt_idx" ON "background_jobs"("nextRetryAt");

-- CreateIndex
CREATE INDEX "background_jobs_isDeadLetter_idx" ON "background_jobs"("isDeadLetter");

-- CreateIndex
CREATE INDEX "job_executions_jobId_idx" ON "job_executions"("jobId");

-- CreateIndex
CREATE INDEX "job_executions_status_idx" ON "job_executions"("status");

-- CreateIndex
CREATE INDEX "job_executions_startedAt_idx" ON "job_executions"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "cache_entries_key_key" ON "cache_entries"("key");

-- CreateIndex
CREATE INDEX "cache_entries_key_idx" ON "cache_entries"("key");

-- CreateIndex
CREATE INDEX "cache_entries_expiresAt_idx" ON "cache_entries"("expiresAt");

-- CreateIndex
CREATE INDEX "system_metrics_metricType_idx" ON "system_metrics"("metricType");

-- CreateIndex
CREATE INDEX "system_metrics_timestamp_idx" ON "system_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "system_metrics_metricType_timestamp_idx" ON "system_metrics"("metricType", "timestamp");

-- CreateIndex
CREATE INDEX "error_logs_errorType_idx" ON "error_logs"("errorType");

-- CreateIndex
CREATE INDEX "error_logs_userId_idx" ON "error_logs"("userId");

-- CreateIndex
CREATE INDEX "error_logs_resolved_idx" ON "error_logs"("resolved");

-- CreateIndex
CREATE INDEX "error_logs_timestamp_idx" ON "error_logs"("timestamp");

-- CreateIndex
CREATE INDEX "error_logs_errorType_resolved_idx" ON "error_logs"("errorType", "resolved");

-- CreateIndex
CREATE INDEX "error_logs_timestamp_resolved_idx" ON "error_logs"("timestamp", "resolved");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_flagName_key" ON "feature_flags"("flagName");

-- CreateIndex
CREATE INDEX "feature_rollouts_featureFlagId_idx" ON "feature_rollouts"("featureFlagId");

-- CreateIndex
CREATE INDEX "feature_rollouts_status_idx" ON "feature_rollouts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "experiments_name_key" ON "experiments"("name");

-- CreateIndex
CREATE INDEX "experiments_status_idx" ON "experiments"("status");

-- CreateIndex
CREATE INDEX "ab_tests_experimentId_idx" ON "ab_tests"("experimentId");

-- CreateIndex
CREATE INDEX "ab_tests_userId_idx" ON "ab_tests"("userId");

-- CreateIndex
CREATE INDEX "ab_tests_variant_idx" ON "ab_tests"("variant");

-- CreateIndex
CREATE UNIQUE INDEX "ab_tests_experimentId_userId_key" ON "ab_tests"("experimentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_organizationId_idx" ON "api_keys"("organizationId");

-- CreateIndex
CREATE INDEX "webhooks_organizationId_idx" ON "webhooks"("organizationId");

-- CreateIndex
CREATE INDEX "webhook_deliveries_webhookId_idx" ON "webhook_deliveries"("webhookId");

-- CreateIndex
CREATE INDEX "webhook_deliveries_status_idx" ON "webhook_deliveries"("status");

-- CreateIndex
CREATE INDEX "api_rate_limits_organizationId_idx" ON "api_rate_limits"("organizationId");

-- CreateIndex
CREATE INDEX "api_rate_limits_userId_idx" ON "api_rate_limits"("userId");

-- CreateIndex
CREATE INDEX "api_rate_limits_apiKeyId_idx" ON "api_rate_limits"("apiKeyId");

-- CreateIndex
CREATE INDEX "api_usage_organizationId_timestamp_idx" ON "api_usage"("organizationId", "timestamp");

-- CreateIndex
CREATE INDEX "api_usage_userId_timestamp_idx" ON "api_usage"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "api_usage_apiKeyId_timestamp_idx" ON "api_usage"("apiKeyId", "timestamp");

-- CreateIndex
CREATE INDEX "api_usage_endpoint_idx" ON "api_usage"("endpoint");

-- CreateIndex
CREATE INDEX "api_usage_timestamp_idx" ON "api_usage"("timestamp");

-- CreateIndex
CREATE INDEX "api_quotas_organizationId_idx" ON "api_quotas"("organizationId");

-- CreateIndex
CREATE INDEX "api_quotas_userId_idx" ON "api_quotas"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_quotas_organizationId_userId_quotaType_key" ON "api_quotas"("organizationId", "userId", "quotaType");

-- CreateIndex
CREATE INDEX "badge_awards_userId_idx" ON "badge_awards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "badge_awards_badgeId_userId_key" ON "badge_awards"("badgeId", "userId");

-- CreateIndex
CREATE INDEX "leaderboards_scope_idx" ON "leaderboards"("scope");

-- CreateIndex
CREATE INDEX "leaderboards_metricType_idx" ON "leaderboards"("metricType");

-- CreateIndex
CREATE UNIQUE INDEX "student_points_studentId_key" ON "student_points"("studentId");

-- CreateIndex
CREATE INDEX "points_transactions_studentId_idx" ON "points_transactions"("studentId");

-- CreateIndex
CREATE INDEX "media_folders_parentId_idx" ON "media_folders"("parentId");

-- CreateIndex
CREATE INDEX "media_folders_ownerId_idx" ON "media_folders"("ownerId");

-- CreateIndex
CREATE INDEX "media_uploadedBy_idx" ON "media"("uploadedBy");

-- CreateIndex
CREATE INDEX "media_folderId_idx" ON "media"("folderId");

-- CreateIndex
CREATE INDEX "media_mediaType_idx" ON "media"("mediaType");

-- CreateIndex
CREATE INDEX "media_category_idx" ON "media"("category");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- CreateIndex
CREATE INDEX "media_fileName_originalName_idx" ON "media"("fileName", "originalName");

-- CreateIndex
CREATE INDEX "media_permissions_mediaId_idx" ON "media_permissions"("mediaId");

-- CreateIndex
CREATE INDEX "media_permissions_userId_idx" ON "media_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_settings_settingKey_key" ON "platform_settings"("settingKey");

-- CreateIndex
CREATE INDEX "platform_settings_category_idx" ON "platform_settings"("category");

-- CreateIndex
CREATE INDEX "organization_settings_organizationId_idx" ON "organization_settings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_settings_organizationId_settingKey_key" ON "organization_settings"("organizationId", "settingKey");

-- CreateIndex
CREATE INDEX "school_settings_schoolId_idx" ON "school_settings"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "school_settings_schoolId_settingKey_key" ON "school_settings"("schoolId", "settingKey");

-- CreateIndex
CREATE INDEX "integrations_organizationId_idx" ON "integrations"("organizationId");

-- CreateIndex
CREATE INDEX "integrations_integrationType_idx" ON "integrations"("integrationType");

-- CreateIndex
CREATE INDEX "oauth_tokens_userId_idx" ON "oauth_tokens"("userId");

-- CreateIndex
CREATE INDEX "oauth_tokens_provider_idx" ON "oauth_tokens"("provider");

-- CreateIndex
CREATE INDEX "external_mappings_externalSystem_externalId_idx" ON "external_mappings"("externalSystem", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "external_mappings_internalEntityType_internalEntityId_exter_key" ON "external_mappings"("internalEntityType", "internalEntityId", "externalSystem");

-- CreateIndex
CREATE INDEX "domain_events_eventType_idx" ON "domain_events"("eventType");

-- CreateIndex
CREATE INDEX "domain_events_aggregateType_aggregateId_idx" ON "domain_events"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "domain_events_isProcessed_idx" ON "domain_events"("isProcessed");

-- CreateIndex
CREATE INDEX "domain_events_occurredAt_idx" ON "domain_events"("occurredAt");

-- CreateIndex
CREATE INDEX "integration_events_targetSystem_idx" ON "integration_events"("targetSystem");

-- CreateIndex
CREATE INDEX "integration_events_status_idx" ON "integration_events"("status");

-- CreateIndex
CREATE INDEX "event_subscriptions_eventType_idx" ON "event_subscriptions"("eventType");

-- CreateIndex
CREATE INDEX "event_subscriptions_isActive_idx" ON "event_subscriptions"("isActive");

-- CreateIndex
CREATE INDEX "event_retries_subscriptionId_idx" ON "event_retries"("subscriptionId");

-- CreateIndex
CREATE INDEX "event_retries_status_idx" ON "event_retries"("status");

-- CreateIndex
CREATE INDEX "event_retries_nextRetryAt_idx" ON "event_retries"("nextRetryAt");

-- CreateIndex
CREATE INDEX "event_failures_eventType_idx" ON "event_failures"("eventType");

-- CreateIndex
CREATE INDEX "event_failures_failedAt_idx" ON "event_failures"("failedAt");

-- CreateIndex
CREATE INDEX "event_failures_isResolved_idx" ON "event_failures"("isResolved");

-- CreateIndex
CREATE INDEX "workflow_definitions_workflowType_idx" ON "workflow_definitions"("workflowType");

-- CreateIndex
CREATE INDEX "workflow_definitions_entityType_idx" ON "workflow_definitions"("entityType");

-- CreateIndex
CREATE INDEX "workflow_instances_definitionId_idx" ON "workflow_instances"("definitionId");

-- CreateIndex
CREATE INDEX "workflow_instances_entityType_entityId_idx" ON "workflow_instances"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");

-- CreateIndex
CREATE INDEX "syllabus_versions_curriculumId_idx" ON "syllabus_versions"("curriculumId");

-- CreateIndex
CREATE INDEX "syllabus_versions_effectiveFrom_idx" ON "syllabus_versions"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "learning_outcomes_code_key" ON "learning_outcomes"("code");

-- CreateIndex
CREATE INDEX "learning_outcomes_curriculumId_idx" ON "learning_outcomes"("curriculumId");

-- CreateIndex
CREATE INDEX "learning_outcomes_subjectId_idx" ON "learning_outcomes"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "competencies_code_key" ON "competencies"("code");

-- CreateIndex
CREATE INDEX "competencies_category_idx" ON "competencies"("category");

-- CreateIndex
CREATE INDEX "government_reports_reportType_idx" ON "government_reports"("reportType");

-- CreateIndex
CREATE INDEX "government_reports_schoolId_idx" ON "government_reports"("schoolId");

-- CreateIndex
CREATE INDEX "government_reports_status_idx" ON "government_reports"("status");

-- CreateIndex
CREATE INDEX "compliance_checks_checkType_idx" ON "compliance_checks"("checkType");

-- CreateIndex
CREATE INDEX "compliance_checks_entityType_entityId_idx" ON "compliance_checks"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "compliance_checks_status_idx" ON "compliance_checks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "archival_policies_entityType_key" ON "archival_policies"("entityType");

-- CreateIndex
CREATE INDEX "archived_data_entityType_idx" ON "archived_data"("entityType");

-- CreateIndex
CREATE INDEX "archived_data_archivedAt_idx" ON "archived_data"("archivedAt");

-- CreateIndex
CREATE INDEX "archived_data_deleteAt_idx" ON "archived_data"("deleteAt");

-- CreateIndex
CREATE INDEX "search_indexes_entityType_idx" ON "search_indexes"("entityType");

-- CreateIndex
CREATE INDEX "search_indexes_searchableText_title_idx" ON "search_indexes"("searchableText", "title");

-- CreateIndex
CREATE UNIQUE INDEX "search_indexes_entityType_entityId_key" ON "search_indexes"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "search_keywords_keyword_key" ON "search_keywords"("keyword");

-- CreateIndex
CREATE INDEX "search_keywords_searchCount_idx" ON "search_keywords"("searchCount");

-- CreateIndex
CREATE INDEX "search_analytics_userId_idx" ON "search_analytics"("userId");

-- CreateIndex
CREATE INDEX "search_analytics_createdAt_idx" ON "search_analytics"("createdAt");

-- CreateIndex
CREATE INDEX "search_analytics_query_idx" ON "search_analytics"("query");

-- CreateIndex
CREATE INDEX "recent_searches_userId_idx" ON "recent_searches"("userId");

-- CreateIndex
CREATE INDEX "recent_searches_searchedAt_idx" ON "recent_searches"("searchedAt");

-- CreateIndex
CREATE INDEX "search_facets_facetType_idx" ON "search_facets"("facetType");

-- CreateIndex
CREATE UNIQUE INDEX "search_facets_facetType_facetKey_facetValue_key" ON "search_facets"("facetType", "facetKey", "facetValue");

-- CreateIndex
CREATE INDEX "synonyms_category_idx" ON "synonyms"("category");

-- CreateIndex
CREATE UNIQUE INDEX "synonyms_term_key" ON "synonyms"("term");

-- CreateIndex
CREATE UNIQUE INDEX "search_suggestions_query_key" ON "search_suggestions"("query");

-- CreateIndex
CREATE INDEX "search_suggestions_query_idx" ON "search_suggestions"("query");

-- CreateIndex
CREATE INDEX "search_suggestions_searchCount_idx" ON "search_suggestions"("searchCount");

-- CreateIndex
CREATE INDEX "analytics_snapshots_snapshotDate_idx" ON "analytics_snapshots"("snapshotDate");

-- CreateIndex
CREATE INDEX "analytics_snapshots_entityType_entityId_idx" ON "analytics_snapshots"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_snapshotType_snapshotDate_entityType_en_key" ON "analytics_snapshots"("snapshotType", "snapshotDate", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "metric_definitions_metricKey_key" ON "metric_definitions"("metricKey");

-- CreateIndex
CREATE INDEX "kpis_metricId_idx" ON "kpis"("metricId");

-- CreateIndex
CREATE INDEX "kpis_entityType_entityId_idx" ON "kpis"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "kpis_periodDate_idx" ON "kpis"("periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_cache_dashboardKey_key" ON "dashboard_cache"("dashboardKey");

-- CreateIndex
CREATE INDEX "dashboard_cache_userId_idx" ON "dashboard_cache"("userId");

-- CreateIndex
CREATE INDEX "dashboard_cache_organizationId_idx" ON "dashboard_cache"("organizationId");

-- CreateIndex
CREATE INDEX "dashboard_cache_expiresAt_idx" ON "dashboard_cache"("expiresAt");

-- CreateIndex
CREATE INDEX "sync_history_integrationId_idx" ON "sync_history"("integrationId");

-- CreateIndex
CREATE INDEX "sync_history_externalSystem_idx" ON "sync_history"("externalSystem");

-- CreateIndex
CREATE INDEX "sync_history_status_idx" ON "sync_history"("status");

-- CreateIndex
CREATE INDEX "sync_history_startedAt_idx" ON "sync_history"("startedAt");

-- CreateIndex
CREATE INDEX "sync_failures_syncHistoryId_idx" ON "sync_failures"("syncHistoryId");

-- CreateIndex
CREATE INDEX "sync_failures_isResolved_idx" ON "sync_failures"("isResolved");

-- CreateIndex
CREATE INDEX "user_settings_userId_idx" ON "user_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_settingKey_key" ON "user_settings"("userId", "settingKey");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_activityType_idx" ON "activity_logs"("activityType");

-- CreateIndex
CREATE INDEX "activity_logs_timestamp_idx" ON "activity_logs"("timestamp");

-- CreateIndex
CREATE INDEX "session_analytics_userId_idx" ON "session_analytics"("userId");

-- CreateIndex
CREATE INDEX "session_analytics_sessionId_idx" ON "session_analytics"("sessionId");

-- CreateIndex
CREATE INDEX "session_analytics_startTime_idx" ON "session_analytics"("startTime");

-- CreateIndex
CREATE INDEX "approvals_requestType_requestId_idx" ON "approvals"("requestType", "requestId");

-- CreateIndex
CREATE INDEX "approvals_currentApproverId_idx" ON "approvals"("currentApproverId");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE INDEX "approvals_requestedAt_idx" ON "approvals"("requestedAt");

-- CreateIndex
CREATE INDEX "approval_history_approvalId_idx" ON "approval_history"("approvalId");

-- CreateIndex
CREATE INDEX "approval_history_approverId_idx" ON "approval_history"("approverId");

-- CreateIndex
CREATE INDEX "certificate_templates_certificateType_idx" ON "certificate_templates"("certificateType");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateNumber_key" ON "certificates"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verificationCode_key" ON "certificates"("verificationCode");

-- CreateIndex
CREATE INDEX "certificates_recipientId_idx" ON "certificates"("recipientId");

-- CreateIndex
CREATE INDEX "certificates_issuedAt_idx" ON "certificates"("issuedAt");

-- CreateIndex
CREATE INDEX "certificates_verificationCode_idx" ON "certificates"("verificationCode");

-- CreateIndex
CREATE INDEX "id_card_templates_schoolId_idx" ON "id_card_templates"("schoolId");

-- CreateIndex
CREATE INDEX "id_card_templates_cardType_idx" ON "id_card_templates"("cardType");

-- CreateIndex
CREATE UNIQUE INDEX "id_cards_cardNumber_key" ON "id_cards"("cardNumber");

-- CreateIndex
CREATE INDEX "id_cards_holderId_idx" ON "id_cards"("holderId");

-- CreateIndex
CREATE INDEX "id_cards_cardNumber_idx" ON "id_cards"("cardNumber");

-- CreateIndex
CREATE INDEX "id_cards_status_idx" ON "id_cards"("status");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_roles" ADD CONSTRAINT "custom_roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_permissions" ADD CONSTRAINT "custom_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_permissions" ADD CONSTRAINT "custom_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_mappings" ADD CONSTRAINT "user_role_mappings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_mappings" ADD CONSTRAINT "user_role_mappings_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_mappings" ADD CONSTRAINT "user_role_mappings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "permission_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "permission_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_dependencies" ADD CONSTRAINT "permission_dependencies_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_dependencies" ADD CONSTRAINT "permission_dependencies_requiredPermissionId_fkey" FOREIGN KEY ("requiredPermissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_inheritances" ADD CONSTRAINT "role_inheritances_parentRoleId_fkey" FOREIGN KEY ("parentRoleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_inheritances" ADD CONSTRAINT "role_inheritances_childRoleId_fkey" FOREIGN KEY ("childRoleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villages" ADD CONSTRAINT "villages_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_hierarchy" ADD CONSTRAINT "tenant_hierarchy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tenant_hierarchy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_entities" ADD CONSTRAINT "government_entities_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "government_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parentOrganizationId_fkey" FOREIGN KEY ("parentOrganizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentDepartmentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "board_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_teachers" ADD CONSTRAINT "section_teachers_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_subjects" ADD CONSTRAINT "section_subjects_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_subjects" ADD CONSTRAINT "section_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher_profiles" ADD CONSTRAINT "publisher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_subtopics" ADD CONSTRAINT "sub_subtopics_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "subtopics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_subSubtopicId_fkey" FOREIGN KEY ("subSubtopicId") REFERENCES "sub_subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publisher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ar_markers" ADD CONSTRAINT "ar_markers_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publisher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ar_markers" ADD CONSTRAINT "ar_markers_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "diagrams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ar_contents" ADD CONSTRAINT "ar_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ar_contents" ADD CONSTRAINT "ar_contents_markerId_fkey" FOREIGN KEY ("markerId") REFERENCES "ar_markers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vr_contents" ADD CONSTRAINT "vr_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vr_usage_logs" ADD CONSTRAINT "vr_usage_logs_vrContentId_fkey" FOREIGN KEY ("vrContentId") REFERENCES "vr_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_assignments" ADD CONSTRAINT "license_assignments_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_contents" ADD CONSTRAINT "subscription_contents_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_contents" ADD CONSTRAINT "subscription_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher_monetization_plans" ADD CONSTRAINT "publisher_monetization_plans_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publisher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_monetization_plans" ADD CONSTRAINT "creator_monetization_plans_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "question_bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_assignments" ADD CONSTRAINT "exam_assignments_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_class_participants" ADD CONSTRAINT "live_class_participants_liveClassId_fkey" FOREIGN KEY ("liveClassId") REFERENCES "live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_recordings" ADD CONSTRAINT "class_recordings_liveClassId_fkey" FOREIGN KEY ("liveClassId") REFERENCES "live_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_attendance_logs" ADD CONSTRAINT "biometric_attendance_logs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "attendance_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "time_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "fee_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_feeRecordId_fkey" FOREIGN KEY ("feeRecordId") REFERENCES "fee_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_applications" ADD CONSTRAINT "scholarship_applications_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_books" ADD CONSTRAINT "library_books_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_issues" ADD CONSTRAINT "library_issues_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_issues" ADD CONSTRAINT "library_issues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_reservations" ADD CONSTRAINT "library_reservations_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vector_embeddings" ADD CONSTRAINT "vector_embeddings_indexId_fkey" FOREIGN KEY ("indexId") REFERENCES "vector_indexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_blocks" ADD CONSTRAINT "hostel_blocks_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_rooms" ADD CONSTRAINT "hostel_rooms_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "hostel_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_room_assignments" ADD CONSTRAINT "hostel_room_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_room_assignments" ADD CONSTRAINT "hostel_room_assignments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "hostel_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_fees" ADD CONSTRAINT "hostel_fees_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "hostel_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_maintenance" ADD CONSTRAINT "hostel_maintenance_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "hostel_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_requisitions" ADD CONSTRAINT "inventory_requisitions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_leaves" ADD CONSTRAINT "teacher_leaves_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_routes" ADD CONSTRAINT "transport_routes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_routes" ADD CONSTRAINT "transport_routes_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "transport_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_route_stops" ADD CONSTRAINT "transport_route_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_gps_logs" ADD CONSTRAINT "vehicle_gps_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "transport_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "transport_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_student_assignments" ADD CONSTRAINT "transport_student_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_student_assignments" ADD CONSTRAINT "transport_student_assignments_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_attendance" ADD CONSTRAINT "transport_attendance_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "transport_student_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_attendance" ADD CONSTRAINT "transport_attendance_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "transport_trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_trips" ADD CONSTRAINT "transport_trips_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_trips" ADD CONSTRAINT "transport_trips_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "transport_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplinary_records" ADD CONSTRAINT "disciplinary_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_read_receipts" ADD CONSTRAINT "message_read_receipts_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "marketplace_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_executions" ADD CONSTRAINT "job_executions_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "background_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_rollouts" ADD CONSTRAINT "feature_rollouts_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_awards" ADD CONSTRAINT "badge_awards_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_permissions" ADD CONSTRAINT "media_permissions_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_retries" ADD CONSTRAINT "event_retries_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "event_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competencies" ADD CONSTRAINT "competencies_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "competencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "metric_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "certificate_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "id_card_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
