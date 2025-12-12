import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Helper function to send feedback SMS
 * This can be replaced with a real SMS service (e.g., Twilio) later
 */
async function sendFeedbackSMS(
  customerPhone: string,
  feedbackRequestId: string,
  customerName: string | null
) {
  const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/feedback/${feedbackRequestId}`
  
  // For now, just log to console
  // Later, replace this with actual SMS sending (e.g., Twilio)
  console.log('📱 Sending feedback SMS:')
  console.log(`   To: ${customerPhone}`)
  console.log(`   Name: ${customerName || 'N/A'}`)
  console.log(`   Link: ${feedbackUrl}`)
  console.log(`   Message: "Hi${customerName ? ' ' + customerName.split(' ')[0] : ''}! How was your recent visit to G Nail Growth? Please share your feedback: ${feedbackUrl}"`)
  
  // Simulate successful send
  return true
}

export async function POST() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

    // Find pending feedback requests that meet criteria
    const pendingFeedbackRequests = await prisma.feedbackRequest.findMany({
      where: {
        status: 'pending',
        sentAt: null,
        visit: {
          checkoutTime: {
            not: null,
            lte: thirtyMinutesAgo, // At least 30 minutes ago
          },
        },
      },
      include: {
        visit: {
          include: {
            customer: true,
          },
        },
      },
    })

    let processedCount = 0

    // Process each pending feedback request
    for (const feedbackRequest of pendingFeedbackRequests) {
      try {
        const customer = feedbackRequest.visit.customer

        // Send the feedback SMS
        await sendFeedbackSMS(
          customer.phone,
          feedbackRequest.id,
          customer.name
        )

        // Update the feedback request
        await prisma.feedbackRequest.update({
          where: { id: feedbackRequest.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        })

        processedCount++
      } catch (error) {
        console.error(`Failed to send feedback for request ${feedbackRequest.id}:`, error)
        // Continue processing other requests even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total: pendingFeedbackRequests.length,
    })
  } catch (error) {
    console.error('Error processing pending feedback requests:', error)
    return NextResponse.json(
      { error: 'Failed to process feedback requests' },
      { status: 500 }
    )
  }
}
