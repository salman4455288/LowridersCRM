import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatPKPhoneNumber(phone: string): string {
  if (!phone) return ''
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '')

  // If it starts with 0, remove it
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }

  // If it doesn't have 92 at the start, add it
  if (!cleaned.startsWith('92')) {
    cleaned = '92' + cleaned
  }

  return '+' + cleaned
}
