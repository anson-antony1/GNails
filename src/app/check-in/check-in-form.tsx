'use client'

import { useState } from 'react'

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
}

export function CheckInForm({ services }: Props) {
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<CustomerInfo | null>(null)
  const [customerNotFound, setCustomerNotFound] = useState(false)
  const [searching, setSearching] = useState(false)

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

  const handleSearchCustomer = async () => {
    if (!phone) return

    setSearching(true)
    setError(null)
    setCustomer(null)
    setCustomerNotFound(false)

    try {
      const response = await fetch(`/api/customers/search?phone=${encodeURIComponent(phone)}`)
      const data = await response.json()

      if (data.found) {
        setCustomer(data.customer)
        setName(data.customer.name || '')
        setEmail(data.customer.email || '')
      } else {
        setCustomerNotFound(true)
      }
    } catch {
      setError('Failed to search for customer')
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      // Reset form
      setPhone('')
      setCustomer(null)
      setCustomerNotFound(false)
      setName('')
      setEmail('')
      setServiceId('')
      setStaffName('')
      setPriceCharged('')
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
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Check-in Complete!
          </h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">
              {success.customer.name || success.customer.phone}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{success.visit.service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium">${success.visit.priceCharged}</span>
          </div>
          {success.visit.staffName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Staff:</span>
              <span className="font-medium">{success.visit.staffName}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setSuccess(null)}
          className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Check in Another Customer
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Customer Lookup Section */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          1. Find or Create Customer
        </h2>

        <div className="flex gap-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSearchCustomer}
            disabled={searching || !phone}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {searching ? 'Searching...' : 'Find Customer'}
          </button>
        </div>

        {customer && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="font-medium text-green-900">Customer Found!</p>
            <p className="text-sm text-green-700">
              {customer.name || 'No name on file'} • {customer.phone}
            </p>
            {customer.lastVisit && (
              <p className="text-sm text-green-600 mt-1">
                Last visit:{' '}
                {new Date(customer.lastVisit.appointmentTime).toLocaleDateString()} -{' '}
                {customer.lastVisit.service.name}
              </p>
            )}
          </div>
        )}

        {customerNotFound && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="font-medium text-yellow-900">Customer Not Found</p>
            <p className="text-sm text-yellow-700">
              New customer will be created. Add their information below.
            </p>
          </div>
        )}
      </div>

      {/* Visit Form Section */}
      {(customer || customerNotFound) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            2. Visit Details
          </h2>

          {customerNotFound && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service *
            </label>
            <select
              value={serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.basePrice} ({service.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Name (Optional)
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Enter staff name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Charged ($) *
            </label>
            <input
              type="number"
              value={priceCharged}
              onChange={(e) => setPriceCharged(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {submitting ? 'Processing...' : 'Complete Check-in & Checkout'}
          </button>
        </form>
      )}
    </div>
  )
}
