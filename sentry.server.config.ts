import * as Sentry from '@sentry/nextjs'

// Initialize Sentry for server-side error monitoring
// Only if SENTRY_DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Disable performance monitoring (keeping it simple)
    tracesSampleRate: 0,

    // Configure environment
    environment: process.env.NODE_ENV || 'development',

    // Add useful debugging info
    debug: process.env.NODE_ENV === 'development',
  })

  console.log('[Sentry] Server-side error monitoring initialized')
} else {
  console.warn('[Sentry] SENTRY_DSN not set, server error monitoring disabled')
}
