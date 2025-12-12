import { prisma } from '@/lib/prisma'
import { CheckInForm } from './check-in-form'

export default async function CheckInPage() {
  // Fetch active services for the dropdown
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Check-in</h1>
      <CheckInForm services={services} />
    </div>
  )
}
