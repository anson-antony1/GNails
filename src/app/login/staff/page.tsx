'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { KeyRound, Loader2 } from 'lucide-react'

export default function StaffLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Redirect to check-in on success
      router.push('/check-in')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setPin('') // Clear PIN on error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-white/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto mb-4 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Staff Login</CardTitle>
            <CardDescription>
              Enter your PIN to access the check-in console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your PIN"
                  required
                  autoFocus
                  className="mt-1.5 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-slate-500 mt-1.5 text-center">
                  Ask your manager if you don&apos;t have a PIN
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !pin || pin.length < 4}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-2">Are you the owner?</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/login/owner')}
                >
                  Owner Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-slate-400"
          >
            ← Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
