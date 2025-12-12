import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWinbackSMS, formatPhoneE164 } from '@/lib/sms'
import { env } from '@/lib/env'

/**
 * Calculate days since last visit for a customer
 */
async function getDaysSinceLastVisit(customerId: string): Promise<number> {
  const lastVisit = await prisma.visit.findFirst({
    where: { customerId },
    orderBy: { appointmentTime: 'desc' },
    select: { appointmentTime: true },
  })

  if (!lastVisit) {
    return 0
  }

  const daysSince = Math.floor(
    (Date.now() - lastVisit.appointmentTime.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSince
}

/**
 * Get booking URL from settings or use default
 */
async function getBookingUrl(): Promise<string | undefined> {
  try {
    const bookingSetting = await prisma.setting.findUnique({
      where: { key: 'booking_url' },
    })

    if (bookingSetting && typeof bookingSetting.value === 'string') {
      return bookingSetting.value
    }

    // Fallback to app URL + /book
    return `${env.app.url}/book`
  } catch (error) {
    console.warn('[Winback SMS] Could not fetch booking URL from settings:', error)
    return `${env.app.url}/book`
  }
}

/**
 * POST /api/winback/send-pending
 * 
 * **Designed to be triggered by a scheduled job (e.g., Vercel Cron).**
 * 
 * Processes pending winback SMS to inactive customers based on campaign rules.
 * Only sends to customers who have opted in to marketing communications.
 * 
 * **Safe to call multiple times**: Already-sent records are skipped (sentAt != null).
 * The endpoint is fully idempotent and will not resend to the same customer.
 * 
 * **Request**: POST with no body required
 * 
 * **Response**: JSON summary with counts:
 * - `success`: boolean indicating overall operation success
 * - `processed`: total number of pending messages found
 * - `sent`: number of SMS successfully sent
 * - `failed`: number of SMS that failed (includes opted-out customers)
 * 
 * **Error Handling**: Individual SMS failures are logged and marked as 'failed'
 * without stopping the batch. Only returns 5xx for unexpected system errors.
 * Customers who opted out are marked with responseType='opted_out'.
 * 
 * **Rate Limiting Considerations**:
 * - Twilio Trial accounts: Limited to verified numbers only
 * - Twilio Production: ~$0.0075 per SMS in US
 * - TODO: Consider adding max batch size limit (e.g., 50 per execution)
 *   to prevent accidental over-sending if large campaign is created
 * - TODO: Consider implementing exponential backoff for Twilio rate limit errors
 * - TODO: Consider adding daily/weekly send limits per customer to avoid spam
 * 
 * @example
 * // Vercel cron configuration (vercel.json):
 * // {
 * //   "crons": [{
 * //     "path": "/api/winback/send-pending",
 * //     "schedule": "0 12 * * *" // Daily at noon
 * //   }]
 * // }
 */
export async function POST() {
  try {
    // Find all pending winback messages
    // Only process messages that haven't been sent yet
    const pendingMessages = await prisma.winbackMessage.findMany({
      where: {
        status: 'pending',
        sentAt: null, // Idempotent: only send if not already sent
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            marketingOptIn: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            messageTemplate: true,
            minDaysSinceLastVisit: true,
            maxDaysSinceLastVisit: true,
            active: true,
          },
        },
      },
    })

    console.log(`[Winback SMS] Processing ${pendingMessages.length} pending winback messages...`)

    let sentCount = 0
    let failedCount = 0

    // Get booking URL once for all messages
    const bookingUrl = await getBookingUrl()

    for (const message of pendingMessages) {
      try {
        const { customer, campaign } = message

        // Skip if campaign is not active
        if (!campaign.active) {
          console.warn(`[Winback SMS] Skipping message ${message.id}: Campaign ${campaign.name} is not active`)
          failedCount++
          continue
        }

        // Skip if customer opted out of marketing
        if (!customer.marketingOptIn) {
          console.warn(`[Winback SMS] Skipping message ${message.id}: Customer ${customer.name} opted out of marketing`)
          failedCount++
          
          await prisma.winbackMessage.update({
            where: { id: message.id },
            data: {
              status: 'failed',
              responseType: 'opted_out',
            },
          })
          continue
        }

        // Validate customer has a phone number
        if (!customer.phone) {
          console.warn(`[Winback SMS] Skipping message ${message.id}: Customer has no phone number`)
          failedCount++
          
          await prisma.winbackMessage.update({
            where: { id: message.id },
            data: { status: 'failed' },
          })
          continue
        }

        // Calculate days since last visit
        const daysSinceLastVisit = await getDaysSinceLastVisit(customer.id)

        // Format phone number to E.164
        const phoneE164 = formatPhoneE164(customer.phone)

        // Extract customer first name
        const customerName = customer.name?.split(' ')[0] || undefined

        // Extract offer text from campaign message template if it contains special markers
        // For now, we'll pass the campaign name as offer text if it's a special campaign
        const offerText = campaign.messageTemplate.includes('{{offer}}')
          ? undefined // Could be extracted from campaign or settings
          : undefined

        // Send winback SMS via Twilio
        const messageSid = await sendWinbackSMS({
          to: phoneE164,
          customerName,
          daysSinceLastVisit,
          bookingUrl,
          salonName: 'G Nail Pines',
          offerText,
        })

        // Update winback message to mark as sent
        await prisma.winbackMessage.update({
          where: { id: message.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        })

        console.log(
          `[Winback SMS] Successfully sent to ${customer.phone} (${customer.name}), ` +
          `${daysSinceLastVisit} days since last visit, SID: ${messageSid}`
        )
        sentCount++
      } catch (error) {
        console.error(
          `[Winback SMS] Failed to send winback message ${message.id}:`,
          error
        )
        
        // Mark as failed but don't stop processing other messages
        try {
          await prisma.winbackMessage.update({
            where: { id: message.id },
            data: {
              status: 'failed',
            },
          })
        } catch (updateError) {
          console.error(
            `[Winback SMS] Failed to update status for message ${message.id}:`,
            updateError
          )
        }
        
        failedCount++
        // Continue processing other messages
      }
    }

    console.log(
      `[Winback SMS] Processing complete: ${sentCount} sent, ${failedCount} failed, ` +
      `${pendingMessages.length} total`
    )
    console.log(`[winback/send-pending] processed ${pendingMessages.length}, sent ${sentCount}, failed ${failedCount}`)

    return NextResponse.json({
      success: true,
      processed: pendingMessages.length,
      sent: sentCount,
      failed: failedCount,
    })
  } catch (error) {
    console.error('[Winback SMS] Error processing pending winback messages:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process winback messages',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
