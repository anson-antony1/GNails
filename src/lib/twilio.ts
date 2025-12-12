/**
 * Twilio SMS utility module for G Nail Growth
 * Sends feedback requests and winback messages via SMS
 */

import twilio from 'twilio'
import { env } from './env'

// Initialize Twilio client with validated environment variables
const client = twilio(env.twilio.accountSid, env.twilio.authToken)

/**
 * Send an SMS message via Twilio
 * 
 * @param to - Recipient phone number (E.164 format, e.g., +19132600313)
 * @param body - Message text content
 * @returns Object with success status and message SID or error
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    // Validate phone number format (basic check for E.164)
    if (!to.match(/^\+\d{10,15}$/)) {
      return {
        success: false,
        error: `Invalid phone number format: ${to}. Must be E.164 format (e.g., +19132600313)`
      }
    }

    // Send message via Twilio
    const message = await client.messages.create({
      body,
      from: env.twilio.fromNumber,
      to,
    })

    console.log(`[Twilio] SMS sent successfully to ${to}, SID: ${message.sid}`)

    return {
      success: true,
      messageSid: message.sid,
    }
  } catch (error) {
    console.error(`[Twilio] Failed to send SMS to ${to}:`, error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending SMS'
    }
  }
}

/**
 * Send a feedback request SMS to a customer
 * 
 * @param customerPhone - Customer's phone number in E.164 format
 * @param customerName - Customer's first name (optional, for personalization)
 * @param feedbackUrl - Full URL to the feedback form
 * @returns Object with success status and message SID or error
 */
export async function sendFeedbackRequestSMS(
  customerPhone: string,
  customerName: string | null,
  feedbackUrl: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const greeting = customerName ? `Hi ${customerName}` : 'Hi'
  
  const message = `${greeting}! Thank you for visiting G Nail Pines. We'd love to hear about your experience today. Please take a moment to share your feedback: ${feedbackUrl}`

  return sendSMS(customerPhone, message)
}

/**
 * Send a winback message to an inactive customer
 * 
 * @param customerPhone - Customer's phone number in E.164 format
 * @param customerName - Customer's first name (optional, for personalization)
 * @param bookingUrl - URL to book an appointment (optional)
 * @returns Object with success status and message SID or error
 */
export async function sendWinbackSMS(
  customerPhone: string,
  customerName: string | null,
  bookingUrl?: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const greeting = customerName ? `Hi ${customerName}` : 'Hi there'
  
  let message = `${greeting}! We miss seeing you at G Nail Pines. It's been a while since your last visit. We'd love to have you back!`
  
  if (bookingUrl) {
    message += ` Book your next appointment: ${bookingUrl}`
  } else {
    message += ` Reply to this message or call us to schedule your next visit.`
  }

  return sendSMS(customerPhone, message)
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
