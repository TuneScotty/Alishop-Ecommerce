// Data formatting utilities for prices, dates, text, and order status display

/**
 * Formats numeric price with currency symbol and proper decimal places
 * @param price - Numeric price value to format
 * @param currency - Currency code (defaults to USD)
 * @returns Formatted price string with currency symbol
 * Purpose: Provides consistent price formatting across the application with internationalization support
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Formats date to readable local string format
 * @param date - Date string or Date object to format
 * @returns Formatted date string in long format
 * Purpose: Provides consistent date formatting for display in UI components
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats date and time to readable local string with hours and minutes
 * @param date - Date string or Date object to format
 * @returns Formatted date and time string
 * Purpose: Provides detailed timestamp formatting for order history and activity logs
 */
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncates text to specified length and adds ellipsis if needed
 * @param text - Text string to truncate
 * @param maxLength - Maximum allowed character length
 * @returns Truncated text with ellipsis or original text if within limit
 * Purpose: Ensures consistent text length in UI components and prevents layout overflow
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Formats order status string with proper capitalization
 * @param status - Raw order status string
 * @returns Formatted status string with title case
 * Purpose: Provides consistent order status display formatting across order management interfaces
 */
export const formatOrderStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}; 