import { DashboardClient } from './dashboard-client'

type DashboardData = {
  totalVisits: number
  totalCustomers: number
  averageRating: number
  feedbackCount: number
  visitCountsByService: Array<{ serviceName: string; count: number }>
  ratingByWeek: Array<{ weekStart: Date; averageRating: number }>
  feedbackSmsSentLast30Days: number
  winbackSmsSentLast30Days: number
  // Impact metrics (optional for backward compatibility)
  issuesResolvedPrivatelyLast30Days?: number
  promoterReviewClicksLast30Days?: number
  winbackRevenueEstimateLast30Days?: number
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
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50">Analytics</h1>
          <p className="text-slate-400">30-day view of visits, feedback, and ratings.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400">Failed to load dashboard data. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">Analytics</h1>
        <p className="text-slate-400">30-day view of visits, feedback, and ratings.</p>
      </div>

      <DashboardClient data={data} />
    </div>
  )
}
