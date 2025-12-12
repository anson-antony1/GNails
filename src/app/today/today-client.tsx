'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clock, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type Customer = {
  name: string | null
  phone: string
}

type Service = {
  name: string
}

type Visit = {
  id: string
  appointmentTime: Date | null
  checkoutTime: Date | null
  customer: Customer
  service: Service | null
}

type FeedbackRequest = {
  id: string
  sentAt: Date | null
  visit: {
    customer: Customer
    service: Service | null
    checkoutTime: Date | null
  }
}

type Issue = {
  id: string
  severity: string | null
  category: string | null
  summary: string | null
  createdAt: Date
  customer: Customer
  feedbackRequest: {
    rating: number | null
  } | null
}

type Props = {
  visits: Visit[]
  pendingFeedback: FeedbackRequest[]
  issues: Issue[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function TodayClient({ visits, pendingFeedback, issues }: Props) {
  const formatTime = (date: Date | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 lg:grid-cols-3"
    >
      {/* Today's Visits */}
      <motion.div variants={item}>
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--gn-gold)]/20">
                <Clock className="w-5 h-5 text-[var(--gn-gold)]" />
              </div>
              <div>
                <CardTitle className="text-lg">Today&apos;s Visits</CardTitle>
                <CardDescription>Recent check-ins and checkouts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {visits.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-slate-500 mb-2" />
                <p className="text-slate-400 text-sm">No visits yet today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.slice(0, 10).map((visit) => (
                  <div
                    key={visit.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-200 text-sm truncate">
                          {visit.customer.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {visit.customer.phone}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                        {formatTime(visit.checkoutTime || visit.appointmentTime)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      {visit.service?.name || 'Unknown service'}
                    </p>
                  </div>
                ))}
                {visits.length > 10 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    + {visits.length - 10} more visits
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Feedback */}
      <motion.div variants={item}>
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <MessageSquare className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Pending Feedback</CardTitle>
                <CardDescription>Awaiting customer response</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingFeedback.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <p className="text-slate-400 text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFeedback.slice(0, 10).map((request) => (
                  <div
                    key={request.id}
                    className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-200 text-sm truncate">
                          {request.visit.customer.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {request.visit.customer.phone}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      {request.visit.service?.name || 'Unknown service'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Sent {formatTime(request.sentAt)}
                    </p>
                  </div>
                ))}
                {pendingFeedback.length > 10 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    + {pendingFeedback.length - 10} more pending
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* New Issues */}
      <motion.div variants={item}>
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-lg">New Issues</CardTitle>
                <CardDescription>Flagged for attention today</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <p className="text-slate-400 text-sm">No issues today!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.slice(0, 10).map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            issue.severity === 'high'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : issue.severity === 'medium'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {(issue.severity || 'low').toUpperCase()}
                        </span>
                        {issue.category && (
                          <span className="px-2 py-0.5 text-xs rounded bg-white/5 text-slate-400 border border-white/10">
                            {issue.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-200 mb-2 line-clamp-2">
                      {issue.summary || 'No summary available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        {issue.customer.name || 'Anonymous'}
                        {issue.feedbackRequest && (
                          <span className="ml-2">
                            ★ {issue.feedbackRequest.rating}/10
                          </span>
                        )}
                      </div>
                      <Link href="/issues" className="group">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          View
                          <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {issues.length > 10 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    + {issues.length - 10} more issues
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
