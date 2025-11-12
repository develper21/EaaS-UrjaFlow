import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format number with units
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Format energy (kW to kWh)
 */
export function formatEnergy(kw: number, hours: number = 1): string {
  const kwh = kw * hours;
  return `${formatNumber(kwh, 2)} kWh`;
}

/**
 * Calculate carbon savings (kg CO2)
 * Average: 0.92 lbs CO2 per kWh = 0.417 kg CO2 per kWh
 */
export function calculateCarbonSavings(kwhGenerated: number): number {
  return kwhGenerated * 0.417;
}

/**
 * Calculate monetary savings
 */
export function calculateSavings(kwhGenerated: number, ratePerKwh: number = 0.13): number {
  return kwhGenerated * ratePerKwh;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'text-green-600 bg-green-50',
    INACTIVE: 'text-gray-600 bg-gray-50',
    PENDING: 'text-yellow-600 bg-yellow-50',
    PAID: 'text-green-600 bg-green-50',
    OVERDUE: 'text-red-600 bg-red-50',
    CANCELED: 'text-gray-600 bg-gray-50',
    OPEN: 'text-blue-600 bg-blue-50',
    RESOLVED: 'text-green-600 bg-green-50',
    CLOSED: 'text-gray-600 bg-gray-50',
    ERROR: 'text-red-600 bg-red-50',
    MAINTENANCE: 'text-orange-600 bg-orange-50',
  };
  
  return colors[status] || 'text-gray-600 bg-gray-50';
}
