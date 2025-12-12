import { ReviewInsightsForm } from './review-insights-form'

export default function ReviewInsightsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">Review Insights</h1>
        <p className="text-slate-400 max-w-2xl">
          Paste Yelp/Google reviews and let the AI summarize what clients love and what needs work.
        </p>
      </div>

      <ReviewInsightsForm />
    </div>
  )
}
