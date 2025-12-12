import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: Params) {
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

    // Update the feedback request
    const updatedFeedback = await prisma.feedbackRequest.update({
      where: { id },
      data: {
        rating: parseInt(rating, 10),
        comment: comment || null,
        reviewLinkClicked: reviewLinkClicked !== undefined ? reviewLinkClicked : undefined,
        respondedAt: new Date(),
      },
    })

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
