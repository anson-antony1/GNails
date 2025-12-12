import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FeedbackForm } from './feedback-form'

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
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanks Again!
          </h1>
          <p className="text-gray-600">
            You&apos;ve already submitted feedback for this visit. We appreciate your input!
          </p>
        </div>
      </div>
    )
  }

  // Get customer first name
  const customerName = feedbackRequest.visit.customer.name
  const firstName = customerName?.split(' ')[0] || null
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there'

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{greeting}! 👋</h1>
        <p className="text-lg text-gray-700 mb-8">
          Please rate your recent visit at <span className="font-semibold">G Nail Growth</span> from 1–10.
        </p>

        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-1">Your visit:</p>
          <p className="font-medium text-gray-900">{feedbackRequest.visit.service.name}</p>
          <p className="text-sm text-gray-500">
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
