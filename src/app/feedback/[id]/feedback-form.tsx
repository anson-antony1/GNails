'use client'

import { useState } from 'react'
import { Sparkles, Heart } from 'lucide-react'

type Props = {
  feedbackRequestId: string
}

export function FeedbackForm({ feedbackRequestId }: Props) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRatingClick = (value: number) => {
    setRating(value)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/feedback/${feedbackRequestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-[var(--gn-gold)]/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-[var(--gn-gold)] fill-current" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--gn-ink)] mb-3">Thank You!</h2>
        <p className="text-[var(--gn-ink)]/70">
          Your feedback means the world to us. We look forward to seeing you again soon!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Buttons */}
      <div>
        <p className="text-sm font-medium text-[var(--gn-ink)] mb-3">How would you rate your experience?</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => handleRatingClick(value)}
              className={`
                w-12 h-12 rounded-full font-semibold transition-all duration-200
                ${
                  rating === value
                    ? 'bg-[var(--gn-gold)] text-white shadow-lg shadow-[var(--gn-gold)]/30 scale-110 ring-2 ring-[var(--gn-gold)] ring-offset-2'
                    : 'bg-[var(--gn-cream)] text-[var(--gn-ink)] hover:bg-[var(--gn-gold)]/20 hover:scale-105'
                }
              `}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[var(--gn-ink)]/40 mt-3 px-2">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Conditional UI based on rating */}
      {rating !== null && (
        <div className="pt-4 border-t border-[var(--gn-gold)]/20">
          {rating >= 9 ? (
            // High rating - ask for review
            <div className="space-y-4">
              <div className="bg-[var(--gn-gold)]/5 border border-[var(--gn-gold)]/20 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-[var(--gn-gold)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[var(--gn-ink)] font-medium mb-1">
                      We're so glad you had a great experience!
                    </p>
                    <p className="text-[var(--gn-ink)]/60 text-sm">
                      If you have 10 seconds, a public review helps us a ton.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://www.google.com/search?q=g+nail+pines"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSubmit}
                    className="flex-1 bg-white border-2 border-[var(--gn-gold)] text-[var(--gn-ink)] px-4 py-2.5 rounded-lg hover:bg-[var(--gn-gold)]/10 transition text-center font-medium"
                  >
                    Google Review
                  </a>
                  <a
                    href="https://www.yelp.com/search?find_desc=g+nail+pines"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSubmit}
                    className="flex-1 bg-white border-2 border-[var(--gn-rose)] text-[var(--gn-ink)] px-4 py-2.5 rounded-lg hover:bg-[var(--gn-rose)]/10 transition text-center font-medium"
                  >
                    Yelp Review
                  </a>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[var(--gn-gold)] text-white px-6 py-3 rounded-lg hover:bg-[var(--gn-gold)]/90 disabled:bg-[var(--gn-ink)]/20 disabled:cursor-not-allowed transition font-medium shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          ) : (
            // Lower rating - ask for feedback
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--gn-ink)] mb-2">
                  What could we have done better?
                </label>
                <p className="text-xs text-[var(--gn-ink)]/50 mb-3">
                  Your feedback goes directly to the owner and helps us improve.
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[var(--gn-gold)]/20 rounded-lg focus:ring-2 focus:ring-[var(--gn-gold)]/50 focus:border-[var(--gn-gold)] bg-[var(--gn-cream)] text-[var(--gn-ink)] placeholder:text-[var(--gn-ink)]/40"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[var(--gn-gold)] text-white px-6 py-3 rounded-lg hover:bg-[var(--gn-gold)]/90 disabled:bg-[var(--gn-ink)]/20 disabled:cursor-not-allowed transition font-medium shadow-sm"
              >
                {submitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
