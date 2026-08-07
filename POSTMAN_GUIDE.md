# Tekurious ERP - Postman & OpenAPI Setup Guide

This guide explains how to import and use the **Tekurious ERP OpenAPI 3.0 Specification** in Postman.

---

## 🚀 Quick Start Options

### Option 1: Import via Direct URL (Recommended when App is Running)

1. Start the Tekurious ERP application:
   ```bash
   npm run dev
   ```
2. Open **Postman**.
3. Click the **Import** button in the top-left corner.
4. Paste the URL:
   ```text
   http://localhost:3000/openapi.json
   ```
   *(Alternative URL: `http://localhost:3000/api/docs-json`)*
5. Click **Import**. Postman will automatically generate a complete API Collection with all modules & endpoints categorized by tags!

---

### Option 2: Import via `openapi.json` File (Offline Mode)

1. Generate or locate `openapi.json` in the project root directory:
   ```bash
   npm run openapi:generate
   ```
2. Open **Postman**.
3. Click **Import** -> **Files** -> Select `openapi.json` from `k:\PROJECTS\tek_erp\openapi.json`.
4. Click **Import**.

---

### Option 3: Interactive Swagger UI

View and test endpoints interactively in your browser at:
- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **API Base URL**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

---

## 🔐 Authenticating Requests in Postman

Most endpoints in Tekurious ERP require a JWT Bearer token.

1. In Postman, navigate to the **Auth** folder in the imported collection.
2. Send a `POST` request to `/api/v1/auth/login` (or `/api/v1/auth/register`).
3. Copy the returned `accessToken`.
4. In Postman:
   - Click on the imported **Tekurious ERP API** collection root.
   - Go to the **Authorization** tab.
   - Set **Type** to `Bearer Token`.
   - Paste your `accessToken` into the **Token** field.
5. All requests in the collection will automatically inherit this Bearer token!

---

## 📦 Included API Modules

The generated OpenAPI specification includes endpoints for:
- 🔑 **Auth**: Login, Register, Password Reset, 2FA, OAuth, Sessions
- 👤 **Users**: Profiles, Roles, Permissions, GDPR Data Export, Activity Log
- 🎓 **Academic**: Courses, Classes, Curriculum, Schedules
- 📝 **Assignments & Assessment**: Grading, Submissions, Exams, Quizzes
- 📊 **Analytics**: Dashboards, Performance Metrics, System Reports
- 🏢 **Organizations**: Multi-tenant Management, Departments
- 💳 **Payments & Subscriptions**: Billing, Invoices, Gateway Integration
- 🔔 **Notifications**: System Alerts, Email/SMS Messages
- 📁 **Media & Content**: Uploads, Assets, Storage
- 🔄 **Sync & ERP**: Data Synchronization, External ERP Integrations
