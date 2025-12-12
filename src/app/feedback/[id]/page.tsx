import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FeedbackForm } from './feedback-form'
import { Sparkles } from 'lucide-react'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function FeedbackPage({ params }: Props) {
  const { id } = await params

  // Load feedback request with related data
  const feedbackRequest = await prisma.feedbackRequest.findUnique({
    where: { id },
    include: {
      visit: {
        include: {
          customer: true,
          service: true,
        },
      },
    },
  })

  if (!feedbackRequest) {
    notFound()
  }

  // Check if already responded
  if (feedbackRequest.respondedAt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--gn-gold-soft)] via-[var(--gn-cream)] to-white flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl border border-[var(--gn-gold)]/20 p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-[var(--gn-gold)]/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-[var(--gn-gold)]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--gn-ink)] mb-3">
            You've Already Shared Feedback
          </h1>
          <p className="text-[var(--gn-ink)]/70">
            Thank you for your time! We truly appreciate your input.
          </p>
        </div>
      </div>
    )
  }

  // Get customer first name
  const customerName = feedbackRequest.visit.customer.name
  const firstName = customerName?.split(' ')[0] || null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--gn-gold-soft)] via-[var(--gn-cream)] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl border border-[var(--gn-gold)]/20 p-8">
        {/* Logo & Greeting */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[var(--gn-gold)]" />
            <h1 className="text-2xl font-bold text-[var(--gn-ink)]">G Nail Pines</h1>
          </div>
          <p className="text-lg font-medium text-[var(--gn-ink)] mb-2">
            {firstName ? `Thank you, ${firstName}!` : 'Thank you for visiting!'}
          </p>
          <p className="text-sm text-[var(--gn-ink)]/60">
            We&apos;d love your quick feedback to help us keep every visit relaxing and flawless.
          </p>
        </div>

        {/* Visit Details */}
        <div className="mb-6 p-4 bg-[var(--gn-cream)] rounded-lg border border-[var(--gn-gold)]/10">
          <p className="text-xs text-[var(--gn-ink)]/50 mb-1">Your visit:</p>
          <p className="font-semibold text-[var(--gn-ink)]">{feedbackRequest.visit.service.name}</p>
          <p className="text-sm text-[var(--gn-ink)]/60">
            {new Date(feedbackRequest.visit.appointmentTime).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <FeedbackForm feedbackRequestId={id} />
      </div>
    </div>
  )
}
