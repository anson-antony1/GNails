import { NextRequest, NextResponse } from 'next/server'
import { getRecentVisits } from '@/lib/visits'

/**
 * GET /api/visits/recent
 * 
 * Fetch recent visits with customer and service information.
 * Used to refresh the check-in page after successful submissions.
 * 
 * Query Parameters:
 * - `limit`: Number of visits to return (default: 5, max: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get('limit')
    
    let limit = 5
    if (limitParam) {
      const parsed = parseInt(limitParam, 10)
      if (!isNaN(parsed) && parsed > 0 && parsed <= 20) {
        limit = parsed
      }
    }

    const visits = await getRecentVisits(limit)

    return NextResponse.json({
      success: true,
      visits,
      count: visits.length,
    })
  } catch (error) {
    console.error('[Recent Visits API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recent visits',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
