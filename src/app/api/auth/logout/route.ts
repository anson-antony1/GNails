import { NextResponse } from 'next/server'
import { destroySessions } from '@/lib/auth'

export async function POST() {
  try {
    await destroySessions()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[auth/logout] Error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
