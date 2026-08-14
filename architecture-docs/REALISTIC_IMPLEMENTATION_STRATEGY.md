# Edubharti Platform - Realistic Implementation Strategy

**Version**: 1.0.0  
**Date**: 2026-07-09  
**Philosophy**: Start Simple, Evolve Intelligently, Scale When Needed

---

## Executive Summary

This document provides a **pragmatic, phased approach** to building the Edubharti platform. Instead of starting with 58 microservices, we'll build a **Modular Monolith** first, validate with real users, then strategically extract services as needed.

**Target Architecture**: `MICROSERVICES_ARCHITECTURE_COMPLETE.md` (end state)  
**This Document**: Realistic path to get there

---

## The Problem with the Original Plan

### Original Approach (DON'T DO THIS)
```
Day 1: Build 58 microservices → Then find users
```

**Issues**:
- 6+ months before MVP
- 58 services to deploy/monitor/debug
- Massive operational overhead
- No user validation
- Over-engineering before proving product-market fit

### Realistic Approach (DO THIS)
```
Month 1-3:   Modular Monolith MVP
Month 4-6:   Pilot with 10 schools
Month 7-9:   Extract 3-5 critical services
Month 10-12: Scale to 100 schools
Month 13-18: Extract to 10-15 services
Month 19-24: Scale to 1000 schools
Month 25-36: Extract to 30-40 services (as needed)
```

---

## Phase 0: Foundation (Week 1-2)

### Setup
- **Repository**: Monorepo with NX or Turborepo
- **Stack**: Node.js + NestJS + Prisma + PostgreSQL + Redis
- **Deployment**: Single Docker container on VPS (DigitalOcean/AWS)
- **Database**: Single PostgreSQL instance
- **Cache**: Single Redis instance

### Structure
```
edubharti/
├── apps/
│   └── api/          # Single NestJS app
├── libs/
│   ├── auth/         # Auth module
│   ├── users/        # User module
│   ├── schools/      # School module
│   └── shared/       # Common utilities
├── prisma/
│   └── schema.prisma # All 268 models (already done!)
├── docker-compose.yml
└── .env
```

### Development Tools
```bash
# Package.json
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "test": "jest",
    "migrate": "prisma migrate dev",
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Deliverable**: Development environment ready in 2 weeks

---

## Phase 1: MVP (Months 1-3)

### Goal
Launch with 10 pilot schools, 500 students, 50 teachers

### Architecture
**Single Modular Monolith** - All domains in one app

```
api/ (Single NestJS App)
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/
│   ├── schools/
│   ├── students/
│   ├── teachers/
│   ├── classes/
│   ├── subjects/
│   ├── content/
│   ├── assignments/
│   ├── assessments/
│   ├── attendance/
│   ├── timetable/
│   ├── fees/
│   └── notifications/
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   └── interceptors/
├── events/
│   └── event-bus.service.ts (Redis-based)
└── main.ts
```

### Database
**1 PostgreSQL Database** with all 268 models

### Features to Build (Priority Order)

#### Week 1-2: Foundation
- ✅ Auth system (email/password, JWT)
- ✅ User registration (students, teachers, admin)
- ✅ School setup
- ✅ Multi-tenancy (tenantId in all queries)

#### Week 3-4: Academic Core
- ✅ Class & section management
- ✅ Student enrollment
- ✅ Teacher assignments
- ✅ Subject management
- ✅ Basic timetable

#### Week 5-6: Content & Learning
- ✅ Content upload (PDFs, videos)
- ✅ Content organization (subjects, chapters)
- ✅ Basic content delivery

#### Week 7-8: Assignments
- ✅ Assignment creation
- ✅ Assignment submission
- ✅ Manual grading
- ✅ Grade book

#### Week 9-10: Assessments
- ✅ Question bank (MCQ, True/False)
- ✅ Exam creation
- ✅ Exam taking
- ✅ Auto-grading (MCQ only)
- ✅ Results

#### Week 11-12: Essential Operations
- ✅ Attendance marking (manual)
- ✅ Fee management (basic)
- ✅ Payment integration (Razorpay)
- ✅ Notifications (email + SMS)
- ✅ Basic analytics dashboard

### What to SKIP in MVP
- ❌ AR/VR (add in Phase 3)
- ❌ Live classes (add in Phase 2)
- ❌ Marketplace (add in Phase 4)
- ❌ AI features (add in Phase 3)
- ❌ Advanced ERP (library, transport, hostel)
- ❌ Government integrations
- ❌ Complex workflows
- ❌ Metaverse classrooms

### Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://...
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
```

**Deploy to**: Single VPS (4 vCPU, 8GB RAM - $40/month)

### Success Metrics
- ✅ 10 schools onboarded
- ✅ 500 students using daily
- ✅ Core workflows functional
- ✅ <200ms API response time
- ✅ Zero critical bugs

**Time**: 3 months | **Cost**: $1000-2000 | **Team**: 2-3 developers

---

## Phase 2: Validation & First Split (Months 4-6)

### Goal
Scale to 100 schools, 5,000 students, validate product-market fit

### What to Add
- ✅ Live classes (Zoom integration)
- ✅ Advanced grading (rubrics)
- ✅ Parent portal
- ✅ Mobile app (React Native)
- ✅ WhatsApp notifications
- ✅ Basic reporting

### First Service Extraction

**Extract 3 Services** (only when needed):

#### 1. Notification Service (First to extract)
**Why**: Different scaling needs, independent deployments

```
Before:
  Monolith → PostgreSQL

After:
  Monolith → PostgreSQL
  Notification Service → Redis Queue
```

**Benefits**:
- Can scale independently
- Retry logic isolated
- Doesn't slow down main app

#### 2. Media/Storage Service
**Why**: Different infrastructure needs (S3, CDN)

#### 3. Background Jobs Service
**Why**: Long-running tasks (report generation, exports)

### New Architecture
```
┌─────────────────┐
│   API Gateway   │ (NGINX)
└────────┬────────┘
         │
    ┌────┴─────┬──────────────┬─────────────┐
    │          │              │             │
┌───▼────┐  ┌──▼──────┐  ┌───▼──────┐  ┌──▼──────┐
│Monolith│  │Notification│Media    │  │Jobs     │
│(Core)  │  │Service  │  │Service  │  │Service  │
└────────┘  └─────────┘  └─────────┘  └─────────┘
```

### Database Strategy
Still **1 Primary Database**, but:
- Read replicas for reporting
- Redis for caching
- Redis for job queues

### Deployment
- **Main app**: 2-3 instances behind load balancer
- **Notification service**: 2 instances
- **Media service**: 2 instances with CDN
- **Job service**: 1-2 instances

**Infrastructure**: Kubernetes (managed) or AWS ECS

**Cost**: $500-1000/month

### Success Metrics
- ✅ 100 schools
- ✅ 5,000 active students
- ✅ <300ms P95 response time
- ✅ 99.5% uptime

**Time**: 3 months | **Team**: 3-4 developers

---

## Phase 3: Growth & Feature Expansion (Months 7-12)

### Goal
Scale to 1,000 schools, add differentiating features

### What to Add
- ✅ AI-powered recommendations
- ✅ Chatbot (basic)
- ✅ AR/VR content support
- ✅ Advanced analytics
- ✅ Government reporting (UDISE+)
- ✅ Library management
- ✅ Transport management

### Service Extraction (10-15 Services Total)

#### Domain Services to Extract

**1. Student Service**
- High read traffic
- Needs independent scaling

**2. Assessment Service**
- CPU-intensive (grading, analytics)
- Separate scaling profile

**3. Content Service**
- Large data volumes
- CDN integration

**4. Analytics Service**
- Complex queries
- Can use read replicas
- Separate database for OLAP

**5. Payment Service**
- PCI compliance
- Isolated for security

**6. AI Service** (NEW)
- Recommendations
- Chatbot
- OCR
- All AI features in ONE service

### Architecture Evolution
```
┌──────────────────┐
│   API Gateway    │
│   (Kong/NGINX)   │
└────────┬─────────┘
         │
  ┌──────┴──────┬───────────┬──────────┬─────────┐
  │             │           │          │         │
┌─▼──────┐  ┌──▼──────┐ ┌──▼─────┐ ┌──▼────┐ ┌─▼──────┐
│ Core   │  │Student  │ │Content │ │Payment│ │AI      │
│Monolith│  │Service  │ │Service │ │Service│ │Service │
└────────┘  └─────────┘ └────────┘ └───────┘ └────────┘
```

### Database Strategy
- **Core DB**: 1 primary + 2 read replicas
- **Analytics DB**: Separate (TimescaleDB or ClickHouse)
- **Content DB**: Separate with full-text search
- **Cache**: Redis Cluster (3 nodes)

### Event Bus
**Upgrade to Kafka** (if message volume > 10k/sec)

### Infrastructure
- Kubernetes cluster (3 nodes minimum)
- Service mesh (Istio) - ONLY if needed
- Monitoring: Prometheus + Grafana
- Logging: ELK stack
- Tracing: Jaeger

### Success Metrics
- ✅ 1,000 schools
- ✅ 50,000 students
- ✅ <400ms P99 response time
- ✅ 99.9% uptime
- ✅ AI features used daily

**Time**: 6 months | **Cost**: $2000-5000/month | **Team**: 5-7 developers

---


## Phase 4: Scale & Marketplace (Months 13-18)

### Goal
Scale to 5,000 schools, launch marketplace

### What to Add
- ✅ Marketplace (publishers, creators)
- ✅ Subscription management
- ✅ License pools
- ✅ Advanced ERP (hostel, inventory, HR)
- ✅ Live metaverse classrooms
- ✅ Advanced AI (predictions, weak area detection)
- ✅ Mobile apps optimization

### Service Extraction (25-30 Services Total)

Extract by **business domain**:

#### Commerce Domain
- subscription-service
- license-service  
- marketplace-service
- payout-service

#### ERP Domain
- library-service
- transport-service
- hostel-service
- hr-payroll-service

#### Learning Domain
- assignment-service (extract from core)
- live-class-service
- recording-service
- grading-service

### Architecture
```
                    ┌──────────────┐
                    │  API Gateway │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐
   │ Core    │      │  Commerce   │    │  Learning │
   │ Domain  │      │  Domain     │    │  Domain   │
   │         │      │             │    │           │
   │ 5 svcs  │      │  4 svcs     │    │  6 svcs   │
   └─────────┘      └─────────────┘    └───────────┘
```

### Database Strategy
**6-8 Databases**:
- core_db
- commerce_db
- analytics_db
- content_db
- erp_db
- marketplace_db

### Infrastructure
- Kubernetes: 2 regions (Mumbai + Singapore)
- Auto-scaling: HPA + VPA
- CDN: CloudFront for media
- Cache: Redis Cluster (6 nodes)
- Message Queue: Kafka cluster (3 brokers)

### Success Metrics
- ✅ 5,000 schools
- ✅ 250,000 students
- ✅ Marketplace: 100+ publishers
- ✅ Revenue: Subscriptions + Marketplace
- ✅ 99.95% uptime

**Time**: 6 months | **Cost**: $10k-20k/month | **Team**: 10-15 developers

---

## Phase 5: Enterprise & Scale (Months 19-36)

### Goal
Scale to 10,000+ schools, 1M+ students, full microservices

### Service Count
**40-50 services** (extract only what's needed)

### Multi-Region Strategy
- Primary: India (Mumbai, Bangalore, Delhi)
- Secondary: Singapore, Middle East
- Data residency compliance
- Multi-tenant sharding

### Advanced Features
- ✅ Government integrations (UDISE+, DigiLocker)
- ✅ Advanced AI (GPT-4 integration, custom models)
- ✅ Predictive analytics (dropout risk, performance)
- ✅ White-label for large organizations
- ✅ Mobile app SDKs for third-party integrations

### Infrastructure
- Multi-region Kubernetes
- Service mesh (Istio)
- Global load balancing
- Multi-cloud (AWS + GCP)
- Cost optimization: Spot instances

### Success Metrics
- ✅ 10,000+ schools
- ✅ 1M+ students
- ✅ 50M+ API calls/day
- ✅ 99.99% uptime
- ✅ International expansion ready

**Time**: 12-18 months | **Cost**: $50k-100k/month | **Team**: 20-30 people

---

## Key Principles Throughout

### 1. Module First, Service Later

**Always build as a module first**:
```typescript
// Start with this in monolith
@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule {}
```

**Extract to service when**:
- Different scaling needs
- Different team ownership
- Different technology stack
- Clear bounded context
- Proven user demand

### 2. Database Strategy

**Phase 1**: 1 database
**Phase 2**: 1 database + read replicas
**Phase 3**: 3-5 databases (by domain)
**Phase 4**: 10-15 databases
**Phase 5**: 20-30 databases

**Always use**:
- Connection pooling (PgBouncer)
- Prepared statements
- Indexes on foreign keys
- Soft deletes (never hard delete)

### 3. Event-Driven From Day 1

```typescript
// Even in monolith, use events
class StudentService {
  async enrollStudent(data: EnrollmentDto) {
    const student = await this.create(data);
    
    // Emit event
    await this.eventBus.publish('student.enrolled', {
      studentId: student.id,
      schoolId: student.schoolId,
      timestamp: new Date()
    });
    
    return student;
  }
}
```

**Event Bus Evolution**:
- Phase 1: In-memory events (NestJS EventEmitter)
- Phase 2: Redis Pub/Sub
- Phase 3: Redis Streams
- Phase 4: Kafka (if needed)

### 4. API Versioning from Day 1

```typescript
// Always version your APIs
@Controller('v1/students')
export class StudentController {
  // ...
}
```

**Never break old versions** - keep v1 running when v2 launches

### 5. Monitoring from Day 1

Even in MVP, have:
- **Logging**: Winston or Pino (JSON format)
- **Metrics**: Basic Prometheus metrics
- **Health checks**: `/health` endpoint
- **Error tracking**: Sentry (free tier)

### 6. Testing Strategy

```
Unit tests:      70% coverage
Integration:     Key flows
E2E:            Critical paths
Load:           Before launch
```

Don't aim for 100% coverage - aim for **critical path coverage**.

### 7. CI/CD from Day 1

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: docker build -t app .
      - run: docker push
      - run: kubectl apply -f k8s/
```

**Automate everything** - manual deploys = errors

---

## What to Build When (Timeline)

### Month 1: Foundation
- [ ] Repository setup
- [ ] Database schema (already done!)
- [ ] Auth module (JWT)
- [ ] User module
- [ ] School module
- [ ] Docker setup

### Month 2: Core Academics
- [ ] Student enrollment
- [ ] Class management
- [ ] Teacher assignment
- [ ] Subject setup
- [ ] Basic timetable
- [ ] Attendance (manual)

### Month 3: Learning Features
- [ ] Content upload
- [ ] Assignment creation
- [ ] Assignment submission
- [ ] Basic assessment
- [ ] Grading
- [ ] Notifications

### Month 4-6: Pilot & Iterate
- [ ] Onboard 10 pilot schools
- [ ] Bug fixes
- [ ] UX improvements
- [ ] Live classes (Zoom)
- [ ] Parent portal
- [ ] Mobile app (v1)

### Month 7-9: First Extraction
- [ ] Extract notification service
- [ ] Extract media service
- [ ] Extract job service
- [ ] Kubernetes setup
- [ ] Monitoring stack

### Month 10-12: Feature Expansion
- [ ] AI recommendations
- [ ] Chatbot (basic)
- [ ] AR/VR support
- [ ] Analytics dashboard
- [ ] Government reporting

### Month 13-18: Marketplace & ERP
- [ ] Marketplace launch
- [ ] Subscription management
- [ ] Library module
- [ ] Transport module
- [ ] Advanced analytics

### Month 19-24: Scale & Optimize
- [ ] Multi-region
- [ ] Performance optimization
- [ ] Cost optimization
- [ ] Advanced AI features
- [ ] International expansion prep

---

## Technology Stack Evolution

### Phase 1 (MVP)
```
Backend:     Node.js + NestJS
Database:    PostgreSQL (1 instance)
Cache:       Redis (1 instance)
Storage:     Local disk → AWS S3
Deployment:  Docker Compose on VPS
Monitoring:  Basic logs + Sentry
```

### Phase 2 (Validation)
```
Backend:     Same
Database:    PostgreSQL primary + 1 read replica
Cache:       Redis (1 instance)
Storage:     AWS S3 + CloudFront
Deployment:  Docker on 2-3 VMs
Load Balancer: NGINX
Monitoring:  Prometheus + Grafana (basic)
```

### Phase 3 (Growth)
```
Backend:     NestJS microservices (10-15)
Database:    PostgreSQL cluster (3-5 databases)
Cache:       Redis Cluster (3 nodes)
Storage:     AWS S3 + CloudFront
Deployment:  Kubernetes (managed)
Event Bus:   Redis Streams
Monitoring:  Prometheus + Grafana + ELK
```

### Phase 4 (Scale)
```
Backend:     Microservices (25-30)
Database:    PostgreSQL clusters (10+ databases)
Cache:       Redis Cluster (6+ nodes)
Storage:     Multi-region S3 + CloudFront
Deployment:  Kubernetes (multi-region)
Event Bus:   Kafka
Monitoring:  Full observability stack
Service Mesh: Istio (if needed)
```

### Phase 5 (Enterprise)
```
Backend:     Full microservices (40-50)
Database:    PostgreSQL + specialized DBs
Cache:       Redis + Memcached
Storage:     Multi-cloud
Deployment:  Multi-region K8s
Event Bus:   Kafka + Redis
Monitoring:  Enterprise observability
Service Mesh: Istio
Multi-cloud:  AWS + GCP
```

---

## Team Evolution

### Phase 1 (Months 1-3)
**2-3 Full-stack developers**
- All can work on all code
- Pair programming
- Code reviews mandatory

### Phase 2 (Months 4-6)
**3-4 Developers + 1 DevOps**
- Start specialization
- One person owns DevOps
- Still everyone can touch all code

### Phase 3 (Months 7-12)
**5-7 Developers + 1-2 DevOps + 1 QA**
- Form domain teams
- Academic team (2 devs)
- Learning team (2 devs)
- Platform team (2 devs)
- DevOps team (2 people)
- QA (1 person)

### Phase 4 (Months 13-18)
**10-15 Developers + 2-3 DevOps + 2 QA + 1 Data Engineer**
- Multiple domain teams
- Each team owns 2-3 services
- Platform team owns infrastructure
- Data team owns analytics

### Phase 5 (Months 19-36)
**20-30 People**
- Multiple product teams
- Infrastructure team
- Data team
- ML/AI team
- Mobile team
- QA team
- DevOps/SRE team

---

## Cost Evolution

### Phase 1: MVP (Months 1-3)
```
Infrastructure:  $50/month (VPS)
Services:        $100/month (AWS S3, SendGrid, etc.)
Total:           $150/month
```

### Phase 2: Validation (Months 4-6)
```
Infrastructure:  $500/month (VMs, load balancer)
Services:        $300/month (AWS, Twilio, SendGrid)
Payment gateway: 2% of transactions
Total:           $800-1000/month
```

### Phase 3: Growth (Months 7-12)
```
Infrastructure:  $2000/month (Kubernetes, databases)
Services:        $1000/month (AWS, Twilio, Zoom, etc.)
Payment:         2% of transactions
AI/ML:          $500/month (OpenAI API)
Total:           $3500-5000/month
```

### Phase 4: Scale (Months 13-18)
```
Infrastructure:  $8000/month (Multi-region K8s)
Services:        $3000/month
Payment:         2% of transactions
AI/ML:          $2000/month
CDN:            $1000/month
Total:           $14k-20k/month
```

### Phase 5: Enterprise (Months 19-36)
```
Infrastructure:  $40k/month (Multi-cloud, global)
Services:        $10k/month
Payment:         2% of transactions
AI/ML:          $10k/month
CDN:            $5k/month
Support:        $10k/month (24/7 on-call)
Total:           $75k-100k/month
```

**ROI**: With 10,000 schools @ $100/month subscription = $1M/month revenue

---

## Risk Mitigation

### Technical Risks

**Risk**: Premature optimization
**Mitigation**: Always measure before optimizing

**Risk**: Over-engineering
**Mitigation**: Build features only when users ask

**Risk**: Technical debt
**Mitigation**: 20% time for refactoring

**Risk**: Scaling issues
**Mitigation**: Load testing before each phase

### Business Risks

**Risk**: No product-market fit
**Mitigation**: Launch MVP in 3 months, get feedback

**Risk**: Competition
**Mitigation**: Focus on differentiation (AR/VR, AI)

**Risk**: Government regulations
**Mitigation**: Build compliance from day 1

**Risk**: Cash burn
**Mitigation**: Aggressive cost control in early phases

---

## Decision Framework: When to Extract a Service

Ask these questions:

### 1. Does it have different scaling needs?
- **Yes**: Good candidate for extraction
- **No**: Keep in monolith

### 2. Does a different team own it?
- **Yes**: Consider extraction
- **No**: Keep in monolith

### 3. Is it a different technology?
- **Yes**: Extract (e.g., Python for ML)
- **No**: Keep in monolith

### 4. Is it a clear bounded context?
- **Yes**: Good candidate
- **No**: Keep in monolith

### 5. Would it be independently deployable?
- **Yes**: Extract
- **No**: Keep in monolith

### 6. Is operational overhead worth it?
- **Yes**: Extract
- **No**: Keep in monolith

**Rule**: If you answered "Yes" to 4+ questions, extract. Otherwise, keep in monolith.

---

## Success Metrics by Phase

### Phase 1: MVP
- [ ] 10 schools onboarded
- [ ] 500 students using daily
- [ ] <200ms API response time
- [ ] <5 critical bugs
- [ ] Time to onboard school: <30 min

### Phase 2: Validation
- [ ] 100 schools
- [ ] 5,000 students
- [ ] NPS score > 40
- [ ] <300ms P95 response
- [ ] 99.5% uptime

### Phase 3: Growth
- [ ] 1,000 schools
- [ ] 50,000 students
- [ ] NPS score > 50
- [ ] <400ms P99 response
- [ ] 99.9% uptime
- [ ] AI features: 80% usage

### Phase 4: Scale
- [ ] 5,000 schools
- [ ] 250,000 students
- [ ] Marketplace: $100k GMV/month
- [ ] 99.95% uptime
- [ ] <500ms P99 response

### Phase 5: Enterprise
- [ ] 10,000+ schools
- [ ] 1M+ students
- [ ] International: 3+ countries
- [ ] 99.99% uptime
- [ ] Revenue: $1M+/month

---

## Final Recommendations

### DO
✅ Start with modular monolith
✅ Use Prisma with your existing 268-model schema
✅ Build event-driven from day 1
✅ Deploy to production in Month 1
✅ Get real users by Month 3
✅ Measure everything
✅ Extract services only when needed
✅ Keep the full architecture doc as north star

### DON'T
❌ Build 58 services on day 1
❌ Use Kubernetes until Phase 2/3
❌ Add features users don't ask for
❌ Optimize before measuring
❌ Introduce Kafka until Phase 3/4
❌ Split databases prematurely
❌ Over-engineer

### Remember
> "Premature optimization is the root of all evil" - Donald Knuth

> "Make it work, make it right, make it fast" - Kent Beck

> "You aren't gonna need it" (YAGNI) - Extreme Programming

---

## Conclusion

**Keep** `MICROSERVICES_ARCHITECTURE_COMPLETE.md` as your **target architecture** (18-36 months out).

**Use** this document as your **realistic implementation roadmap** (0-18 months).

Start small, validate fast, scale intelligently.

**Next Step**: Build the MVP in Month 1.

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-09  
**Status**: ✅ Ready to Implement

