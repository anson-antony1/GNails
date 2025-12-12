import { DashboardClient } from './dashboard-client'

type DashboardData = {
  totalVisits: number
  totalCustomers: number
  averageRating: number
  feedbackCount: number
  visitCountsByService: Array<{ serviceName: string; count: number }>
  ratingByWeek: Array<{ weekStart: Date; averageRating: number }>
}

async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/dashboard/overview`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch dashboard data')
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">Failed to load dashboard data. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">G Nail Growth Dashboard</h1>
      <DashboardClient data={data} />
    </div>
  )
}
