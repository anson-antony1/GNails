import * as Sentry from '@sentry/nextjs'

// Initialize Sentry for client-side error monitoring
// Only if SENTRY_DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Disable performance monitoring (keeping it simple)
    tracesSampleRate: 0,

    // Disable session replays
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Configure environment
    environment: process.env.NODE_ENV || 'development',

    // Add useful debugging info
    debug: process.env.NODE_ENV === 'development',
  })

  console.log('[Sentry] Client-side error monitoring initialized')
} else {
  console.warn('[Sentry] NEXT_PUBLIC_SENTRY_DSN not set, error monitoring disabled')
}
