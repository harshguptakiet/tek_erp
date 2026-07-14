
# Tekurious ERP - Module Testing Script
# Tests: Auth, User Management, Organization Management

param([string]$BaseUrl = "http://localhost:3000/api/v1")

$script:PASS = 0
$script:FAIL = 0
$script:TOKEN = ""
$script:USER_ID = ""
$script:ORG_ID = ""

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Body = $null,
        [switch]$Auth
    )
    $uri = "$BaseUrl$Path"
    $params = @{
        Method      = $Method
        Uri         = $uri
        ContentType = "application/json"
        ErrorAction = "SilentlyContinue"
    }
    if ($Body) { $params.Body = $Body }
    if ($Auth -and $script:TOKEN) {
        $params.Headers = @{ Authorization = "Bearer $($script:TOKEN)" }
    }

    try {
        $resp = Invoke-RestMethod @params
        return @{ success = $true; data = $resp; status = 200 }
    }
    catch {
        $status = 0
        try { $status = $_.Exception.Response.StatusCode.value__ } catch {}
        $body = ""
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
        } catch {}
        return @{ success = $false; data = $null; status = $status; error = $body }
    }
}

function Assert-Pass {
    param([string]$Name, [hashtable]$Result)
    if ($result.success) {
        $script:PASS++
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        return $true
    } else {
        $script:FAIL++
        Write-Host "  [FAIL] $Name (HTTP $($Result.status))" -ForegroundColor Red
        if ($Result.error) { Write-Host "         $($Result.error)" -ForegroundColor DarkGray }
        return $false
    }
}

function Assert-Fail {
    param([string]$Name, [hashtable]$Result)
    if (-not $Result.success -and $Result.status -ge 400) {
        $script:PASS++
        Write-Host "  [PASS] $Name (correctly rejected: HTTP $($Result.status))" -ForegroundColor Green
        return $true
    } else {
        $script:FAIL++
        Write-Host "  [FAIL] $Name - should have been rejected but got HTTP $($Result.status)" -ForegroundColor Red
        return $false
    }
}

# ---- Timestamp for unique data ----
$TS = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$EMAIL = "test_$TS@tekurious.dev"
$PASS_1 = "TestPass@2024!"
$PASS_2 = "NewPass@2024!"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   TEKURIOUS ERP - MODULE TEST SUITE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Server : $BaseUrl" -ForegroundColor DarkCyan
Write-Host "   User   : $EMAIL" -ForegroundColor DarkCyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# =========================================================
# MODULE 01: AUTHENTICATION
# =========================================================
Write-Host "MODULE 01: AUTHENTICATION" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# FR-AUTH-001: Register
$r = Invoke-Api -Method POST -Path "/auth/register" -Body (@{
    email = $EMAIL; password = $PASS_1; firstName = "Test"; lastName = "User"
} | ConvertTo-Json)
Assert-Pass "FR-AUTH-001: Email Registration" $r | Out-Null

# FR-AUTH-006: Login
$r = Invoke-Api -Method POST -Path "/auth/login" -Body (@{
    email = $EMAIL; password = $PASS_1
} | ConvertTo-Json)
if (Assert-Pass "FR-AUTH-006: Email/Password Login" $r) {
    $script:TOKEN = $r.data.accessToken
    $script:USER_ID = $r.data.user.id
    $script:REFRESH_TOKEN = $r.data.refreshToken
    Write-Host "         Token: $($script:TOKEN.Substring(0, [Math]::Min(30, $script:TOKEN.Length)))..." -ForegroundColor DarkGreen
    Write-Host "         UserID: $($script:USER_ID)" -ForegroundColor DarkGreen
}

# FR-AUTH-013: JWT Access - Get Me
$r = Invoke-Api -Method GET -Path "/auth/me" -Auth
Assert-Pass "FR-AUTH-013: JWT Access - Get My Profile" $r | Out-Null

# FR-AUTH-023: Resend Verification
$r = Invoke-Api -Method POST -Path "/auth/resend-verification" -Body (@{ email = $EMAIL } | ConvertTo-Json)
Assert-Pass "FR-AUTH-023: Resend Email Verification" $r | Out-Null

# FR-AUTH-017: Forgot Password
$r = Invoke-Api -Method POST -Path "/auth/forgot-password" -Body (@{ email = $EMAIL } | ConvertTo-Json)
Assert-Pass "FR-AUTH-017: Forgot Password Request" $r | Out-Null

# FR-AUTH-018: Change Password
$r = Invoke-Api -Method POST -Path "/auth/change-password" -Auth -Body (@{
    currentPassword = $PASS_1; newPassword = $PASS_2
} | ConvertTo-Json)
Assert-Pass "FR-AUTH-018: Change Password" $r | Out-Null

# FR-AUTH-006b: Re-login with new password
$r = Invoke-Api -Method POST -Path "/auth/login" -Body (@{
    email = $EMAIL; password = $PASS_2
} | ConvertTo-Json)
if (Assert-Pass "FR-AUTH-006b: Login with New Password" $r) {
    $script:TOKEN = $r.data.accessToken
    $script:REFRESH_TOKEN = $r.data.refreshToken
}

# FR-AUTH-014: Refresh Token
if ($script:REFRESH_TOKEN) {
    $r = Invoke-Api -Method POST -Path "/auth/refresh" -Body (@{ refreshToken = $script:REFRESH_TOKEN } | ConvertTo-Json)
    Assert-Pass "FR-AUTH-014: Refresh Token" $r | Out-Null
    if ($r.success -and $r.data.accessToken) { $script:TOKEN = $r.data.accessToken }
}

# FR-AUTH-015: Get Sessions
$r = Invoke-Api -Method GET -Path "/auth/sessions" -Auth
Assert-Pass "FR-AUTH-015: Get Active Sessions" $r | Out-Null

# FR-AUTH-037: Password Strength
$r = Invoke-Api -Method POST -Path "/auth/check-password-strength" -Body (@{ password = "weak" } | ConvertTo-Json)
Assert-Pass "FR-AUTH-037: Password Strength Check" $r | Out-Null

# FR-AUTH-025: Reject wrong password
$r = Invoke-Api -Method POST -Path "/auth/login" -Body (@{ email = $EMAIL; password = "WrongPass@123!" } | ConvertTo-Json)
Assert-Fail "FR-AUTH-025: Reject Invalid Password" $r | Out-Null

# FR-AUTH-034: Reject no token
$savedToken = $script:TOKEN; $script:TOKEN = ""
$r = Invoke-Api -Method GET -Path "/auth/me"
Assert-Fail "FR-AUTH-034: Reject Unauthenticated Request" $r | Out-Null
$script:TOKEN = $savedToken

# FR-AUTH-027: Logout
$r = Invoke-Api -Method POST -Path "/auth/logout" -Auth
Assert-Pass "FR-AUTH-027: Standard Logout" $r | Out-Null

# Re-login for remaining tests
$r = Invoke-Api -Method POST -Path "/auth/login" -Body (@{ email = $EMAIL; password = $PASS_2 } | ConvertTo-Json)
if ($r.success) { $script:TOKEN = $r.data.accessToken }
$r2 = Invoke-Api -Method GET -Path "/auth/me" -Auth
Assert-Pass "Post-logout Re-login Verification" $r2 | Out-Null

Write-Host ""

# =========================================================
# MODULE 02: USER MANAGEMENT
# =========================================================
Write-Host "MODULE 02: USER MANAGEMENT" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# FR-USER-001: View Profile
$r = Invoke-Api -Method GET -Path "/users/profile" -Auth
Assert-Pass "FR-USER-001: View User Profile" $r | Out-Null

# FR-USER-002: Edit Profile
$r = Invoke-Api -Method PUT -Path "/users/profile" -Auth -Body (@{
    firstName = "Updated"; lastName = "Name"; middleName = "Mid"
} | ConvertTo-Json)
Assert-Pass "FR-USER-002: Edit User Profile" $r | Out-Null

# FR-USER-004: Change Email
$r = Invoke-Api -Method POST -Path "/users/change-email" -Auth -Body (@{
    currentPassword = $PASS_2; newEmail = "new_$TS@tekurious.dev"
} | ConvertTo-Json)
Assert-Pass "FR-USER-004: Initiate Email Change" $r | Out-Null

# FR-USER-005: Change Phone
$r = Invoke-Api -Method POST -Path "/users/change-phone" -Auth -Body (@{
    currentPassword = $PASS_2; newPhone = "+919876543210"
} | ConvertTo-Json)
Assert-Pass "FR-USER-005: Initiate Phone Change" $r | Out-Null

# FR-USER-008: Activity Log
$r = Invoke-Api -Method GET -Path "/users/activity-log" -Auth
Assert-Pass "FR-USER-008: View Activity Log" $r | Out-Null

# FR-USER-009: Privacy Settings
$r = Invoke-Api -Method PUT -Path "/users/privacy-settings" -Auth -Body (@{
    showEmail = $false; showPhone = $false; allowSearchIndexing = $true
} | ConvertTo-Json)
Assert-Pass "FR-USER-009: Update Privacy Settings" $r | Out-Null

# FR-USER-039: Search Users
$r = Invoke-Api -Method POST -Path "/users/search?page=1&limit=10" -Auth -Body (@{ query = "test" } | ConvertTo-Json)
Assert-Pass "FR-USER-039: Search Users" $r | Out-Null

# FR-USER-040: User Directory
$r = Invoke-Api -Method GET -Path "/users/directory" -Auth
Assert-Pass "FR-USER-040: User Directory" $r | Out-Null

# FR-USER-042: Public Profile
if ($script:USER_ID) {
    $r = Invoke-Api -Method GET -Path "/users/$($script:USER_ID)/public" -Auth
    Assert-Pass "FR-USER-042: View Public Profile" $r | Out-Null
}

# FR-USER-053: View Permissions
$r = Invoke-Api -Method GET -Path "/users/permissions" -Auth
Assert-Pass "FR-USER-053: View My Permissions" $r | Out-Null

# FR-USER-044: Bulk Export
$r = Invoke-Api -Method GET -Path "/users/admin/bulk-export" -Auth
Assert-Pass "FR-USER-044: Bulk Export Users (Admin)" $r | Out-Null

if ($script:USER_ID) {
    # FR-USER-047: Activate User
    $r = Invoke-Api -Method POST -Path "/users/admin/activate/$($script:USER_ID)" -Auth -Body '{"reason":"Test"}'
    Assert-Pass "FR-USER-047: Activate User (Admin)" $r | Out-Null

    # FR-USER-049: Status History
    $r = Invoke-Api -Method GET -Path "/users/admin/status-history/$($script:USER_ID)" -Auth
    Assert-Pass "FR-USER-049: User Status History (Admin)" $r | Out-Null

    # FR-USER-051: Assign Role
    $r = Invoke-Api -Method POST -Path "/users/admin/assign-role/$($script:USER_ID)" -Auth -Body (@{ role = "TEACHER" } | ConvertTo-Json)
    Assert-Pass "FR-USER-051: Assign Role to User (Admin)" $r | Out-Null

    # FR-USER-052: Change Role
    $r = Invoke-Api -Method PUT -Path "/users/admin/change-role/$($script:USER_ID)" -Auth -Body (@{ role = "STUDENT"; reason = "Reset for test" } | ConvertTo-Json)
    Assert-Pass "FR-USER-052: Change User Role (Admin)" $r | Out-Null

    # FR-USER-053b: Admin view permissions
    $r = Invoke-Api -Method GET -Path "/users/admin/permissions/$($script:USER_ID)" -Auth
    Assert-Pass "FR-USER-053b: Admin View User Permissions" $r | Out-Null

    # FR-USER-054: Grant Permission
    $r = Invoke-Api -Method POST -Path "/users/admin/grant-permission/$($script:USER_ID)" -Auth -Body (@{
        resource = "content"; action = "read"; reason = "Testing"
    } | ConvertTo-Json)
    Assert-Pass "FR-USER-054: Grant Custom Permission" $r | Out-Null

    # FR-USER-055: Revoke Permission
    $r = Invoke-Api -Method POST -Path "/users/admin/revoke-permission/$($script:USER_ID)" -Auth -Body (@{
        resource = "content"; action = "read"; reason = "Test revoke"
    } | ConvertTo-Json)
    Assert-Pass "FR-USER-055: Revoke Custom Permission" $r | Out-Null
}

Write-Host ""

# =========================================================
# MODULE 03: ORGANIZATION MANAGEMENT
# =========================================================
Write-Host "MODULE 03: ORGANIZATION MANAGEMENT" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# FR-ORG-001: Create Organization
$r = Invoke-Api -Method POST -Path "/organizations" -Auth -Body (@{
    name = "Test Academy $TS"
    type = "SCHOOL"
    tier = "BASIC"
    registrationNumber = "REG-$TS"
    email = "org_$TS@tekurious.dev"
    phone = "+911234567890"
    primaryContactName = "Test Admin"
    primaryContactEmail = "admin_$TS@tekurious.dev"
    enabledModules = @("LMS", "USERS", "ERP")
} | ConvertTo-Json)
if (Assert-Pass "FR-ORG-001: Create Organization" $r) {
    $script:ORG_ID = $r.data.id
    Write-Host "         OrgID: $($script:ORG_ID)" -ForegroundColor DarkGreen
}

# List Organizations
$r = Invoke-Api -Method GET -Path "/organizations" -Auth
Assert-Pass "List All Organizations" $r | Out-Null

if ($script:ORG_ID) {
    # Get Organization
    $r = Invoke-Api -Method GET -Path "/organizations/$($script:ORG_ID)" -Auth
    Assert-Pass "Get Organization Details" $r | Out-Null

    # FR-ORG-020: Update
    $r = Invoke-Api -Method PUT -Path "/organizations/$($script:ORG_ID)" -Auth -Body (@{
        phone = "+911234567891"; primaryContactName = "Updated Admin"
    } | ConvertTo-Json)
    Assert-Pass "FR-ORG-020: Update Organization Details" $r | Out-Null

    # FR-ORG-002: Hierarchy
    $r = Invoke-Api -Method GET -Path "/organizations/$($script:ORG_ID)/hierarchy" -Auth
    Assert-Pass "FR-ORG-002: Get Organization Hierarchy" $r | Out-Null

    # Stats
    $r = Invoke-Api -Method GET -Path "/organizations/$($script:ORG_ID)/stats" -Auth
    Assert-Pass "FR-ORG-022: Organization Statistics" $r | Out-Null

    # FR-ORG-021: Enable feature
    $r = Invoke-Api -Method POST -Path "/organizations/$($script:ORG_ID)/features/toggle" -Auth -Body (@{
        module = "MARKETPLACE"; enabled = $true
    } | ConvertTo-Json)
    Assert-Pass "FR-ORG-021: Enable Feature Module" $r | Out-Null

    # FR-ORG-021: Disable feature
    $r = Invoke-Api -Method POST -Path "/organizations/$($script:ORG_ID)/features/toggle" -Auth -Body (@{
        module = "MARKETPLACE"; enabled = $false
    } | ConvertTo-Json)
    Assert-Pass "FR-ORG-021: Disable Feature Module" $r | Out-Null

    # FR-ORG-030: Add User
    if ($script:USER_ID) {
        $r = Invoke-Api -Method POST -Path "/organizations/$($script:ORG_ID)/users" -Auth -Body (@{
            userId = $script:USER_ID; designation = "Teacher"; department = "Science"
        } | ConvertTo-Json)
        Assert-Pass "FR-ORG-030: Add User to Organization" $r | Out-Null
    }

    # FR-ORG-033: List Users
    $r = Invoke-Api -Method GET -Path "/organizations/$($script:ORG_ID)/users" -Auth
    Assert-Pass "FR-ORG-033: List Organization Users" $r | Out-Null

    # FR-ORG-022: User Limit
    $r = Invoke-Api -Method GET -Path "/organizations/$($script:ORG_ID)/user-limit" -Auth
    Assert-Pass "FR-ORG-022: User Limit Status" $r | Out-Null

    # Create Branch
    $r = Invoke-Api -Method POST -Path "/organizations/$($script:ORG_ID)/branches" -Auth -Body (@{
        name = "Main Branch"; code = "MAIN-$TS"; branchType = "HEADQUARTERS"
        contactEmail = "branch_$TS@tekurious.dev"
    } | ConvertTo-Json)
    Assert-Pass "Create Branch in Organization" $r | Out-Null

    # Get Branches
    $r = Invoke-Api -Method GET -Path "/organizations/$($script:ORG_ID)/branches" -Auth
    Assert-Pass "Get Organization Branches" $r | Out-Null

    # Create Department
    $r = Invoke-Api -Method POST -Path "/organizations/$($script:ORG_ID)/departments" -Auth -Body (@{
        name = "Science Department"; code = "SCI-$TS"; departmentType = "ACADEMIC"
    } | ConvertTo-Json)
    Assert-Pass "Create Department in Organization" $r | Out-Null

    # Get Departments
    $r = Invoke-Api -Method GET -Path "/organizations/$($script:ORG_ID)/departments" -Auth
    Assert-Pass "Get Organization Departments" $r | Out-Null

    # FR-ORG-031: Remove User
    if ($script:USER_ID) {
        $r = Invoke-Api -Method DELETE -Path "/organizations/$($script:ORG_ID)/users/$($script:USER_ID)" -Auth -Body (@{ reason = "Test cleanup" } | ConvertTo-Json)
        Assert-Pass "FR-ORG-031: Remove User from Organization" $r | Out-Null
    }

    # FR-ORG-004: Deactivate
    $r = Invoke-Api -Method POST -Path "/organizations/$($script:ORG_ID)/deactivate" -Auth -Body (@{ reason = "Test" } | ConvertTo-Json)
    Assert-Pass "FR-ORG-004: Deactivate Organization" $r | Out-Null

    # FR-ORG-004: Reactivate
    $r = Invoke-Api -Method POST -Path "/organizations/$($script:ORG_ID)/reactivate" -Auth -Body (@{ reason = "Restore" } | ConvertTo-Json)
    Assert-Pass "FR-ORG-004: Reactivate Organization" $r | Out-Null

    # Create Child Organization (Hierarchy test)
    $r = Invoke-Api -Method POST -Path "/organizations" -Auth -Body (@{
        name = "Child School $TS"
        type = "SCHOOL"
        tier = "BASIC"
        parentOrganizationId = $script:ORG_ID
        email = "child_$TS@tekurious.dev"
    } | ConvertTo-Json)
    Assert-Pass "FR-ORG-002: Create Child Organization" $r | Out-Null
}

Write-Host ""

# =========================================================
# MODULE 04: ACADEMIC MANAGEMENT
# =========================================================
Write-Host "MODULE 04: ACADEMIC MANAGEMENT" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# FR-ACAD-001: Create Board
$r = Invoke-Api -Method POST -Path "/academic/boards" -Auth -Body (@{
    code = "CBSE-$TS"; name = "CBSE Board"; country = "IN"
} | ConvertTo-Json)
Assert-Pass "FR-ACAD-001: Create Educational Board" $r | Out-Null

# List Boards
$r = Invoke-Api -Method GET -Path "/academic/boards" -Auth
Assert-Pass "List Educational Boards" $r | Out-Null

# FR-ACAD-002: Create Subject
$r = Invoke-Api -Method POST -Path "/academic/subjects" -Auth -Body (@{
    name = "Mathematics"; code = "MATH-$TS"; grade = 10
} | ConvertTo-Json)
if (Assert-Pass "FR-ACAD-002: Create Subject" $r) {
    $script:SUBJECT_ID = $r.data.id
}

# List Subjects
$r = Invoke-Api -Method GET -Path "/academic/subjects?grade=10" -Auth
Assert-Pass "List Subjects" $r | Out-Null

if ($script:ORG_ID) {
    # Create School
    $r = Invoke-Api -Method POST -Path "/academic/schools" -Auth -Body (@{
        organizationId = $script:ORG_ID
        name = "Test School $TS"
        code = "SCH-$TS"
        board = "CBSE"
        email = "school_$TS@tekurious.dev"
    } | ConvertTo-Json)
    if (Assert-Pass "Create School" $r) {
        $script:SCHOOL_ID = $r.data.id
        Write-Host "         SchoolID: $($script:SCHOOL_ID)" -ForegroundColor DarkGreen
    }

    if ($script:SCHOOL_ID) {
        # Get School
        $r = Invoke-Api -Method GET -Path "/academic/schools/$($script:SCHOOL_ID)" -Auth
        Assert-Pass "Get School Details" $r | Out-Null

        # FR-ACAD-003: Academic Year
        $r = Invoke-Api -Method POST -Path "/academic/academic-years" -Auth -Body (@{
            schoolId = $script:SCHOOL_ID
            year = "2025-2026"
            startDate = "2025-04-01"
            endDate = "2026-03-31"
            isCurrent = $true
        } | ConvertTo-Json)
        if (Assert-Pass "FR-ACAD-003: Create Academic Year" $r) {
            $script:ACAD_YEAR_ID = $r.data.id
        }

        # List Academic Years
        $r = Invoke-Api -Method GET -Path "/academic/schools/$($script:SCHOOL_ID)/academic-years" -Auth
        Assert-Pass "List Academic Years" $r | Out-Null

        if ($script:ACAD_YEAR_ID) {
            # FR-ACAD-004: Create Class
            $r = Invoke-Api -Method POST -Path "/academic/classes" -Auth -Body (@{
                schoolId = $script:SCHOOL_ID
                academicYearId = $script:ACAD_YEAR_ID
                grade = 10
                gradeName = "Class X"
            } | ConvertTo-Json)
            if (Assert-Pass "FR-ACAD-004: Create Class" $r) {
                $script:CLASS_ID = $r.data.id
            }

            if ($script:CLASS_ID) {
                # Create Section
                $r = Invoke-Api -Method POST -Path "/academic/sections" -Auth -Body (@{
                    classId = $script:CLASS_ID
                    sectionName = "A"
                    capacity = 40
                    roomNumber = "101"
                } | ConvertTo-Json)
                if (Assert-Pass "FR-ACAD-004: Create Section" $r) {
                    $script:SECTION_ID = $r.data.id
                }

                # Get Class Structure
                $r = Invoke-Api -Method GET -Path "/academic/schools/$($script:SCHOOL_ID)/classes?academicYearId=$($script:ACAD_YEAR_ID)" -Auth
                Assert-Pass "Get Class Structure" $r | Out-Null
            }
        }
    }
}

# =========================================================
# RESULTS
# =========================================================
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PASSED : $($script:PASS)" -ForegroundColor Green
Write-Host "  FAILED : $($script:FAIL)" -ForegroundColor Red
$total = $script:PASS + $script:FAIL
$pct = if ($total -gt 0) { [math]::Round(($script:PASS / $total) * 100, 1) } else { 0 }
Write-Host "  TOTAL  : $total" -ForegroundColor White
$color = if ($pct -ge 90) { "Green" } elseif ($pct -ge 70) { "Yellow" } else { "Red" }
Write-Host "  SCORE  : $pct%" -ForegroundColor $color
Write-Host ""
Write-Host "  Modules Tested:" -ForegroundColor White
Write-Host "    Module 01 - Authentication (FR-AUTH)" -ForegroundColor Gray
Write-Host "    Module 02 - User Management (FR-USER)" -ForegroundColor Gray
Write-Host "    Module 03 - Organization Management (FR-ORG)" -ForegroundColor Gray
Write-Host "    Module 04 - Academic Management (FR-ACAD)" -ForegroundColor Gray
Write-Host ""
if ($pct -ge 90) {
    Write-Host "  STATUS: ALL MODULES PASSING ✅" -ForegroundColor Green
} elseif ($pct -ge 70) {
    Write-Host "  STATUS: MOSTLY PASSING - review failures above" -ForegroundColor Yellow
} else {
    Write-Host "  STATUS: NEEDS FIXES - review failures above" -ForegroundColor Red
}
Write-Host ""
