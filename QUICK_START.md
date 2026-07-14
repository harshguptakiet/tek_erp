# Tekurious ERP - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start Docker Services
```bash
# Open Docker Desktop first, then:
docker-compose up -d
```

### Step 2: Run Database Migration
```bash
npx prisma migrate dev --name init
```

This will create all 268 tables in your database.

### Step 3: Start the Server
```bash
npm run serve
```

### Step 4: Test the API
Open your browser or use curl:
```bash
curl http://localhost:3000/api/v1
```

## 📋 What's Next?

1. **Read**: `PROJECT_STATUS.md` - See what's done and what's next
2. **Implement**: Authentication Module (Week 1 priority)
3. **Reference**: `architecture-docs/IMPLEMENTATION_GUIDE.md` - Complete guide

## 🔑 Key Files

- **Main App**: `apps/tekurious_erp/src/main.ts`
- **App Module**: `apps/tekurious_erp/src/app/app.module.ts`
- **Database Service**: `apps/tekurious_erp/src/database/prisma.service.ts`
- **Events Service**: `apps/tekurious_erp/src/events/event-bus.service.ts`
- **Schema**: `prisma/schema.prisma` (268 models)
- **Environment**: `.env`

## ⚠️ Troubleshooting

**Docker not starting?**
```bash
# Check if Docker Desktop is running
docker ps
```

**Database connection error?**
```bash
# Check PostgreSQL container
docker logs tekurious_postgres
```

**Prisma errors?**
```bash
# Regenerate client
npx prisma generate
```

## 📞 Need Help?

Check `README.md` for detailed documentation and troubleshooting.

---

**You're all set! Start building! 🎉**
