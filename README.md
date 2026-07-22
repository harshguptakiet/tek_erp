# Tekurious ERP - Educational Management Platform

A comprehensive educational management system built with NestJS, Prisma, and PostgreSQL.

## � Current Status

| Metric | Value |
|--------|-------|
| **Build** | ✅ Passing |
| **Automated Tests** | 221/221 PASS (100%) |
| **API Endpoints** | 480 |
| **Database Models** | 268 |
| **Modules Implemented** | 17 / 17 |
| **FR Requirements Done** | ~668 / 830 (~80.4%) |
| **Last Updated** | July 22, 2026 |

## �🚀 Quick Start

### Prerequisites

- Node.js v20+
- Docker Desktop (for PostgreSQL and Redis)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
```bash
cd tekurious
npm install
```

2. **Start Docker Services**
```bash
# Make sure Docker Desktop is running first!
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

3. **Set up Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Generate Prisma Client**
```bash
npx prisma generate
```

5. **Run Database Migrations**
```bash
npx prisma migrate dev --name init
```

6. **Start the Development Server**
```bash
npm run serve
```

API available at: `http://localhost:3000/api/v1`

---

## 📁 Project Structure

```
tekurious/
├── apps/
│   └── tekurious_erp/
│       └── src/
│           ├── modules/          # Feature modules (17 modules)
│           │   ├── auth/         # 01 Authentication (28 endpoints)
│           │   ├── users/        # 02 User Management (42 endpoints)
│           │   ├── schools/      # 03 Organization (32 endpoints)
│           │   ├── academic/     # 04 Academic (35 endpoints)
│           │   ├── content/      # 05 Content Management (28 endpoints)
│           │   ├── assessment/   # 09 Assessment Engine (30 endpoints)
│           │   ├── assignments/  # 10 Assignment Management (14 endpoints)
│           │   ├── live-classes/ # 11 Live Classes (13 endpoints)
│           │   ├── analytics/    # 12 Analytics & Reporting (30 endpoints)
│           │   ├── attendance/   # 13 ERP-Attendance (11 endpoints)
│           │   ├── notifications/# 14 Notifications (14 endpoints)
│           │   ├── messaging/    # 14 Messaging (4 endpoints)
│           │   ├── payments/     # 08 Payments (9 endpoints)
│           │   ├── fees/         # 08 Fees (6 endpoints)
│           │   ├── marketplace/  # 15 Marketplace (20 endpoints)
│           │   ├── search/       # 16 Search & Discovery (17 endpoints)
│           │   ├── system/       # 17 System Internal (17 endpoints)
│           │   ├── subscriptions/# 07 Subscriptions (12 endpoints)
│           │   ├── licenses/     # 07 Licenses (5 endpoints)
│           │   └── erp/          # 13 ERP sub-modules (library/transport/hostel/discipline/announcements)
│           ├── common/           # Shared utilities
│           │   ├── decorators/
│           │   ├── guards/
│           │   ├── interceptors/
│           │   ├── filters/
│           │   └── pipes/
│           ├── database/         # Prisma service
│           ├── events/           # Event bus
│           ├── config/           # Configuration
│           └── main.ts           # Bootstrap
├── prisma/
│   └── schema.prisma            # Database schema (268 models)
├── docker-compose.yml           # Docker services
└── .env                         # Environment variables
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run serve

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (development only!)
npx prisma migrate reset
```

### Test Scripts

```bash
# Run full automated test suite (61 tests)
./test-all-modules.ps1

# Run extended module tests (160 tests)
./test-new-modules.ps1
```

---

## 📡 Active API Endpoints

| Prefix | Module | Endpoints |
|--------|--------|-----------|
| `/api/v1/auth` | 01 Authentication | 28 |
| `/api/v1/users` | 02 User Management | 42 |
| `/api/v1/organizations` | 03 Organization | 32 |
| `/api/v1/academic` | 04 Academic | 35 |
| `/api/v1/content` | 05 Content | 28 |
| `/api/v1/assessment` | 09 Assessment | 30 |
| `/api/v1/assignments` | 10 Assignments | 14 |
| `/api/v1/live-classes` | 11 Live Classes | 13 |
| `/api/v1/analytics` | 12 Analytics | 30 |
| `/api/v1/attendance` | 13 ERP-Attendance | 11 |
| `/api/v1/notifications` | 14 Notifications | 14 |
| `/api/v1/messaging` | 14 Messaging | 4 |
| `/api/v1/payments` | 08 Payments | 9 |
| `/api/v1/fees` | 08 Fees | 6 |
| `/api/v1/marketplace` | 15 Marketplace | 20 |
| `/api/v1/search` | 16 Search | 17 |
| `/api/v1/system` | 17 System | 17 |
| `/api/v1/erp/library` | 13 ERP-Library | 9 |
| `/api/v1/erp/transport` | 13 ERP-Transport | 7 |
| `/api/v1/erp/hostel` | 13 ERP-Hostel | 7 |
| `/api/v1/erp/discipline` | 13 ERP-Discipline | 3 |
| `/api/v1/erp/announcements` | 13 ERP-Announcements | 3 |
| `/api/v1/subscriptions` | 07 Subscriptions | 12 |
| `/api/v1/licenses` | 07 Licenses | 5 |
| **Total** | | **444** |

---

## 🏗️ Module Progress

| Module | Requirements | Implemented | Tested | Status |
|--------|----------:|----------:|-------:|--------|
| 01 Authentication | 40+31 | 30 | 10 | 🟡 In Progress |
| 02 User Management | 60 | 45 | 17 | 🟡 In Progress |
| 03 Organization | 39 | 32 | 9 | 🟡 In Progress |
| 04 Academic | 50 | 15 | 5 | 🟡 In Progress |
| 05 Content Management | 80 | 15 | 14 | 🟡 In Progress |
| 06 AR/VR Learning | 53 | 0 | 0 | ⏭️ Deferred (hardware) |
| 07 Subscriptions & Licensing | 37 | 28 | 9 | 🟡 In Progress |
| 08 Payment & Billing | 33 | 28 | 6 | 🟡 In Progress |
| 09 Assessment Engine | 69 | 45 | 14 | 🟡 In Progress |
| 10 Assignment Management | 26 | 22 | 8 | 🟡 In Progress |
| 11 Live Classes | 35 | 25 | 5 | 🟡 In Progress |
| 12 Analytics & Reporting | 78 | 43 | 6 | 🟡 In Progress |
| 13 ERP (all sub-modules) | 120 | 65 | 35 | 🟡 In Progress |
| 14 Notifications & Messaging | 30 | 26 | 14 | 🟡 In Progress |
| 15 Marketplace | 40 | 35 | 6 | 🟡 In Progress |
| 16 Search & Discovery | 25 | 25 | 7 | ✅ Complete |
| 17 System Internal | 15 | 13 | 11 | 🟡 In Progress |
| **Total** | **830** | **~645** | **221** | **~77.7%** |

See [`MODULE_CHECKLIST.md`](./MODULE_CHECKLIST.md) for the full per-requirement breakdown.

---

## 📊 Database Schema

268 models covering:
- Multi-tenancy (Ministry → State → District → School hierarchy)
- Complete RBAC (Role-Based Access Control)
- Event-driven architecture
- Soft deletes and audit logging
- 444 REST API endpoints

---

## 🏗️ Architecture

### Current Phase: MVP — Modular Monolith
- **Architecture**: Modular Monolith
- **Services**: 1 NestJS app (all modules)
- **Database**: PostgreSQL (single instance)
- **Cache/Queue**: Redis + BullMQ
- **Infrastructure**: Docker Compose

### Future Phases
See `architecture-docs/IMPLEMENTATION_GUIDE.md` for the migration path to microservices.

---

## 🔐 Environment Variables

Key variables (see `.env.example` for the full list):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tekurious_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
AWS_S3_BUCKET=your-bucket
RAZORPAY_KEY_ID=your-key
SENDGRID_API_KEY=your-key
TWILIO_ACCOUNT_SID=your-sid
```

---

## 📚 Documentation

- **Module Checklist**: [`MODULE_CHECKLIST.md`](./MODULE_CHECKLIST.md) — per-requirement implementation status
- **Implementation Guide**: `architecture-docs/IMPLEMENTATION_GUIDE.md`
- **Requirements**: `requirements/` folder
- **Database Schema**: `prisma/schema.prisma`
- **Architecture Docs**: `architecture-docs/` folder

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Full API test suite (automated PowerShell scripts)
./test-all-modules.ps1       # 61 tests
./test-new-modules.ps1       # 160 tests
```

**Current score**: 221/221 (100%) ✅

---

## 🚢 Deployment

### Docker Build

```bash
# Build Docker image
docker build -t tekurious-erp .

# Run container
docker run -p 3000:3000 tekurious-erp
```

### Production Deployment

See `architecture-docs/IMPLEMENTATION_GUIDE.md` for detailed deployment instructions.

---

## 🆘 Troubleshooting

### Docker not starting
```bash
# Check if Docker Desktop is running
docker ps

# Restart Docker Desktop if needed
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs tekurious_postgres
```

### Prisma Client issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

---

## 📝 License

Proprietary — All Rights Reserved

## 👥 Team

Built with ❤️ by the Tekurious team

## 📞 Support

For issues and questions, contact the development team.
