# Tekurious ERP - Frontend

Production-grade Next.js 15 frontend for the Tekurious Education ERP platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (to be setup)
- **State Management**:
  - Server State: TanStack Query v5
  - Global UI State: Zustand
  - Forms: React Hook Form + Zod
- **HTTP Client**: Axios (with interceptors)
- **Authentication**: JWT + HttpOnly Refresh Token Cookies
- **Tables**: TanStack Table + TanStack Virtual
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + Playwright

## Architecture Highlights

### 🔐 Authentication Flow
```
Login → Access Token (Memory) + Refresh Token (HttpOnly Cookie)
  ↓
401 → Auto-refresh via /auth/refresh
  ↓
New Access Token → Retry Request
```

### 📁 Folder Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   └── permission-guard.tsx
├── config/              # Configuration
│   ├── env.ts          # Environment variables
│   ├── query-keys.ts   # TanStack Query key factory
│   └── routes.ts       # Route constants
├── features/            # Feature modules (to be created)
│   ├── auth/
│   ├── students/
│   ├── teachers/
│   └── ...
├── hooks/               # Custom React hooks
│   └── use-auth.ts
├── lib/                 # Core utilities
│   ├── axios.ts        # HTTP client with interceptors
│   ├── query-client.ts # TanStack Query config
│   ├── permissions.ts  # Permission system
│   ├── error-mapper.ts # API error handling
│   └── utils.ts        # Common utilities
├── providers/           # React context providers
│   ├── query-provider.tsx
│   └── auth-provider.tsx
├── services/            # API service layer
│   └── auth.service.ts
├── stores/              # Zustand stores
│   ├── auth.store.ts
│   └── ui.store.ts
└── types/               # TypeScript types
    └── index.ts
```

### 🔑 Permission System

Component-level guards:
```tsx
import { Can } from '@/components/permission-guard';

<Can permission="student.create">
  <CreateStudentButton />
</Can>
```

Hook-based checks:
```tsx
const { hasPermission, hasRole } = usePermissions();

if (hasPermission('student.delete')) {
  // Show delete button
}
```

### 🌐 API Service Pattern

All API calls go through service layer:
```tsx
// services/student.service.ts
export const studentService = {
  async getAll(filters: StudentFilters) {
    const { data } = await apiClient.get('/students', { params: filters });
    return data;
  },
};

// Hook usage
const { data } = useQuery({
  queryKey: queryKeys.students.list(filters),
  queryFn: () => studentService.getAll(filters),
});
```

### 📊 Query Key Factory

Centralized query key management:
```tsx
queryKeys.students.all        // ['students']
queryKeys.students.list(filters) // ['students', 'list', filters]
queryKeys.students.detail(id)    // ['students', 'detail', id]
```

## Setup Instructions

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Setup shadcn/ui (Next Step)
```bash
cd apps/web
npx shadcn-ui@latest init
```

### 3. Environment Variables

Copy `.env.local` and configure:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000
```

### 4. Development

```bash
# Start frontend (from root)
nx serve web

# Or from web directory
cd apps/web
npm run dev
```

### 5. OpenAPI Code Generation (To Be Setup)

Generate TypeScript types from NestJS Swagger:
```bash
# Install OpenAPI generator
npm install -D openapi-typescript-codegen

# Generate (after backend Swagger is ready)
npx openapi-typescript http://localhost:3000/api-json -o src/types/api.ts
```

## Core Features Implemented

✅ Axios client with auto-refresh interceptors  
✅ TanStack Query setup with error handling  
✅ Auth store (Zustand)  
✅ UI store (Zustand)  
✅ Permission system  
✅ Error mapping  
✅ Query key factory  
✅ Route constants  
✅ Environment config  
✅ Auth service  
✅ Auth hooks  
✅ Permission guards  
✅ Common utilities  

## Next Steps

1. **Setup shadcn/ui** - Install and configure component library
2. **Create first feature module** - Auth pages (login/register)
3. **Setup OpenAPI generation** - Auto-generate API types from backend
4. **Create dashboard layout** - Role-based navigation
5. **Implement students module** - First data feature with table + virtualization
6. **Add toast notifications** - Use shadcn/ui toast
7. **Setup testing** - Vitest config + first tests
8. **Setup CI/CD** - GitHub Actions for frontend

## Development Guidelines

### API Calls
- Always use service layer, never call `apiClient` directly in components
- Use TanStack Query for all server state
- Implement optimistic updates for mutations

### State Management
- **Server state** → TanStack Query
- **Auth state** → `auth.store.ts`
- **UI state** → `ui.store.ts`
- **Form state** → React Hook Form
- **URL state** → Next.js router

### Error Handling
- All API errors are mapped to `AppError` type
- Errors automatically show toast notifications
- Component-level error boundaries for graceful failures

### Performance
- Use TanStack Virtual for large lists (>1000 items)
- Implement pagination for all tables
- Use React.memo for expensive components
- Lazy load feature modules

### Security
- Never store refresh tokens in localStorage
- Always use HttpOnly cookies for refresh tokens
- Validate permissions on both frontend and backend
- Sanitize user inputs

## Scripts

```bash
# Development
nx serve web              # Start dev server
nx build web             # Production build
nx lint web              # Lint code
nx test web              # Run tests

# Testing
nx test web --watch      # Watch mode
nx e2e web-e2e          # E2E tests
```

## API Documentation

Backend Swagger UI: http://localhost:3000/api

## Contributing

1. Always check TypeScript errors before committing
2. Follow the existing folder structure
3. Add tests for new features
4. Update this README when adding new patterns

## Notes

- This frontend connects to the NestJS backend running on port 3000
- All 592 API endpoints will be typed via OpenAPI generation
- Authentication uses JWT access tokens (memory) + HttpOnly refresh cookies
- Permission system supports 100+ granular permissions
