# Frontend Quick Start Guide

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18.x
npm or yarn
```

### Installation
```bash
# Install dependencies
npm install

# or
yarn install
```

### Environment Setup
Create `.env.local` in `apps/web/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:4200
```

### Run Development Server
```bash
# Start the development server
npm run dev

# or
yarn dev
```

The app will be available at `http://localhost:4200`

---

## 📁 Project Structure

```
apps/web/src/
├── app/                          # Next.js 15 App Router pages
│   ├── auth/                     # Authentication pages
│   │   ├── register/             # Email registration
│   │   ├── register-phone/       # Phone registration
│   │   ├── login/                # Login
│   │   ├── 2fa-verify/           # 2FA verification
│   │   ├── forgot-password/      # Password reset request
│   │   ├── reset-password/       # Password reset confirmation
│   │   ├── verify-email/         # Email verification
│   │   ├── verify-email-sent/    # Post-registration confirmation
│   │   └── oauth/callback/       # OAuth callback handler
│   └── account/security/         # Security settings
│       ├── page.tsx              # Security dashboard
│       ├── change-password/      # Change password
│       ├── devices/              # Device management
│       ├── login-history/        # Login history
│       └── 2fa/                  # 2FA management
│           ├── setup/            # 2FA setup wizard
│           ├── disable/          # Disable 2FA
│           └── backup-codes/     # Backup codes management
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── checkbox.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── badge.tsx
│   └── auth/                     # Auth-specific components
│       └── password-strength-meter.tsx
│
├── services/                     # Backend API integration
│   ├── auth-complete.service.ts  # 35+ auth methods
│   └── user.service.ts           # 30+ user methods
│
├── hooks/                        # React Query hooks
│   ├── use-auth-mutations.ts     # Auth mutations
│   └── use-auth-queries.ts       # Auth queries
│
├── types/                        # TypeScript definitions
│   ├── auth.types.ts             # Auth types
│   ├── user.types.ts             # User types
│   └── index.ts
│
├── stores/                       # Zustand state management
│   └── auth.store.ts             # Auth state
│
├── lib/                          # Utilities
│   ├── axios.ts                  # HTTP client with interceptors
│   ├── utils.ts                  # Helper functions
│   └── permissions.ts            # Permission helpers
│
└── config/                       # Configuration
    └── routes.ts                 # Route definitions
```

---

## 🔐 Authentication Flow

### 1. Registration
**Email Registration**: `/auth/register`
- User enters email, password, name
- Password strength validation
- Email verification sent
- Redirects to `/auth/verify-email-sent`

**Phone Registration**: `/auth/register-phone`
- User enters phone (E.164 format), password, name
- OTP sent to phone
- User verifies OTP
- Account created

### 2. Login
**Standard Login**: `/auth/login`
- Email/phone + password
- Optional "Remember Me"
- Redirects to `/auth/2fa-verify` if 2FA enabled
- Otherwise redirects to dashboard

**OAuth Login**: `/auth/oauth/callback`
- Google or Microsoft sign-in
- Automatic account creation for new users
- Profile sync on each login

### 3. Two-Factor Authentication
**Setup**: `/account/security/2fa/setup`
- 5-step wizard
- QR code scanning
- Code verification
- 10 backup codes generated

**Verification**: `/auth/2fa-verify`
- 6-digit TOTP code
- Backup code fallback
- Max 3 attempts

### 4. Password Management
**Forgot Password**: `/auth/forgot-password`
- Enter email
- Reset link sent (valid 1 hour)

**Reset Password**: `/auth/reset-password?token=<jwt>`
- Enter new password
- Password strength validation
- Cannot reuse last 5 passwords

**Change Password**: `/account/security/change-password`
- Requires current password
- Option to logout other devices

---

## 🎨 UI Components Usage

### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button size="sm">Small</Button>
<Button disabled>Disabled</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/input';

<Input
  type="text"
  placeholder="Enter email"
  error="Email is required"
/>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

### Password Strength Meter
```tsx
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';

<PasswordStrengthMeter password={password} />
```

---

## 🔧 Services Usage

### Authentication Service
```typescript
import { authService } from '@/services/auth-complete.service';

// Register
await authService.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
});

// Login
await authService.login('user@example.com', 'SecurePass123!');

// Enable 2FA
const { qrCode, secret } = await authService.enable2FA();

// Get sessions
const sessions = await authService.getSessions();
```

### User Service
```typescript
import { userService } from '@/services/user.service';

// Get profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({
  firstName: 'Jane',
  bio: 'Updated bio',
});

// Upload profile picture
await userService.uploadProfilePicture(file);
```

---

## 🎣 React Query Hooks

### Auth Mutations
```typescript
import { useRegister, useLogin, useVerify2FA } from '@/hooks/use-auth-mutations';

// Register
const registerMutation = useRegister();
await registerMutation.mutateAsync({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

// Login
const loginMutation = useLogin();
await loginMutation.mutateAsync({
  email: 'user@example.com',
  password: 'SecurePass123!',
});
```

### Auth Queries
```typescript
import { useSessions, useLoginHistory } from '@/hooks/use-auth-queries';

// Get sessions
const { data: sessions, isLoading } = useSessions();

// Get login history
const { data: history } = useLoginHistory();
```

---

## 🗂️ State Management

### Auth Store (Zustand)
```typescript
import { useAuthStore } from '@/stores/auth.store';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login(credentials)}>Login</button>
      )}
    </div>
  );
}
```

---

## 🎯 Key Features Implemented

### ✅ Complete Authentication System
- Email & phone registration
- Email & phone login
- OAuth (Google, Microsoft)
- TOTP 2FA with backup codes
- Password management (forgot, reset, change)
- Multi-device session management
- Login history tracking
- Security dashboard

### ✅ Security Features
- JWT access & refresh tokens
- Token rotation & theft detection
- Password strength validation
- Rate limiting indicators
- Session expiry handling
- Device fingerprinting
- Suspicious activity alerts

### ✅ User Experience
- Real-time form validation
- Password strength meters
- Multi-step wizards
- Success/error states
- Loading indicators
- Toast notifications
- Helpful error messages

---

## 📋 Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Test Pages
1. Navigate to `http://localhost:4200/auth/register`
2. Fill in registration form
3. Check email for verification link
4. Complete the flow

---

## 🐛 Troubleshooting

### Common Issues

**1. API connection errors**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on port 3000

**2. OAuth not working**
- Verify OAuth client IDs in backend configuration
- Check redirect URIs match

**3. 2FA QR code not displaying**
- Check that QR code library is installed
- Verify API response contains valid QR data

**4. Token refresh failing**
- Check refresh token expiry
- Verify HttpOnly cookie settings

---

## 📚 Documentation References

- **Next.js**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🤝 Contributing

### Code Style
- Use TypeScript strict mode
- Follow existing component patterns
- Add JSDoc comments for complex functions
- Include FR-AUTH-XXX references in comments

### Component Guidelines
- Keep components focused and single-purpose
- Extract reusable logic to hooks
- Use proper TypeScript types
- Handle loading and error states

### Form Guidelines
- Use React Hook Form + Zod
- Real-time validation
- Accessible form controls
- Clear error messages

---

## 📝 Next Steps

### Immediate (Week 1-2)
1. Complete remaining auth pages
2. Implement RBAC system
3. Add comprehensive error handling

### Short Term (Month 1-2)
1. Module 02: User Management
2. Module 03: Organization Management
3. Expand UI component library
4. Add unit tests

### Long Term (Month 3-12)
1. Complete all 17 modules
2. Performance optimization
3. Accessibility compliance
4. Mobile responsiveness
5. PWA features

---

**Need Help?**
- Check `FRONTEND_IMPLEMENTATION_CHECKLIST.md` for complete requirements
- Check `FRONTEND_IMPLEMENTATION_PROGRESS.md` for current status
- Check `FRONTEND_SESSION_SUMMARY.md` for recent updates
