# Testing Checklist - Authentication Module

**Module**: Authentication  
**Status**: Ready for Testing  
**Date**: July 10, 2026

---

## ⚙️ Pre-Testing Setup

### Step 1: Start Docker Desktop
- [ ] Open Docker Desktop application
- [ ] Wait for Docker to fully start
- [ ] Verify Docker is running: `docker ps` (should not error)

### Step 2: Start Infrastructure
```bash
cd c:\teach\tekurious
docker-compose up -d
```

- [ ] PostgreSQL container started
- [ ] Redis container started
- [ ] Verify containers: `docker ps` (should show 2 containers)

### Step 3: Run Database Migrations
```bash
npx prisma migrate dev --name init
```

- [ ] Migration files created
- [ ] All 268 tables created in database
- [ ] No errors in migration output

### Step 4: Generate Prisma Client (if needed)
```bash
npx prisma generate
```

- [ ] Prisma Client generated successfully

### Step 5: Start Development Server
```bash
npm run serve
```

- [ ] Server starts without errors
- [ ] Message: "Tekurious ERP is running on: http://localhost:3000/api/v1"
- [ ] Database connected message appears

---

## 🧪 API Testing

### Test 1: Health Check
```bash
curl http://localhost:3000/api/v1
```

**Expected**: Should return app info or error message (since we haven't created a root endpoint)

**Result**: ☐ Pass ☐ Fail

---

### Test 2: Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@tekurious.com\",\"password\":\"Admin@123\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"phone\":\"9876543210\"}"
```

**Expected Response**:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "cm...",
    "email": "admin@tekurious.com",
    "firstName": "Admin",
    "lastName": "User",
    "tenantId": null,
    "roles": []
  }
}
```

**Checklist**:
- [ ] Status Code: 201 Created
- [ ] accessToken is a JWT string
- [ ] user object contains all fields
- [ ] User created in database

**Result**: ☐ Pass ☐ Fail

**Notes**: _______________________________________

---

### Test 3: Register Duplicate User (Should Fail)
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@tekurious.com\",\"password\":\"Admin@123\",\"firstName\":\"Admin\",\"lastName\":\"User\"}"
```

**Expected Response**:
```json
{
  "statusCode": 400,
  "message": "User with this email already exists",
  "error": "Bad Request"
}
```

**Checklist**:
- [ ] Status Code: 400 Bad Request
- [ ] Error message is clear

**Result**: ☐ Pass ☐ Fail

---

### Test 4: Register with Weak Password (Should Fail)
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"weak@tekurious.com\",\"password\":\"123\",\"firstName\":\"Weak\",\"lastName\":\"Pass\"}"
```

**Expected**: Validation error about password strength

**Checklist**:
- [ ] Status Code: 400 Bad Request
- [ ] Error mentions password requirements

**Result**: ☐ Pass ☐ Fail

---

### Test 5: Login with Correct Credentials
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@tekurious.com\",\"password\":\"Admin@123\"}"
```

**Expected**: Same as registration response (accessToken + user)

**Checklist**:
- [ ] Status Code: 200 OK
- [ ] accessToken returned
- [ ] user object returned

**Result**: ☐ Pass ☐ Fail

**Save the access token for next tests**: _______________________________________

---

### Test 6: Login with Wrong Password (Should Fail)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@tekurious.com\",\"password\":\"WrongPass@123\"}"
```

**Expected**:
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**Checklist**:
- [ ] Status Code: 401 Unauthorized
- [ ] Error message is clear

**Result**: ☐ Pass ☐ Fail

---

### Test 7: Get Current User (Protected Route)
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token from Test 5.

**Expected Response**:
```json
{
  "id": "cm...",
  "email": "admin@tekurious.com",
  "tenantId": null,
  "roles": []
}
```

**Checklist**:
- [ ] Status Code: 200 OK
- [ ] User details returned
- [ ] Matches logged-in user

**Result**: ☐ Pass ☐ Fail

---

### Test 8: Access Protected Route Without Token (Should Fail)
```bash
curl -X GET http://localhost:3000/api/v1/auth/me
```

**Expected**:
```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "error": "Unauthorized"
}
```

**Checklist**:
- [ ] Status Code: 401 Unauthorized
- [ ] Error message about authentication

**Result**: ☐ Pass ☐ Fail

---

### Test 9: Change Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"currentPassword\":\"Admin@123\",\"newPassword\":\"NewAdmin@123\"}"
```

**Expected Response**:
```json
{
  "message": "Password changed successfully"
}
```

**Checklist**:
- [ ] Status Code: 200 OK
- [ ] Success message returned

**Result**: ☐ Pass ☐ Fail

---

### Test 10: Login with New Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@tekurious.com\",\"password\":\"NewAdmin@123\"}"
```

**Expected**: Should successfully login

**Checklist**:
- [ ] Status Code: 200 OK
- [ ] New access token returned

**Result**: ☐ Pass ☐ Fail

---

### Test 11: Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**:
```json
{
  "accessToken": "eyJhbGc..."
}
```

**Checklist**:
- [ ] Status Code: 200 OK
- [ ] New access token returned

**Result**: ☐ Pass ☐ Fail

---

### Test 12: Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**:
```json
{
  "message": "Logged out successfully"
}
```

**Checklist**:
- [ ] Status Code: 200 OK
- [ ] Success message returned

**Result**: ☐ Pass ☐ Fail

---

## 🗄️ Database Verification

### Check Data in Prisma Studio
```bash
npx prisma studio
```

Opens at: http://localhost:5555

**Verify**:
- [ ] User table has records
- [ ] UserAuthentication table has password hashes (not plain text)
- [ ] UserProfile table has profile data
- [ ] LoginAttempt table has login records

---

## 📊 Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Health Check | ☐ | |
| 2 | Register User | ☐ | |
| 3 | Duplicate Registration | ☐ | |
| 4 | Weak Password | ☐ | |
| 5 | Login Success | ☐ | |
| 6 | Login Failure | ☐ | |
| 7 | Get Current User | ☐ | |
| 8 | No Token Access | ☐ | |
| 9 | Change Password | ☐ | |
| 10 | Login New Password | ☐ | |
| 11 | Refresh Token | ☐ | |
| 12 | Logout | ☐ | |

**Total Tests**: 12  
**Passed**: ___  
**Failed**: ___  
**Success Rate**: ___%

---

## 🐛 Issues Found

### Issue 1
**Test**: _________________  
**Description**: _________________  
**Error Message**: _________________  
**Resolution**: _________________

### Issue 2
**Test**: _________________  
**Description**: _________________  
**Error Message**: _________________  
**Resolution**: _________________

---

## ✅ Sign-Off

- [ ] All tests passed
- [ ] Database verified
- [ ] No console errors
- [ ] Documentation updated
- [ ] Ready for Users Module

**Tested By**: _________________  
**Date**: _________________  
**Status**: ☐ Approved ☐ Needs Fixes

---

## 🔧 Useful Commands

### Check Docker Status
```bash
docker ps
docker logs tekurious_postgres
docker logs tekurious_redis
```

### Database Commands
```bash
npx prisma studio          # Open database GUI
npx prisma generate        # Regenerate Prisma Client
npx prisma migrate reset   # Reset database (DANGER!)
```

### Development Server
```bash
npm run serve              # Start server
npm run lint               # Check code quality
npm run format             # Format code
npm test                   # Run tests
```

---

**Good luck with testing! 🚀**

If all tests pass, you're ready to move to Week 2: Users Module!
