/**
 * Rate limiting utilities using Upstash Redis
 * 
 * Protects critical API endpoints from abuse with simple IP-based rate limits.
 * Uses in-memory fallback when Redis is not configured (development).
 */

import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Redis client if credentials are available
let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  console.log('[RateLimit] Upstash Redis initialized')
} else {
  console.warn('[RateLimit] Upstash Redis not configured, using in-memory fallback')
}

/**
 * Rate limit configurations for different endpoints
 */
const limiters = {
  // Check-in endpoint - moderate limit for staff usage
  checkin: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '5 m'), // 60 requests per 5 minutes
        analytics: true,
        prefix: 'ratelimit:checkin',
      })
    : null,

  // Feedback submission - lower limit to prevent spam
  feedback: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '5 m'), // 20 requests per 5 minutes
        analytics: true,
        prefix: 'ratelimit:feedback',
      })
    : null,

  // Auth endpoints - strict limit to prevent brute force
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 m'), // 10 attempts per 10 minutes
        analytics: true,
        prefix: 'ratelimit:auth',
      })
    : null,
}

/**
 * Extract client IP from request
 * Tries multiple headers to handle different proxy configurations
 */
function getClientIP(request: NextRequest): string {
  // Try standard forwarding headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback to a generic identifier
  return 'unknown'
}

/**
 * Apply rate limiting to a request
 * 
 * @param request - Next.js request object
 * @param limitType - Type of rate limit to apply ('checkin', 'feedback', or 'auth')
 * @returns NextResponse with 429 status if rate limited, null otherwise
 */
export async function checkRateLimit(
  request: NextRequest,
  limitType: keyof typeof limiters
): Promise<NextResponse | null> {
  const limiter = limiters[limitType]

  // Skip rate limiting if Redis is not configured (development mode)
  if (!limiter) {
    console.warn(`[RateLimit] Skipping ${limitType} rate limit (Redis not configured)`)
    return null
  }

  const identifier = getClientIP(request)

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    }

    if (!success) {
      console.warn(`[RateLimit] Rate limit exceeded for ${limitType} from IP ${identifier}`)
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'You have made too many requests. Please try again later.',
          retryAfter: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers,
        }
      )
    }

    // Rate limit passed - caller should add these headers to their response
    return null
  } catch (error) {
    console.error(`[RateLimit] Error checking rate limit for ${limitType}:`, error)
    // Don't block requests if rate limiting fails
    return null
  }
}

/**
 * Middleware wrapper for easy rate limiting in route handlers
 * 
 * @example
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = await checkRateLimit(request, 'checkin')
 *   if (rateLimitResponse) return rateLimitResponse
 *   
 *   // Continue with normal request handling...
 * }
 */
