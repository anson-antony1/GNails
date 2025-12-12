'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, UserCheck, UserPlus } from 'lucide-react'

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

type Props = {
  services: Service[]
  onSuccess?: () => void | Promise<void>
}

export function CheckInForm({ services, onSuccess }: Props) {
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<CustomerInfo | null>(null)
  const [isReturningClient, setIsReturningClient] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [staffName, setStaffName] = useState('')
  const [priceCharged, setPriceCharged] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{
    customer: { name: string | null; phone: string }
    visit: { service: { name: string }; priceCharged: number; staffName: string | null }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refs for auto-focus
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const serviceSelectRef = useRef<HTMLSelectElement>(null)
  const priceInputRef = useRef<HTMLInputElement>(null)

  // Auto-lookup customer when phone number reaches valid length
  useEffect(() => {
    const digits = phone.replace(/\D/g, '')
    
    // Only lookup when we have 10+ digits
    if (digits.length >= 10) {
      const timeoutId = setTimeout(() => {
        lookupCustomer(phone)
      }, 500) // Debounce 500ms

      return () => clearTimeout(timeoutId)
    } else {
      // Reset customer state if phone is too short
      setCustomer(null)
      setIsReturningClient(false)
      setName('')
      setEmail('')
    }
  }, [phone])

  // Auto-focus phone input on mount
  useEffect(() => {
    phoneInputRef.current?.focus()
  }, [])

  const lookupCustomer = async (phoneNumber: string) => {
    setLookingUp(true)
    setError(null)
    setCustomer(null)
    setIsReturningClient(false)

    try {
      const response = await fetch(`/api/customers/search?phone=${encodeURIComponent(phoneNumber)}`)
      const data = await response.json()

      // Handle new API response format
      if (data.customer && !data.multiple) {
        // Single match found
        setCustomer(data.customer)
        setIsReturningClient(true)
        setName(data.customer.name || '')
        setEmail(data.customer.email || '')
        // Auto-focus service field after finding customer
        setTimeout(() => serviceSelectRef.current?.focus(), 100)
      } else if (data.multiple && data.customers && data.customers.length > 0) {
        // Multiple matches - use the first one (most recent visit)
        const firstCustomer = data.customers[0]
        setCustomer(firstCustomer)
        setIsReturningClient(true)
        setName(firstCustomer.name || '')
        setEmail(firstCustomer.email || '')
        setTimeout(() => serviceSelectRef.current?.focus(), 100)
      }
      // If data.customers is empty array, customer remains null (new customer)
    } catch {
      // Silent fail - just don't show customer info
    } finally {
      setLookingUp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!phone || !serviceId || !priceCharged) {
      setError('Phone, service, and price are required')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name || null,
          email: email || null,
          serviceId,
          staffName: staffName || null,
          priceCharged,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process check-in')
      }

      setSuccess(data)
      
      // Call success callback to refresh recent visits
      if (onSuccess) {
        await onSuccess()
      }
      
      // Reset form
      setPhone('')
      setCustomer(null)
      setIsReturningClient(false)
      setName('')
      setEmail('')
      setServiceId('')
      setStaffName('')
      setPriceCharged('')
      // Focus back to phone input for next customer
      setTimeout(() => phoneInputRef.current?.focus(), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleServiceChange = (selectedServiceId: string) => {
    setServiceId(selectedServiceId)
    const service = services.find((s) => s.id === selectedServiceId)
    if (service) {
      setPriceCharged(service.basePrice.toString())
      // Auto-focus price after selecting service
      setTimeout(() => priceInputRef.current?.focus(), 100)
    }
  }

  const resetForm = () => {
    setSuccess(null)
    setPhone('')
    setCustomer(null)
    setIsReturningClient(false)
    setName('')
    setEmail('')
    setServiceId('')
    setStaffName('')
    setPriceCharged('')
    setError(null)
    setTimeout(() => phoneInputRef.current?.focus(), 100)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl">Check-in Complete!</CardTitle>
            <CardDescription>
              Customer is checked in and will receive feedback request via SMS within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Customer:</span>
                <span className="font-medium text-slate-200">
                  {success.customer.name || success.customer.phone}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Service:</span>
                <span className="font-medium text-slate-200">{success.visit.service.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Price:</span>
                <span className="font-medium text-gn-gold">
                  ${success.visit.priceCharged}
                </span>
              </div>
              {success.visit.staffName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Staff:</span>
                  <span className="font-medium text-slate-200">{success.visit.staffName}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={resetForm} 
              className="w-full mt-6"
              autoFocus
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Next Customer (Enter)
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Quick Check-in</CardTitle>
          <CardDescription>
            Phone → Service → Price → Enter. That&apos;s it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input - Always visible */}
            <div>
              <Label htmlFor="phone">Customer Phone *</Label>
              <Input
                ref={phoneInputRef}
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="555-123-4567 or 5551234567"
                className="mt-1.5"
                autoComplete="tel"
                required
              />
              {lookingUp && (
                <p className="text-xs text-slate-500 mt-1.5 animate-pulse">
                  Looking up customer...
                </p>
              )}
            </div>

            {/* Customer Status Badge */}
            {isReturningClient && customer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-emerald-400 text-sm">Returning Client</p>
                    <p className="text-sm text-slate-300 mt-1">
                      {customer.name || 'No name on file'}
                    </p>
                    {customer.lastVisit && (
                      <p className="text-xs text-slate-400 mt-1">
                        Last visit: {new Date(customer.lastVisit.appointmentTime).toLocaleDateString()} –{' '}
                        {customer.lastVisit.service.name}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {phone && phone.replace(/\D/g, '').length >= 10 && !isReturningClient && !lookingUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
              >
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-400 text-sm">New Customer</p>
                    <p className="text-xs text-slate-400 mt-1">
                      We&apos;ll create their profile. Add name below if available.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Visit Details - Show after phone is entered */}
            {phone && phone.replace(/\D/g, '').length >= 10 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6 pt-6 border-t border-white/10"
              >
                {/* Optional: Name (only for new customers) */}
                {!isReturningClient && (
                  <div>
                    <Label htmlFor="name">Customer Name (optional)</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Leave blank if unknown"
                      className="mt-1.5"
                      autoComplete="name"
                    />
                  </div>
                )}

                {/* Required: Service */}
                <div>
                  <Label htmlFor="service">Service *</Label>
                  <select
                    ref={serviceSelectRef}
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
                </div>

                {/* Required: Price */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="price">Price Charged ($) *</Label>
                    <Input
                      ref={priceInputRef}
                      id="price"
                      type="number"
                      value={priceCharged}
                      onChange={(e) => setPriceCharged(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="1"
                      required
                      className="mt-1.5"
                      autoComplete="off"
                    />
                  </div>

                  {/* Optional: Staff */}
                  <div>
                    <Label htmlFor="staff">Staff Name (optional)</Label>
                    <Input
                      id="staff"
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="Leave blank if unknown"
                      className="mt-1.5"
                      autoComplete="off"
                    />
                  </div>
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

                {/* Submit Button */}
                <div className="pt-4 border-t border-white/10">
                  <Button 
                    type="submit" 
                    disabled={submitting || !phone || !serviceId || !priceCharged} 
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? 'Processing...' : 'Complete Check-in (Enter ⏎)'}
                  </Button>
                  <p className="text-xs text-slate-500 mt-3 text-center">
                    Customer gets feedback SMS in ~1 hour
                  </p>
                </div>
              </motion.div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
