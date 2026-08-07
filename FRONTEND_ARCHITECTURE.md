# Tekurious ERP - Frontend Architecture (Production Grade 9.9/10)

## Tech Stack

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: pnpm

### Data & State Management
- **HTTP Client**: Axios with interceptors
- **Server State**: TanStack Query v5
- **Global State**: Zustand
- **Forms**: React Hook Form + Zod
- **API Types**: OpenAPI Code Generation

### UI Components
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Tables**: TanStack Table + TanStack Virtual
- **Charts**: Apache ECharts
- **Icons**: Lucide React
- **Dates**: date-fns

### Real-time
- **WebSocket**: Native WebSocket API or Socket.io-client

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Monitoring**: Sentry
- **Logging**: Pino
- **Testing**: Vitest + React Testing Library + Playwright

## Project Structure

```
apps/web/
  src/
    app/                           # Next.js App Router
      (auth)/                      # Auth routes group
        login/
        register/
        forgot-password/
      (dashboard)/                 # Protected routes group
        admin/
        teacher/
        student/
        parent/
        layout.tsx                 # Dashboard layout
      api/                         # API routes (minimal, mostly proxy)
      layout.tsx                   # Root layout
      page.tsx                     # Landing page
    
    features/                      # Feature-based organization
      auth/
        components/
          login-form.tsx
          register-form.tsx
        hooks/
          use-auth.ts
          use-login.ts
        api/
          auth.api.ts
        schemas/
          auth.schema.ts
        types/
          auth.types.ts
        stores/
          auth.store.ts
        pages/
          login-page.tsx
        constants/
          auth.constants.ts
        utils/
          token.utils.ts
      
      students/
        components/
          student-list.tsx
          student-form.tsx
          student-card.tsx
        hooks/
          use-students.ts
          use-student.ts
        api/
          student.api.ts
        schemas/
          student.schema.ts
        types/
          student.types.ts
        pages/
          students-page.tsx
          student-detail-page.tsx
        constants/
          student.constants.ts
      
      attendance/
      teachers/
      fees/
      exams/
      analytics/
      dashboard/
      settings/
    
    components/
      ui/                          # shadcn/ui components
        button.tsx
        input.tsx
        table.tsx
        dialog.tsx
        ...
      shared/                      # Reusable business components
        data-table.tsx
        page-header.tsx
        error-boundary.tsx
        loading-spinner.tsx
        permission-guard.tsx
    
    lib/
      axios.ts                     # Axios instance + interceptors
      query-client.ts              # TanStack Query config
      permissions.ts               # Permission system
      error-mapper.ts              # API error handling
      logger.ts                    # Pino logger
    
    config/
      env.ts                       # Environment configuration
      query-keys.ts                # Query key factory
      routes.ts                    # Route constants
    
    stores/                        # Zustand stores
      auth.store.ts                # Auth state
      ui.store.ts                  # UI state (theme, sidebar)
      permission.store.ts          # Permission state
    
    types/
      api.types.ts                 # Generated API types
      common.types.ts              # Common types
    
    utils/
      cn.ts                        # classnames utility
      format.ts                    # Formatting utilities
      validation.ts                # Common validations
    
    hooks/                         # Global hooks
      use-permission.ts
      use-toast.ts
      use-debounce.ts
    
    middleware.ts                  # Next.js middleware (auth check)
    
  public/
    fonts/
    images/
  
  .env.local
  .env.production
  next.config.js
  tailwind.config.ts
  tsconfig.json
  playwright.config.ts
```

## Authentication Flow

### JWT + Refresh Token (HttpOnly Cookie)

```typescript
// Login Flow
POST /api/v1/auth/login
{
  email: string;
  password: string;
}

Response:
{
  accessToken: string;        // Store in Zustand (memory)
  user: User;
  permissions: Permission[];
}

Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

// Token Refresh Flow
Axios Interceptor detects 401
  ↓
POST /api/v1/auth/refresh (with httpOnly cookie)
  ↓
Get new accessToken
  ↓
Retry original request
```

### Implementation

```typescript
// lib/axios.ts
import axios from 'axios';
import { config } from '@/config/env';
import { authStore } from '@/stores/auth.store';
import { errorMapper } from './error-mapper';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  withCredentials: true, // Important for cookies
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${config.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        authStore.getState().setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Map error to AppError
    const appError = errorMapper(error);
    return Promise.reject(appError);
  }
);
```

## API Layer Architecture

### Service Layer Pattern

```
HTTP Layer (axios.ts)
  ↓
API Layer (*.api.ts) - Maps endpoints
  ↓
Hook Layer (use-*.ts) - TanStack Query integration
  ↓
Component Layer
```

### Example: Students Feature

```typescript
// features/students/api/student.api.ts
import { apiClient } from '@/lib/axios';
import type { Student, CreateStudentDto, StudentFilters } from '../types/student.types';

export const studentApi = {
  async getAll(params: StudentFilters) {
    const { data } = await apiClient.get<{ data: Student[]; meta: any }>('/students', { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<Student>(`/students/${id}`);
    return data;
  },

  async create(dto: CreateStudentDto) {
    const { data } = await apiClient.post<Student>('/students', dto);
    return data;
  },

  async update(id: string, dto: Partial<CreateStudentDto>) {
    const { data } = await apiClient.put<Student>(`/students/${id}`, dto);
    return data;
  },

  async delete(id: string) {
    const { data } = await apiClient.delete(`/students/${id}`);
    return data;
  },
};
```

```typescript
// features/students/hooks/use-students.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/student.api';
import { queryKeys } from '@/config/query-keys';
import { toast } from '@/hooks/use-toast';

export function useStudents(filters: StudentFilters) {
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: () => studentApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast({ title: 'Success', description: 'Student created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
```

```typescript
// config/query-keys.ts
export const queryKeys = {
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.students.lists(), filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    // ...similar structure
  },
  attendance: {
    all: ['attendance'] as const,
    // ...similar structure
  },
} as const;
```

## Permission System

```typescript
// lib/permissions.ts
export type Permission =
  | 'student.create'
  | 'student.view'
  | 'student.edit'
  | 'student.delete'
  | 'attendance.mark'
  | 'attendance.view'
  | 'fee.collect'
  | 'fee.view';

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    'student.create',
    'student.view',
    'student.edit',
    'student.delete',
    'attendance.mark',
    'attendance.view',
    'fee.collect',
    'fee.view',
  ],
  TEACHER: [
    'student.view',
    'attendance.mark',
    'attendance.view',
  ],
  STUDENT: [],
  PARENT: [
    'student.view',
    'attendance.view',
    'fee.view',
  ],
};

export function hasPermission(userPermissions: Permission[], required: Permission): boolean {
  return userPermissions.includes(required);
}
```

```typescript
// components/shared/permission-guard.tsx
import { usePermission } from '@/hooks/use-permission';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const hasPermission = usePermission(permission);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Usage
<PermissionGuard permission="student.create">
  <CreateStudentButton />
</PermissionGuard>
```

## OpenAPI Code Generation

### Setup

```json
// package.json
{
  "scripts": {
    "generate:api": "openapi-typescript http://localhost:3000/api-json -o src/types/api.types.ts"
  },
  "devDependencies": {
    "openapi-typescript": "^7.0.0"
  }
}
```

### Usage

```typescript
// types/api.types.ts (auto-generated)
export interface paths {
  '/api/v1/students': {
    get: operations['StudentsController_findAll'];
    post: operations['StudentsController_create'];
  };
  '/api/v1/students/{id}': {
    get: operations['StudentsController_findOne'];
    put: operations['StudentsController_update'];
    delete: operations['StudentsController_remove'];
  };
}

// Typed API client
import type { paths } from '@/types/api.types';

type StudentListResponse = paths['/api/v1/students']['get']['responses']['200']['content']['application/json'];
```

## Error Handling

```typescript
// lib/error-mapper.ts
import type { AxiosError } from 'axios';

export interface AppError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export function errorMapper(error: AxiosError): AppError {
  if (error.response) {
    const data = error.response.data as any;
    return {
      message: data.message || 'An error occurred',
      code: data.code || 'UNKNOWN_ERROR',
      status: error.response.status,
      details: data.details,
    };
  }

  if (error.request) {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      status: 0,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 0,
  };
}
```

## Optimistic Updates

```typescript
// features/attendance/hooks/use-mark-attendance.ts
export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.markPresent,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.attendance.list(variables.date) });

      // Snapshot previous value
      const previousAttendance = queryClient.getQueryData(queryKeys.attendance.list(variables.date));

      // Optimistically update
      queryClient.setQueryData(queryKeys.attendance.list(variables.date), (old: any) => ({
        ...old,
        data: old.data.map((record: any) =>
          record.studentId === variables.studentId
            ? { ...record, status: 'PRESENT' }
            : record
        ),
      }));

      return { previousAttendance };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.attendance.list(variables.date),
        context?.previousAttendance
      );
      toast({ title: 'Error', description: 'Failed to mark attendance', variant: 'destructive' });
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.list(variables.date) });
    },
  });
}
```

## Virtualization for Large Lists

```typescript
// components/shared/virtualized-table.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedStudentList({ students }: { students: Student[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const student = students[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <StudentRow student={student} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Environment Configuration

```typescript
// config/env.ts
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const config = {
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL'),
  socketUrl: getEnvVar('NEXT_PUBLIC_SOCKET_URL'),
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
```

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000
NEXT_PUBLIC_SENTRY_DSN=

# .env.production
NEXT_PUBLIC_API_URL=https://api.tekurious.com/api/v1
NEXT_PUBLIC_SOCKET_URL=wss://api.tekurious.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// features/students/utils/format-student-name.test.ts
import { describe, it, expect } from 'vitest';
import { formatStudentName } from './format-student-name';

describe('formatStudentName', () => {
  it('should format full name correctly', () => {
    expect(formatStudentName({ firstName: 'John', lastName: 'Doe' }))
      .toBe('John Doe');
  });
});
```

### Component Tests (React Testing Library)
```typescript
// features/students/components/student-list.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentList } from './student-list';

describe('StudentList', () => {
  it('should render student names', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <StudentList />
      </QueryClientProvider>
    );
    expect(screen.getByText('Students')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)
```typescript
// e2e/student-management.spec.ts
import { test, expect } from '@playwright/test';

test('should create a new student', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.goto('/students');
  await page.click('text=Add Student');
  await page.fill('[name="firstName"]', 'John');
  await page.fill('[name="lastName"]', 'Doe');
  await page.click('text=Save');
  
  await expect(page.locator('text=John Doe')).toBeVisible();
});
```

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm test:unit
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm playwright install
      - run: pnpm test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-type-check, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm build
```

## Next Steps

1. **Generate Next.js app in NX workspace**
   ```bash
   npx nx generate @nx/next:app web --directory=apps/web --style=css --appRouter=true --src=true --e2eTestRunner=playwright
   ```

2. **Install dependencies**
   ```bash
   pnpm add @tanstack/react-query @tanstack/react-table @tanstack/react-virtual zustand axios react-hook-form zod date-fns lucide-react clsx tailwind-merge
   pnpm add -D @tanstack/eslint-plugin-query openapi-typescript vitest @testing-library/react @testing-library/jest-dom @playwright/test
   ```

3. **Setup shadcn/ui**
   ```bash
   npx shadcn-ui@latest init
   ```

4. **Generate API types from Swagger**
   ```bash
   pnpm generate:api
   ```

5. **Create initial features** (auth, dashboard, students)

6. **Setup Sentry monitoring**

7. **Configure CI/CD pipeline**

This architecture provides a solid foundation for building a production-grade ERP frontend that scales to handle 592 API endpoints with proper type safety, error handling, and performance optimization.
