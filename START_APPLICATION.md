# Tekurious ERP - Application Startup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- PostgreSQL running on port 5432
- Redis running on port 6379 (optional, for caching)

### Step 1: Environment Configuration

Ensure `.env` file exists in the root (`tekurious/.env`) with:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tekurious_db"
PORT=3333
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
NODE_ENV=development
```

### Step 2: Database Setup

```bash
cd tekurious

# Install dependencies (if not already done)
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed database with test data
npx prisma db seed
```

### Step 3: Start Backend Server

```bash
cd tekurious

# Start backend on port 3333
npm run dev
```

Backend will be available at: `http://localhost:3333/api/v1`

### Step 4: Start Frontend Server

Open a NEW terminal window:

```bash
cd tekurious

# Start frontend on port 3000
npx nx serve web
```

Frontend will be available at: `http://localhost:3000`

### Step 5: Test Connectivity

Navigate to: `http://localhost:3000/test/api`

This page will test:
- ✅ Backend connection
- ✅ Database connection
- ✅ Auth endpoints
- ✅ API endpoints

---

## 🔧 Troubleshooting

### Backend Won't Start

**Issue**: Port 3333 already in use
```bash
# Windows - Find and kill process
netstat -ano | findstr :3333
taskkill /PID <PID> /F
```

**Issue**: Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database `tekurious_db` exists
```sql
CREATE DATABASE tekurious_db;
```

### Frontend Can't Connect to Backend

**Issue**: CORS errors
- Verify backend is running on port 3333
- Check FRONTEND_URL in backend .env is `http://localhost:3000`
- Backend CORS is configured to allow frontend origin

**Issue**: 401 Unauthorized
- No users exist in database
- Create a test user manually or use seed script

### Create Test User Manually

```bash
# Connect to PostgreSQL
psql -U postgres -d tekurious_db

# Create test user (password: password123)
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$YourHashedPasswordHere',
  'Admin',
  'User',
  'SUPER_ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
);
```

Or use bcrypt to hash password:
```bash
npm install -g bcryptjs
node -e "console.log(require('bcryptjs').hashSync('password123', 10))"
```

---

## 📊 Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Port 3000)                  │
│                                                           │
│  Next.js 15 + React + TanStack Query                    │
│  ├── App Router (/app)                                   │
│  ├── Components (/components)                            │
│  ├── Services (/services) - API calls                   │
│  ├── Stores (/stores) - Zustand state                   │
│  └── Hooks (/hooks) - React hooks                       │
│                                                           │
│  Environment: apps/web/.env.local                        │
│  Config: NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1│
└─────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Port 3333)                   │
│                                                           │
│  NestJS + Prisma ORM                                    │
│  ├── API Prefix: /api/v1                                │
│  ├── Auth Module - JWT + Passport                       │
│  ├── 17 Service Modules (758 endpoints)                 │
│  ├── CORS: Enabled for localhost:3000                   │
│  └── Validation: class-validator pipes                  │
│                                                           │
│  Environment: .env                                       │
│  Config: PORT=3333, DATABASE_URL, JWT_SECRET            │
└─────────────────────────────────────────────────────────┘
                            ↓ SQL
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL (Port 5432)                  │
│                                                           │
│  Database: tekurious_db                                  │
│  Schema: Prisma migrations                              │
│  Tables: 100+ tables across all modules                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

1. **Login Request**
   - Frontend sends POST to `/api/v1/auth/login` with email/password
   - Backend validates credentials
   - Returns: `{ user: {...}, accessToken: "..." }`
   - Frontend stores token in Zustand store
   - Axios interceptor attaches token to subsequent requests

2. **Authenticated Requests**
   - Frontend: Axios adds `Authorization: Bearer <token>` header
   - Backend: JWT strategy validates token
   - Backend: Extracts user from token
   - Returns data if authorized

3. **Token Refresh** (if configured)
   - On 401 error, frontend calls `/api/v1/auth/refresh`
   - Backend issues new access token
   - Frontend retries original request

---

## 📁 Key Files

### Frontend Configuration
- `apps/web/.env.local` - Frontend environment variables
- `apps/web/src/config/env.ts` - Environment config
- `apps/web/src/lib/axios.ts` - HTTP client with interceptors
- `apps/web/src/stores/auth.store.ts` - Auth state management
- `apps/web/src/hooks/use-auth.ts` - Auth hook for login/logout

### Backend Configuration
- `.env` - Backend environment variables
- `apps/tekurious_erp/src/main.ts` - Application bootstrap
- `apps/tekurious_erp/src/app/app.module.ts` - Root module
- `apps/tekurious_erp/src/modules/auth/` - Auth module

### API Services (Frontend)
All in `apps/web/src/services/`:
- `auth.service.ts` - Authentication
- `student.service.ts` - Student management
- `teacher.service.ts` - Teacher management
- `academic.service.ts` - Academic operations
- `fee.service.ts` - Fee management
- ... 17 services total

---

## 🧪 Testing Checklist

### Backend Tests
```bash
# Check backend health
curl http://localhost:3333/health

# Test auth endpoint
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Frontend Tests
1. Visit `http://localhost:3000/test/api`
2. Run all connectivity tests
3. Check browser console for errors
4. Verify network tab shows requests to port 3333

### Integration Tests
1. Login at `/auth/login`
2. Navigate to `/dashboard`
3. Try accessing `/students` list
4. Try creating a student
5. Try editing a student
6. Check permissions work correctly

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch" or "Network Error"
**Cause**: Backend not running
**Fix**: Start backend with `npm run dev`

### Issue: "CORS policy blocked"
**Cause**: CORS misconfiguration
**Fix**: Verify FRONTEND_URL in backend .env matches frontend URL

### Issue: "401 Unauthorized" on all requests
**Cause**: Auth not working
**Fix**: 
1. Check JWT_SECRET is set in backend .env
2. Verify user exists in database
3. Check login credentials

### Issue: "Cannot read property of undefined"
**Cause**: API response structure mismatch
**Fix**: Check API response matches TypeScript interface

### Issue: Pages show "Loading..." forever
**Cause**: API request failing silently
**Fix**: 
1. Open browser DevTools → Network tab
2. Look for failed requests (red)
3. Check request/response details

---

## 📝 Next Steps

1. ✅ Verify backend starts on port 3333
2. ✅ Verify frontend starts on port 3000
3. ✅ Test API connectivity at `/test/api`
4. ✅ Create test user in database
5. ✅ Login at `/auth/login`
6. ✅ Navigate to dashboard
7. ✅ Test CRUD operations on students
8. ✅ Test permissions and role-based access

---

## 🎯 Development Workflow

1. **Backend Changes**: Auto-reloads via `npm run dev`
2. **Frontend Changes**: Auto-reloads via Next.js hot reload
3. **Database Changes**: Run `npm run prisma:migrate`
4. **Add New API**: Update service file, no restart needed
5. **Add New Page**: Create in `apps/web/src/app/`

---

## 📞 Support

If issues persist:
1. Check logs in both terminal windows
2. Verify all environment variables are set
3. Ensure PostgreSQL and Redis are running
4. Check firewall isn't blocking ports 3000/3333
5. Try restarting both servers

**Happy Coding! 🚀**
