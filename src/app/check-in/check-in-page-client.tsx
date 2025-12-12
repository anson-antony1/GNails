'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, UserCheck, Users, AlertCircle, Loader2 } from 'lucide-react'
import type { RecentVisit } from '@/lib/visits'

type Service = {
  id: string
  name: string
  category: string
  basePrice: number
  durationMinutes: number
  isActive: boolean
}

type CustomerInfo = {
  id: string
  name: string | null
  phone: string
  email: string | null
  lastVisit: {
    appointmentTime: Date
    service: {
      name: string
    }
  } | null
}

type LookupStatus = 'idle' | 'searching' | 'found' | 'not_found' | 'multiple'

type Props = {
  services: Service[]
  initialRecentVisits: RecentVisit[]
  authorized: boolean
}

export function CheckInPageClient({ services, initialRecentVisits, authorized }: Props) {
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>(initialRecentVisits)
  
  // PIN gate state
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [isSubmittingPin, setIsSubmittingPin] = useState(false)
  
  // Form state
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [staff, setStaff] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [price, setPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Field validation errors
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  
  // Lookup state
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle')
  const [matchedCustomer, setMatchedCustomer] = useState<CustomerInfo | null>(null)
  const [multipleMatches, setMultipleMatches] = useState<CustomerInfo[]>([])
  
  // Refs
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const lookupTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Perform customer lookup
  const performLookup = useCallback(async (phoneNumber: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[check-in] searching customer by phone', phoneNumber)
    }
    
    try {
      const response = await fetch(`/api/customers/search?phone=${encodeURIComponent(phoneNumber)}`)
      const data = await response.json()

      if (data.customer && !data.multiple) {
        // Single match
        if (process.env.NODE_ENV === 'development') {
          console.log('[check-in] matched customer', data.customer.id)
        }
        
        setMatchedCustomer(data.customer)
        setName(data.customer.name || '')
        setEmail(data.customer.email || '')
        setLookupStatus('found')
        setMultipleMatches([])
      } else if (data.multiple && data.customers && data.customers.length > 0) {
        // Multiple matches
        setMultipleMatches(data.customers)
        setLookupStatus('multiple')
        setMatchedCustomer(null)
      } else {
        // No matches
        setLookupStatus('not_found')
        setMatchedCustomer(null)
        setMultipleMatches([])
      }
    } catch (error) {
      console.error('Lookup failed:', error)
      setLookupStatus('idle')
    }
  }, [])

  // Debounced phone lookup
  useEffect(() => {
    const digits = phone.replace(/\D/g, '')
    
    if (digits.length >= 7) {
      setLookupStatus('searching')
      
      // Clear existing timeout
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current)
      }
      
      // Set new timeout
      lookupTimeoutRef.current = setTimeout(() => {
        performLookup(phone)
      }, 500) // 500ms debounce
    } else {
      // Reset lookup state if phone is too short
      setLookupStatus('idle')
      setMatchedCustomer(null)
      setMultipleMatches([])
      
      // Clear timeout if exists
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current)
      }
    }

    return () => {
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current)
      }
    }
  }, [phone, performLookup])

  // Handle phone change and clear error
  const handlePhoneChange = (value: string) => {
    setPhone(value)
    if (phoneError) setPhoneError(null)
  }

  // Handle phone blur to trigger lookup if not already done
  const handlePhoneBlur = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 7 && lookupStatus === 'idle') {
      setLookupStatus('searching')
      performLookup(phone)
    }
  }

  // Handle selecting a customer from multiple matches
  const handleSelectCustomer = (customer: CustomerInfo) => {
    setMatchedCustomer(customer)
    setName(customer.name || '')
    setEmail(customer.email || '')
    setLookupStatus('found')
    setMultipleMatches([])
  }

  // Handle service change and auto-fill price
  const handleServiceChange = (selectedServiceId: string) => {
    setServiceId(selectedServiceId)
    if (serviceError) setServiceError(null)
    const service = services.find((s) => s.id === selectedServiceId)
    if (service) {
      setPrice(service.basePrice.toString())
    }
  }

  // Handle price change and clear error
  const handlePriceChange = (value: string) => {
    setPrice(value)
    if (priceError) setPriceError(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous field errors
    setPhoneError(null)
    setServiceError(null)
    setPriceError(null)
    setError(null)
    
    // Validate required fields
    let hasError = false
    
    // Validate phone (at least 7 digits)
    const phoneDigits = phone.replace(/\D/g, '')
    if (!phone || phoneDigits.length < 7) {
      setPhoneError('Phone must contain at least 7 digits')
      hasError = true
    }
    
    // Validate service selected
    if (!serviceId) {
      setServiceError('Please select a service')
      hasError = true
    }
    
    // Validate price (must be positive number)
    const priceNum = parseFloat(price)
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      setPriceError('Price must be a positive number')
      hasError = true
    }
    
    if (hasError) {
      return
    }

    setIsSubmitting(true)

    try {
      // Normalize phone: strip spaces, dashes, parentheses
      const normalizedPhone = phone.replace(/[\s\-()]/g, '')
      
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          name: name || null,
          email: email || null,
          serviceId,
          staffName: staff || null,
          priceCharged: priceNum,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process check-in')
      }

      // Success!
      if (process.env.NODE_ENV === 'development') {
        console.log('[check-in] created visit', data.visit?.id || data)
      }
      
      setSubmitSuccess(true)
      
      // Add new visit to top of recentVisits immediately
      if (data.visit) {
        const newVisit: RecentVisit = {
          id: data.visit.id,
          appointmentTime: new Date(data.visit.appointmentTime),
          checkoutTime: data.visit.checkoutTime ? new Date(data.visit.checkoutTime) : null,
          customerName: name || 'Walk-in',
          customerPhone: normalizedPhone,
          serviceName: services.find(s => s.id === serviceId)?.name || 'Unknown',
          priceCharged: priceNum,
        }
        setRecentVisits(prev => [newVisit, ...prev.slice(0, 4)])
      } else {
        // Fallback: refresh from API
        await handleCheckInSuccess()
      }
      
      // Reset form after 2 seconds (keep phone for same client multiple services)
      setTimeout(() => {
        setName('')
        setEmail('')
        setStaff('')
        setServiceId('')
        setPrice('')
        setLookupStatus('idle')
        setMatchedCustomer(null)
        setMultipleMatches([])
        setSubmitSuccess(false)
        phoneInputRef.current?.focus()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  // Callback to refresh recent visits
  const handleCheckInSuccess = useCallback(async () => {
    try {
      const response = await fetch('/api/visits/recent?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentVisits(data.visits || [])
      }
    } catch (error) {
      console.error('Failed to refresh recent visits:', error)
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
          Check-in Console
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Front desk enters basic visit info. The system handles feedback and analytics.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Main Form (2/3 width) */}
        <div className="lg:col-span-2">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-50">Check-in Complete!</h3>
                      <p className="text-sm text-slate-400 mt-2">Resetting form for next customer...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Check-in Console</CardTitle>
                <CardDescription>
                  Enter phone and service, we handle feedback texts, reviews, and issue tracking automatically. Tab through fields, press Enter to submit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Phone Input */}
                  <div>
                    <Label htmlFor="phone">Customer Phone *</Label>
                    <Input
                      ref={phoneInputRef}
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={handlePhoneBlur}
                      placeholder="555-123-4567"
                      className="mt-1.5"
                      autoFocus
                      required
                    />
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-400">{phoneError}</p>
                    )}
                    
                    {/* Lookup Status Indicators */}
                    <AnimatePresence mode="wait">
                      {lookupStatus === 'searching' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 flex items-center gap-2 text-sm text-slate-400"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Looking up customer...</span>
                        </motion.div>
                      )}
                      
                      {lookupStatus === 'found' && matchedCustomer && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                        >
                          <div className="flex items-start gap-2">
                            <UserCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-emerald-400">
                                Returning client: {matchedCustomer.name || 'Name not on file'}
                              </p>
                              {matchedCustomer.lastVisit && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Last visit: {new Date(matchedCustomer.lastVisit.appointmentTime).toLocaleDateString()} – {matchedCustomer.lastVisit.service.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {lookupStatus === 'not_found' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                            <p className="text-sm text-slate-300">
                              No existing client with this phone yet. We&apos;ll create a new record.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      
                      {lookupStatus === 'multiple' && multipleMatches.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                        >
                          <div className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-amber-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-400 mb-2">
                                Multiple matches, pick one:
                              </p>
                              <div className="space-y-2">
                                {multipleMatches.map((customer) => (
                                  <Button
                                    key={customer.id}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-left"
                                    onClick={() => handleSelectCustomer(customer)}
                                  >
                                    <div>
                                      <div className="font-medium">{customer.name || 'No name'}</div>
                                      <div className="text-xs text-slate-400">{customer.phone}</div>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Name & Email Inputs (optional, shown after lookup) */}
                  {lookupStatus !== 'idle' && lookupStatus !== 'searching' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <Label htmlFor="name">Customer Name (optional)</Label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Leave blank if unknown"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Customer Email (optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Leave blank if unknown"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="staff">Staff Name (optional)</Label>
                        <Input
                          id="staff"
                          type="text"
                          value={staff}
                          onChange={(e) => setStaff(e.target.value)}
                          placeholder="Leave blank if unknown"
                          className="mt-1.5"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Service & Price */}
                  {phone.replace(/\D/g, '').length >= 7 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <Label htmlFor="service">Service *</Label>
                        <select
                          id="service"
                          value={serviceId}
                          onChange={(e) => handleServiceChange(e.target.value)}
                          required
                          className="mt-1.5 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-gn-gold focus:border-transparent"
                        >
                          <option value="">Select service...</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name} – ${service.basePrice}
                            </option>
                          ))}
                        </select>
                        {serviceError && (
                          <p className="mt-1 text-sm text-red-400">{serviceError}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="price">Price Charged ($) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={price}
                          onChange={(e) => handlePriceChange(e.target.value)}
                          placeholder="0"
                          min="0"
                          step="1"
                          required
                          className="mt-1.5"
                        />
                        {priceError && (
                          <p className="mt-1 text-sm text-red-400">{priceError}</p>
                        )}
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

                      <div className="pt-4 border-t border-white/10">
                        <Button
                          type="submit"
                          disabled={isSubmitting || !phone || !serviceId || !price}
                          className="w-full"
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Complete Check-in'
                          )}
                        </Button>
                        <div className="mt-3 space-y-1 text-center">
                          <p className="text-xs text-slate-500">
                            Customer gets feedback SMS in ~1 hour
                          </p>
                          <p className="text-xs text-slate-600">
                            💡 Tip: Type phone, hit Tab a few times, and press Enter to complete check-in.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Info Cards (1/3 width) */}
        <div className="space-y-6">
          {/* Recent Check-ins */}
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-gn-gold">✓</span>
                Last 5 Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentVisits.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl text-slate-600">👤</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-1">No visits yet today.</p>
                  <p className="text-xs text-slate-500">Start by checking someone in.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-gn-gold/30 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {visit.customerName || 'New client'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {visit.serviceName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {visit.customerPhone}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gn-gold font-medium">
                            {visit.checkoutTime ? getTimeAgo(visit.checkoutTime) : getTimeAgo(visit.appointmentTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Why This Matters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why this matters</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-gn-gold mt-0.5">•</span>
                  <span>Owner sees repeat-visit rates by service & technician</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Happy clients are nudged to leave 5★ reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gn-rose mt-0.5">•</span>
                  <span>Unhappy clients are handled quietly, not on Yelp</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Today's Snapshot Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Visits recorded</span>
                <span className="text-2xl font-bold text-gn-gold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Feedback sent</span>
                <span className="text-2xl font-bold text-emerald-400">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Issues flagged</span>
                <span className="text-2xl font-bold text-gn-rose">1</span>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  Later, connect this to the live dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  /**
   * Handle PIN submission for front desk authentication
   */
  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmittingPin(true)
    setPinError('')

    try {
      const response = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Reload the page so the server checks the staff cookie and re-renders
        window.location.reload()
      } else {
        setPinError(data.error || 'Invalid PIN')
        setPin('')
      }
    } catch (error) {
      console.error('PIN login error:', error)
      setPinError('Failed to verify PIN. Please try again.')
      setPin('')
    } finally {
      setIsSubmittingPin(false)
    }
  }

  /**
   * If not authorized, show PIN gate instead of check-in form
   */
  if (!authorized) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
            Front Desk Access
          </h1>
          <p className="text-slate-400">
            Enter your PIN to access the check-in console.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              Staff Authentication
            </CardTitle>
            <CardDescription>
              Use the front desk PIN provided by management.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-6 digit PIN"
                  autoFocus
                  disabled={isSubmittingPin}
                />
              </div>

              {pinError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmittingPin || pin.length < 4}
              >
                {isSubmittingPin ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Unlock Console
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-500 text-center">
                Owner? Use the{' '}
                <a
                  href="/login/owner"
                  className="text-gn-gold hover:underline"
                >
                  admin login
                </a>{' '}
                instead.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authorized - show the full check-in form below
}
