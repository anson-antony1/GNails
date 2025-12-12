import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/settings'

export async function GET() {
  try {
    // Load settings for threshold values (configurable via Settings page)
    const settings = await getSettings()
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Total visits in last 30 days
    const totalVisits = await prisma.visit.count({
      where: {
        appointmentTime: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Total unique customers who visited in last 30 days
    const totalCustomers = await prisma.visit.findMany({
      where: {
        appointmentTime: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        customerId: true,
      },
      distinct: ['customerId'],
    })

    // Feedback requests in last 30 days with ratings
    const feedbackRequests = await prisma.feedbackRequest.findMany({
      where: {
        visit: {
          appointmentTime: {
            gte: thirtyDaysAgo,
          },
        },
      },
      select: {
        rating: true,
        visit: {
          select: {
            appointmentTime: true,
          },
        },
      },
    })

    // Calculate average rating (excluding null ratings)
    const ratingsWithValues = feedbackRequests.filter((fr: { rating: number | null }) => fr.rating !== null)
    const averageRating =
      ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum: number, fr: { rating: number | null }) => sum + (fr.rating || 0), 0) /
          ratingsWithValues.length
        : 0

    const feedbackCount = feedbackRequests.length

    // Visit counts by service
    const visitsByService = await prisma.visit.groupBy({
      by: ['serviceId'],
      where: {
        appointmentTime: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    })

    // Fetch service names
    const serviceIds = visitsByService.map((v: { serviceId: string }) => v.serviceId)
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    const serviceMap = new Map(services.map((s: { id: string; name: string }) => [s.id, s.name]))

    const visitCountsByService = visitsByService
      .map((v: { serviceId: string; _count: { id: number } }) => ({
        serviceName: serviceMap.get(v.serviceId) || 'Unknown',
        count: v._count.id,
      }))
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count)

    // Rating by week
    // Group feedback by week and calculate average
    const ratingsByWeek = new Map<string, { sum: number; count: number }>()

    ratingsWithValues.forEach((fr: { rating: number | null; visit: { appointmentTime: Date } }) => {
      const date = new Date(fr.visit.appointmentTime)
      // Get the Monday of that week (start of week)
      const dayOfWeek = date.getDay()
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // adjust when day is Sunday
      const monday = new Date(date)
      monday.setDate(diff)
      monday.setHours(0, 0, 0, 0)

      const weekKey = monday.toISOString().split('T')[0]

      if (!ratingsByWeek.has(weekKey)) {
        ratingsByWeek.set(weekKey, { sum: 0, count: 0 })
      }

      const weekData = ratingsByWeek.get(weekKey)!
      weekData.sum += fr.rating || 0
      weekData.count += 1
    })

    const ratingByWeek = Array.from(ratingsByWeek.entries())
      .map(([weekStart, data]) => ({
        weekStart: new Date(weekStart),
        averageRating: data.count > 0 ? data.sum / data.count : 0,
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())

    // SMS activity metrics (last 30 days)
    const feedbackSmsSentLast30Days = await prisma.feedbackRequest.count({
      where: {
        channel: 'sms',
        status: 'sent',
        sentAt: {
          gte: thirtyDaysAgo,
          not: null,
        },
      },
    })

    const winbackSmsSentLast30Days = await prisma.winbackMessage.count({
      where: {
        status: 'sent',
        sentAt: {
          gte: thirtyDaysAgo,
          not: null,
        },
      },
    })

    // ============================================================================
    // IMPACT / ROI METRICS (Last 30 Days)
    // ============================================================================

    // 1. Issues Resolved Privately
    // Business meaning: Number of low-rating issues that were resolved privately 
    // (prevented from becoming negative Yelp/Google reviews)
    // Count issues with status="resolved" and resolvedAt in last 30 days
    // Default to 0 if count fails
    const issuesResolvedPrivatelyLast30Days = Math.max(0, await prisma.issue.count({
      where: {
        status: 'resolved',
        resolvedAt: {
          gte: thirtyDaysAgo,
          not: null,
        },
      },
    }) || 0)

    // 2. Promoter Review Clicks
    // Business meaning: Number of promoter ratings where clients clicked a Google/Yelp review link
    // These are happy customers who took action to leave a public 5★ review
    // Count feedback requests with rating >= promoter threshold AND reviewLinkClicked = true in last 30 days
    // Default to 0 if count fails
    const promoterReviewClicksLast30Days = Math.max(0, await prisma.feedbackRequest.count({
      where: {
        rating: {
          gte: settings.promoterThreshold,
        },
        reviewLinkClicked: true,
        respondedAt: {
          gte: thirtyDaysAgo,
          not: null,
        },
      },
    }) || 0)

    // 3. Winback Revenue Estimate
    // Business meaning: Estimated revenue recovered from winback texts in the last 30 days
    // Formula: (number of customers who booked after winback) × (average ticket price)
    // NOTE: This is an estimate for business impact, not exact accounting.
    // It assumes each winback booking represents the average ticket value.
    // Count winback messages that resulted in a booking (responseType = "booked")
    const winbackBookings = await prisma.winbackMessage.count({
      where: {
        responseType: 'booked',
        sentAt: {
          gte: thirtyDaysAgo,
          not: null,
        },
      },
    })

    // Calculate average visit price from last 30 days
    const recentVisitsWithPrice = await prisma.visit.findMany({
      where: {
        appointmentTime: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        priceCharged: true,
      },
    })

    const averageVisitPrice =
      recentVisitsWithPrice.length > 0
        ? recentVisitsWithPrice.reduce((sum: number, v: { priceCharged: number | null }) => sum + (v.priceCharged || 0), 0) /
          recentVisitsWithPrice.length
        : 0

    // Winback revenue estimate = number of booked winbacks × average price
    // Use Math.max to ensure we never return negative values or NaN
    const winbackRevenueEstimateLast30Days = Math.max(0, Math.round(winbackBookings * averageVisitPrice) || 0)

    return NextResponse.json({
      // Core metrics
      totalVisits,
      totalCustomers: totalCustomers.length,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      feedbackCount,
      visitCountsByService,
      ratingByWeek,
      
      // Engagement metrics
      feedbackSmsSentLast30Days,
      winbackSmsSentLast30Days,
      
      // Impact / ROI metrics (business value generated)
      issuesResolvedPrivatelyLast30Days, // Problems caught before becoming bad reviews
      promoterReviewClicksLast30Days,    // Happy customers who clicked to leave 5★ reviews
      winbackRevenueEstimateLast30Days,  // Revenue from customers brought back via SMS campaigns
    })
  } catch (error) {
    console.error('Dashboard overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard overview' },
      { status: 500 }
    )
  }
}
