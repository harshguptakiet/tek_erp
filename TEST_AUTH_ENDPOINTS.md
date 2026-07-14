# Authentication Module - API Testing Guide

This document provides curl-like PowerShell commands to test all authentication endpoints.

## Prerequisites
- Server running on `http://localhost:3000`
- PostgreSQL database connected
- Valid tenant ID (use existing or create one)

---

## 1. Register New User

```powershell
$body = @"
{
  "email": "testuser@tekurious.com",
  "password": "TestPass123!@",
  "firstName": "Test",
  "lastName": "User",
  "phone": "9876543210",
  "tenantId": "25a84690-1fb0-4b19-9b2d-6aba6edf25bb"
}
"@

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response** (201):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "testuser@tekurious.com",
    "firstName": "Test",
    "lastName": "User",
    "tenantId": "uuid",
    "roles": []
  }
}
```

**Note**: Check server logs for verification token!

---

## 2. Verify Email

```powershell
# Get token from server logs after registration
$body = '{"token":"PASTE_VERIFICATION_TOKEN_HERE"}'

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/verify-email" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response** (200):
```json
{
  "message": "Email verified successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. Login

```powershell
$body = @"
{
  "email": "testuser@tekurious.com",
  "password": "TestPass123!@"
}
"@

$response = Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json

# Save token for later
$token = ($response.Content | ConvertFrom-Json).accessToken
```

**Expected Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "testuser@tekurious.com",
    "firstName": "Test",
    "lastName": "User",
    "tenantId": "uuid",
    "roles": []
  }
}
```

---

## 4. Get Current User Profile

```powershell
# Use token from login
$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/me" `
  -Method GET `
  -Headers $headers
```

**Expected Response** (200):
```json
{
  "id": "uuid",
  "email": "testuser@tekurious.com",
  "tenantId": "uuid",
  "roles": []
}
```

---

## 5. Change Password

```powershell
$body = @"
{
  "currentPassword": "TestPass123!@",
  "newPassword": "NewPass456!@"
}
"@

$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/change-password" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $body
```

**Expected Response** (200):
```json
{
  "message": "Password changed successfully"
}
```

---

## 6. Refresh Token

```powershell
$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/refresh" `
  -Method POST `
  -Headers $headers
```

**Expected Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 7. Forgot Password

```powershell
$body = '{"email":"testuser@tekurious.com"}'

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/forgot-password" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response** (200):
```json
{
  "message": "If an account with that email exists, you will receive a password reset link."
}
```

**Note**: Check server logs for reset token!

---

## 8. Reset Password

```powershell
# Get token from server logs after forgot password
$body = @"
{
  "token": "PASTE_RESET_TOKEN_HERE",
  "newPassword": "ResetPass789!@"
}
"@

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/reset-password" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response** (200):
```json
{
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

---

## 9. Resend Verification Email

```powershell
$body = '{"email":"testuser@tekurious.com"}'

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/resend-verification" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response** (200):
```json
{
  "message": "If your email is registered, you will receive a verification link."
}
```

---

## 10. Logout

```powershell
$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/logout" `
  -Method POST `
  -Headers $headers
```

**Expected Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

## Testing Rate Limiting

### Test Login Rate Limit (5 per minute)

```powershell
$body = '{"email":"test@example.com","password":"wrong"}'

# Make 6 rapid requests
for ($i=1; $i -le 6; $i++) {
  Write-Host "Request $i"
  try {
    Invoke-WebRequest -UseBasicParsing `
      -Uri "http://localhost:3000/api/v1/auth/login" `
      -Method POST `
      -ContentType "application/json" `
      -Body $body | Select-Object -ExpandProperty StatusCode
  } catch {
    Write-Host "Error: $($_.Exception.Message)"
  }
}
```

**Expected**: First 5 succeed (or return 401), 6th returns **429 Too Many Requests**

---

## Testing Account Lockout

```powershell
# Try to login 6 times with wrong password
$body = '{"email":"testuser@tekurious.com","password":"WrongPassword123!@"}'

for ($i=1; $i -le 6; $i++) {
  Write-Host "Login attempt $i"
  try {
    Invoke-WebRequest -UseBasicParsing `
      -Uri "http://localhost:3000/api/v1/auth/login" `
      -Method POST `
      -ContentType "application/json" `
      -Body $body
  } catch {
    Write-Host $_.Exception.Response.StatusCode
  }
  Start-Sleep -Seconds 1
}
```

**Expected**: 
- Attempts 1-4: Return 401 (Invalid credentials)
- Attempt 5: Returns 401 and locks account
- Attempt 6+: Returns 401 with "Account is temporarily locked" message

---

## Error Cases

### 1. Invalid Token
```powershell
$headers = @{ "Authorization" = "Bearer invalid-token" }
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/me" `
  -Headers $headers
```
**Expected**: 401 Unauthorized

### 2. Duplicate Email
```powershell
# Register same email twice
$body = '{"email":"testuser@tekurious.com","password":"Test123!@","firstName":"Test","lastName":"User","phone":"1234567890","tenantId":"25a84690-1fb0-4b19-9b2d-6aba6edf25bb"}'

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```
**Expected**: 400 Bad Request - "User with this email already exists"

### 3. Weak Password
```powershell
$body = '{"email":"weak@example.com","password":"weak","firstName":"Test","lastName":"User","phone":"1111111111","tenantId":"25a84690-1fb0-4b19-9b2d-6aba6edf25bb"}'

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```
**Expected**: 400 Bad Request - Password validation error

---

## Complete Test Flow

```powershell
# 1. Register
$registerBody = '{"email":"flowtest@tekurious.com","password":"FlowTest123!@","firstName":"Flow","lastName":"Test","phone":"5555555555","tenantId":"25a84690-1fb0-4b19-9b2d-6aba6edf25bb"}'
$registerResponse = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/v1/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
$registerData = $registerResponse.Content | ConvertFrom-Json
Write-Host "✅ Registered: $($registerData.user.email)"

# 2. Get verification token from logs (manual step)
Write-Host "⚠️  Check server logs for verification token"
$verificationToken = Read-Host "Paste verification token"

# 3. Verify email
$verifyBody = "{`"token`":`"$verificationToken`"}"
$verifyResponse = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/v1/auth/verify-email" -Method POST -ContentType "application/json" -Body $verifyBody
Write-Host "✅ Email verified"

# 4. Login
$loginBody = '{"email":"flowtest@tekurious.com","password":"FlowTest123!@"}'
$loginResponse = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.accessToken
Write-Host "✅ Logged in"

# 5. Get profile
$headers = @{ "Authorization" = "Bearer $token" }
$profileResponse = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/v1/auth/me" -Headers $headers
Write-Host "✅ Profile retrieved"

# 6. Change password
$changePasswordBody = '{"currentPassword":"FlowTest123!@","newPassword":"NewFlow456!@"}'
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/v1/auth/change-password" -Method POST -ContentType "application/json" -Headers $headers -Body $changePasswordBody
Write-Host "✅ Password changed"

# 7. Logout
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/v1/auth/logout" -Method POST -Headers $headers
Write-Host "✅ Logged out"

Write-Host "`n🎉 All tests passed!"
```

---

## Security Headers Check

```powershell
# Check security headers
$response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test","password":"test"}'

Write-Host "Security Headers:"
$response.Headers.GetEnumerator() | Where-Object { $_.Key -like "*Security*" -or $_.Key -like "X-*" -or $_.Key -like "*Policy*" } | ForEach-Object {
  Write-Host "$($_.Key): $($_.Value)"
}
```

**Expected Headers**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0`
- `Strict-Transport-Security`
- `Content-Security-Policy`

---

## Notes

1. **Rate Limits**: Wait for rate limit windows to expire between tests
2. **Tokens**: Save tokens from server logs when testing verification/reset flows
3. **Tenant ID**: Use a valid tenant ID from your database
4. **Phone Numbers**: Must be unique in the database
5. **Email**: Must be unique in the database

---

## Troubleshooting

### "Too Many Requests" (429)
- Wait for rate limit window to expire
- Use different endpoints or wait

### "Account is temporarily locked"
- Wait 15 minutes for automatic unlock
- Or manually reset in database: `UPDATE users SET "failedLoginAttempts"=0, "lockedUntil"=NULL WHERE email='...'`

### "Invalid or expired token"
- Generate new token (forgot-password or resend-verification)
- Check token hasn't expired (verification: 24h, reset: 1h)

### Server not responding
- Check if server is running: `npm run serve`
- Check database connection
- Check logs: `get_process_output` or check terminal
