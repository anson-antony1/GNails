import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    return NextResponse.json({
      authenticated: !!session,
      role: session?.role || null,
    })
  } catch (error) {
    console.error('[auth/session] Error:', error)
    return NextResponse.json({
      authenticated: false,
      role: null,
    })
  }
}
