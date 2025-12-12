import { NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/settings'
import { isOwner } from '@/lib/auth'

/**
 * GET /api/settings
 * Returns current business settings
 * Requires owner authentication
 */
export async function GET() {
  try {
    // Only owners can view settings
    const ownerAuthenticated = await isOwner()
    if (!ownerAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 401 }
      )
    }

    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings
 * Updates business settings
 * Requires owner authentication
 */
export async function PUT(request: Request) {
  try {
    // Only owners can modify settings
    const ownerAuthenticated = await isOwner()
    if (!ownerAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Owner access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Update settings (validation happens in the helper)
    const updatedSettings = await updateSettings(body)
    
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Failed to update settings:', error)
    
    // Return validation errors to user
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
