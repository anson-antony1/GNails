/**
 * Server-side environment variable configuration
 * This module validates and exports typed environment variables
 * 
 * IMPORTANT: This file should ONLY be imported in server-side code
 * (API routes, Server Components, server actions)
 */

import 'server-only'

/**
 * Validates and retrieves a required environment variable
 * Throws an error if the variable is not set
 */
function getRequiredEnvVar(key: string): string {
  const value = process.env[key]
  
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please add it to your .env.local file.\n` +
      `See .env.example for required variables.`
    )
  }
  
  return value
}

/**
 * Validates and retrieves an optional environment variable with a default value
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

// Database configuration
export const DATABASE_URL = getRequiredEnvVar('DATABASE_URL')
export const DIRECT_DATABASE_URL = getRequiredEnvVar('DIRECT_DATABASE_URL')

// Twilio SMS configuration
export const TWILIO_ACCOUNT_SID = getRequiredEnvVar('TWILIO_ACCOUNT_SID')
export const TWILIO_AUTH_TOKEN = getRequiredEnvVar('TWILIO_AUTH_TOKEN')
export const TWILIO_FROM_NUMBER = getRequiredEnvVar('TWILIO_FROM_NUMBER')

// Cloudflare AI Worker configuration
export const CLOUDFLARE_AI_WORKER_URL = getRequiredEnvVar('CLOUDFLARE_AI_WORKER_URL')

// App configuration
export const NEXT_PUBLIC_APP_URL = getOptionalEnvVar(
  'NEXT_PUBLIC_APP_URL',
  'http://localhost:3000'
)

// Authentication configuration
export const ADMIN_PASSWORD = getRequiredEnvVar('ADMIN_PASSWORD')
export const FRONTDESK_PIN = getRequiredEnvVar('FRONTDESK_PIN')
export const AUTH_SECRET = getRequiredEnvVar('AUTH_SECRET')

/**
 * Typed environment configuration object
 * All server-side environment variables in one place
 */
export const env = {
  // Database
  database: {
    url: DATABASE_URL,
    directUrl: DIRECT_DATABASE_URL,
  },
  
  // Twilio SMS
  twilio: {
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
    fromNumber: TWILIO_FROM_NUMBER,
  },
  
  // External services
  cloudflare: {
    aiWorkerUrl: CLOUDFLARE_AI_WORKER_URL,
  },
  
  // App
  app: {
    url: NEXT_PUBLIC_APP_URL,
  },
  
  // Authentication
  auth: {
    adminPassword: ADMIN_PASSWORD,
    frontdeskPin: FRONTDESK_PIN,
    secret: AUTH_SECRET,
  },
} as const

// Type export for use in other files
export type Env = typeof env
