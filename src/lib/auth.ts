/**
 * Authentication utilities for G Nail Growth
 * Simple password + PIN based authentication with HTTP-only cookies
 */

import 'server-only'
import { cookies } from 'next/headers'
import { env } from './env'
import { SignJWT, jwtVerify } from 'jose'

// Session types
export type SessionRole = 'owner' | 'staff'

export interface Session {
  role: SessionRole
  authenticatedAt: number
}

// Cookie names
const OWNER_COOKIE = 'gnail_owner_session'
const STAFF_COOKIE = 'gnail_staff_session'

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Get secret key for JWT signing
 */
function getSecretKey() {
  return new TextEncoder().encode(env.auth.secret)
}

/**
 * Create a JWT session token
 */
async function createSessionToken(role: SessionRole): Promise<string> {
  const token = await new SignJWT({ role, authenticatedAt: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(getSecretKey())

  return token
}

/**
 * Verify and decode a JWT session token
 */
async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (payload.role && typeof payload.authenticatedAt === 'number') {
      return {
        role: payload.role as SessionRole,
        authenticatedAt: payload.authenticatedAt,
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Authenticate with owner password
 * Returns true if password matches
 */
export function verifyOwnerPassword(password: string): boolean {
  return password === env.auth.adminPassword
}

/**
 * Authenticate with staff PIN
 * Returns true if PIN matches
 */
export function verifyStaffPin(pin: string): boolean {
  return pin === env.auth.frontdeskPin
}

/**
 * Create an owner session (sets HTTP-only cookie)
 */
export async function createOwnerSession() {
  const token = await createSessionToken('owner')
  const cookieStore = await cookies()
  
  cookieStore.set(OWNER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  })
}

/**
 * Create a staff session (sets HTTP-only cookie)
 */
export async function createStaffSession() {
  const token = await createSessionToken('staff')
  const cookieStore = await cookies()
  
  cookieStore.set(STAFF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  })
}

/**
 * Get current session from cookies
 * Returns session with role, or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  
  // Check owner session first (higher privilege)
  const ownerToken = cookieStore.get(OWNER_COOKIE)?.value
  if (ownerToken) {
    const session = await verifySessionToken(ownerToken)
    if (session) return session
  }
  
  // Check staff session
  const staffToken = cookieStore.get(STAFF_COOKIE)?.value
  if (staffToken) {
    const session = await verifySessionToken(staffToken)
    if (session) return session
  }
  
  return null
}

/**
 * Check if user has owner role
 */
export async function isOwner(): Promise<boolean> {
  const session = await getSession()
  return session?.role === 'owner'
}

/**
 * Check if user has staff role (or owner)
 */
export async function isStaffOrOwner(): Promise<boolean> {
  const session = await getSession()
  return session?.role === 'staff' || session?.role === 'owner'
}

/**
 * Destroy all sessions (logout)
 */
export async function destroySessions() {
  const cookieStore = await cookies()
  
  cookieStore.delete(OWNER_COOKIE)
  cookieStore.delete(STAFF_COOKIE)
}
