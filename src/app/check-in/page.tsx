import { prisma } from '@/lib/prisma'
import { getRecentVisits } from '@/lib/visits'
import { CheckInPageClient } from './check-in-page-client'
import { isStaffOrOwner } from '@/lib/auth'

export default async function CheckInPage() {
  // Check if user is authenticated (owner or staff)
  const isAuthorized = await isStaffOrOwner()

  // Fetch active services for the dropdown
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  // Fetch last 5 check-ins for quick verification
  const recentVisits = await getRecentVisits(5)

  return (
    <CheckInPageClient
      services={services}
      initialRecentVisits={recentVisits}
      authorized={isAuthorized}
    />
  )
}
