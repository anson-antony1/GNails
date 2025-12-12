'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { Save, Settings as SettingsIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { BusinessSettings } from '@/lib/settings'

export function SettingsClient() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to load settings')
      }
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load settings' })
      console.error('Load settings error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings'
      setMessage({ type: 'error', text: errorMessage })
      console.error('Save settings error:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gn-gold)]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-2">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-red-400">Failed to load settings</p>
            <Button onClick={loadSettings} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="text-sm">{message.text}</p>
        </motion.div>
      )}

      {/* Feedback Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[var(--gn-gold)]" />
              Feedback Collection
            </CardTitle>
            <CardDescription>
              Control when and how feedback requests are sent to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="feedbackDelay">
                Feedback Delay (minutes)
              </Label>
              <Input
                id="feedbackDelay"
                type="number"
                min="0"
                value={settings.feedbackDelayMinutes}
                onChange={(e) => updateSetting('feedbackDelayMinutes', parseInt(e.target.value) || 0)}
                className="max-w-xs"
              />
              <p className="text-xs text-slate-500">
                How long to wait after checkout before sending feedback SMS
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lowRating">
                Low Rating Threshold (0-10)
              </Label>
              <Input
                id="lowRating"
                type="number"
                min="0"
                max="10"
                value={settings.lowRatingThreshold}
                onChange={(e) => updateSetting('lowRatingThreshold', parseInt(e.target.value) || 0)}
                className="max-w-xs"
              />
              <p className="text-xs text-slate-500">
                Ratings at or below this create an issue for follow-up (e.g., 6 or lower)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="promoter">
                Promoter Threshold (0-10)
              </Label>
              <Input
                id="promoter"
                type="number"
                min="0"
                max="10"
                value={settings.promoterThreshold}
                onChange={(e) => updateSetting('promoterThreshold', parseInt(e.target.value) || 0)}
                className="max-w-xs"
              />
              <p className="text-xs text-slate-500">
                Ratings at or above this get review links (e.g., 9-10 are promoters)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Winback Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-purple-400" />
              Winback Campaigns
            </CardTitle>
            <CardDescription>
              Control when customers are considered inactive and eligible for winback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="inactiveDays">
                Inactive After (days)
              </Label>
              <Input
                id="inactiveDays"
                type="number"
                min="1"
                value={settings.winbackInactiveDays}
                onChange={(e) => updateSetting('winbackInactiveDays', parseInt(e.target.value) || 1)}
                className="max-w-xs"
              />
              <p className="text-xs text-slate-500">
                Days since last visit before customer is considered inactive (e.g., 60)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cooldown">
                Cooldown Period (days)
              </Label>
              <Input
                id="cooldown"
                type="number"
                min="1"
                value={settings.winbackCooldownDays}
                onChange={(e) => updateSetting('winbackCooldownDays', parseInt(e.target.value) || 1)}
                className="max-w-xs"
              />
              <p className="text-xs text-slate-500">
                Days to wait between winback messages to the same customer
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Review Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-amber-400" />
              Review Links
            </CardTitle>
            <CardDescription>
              URLs where promoters can leave Google and Yelp reviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="googleUrl">
                Google Review URL
              </Label>
              <Input
                id="googleUrl"
                type="url"
                value={settings.googleReviewUrl}
                onChange={(e) => updateSetting('googleReviewUrl', e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Find at: Google Business Profile → Get more reviews
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="yelpUrl">
                Yelp Review URL
              </Label>
              <Input
                id="yelpUrl"
                type="url"
                value={settings.yelpReviewUrl}
                onChange={(e) => updateSetting('yelpReviewUrl', e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Find at: Yelp Business Page → Ask for reviews
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Business Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-emerald-400" />
              Business Metrics
            </CardTitle>
            <CardDescription>
              Default values for ROI calculations (overridden by actual data when available)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="avgTicket">
                Average Ticket Price ($)
              </Label>
              <Input
                id="avgTicket"
                type="number"
                min="0"
                step="0.01"
                value={settings.averageTicketPrice}
                onChange={(e) => updateSetting('averageTicketPrice', parseFloat(e.target.value) || 0)}
                className="max-w-xs"
              />
              <p className="text-xs text-slate-500">
                Fallback average ticket for winback revenue estimates
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Rules Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-base">Current Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <p>
              <span className="text-slate-400">Feedback:</span> Sent{' '}
              <span className="text-[var(--gn-gold)] font-medium">{settings.feedbackDelayMinutes} minutes</span>{' '}
              after checkout. Ratings at or below{' '}
              <span className="text-[var(--gn-gold)] font-medium">{settings.lowRatingThreshold}</span>{' '}
              create Issues.
            </p>
            <p>
              <span className="text-slate-400">Reviews:</span> Customers rating{' '}
              <span className="text-amber-400 font-medium">{settings.promoterThreshold}+</span>{' '}
              are promoters who get review links.
            </p>
            <p>
              <span className="text-slate-400">Winbacks:</span> Target clients inactive for{' '}
              <span className="text-purple-400 font-medium">{settings.winbackInactiveDays}+ days</span>, with{' '}
              <span className="text-purple-400 font-medium">{settings.winbackCooldownDays} day</span>{' '}
              cooldown between messages.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data & Reliability Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-slate-800/50 bg-slate-900/30">
          <CardHeader>
            <CardTitle className="text-lg">Data & Reliability</CardTitle>
            <CardDescription>
              Information about data storage and system reliability
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-3">
            <p>
              <span className="text-slate-400">Database:</span> Your data is stored in a managed PostgreSQL database with automated daily backups provided by your cloud provider.
            </p>
            <p>
              <span className="text-slate-400">Error Monitoring:</span> We use Sentry to monitor errors across the application. If anything goes wrong, we&apos;re alerted immediately and can fix it quickly.
            </p>
            <p>
              <span className="text-slate-400">Rate Limiting:</span> Critical actions (check-ins, feedback, auth) are rate-limited to prevent spam and accidental overload.
            </p>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">
              All services gracefully degrade in development mode when optional integrations are not configured.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
