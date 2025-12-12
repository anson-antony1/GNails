import { Suspense } from 'react'
import IssueInboxClient from './issue-inbox-client'

export const metadata = {
  title: 'Issue Inbox | G Nail Growth',
  description: 'Manage customer issues and feedback',
}

export default function IssueInboxPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">Customer Issues</h1>
        <p className="text-slate-400 max-w-2xl">
          Low ratings and complaints flagged by AI before they hit public reviews.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gn-gold)]"></div>
        </div>
      }>
        <IssueInboxClient />
      </Suspense>
    </div>
  )
}
