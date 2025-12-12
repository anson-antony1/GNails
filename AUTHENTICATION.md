# Authentication Setup

G Nail Growth now includes simple password-based authentication to protect internal routes.

## Environment Variables Required

Add these to your `.env` or `.env.local` file:

```bash
# Owner password for full dashboard access
ADMIN_PASSWORD="your-secure-owner-password-here"

# Front desk PIN for check-in access only (4-6 digits recommended)
FRONTDESK_PIN="1234"

# Secret for signing JWT/session cookies (generate with: openssl rand -base64 32)
AUTH_SECRET="your-random-secret-key-min-32-characters"
```

## Generate AUTH_SECRET

Run this command to generate a secure random secret:

```bash
openssl rand -base64 32
```

Then paste the output into your `.env` file as `AUTH_SECRET`.

## How It Works

- **Owner Login** (`/login/owner`): Full access to dashboard, issues, analytics, etc.
- **Staff Login** (`/login/staff`): PIN-based access to check-in console only
- **Sessions**: HTTP-only cookies, 7-day expiration
- **Middleware**: Automatically protects routes based on role

## Protected Routes

- **Owner Only**: `/dashboard`, `/issues`, `/review-insights`, `/today`
- **Staff or Owner**: `/check-in`
- **Public**: `/`, `/feedback/[id]`, login pages

## Quick Start

1. Copy `.env.example` to `.env`
2. Set `ADMIN_PASSWORD`, `FRONTDESK_PIN`, and `AUTH_SECRET`
3. Restart the dev server: `npm run dev`
4. Visit `/login/owner` to log in as owner
5. Visit `/login/staff` to log in as front desk staff

## Security Notes

- Use a strong password for `ADMIN_PASSWORD` (12+ characters, mix of letters/numbers/symbols)
- Keep `AUTH_SECRET` secure and never commit it to version control
- Use different values for production vs development
- Staff PIN should be memorable but not obvious (avoid 1234, 0000, etc.)

## Logging Out

Click the "Logout" button in the top-right corner of the site header.

## Future Improvements

- Add user management table for multiple staff members
- Implement rate limiting on login attempts
- Add 2FA for owner account
- Add session activity logs
