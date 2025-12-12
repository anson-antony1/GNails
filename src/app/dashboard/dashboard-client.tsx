'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Star, MessageSquare, MessageCircle, Send, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

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

type Props = {
  data: DashboardData
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function DashboardClient({ data }: Props) {
  // Format rating by week data for chart
  const ratingChartData = data.ratingByWeek.map((week) => ({
    weekStart: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rating: Math.round(week.averageRating * 10) / 10,
  }))

  const kpiCards = [
    {
      label: 'TOTAL VISITS',
      value: data.totalVisits,
      subtext: 'Last 30 days',
      icon: TrendingUp,
      color: 'text-[var(--gn-gold)]',
    },
    {
      label: 'TOTAL CUSTOMERS',
      value: data.totalCustomers,
      subtext: 'All time',
      icon: Users,
      color: 'text-emerald-400',
    },
    {
      label: 'AVERAGE RATING',
      value: data.averageRating > 0 ? `${data.averageRating.toFixed(1)} / 10` : '—',
      subtext: 'Customer satisfaction',
      icon: Star,
      color: 'text-amber-400',
    },
    {
      label: 'FEEDBACKS COLLECTED',
      value: data.feedbackCount,
      subtext: 'Last 30 days',
      icon: MessageSquare,
      color: 'text-blue-400',
    },
  ]

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <motion.div key={index} variants={item}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {kpi.label}
                      </p>
                      <p className={`text-3xl md:text-4xl font-bold ${kpi.color}`}>
                        {kpi.value}
                      </p>
                      <p className="text-xs text-slate-500">{kpi.subtext}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <Icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* SMS Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-slate-200 mb-4">SMS Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    FEEDBACK SMS SENT
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-[var(--gn-gold)]">
                    {data.feedbackSmsSentLast30Days}
                  </p>
                  <p className="text-xs text-slate-500">Feedback requests delivered via SMS</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5">
                  <MessageCircle className="w-5 h-5 text-[var(--gn-gold)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    WINBACK SMS SENT
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-purple-400">
                    {data.winbackSmsSentLast30Days}
                  </p>
                  <p className="text-xs text-slate-500">Winback texts to inactive clients</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5">
                  <Send className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Impact / ROI Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-50">Value This Month</h2>
          <p className="text-sm text-slate-400">
            Direct business impact from G Nail Growth in the last 30 days
          </p>
        </div>

        {/* Empty state when all metrics are zero */}
        {(data.winbackRevenueEstimateLast30Days ?? 0) === 0 &&
         (data.promoterReviewClicksLast30Days ?? 0) === 0 &&
         (data.issuesResolvedPrivatelyLast30Days ?? 0) === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 space-y-2">
                <Info className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-slate-400 text-sm">
                  Run winback campaigns and collect more feedback to see your impact here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Winback Revenue */}
          <Card className="gn-glass-gold">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Winback Revenue
                    </span>
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 z-10">
                        We multiply the number of clients who returned after winback texts by your average ticket in the last 30 days.
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--gn-gold)]/20">
                    <TrendingUp className="w-4 h-4 text-[var(--gn-gold)]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-[var(--gn-gold)]">
                    {formatCurrency(Math.max(0, data.winbackRevenueEstimateLast30Days ?? 0))}
                  </p>
                  <p className="text-xs text-slate-500">
                    Estimated revenue from customers who returned after winback campaigns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promoter Review Clicks */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      5★ Review Clicks
                    </span>
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 z-10">
                        Customers who rated you 9 or 10 out of 10 and clicked the link to leave a Google or Yelp review.
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Star className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-amber-400">
                    {Math.max(0, data.promoterReviewClicksLast30Days ?? 0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Happy customers (9-10 rating) who clicked to leave a review
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues Resolved Privately */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Issues Prevented
                    </span>
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 z-10">
                        Low ratings that you resolved directly with the customer instead of letting them become public 1-star reviews.
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold text-emerald-400">
                    {Math.max(0, data.issuesResolvedPrivatelyLast30Days ?? 0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Problems caught and resolved before turning into negative reviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Visits by Service */}
        <Card>
          <CardHeader>
            <CardTitle>Visits by Service</CardTitle>
          </CardHeader>
          <CardContent>
            {data.visitCountsByService.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.visitCountsByService}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="serviceName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Bar dataKey="count" fill="#d6a74a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-8">No visit data available</p>
            )}
          </CardContent>
        </Card>

        {/* Rating by Week */}
        <Card>
          <CardHeader>
            <CardTitle>Average Rating by Week</CardTitle>
          </CardHeader>
          <CardContent>
            {ratingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ratingChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="weekStart" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#065f46' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-8">No rating data available</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

    </div>
  )
}
