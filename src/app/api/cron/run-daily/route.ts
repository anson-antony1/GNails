import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const now = new Date()
    const results: Array<{ campaignName: string; messagesCreated: number }> = []

    // Get all active winback campaigns
    const activeCampaigns = await prisma.winbackCampaign.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    })

    console.log(`🔄 Running daily winback job for ${activeCampaigns.length} active campaigns...`)

    for (const campaign of activeCampaigns) {
      // Calculate date range for this campaign
      const minDate = new Date(now)
      minDate.setDate(minDate.getDate() - campaign.maxDaysSinceLastVisit)
      
      const maxDate = new Date(now)
      maxDate.setDate(maxDate.getDate() - campaign.minDaysSinceLastVisit)

      console.log(`\n📧 Processing campaign: "${campaign.name}"`)
      console.log(`   Looking for customers with last visit between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`)

      // Find all customers with their most recent visit
      const customers = await prisma.customer.findMany({
        where: {
          marketingOptIn: true,
        },
        include: {
          visits: {
            where: {
              checkoutTime: {
                not: null,
              },
            },
            orderBy: {
              checkoutTime: 'desc',
            },
            take: 1,
          },
          winbackMessages: {
            where: {
              campaignId: campaign.id,
            },
          },
        },
      })

      let messagesCreated = 0

      for (const customer of customers) {
        // Skip if no visits
        if (customer.visits.length === 0) continue

        const lastVisit = customer.visits[0]
        const lastCheckoutTime = lastVisit.checkoutTime

        if (!lastCheckoutTime) continue

        // Check if last visit falls within the campaign's date range
        if (lastCheckoutTime >= minDate && lastCheckoutTime <= maxDate) {
          // Skip if already sent a message for this campaign
          if (customer.winbackMessages.length > 0) {
            console.log(`   ⏭️  Skipping ${customer.name || customer.phone} - already messaged for this campaign`)
            continue
          }

          // Create winback message
          await prisma.winbackMessage.create({
            data: {
              campaignId: campaign.id,
              customerId: customer.id,
              status: 'pending',
              sentAt: null,
              responseType: null,
            },
          })

          messagesCreated++
          console.log(`   ✓ Created message for ${customer.name || customer.phone} (last visit: ${lastCheckoutTime.toLocaleDateString()})`)
        }
      }

      console.log(`   📊 Total messages created for "${campaign.name}": ${messagesCreated}`)

      results.push({
        campaignName: campaign.name,
        messagesCreated,
      })
    }

    console.log('\n✅ Daily winback job completed')

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
      totalMessagesCreated: results.reduce((sum, r) => sum + r.messagesCreated, 0),
    })
  } catch (error) {
    console.error('Daily winback job error:', error)
    return NextResponse.json(
      { error: 'Failed to run daily winback job' },
      { status: 500 }
    )
  }
}
