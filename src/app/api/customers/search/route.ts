import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/customers/search
 * 
 * Search for customers by phone number or generic query.
 * 
 * Query Parameters:
 * - `phone`: Search by phone number (preferred, supports partial matching)
 * - `q`: Generic search by phone OR name
 * 
 * Response Formats:
 * - Single match: { customer: {...}, multiple: false }
 * - Multiple matches: { customers: [...], multiple: true }
 * - No matches: { customers: [], multiple: false }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phone = searchParams.get('phone')
    const query = searchParams.get('q')

    if (!phone && !query) {
      return NextResponse.json(
        { error: 'Either "phone" or "q" query parameter is required' },
        { status: 400 }
      )
    }

    // Phone-based search (preferred method for check-in)
    if (phone) {
      // Normalize phone input: remove spaces, dashes, parentheses, and trim
      const normalizedPhone = phone.trim().replace(/[\s\-()]/g, '')
      
      // Extract just the digits
      const digits = normalizedPhone.replace(/\D/g, '')

      if (digits.length === 0) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        )
      }

      // Search strategy:
      // 1. Try exact match first (most common case)
      // 2. If no exact match, try "endsWith" for partial matches
      // 3. If still nothing and digits < 7, try "contains"

      let customers = await prisma.customer.findMany({
        where: {
          phone: normalizedPhone,
        },
        include: {
          visits: {
            orderBy: { appointmentTime: 'desc' },
            take: 1,
            include: {
              service: true,
            },
          },
        },
        take: 10,
      })

      // If no exact match, try endsWith search
      if (customers.length === 0) {
        customers = await prisma.customer.findMany({
          where: {
            phone: {
              endsWith: digits,
            },
          },
          include: {
            visits: {
              orderBy: { appointmentTime: 'desc' },
              take: 1,
              include: {
                service: true,
              },
            },
          },
          take: 10,
        })
      }

      // If still nothing and input is short, try contains search
      if (customers.length === 0 && digits.length < 7) {
        customers = await prisma.customer.findMany({
          where: {
            phone: {
              contains: digits,
            },
          },
          include: {
            visits: {
              orderBy: { appointmentTime: 'desc' },
              take: 1,
              include: {
                service: true,
              },
            },
          },
          take: 10,
        })
      }

      // Format response based on match count
      if (customers.length === 0) {
        return NextResponse.json({
          customers: [],
          multiple: false,
        })
      }

      if (customers.length === 1) {
        const customer = customers[0]
        return NextResponse.json({
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            lastVisit: customer.visits[0] || null,
          },
          multiple: false,
        })
      }

      // Multiple matches
      return NextResponse.json({
        customers: customers.map((c: typeof customers[0]) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          lastVisit: c.visits[0] || null,
        })),
        multiple: true,
      })
    }

    // Generic query search (search by phone OR name)
    if (query) {
      const normalizedQuery = query.trim()

      if (normalizedQuery.length === 0) {
        return NextResponse.json(
          { error: 'Query cannot be empty' },
          { status: 400 }
        )
      }

      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            {
              phone: {
                contains: normalizedQuery,
              },
            },
            {
              name: {
                contains: normalizedQuery,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          visits: {
            orderBy: { appointmentTime: 'desc' },
            take: 1,
            include: {
              service: true,
            },
          },
        },
        take: 10,
      })

      if (customers.length === 0) {
        return NextResponse.json({
          customers: [],
          multiple: false,
        })
      }

      if (customers.length === 1) {
        const customer = customers[0]
        return NextResponse.json({
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            lastVisit: customer.visits[0] || null,
          },
          multiple: false,
        })
      }

      return NextResponse.json({
        customers: customers.map((c: typeof customers[0]) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          lastVisit: c.visits[0] || null,
        })),
        multiple: true,
      })
    }

    // Should never reach here due to earlier validation
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Customer Search] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search for customer',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
