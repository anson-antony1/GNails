import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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

    return NextResponse.json({
      totalVisits,
      totalCustomers: totalCustomers.length,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      feedbackCount,
      visitCountsByService,
      ratingByWeek,
    })
  } catch (error) {
    console.error('Dashboard overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard overview' },
      { status: 500 }
    )
  }
}
