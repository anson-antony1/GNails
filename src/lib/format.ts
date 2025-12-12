/**
 * Formatting utilities for G Nail Growth
 * Currency, dates, phone numbers, etc.
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string (e.g., "$1,234")
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  // Handle edge cases
  if (amount == null || isNaN(amount)) {
    return '$0'
  }

  try {
    // Use Intl.NumberFormat for proper localization
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch (error) {
    // Fallback to simple formatting
    console.warn('Currency formatting failed, using fallback:', error)
    return `$${Math.round(amount).toLocaleString()}`
  }
}

/**
 * Format a phone number for display
 * @param phone - Raw phone number string
 * @returns Formatted phone number (e.g., "(555) 123-4567")
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  // Return as-is if format is unrecognized
  return phone
}

/**
 * Format a number with compact notation (e.g., 1.2K, 3.4M)
 * @param value - The number to format
 * @returns Compact formatted string
 */
export function formatCompact(value: number): string {
  if (value == null || isNaN(value)) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
}
