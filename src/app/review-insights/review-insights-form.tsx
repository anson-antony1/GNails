'use client'

import { useState } from 'react'

type AnalysisResult = {
  topComplaints: string[]
  topPositives: string[]
  recommendations: string[]
}

export function ReviewInsightsForm() {
  const [reviewText, setReviewText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!reviewText.trim()) {
      setError('Please paste some reviews to analyze')
      return
    }

    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/review-insights/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze reviews')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste Reviews
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Paste your Yelp or Google reviews here... (one per line or separated by blank lines)"
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {reviewText.trim() ? `${reviewText.trim().split('\n').length} lines` : 'No text entered'}
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !reviewText.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {analyzing ? 'Analyzing...' : 'Analyze Reviews'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Top Complaints */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Top Complaints</h2>
            </div>
            {result.topComplaints.length > 0 ? (
              <ul className="space-y-2">
                {result.topComplaints.map((complaint, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-700">{complaint}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No complaints identified</p>
            )}
          </div>

          {/* Top Positives */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Top Positives</h2>
            </div>
            {result.topPositives.length > 0 ? (
              <ul className="space-y-2">
                {result.topPositives.map((positive, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span className="text-gray-700">{positive}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No positives identified</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
            </div>
            {result.recommendations.length > 0 ? (
              <ul className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start bg-blue-50 p-3 rounded-md">
                    <span className="text-blue-600 font-bold mr-3">{index + 1}.</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No recommendations available</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
