import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name, email, serviceId, staffName, priceCharged } = body

    // Validate required fields
    if (!phone || !serviceId || priceCharged === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, serviceId, priceCharged' },
        { status: 400 }
      )
    }

    // Upsert customer by phone
    const customer = await prisma.customer.upsert({
      where: { phone },
      update: {
        name: name || undefined,
        email: email || undefined,
      },
      create: {
        phone,
        name: name || null,
        email: email || null,
        marketingOptIn: true,
      },
    })

    // Create visit with immediate checkout
    const now = new Date()
    const visit = await prisma.visit.create({
      data: {
        customerId: customer.id,
        serviceId,
        staffName: staffName || null,
        appointmentTime: now,
        checkoutTime: now,
        priceCharged: parseInt(priceCharged, 10),
        source: 'internal-checkin',
        notes: null,
      },
      include: {
        customer: true,
        service: true,
      },
    })

    // Create pending feedback request
    await prisma.feedbackRequest.create({
      data: {
        visitId: visit.id,
        channel: 'sms',
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      visit,
      customer,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    )
  }
}
