# OAuth Setup Guide - Google & Microsoft Login

## Overview
This guide will help you set up Google and Microsoft OAuth authentication for both local development and production (Render).

---

## Part 1: Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Tekurious` or `Tekurious-Dev`
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (for public access)
3. Click **"Create"**

**Fill in the details:**
- **App name**: `Tekurious` or `Tekurious ERP`
- **User support email**: Your email
- **App logo**: (optional) Upload your logo
- **Application home page**: `https://tekurious-frontend.onrender.com`
- **Authorized domains**: 
  - `tekurious-frontend.onrender.com`
  - `tekurious-backend.onrender.com`
- **Developer contact email**: Your email

4. Click **"Save and Continue"**

**Scopes** (Step 2):
- Click **"Add or Remove Scopes"**
- Select:
  - `userinfo.email`
  - `userinfo.profile`
  - `openid`
- Click **"Update"** → **"Save and Continue"**

**Test Users** (Step 3):
- Add your email addresses for testing
- Click **"Save and Continue"**

5. Click **"Back to Dashboard"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Tekurious Web Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:3333
https://tekurious-frontend.onrender.com
https://tekurious-backend.onrender.com
```

**Authorized redirect URIs:**
```
http://localhost:3333/api/v1/auth/google/callback
https://tekurious-backend.onrender.com/api/v1/auth/google/callback
```

5. Click **"Create"**
6. **COPY** the Client ID and Client Secret

### Step 5: Update Environment Variables

**Local (.env):**
```env
GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3333/api/v1/auth/google/callback"
```

**Production (Render Backend Environment Variables):**
```
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=https://tekurious-backend.onrender.com/api/v1/auth/google/callback
```

---

## Part 2: Microsoft OAuth Setup

### Step 1: Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for **"Azure Active Directory"** or **"Microsoft Entra ID"**
3. Click **"App registrations"** (left sidebar)
4. Click **"New registration"**

### Step 2: Configure App Registration

**Fill in details:**
- **Name**: `Tekurious` or `Tekurious ERP`
- **Supported account types**: Select **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"**
- **Redirect URI**: 
  - Platform: **Web**
  - URI: `http://localhost:3333/api/v1/auth/microsoft/callback`

Click **"Register"**

### Step 3: Add Production Redirect URI

1. After registration, go to **"Authentication"** (left sidebar)
2. Under **"Redirect URIs"**, click **"Add URI"**
3. Add: `https://tekurious-backend.onrender.com/api/v1/auth/microsoft/callback`
4. Click **"Save"**

### Step 4: Add Platform Configuration

Scroll down to **"Platform configurations"**:
1. Click **"Add a platform"** → Select **"Web"**
2. Redirect URIs: (already added above)
3. **Implicit grant and hybrid flows**:
   - ✅ Check **"ID tokens"**
4. Click **"Configure"**

### Step 5: Create Client Secret

1. Go to **"Certificates & secrets"** (left sidebar)
2. Click **"New client secret"**
3. Description: `Tekurious Backend Secret`
4. Expires: **24 months** (or choose your preference)
5. Click **"Add"**
6. **IMMEDIATELY COPY** the secret value (you won't see it again!)

### Step 6: Copy Application (Client) ID

1. Go to **"Overview"** (left sidebar)
2. Copy the **"Application (client) ID"** (this is your MICROSOFT_CLIENT_ID)

### Step 7: Configure API Permissions

1. Go to **"API permissions"** (left sidebar)
2. You should see default permissions:
   - `User.Read` (Microsoft Graph)
   - `openid`
   - `profile`
   - `email`

If not, click **"Add a permission"**:
- Select **"Microsoft Graph"**
- Select **"Delegated permissions"**
- Search and add:
  - `openid`
  - `profile`
  - `email`
  - `User.Read`

3. Click **"Grant admin consent for [Your Organization]"** (optional but recommended)

### Step 8: Update Environment Variables

**Local (.env):**
```env
MICROSOFT_CLIENT_ID="your-azure-application-client-id"
MICROSOFT_CLIENT_SECRET="your-azure-client-secret-value"
MICROSOFT_CALLBACK_URL="http://localhost:3333/api/v1/auth/microsoft/callback"
```

**Production (Render Backend Environment Variables):**
```
MICROSOFT_CLIENT_ID=your-azure-application-client-id
MICROSOFT_CLIENT_SECRET=your-azure-client-secret-value
MICROSOFT_CALLBACK_URL=https://tekurious-backend.onrender.com/api/v1/auth/microsoft/callback
```

---

## Part 3: Frontend Integration

### Step 1: Add OAuth Buttons to Login Page

Update `apps/web/src/app/(auth)/login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';
import { API_BASE_URL } from '@/config/env';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleMicrosoftLogin = () => {
    // Redirect to backend Microsoft OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/microsoft`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to Tekurious</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMicrosoftLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z" />
              <path fill="#00A4EF" d="M13 1h10v10H13z" />
              <path fill="#7FBA00" d="M1 13h10v10H1z" />
              <path fill="#FFB900" d="M13 13h10v10H13z" />
            </svg>
            Continue with Microsoft
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Handle OAuth Callback in Backend

The backend already handles this in `auth.controller.ts`:
- `GET /api/v1/auth/google/callback`
- `GET /api/v1/auth/microsoft/callback`

These endpoints will:
1. Validate OAuth response
2. Create or find user account
3. Generate JWT tokens
4. Redirect to frontend with tokens

### Step 3: Add OAuth Callback Handler in Frontend

Create `apps/web/src/app/(auth)/oauth/callback/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userData = searchParams.get('user');

    if (accessToken && refreshToken && userData) {
      try {
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Parse and store user data
        const user = JSON.parse(decodeURIComponent(userData));
        setUser(user);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        setError('Failed to process OAuth login');
        console.error('OAuth callback error:', err);
      }
    } else {
      setError('Invalid OAuth response');
    }
  }, [searchParams, setUser, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Login Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
```

---

## Part 4: Testing

### Test Locally

1. **Start backend**: `npm run start:backend`
2. **Start frontend**: `npm run start:frontend`
3. Go to `http://localhost:3000/login`
4. Click **"Continue with Google"** or **"Continue with Microsoft"**
5. Authorize the app
6. You should be redirected back and logged in

### Test on Production

1. Update Render environment variables with production OAuth credentials
2. Redeploy backend if needed
3. Go to `https://tekurious-frontend.onrender.com/login`
4. Click OAuth buttons and test

---

## Part 5: Update Backend OAuth Redirect

The backend needs to redirect to frontend with tokens. Update `auth.service.ts`:

Check the OAuth callback methods in `googleAuthRedirect()` and `microsoftAuthRedirect()` redirect properly.

They should redirect to:
```typescript
const frontendUrl = this.configService.get('FRONTEND_URL');
return `${frontendUrl}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify(user))}`;
```

---

## Common Issues & Troubleshooting

### Issue 1: "redirect_uri_mismatch" error
**Solution**: 
- Verify redirect URIs exactly match in OAuth console and environment variables
- Include both `http://localhost:3333` AND `https://tekurious-backend.onrender.com`
- No trailing slashes

### Issue 2: "Unauthorized client" error
**Solution**:
- Check Client ID and Secret are correct
- Verify environment variables are set correctly in Render

### Issue 3: "Access blocked: This app's request is invalid"
**Solution**:
- Complete OAuth consent screen configuration
- Add your email as a test user
- Verify scopes are correct

### Issue 4: OAuth works locally but not on Render
**Solution**:
- Update production environment variables in Render
- Add production URLs to authorized domains/redirect URIs
- Redeploy backend after env variable changes

### Issue 5: "Failed to fetch user profile"
**Solution**:
- Check API permissions are granted
- Verify scopes include `email` and `profile`

---

## Security Checklist

- ✅ Never commit OAuth secrets to Git
- ✅ Use environment variables for all credentials
- ✅ Use HTTPS in production redirect URIs
- ✅ Set short token expiry times (1 hour for access tokens)
- ✅ Implement refresh token rotation
- ✅ Validate OAuth state parameter (CSRF protection)
- ✅ Store tokens securely (httpOnly cookies recommended)

---

## Next Steps

After OAuth is working:
1. Test user account creation via OAuth
2. Test OAuth login for existing users
3. Implement OAuth account linking (link Google/Microsoft to existing account)
4. Add profile sync on each OAuth login
5. Handle OAuth errors gracefully

---

## Quick Reference

**Google OAuth Endpoints:**
- Initiate: `GET /api/v1/auth/google`
- Callback: `GET /api/v1/auth/google/callback`

**Microsoft OAuth Endpoints:**
- Initiate: `GET /api/v1/auth/microsoft`
- Callback: `GET /api/v1/auth/microsoft/callback`

**Required Scopes:**
- Google: `email`, `profile`, `openid`
- Microsoft: `openid`, `profile`, `email`, `User.Read`

**Environment Variables:**
```env
# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Microsoft  
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_CALLBACK_URL=

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000  # or production URL
```
