import { NextRequest, NextResponse } from 'next/server'
import { verifyStaffPin, createStaffSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply strict rate limiting: 10 attempts per 10 minutes per IP
  // Prevents brute force PIN attacks
  const rateLimitResponse = await checkRateLimit(request, 'auth')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { pin } = body

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      )
    }

    // Verify PIN
    if (!verifyStaffPin(pin)) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      )
    }

    // Create session
    await createStaffSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[auth/staff/login] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
