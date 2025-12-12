import { ReviewInsightsForm } from './review-insights-form'

export default function ReviewInsightsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Insights</h1>
        <p className="text-gray-600">
          Paste your Yelp or Google reviews to get actionable insights and identify areas for improvement.
        </p>
      </div>
      <ReviewInsightsForm />
    </div>
  )
}
