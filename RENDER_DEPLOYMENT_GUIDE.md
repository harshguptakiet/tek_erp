# Render.com Deployment Guide - Tekurious ERP

Complete guide to deploy Tekurious ERP (Next.js Frontend + NestJS Backend + PostgreSQL) on Render.com

---

## 🚀 Quick Start - Render Configuration

### Frontend Service Settings
```
Root Directory: apps/web
Build Command: npm install && npx next build
Start Command: npx next start -p $PORT
```

### Backend Service Settings
```
Root Directory: (leave empty)
Build Command: npm install && npx prisma generate && npm run build
Start Command: node dist/apps/tekurious_erp/main.js
```

---

## Prerequisites

- [x] GitHub repository with your code
- [x] Render.com account (sign up at https://render.com)
- [x] All environment variables ready

---

## Architecture Overview

You'll deploy **3 services** on Render:

1. **PostgreSQL Database** (Managed Database)
2. **NestJS Backend API** (Web Service)
3. **Next.js Frontend** (Web Service)

---

## Step 1: Create PostgreSQL Database

### 1.1 Create Database
1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Configure:
   ```
   Name: tekurious-db
   Database: tekurious_db
   User: postgres (auto-generated)
   Region: Choose closest to your users
   Plan: Starter ($7/month) or Free
   ```
3. Click **Create Database**

### 1.2 Get Connection Details
After creation, note these values from the **Connections** section:
- **Internal Database URL** (for backend)
- **External Database URL** (for migrations from local)
- Database name, username, password

**Important:** Use the **Internal Database URL** in your backend service for faster connections!

---

## Step 2: Deploy Backend (NestJS API)

### 2.1 Create Web Service
1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:

```yaml
Name: tekurious-backend
Region: Same as database
Branch: master (or main)
Root Directory: .
Runtime: Node
Build Command: npm install && npx prisma generate && npm run build
Start Command: node dist/apps/tekurious_erp/main.js
Plan: Starter ($7/month) or Free
```

### 2.2 Add Environment Variables

Click **Environment** tab and add:

```bash
# Database
DATABASE_URL=<Internal Database URL from Step 1>

# Redis (use Render Redis or Upstash)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-64-char-hex-encryption-key

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://tekurious-backend.onrender.com/api/v1/auth/google/callback

# OAuth - Microsoft
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=https://tekurious-backend.onrender.com/api/v1/auth/microsoft/callback

# AWS S3
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Payment
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# SMS
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Application
APP_NAME=Tekurious ERP
PORT=3333
NODE_ENV=production
FRONTEND_URL=https://tekurious.onrender.com

# Feature Flags
ENABLE_AR_VR=false
ENABLE_AI_FEATURES=false
ENABLE_MARKETPLACE=false
```

### 2.3 Configure Health Check
1. Go to **Settings** → **Health Check**
2. Set Health Check Path: `/api/v1/health`

### 2.4 Deploy
Click **Create Web Service** - it will start building and deploying!

---

## Step 3: Run Database Migrations

### Option A: From Local Machine
```bash
# Use External Database URL
export DATABASE_URL="<External Database URL>"
npx prisma migrate deploy
npx prisma db seed
```

### Option B: From Render Shell
1. Go to backend service → **Shell** tab
2. Run:
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## Step 4: Deploy Frontend (Next.js)

### 4.1 Create Web Service
1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:

```yaml
Name: tekurious-frontend
Region: Same as backend
Branch: master (or main)
Root Directory: apps/web
Runtime: Node
Build Command: npm install && npx next build
Start Command: npx next start -p $PORT
Plan: Starter ($7/month) or Free
```

**Critical for Monorepo:**
- Set **Root Directory to `apps/web`** (Next.js app with its own package.json)
- Build command: `npm install && npx next build`
- Start command: `npx next start -p $PORT`

### 4.2 Add Environment Variables

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://tekurious-backend.onrender.com/api/v1

# Application
NODE_ENV=production
```

### 4.3 Deploy
Click **Create Web Service**

---

## Step 5: Configure Custom Domain (Optional)

### 5.1 Frontend Domain
1. Go to frontend service → **Settings** → **Custom Domains**
2. Add your domain: `yourdomain.com`
3. Add DNS records as instructed:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: tekurious-frontend.onrender.com
   ```

### 5.2 Backend Domain
1. Go to backend service → **Settings** → **Custom Domains**
2. Add subdomain: `api.yourdomain.com`
3. Add DNS records:
   ```
   Type: CNAME
   Name: api
   Value: tekurious-backend.onrender.com
   ```

### 5.3 Update Environment Variables
Update these after custom domains are configured:
- Frontend: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`
- Backend: `FRONTEND_URL=https://yourdomain.com`

---

## Step 6: Add Redis (Optional but Recommended)

### Option A: Render Redis
1. Dashboard → **New** → **Redis**
2. Configure:
   ```
   Name: tekurious-redis
   Plan: Starter ($10/month) or use external provider
   ```
3. Copy **Internal Redis URL**
4. Update backend env: `REDIS_URL=<Internal Redis URL>`

### Option B: Upstash Redis (Free Tier Available)
1. Sign up at https://upstash.com
2. Create Redis database
3. Copy connection URL
4. Update backend env: `REDIS_URL=<Upstash URL>`

---

## Step 7: Verify Deployment

### 7.1 Backend Health Check
Visit: `https://tekurious-backend.onrender.com/api/v1/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-08-14T..."
}
```

### 7.2 Frontend Check
Visit: `https://tekurious-frontend.onrender.com`

You should see the login page!

### 7.3 API Documentation
Visit: `https://tekurious-backend.onrender.com/api/docs`

Swagger UI should load with all endpoints.

---

## Step 8: Enable Auto-Deploy

Both services should auto-deploy on Git push:

1. Go to each service → **Settings** → **Build & Deploy**
2. Enable **Auto-Deploy**: Yes
3. Branch: master

Now every push to master will trigger automatic deployment!

---

## Troubleshooting

### Build Fails

**Issue:** `Cannot find module '@tailwindcss/postcss'`
```bash
# Solution: Ensure apps/web has its own package.json with all dependencies
# This is now fixed - apps/web/package.json includes all required packages

Root Directory: apps/web
Build Command: npm install && npx next build
Start Command: npx next start -p $PORT
```

**Issue:** `Prisma generate fails`
```bash
# Solution: Add to Build Command
npm install && npx prisma generate && npm run build
```

**Issue:** `Module not found`
```bash
# Solution: Add missing dependency to apps/web/package.json
cd apps/web
npm install --save <missing-package>
```

### Database Connection Fails

**Issue:** `ECONNREFUSED`
- ✅ Use **Internal Database URL** (not external)
- ✅ Ensure DATABASE_URL env var is set
- ✅ Check database is in same region as backend

### Frontend Can't Reach Backend

**Issue:** `Network Error` or `CORS`
```typescript
// In backend main.ts, ensure CORS is configured:
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### Slow Performance

1. **Enable connection pooling:**
   ```bash
   DATABASE_URL="postgres://...?connection_limit=10"
   ```

2. **Add database indexes** (already created in migration)

3. **Enable Redis caching** for sessions

4. **Upgrade plan** if on free tier (free tier sleeps after 15min inactivity)

---

## Cost Estimate

### Minimal Setup (Development)
- PostgreSQL: Free tier (limited)
- Backend: Free tier (spins down after 15min)
- Frontend: Free tier (spins down after 15min)
- **Total: $0/month** (with limitations)

### Production Setup (Recommended)
- PostgreSQL Starter: $7/month
- Backend Starter: $7/month
- Frontend Starter: $7/month
- Redis Starter: $10/month (optional)
- **Total: ~$21-31/month**

### Enterprise Setup
- PostgreSQL Standard: $20/month
- Backend Standard: $25/month
- Frontend Standard: $25/month
- Redis Pro: $30/month
- **Total: ~$100/month**

---

## Performance Optimization

### 1. Connection Pooling
```bash
DATABASE_URL="postgres://...?connection_limit=20&pool_timeout=10"
```

### 2. Enable Compression
In backend `main.ts`:
```typescript
import * as compression from 'compression';
app.use(compression());
```

### 3. Static Asset CDN
Configure Next.js to use CDN:
```javascript
// next.config.js
module.exports = {
  assetPrefix: 'https://cdn.yourdomain.com',
};
```

### 4. Database Indexes
Run the performance indexes migration:
```bash
npx prisma migrate deploy
```

---

## Monitoring & Logs

### View Logs
1. Go to service → **Logs** tab
2. Real-time logs displayed
3. Filter by severity: Info, Warning, Error

### Metrics
1. Go to service → **Metrics** tab
2. View:
   - CPU usage
   - Memory usage
   - Request rate
   - Response time

### Alerts (Paid Plans)
Set up alerts for:
- High error rate
- High response time
- Service down

---

## Backup & Recovery

### Database Backups
1. Go to database → **Backups** tab
2. Automatic daily backups (retained 7 days on Starter)
3. Manual backup: Click **Create Backup**

### Restore Database
```bash
# Download backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## Security Checklist

- [x] Use strong JWT_SECRET (minimum 32 characters)
- [x] Enable HTTPS (automatic on Render)
- [x] Set secure CORS origins
- [x] Use environment variables for secrets
- [x] Enable rate limiting in backend
- [x] Configure CSP headers
- [x] Regular security updates: `npm audit fix`

---

## Quick Commands

### Restart Services
```bash
# From Render Dashboard
Service → Manual Deploy → Deploy latest commit
```

### View Environment Variables
```bash
# From Render Shell
env
```

### Run Migrations
```bash
# From Render Shell (Backend)
npx prisma migrate deploy
```

### Seed Database
```bash
npx prisma db seed
```

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Community:** https://community.render.com

---

## Next Steps

1. ✅ Deploy database, backend, frontend
2. ✅ Run migrations and seed data
3. ✅ Test all functionality
4. ⬜ Configure custom domain
5. ⬜ Set up monitoring & alerts
6. ⬜ Configure backups
7. ⬜ Add Redis for caching
8. ⬜ Enable auto-scaling (paid plans)

---

**Your Tekurious ERP is now live! 🚀**

Frontend: https://tekurious-frontend.onrender.com
Backend API: https://tekurious-backend.onrender.com/api/v1
API Docs: https://tekurious-backend.onrender.com/api/docs
