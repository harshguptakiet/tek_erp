-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "resourceType" TEXT,
ALTER COLUMN "tableName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "live_class_participants" ADD COLUMN     "handRaised" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "handRaisedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "securitySettings" JSONB;

-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "subjectExpertise" TEXT[];

-- AlterTable
ALTER TABLE "user_sessions" ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_class_chat_messages" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "message" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "live_class_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_class_whiteboards" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "canvasData" JSONB NOT NULL DEFAULT '{}',
    "allowedEditors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastModified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_class_whiteboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_class_polls" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_class_polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_class_poll_responses" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selectedOptions" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_class_poll_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_class_reactions" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_class_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_proctoring" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "enableWebcam" BOOLEAN NOT NULL DEFAULT false,
    "enableScreenShare" BOOLEAN NOT NULL DEFAULT false,
    "enableAudioMonitor" BOOLEAN NOT NULL DEFAULT false,
    "preventTabSwitch" BOOLEAN NOT NULL DEFAULT true,
    "preventCopyPaste" BOOLEAN NOT NULL DEFAULT true,
    "allowCalculator" BOOLEAN NOT NULL DEFAULT false,
    "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    "suspiciousEvents" JSONB,
    "aiAnalysisResult" JSONB,
    "riskScore" DECIMAL(5,2),
    "monitoringStartedAt" TIMESTAMP(3),
    "monitoringEndedAt" TIMESTAMP(3),
    "webcamRecordingUrl" TEXT,
    "screenRecordingUrl" TEXT,
    "audioRecordingUrl" TEXT,
    "fullSessionRecordingUrl" TEXT,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "violations" JSONB,
    "autoSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_proctoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proctoring_events" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proctoring_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_security_logs" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" JSONB,
    "details" TEXT,
    "metadata" JSONB,
    "action" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_access_controls" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "allowedIpRanges" TEXT[],
    "blockedIpRanges" TEXT[],
    "accessWindowStart" TIMESTAMP(3),
    "accessWindowEnd" TIMESTAMP(3),
    "allowedDeviceTypes" TEXT[],
    "blockedDevices" TEXT[],
    "allowedCountries" TEXT[],
    "allowedStates" TEXT[],
    "requireGPS" BOOLEAN NOT NULL DEFAULT false,
    "allowedBrowsers" TEXT[],
    "minBrowserVersion" JSONB,
    "accessPassword" TEXT,
    "requireOTP" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_access_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_analytics_reports" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "totalStudents" INTEGER NOT NULL,
    "attemptedBy" INTEGER NOT NULL,
    "completedBy" INTEGER NOT NULL,
    "averageScore" DECIMAL(5,2),
    "averageTime" INTEGER,
    "passPercentage" DECIMAL(5,2),
    "questionDifficulty" JSONB,
    "scoreDistribution" JSONB,
    "timeDistribution" JSONB,
    "topPerformers" JSONB,
    "bottomPerformers" JSONB,
    "mostMissedQuestions" JSONB,
    "easiestQuestions" JSONB,
    "hardestQuestions" JSONB,
    "suspiciousPatterns" JSONB,
    "flaggedAttempts" TEXT[],
    "classComparison" JSONB,
    "subjectComparison" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_analytics_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectedUserId" TEXT NOT NULL,
    "connectionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "schoolId" TEXT,
    "classId" TEXT,
    "sectionId" TEXT,
    "organizationId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "message" TEXT,

    CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classmate_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recommendedUserId" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classmate_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_suspensions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "suspendedBy" TEXT NOT NULL,
    "duration" INTEGER,
    "suspendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suspendedUntil" TIMESTAMP(3),
    "affectedUsers" INTEGER NOT NULL DEFAULT 0,
    "affectedSchools" INTEGER NOT NULL DEFAULT 0,
    "dataAccessLocked" BOOLEAN NOT NULL DEFAULT true,
    "reactivatedAt" TIMESTAMP(3),
    "reactivatedBy" TEXT,
    "reactivationNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "organization_suspensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_transfers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fromOwnerId" TEXT NOT NULL,
    "toOwnerId" TEXT NOT NULL,
    "reason" TEXT,
    "transferredUsers" INTEGER NOT NULL DEFAULT 0,
    "transferredSchools" INTEGER NOT NULL DEFAULT 0,
    "transferredData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "organization_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_mergers" (
    "id" TEXT NOT NULL,
    "sourceOrganizationIds" TEXT[],
    "targetOrganizationId" TEXT NOT NULL,
    "mergerType" TEXT NOT NULL,
    "reason" TEXT,
    "initiatedBy" TEXT NOT NULL,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "migrationPlan" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "migratedUsers" INTEGER NOT NULL DEFAULT 0,
    "migratedSchools" INTEGER NOT NULL DEFAULT 0,
    "migratedData" JSONB,
    "errors" JSONB,

    CONSTRAINT "organization_mergers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_reports" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "complianceScore" DECIMAL(5,2),
    "findings" JSONB,
    "recommendations" JSONB,
    "metrics" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "documentUrls" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" TEXT NOT NULL,
    "templateText" TEXT NOT NULL,
    "variables" TEXT[],
    "headerType" TEXT,
    "headerUrl" TEXT,
    "buttons" JSONB,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "whatsappBusinessId" TEXT,
    "templateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "templateId" TEXT,
    "messageType" TEXT NOT NULL,
    "text" TEXT,
    "mediaUrl" TEXT,
    "documentUrl" TEXT,
    "caption" TEXT,
    "variables" JSONB,
    "status" TEXT NOT NULL,
    "providerId" TEXT,
    "providerStatus" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "replyText" TEXT,
    "repliedAt" TIMESTAMP(3),
    "cost" DECIMAL(6,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT,
    "schoolId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sessionStartAt" TIMESTAMP(3),
    "sessionEndAt" TIMESTAMP(3),
    "sessionType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_opt_outs" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "reason" TEXT,
    "optedOutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "optedBackInAt" TIMESTAMP(3),

    CONSTRAINT "whatsapp_opt_outs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_questions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_recovery_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recoveryMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "verificationData" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "account_recovery_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_fingerprints" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "deviceInfo" JSONB NOT NULL,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timesUsed" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "device_fingerprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suspicious_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "activityType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "details" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "location" JSONB,
    "userAgent" TEXT,
    "actionTaken" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "suspicious_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sso_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "ssoUrl" TEXT,
    "issuer" TEXT,
    "certificate" TEXT,
    "signatureAlgorithm" TEXT,
    "ldapUrl" TEXT,
    "baseDN" TEXT,
    "bindDN" TEXT,
    "bindPassword" TEXT,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "authorizationUrl" TEXT,
    "tokenUrl" TEXT,
    "userInfoUrl" TEXT,
    "scopes" TEXT[],
    "attributeMapping" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "autoProvision" BOOLEAN NOT NULL DEFAULT true,
    "defaultRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sso_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "offline_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_conflicts" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "localVersion" JSONB NOT NULL,
    "serverVersion" JSONB NOT NULL,
    "resolutionStrategy" TEXT,
    "resolvedVersion" JSONB,
    "status" TEXT NOT NULL DEFAULT 'UNRESOLVED',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "data_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "oauth_accounts_userId_idx" ON "oauth_accounts"("userId");

-- CreateIndex
CREATE INDEX "oauth_accounts_provider_idx" ON "oauth_accounts"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_providerUserId_key" ON "oauth_accounts"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "live_class_chat_messages_liveClassId_idx" ON "live_class_chat_messages"("liveClassId");

-- CreateIndex
CREATE INDEX "live_class_chat_messages_senderId_idx" ON "live_class_chat_messages"("senderId");

-- CreateIndex
CREATE INDEX "live_class_chat_messages_liveClassId_sentAt_idx" ON "live_class_chat_messages"("liveClassId", "sentAt");

-- CreateIndex
CREATE INDEX "live_class_whiteboards_liveClassId_idx" ON "live_class_whiteboards"("liveClassId");

-- CreateIndex
CREATE INDEX "live_class_polls_liveClassId_idx" ON "live_class_polls"("liveClassId");

-- CreateIndex
CREATE INDEX "live_class_polls_isActive_idx" ON "live_class_polls"("isActive");

-- CreateIndex
CREATE INDEX "live_class_poll_responses_pollId_idx" ON "live_class_poll_responses"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "live_class_poll_responses_pollId_userId_key" ON "live_class_poll_responses"("pollId", "userId");

-- CreateIndex
CREATE INDEX "live_class_reactions_liveClassId_idx" ON "live_class_reactions"("liveClassId");

-- CreateIndex
CREATE INDEX "live_class_reactions_userId_idx" ON "live_class_reactions"("userId");

-- CreateIndex
CREATE INDEX "exam_proctoring_reviewStatus_idx" ON "exam_proctoring"("reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "exam_proctoring_attemptId_key" ON "exam_proctoring"("attemptId");

-- CreateIndex
CREATE INDEX "proctoring_events_attemptId_idx" ON "proctoring_events"("attemptId");

-- CreateIndex
CREATE INDEX "proctoring_events_eventType_idx" ON "proctoring_events"("eventType");

-- CreateIndex
CREATE INDEX "proctoring_events_severity_idx" ON "proctoring_events"("severity");

-- CreateIndex
CREATE INDEX "exam_security_logs_examId_idx" ON "exam_security_logs"("examId");

-- CreateIndex
CREATE INDEX "exam_security_logs_eventType_idx" ON "exam_security_logs"("eventType");

-- CreateIndex
CREATE INDEX "exam_security_logs_severity_idx" ON "exam_security_logs"("severity");

-- CreateIndex
CREATE INDEX "exam_security_logs_timestamp_idx" ON "exam_security_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "exam_access_controls_examId_key" ON "exam_access_controls"("examId");

-- CreateIndex
CREATE INDEX "exam_analytics_reports_examId_idx" ON "exam_analytics_reports"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_analytics_reports_examId_key" ON "exam_analytics_reports"("examId");

-- CreateIndex
CREATE INDEX "user_connections_userId_idx" ON "user_connections"("userId");

-- CreateIndex
CREATE INDEX "user_connections_connectedUserId_idx" ON "user_connections"("connectedUserId");

-- CreateIndex
CREATE INDEX "user_connections_status_idx" ON "user_connections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_connections_userId_connectedUserId_key" ON "user_connections"("userId", "connectedUserId");

-- CreateIndex
CREATE INDEX "classmate_recommendations_userId_idx" ON "classmate_recommendations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "classmate_recommendations_userId_recommendedUserId_key" ON "classmate_recommendations"("userId", "recommendedUserId");

-- CreateIndex
CREATE INDEX "organization_suspensions_organizationId_idx" ON "organization_suspensions"("organizationId");

-- CreateIndex
CREATE INDEX "organization_suspensions_status_idx" ON "organization_suspensions"("status");

-- CreateIndex
CREATE INDEX "organization_transfers_organizationId_idx" ON "organization_transfers"("organizationId");

-- CreateIndex
CREATE INDEX "organization_transfers_status_idx" ON "organization_transfers"("status");

-- CreateIndex
CREATE INDEX "organization_mergers_targetOrganizationId_idx" ON "organization_mergers"("targetOrganizationId");

-- CreateIndex
CREATE INDEX "organization_mergers_status_idx" ON "organization_mergers"("status");

-- CreateIndex
CREATE INDEX "compliance_reports_organizationId_idx" ON "compliance_reports"("organizationId");

-- CreateIndex
CREATE INDEX "compliance_reports_reportType_idx" ON "compliance_reports"("reportType");

-- CreateIndex
CREATE INDEX "compliance_reports_status_idx" ON "compliance_reports"("status");

-- CreateIndex
CREATE INDEX "whatsapp_templates_name_idx" ON "whatsapp_templates"("name");

-- CreateIndex
CREATE INDEX "whatsapp_templates_approvalStatus_idx" ON "whatsapp_templates"("approvalStatus");

-- CreateIndex
CREATE INDEX "whatsapp_messages_userId_idx" ON "whatsapp_messages"("userId");

-- CreateIndex
CREATE INDEX "whatsapp_messages_phone_idx" ON "whatsapp_messages"("phone");

-- CreateIndex
CREATE INDEX "whatsapp_messages_status_idx" ON "whatsapp_messages"("status");

-- CreateIndex
CREATE INDEX "whatsapp_messages_sentAt_idx" ON "whatsapp_messages"("sentAt");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_userId_idx" ON "whatsapp_conversations"("userId");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_phone_idx" ON "whatsapp_conversations"("phone");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_status_idx" ON "whatsapp_conversations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_conversations_userId_phone_key" ON "whatsapp_conversations"("userId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_opt_outs_phone_key" ON "whatsapp_opt_outs"("phone");

-- CreateIndex
CREATE INDEX "whatsapp_opt_outs_phone_idx" ON "whatsapp_opt_outs"("phone");

-- CreateIndex
CREATE INDEX "security_questions_userId_idx" ON "security_questions"("userId");

-- CreateIndex
CREATE INDEX "account_recovery_requests_userId_idx" ON "account_recovery_requests"("userId");

-- CreateIndex
CREATE INDEX "account_recovery_requests_status_idx" ON "account_recovery_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "device_fingerprints_fingerprint_key" ON "device_fingerprints"("fingerprint");

-- CreateIndex
CREATE INDEX "device_fingerprints_userId_idx" ON "device_fingerprints"("userId");

-- CreateIndex
CREATE INDEX "device_fingerprints_fingerprint_idx" ON "device_fingerprints"("fingerprint");

-- CreateIndex
CREATE INDEX "suspicious_activities_userId_idx" ON "suspicious_activities"("userId");

-- CreateIndex
CREATE INDEX "suspicious_activities_activityType_idx" ON "suspicious_activities"("activityType");

-- CreateIndex
CREATE INDEX "suspicious_activities_riskLevel_idx" ON "suspicious_activities"("riskLevel");

-- CreateIndex
CREATE INDEX "suspicious_activities_detectedAt_idx" ON "suspicious_activities"("detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sso_configs_organizationId_key" ON "sso_configs"("organizationId");

-- CreateIndex
CREATE INDEX "offline_queue_userId_idx" ON "offline_queue"("userId");

-- CreateIndex
CREATE INDEX "offline_queue_deviceId_idx" ON "offline_queue"("deviceId");

-- CreateIndex
CREATE INDEX "offline_queue_status_idx" ON "offline_queue"("status");

-- CreateIndex
CREATE INDEX "data_conflicts_userId_idx" ON "data_conflicts"("userId");

-- CreateIndex
CREATE INDEX "data_conflicts_resource_idx" ON "data_conflicts"("resource");

-- CreateIndex
CREATE INDEX "data_conflicts_status_idx" ON "data_conflicts"("status");

-- CreateIndex
CREATE INDEX "user_sessions_revokedAt_idx" ON "user_sessions"("revokedAt");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_class_poll_responses" ADD CONSTRAINT "live_class_poll_responses_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "live_class_polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "whatsapp_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
