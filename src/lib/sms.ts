/**
 * Twilio SMS utility module for G Nail Growth
 * Server-side only - handles sending feedback requests and winback messages
 */

import 'server-only'
import twilio from 'twilio'
import { env } from './env'

// Initialize Twilio client with validated environment variables
const client = twilio(env.twilio.accountSid, env.twilio.authToken)
console.log('[sms] Twilio client initialized')

/**
 * Options for sending a feedback request SMS
 */
interface SendFeedbackRequestSMSOptions {
  to: string
  customerName?: string
  feedbackUrl: string
  salonName?: string
}

/**
 * Options for sending a winback SMS
 */
interface SendWinbackSMSOptions {
  to: string
  customerName?: string
  daysSinceLastVisit: number
  bookingUrl?: string
  salonName?: string
  offerText?: string
}

/**
 * Send a feedback request SMS to a customer after their visit
 * 
 * @param options - Feedback request options
 * @returns Twilio message SID
 * @throws Error if SMS fails to send
 */
export async function sendFeedbackRequestSMS(
  options: SendFeedbackRequestSMSOptions
): Promise<string> {
  const {
    to,
    customerName,
    feedbackUrl,
    salonName = 'G Nail Pines',
  } = options

  const greeting = customerName ? `Hi ${customerName}` : 'Hi there'
  
  const body = `${greeting}! This is ${salonName}. Thanks for visiting today 💅 We'd love a quick 1–10 rating about your visit: ${feedbackUrl}`

  console.log(`[sms] sending feedback sms to ${to}`)

  try {
    const message = await client.messages.create({
      body,
      from: env.twilio.fromNumber,
      to,
    })

    console.log(`[sms] sent sms to ${to}, sid=${message.sid}`)
    
    return message.sid
  } catch (error) {
    console.error(`[SMS] Failed to send feedback request to ${to}:`, error)
    throw new Error(
      `Failed to send feedback SMS to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Send a winback message to an inactive customer
 * 
 * @param options - Winback message options
 * @returns Twilio message SID
 * @throws Error if SMS fails to send
 */
export async function sendWinbackSMS(
  options: SendWinbackSMSOptions
): Promise<string> {
  const {
    to,
    customerName,
    daysSinceLastVisit,
    bookingUrl,
    salonName = 'G Nail Pines',
    offerText,
  } = options

  const greeting = customerName ? `Hi ${customerName}` : 'Hi there'
  
  let body = `${greeting}, we miss you at ${salonName}! It's been about ${daysSinceLastVisit} days since your last visit.`
  
  if (bookingUrl) {
    body += ` Reply or tap ${bookingUrl} to book your next appointment.`
  } else {
    body += ` Reply to book your next appointment.`
  }
  
  if (offerText) {
    body += ` ${offerText}`
  }

  console.log(`[sms] sending winback sms to ${to}`)

  try {
    const message = await client.messages.create({
      body,
      from: env.twilio.fromNumber,
      to,
    })

    console.log(`[sms] sent sms to ${to}, sid=${message.sid}`)
    
    return message.sid
  } catch (error) {
    console.error(`[SMS] Failed to send winback message to ${to}:`, error)
    throw new Error(
      `Failed to send winback SMS to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Format phone number to E.164 format
 * Handles common US phone number formats
 * 
 * @param phone - Phone number in various formats
 * @returns Phone number in E.164 format (+1XXXXXXXXXX)
 */
export function formatPhoneE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If it's 10 digits, assume US and prepend +1
  if (digits.length === 10) {
    return `+1${digits}`
  }
  
  // If it's 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  // If it already starts with +, return as is
  if (phone.startsWith('+')) {
    return phone
  }
  
  // Otherwise, prepend + (assume it's already country code + number)
  return `+${digits}`
}
