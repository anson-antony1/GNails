'use client'

import { useEffect, useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Clock, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface Issue {
  id: string
  createdAt: string
  status: string
  severity: string | null
  category: string | null
  summary: string | null
  details: string | null
  ownerResponse: string | null
  customer: {
    id: string
    name: string
    phone: string
  }
  rating: number
  serviceName: string
  visitDate: string
}

export default function IssueInboxClient() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('open')
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [generatingReply, setGeneratingReply] = useState<string | null>(null)
  const [generatedReplies, setGeneratedReplies] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues')
      if (!response.ok) throw new Error('Failed to fetch issues')
      const data = await response.json()
      setIssues(data.issues)
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    // Optimistic update
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    )

    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        // Revert on error
        fetchIssues()
        throw new Error('Failed to update issue')
      }

      // Refresh to get server state
      startTransition(() => {
        fetchIssues()
      })
    } catch (error) {
      console.error('Failed to update issue:', error)
    }
  }

  const generateReply = async (issue: Issue) => {
    setGeneratingReply(issue.id)
    try {
      const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_WORKER_URL || 'https://gnail-ai-worker.ansonkanniman.workers.dev'
      
      const response = await fetch(`${workerUrl}/issue-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: issue.summary || issue.details,
          customerName: issue.customer.name,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate reply')

      const data = await response.json()
      setGeneratedReplies((prev) => ({
        ...prev,
        [issue.id]: data.replyText,
      }))
    } catch (error) {
      console.error('Failed to generate reply:', error)
      alert('Failed to generate reply. Please try again.')
    } finally {
      setGeneratingReply(null)
    }
  }

  const getIssuesByStatus = (status: string) => {
    return issues.filter(issue => issue.status === status)
  }

  const openIssues = getIssuesByStatus('open')
  const inProgressIssues = getIssuesByStatus('in_progress')
  const resolvedIssues = getIssuesByStatus('resolved')

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gn-gold)]"></div>
      </div>
    )
  }

  const renderIssuesList = (issuesList: Issue[]) => {
    if (issuesList.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">No issues here!</h3>
          <p className="text-slate-400">Keep up the great work.</p>
        </motion.div>
      )
    }

    return (
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {issuesList.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg hover:border-[var(--gn-gold)]/30 transition-all duration-200">
                <CardContent className="pt-6">
                  {/* Top Row: Severity + Category + Time | Status Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Severity Badge */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        issue.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        issue.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {issue.severity === 'high' && <AlertCircle className="w-3 h-3" />}
                        {issue.severity === 'medium' && <Clock className="w-3 h-3" />}
                        {issue.severity?.toUpperCase() || 'LOW'}
                      </div>
                      
                      {/* Category */}
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                        {issue.category || 'Uncategorized'}
                      </span>
                      
                      {/* Time ago */}
                      <span className="text-xs text-slate-500">
                        {getTimeAgo(issue.createdAt)}
                      </span>
                    </div>

                    {/* Status Actions */}
                    <div className="flex gap-2">
                      {issue.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateIssueStatus(issue.id, 'in_progress')}
                          disabled={isPending}
                        >
                          <Clock className="w-3 h-3 mr-1.5" />
                          Start
                        </Button>
                      )}
                      {issue.status === 'in_progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateIssueStatus(issue.id, 'resolved')}
                          disabled={isPending}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1.5" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Middle: Summary + Customer Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-slate-100">
                      {issue.summary || 'No summary available'}
                    </h3>
                    
                    {/* Customer info line */}
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="font-medium text-slate-300">{issue.customer.name}</span>
                      <span>•</span>
                      <span>{issue.customer.phone}</span>
                      <span>•</span>
                      <span className={`font-medium ${
                        issue.rating <= 5 ? 'text-red-400' : issue.rating <= 7 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {issue.rating}/10
                      </span>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {expandedIssue === issue.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View full details
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedIssue === issue.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10 space-y-4"
                    >
                      {/* Customer Comment */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Customer Comment:</h4>
                        <p className="text-slate-400 bg-white/5 p-4 rounded-lg border border-white/10 italic text-sm">
                          &quot;{issue.details}&quot;
                        </p>
                      </div>

                      {/* Generate Reply Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-slate-300">
                            AI-Generated Reply:
                          </h4>
                          {!generatedReplies[issue.id] && (
                            <Button
                              size="sm"
                              onClick={() => generateReply(issue)}
                              disabled={generatingReply === issue.id}
                            >
                              <Sparkles className="w-3 h-3 mr-1.5" />
                              {generatingReply === issue.id ? 'Generating...' : 'Generate Reply'}
                            </Button>
                          )}
                        </div>
                        {generatedReplies[issue.id] ? (
                          <>
                            <div className="bg-[var(--gn-gold)]/10 p-4 rounded-lg border border-[var(--gn-gold)]/20">
                              <p className="text-slate-200 text-sm">{generatedReplies[issue.id]}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              💡 Copy this response and customize before sending
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 bg-white/5 p-4 rounded-lg border border-white/10">
                            Click &quot;Generate Reply&quot; to get an AI-drafted response
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Tabs defaultValue="open" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="open" className="relative">
          Open
          {openIssues.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              {openIssues.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="in_progress">
          In Progress
          {inProgressIssues.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {inProgressIssues.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="resolved">
          Resolved
          {resolvedIssues.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {resolvedIssues.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="open" className="space-y-4">
        {renderIssuesList(openIssues)}
      </TabsContent>

      <TabsContent value="in_progress" className="space-y-4">
        {renderIssuesList(inProgressIssues)}
      </TabsContent>

      <TabsContent value="resolved" className="space-y-4">
        {renderIssuesList(resolvedIssues)}
      </TabsContent>
    </Tabs>
  )
}
