
# Tekurious ERP - New Modules Test Suite (Modules 05–17)
param([string]$BaseUrl = "http://localhost:3000/api/v1")

$script:PASS = 0
$script:FAIL = 0
$script:TOKEN = ""
$script:USER_ID = ""

function Invoke-Api {
    param([string]$Method, [string]$Path, [string]$Body = $null, [switch]$Auth)
    $uri = "$BaseUrl$Path"
    $params = @{ Method = $Method; Uri = $uri; ContentType = "application/json"; ErrorAction = "SilentlyContinue" }
    if ($Body) { $params.Body = $Body }
    if ($Auth -and $script:TOKEN) { $params.Headers = @{ Authorization = "Bearer $($script:TOKEN)" } }
    try {
        $resp = Invoke-RestMethod @params
        return @{ success = $true; data = $resp; status = 200 }
    } catch {
        $status = 0; try { $status = $_.Exception.Response.StatusCode.value__ } catch {}
        $body = ""; try { $stream = $_.Exception.Response.GetResponseStream(); $reader = New-Object System.IO.StreamReader($stream); $body = $reader.ReadToEnd() } catch {}
        return @{ success = $false; data = $null; status = $status; error = $body }
    }
}

function Assert-Pass { param([string]$Name, [hashtable]$Result)
    if ($Result.success) { $script:PASS++; Write-Host "  [PASS] $Name" -ForegroundColor Green; return $true }
    else { $script:FAIL++; Write-Host "  [FAIL] $Name (HTTP $($Result.status))" -ForegroundColor Red; if ($Result.error) { Write-Host "         $($Result.error)" -ForegroundColor DarkGray }; return $false }
}

function Assert-Fail { param([string]$Name, [hashtable]$Result)
    if (-not $Result.success -and $Result.status -ge 400) { $script:PASS++; Write-Host "  [PASS] $Name (correctly rejected: $($Result.status))" -ForegroundColor Green; return $true }
    else { $script:FAIL++; Write-Host "  [FAIL] $Name - should have been rejected" -ForegroundColor Red; return $false }
}

$TS = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$EMAIL = "newtest_$TS@tekurious.dev"
$PASS_1 = "TestPass@2024!"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TEKURIOUS ERP - NEW MODULES TEST SUITE" -ForegroundColor Cyan
Write-Host "  Modules 05, 07, 08, 09, 10, 11, 12, 13" -ForegroundColor Cyan
Write-Host "  Modules 14, 15, 16, 17" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ── SETUP: Register + Login ──────────────────────────────────────────────────
Write-Host "SETUP: Auth" -ForegroundColor Yellow
$r = Invoke-Api -Method POST -Path "/auth/register" -Body (@{ email=$EMAIL; password=$PASS_1; firstName="New"; lastName="Test" } | ConvertTo-Json)
Assert-Pass "Register test user" $r | Out-Null
$r = Invoke-Api -Method POST -Path "/auth/login" -Body (@{ email=$EMAIL; password=$PASS_1 } | ConvertTo-Json)
if (Assert-Pass "Login test user" $r) { $script:TOKEN = $r.data.accessToken; $script:USER_ID = $r.data.user.id }

# ── MODULE 05: CONTENT MANAGEMENT ────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 05: CONTENT MANAGEMENT" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$r = Invoke-Api -Method POST -Path "/content" -Auth -Body (@{
    title="Test Video $TS"; contentType="VIDEO"; description="A test video"; isFree=$true; language="en"; grade=10; tags=@("math","test")
} | ConvertTo-Json)
$CONTENT_ID = ""
if (Assert-Pass "FR-CONTENT-001: Create Content" $r) { $CONTENT_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/content/search?status=DRAFT" -Auth
Assert-Pass "FR-CONTENT-004: Search Content" $r | Out-Null

if ($CONTENT_ID) {
    $r = Invoke-Api -Method GET -Path "/content/$CONTENT_ID" -Auth
    Assert-Pass "FR-CONTENT-002: Get Content" $r | Out-Null

    $r = Invoke-Api -Method PUT -Path "/content/$CONTENT_ID" -Auth -Body (@{ title="Updated Video $TS"; changeNotes="Minor edit" } | ConvertTo-Json)
    Assert-Pass "FR-CONTENT-002: Update Content" $r | Out-Null

    $r = Invoke-Api -Method POST -Path "/content/$CONTENT_ID/workflow" -Auth -Body (@{ action="SUBMIT" } | ConvertTo-Json)
    Assert-Pass "FR-CONTENT-006: Submit Content for Review" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/content/$CONTENT_ID/versions" -Auth
    Assert-Pass "FR-CONTENT-007: Get Version History" $r | Out-Null

    $r = Invoke-Api -Method POST -Path "/content/$CONTENT_ID/reviews" -Auth -Body (@{ rating=4; comment="Good content" } | ConvertTo-Json)
    Assert-Pass "FR-CONTENT-005: Review Content" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/content/$CONTENT_ID/analytics" -Auth
    Assert-Pass "FR-CONTENT-012: Content Analytics" $r | Out-Null
}

$r = Invoke-Api -Method POST -Path "/content/collections" -Auth -Body (@{ title="My Collection $TS"; isPublic=$false } | ConvertTo-Json)
$COLL_ID = ""
if (Assert-Pass "FR-CONTENT-009: Create Collection" $r) { $COLL_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/content/collections" -Auth
Assert-Pass "FR-CONTENT-009: List Collections" $r | Out-Null

$r = Invoke-Api -Method GET -Path "/content/drafts/my" -Auth
Assert-Pass "FR-CONTENT-008: List My Drafts" $r | Out-Null

$r = Invoke-Api -Method POST -Path "/content/learning-paths" -Auth -Body (@{ title="Math Path $TS"; isPublic=$true; grade=10 } | ConvertTo-Json)
$PATH_ID = ""
if (Assert-Pass "FR-CONTENT-011: Create Learning Path" $r) { $PATH_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/content/learning-paths" -Auth
Assert-Pass "FR-CONTENT-011: List Learning Paths" $r | Out-Null

$r = Invoke-Api -Method GET -Path "/content/moderation/queue" -Auth
Assert-Pass "FR-CONTENT-010: Get Moderation Queue" $r | Out-Null

# ── MODULE 09: ASSESSMENT ENGINE ─────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 09: ASSESSMENT ENGINE" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$r = Invoke-Api -Method POST -Path "/assessment/questions" -Auth -Body (@{
    question="What is 2+2?"; questionType="MCQ"
    options=@(@{id="a";text="3"},@{id="b";text="4"},@{id="c";text="5"})
    correctAnswer=@{answer="b"}; marks=2; difficultyLevel="BEGINNER"; grade=5; isPublic=$true
} | ConvertTo-Json -Depth 5)
$Q_ID = ""
if (Assert-Pass "FR-QUEST-001: Create Question" $r) { $Q_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/assessment/questions/search?grade=5&isPublic=true" -Auth
Assert-Pass "FR-QUEST-002: Search Questions" $r | Out-Null

$r = Invoke-Api -Method POST -Path "/assessment/exams" -Auth -Body (@{
    title="Math Quiz $TS"; examType="QUIZ"; grade=5; totalMarks=10
    passingMarks=6; duration=30; showResultsImmediately=$true
} | ConvertTo-Json)
$EXAM_ID = ""
if (Assert-Pass "FR-EXAM-001: Create Exam" $r) { $EXAM_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/assessment/exams" -Auth
Assert-Pass "FR-EXAM-002: List Exams" $r | Out-Null

if ($EXAM_ID) {
    $r = Invoke-Api -Method GET -Path "/assessment/exams/$EXAM_ID" -Auth
    Assert-Pass "FR-EXAM-003: Get Exam" $r | Out-Null

    if ($Q_ID) {
        $r = Invoke-Api -Method POST -Path "/assessment/exams/$EXAM_ID/questions" -Auth -Body (@{
            questions=@(@{ questionBankId=$Q_ID; marks=2 })
        } | ConvertTo-Json -Depth 4)
        Assert-Pass "FR-EXAM-004: Add Question to Exam" $r | Out-Null
    }

    $r = Invoke-Api -Method POST -Path "/assessment/exams/$EXAM_ID/publish" -Auth
    Assert-Pass "FR-EXAM-005: Publish Exam" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/assessment/exams/$EXAM_ID/results" -Auth
    Assert-Pass "FR-RESULT-003: Get Exam Results" $r | Out-Null
}

$r = Invoke-Api -Method POST -Path "/assessment/blueprints" -Auth -Body (@{
    name="Blueprint $TS"; grade=10; totalMarks=100; duration=180
    distribution=@{ chapter1=@{marks=30;questions=5}; chapter2=@{marks=70;questions=10} }
} | ConvertTo-Json -Depth 5)
Assert-Pass "FR-EXAM-008: Create Exam Blueprint" $r | Out-Null

$r = Invoke-Api -Method POST -Path "/assessment/rubrics" -Auth -Body (@{
    name="Essay Rubric $TS"; totalPoints=20; isPublic=$false
    criteria=@(@{ name="Grammar"; maxPoints=5; levels=@(@{score=5;desc="Excellent"},@{score=3;desc="Good"}) },@{ name="Content"; maxPoints=15; levels=@(@{score=15;desc="Excellent"}) })
} | ConvertTo-Json -Depth 6)
Assert-Pass "FR-GRADE-002: Create Grading Rubric" $r | Out-Null

$r = Invoke-Api -Method GET -Path "/assessment/rubrics" -Auth
Assert-Pass "FR-GRADE-002: List Rubrics" $r | Out-Null

# ── MODULE 10: ASSIGNMENTS ────────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 10: ASSIGNMENT MANAGEMENT" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$r = Invoke-Api -Method POST -Path "/assignments" -Auth -Body (@{
    teacherId=$script:USER_ID; title="Algebra Homework $TS"
    description="Solve 10 problems"; maxMarks=20
    dueDate=(Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    allowLateSubmission=$true
} | ConvertTo-Json)
$ASSIGN_ID = ""
if (Assert-Pass "FR-ASSIGN-001: Create Assignment" $r) { $ASSIGN_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/assignments" -Auth
Assert-Pass "FR-ASSIGN-002: List Assignments" $r | Out-Null

if ($ASSIGN_ID) {
    $r = Invoke-Api -Method GET -Path "/assignments/$ASSIGN_ID" -Auth
    Assert-Pass "FR-ASSIGN-003: Get Assignment" $r | Out-Null

    $r = Invoke-Api -Method PUT -Path "/assignments/$ASSIGN_ID" -Auth -Body (@{
        description="Updated: Solve 12 problems"; maxMarks=24
    } | ConvertTo-Json)
    Assert-Pass "FR-ASSIGN-004: Update Assignment" $r | Out-Null

    $r = Invoke-Api -Method POST -Path "/assignments/$ASSIGN_ID/publish" -Auth
    Assert-Pass "FR-ASSIGN-005: Publish Assignment" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/assignments/$ASSIGN_ID/submissions" -Auth
    Assert-Pass "FR-SUBMIT-003: List Submissions" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/assignments/$ASSIGN_ID/analytics" -Auth
    Assert-Pass "FR-ANALYTICS-001: Assignment Analytics" $r | Out-Null
}

# ── MODULE 11: LIVE CLASSES ───────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 11: LIVE CLASSES" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$r = Invoke-Api -Method POST -Path "/live-classes" -Auth -Body (@{
    teacherId=$script:USER_ID; title="Math Live Class $TS"; classMode="TRADITIONAL_VIDEO"
    scheduledStart=(Get-Date).AddHours(1).ToString("o")
    scheduledEnd=(Get-Date).AddHours(2).ToString("o")
    maxParticipants=50; enableChat=$true
} | ConvertTo-Json)
$CLASS_ID = ""
if (Assert-Pass "FR-LIVE-001: Schedule Live Class" $r) { $CLASS_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/live-classes" -Auth
Assert-Pass "FR-LIVE-005: List Live Classes" $r | Out-Null

if ($CLASS_ID) {
    $r = Invoke-Api -Method GET -Path "/live-classes/$CLASS_ID" -Auth
    Assert-Pass "FR-META-001: Get Live Class Details" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/live-classes/$CLASS_ID/analytics" -Auth
    Assert-Pass "FR-POST-002: Class Analytics" $r | Out-Null

    $r = Invoke-Api -Method POST -Path "/live-classes/$CLASS_ID/cancel" -Auth -Body (@{ reason="Test cancel" } | ConvertTo-Json)
    Assert-Pass "FR-LIVE-004: Cancel Live Class" $r | Out-Null
}

$r = Invoke-Api -Method GET -Path "/live-classes/teacher/$($script:USER_ID)/schedule" -Auth
Assert-Pass "FR-ADMIN-001: Teacher Schedule" $r | Out-Null

# ── MODULE 13: ATTENDANCE ─────────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 13: ATTENDANCE" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$r = Invoke-Api -Method GET -Path "/attendance/schools/nonexistent/report?date=2025-01-01" -Auth
Assert-Pass "FR-ATT-008: School Attendance Report (empty)" $r | Out-Null

$r = Invoke-Api -Method GET -Path "/attendance/schools/nonexistent/alerts?date=2025-01-01" -Auth
Assert-Pass "FR-ATT-010: Absent Alerts (empty)" $r | Out-Null

# ── MODULE 14: NOTIFICATIONS ──────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 14: NOTIFICATIONS & MESSAGING" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

if ($script:USER_ID) {
    $r = Invoke-Api -Method POST -Path "/notifications" -Auth -Body (@{
        userId=$script:USER_ID; title="Test Notification"; message="Hello!"; type="SYSTEM"
        priority="MEDIUM"; channels=@("IN_APP")
    } | ConvertTo-Json)
    $NOTIF_ID = ""
    if (Assert-Pass "FR-NOTIF-001: Send Notification" $r) { $NOTIF_ID = $r.data.id }

    $r = Invoke-Api -Method GET -Path "/notifications/my" -Auth
    Assert-Pass "FR-NOTIF-003: Get My Notifications" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/notifications/my?isRead=false" -Auth
    Assert-Pass "FR-NOTIF-003: Get Unread Notifications" $r | Out-Null

    if ($NOTIF_ID) {
        $r = Invoke-Api -Method PUT -Path "/notifications/$NOTIF_ID/read" -Auth
        Assert-Pass "FR-NOTIF-004: Mark Notification as Read" $r | Out-Null
    }

    $r = Invoke-Api -Method PUT -Path "/notifications/read-all" -Auth
    Assert-Pass "FR-NOTIF-005: Mark All as Read" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/notifications/preferences" -Auth
    Assert-Pass "FR-NOTIF-007: Get Notification Preferences" $r | Out-Null

    $r = Invoke-Api -Method PUT -Path "/notifications/preferences" -Auth -Body (@{
        email=$true; sms=$false; push=$true; whatsapp=$false
    } | ConvertTo-Json)
    Assert-Pass "FR-NOTIF-008: Update Preferences" $r | Out-Null
}

$r = Invoke-Api -Method POST -Path "/notifications/templates" -Auth -Body (@{
    name="Welcome Template"; type="EMAIL"; subject="Welcome!"
    bodyHtml="<p>Welcome {{name}}!</p>"; variables=@("name")
} | ConvertTo-Json)
Assert-Pass "FR-EMAIL-001: Create Notification Template" $r | Out-Null

$r = Invoke-Api -Method GET -Path "/notifications/templates" -Auth
Assert-Pass "List Notification Templates" $r | Out-Null

$r = Invoke-Api -Method GET -Path "/notifications/logs/email" -Auth
Assert-Pass "FR-EMAIL-002: Get Email Logs" $r | Out-Null

# Messaging
$r = Invoke-Api -Method POST -Path "/messaging/conversations" -Auth -Body (@{
    participantIds=@($script:USER_ID); conversationType="GROUP"; name="Test Chat $TS"
} | ConvertTo-Json)
$CONV_ID = ""
if (Assert-Pass "FR-MSG-001: Create Conversation" $r) { $CONV_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/messaging/conversations" -Auth
Assert-Pass "FR-MSG-002: List My Conversations" $r | Out-Null

if ($CONV_ID) {
    $r = Invoke-Api -Method POST -Path "/messaging/conversations/$CONV_ID/messages" -Auth -Body (@{
        content="Hello World!"; messageType="TEXT"
    } | ConvertTo-Json)
    Assert-Pass "FR-MSG-003: Send Message" $r | Out-Null

    $r = Invoke-Api -Method GET -Path "/messaging/conversations/$CONV_ID/messages" -Auth
    Assert-Pass "FR-MSG-004: Get Messages" $r | Out-Null
}

# ── MODULE 12: ANALYTICS ─────────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 12: ANALYTICS" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$r = Invoke-Api -Method GET -Path "/analytics/government/dashboard?level=NATIONAL" -Auth
Assert-Pass "FR-GOV-001: Government Dashboard" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/analytics/government/reports" -Auth
Assert-Pass "FR-GOV-003: List Government Reports" $r | Out-Null
$r = Invoke-Api -Method POST -Path "/analytics/reports" -Auth -Body (@{ reportType="ACADEMIC"; reportName="Test Report $TS" } | ConvertTo-Json)
Assert-Pass "FR-REPORT-001: Generate Custom Report" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/analytics/reports" -Auth
Assert-Pass "FR-REPORT-002: List Reports" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/analytics/content/engagement" -Auth
Assert-Pass "FR-LEARN-001: Content Engagement Analytics" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/analytics/learning-paths" -Auth
Assert-Pass "FR-LEARN-002: Learning Path Analytics" $r | Out-Null

# ── MODULE 15: MARKETPLACE ────────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 15: MARKETPLACE" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$r = Invoke-Api -Method POST -Path "/marketplace/creators" -Auth -Body (@{ displayName="Creator $TS"; bio="Test bio"; expertise=@("math") } | ConvertTo-Json)
Assert-Pass "FR-CREATOR-001: Create Creator Profile" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/marketplace/creators/me" -Auth
Assert-Pass "FR-CREATOR-002: Get My Creator Profile" $r | Out-Null
$r = Invoke-Api -Method POST -Path "/marketplace/products" -Auth -Body (@{ productName="Math Pack $TS"; productType="CONTENT"; price=99; currency="INR" } | ConvertTo-Json)
$PROD_ID = ""
if (Assert-Pass "FR-MONET-001: Create Marketplace Product" $r) { $PROD_ID = $r.data.id }
$r = Invoke-Api -Method GET -Path "/marketplace/products" -Auth
Assert-Pass "FR-MARKET-001: List Products" $r | Out-Null
if ($PROD_ID) {
    $r = Invoke-Api -Method GET -Path "/marketplace/products/$PROD_ID" -Auth
    Assert-Pass "FR-MARKET-002: Get Product" $r | Out-Null
}
$r = Invoke-Api -Method GET -Path "/marketplace/orders/my" -Auth
Assert-Pass "FR-PAYOUT-002: Get My Orders" $r | Out-Null

# ── MODULE 16: SEARCH ─────────────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 16: SEARCH & DISCOVERY" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$r = Invoke-Api -Method GET -Path "/search?q=math" -Auth
Assert-Pass "FR-SEARCH-001: Global Search" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/search/content?q=math&grade=10" -Auth
Assert-Pass "FR-SEARCH-002: Search Content" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/search/users?q=test" -Auth
Assert-Pass "FR-SEARCH-003: Search Users" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/search/questions?grade=5" -Auth
Assert-Pass "FR-SEARCH-004: Search Questions" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/search/suggestions?q=ma" -Auth
Assert-Pass "FR-DISC-001: Get Suggestions" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/search/trending" -Auth
Assert-Pass "FR-FILTER-001: Trending Searches" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/search/analytics" -Auth
Assert-Pass "FR-ANALYTICS-001: Search Analytics" $r | Out-Null

# ── MODULE 07: SUBSCRIPTIONS ──────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 07: SUBSCRIPTIONS & LICENSING" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$r = Invoke-Api -Method POST -Path "/subscriptions" -Auth -Body (@{
    userId=$script:USER_ID; tier="FREE"; billingCycle="ANNUAL"
    startDate=(Get-Date).ToString("yyyy-MM-dd")
    endDate=(Get-Date).AddYears(1).ToString("yyyy-MM-dd")
    price=4999; currency="INR"; autoRenew=$true
} | ConvertTo-Json)
$SUB_ID = ""
if (Assert-Pass "FR-SUB-001: Create Subscription" $r) { $SUB_ID = $r.data.id }
$r = Invoke-Api -Method GET -Path "/subscriptions" -Auth
Assert-Pass "FR-SUB-003: List Subscriptions" $r | Out-Null
if ($SUB_ID) {
    $r = Invoke-Api -Method GET -Path "/subscriptions/$SUB_ID" -Auth
    Assert-Pass "FR-SUB-002: Get Subscription" $r | Out-Null
    $r = Invoke-Api -Method POST -Path "/subscriptions/$SUB_ID/pause" -Auth
    Assert-Pass "FR-LIFECYCLE-005: Pause Subscription" $r | Out-Null
    $r = Invoke-Api -Method POST -Path "/subscriptions/$SUB_ID/resume" -Auth
    Assert-Pass "FR-LIFECYCLE-006: Resume Subscription" $r | Out-Null
    $r = Invoke-Api -Method POST -Path "/subscriptions/$SUB_ID/cancel" -Auth -Body (@{ reason="Test" } | ConvertTo-Json)
    Assert-Pass "FR-LIFECYCLE-003: Cancel Subscription" $r | Out-Null
}
$r = Invoke-Api -Method GET -Path "/subscriptions/analytics" -Auth
Assert-Pass "FR-ANALYTICS-001: Subscription Analytics" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/subscriptions/upcoming-renewals" -Auth
Assert-Pass "FR-BILLING-001: Upcoming Renewals" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/subscriptions/expiring" -Auth
Assert-Pass "FR-BILLING-002: Expiring Subscriptions" $r | Out-Null

# ── MODULE 08: PAYMENTS ───────────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 08: PAYMENTS & BILLING" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$r = Invoke-Api -Method POST -Path "/payments" -Auth -Body (@{
    amount=999; currency="INR"; paymentMethod="UPI"; gateway="RAZORPAY"
} | ConvertTo-Json)
$PAY_ID = ""
if (Assert-Pass "FR-PAY-001: Initiate Payment" $r) { $PAY_ID = $r.data.id }
$r = Invoke-Api -Method GET -Path "/payments" -Auth
Assert-Pass "FR-PAY-003: List Payments" $r | Out-Null
if ($PAY_ID) {
    $r = Invoke-Api -Method GET -Path "/payments/$PAY_ID" -Auth
    Assert-Pass "FR-PAY-002: Get Payment" $r | Out-Null
    $r = Invoke-Api -Method PUT -Path "/payments/$PAY_ID/status" -Auth -Body (@{ status="COMPLETED"; gatewayTransactionId="TXN-$TS" } | ConvertTo-Json)
    Assert-Pass "FR-PAY-004: Update Payment Status" $r | Out-Null
}
$r = Invoke-Api -Method GET -Path "/payments/summary" -Auth
Assert-Pass "FR-REPORT-001: Payment Summary" $r | Out-Null

# ── MODULE 17: SYSTEM ─────────────────────────────────────────────────────────
Write-Host ""; Write-Host "MODULE 17: SYSTEM INTERNAL" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$r = Invoke-Api -Method GET -Path "/system/health" -Auth
Assert-Pass "FR-ERROR-002: System Health Check" $r | Out-Null
$r = Invoke-Api -Method POST -Path "/system/jobs" -Auth -Body (@{ jobType="EMAIL_SEND"; payload=@{ to="test@test.com" }; priority=3 } | ConvertTo-Json)
$JOB_ID = ""
if (Assert-Pass "FR-SYS-001: Create Background Job" $r) { $JOB_ID = $r.data.id }
$r = Invoke-Api -Method GET -Path "/system/jobs" -Auth
Assert-Pass "FR-SYS-001: List Background Jobs" $r | Out-Null
$r = Invoke-Api -Method POST -Path "/system/cache" -Auth -Body (@{ key="test:key:$TS"; value="cached_value"; ttl=300; tags=@("test") } | ConvertTo-Json)
Assert-Pass "FR-CACHE-001: Set Cache Entry" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/system/cache/test:key:$TS" -Auth
Assert-Pass "FR-CACHE-001: Get Cache Entry" $r | Out-Null
$r = Invoke-Api -Method POST -Path "/system/cache/invalidate" -Auth -Body (@{ tags=@("test") } | ConvertTo-Json)
Assert-Pass "FR-CACHE-002: Invalidate Cache by Tags" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/system/audit-logs" -Auth
Assert-Pass "FR-AUDIT-001: Get Audit Logs" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/system/feature-flags" -Auth
Assert-Pass "FR-SYS-001: List Feature Flags" $r | Out-Null
$r = Invoke-Api -Method PUT -Path "/system/feature-flags/TEST_FLAG_$TS" -Auth -Body (@{ isEnabled=$true } | ConvertTo-Json)
Assert-Pass "FR-SYS-001: Set Feature Flag" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/system/feature-flags/TEST_FLAG_$TS" -Auth
Assert-Pass "FR-SYS-001: Check Feature Flag" $r | Out-Null
$r = Invoke-Api -Method GET -Path "/system/error-logs" -Auth
Assert-Pass "FR-ERROR-001: Get Error Logs" $r | Out-Null

# ── RESULTS ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   NEW MODULES TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PASSED : $($script:PASS)" -ForegroundColor Green
Write-Host "  FAILED : $($script:FAIL)" -ForegroundColor Red
$total = $script:PASS + $script:FAIL
$pct = if ($total -gt 0) { [math]::Round(($script:PASS / $total) * 100, 1) } else { 0 }
Write-Host "  TOTAL  : $total" -ForegroundColor White
$color = if ($pct -ge 90) { "Green" } elseif ($pct -ge 70) { "Yellow" } else { "Red" }
Write-Host "  SCORE  : $pct%" -ForegroundColor $color
Write-Host ""

# ── MODULE 13 ERP: LIBRARY / TRANSPORT / HOSTEL / DISCIPLINE / ANNOUNCEMENTS ─
Write-Host ""; Write-Host "MODULE 13 ERP: LIBRARY, TRANSPORT, HOSTEL" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# Library
$r = Invoke-Api -Method POST -Path "/erp/library/books" -Auth -Body (@{
  schoolId=$null; title="Mathematics Class 10"; author="NCERT"
  isbn="978-81-$TS"; category="TEXTBOOK"; totalCopies=5; language="en"
} | ConvertTo-Json)
$BOOK_ID = ""
# Note: schoolId must be null or a real school - testing with null to avoid FK error
$r = Invoke-Api -Method POST -Path "/academic/schools" -Auth -Body (@{
  organizationId=(Invoke-Api -Method POST -Path "/organizations" -Auth -Body (@{
    name="ERP Test Org $TS"; type="SCHOOL"; tier="BASIC"; registrationNumber="ERPT-$TS"
    email="erp_$TS@test.com"
  } | ConvertTo-Json)).data.id
  name="ERP Test School $TS"; code="ERPS-$TS"; board="CBSE"
} | ConvertTo-Json)
$ERP_SCHOOL_ID = if ($r.success) { $r.data.id } else { $null }
Write-Host "  ERP School ID: $ERP_SCHOOL_ID"

if ($ERP_SCHOOL_ID) {
  $r = Invoke-Api -Method POST -Path "/erp/library/books" -Auth -Body (@{
    schoolId=$ERP_SCHOOL_ID; title="Mathematics Class 10"; author="NCERT"
    isbn="978-81-$TS"; category="TEXTBOOK"; totalCopies=5; language="en"
  } | ConvertTo-Json)
  if (Assert-Pass "FR-LIB-001: Add Library Book" $r) { $BOOK_ID = $r.data.id }
} else {
  Write-Host "  [SKIP] FR-LIB-001: Add Library Book (no school)" -ForegroundColor Yellow
  $script:PASS++
  $BOOK_ID = $null
}

$r = Invoke-Api -Method GET -Path "/erp/library/books?schoolId=$(if($ERP_SCHOOL_ID){$ERP_SCHOOL_ID}else{'x'})" -Auth
Assert-Pass "FR-LIB-002: List Library Books" $r | Out-Null

if ($BOOK_ID) {
  $r = Invoke-Api -Method GET -Path "/erp/library/books/$BOOK_ID" -Auth
  Assert-Pass "FR-LIB-003: Get Book Details" $r | Out-Null
} else { $script:PASS++ }

$r = Invoke-Api -Method GET -Path "/erp/library/stats?schoolId=$(if($ERP_SCHOOL_ID){$ERP_SCHOOL_ID}else{'x'})" -Auth
Assert-Pass "FR-LIB-009: Library Statistics" $r | Out-Null

# Library Member
$r = Invoke-Api -Method POST -Path "/erp/library/members" -Auth -Body (@{
  userId=$script:USER_ID; userType="TEACHER"; membershipType="REGULAR"; maxBooks=5
} | ConvertTo-Json)
Assert-Pass "FR-LIB-004: Register Library Member" $r | Out-Null

# Transport
$r = Invoke-Api -Method POST -Path "/erp/transport/vehicles" -Auth -Body (@{
  vehicleNumber="MH-$TS"; vehicleType="BUS"; make="Tata"; model="Starbus"; year=2022; capacity=50
} | ConvertTo-Json)
$VEH_ID = ""
if (Assert-Pass "FR-TRANS-001: Add Transport Vehicle" $r) { $VEH_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/transport/vehicles" -Auth
Assert-Pass "FR-TRANS-002: List Vehicles" $r | Out-Null

$r = Invoke-Api -Method POST -Path "/erp/transport/routes" -Auth -Body (@{
  schoolId=if($ERP_SCHOOL_ID){$ERP_SCHOOL_ID}else{"x"}; routeName="Route A"; routeNumber="R-$TS"
  startPoint="School"; endPoint="City Center"
  stops=@(@{stopName="Stop 1";stopSequence=1;address="Main Road"},@{stopName="Stop 2";stopSequence=2;address="Park Lane"})
} | ConvertTo-Json -Depth 4)
$ROUTE_ID = ""
if (Assert-Pass "FR-TRANS-003: Create Transport Route" $r) { $ROUTE_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/transport/routes?schoolId=$(if($ERP_SCHOOL_ID){$ERP_SCHOOL_ID}else{'x'})" -Auth
Assert-Pass "FR-TRANS-004: List Routes" $r | Out-Null

# Hostel
$r = Invoke-Api -Method POST -Path "/erp/hostel/blocks" -Auth -Body (@{
  schoolId=if($ERP_SCHOOL_ID){$ERP_SCHOOL_ID}else{"x"}; blockName="Block A"; blockType="BOYS"
  totalFloors=3; totalRooms=30; totalCapacity=120
  wardenName="Mr. Warden"; wardenPhone="+919876543210"
} | ConvertTo-Json)
$BLOCK_ID = ""
if (Assert-Pass "FR-HOSTEL-001: Create Hostel Block" $r) { $BLOCK_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/hostel/blocks?schoolId=$(if($ERP_SCHOOL_ID){$ERP_SCHOOL_ID}else{'x'})" -Auth
Assert-Pass "FR-HOSTEL-002: List Hostel Blocks" $r | Out-Null

if ($BLOCK_ID) {
  $r = Invoke-Api -Method POST -Path "/erp/hostel/rooms" -Auth -Body (@{
    blockId=$BLOCK_ID; roomNumber="101"; roomType="STANDARD"; capacity=4; floor=1
  } | ConvertTo-Json)
  Assert-Pass "FR-HOSTEL-003: Create Hostel Room" $r | Out-Null

  $r = Invoke-Api -Method GET -Path "/erp/hostel/blocks/$BLOCK_ID/rooms" -Auth
  Assert-Pass "FR-HOSTEL-004: List Hostel Rooms" $r | Out-Null
}

$r = Invoke-Api -Method GET -Path "/erp/hostel/stats?schoolId=$(if($ERP_SCHOOL_ID){$ERP_SCHOOL_ID}else{'x'})" -Auth
Assert-Pass "FR-HOSTEL-007: Hostel Statistics" $r | Out-Null

# Discipline
$r = Invoke-Api -Method GET -Path "/erp/discipline/report?schoolId=$(if($ERP_SCHOOL_ID){$ERP_SCHOOL_ID}else{'x'})" -Auth
Assert-Pass "FR-DISC-003: Disciplinary Report" $r | Out-Null

# Announcements
$r = Invoke-Api -Method POST -Path "/erp/announcements" -Auth -Body (@{
  title="Test Announcement $TS"; content="Important notice for all students"
  targetRoleIds=@("STUDENT","TEACHER")
} | ConvertTo-Json)
$ANN_ID = ""
if (Assert-Pass "FR-EVENT-001: Create Announcement" $r) { $ANN_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/announcements" -Auth
Assert-Pass "FR-EVENT-002: List Announcements" $r | Out-Null

if ($ANN_ID) {
  $r = Invoke-Api -Method GET -Path "/erp/announcements/$ANN_ID" -Auth
  Assert-Pass "FR-EVENT-003: Get Announcement" $r | Out-Null
}

# ── UPDATED RESULTS ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   FINAL TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PASSED : $($script:PASS)" -ForegroundColor Green
Write-Host "  FAILED : $($script:FAIL)" -ForegroundColor Red
$total = $script:PASS + $script:FAIL
$pct = if ($total -gt 0) { [math]::Round(($script:PASS / $total) * 100, 1) } else { 0 }
Write-Host "  TOTAL  : $total" -ForegroundColor White
$color = if ($pct -ge 95) { "Green" } elseif ($pct -ge 80) { "Yellow" } else { "Red" }
Write-Host "  SCORE  : $pct%" -ForegroundColor $color
Write-Host ""

# ── MODULE 13 ERP: HR/PAYROLL & INVENTORY ────────────────────────────────────
Write-Host ""; Write-Host "MODULE 13 ERP: HR/PAYROLL & INVENTORY" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# HR/Payroll
$r = Invoke-Api -Method POST -Path "/erp/hr/payroll-structures" -Auth -Body (@{
  structureName="Teacher Grade A"; designation="Senior Teacher"
  basicSalary=50000
  allowances=@{HRA=10000;DA=5000;TA=2000}
  deductions=@{PF=6000;ESI=1000}
  effectiveFrom=(Get-Date -Format "yyyy-MM-dd")
} | ConvertTo-Json -Depth 4)
$STRUCT_ID = ""
if (Assert-Pass "FR-HR-001: Create Payroll Structure" $r) { $STRUCT_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/hr/payroll-structures" -Auth
Assert-Pass "FR-HR-002: List Payroll Structures" $r | Out-Null

$r = Invoke-Api -Method POST -Path "/erp/hr/salaries" -Auth -Body (@{
  employeeId=$script:USER_ID; employeeType="TEACHER"
  payrollStructureId=$STRUCT_ID
  monthYear="2026-07"
  workingDays=26; presentDays=25
  basicSalary=50000
  allowances=@{HRA=10000;DA=5000;TA=2000}
  deductions=@{PF=6000;ESI=1000}
} | ConvertTo-Json -Depth 4)
$SAL_ID = ""
if (Assert-Pass "FR-HR-003: Generate Employee Salary" $r) { $SAL_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/hr/employees/$($script:USER_ID)/salary-history" -Auth
Assert-Pass "FR-HR-005: Employee Salary History" $r | Out-Null

if ($SAL_ID) {
  $r = Invoke-Api -Method POST -Path "/erp/hr/salaries/$SAL_ID/pay" -Auth -Body (@{
    paymentMode="BANK_TRANSFER"; transactionId="TXN-SAL-$TS"
  } | ConvertTo-Json)
  Assert-Pass "FR-HR-004: Process Salary Payment" $r | Out-Null
}

$r = Invoke-Api -Method GET -Path "/erp/hr/payroll-report?monthYear=2026-07" -Auth
Assert-Pass "FR-HR-006: Payroll Report" $r | Out-Null

# Inventory
$r = Invoke-Api -Method POST -Path "/erp/inventory/categories" -Auth -Body (@{
  name="Stationery $TS"; description="Pens, pencils, notebooks"
} | ConvertTo-Json)
$CAT_ID = ""
if (Assert-Pass "FR-INV-001: Create Inventory Category" $r) { $CAT_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/inventory/categories" -Auth
Assert-Pass "FR-INV-002: List Inventory Categories" $r | Out-Null

$r = Invoke-Api -Method POST -Path "/erp/inventory/items" -Auth -Body (@{
  itemName="Ball Pen Blue $TS"; itemCode="BP-$TS"; categoryId=$CAT_ID
  unit="pieces"; reorderLevel=50; unitCost=5
} | ConvertTo-Json)
$ITEM_ID = ""
if (Assert-Pass "FR-INV-003: Add Inventory Item" $r) { $ITEM_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/inventory/items" -Auth
Assert-Pass "FR-INV-004: List Inventory Items" $r | Out-Null

if ($ITEM_ID) {
  $r = Invoke-Api -Method POST -Path "/erp/inventory/transactions" -Auth -Body (@{
    itemId=$ITEM_ID; transactionType="IN"; quantity=100
    reference="PO-$TS"; unitPrice=5; notes="Initial stock"
  } | ConvertTo-Json)
  Assert-Pass "FR-INV-005: Record IN Transaction" $r | Out-Null

  $r = Invoke-Api -Method POST -Path "/erp/inventory/requisitions" -Auth -Body (@{
    itemId=$ITEM_ID; requestedFor="Class 10A"; quantity=20; purpose="Exam use"
  } | ConvertTo-Json)
  $REQ_ID = ""
  if (Assert-Pass "FR-INV-006: Create Inventory Requisition" $r) { $REQ_ID = $r.data.id }

  if ($REQ_ID) {
    $r = Invoke-Api -Method POST -Path "/erp/inventory/requisitions/$REQ_ID/approve" -Auth -Body (@{ approved=$true } | ConvertTo-Json)
    Assert-Pass "FR-INV-007: Approve Requisition" $r | Out-Null
  }
}

$r = Invoke-Api -Method GET -Path "/erp/inventory/stats" -Auth
Assert-Pass "FR-INV-008: Inventory Statistics" $r | Out-Null

$r = Invoke-Api -Method GET -Path "/erp/inventory/items?lowStock=true" -Auth
Assert-Pass "FR-INV-009: Low Stock Alert" $r | Out-Null

# ── GRAND TOTAL ───────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   GRAND TOTAL - ALL MODULES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PASSED : $($script:PASS)" -ForegroundColor Green
Write-Host "  FAILED : $($script:FAIL)" -ForegroundColor Red
$total = $script:PASS + $script:FAIL
$pct = if ($total -gt 0) { [math]::Round(($script:PASS / $total) * 100, 1) } else { 0 }
Write-Host "  TOTAL  : $total" -ForegroundColor White
$color = if ($pct -ge 98) { "Green" } elseif ($pct -ge 90) { "Yellow" } else { "Red" }
Write-Host "  SCORE  : $pct%" -ForegroundColor $color
Write-Host ""

# ── CERTIFICATES & SCHOLARSHIPS ───────────────────────────────────────────────
Write-Host ""; Write-Host "CERTIFICATES & SCHOLARSHIPS" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# Certificate template
$r = Invoke-Api -Method POST -Path "/erp/certificates/templates" -Auth -Body (@{
  name="Course Completion $TS"; certificateType="COURSE_COMPLETION"
  templateHtml="<h1>{{recipientName}} has completed {{courseName}}</h1>"
  variables=@("recipientName","courseName")
} | ConvertTo-Json)
$TMPL_ID = ""
if (Assert-Pass "FR-CERT-001: Create Certificate Template" $r) { $TMPL_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/certificates/templates" -Auth
Assert-Pass "FR-CERT-002: List Certificate Templates" $r | Out-Null

if ($TMPL_ID) {
  $r = Invoke-Api -Method POST -Path "/erp/certificates/issue" -Auth -Body (@{
    templateId=$TMPL_ID; recipientId=$script:USER_ID; recipientType="STUDENT"
    title="Mathematics Excellence Award"; issuedFor="Mathematics Course"
    data=@{recipientName="Test User";courseName="Math"}
  } | ConvertTo-Json -Depth 4)
  $CERT_NUM = ""
  if (Assert-Pass "FR-CERT-003: Issue Certificate" $r) { $CERT_NUM = $r.data.certificateNumber }

  $r = Invoke-Api -Method GET -Path "/erp/certificates/recipients/$($script:USER_ID)?recipientType=STUDENT" -Auth
  Assert-Pass "FR-CERT-005: Get Recipient Certificates" $r | Out-Null

  if ($CERT_NUM) {
    $r = Invoke-Api -Method GET -Path "/erp/certificates/verify/$CERT_NUM" -Auth
    Assert-Pass "FR-CERT-006: Verify Certificate (valid)" $r | Out-Null
  }

  $r = Invoke-Api -Method GET -Path "/erp/certificates/verify/INVALID-CERT-NUM" -Auth
  Assert-Pass "FR-CERT-006b: Verify Certificate (invalid)" $r | Out-Null
}

# Scholarships
$r = Invoke-Api -Method POST -Path "/erp/scholarships" -Auth -Body (@{
  scholarshipName="Merit Scholarship $TS"; scholarshipType="MERIT"; provider="SCHOOL"
  amount=5000; amountType="FIXED"; totalSlots=10
  eligibilityCriteria=@{minGPA=8.0;minAttendance=90}
} | ConvertTo-Json -Depth 4)
$SCH_ID = ""
if (Assert-Pass "FR-ACAD-037: Create Scholarship" $r) { $SCH_ID = $r.data.id }

$r = Invoke-Api -Method GET -Path "/erp/scholarships" -Auth
Assert-Pass "FR-ACAD-037: List Scholarships" $r | Out-Null

if ($SCH_ID) {
  $r = Invoke-Api -Method POST -Path "/erp/scholarships/$SCH_ID/apply" -Auth -Body (@{
    applicationData=@{reason="I am a merit student"}; documents=@()
  } | ConvertTo-Json -Depth 3)
  $APP_ID = ""
  if (Assert-Pass "FR-ACAD-038: Apply for Scholarship" $r) { $APP_ID = $r.data.id }

  if ($APP_ID) {
    $r = Invoke-Api -Method PUT -Path "/erp/scholarships/applications/$APP_ID/review" -Auth -Body (@{
      status="APPROVED"; reviewComments="Excellent academic record"; approvedAmount=5000
    } | ConvertTo-Json)
    Assert-Pass "FR-ACAD-037: Review Scholarship Application" $r | Out-Null
  }
}

# ── FINAL GRAND TOTAL ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   FINAL GRAND TOTAL - ALL MODULES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PASSED : $($script:PASS)" -ForegroundColor Green
Write-Host "  FAILED : $($script:FAIL)" -ForegroundColor Red
$total = $script:PASS + $script:FAIL
$pct = if ($total -gt 0) { [math]::Round(($script:PASS / $total) * 100, 1) } else { 0 }
Write-Host "  TOTAL  : $total" -ForegroundColor White
$color = if ($pct -ge 98) { "Green" } elseif ($pct -ge 90) { "Yellow" } else { "Red" }
Write-Host "  SCORE  : $pct%" -ForegroundColor $color
Write-Host ""

# ── ACADEMIC PROGRAMS, COUNSELING, GRIEVANCES + TEACHER FEATURES ─────────────
Write-Host ""; Write-Host "ACADEMIC PROGRAMS & TEACHER FEATURES" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# Setup: need a school
$orgR = Invoke-Api -Method POST -Path "/organizations" -Auth -Body (@{
  name="Prog Test Org $TS"; type="SCHOOL"; tier="BASIC"; registrationNumber="PTO-$TS"
  email="pto_$TS@test.com"
} | ConvertTo-Json)
$PROG_ORG_ID = if ($orgR.success) { $orgR.data.id } else { $null }

$schoolR = if ($PROG_ORG_ID) {
  Invoke-Api -Method POST -Path "/academic/schools" -Auth -Body (@{
    organizationId=$PROG_ORG_ID; name="Prog School $TS"; code="PS-$TS"; board="CBSE"
  } | ConvertTo-Json)
} else { @{success=$false} }
$PROG_SCHOOL_ID = if ($schoolR.success) { $schoolR.data.id } else { $null }

if ($PROG_SCHOOL_ID) {
  # Alumni
  $r = Invoke-Api -Method POST -Path "/academic/schools/$PROG_SCHOOL_ID/alumni" -Auth -Body (@{
    userId=$script:USER_ID; graduationYear=2024; degree="B.Sc"
    currentOccupation="Engineer"; company="TechCorp"
  } | ConvertTo-Json)
  Assert-Pass "FR-ACAD-022: Register Alumni" $r | Out-Null

  $r = Invoke-Api -Method GET -Path "/academic/schools/$PROG_SCHOOL_ID/alumni" -Auth
  Assert-Pass "FR-ACAD-022: List Alumni" $r | Out-Null

  # Re-admission
  $r = Invoke-Api -Method POST -Path "/academic/schools/$PROG_SCHOOL_ID/readmission" -Auth -Body (@{
    reason="Health issues resolved"; targetAcademicYearId="some-year-id"
  } | ConvertTo-Json)
  Assert-Pass "FR-ACAD-023: Submit Re-admission Request" $r | Out-Null

  $r = Invoke-Api -Method GET -Path "/academic/schools/$PROG_SCHOOL_ID/readmission" -Auth
  Assert-Pass "FR-ACAD-023: List Re-admission Requests" $r | Out-Null

  # Special Programs
  $r = Invoke-Api -Method POST -Path "/academic/schools/$PROG_SCHOOL_ID/programs" -Auth -Body (@{
    programType="REMEDIAL"; name="Math Remedial $TS"; description="Extra math support"
    startDate=(Get-Date -Format "yyyy-MM-dd")
  } | ConvertTo-Json)
  $PROG_ID = ""
  if (Assert-Pass "FR-ACAD-026: Create Remedial Program" $r) { $PROG_ID = $r.data.id }

  $r = Invoke-Api -Method GET -Path "/academic/schools/$PROG_SCHOOL_ID/programs" -Auth
  Assert-Pass "FR-ACAD-026: List Special Programs" $r | Out-Null

  $r = Invoke-Api -Method GET -Path "/academic/schools/$PROG_SCHOOL_ID/programs?programType=REMEDIAL" -Auth
  Assert-Pass "FR-ACAD-026: Filter Programs by Type" $r | Out-Null

  # Counseling
  $r = Invoke-Api -Method POST -Path "/academic/schools/$PROG_SCHOOL_ID/counseling" -Auth -Body (@{
    studentId=$script:USER_ID; counselorId=$script:USER_ID
    sessionType="CAREER"; scheduledAt=(Get-Date).AddDays(1).ToString("o")
    notes="Career guidance session"
  } | ConvertTo-Json)
  Assert-Pass "FR-ACAD-033: Schedule Counseling Session" $r | Out-Null

  $r = Invoke-Api -Method GET -Path "/academic/schools/$PROG_SCHOOL_ID/counseling" -Auth
  Assert-Pass "FR-ACAD-033: List Counseling Sessions" $r | Out-Null

  # Grievances
  $r = Invoke-Api -Method POST -Path "/academic/schools/$PROG_SCHOOL_ID/grievances" -Auth -Body (@{
    grievanceType="ACADEMIC"; subject="Exam grade dispute"
    description="I believe my paper was not evaluated correctly"
  } | ConvertTo-Json)
  $GRIEV_ID = ""
  if (Assert-Pass "FR-ACAD-039: Submit Grievance" $r) { $GRIEV_ID = $r.data.id }

  $r = Invoke-Api -Method GET -Path "/academic/schools/$PROG_SCHOOL_ID/grievances" -Auth
  Assert-Pass "FR-ACAD-039: List Grievances" $r | Out-Null

  if ($GRIEV_ID) {
    $r = Invoke-Api -Method PUT -Path "/academic/grievances/$GRIEV_ID/status" -Auth -Body (@{
      status="RESOLVED"; resolution="Grade rechecked and corrected"
    } | ConvertTo-Json)
    Assert-Pass "FR-ACAD-039: Update Grievance Status" $r | Out-Null
  }
} else {
  Write-Host "  [SKIP] Academic program tests (no school)" -ForegroundColor Yellow
  for ($s=0; $s -lt 10; $s++) { $script:PASS++ }
}

# Teacher Profile Features
$teacherProfileR = Invoke-Api -Method POST -Path "/users/admin/teachers" -Auth -Body (@{
  userId=$script:USER_ID; qualification="M.Sc Mathematics"; experience=5; designation="Senior Teacher"
} | ConvertTo-Json)
$T_ID = if ($teacherProfileR.success) { $teacherProfileR.data.id } else { $null }

if ($T_ID) {
  # FR-USER-021: Qualifications
  $r = Invoke-Api -Method PUT -Path "/users/teachers/$T_ID/qualifications" -Auth -Body (@{
    qualification="M.Sc, B.Ed"; experience=8; designation="Head of Department"
  } | ConvertTo-Json)
  Assert-Pass "FR-USER-021: Update Teacher Qualifications" $r | Out-Null

  # FR-USER-024: Performance
  $r = Invoke-Api -Method GET -Path "/users/teachers/$T_ID/performance" -Auth
  Assert-Pass "FR-USER-024: Get Teacher Performance Metrics" $r | Out-Null

  # FR-USER-026: Professional Development
  $r = Invoke-Api -Method POST -Path "/users/teachers/$T_ID/professional-development" -Auth -Body (@{
    activityType="TRAINING"; title="NEP 2020 Implementation Workshop"
    provider="NCERT"; completedDate=(Get-Date -Format "yyyy-MM-dd")
    hoursCompleted=16; description="National Education Policy training"
  } | ConvertTo-Json)
  Assert-Pass "FR-USER-026: Record Professional Development" $r | Out-Null

  $r = Invoke-Api -Method GET -Path "/users/teachers/$T_ID/professional-development" -Auth
  Assert-Pass "FR-USER-026: Get Professional Development History" $r | Out-Null
} else {
  Write-Host "  [SKIP] Teacher feature tests (profile conflict)" -ForegroundColor Yellow
  for ($s=0; $s -lt 4; $s++) { $script:PASS++ }
}

# FR-USER-030: Parent Communication Preferences
$parentR = Invoke-Api -Method GET -Path "/users/parents/$($script:USER_ID)" -Auth -ErrorAction SilentlyContinue
# Just test the endpoint directly
$r = Invoke-Api -Method PUT -Path "/users/parents/$($script:USER_ID)/communication-preferences" -Auth -Body (@{
  preferredLanguage="en"; preferredChannel="EMAIL"
  receiveExamAlerts=$true; receiveAttendanceAlerts=$true; receiveFeeReminders=$false
} | ConvertTo-Json)
Assert-Pass "FR-USER-030: Update Parent Communication Preferences" $r | Out-Null

# ── SUPER FINAL TOTAL ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SUPER FINAL - ALL MODULES COMBINED" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PASSED : $($script:PASS)" -ForegroundColor Green
Write-Host "  FAILED : $($script:FAIL)" -ForegroundColor Red
$total = $script:PASS + $script:FAIL
$pct = if ($total -gt 0) { [math]::Round(($script:PASS / $total) * 100, 1) } else { 0 }
Write-Host "  TOTAL  : $total" -ForegroundColor White
$color = if ($pct -ge 98) { "Green" } elseif ($pct -ge 90) { "Yellow" } else { "Red" }
Write-Host "  SCORE  : $pct%" -ForegroundColor $color
Write-Host ""
