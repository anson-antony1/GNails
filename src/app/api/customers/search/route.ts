import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        visits: {
          orderBy: { appointmentTime: 'desc' },
          take: 1,
          include: {
            service: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        lastVisit: customer.visits[0] || null,
      },
    })
  } catch (error) {
    console.error('Customer search error:', error)
    return NextResponse.json(
      { error: 'Failed to search for customer' },
      { status: 500 }
    )
  }
}
