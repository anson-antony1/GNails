import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/settings'
import { checkRateLimit } from '@/lib/rate-limit'

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: Params) {
  // Apply rate limiting: 20 requests per 5 minutes per IP
  const rateLimitResponse = await checkRateLimit(request, 'feedback')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { id } = await params
    const body = await request.json()
    const { rating, comment, reviewLinkClicked } = body

    // Validate rating
    if (!rating || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Find the feedback request with related data
    const feedbackRequest = await prisma.feedbackRequest.findUnique({
      where: { id },
      include: {
        visit: {
          include: {
            customer: true,
            service: true,
          },
        },
      },
    })

    if (!feedbackRequest) {
      return NextResponse.json(
        { error: 'Feedback request not found' },
        { status: 404 }
      )
    }

    // Check if already responded
    if (feedbackRequest.rating || feedbackRequest.respondedAt) {
      return NextResponse.json(
        { error: 'Feedback already completed' },
        { status: 400 }
      )
    }

    const ratingValue = parseInt(rating, 10)
    
    // Load settings to check rating threshold (configurable via Settings page)
    // Low ratings at or below the configured threshold are treated as issues
    const settings = await getSettings()
    
    // Update the feedback request
    const updatedFeedback = await prisma.feedbackRequest.update({
      where: { id },
      data: {
        rating: ratingValue,
        comment: comment || null,
        reviewLinkClicked: reviewLinkClicked !== undefined ? reviewLinkClicked : undefined,
        respondedAt: new Date(),
      },
    })

    // For low ratings (configurable threshold), automatically create an issue with AI classification
    // This helps catch problems early before they become public negative reviews
    if (ratingValue <= settings.lowRatingThreshold && comment && comment.trim().length > 0) {
      try {
        // Call Cloudflare Worker to classify the issue
        const workerUrl = process.env.CLOUDFLARE_AI_WORKER_URL || 'https://gnail-ai-worker.ansonkanniman.workers.dev'
        
        const classifyResponse = await fetch(`${workerUrl}/issue-classify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating: ratingValue,
            comment: comment,
          }),
        })

        if (classifyResponse.ok) {
          const classification = await classifyResponse.json()
          
          // Only create issue if AI confirms it's an issue
          if (classification.isIssue === true) {
            // Create the issue in the database
            await prisma.issue.create({
              data: {
                customerId: feedbackRequest.visit.customerId,
                feedbackRequestId: feedbackRequest.id,
                status: 'open',
                severity: classification.severity || 'medium',
                category: classification.category || 'other',
                summary: classification.summary || 'Customer reported issue with service',
                details: comment,
              },
            })
            
            console.log(`Created issue for feedback ${id}: ${classification.category} (${classification.severity})`)
          } else {
            console.log(`Rating ${ratingValue} but not classified as issue: ${comment.substring(0, 50)}...`)
          }
        }
      } catch (issueError) {
        // Log error but don't fail the feedback submission
        console.error('Failed to create issue:', issueError)
      }
    }

    return NextResponse.json({
      success: true,
      feedback: updatedFeedback,
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
