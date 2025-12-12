import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendFeedbackRequestSMS, formatPhoneE164 } from '@/lib/sms'
import { env } from '@/lib/env'
import { getSettings } from '@/lib/settings'

/**
 * POST /api/feedback/send-pending
 * 
 * **Designed to be triggered by a scheduled job (e.g., Vercel Cron).**
 * 
 * Processes pending feedback request SMS to customers after their visits.
 * Automatically sends SMS to customers whose visits ended at least 1 hour ago.
 * 
 * **Safe to call multiple times**: Already-sent records are skipped (sentAt != null).
 * The endpoint is fully idempotent and will not resend to the same customer.
 * 
 * **Request**: POST with no body required
 * 
 * **Response**: JSON summary with counts:
 * - `success`: boolean indicating overall operation success
 * - `sentCount`: number of SMS successfully sent
 * - `failedCount`: number of SMS that failed to send
 * - `totalProcessed`: total number of records attempted
 * 
 * **Error Handling**: Individual SMS failures are logged and marked as 'failed'
 * without stopping the batch. Only returns 5xx for unexpected system errors.
 * 
 * **Rate Limiting Considerations**:
 * - Twilio Trial accounts: Limited to verified numbers only
 * - Twilio Production: ~$0.0075 per SMS in US
 * - TODO: Consider adding max batch size limit (e.g., 100 per execution)
 *   to prevent accidental over-sending if large backlog accumulates
 * - TODO: Consider implementing exponential backoff for Twilio rate limit errors
 * 
 * @example
 * // Vercel cron configuration (vercel.json):
 * // {
 * //   "crons": [{
 * //     "path": "/api/feedback/send-pending",
 * //     "schedule": "0 * * * *" // Every hour
 * //   }]
 * // }
 */
export async function POST() {
  try {
    // Load settings to get feedback delay (configurable via Settings page)
    // Send feedback only after the configured delay to avoid bothering clients immediately after checkout
    const settings = await getSettings()
    
    // Find feedback requests that haven't been sent yet
    // and where the visit ended at least the configured delay time ago
    const delayMs = settings.feedbackDelayMinutes * 60 * 1000
    const delayAgo = new Date(Date.now() - delayMs)

    const pendingFeedbackRequests = await prisma.feedbackRequest.findMany({
      where: {
        status: 'pending',
        sentAt: null, // Idempotent: only send if not already sent
        channel: 'sms', // Only SMS feedback requests
        visit: {
          checkoutTime: {
            not: null,
            lte: delayAgo, // Visit ended at least the configured delay ago
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

    let sentCount = 0
    let failedCount = 0

    // Process each pending feedback request
    for (const feedbackRequest of pendingFeedbackRequests) {
      try {
        const customer = feedbackRequest.visit.customer

        // Validate customer has a phone number
        if (!customer.phone) {
          console.warn(`[Feedback SMS] Skipping request ${feedbackRequest.id}: Customer has no phone number`)
          failedCount++
          continue
        }

        // Format phone number to E.164
        const phoneE164 = formatPhoneE164(customer.phone)

        // Build feedback URL
        const feedbackUrl = `${env.app.url}/feedback/${feedbackRequest.id}`

        // Extract customer first name
        const customerName = customer.name?.split(' ')[0] || undefined

        // Send feedback request SMS via Twilio
        const messageSid = await sendFeedbackRequestSMS({
          to: phoneE164,
          customerName,
          feedbackUrl,
          salonName: 'G Nail Pines',
        })

        // Update feedback request to mark as sent
        await prisma.feedbackRequest.update({
          where: { id: feedbackRequest.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        })

        console.log(`[Feedback SMS] Successfully sent to ${customer.phone} (${customer.name}), SID: ${messageSid}`)
        sentCount++
      } catch (error) {
        console.error(
          `[Feedback SMS] Failed to send feedback request ${feedbackRequest.id}:`,
          error
        )
        
        // Mark as failed but don't stop processing other requests
        try {
          await prisma.feedbackRequest.update({
            where: { id: feedbackRequest.id },
            data: {
              status: 'failed',
            },
          })
        } catch (updateError) {
          console.error(`[Feedback SMS] Failed to update status for ${feedbackRequest.id}:`, updateError)
        }
        
        failedCount++
        // Continue processing other requests
      }
    }

    console.log(`[feedback/send-pending] processed ${sentCount + failedCount}, sent ${sentCount}, failed ${failedCount}`)

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      totalProcessed: sentCount + failedCount,
    })
  } catch (error) {
    console.error('[Feedback SMS] Error processing pending feedback requests:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process feedback requests',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
