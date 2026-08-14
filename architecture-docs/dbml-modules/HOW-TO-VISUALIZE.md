# 🎨 How to Visualize Your DBML Modules

## 📋 What You Have

Your complete Edubharti schema has been split into **39 focused modules**:
- **268 tables** total
- **105 internal relationships** (within modules)
- **Color-coded by category** for visual organization
- **Cross-module references documented** but not rendered (keeps diagrams clean)

## 🌈 Color Scheme

Each module is color-coded by category:

- **🔵 Blue (#4A90E2)** - Foundation (Auth, RBAC, Users, Multi-tenancy, Geography)
- **🟢 Green (#50C878)** - Academic Core (Schools, Students, Teachers, Attendance)
- **🟣 Purple (#9B59B6)** - Assessment (Exams, Assignments, Grades)
- **🟠 Orange (#E67E22)** - Content & Learning (Content, Media, AR/VR, Live Classes)
- **🟡 Gold (#F39C12)** - Finance (Fees, Payments, Subscriptions, Marketplace)
- **🟦 Teal (#16A085)** - ERP (Hostel, Library, Transport, Inventory, HR)
- **🔴 Red (#E74C3C)** - Platform Services (AI, Notifications, Messaging, Analytics)
- **⚫ Gray (#7F8C8D)** - Infrastructure (System, API, Jobs, Audit, Events)

## 🚀 Quick Start - Visualize a Module

### Option 1: Using dbdiagram.io (Recommended)

1. **Open dbdiagram.io**
   - Go to https://dbdiagram.io/
   - Click "Go to App" or sign in (free account)

2. **Import a Module**
   - Click "Import" → "From DBML"
   - Open any `.dbml` file from `dbml-modules/` folder
   - Copy the entire content
   - Paste into the import dialog
   - Click "Import"

3. **View Your Diagram**
   - ✅ Tables appear with **color-coded headers**
   - ✅ **Relationship lines** connect related tables
   - ✅ **Foreign keys** show with arrows
   - ✅ **Cascade rules** (Cascade, Set Null, Restrict) are visible

4. **Interact with Diagram**
   - Drag tables to rearrange layout
   - Zoom in/out for detail
   - Click relationships to see details
   - Export as PNG, PDF, or SQL

### Option 2: Using DBML Renderer Extension (VS Code)

1. Install "DBML Renderer" extension in VS Code
2. Open any `.dbml` file
3. Click "Preview" icon or press `Ctrl+Shift+V`
4. View diagram directly in VS Code

## 📊 Recommended Viewing Order

### Start Small (3-8 tables per module)
```
1. 01-authentication.dbml       (8 tables, 1 relationship)
2. 05-geography-address.dbml    (6 tables, 4 relationships)
3. 09-timetable-rooms.dbml      (4 tables, 2 relationships)
```

### Core Academic Modules (8-13 tables)
```
4. 06-school-structure.dbml     (8 tables, 6 relationships)
5. 07-subjects-curriculum.dbml  (9 tables, 5 relationships)
6. 08-student-teacher.dbml      (11 tables, 4 relationships)
7. 11-content-media.dbml        (13 tables, 7 relationships)
```

### Complex Business Logic (9-13 tables)
```
8. 02-rbac-permissions.dbml     (11 tables, 11 relationships)
9. 12-assessment-exams.dbml     (9 tables, 6 relationships)
10. 20-erp-transport-inventory.dbml (13 tables, 13 relationships)
```

## 🔗 Understanding Relationships

### Internal Relationships (Rendered)
These connect tables **within the same module** and appear as lines in the diagram:

```dbml
Ref: user_sessions.userId > users.id [delete: Cascade]
Ref: role_permissions.roleId > roles.id [delete: Cascade]
```

**Relationship Types:**
- `>` - Many-to-one (FK on left table)
- `<` - One-to-many (FK on right table)  
- `-` - One-to-one

**Cascade Rules:**
- `[delete: Cascade]` - Delete child when parent is deleted
- `[delete: Set Null]` - Set FK to null when parent is deleted
- `[delete: Restrict]` - Prevent parent deletion if children exist

### Cross-Module References (Documented, Not Rendered)
These reference tables in **other modules** and are documented as comments:

```dbml
// Ref: student_profiles.userId - users.id [delete: Cascade] (cross-module)
```

This keeps diagrams clean while documenting all relationships.

## 🎯 Module Categories

### Foundation Layer (5 modules - Blue 🔵)
- `01-authentication.dbml` - User auth, sessions, 2FA
- `02-rbac-permissions.dbml` - Roles, permissions, RBAC
- `03-user-management.dbml` - User profiles, preferences
- `04-multi-tenancy.dbml` - Organizations, branches, tenants
- `05-geography-address.dbml` - Countries, states, addresses

### Academic Core (7 modules - Green 🟢)
- `06-school-structure.dbml` - Schools, classes, sections
- `07-subjects-curriculum.dbml` - Subjects, chapters, topics
- `08-student-teacher.dbml` - Students, teachers, parents
- `09-timetable-rooms.dbml` - Timetables, rooms, slots
- `10-attendance.dbml` - Attendance tracking, biometric
- `30-certificates-ids.dbml` - Certificates, ID cards
- `37-gamification.dbml` - Badges, leaderboards, points

### Content & Learning (3 modules - Orange 🟠)
- `11-content-media.dbml` - Content, media, books
- `14-arvr-learning.dbml` - AR/VR, 3D models, metaverse
- `15-live-classes.dbml` - Live classes, recordings

### Assessment (2 modules - Purple 🟣)
- `12-assessment-exams.dbml` - Exams, questions, attempts
- `13-assignments-grades.dbml` - Assignments, submissions, grades

### Finance (4 modules - Gold 🟡)
- `16-fee-management.dbml` - Fee structures, payments
- `17-payments-billing.dbml` - Payment processing, refunds
- `18-subscriptions.dbml` - Subscriptions, licenses
- `22-marketplace.dbml` - Marketplace, orders

### ERP (3 modules - Teal 🟦)
- `19-erp-hostel-library.dbml` - Hostel, library management
- `20-erp-transport-inventory.dbml` - Transport, inventory
- `21-erp-payroll-hr.dbml` - Payroll, HR, leave management

### Platform Services (7 modules - Red 🔴)
- `23-ai-chatbot.dbml` - AI chatbot, conversations
- `24-ai-recommendations.dbml` - AI predictions, learning styles
- `25-ai-embeddings.dbml` - Vector embeddings, RAG
- `26-notifications.dbml` - Notifications, email, SMS
- `27-messaging-chat.dbml` - Messaging, chat, announcements
- `28-analytics-reporting.dbml` - Analytics, KPIs, reports
- `29-search-discovery.dbml` - Search indexes, suggestions

### Infrastructure (8 modules - Gray ⚫)
- `31-audit-logging.dbml` - Audit logs, activity tracking
- `32-integration-apis.dbml` - Integrations, webhooks
- `33-events-workflows.dbml` - Events, workflows, approvals
- `34-system-config.dbml` - System configuration, feature flags
- `35-api-management.dbml` - API rate limits, usage
- `36-background-jobs.dbml` - Background jobs, cache
- `38-government-compliance.dbml` - Government reports, compliance
- `39-learning-paths.dbml` - Learning paths, progress

## 💡 Pro Tips

### Combining Modules
To see relationships across modules:
1. Copy contents from multiple related modules
2. Paste all into a single dbdiagram.io project
3. Example: Combine `06-school-structure` + `08-student-teacher` + `10-attendance`

### Export Options
- **PNG** - For documentation, presentations
- **PDF** - For printing, reports
- **SQL** - Generate actual database schema
- **DBML** - Save your customized layout

### Layout Optimization
- Auto-arrange: Click "Arrange" button in dbdiagram.io
- Manual: Drag tables for better readability
- Group related tables visually
- Use zoom for large modules

## 🐛 Troubleshooting

### "Table does not exist" Error
- ✅ **FIXED**: Only internal relationships are included
- Cross-module references are documented as comments
- Each module is self-contained and imports cleanly

### Diagram Too Large
- Start with smaller modules (3-6 tables)
- Use zoom controls to navigate
- Export as PDF for full view

### Can't See Relationships
- Ensure you're using the **ENHANCED** versions (with colors)
- Check that Ref statements are present (not just comments)
- Some modules have few internal relationships by design

## 📁 File Structure

```
dbml-modules/
├── 00-INDEX.md                    # Complete module catalog
├── HOW-TO-VISUALIZE.md           # This guide
├── 01-authentication.dbml         # Module files (39 total)
├── 02-rbac-permissions.dbml
├── ...
└── 39-learning-paths.dbml
```

## ✅ Quality Metrics

- ✅ 268 tables (100% coverage of Prisma schema)
- ✅ No duplicate tables across modules
- ✅ 105 internal relationships mapped
- ✅ Color-coded by 8 categories
- ✅ Clean imports (no cross-module errors)
- ✅ Complete documentation in each module

## 🔄 Regenerating Modules

If you need to regenerate with modifications:

```bash
node generate-modular-dbml-enhanced.js
```

This will regenerate all 39 modules with:
- Updated table definitions
- Color-coding by category
- Internal relationships only
- Cross-module references documented

## 🎓 Next Steps

1. **Explore Foundation** - Start with authentication and RBAC
2. **Review Academic Core** - Understand school/student structure
3. **Study Business Logic** - Fees, payments, assessments
4. **Analyze Platform** - AI, notifications, analytics
5. **Combine Related Modules** - See full feature workflows

Happy Visualizing! 🎨📊
