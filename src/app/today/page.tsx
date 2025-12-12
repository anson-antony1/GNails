import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { TodayClient } from './today-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Today at G Nail Pines | G Nail Growth',
  description: 'Live operations view for today',
}

export default async function TodayPage() {
  // Get today's date range (start and end of day)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  // Fetch today's visits with related data
  const todaysVisits = await prisma.visit.findMany({
    where: {
      appointmentTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
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
    orderBy: {
      appointmentTime: 'desc',
    },
  })

  // Fetch pending feedback requests from today's visits
  const pendingFeedback = await prisma.feedbackRequest.findMany({
    where: {
      status: 'pending',
      visit: {
        appointmentTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    },
    include: {
      visit: {
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
      },
    },
    orderBy: {
      sentAt: 'desc',
    },
  })

  // Fetch issues created today
  const todaysIssues = await prisma.issue.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      customer: {
        select: {
          name: true,
          phone: true,
        },
      },
      feedbackRequest: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
          Today at G Nail Pines
        </h1>
        <p className="text-slate-400">
          Quick glance at visits, feedback, and any issues that need attention.
        </p>
        <p className="text-sm text-slate-500">
          {now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Three-Column Grid */}
      <TodayClient
        visits={todaysVisits.map(v => ({
          id: v.id,
          appointmentTime: v.appointmentTime,
          checkoutTime: v.checkoutTime,
          customer: {
            name: v.customer.name,
            phone: v.customer.phone,
          },
          service: v.service ? { name: v.service.name } : null,
        }))}
        pendingFeedback={pendingFeedback.map(pf => ({
          id: pf.id,
          sentAt: pf.sentAt,
          visit: {
            customer: {
              name: pf.visit.customer.name,
              phone: pf.visit.customer.phone,
            },
            service: pf.visit.service ? { name: pf.visit.service.name } : null,
            checkoutTime: pf.visit.checkoutTime,
          },
        }))}
        issues={todaysIssues.map(i => ({
          id: i.id,
          severity: i.severity,
          category: i.category,
          summary: i.summary,
          createdAt: i.createdAt,
          customer: {
            name: i.customer.name,
            phone: i.customer.phone,
          },
          feedbackRequest: i.feedbackRequest ? { rating: i.feedbackRequest.rating } : null,
        }))}
      />
    </div>
  )
}
