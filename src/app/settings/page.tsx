import { redirect } from 'next/navigation'
import { isOwner } from '@/lib/auth'
import { SettingsClient } from './settings-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | G Nail Growth',
  description: 'Configure business rules and preferences',
}

/**
 * Settings page - owner only
 * Allows customization of business rules like feedback timing, thresholds, etc.
 */
export default async function SettingsPage() {
  const ownerAuthenticated = await isOwner()

  if (!ownerAuthenticated) {
    redirect('/login/owner')
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">Settings</h1>
        <p className="text-slate-400">
          Customize business rules, thresholds, and automation behavior.
        </p>
      </div>

      <SettingsClient />
    </div>
  )
}
