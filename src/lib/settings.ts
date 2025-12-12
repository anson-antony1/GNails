/**
 * Settings management for G Nail Growth
 * 
 * Provides centralized configuration for business rules that the salon owner
 * can customize through the UI instead of hardcoding values.
 * 
 * ⚠️ WARNING: BusinessSettings controls automation behavior globally.
 * Changes here affect:
 * - When feedback SMS are sent (feedbackDelayMinutes)
 * - What ratings create Issues (lowRatingThreshold)
 * - Which customers get review links (promoterThreshold)
 * - Winback campaign eligibility (winbackInactiveDays, winbackCooldownDays)
 * - ROI calculations (averageTicketPrice)
 * 
 * These settings are intentionally approximate for business impact estimation,
 * not exact accounting. Test changes carefully before deploying to production.
 */

import { prisma } from './prisma'

/**
 * Business rules that control how the system behaves
 */
export type BusinessSettings = {
  // Feedback collection settings
  feedbackDelayMinutes: number // How long to wait after checkout before sending feedback SMS
  lowRatingThreshold: number   // Ratings at or below this are considered "issues" (e.g., 6)
  promoterThreshold: number    // Ratings at or above this are promoters who get review links (e.g., 9)
  
  // Winback campaign settings
  winbackInactiveDays: number  // Days since last visit before customer is considered inactive (e.g., 60)
  winbackCooldownDays: number  // Days to wait between winback messages to the same customer (e.g., 30)
  
  // Review link settings
  googleReviewUrl: string      // Google Business review link
  yelpReviewUrl: string        // Yelp review link
  
  // Business info for estimates
  averageTicketPrice: number   // Default average ticket price for ROI calculations (can be overridden by actual data)
}

/**
 * Default settings - used when no custom settings exist yet
 */
export const DEFAULT_SETTINGS: BusinessSettings = {
  feedbackDelayMinutes: 30,
  lowRatingThreshold: 6,
  promoterThreshold: 9,
  winbackInactiveDays: 60,
  winbackCooldownDays: 30,
  googleReviewUrl: 'https://g.page/r/YOUR_GOOGLE_PLACE_ID/review',
  yelpReviewUrl: 'https://www.yelp.com/writeareview/biz/YOUR_YELP_BIZ_ID',
  averageTicketPrice: 50,
}

const SETTINGS_KEY = 'business_rules'

/**
 * Get current business settings from database
 * Returns defaults if not yet configured
 */
export async function getSettings(): Promise<BusinessSettings> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: SETTINGS_KEY },
    })

    if (!setting || !setting.value) {
      return DEFAULT_SETTINGS
    }

    // Validate that the stored value is an object
    if (typeof setting.value !== 'object' || setting.value === null || Array.isArray(setting.value)) {
      console.warn('[Settings] Stored settings value is malformed, falling back to defaults:', setting.value)
      return DEFAULT_SETTINGS
    }

    // Merge with defaults to handle new settings added over time
    // This ensures all required fields exist even if DB is missing some
    return {
      ...DEFAULT_SETTINGS,
      ...(setting.value as Record<string, unknown>),
    } as BusinessSettings
  } catch (error) {
    console.error('[Settings] Failed to load settings, using defaults:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Update business settings in database
 * Validates that required fields are present
 */
export async function updateSettings(newSettings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  // Load current settings first
  const currentSettings = await getSettings()

  // Merge with current settings
  const updatedSettings: BusinessSettings = {
    ...currentSettings,
    ...newSettings,
  }

  // Basic validation
  if (updatedSettings.feedbackDelayMinutes < 0) {
    throw new Error('Feedback delay must be non-negative')
  }
  if (updatedSettings.lowRatingThreshold < 0 || updatedSettings.lowRatingThreshold > 10) {
    throw new Error('Low rating threshold must be between 0 and 10')
  }
  if (updatedSettings.promoterThreshold < 0 || updatedSettings.promoterThreshold > 10) {
    throw new Error('Promoter threshold must be between 0 and 10')
  }
  if (updatedSettings.winbackInactiveDays < 1) {
    throw new Error('Winback inactive days must be at least 1')
  }
  if (updatedSettings.averageTicketPrice < 0) {
    throw new Error('Average ticket price must be non-negative')
  }

  // Save to database
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      value: updatedSettings,
    },
    update: {
      value: updatedSettings,
    },
  })

  return updatedSettings
}
