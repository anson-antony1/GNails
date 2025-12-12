import { NextRequest, NextResponse } from 'next/server'

/**
 * Analyze review text using Cloudflare Workers AI (Meta Llama 3) to extract insights
 */
async function analyzeReviews(reviewText: string) {
  // Get the Cloudflare Worker URL from environment variable
  // For local dev: http://localhost:8787
  // For production: https://gnail-ai-worker.YOUR-SUBDOMAIN.workers.dev
  const workerUrl = process.env.CLOUDFLARE_AI_WORKER_URL || 'http://localhost:8787'

  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reviewText }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`AI Worker failed: ${error.error || response.statusText}`)
  }

  const analysis = await response.json()

  return {
    topComplaints: analysis.topComplaints || [],
    topPositives: analysis.topPositives || [],
    recommendations: analysis.recommendations || [],
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewText } = body

    if (!reviewText || typeof reviewText !== 'string') {
      return NextResponse.json(
        { error: 'Review text is required' },
        { status: 400 }
      )
    }

    if (reviewText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide more review text to analyze' },
        { status: 400 }
      )
    }

    // Analyze the reviews
    const analysis = analyzeReviews(reviewText)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Review analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze reviews' },
      { status: 500 }
    )
  }
}
