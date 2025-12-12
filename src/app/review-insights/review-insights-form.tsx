'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, TrendingUp, Lightbulb, Sparkles } from 'lucide-react'

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

  const getLineCount = () => {
    if (!reviewText.trim()) return 0
    return reviewText.trim().split('\n').filter(line => line.trim()).length
  }

  const SkeletonLoader = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 70}%` }} />
      ))}
    </div>
  )

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column: Input Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Paste Reviews</CardTitle>
            <CardDescription>
              Copy reviews from Yelp, Google, or anywhere else
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reviews">Review Text</Label>
              <textarea
                id="reviews"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Paste multiple reviews here...&#10;&#10;Example:&#10;Great service but wait time was too long. Love the new gel-x!&#10;&#10;Staff was so friendly. Clean salon but prices are a bit high."
                rows={16}
                className="mt-1.5 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--gn-gold)] focus:border-transparent font-mono text-sm resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 You can paste multiple reviews at once. One review per line or paragraph is fine.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-slate-400">
                {getLineCount() > 0 ? (
                  <>
                    {getLineCount()} {getLineCount() === 1 ? 'line' : 'lines'} detected
                  </>
                ) : (
                  'No text entered'
                )}
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !reviewText.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {analyzing ? 'Analyzing...' : 'Analyze Reviews'}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Insights Panel */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!result && !analyzing && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="pt-6 pb-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-200 mb-2">
                    AI Insights
                  </h3>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Paste reviews on the left to see patterns here. Our AI will identify complaints, positives, and suggest improvements.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {analyzing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Loading Skeleton for Complaints */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <CardTitle>Top Complaints</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <SkeletonLoader />
                </CardContent>
              </Card>

              {/* Loading Skeleton for Positives */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <CardTitle>Top Positives</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <SkeletonLoader />
                </CardContent>
              </Card>

              {/* Loading Skeleton for Recommendations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--gn-gold)]/20">
                      <Lightbulb className="w-5 h-5 text-[var(--gn-gold)]" />
                    </div>
                    <CardTitle>Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <SkeletonLoader />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Top Complaints */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <CardTitle>Top Complaints</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.topComplaints.length > 0 ? (
                    <ul className="space-y-3">
                      {result.topComplaints.map((complaint, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2.5"
                        >
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                          <span className="text-slate-300 text-sm leading-relaxed">{complaint}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic text-sm">No complaints identified</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Positives */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <CardTitle>Top Positives</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.topPositives.length > 0 ? (
                    <ul className="space-y-3">
                      {result.topPositives.map((positive, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2.5"
                        >
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="text-slate-300 text-sm leading-relaxed">{positive}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic text-sm">No positives identified</p>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--gn-gold)]/20">
                      <Lightbulb className="w-5 h-5 text-[var(--gn-gold)]" />
                    </div>
                    <CardTitle>Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.recommendations.length > 0 ? (
                    <ul className="space-y-4">
                      {result.recommendations.map((recommendation, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-[var(--gn-gold)]/10 border border-[var(--gn-gold)]/20"
                        >
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--gn-gold)]/30 text-[var(--gn-gold)] text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-slate-200 text-sm leading-relaxed pt-0.5">{recommendation}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic text-sm">No recommendations available</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
