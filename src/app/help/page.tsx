import { redirect } from 'next/navigation'
import { isOwner } from '@/lib/auth'
import { Metadata } from 'next'
import { HelpClient } from './help-client'

export const metadata: Metadata = {
  title: 'Help & About | G Nail Growth',
  description: 'Quick reference guide and system information',
}

/**
 * Help page - owner only
 * Quick reference for key concepts and links to detailed guides
 */
export default async function HelpPage() {
  const ownerAuthenticated = await isOwner()

  if (!ownerAuthenticated) {
    redirect('/login/owner')
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">Help & About</h1>
        <p className="text-slate-400">
          Quick reference guide for G Nail Growth system
        </p>
      </div>

      <HelpClient />
    </div>
  )
}
