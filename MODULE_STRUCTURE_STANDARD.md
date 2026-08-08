# NestJS Module Structure Standard
**Tekurious ERP Backend - Module Organization Guidelines**

---

## 📁 Standard Module Structure

Each module should follow this consistent structure:

```
modules/
├── {module-name}/
│   ├── dto/                    # Data Transfer Objects
│   │   ├── create-{entity}.dto.ts
│   │   ├── update-{entity}.dto.ts
│   │   └── {entity}-filters.dto.ts
│   ├── entities/               # Database entity types (optional)
│   │   └── {entity}.entity.ts
│   ├── services/               # Business logic (if multiple services needed)
│   │   ├── {entity}-crud.service.ts
│   │   └── {entity}-helper.service.ts
│   ├── guards/                 # Module-specific guards (optional)
│   ├── decorators/             # Module-specific decorators (optional)
│   ├── interfaces/             # TypeScript interfaces (optional)
│   ├── {module-name}.controller.ts    # REST API endpoints
│   ├── {module-name}.service.ts       # Main business logic
│   ├── {module-name}.module.ts        # Module definition
│   └── index.ts                        # Public exports (optional)
```

---

## 🏗️ Current Module Organization

### ✅ PROPERLY STRUCTURED MODULES

These modules follow the standard structure:

1. **students/** - ✅ Complete structure
   - `dto/` (create, update, filters)
   - `students.controller.ts`
   - `students.service.ts`
   - `students.module.ts`

2. **auth/** - ✅ Extended structure (complex module)
   - `dto/`
   - `guards/`
   - `decorators/`
   - `strategies/`
   - `services/`
   - `config/`
   - `utils/`
   - `auth.controller.ts`
   - `auth.service.ts`
   - `auth.module.ts`

3. **academic/** - ✅ Standard structure
   - `dto/`
   - `academic.controller.ts`
   - `academic.service.ts`
   - `academic.module.ts`

4. **assessment/** - ✅ Standard structure
5. **content/** - ✅ Standard structure
6. **organizations/** - ✅ Standard structure

### ⚠️ MODULES NEEDING RESTRUCTURE

#### 1. **users/** - NEEDS CLEANUP
**Issue**: Mixed responsibilities - has student/teacher/parent controllers and services

**Current Structure**:
```
users/
├── dto/
├── services/
│   ├── student-profile.service.ts     ❌ Should be in students/
│   ├── teacher-profile.service.ts     ❌ Should be in teachers/
│   ├── parent-profile.service.ts      ❌ Could stay or move to parents/
│   ├── user-permissions.service.ts    ✅ Correct
│   ├── user-search.service.ts         ✅ Correct
│   ├── user-status.service.ts         ✅ Correct
│   └── bulk-operations.service.ts     ✅ Correct
├── users.controller.ts                ✅ Correct
├── teachers.controller.ts             ❌ Should be in teachers/
├── students.controller.ts.backup      ❌ Remove (now in students/)
├── users.service.ts                   ✅ Correct
└── users.module.ts                    ✅ Correct
```

**Recommended Structure**:
```
users/
├── dto/                        # User-specific DTOs only
├── services/
│   ├── user-permissions.service.ts
│   ├── user-search.service.ts
│   ├── user-status.service.ts
│   └── bulk-operations.service.ts
├── users.controller.ts
├── users.service.ts
└── users.module.ts
```

#### 2. **teachers/** - EMPTY (needs implementation)
**Should contain**:
```
teachers/
├── dto/
│   ├── create-teacher.dto.ts
│   ├── update-teacher.dto.ts
│   └── teacher-filters.dto.ts
├── teachers.controller.ts      # Move from users/
├── teachers.service.ts         # Create new or move logic
└── teachers.module.ts          # Create new
```

#### 3. **schools/** - EMPTY (needs implementation or removal)
**Options**:
- Implement if schools need separate module
- Or merge into `organizations/` or `academic/`

### 📊 SIMPLE MODULES (Just Stubs)

These modules exist but have minimal/empty implementation:

1. **analytics/** - Has structure but service is empty
2. **assignments/** - Has structure but service is empty
3. **attendance/** - Has structure but service is empty
4. **content/** - Has structure but needs implementation
5. **erp/** - Has structure but service is empty
6. **live-classes/** - Has structure but service is empty
7. **marketplace/** - Has structure but service is empty
8. **media/** - Has structure but service is empty
9. **notifications/** - Has structure but service is empty
10. **payments/** - Has structure but service is empty
11. **search/** - Has structure but service is empty
12. **subscriptions/** - Has structure but service is empty
13. **sync/** - Has structure but service is empty
14. **system/** - Has structure but service is empty

---

## 🔧 ACTION ITEMS

### IMMEDIATE (Priority 1)

1. ✅ **Students Module** - Already complete and properly structured
2. ⚠️ **Users Module** - Remove/relocate misplaced files:
   - Delete `students.controller.ts.backup`
   - Move `teachers.controller.ts` to `teachers/` module
   - Move `student-profile.service.ts` logic to `students/students.service.ts`
   - Move `teacher-profile.service.ts` logic to `teachers/teachers.service.ts`
   - Keep `parent-profile.service.ts` (parents can stay in users for now)

3. 🆕 **Teachers Module** - Create complete implementation:
   - Create `teachers.module.ts`
   - Create `teachers.service.ts`
   - Move `teachers.controller.ts` from users/
   - Create DTOs (create, update, filters)
   - Register in `app.module.ts`

4. 🗑️ **Schools Module** - Decision needed:
   - Either implement properly OR
   - Remove directory if not needed (schools handled by academic/organizations)

### MEDIUM PRIORITY (Priority 2)

5. **Attendance Module** - Implement CRUD operations
6. **Classes Module** - Implement CRUD operations
7. **Exams/Assessment Module** - Complete implementation
8. **Assignments Module** - Complete implementation
9. **Fees/Payments Module** - Complete implementation

### LOWER PRIORITY (Priority 3)

10. All other stub modules - Implement as needed

---

## 🎯 RECOMMENDED REFACTORING ORDER

### Phase 1: Clean up existing conflicts (TODAY)
1. Remove `users/students.controller.ts.backup` ✅ DONE
2. Remove `users/students.controller.ts` from `users.module.ts` ✅ DONE
3. Verify students module works independently ✅ DONE

### Phase 2: Implement Teachers Module (NEXT)
1. Create `teachers/teachers.module.ts`
2. Create `teachers/teachers.service.ts`
3. Move `users/teachers.controller.ts` to `teachers/`
4. Create `teachers/dto/` with proper DTOs
5. Update `teachers.controller.ts` to use new service
6. Register `TeachersModule` in `app.module.ts`
7. Remove `teachers.controller.ts` from `users.module.ts`

### Phase 3: Clean up Users Module (AFTER Phase 2)
1. Move student-specific logic out of `student-profile.service.ts` to `students/students.service.ts`
2. Move teacher-specific logic out of `teacher-profile.service.ts` to `teachers/teachers.service.ts`
3. Keep only user-related services in `users/services/`
4. Update imports and dependencies

### Phase 4: Implement remaining critical modules
1. Classes
2. Attendance  
3. Exams
4. Assignments
5. Fees

---

## 📝 NAMING CONVENTIONS

### Files
- Controllers: `{module-name}.controller.ts` (e.g., `students.controller.ts`)
- Services: `{module-name}.service.ts` (e.g., `students.service.ts`)
- Modules: `{module-name}.module.ts` (e.g., `students.module.ts`)
- DTOs: `{action}-{entity}.dto.ts` (e.g., `create-student.dto.ts`)
- Filters: `{entity}-filters.dto.ts` (e.g., `student-filters.dto.ts`)

### Classes
- Controllers: `{ModuleName}Controller` (e.g., `StudentsController`)
- Services: `{ModuleName}Service` (e.g., `StudentsService`)
- Modules: `{ModuleName}Module` (e.g., `StudentsModule`)
- DTOs: `{Action}{Entity}Dto` (e.g., `CreateStudentDto`)

### Directories
- Use kebab-case: `students/`, `live-classes/`, `parent-profiles/`
- Subdirectories: `dto/`, `services/`, `guards/`, `decorators/`, `interfaces/`

---

## ✅ MODULE CHECKLIST

When creating a new module, ensure it has:

- [ ] `dto/` directory with at least:
  - [ ] `create-{entity}.dto.ts`
  - [ ] `update-{entity}.dto.ts`
  - [ ] `{entity}-filters.dto.ts`
  - [ ] `index.ts` (exports all DTOs)
- [ ] `{module}.controller.ts` with:
  - [ ] CRUD endpoints (GET, POST, PATCH, DELETE)
  - [ ] Proper guards and decorators
  - [ ] API documentation tags
- [ ] `{module}.service.ts` with:
  - [ ] Business logic implementation
  - [ ] Database operations via Prisma
  - [ ] Event emissions
  - [ ] Error handling
- [ ] `{module}.module.ts` with:
  - [ ] Proper imports (DatabaseModule, EventsModule)
  - [ ] Controller registration
  - [ ] Service provider
  - [ ] Exports (if needed by other modules)
- [ ] Registration in `app.module.ts`
- [ ] No duplicate controllers/services in other modules

---

**Last Updated**: 2026-08-08
**Status**: Students module complete ✅ | Teachers module next 🔄
