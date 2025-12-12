import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all open and in-progress issues with related data
    const issues = await prisma.issue.findMany({
      where: {
        status: {
          in: ['open', 'in_progress'],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        feedbackRequest: {
          include: {
            visit: {
              include: {
                service: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { severity: 'desc' }, // high first
        { createdAt: 'desc' }, // newest first
      ],
    })

    // Transform for easier frontend consumption
    const transformedIssues = issues.map((issue) => ({
      id: issue.id,
      createdAt: issue.createdAt,
      status: issue.status,
      severity: issue.severity,
      category: issue.category,
      summary: issue.summary,
      details: issue.details,
      ownerResponse: issue.ownerResponse,
      customer: {
        id: issue.customer.id,
        name: issue.customer.name || 'Anonymous',
        phone: issue.customer.phone,
      },
      rating: issue.feedbackRequest.rating,
      serviceName: issue.feedbackRequest.visit?.service?.name || 'Unknown',
      visitDate: issue.feedbackRequest.visit?.appointmentTime,
    }))

    return NextResponse.json({ issues: transformedIssues })
  } catch (error) {
    console.error('Issues fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}
