import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Helper function to send winback SMS
 * This can be replaced with a real SMS service (e.g., Twilio) later
 */
async function sendWinbackSMS(
  customerPhone: string,
  message: string,
  customerName: string | null
) {
  // For now, just log to console
  // Later, replace this with actual SMS sending (e.g., Twilio)
  console.log('📱 Sending winback SMS:')
  console.log(`   To: ${customerPhone}`)
  console.log(`   Name: ${customerName || 'N/A'}`)
  console.log(`   Message: "${message}"`)
  console.log('')
  
  // Simulate successful send
  return true
}

/**
 * Render message template by replacing placeholders
 */
function renderMessageTemplate(
  template: string,
  customer: { name: string | null; phone: string }
): string {
  const firstName = customer.name?.split(' ')[0] || 'there'
  const bookingLink = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/book` 
    : 'https://yoursite.com/book'

  return template
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{bookingLink\}\}/g, bookingLink)
}

export async function POST() {
  try {
    // Find all pending winback messages
    const pendingMessages = await prisma.winbackMessage.findMany({
      where: {
        status: 'pending',
      },
      include: {
        customer: true,
        campaign: true,
      },
    })

    console.log(`🔄 Processing ${pendingMessages.length} pending winback messages...`)

    let processedCount = 0

    for (const message of pendingMessages) {
      try {
        const { customer, campaign } = message

        // Render the message template
        const renderedMessage = renderMessageTemplate(campaign.messageTemplate, customer)

        // Send the SMS
        await sendWinbackSMS(customer.phone, renderedMessage, customer.name)

        // Update the winback message
        await prisma.winbackMessage.update({
          where: { id: message.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        })

        processedCount++
      } catch (error) {
        console.error(`Failed to send winback message ${message.id}:`, error)
        
        // Mark as failed
        await prisma.winbackMessage.update({
          where: { id: message.id },
          data: {
            status: 'failed',
          },
        })
      }
    }

    console.log(`✅ Winback messages processed: ${processedCount} sent successfully`)

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total: pendingMessages.length,
    })
  } catch (error) {
    console.error('Error processing pending winback messages:', error)
    return NextResponse.json(
      { error: 'Failed to process winback messages' },
      { status: 500 }
    )
  }
}
