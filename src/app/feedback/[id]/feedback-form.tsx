'use client'

import { useState } from 'react'

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
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You! 🎉</h2>
        <p className="text-gray-600">
          We truly appreciate your feedback. It helps us serve you better!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Buttons */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Select your rating:</p>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => handleRatingClick(value)}
              className={`
                h-12 rounded-lg font-semibold transition-all
                ${
                  rating === value
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }
              `}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Conditional UI based on rating */}
      {rating !== null && (
        <div className="pt-4 border-t border-gray-200">
          {rating >= 9 ? (
            // High rating - ask for review
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-medium mb-2">
                  We&apos;re so happy you had a great experience! 🌟
                </p>
                <p className="text-green-700 text-sm mb-4">
                  Would you mind leaving a quick review to help others discover us?
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://www.google.com/search?q=g+nail+growth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white border-2 border-green-600 text-green-700 px-4 py-2 rounded-md hover:bg-green-50 transition text-center font-medium"
                  >
                    Google Review
                  </a>
                  <a
                    href="https://www.yelp.com/search?find_desc=g+nail+growth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white border-2 border-red-600 text-red-700 px-4 py-2 rounded-md hover:bg-red-50 transition text-center font-medium"
                  >
                    Yelp Review
                  </a>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          ) : (
            // Lower rating - ask for feedback
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What could we have done better?
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Please share your thoughts..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
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
