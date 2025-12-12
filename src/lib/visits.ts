/**
 * Server-side helper functions for visit operations
 */

import 'server-only'
import { prisma } from './prisma'

/**
 * Result type for recent visits query
 */
export type RecentVisit = {
  id: string
  appointmentTime: Date
  checkoutTime: Date | null
  customerName: string | null
  customerPhone: string
  serviceName: string
  priceCharged: number
}

/**
 * Get recent visits with customer and service information
 * 
 * @param limit - Maximum number of visits to return (default: 5)
 * @returns Array of recent visits with customer and service details
 * 
 * @example
 * ```ts
 * const recentVisits = await getRecentVisits(10)
 * ```
 */
export async function getRecentVisits(limit: number = 5): Promise<RecentVisit[]> {
  const visits = await prisma.visit.findMany({
    take: limit,
    orderBy: { checkoutTime: 'desc' },
    where: {
      checkoutTime: { not: null },
    },
    include: {
      customer: {
        select: {
          name: true,
          phone: true,
        },
      },
      service: {
        select: {
          name: true,
        },
      },
    },
  })

  return visits.map((visit: typeof visits[0]) => ({
    id: visit.id,
    appointmentTime: visit.appointmentTime,
    checkoutTime: visit.checkoutTime,
    customerName: visit.customer.name,
    customerPhone: visit.customer.phone,
    serviceName: visit.service.name,
    priceCharged: visit.priceCharged,
  }))
}
