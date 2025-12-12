This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Rate Limiting

G Nail Growth includes IP-based rate limiting on critical endpoints to prevent abuse:

- **Check-in API** (`/api/checkin`): 60 requests per 5 minutes per IP
- **Feedback submission** (`/api/feedback/[id]/submit`): 20 requests per 5 minutes per IP  
- **Auth endpoints** (`/api/auth/*/login`): 10 attempts per 10 minutes per IP (brute force protection)

### Setup (Optional - Production Recommended)

Rate limiting uses [Upstash Redis](https://upstash.com):

1. Create a free Redis database at https://console.upstash.com
2. Copy the REST URL and token
3. Add to `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your_token_here"
   ```

**Development**: Rate limiting automatically uses in-memory fallback when Redis is not configured (no setup required).

**Production**: Configure Upstash Redis to enable distributed rate limiting across serverless instances.

### Response Format

When rate limited, endpoints return `429 Too Many Requests`:

```json
{
  "error": "Too many requests",
  "message": "You have made too many requests. Please try again later.",
  "retryAfter": "2025-12-12T10:30:00.000Z"
}
```

Headers include:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: When the limit resets (ISO timestamp)

## Error Monitoring

G Nail Growth integrates with [Sentry](https://sentry.io) for automatic error tracking and monitoring across all environments (client, server, and edge runtime).

### Setup (Optional - Production Recommended)

1. Create a free Sentry account at https://sentry.io
2. Create a new Next.js project in Sentry
3. Copy your DSN from Project Settings → Client Keys
4. Add to `.env.local`:
   ```env
   # Required: Enable error monitoring
   SENTRY_DSN="https://your-dsn@sentry.io/your-project-id"
   NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/your-project-id"
   
   # Optional: Enable source map uploads for detailed stack traces
   SENTRY_ORG="your-organization-slug"
   SENTRY_PROJECT="your-project-slug"
   SENTRY_AUTH_TOKEN="your-auth-token"
   ```

**Development**: Errors are logged to console. Sentry is optional but helpful for tracking issues.

**Production**: Configure Sentry to automatically capture and track all unhandled errors, API failures, and edge cases.

### What Gets Tracked

- ✅ Unhandled exceptions in API routes
- ✅ Client-side errors (React errors, network failures)
- ✅ Edge runtime errors (middleware)
- ✅ Automatic context (user agent, IP, request headers)
- ❌ Performance tracing (disabled to keep setup simple)
- ❌ Session replays (disabled to keep setup simple)

### Source Maps (Optional)

To get detailed stack traces in production:

1. Create an auth token at https://sentry.io/settings/account/api/auth-tokens/
2. Add `SENTRY_AUTH_TOKEN` to `.env.local`
3. Build your app - source maps are automatically uploaded during `npm run build`

Without source maps, errors are still captured but stack traces show minified code.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
