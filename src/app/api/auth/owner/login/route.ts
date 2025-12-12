import { NextRequest, NextResponse } from 'next/server'
import { verifyOwnerPassword, createOwnerSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply strict rate limiting: 10 attempts per 10 minutes per IP
  // Prevents brute force password attacks
  const rateLimitResponse = await checkRateLimit(request, 'auth')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Verify password
    if (!verifyOwnerPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create session
    await createOwnerSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[auth/owner/login] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
