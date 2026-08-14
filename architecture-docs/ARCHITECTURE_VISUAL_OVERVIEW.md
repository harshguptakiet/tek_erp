# Edubharti Platform - Visual Architecture Overview

**Version**: 2.0.0  
**Date**: 2026-07-09

---

## System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACES                                │
│  Web App (React) | Mobile Apps (React Native) | Admin Portal | Govt Portal│
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Kong/AWS)                              │
│  Authentication | Rate Limiting | Routing | Load Balancing              │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       MICROSERVICES LAYER                                │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Core        │  │  Academic    │  │  Learning &  │  │  Commerce  │ │
│  │  Platform    │  │  Domain      │  │  Content     │  │  & Billing │ │
│  │  (8 svcs)    │  │  (10 svcs)   │  │  (12 svcs)   │  │  (8 svcs)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Analytics & │  │  ERP &       │  │  Infra       │                  │
│  │  Intelligence│  │  Operations  │  │  Services    │                  │
│  │  (6 svcs)    │  │  (8 svcs)    │  │  (6 svcs)    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT BUS & MESSAGING                            │
│           Redis Streams / Kafka | BullMQ Job Queue                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA & STORAGE LAYER                             │
│                                                                           │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │PostgreSQL  │  │  Redis   │  │Elastic   │  │ MongoDB  │             │
│  │(Primary DB)│  │  (Cache) │  │(Search)  │  │(Docs)    │             │
│  └────────────┘  └──────────┘  └──────────┘  └──────────┘             │
│                                                                           │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐                            │
│  │   AWS S3   │  │TimescaleDB│  │Data      │                            │
│  │  (Files)   │  │(Time-series)│(Warehouse)│                            │
│  └────────────┘  └──────────┘  └──────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                               │
│  Payment Gateways | Video Conferencing | SMS/Email | Government APIs    │
│  Razorpay/Stripe  | Zoom/Google Meet  | Twilio/MSG91| UDISE+/DigiLocker│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Service Dependencies (Simplified)

```
                        ┌──────────────┐
                        │ API Gateway  │
                        └──────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼─────┐ ┌─────▼────┐  ┌─────▼────────┐
         │Auth Service│ │User Svc  │  │Tenant Service│
         └────────────┘ └──────────┘  └──────────────┘
                │
        ┌───────┴────────┬────────────────────┐
        │                │                    │
  ┌─────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
  │Organization│  │School Service│  │Student Service  │
  │Service     │  └──────────────┘  └─────────────────┘
  └────────────┘
        │
  ┌─────┴──────────────────────────────┐
  │                                    │
┌─▼──────────┐              ┌─────────▼───────┐
│Class       │              │Subscription     │
│Service     │              │Service          │
└────────────┘              └─────────────────┘
  │                                  │
  ├──────┬──────────┐               │
  │      │          │               │
┌─▼─────▼──┐  ┌────▼──────┐  ┌─────▼──────┐
│Timetable │  │Attendance │  │Payment     │
│Service   │  │Service    │  │Service     │
└──────────┘  └───────────┘  └────────────┘
```

---

## Data Flow Example: Student Enrollment

```
1. User Action (Web/Mobile)
         │
         ▼
2. API Gateway
   ├─ Authentication (auth-service)
   ├─ Rate Limiting
   └─ Route to student-service
         │
         ▼
3. Student Service
   ├─ Validate enrollment data
   ├─ Check school capacity (school-service)
   ├─ Check class availability (class-service)
   ├─ Create student record (PostgreSQL)
   └─ Publish STUDENT_ENROLLED event
         │
         ▼
4. Event Bus (Redis Streams)
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
5. Event Consumers
   ├─ class-service: Assign to section
   ├─ fee-service: Create fee record
   ├─ certificate-service: Generate ID card
   ├─ notification-service: Send welcome email
   └─ analytics-service: Update enrollment metrics
```

---

## Service Distribution by Domain

### Core Platform Services (8)
```
auth-service ──────────┐
user-service           │
organization-service   ├─── Core Platform
tenant-service         │    (Foundation)
notification-service   │
workflow-service       │
integration-service    │
api-gateway ───────────┘
```

### Academic Domain Services (10)
```
academic-service ──────┐
school-service         │
student-service        │
teacher-service        ├─── Academic
class-service          │    (School Mgmt)
timetable-service      │
attendance-service     │
subject-service        │
counseling-service     │
scholarship-service ───┘
```

### Learning & Content Services (12)
```
content-service ───────┐
media-service          │
ar-vr-service          │
3d-model-service       │
live-class-service     ├─── Learning
recording-service      │    (Education Delivery)
assignment-service     │
assessment-service     │
grading-service        │
question-bank-service  │
learning-path-service  │
gamification-service ──┘
```

### Commerce & Billing Services (8)
```
subscription-service ──┐
license-service        │
payment-service        ├─── Commerce
billing-service        │    (Revenue)
fee-service            │
marketplace-service    │
payout-service         │
pricing-service ───────┘
```

### Analytics & Intelligence (6)
```
analytics-service ─────┐
reporting-service      │
dashboard-service      ├─── Intelligence
ai-recommendation-svc  │    (Insights)
chatbot-service        │
search-service ────────┘
```

### ERP & Operations (8)
```
library-service ───────┐
transport-service      │
hostel-service         ├─── Operations
inventory-service      │    (School ERP)
hr-payroll-service     │
event-service          │
certificate-service    │
disciplinary-service ──┘
```

### Infrastructure Services (6)
```
messaging-service ─────┐
email-service          │
sms-service            ├─── Infrastructure
storage-service        │    (Support)
cache-service          │
job-scheduler-service ─┘
```

---

## Database Distribution (268 Models)

```
┌─────────────────────────────────────────────────┐
│            PostgreSQL Databases                  │
├─────────────────────────────────────────────────┤
│ auth_db         (12 models)  - Auth Service     │
│ user_db         (12 models)  - User Service     │
│ org_db          (10 models)  - Organization     │
│ academic_db     (40 models)  - Academic Services│
│ content_db      (35 models)  - Content Services │
│ assessment_db   (15 models)  - Assessment       │
│ commerce_db     (30 models)  - Commerce Services│
│ analytics_db    (25 models)  - Analytics        │
│ erp_db          (45 models)  - ERP Services      │
│ infra_db        (35 models)  - Infrastructure   │
│ shared_db       (9 models)   - Shared/Tenant    │
└─────────────────────────────────────────────────┘
         │
         ├──────────► Redis (Caching + Job Queue)
         ├──────────► Elasticsearch (Search Index)
         ├──────────► MongoDB (AR/VR Metadata)
         └──────────► TimescaleDB (GPS/Metrics)
```

---

## Event Flow Architecture

```
┌──────────────────┐     Event      ┌─────────────────┐
│  Domain Services ├────────────────►│ Redis Streams/  │
│  (Publishers)    │                 │ Kafka Event Bus │
└──────────────────┘                 └────────┬────────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                        ▼                     ▼                     ▼
                ┌───────────────┐     ┌──────────────┐     ┌──────────────┐
                │ Same Domain   │     │Cross-Domain  │     │External      │
                │ Subscribers   │     │Subscribers   │     │Integrations  │
                └───────────────┘     └──────────────┘     └──────────────┘
                        │                     │                     │
                        ▼                     ▼                     ▼
                  Update State          Trigger Actions       Sync External
```

### Key Event Types (50+)
```
Authentication Events:
├─ USER_REGISTERED, USER_LOGGED_IN, PASSWORD_CHANGED
└─ MFA_ENABLED, SESSION_EXPIRED

Academic Events:
├─ STUDENT_ENROLLED, STUDENT_PROMOTED, ATTENDANCE_MARKED
├─ TIMETABLE_GENERATED, CLASS_CREATED
└─ LEAVE_APPROVED, LOW_ATTENDANCE_ALERT

Content Events:
├─ CONTENT_UPLOADED, CONTENT_PUBLISHED, CONTENT_VIEWED
├─ AR_MARKER_SCANNED, VR_SESSION_STARTED
└─ ASSIGNMENT_SUBMITTED, EXAM_COMPLETED

Commerce Events:
├─ SUBSCRIPTION_CREATED, PAYMENT_SUCCESS, LICENSE_ASSIGNED
├─ FEE_PAYMENT_RECEIVED, INVOICE_GENERATED
└─ PRODUCT_PURCHASED, PAYOUT_PROCESSED

System Events:
├─ JOB_STARTED, JOB_COMPLETED, JOB_FAILED
├─ WORKFLOW_APPROVED, SYNC_COMPLETED
└─ NOTIFICATION_SENT, ERROR_LOGGED
```

---

## Scaling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                  Load Balancer / Ingress                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
┌───────▼────┐ ┌──────▼────┐ ┌─────▼─────┐ ┌────▼──────┐
│ Service    │ │ Service   │ │ Service   │ │ Service   │
│ Replica 1  │ │ Replica 2 │ │ Replica 3 │ │ Replica N │
└────────────┘ └───────────┘ └───────────┘ └───────────┘
```

### Horizontal Scaling by Service Type
```
High Traffic (10+ replicas):
  ├─ api-gateway, content-service, search-service
  └─ notification-service

Medium Traffic (3-5 replicas):
  ├─ auth-service, user-service, student-service
  └─ assignment-service, assessment-service

Low Traffic (1-2 replicas):
  ├─ library-service, hostel-service
  └─ certificate-service, payout-service

Background Services (2-3 replicas):
  ├─ job-scheduler-service, integration-service
  └─ workflow-service
```

---

## Multi-Region Deployment

```
┌──────────────────────────────────────────────────────────┐
│                  Global Load Balancer                     │
│                    (CloudFront)                           │
└─────────────┬───────────────────────┬────────────────────┘
              │                       │
    ┌─────────▼─────────┐   ┌────────▼─────────┐
    │  Region: Mumbai   │   │ Region: Singapore │
    │  (Primary)        │   │ (Secondary)       │
    ├───────────────────┤   ├──────────────────┤
    │ K8s Cluster       │   │ K8s Cluster      │
    │ PostgreSQL Master │   │ PostgreSQL Read  │
    │ Redis Master      │   │ Redis Replica    │
    │ All Services      │   │ All Services     │
    └───────────────────┘   └──────────────────┘
              │                       │
              └───────Replication─────┘
```

---

## Implementation Roadmap Visual

```
Month 1-3:     ████████ Core Platform
Month 4-6:     ████████ Academic Foundation
Month 7-10:    ████████████ Learning & Content
Month 11-13:   ██████ Commerce & Marketplace
Month 14-16:   ██████ Analytics & Intelligence
Month 17-20:   ████████ ERP & Operations
Month 21-24:   ████████ Infrastructure & Scale
```

### Phase Details
```
Phase 1 (M1-3):   8 services   ████████░░░░░░░░░░░░░░░ 14%
Phase 2 (M4-6):   8 services   ████████████████░░░░░░░░ 28%
Phase 3 (M7-10): 10 services   ████████████████████████ 45%
Phase 4 (M11-13): 8 services   ████████████████████████ 59%
Phase 5 (M14-16): 6 services   ████████████████████████ 69%
Phase 6 (M17-20): 10 services  ████████████████████████ 86%
Phase 7 (M21-24): 8 services   ████████████████████████ 100%
```

---

## Monitoring & Observability Stack

```
┌─────────────────────────────────────────────────────────┐
│                Application Services                      │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
    ┌────────▼───────┐          ┌────────▼───────┐
    │   Logs         │          │   Metrics      │
    │   (JSON)       │          │   (Numbers)    │
    └────────┬───────┘          └────────┬───────┘
             │                            │
    ┌────────▼──────────┐        ┌───────▼────────────┐
    │ Logstash/Fluentd  │        │   Prometheus       │
    └────────┬──────────┘        └───────┬────────────┘
             │                            │
    ┌────────▼──────────┐        ┌───────▼────────────┐
    │  Elasticsearch    │        │     Grafana        │
    └────────┬──────────┘        └────────────────────┘
             │
    ┌────────▼──────────┐
    │     Kibana        │
    └───────────────────┘

    ┌───────────────────────────────────────┐
    │  Distributed Tracing                  │
    │  (Jaeger/Zipkin)                      │
    └───────────────────────────────────────┘
             │
    ┌────────▼──────────┐
    │   Service Mesh    │
    │   (Istio)         │
    └───────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│  Layer 7: Application Security                      │
│  ├─ Input Validation                                │
│  ├─ Output Encoding                                 │
│  ├─ Authentication (JWT)                            │
│  └─ Authorization (RBAC)                            │
├─────────────────────────────────────────────────────┤
│  Layer 6: API Security                              │
│  ├─ API Gateway Authentication                      │
│  ├─ Rate Limiting                                   │
│  ├─ API Key Management                              │
│  └─ Request/Response Validation                     │
├─────────────────────────────────────────────────────┤
│  Layer 5: Transport Security                        │
│  ├─ TLS 1.3 (HTTPS)                                 │
│  ├─ mTLS (Service-to-Service)                       │
│  └─ Certificate Management                          │
├─────────────────────────────────────────────────────┤
│  Layer 4: Network Security                          │
│  ├─ VPC with Private Subnets                        │
│  ├─ Security Groups                                 │
│  ├─ Network ACLs                                    │
│  └─ WAF (Web Application Firewall)                  │
├─────────────────────────────────────────────────────┤
│  Layer 3: Data Security                             │
│  ├─ Encryption at Rest                              │
│  ├─ Encryption in Transit                           │
│  ├─ Sensitive Data Encryption (App-level)           │
│  └─ Key Management (AWS KMS/Vault)                  │
├─────────────────────────────────────────────────────┤
│  Layer 2: Infrastructure Security                   │
│  ├─ Container Security Scanning                     │
│  ├─ Image Vulnerability Scanning                    │
│  ├─ Secrets Management                              │
│  └─ RBAC for Kubernetes                             │
├─────────────────────────────────────────────────────┤
│  Layer 1: Monitoring & Compliance                   │
│  ├─ Audit Logging                                   │
│  ├─ Security Monitoring (SIEM)                      │
│  ├─ Compliance Scanning                             │
│  └─ Incident Response                               │
└─────────────────────────────────────────────────────┘
```

---

**Status**: ✅ Complete Visual Overview  
**All 880 requirements covered across 58 microservices**  
**Ready for implementation**

