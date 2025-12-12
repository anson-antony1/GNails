'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DashboardData = {
  totalVisits: number
  totalCustomers: number
  averageRating: number
  feedbackCount: number
  visitCountsByService: Array<{ serviceName: string; count: number }>
  ratingByWeek: Array<{ weekStart: Date; averageRating: number }>
}

type Props = {
  data: DashboardData
}

export function DashboardClient({ data }: Props) {
  // Format rating by week data for chart
  const ratingChartData = data.ratingByWeek.map((week) => ({
    weekStart: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rating: Math.round(week.averageRating * 10) / 10,
  }))

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Visits</p>
          <p className="text-4xl font-bold text-gray-900">{data.totalVisits}</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Customers</p>
          <p className="text-4xl font-bold text-gray-900">{data.totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
          <p className="text-4xl font-bold text-gray-900">
            {data.averageRating > 0 ? data.averageRating.toFixed(1) : '—'}
            {data.averageRating > 0 && <span className="text-lg text-gray-600"> / 10</span>}
          </p>
          <p className="text-xs text-gray-500 mt-1">Customer satisfaction</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Feedbacks Collected</p>
          <p className="text-4xl font-bold text-gray-900">{data.feedbackCount}</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits by Service */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Visits by Service</h2>
          {data.visitCountsByService.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.visitCountsByService}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="serviceName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No visit data available</p>
          )}
        </div>

        {/* Rating by Week */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating Trend</h2>
          {ratingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ratingChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekStart" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No rating data available</p>
          )}
        </div>
      </div>

      {/* Service Table (Alternative/Supplementary View) */}
      {data.visitCountsByService.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.visitCountsByService.map((service, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {service.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((service.count / data.totalVisits) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
