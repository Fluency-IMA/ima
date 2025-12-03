# Auth0 Setup Guide

## 🚀 Quick Setup Instructions

### 1. Create Auth0 Account
1. Go to [https://auth0.com](https://auth0.com)
2. Sign up for a free account
3. Create a new "Application" → "Single Page Web Application"

### 2. Configure Application Settings
In your Auth0 dashboard:
- **Name**: FLUENCY AIM Platform
- **Domain**: `your-tenant.auth0.com` (copy this)
- **Client ID**: Copy this value
- **Client Secret**: Copy this value

### 3. Configure URLs
In Application Settings → URIs:
- **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`
- **Allowed Origins (CORS)**: `http://localhost:3000`

### 4. Update Environment Variables
Copy `.env.local.example` to `.env.local` and update:

```bash
# Replace with your Auth0 values
AUTH0_SECRET='your-random-secret-string-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id-here'
AUTH0_CLIENT_SECRET='your-client-secret-here'
NEXT_PUBLIC_APP_URL='http://localhost:3000'
```

### 5. Generate AUTH0_SECRET
Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Start Development
```bash
npm run dev
```

## 🔒 Protected Routes

The following routes are protected and require authentication:
- `/dashboard` - Main admin dashboard
- `/profile` - User profile page
- `/api/user` - User information API
- `/api/auth/me` - Authentication status API

## 🛡️ Security Features

- **Session Management**: Secure HTTP-only cookies
- **CSRF Protection**: Built-in CSRF protection
- **Token Validation**: JWT token validation
- **Automatic Logout**: Session expiration handling
- **Secure Redirects**: Safe redirect handling

## 📱 Authentication Flow

1. User visits `/` → Sees login page
2. Clicks "Secure Login" → Redirects to Auth0
3. Authenticates with Auth0 → Redirects back
4. Session created → Can access protected routes
5. User can logout → Session destroyed

## 🚀 Production Deployment

For production, update these values:
- `AUTH0_BASE_URL`: Your production URL
- `NEXT_PUBLIC_APP_URL`: Your production URL
- Add your production domain to Auth0 allowed URLs

## 📞 Support

If you encounter issues:
1. Check environment variables are set correctly
2. Verify Auth0 application configuration
3. Ensure URLs match exactly (no trailing slashes)
4. Check browser console for errors