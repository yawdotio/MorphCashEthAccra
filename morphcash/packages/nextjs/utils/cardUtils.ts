/**
 * Utility functions for virtual card management
 */

/**
 * Generate a random card number in the format ****1234
 * @returns Masked card number
 */
export function generateCardNumber(): string {
  const lastFour = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `****${lastFour}`;
}

/**
 * Generate an expiry date 3 years from now
 * @returns Expiry date in MM/YY format
 */
export function generateExpiryDate(): string {
  const now = new Date();
  const expiryDate = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
  
  const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
  const year = String(expiryDate.getFullYear()).slice(-2);
  
  return `${month}/${year}`;
}

/**
 * Generate a random card type
 * @returns Random card type from available options
 */
export function generateCardType(): string {
  const cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover'];
  return cardTypes[Math.floor(Math.random() * cardTypes.length)];
}

/**
 * Validate if an expiry date is still valid
 * @param expiryDate Expiry date in MM/YY format
 * @returns True if card is still valid, false if expired
 */
export function isCardValid(expiryDate: string): boolean {
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
  const now = new Date();
  
  return expiry > now;
}

/**
 * Get days until expiry
 * @param expiryDate Expiry date in MM/YY format
 * @returns Number of days until expiry (negative if expired)
 */
export function getDaysUntilExpiry(expiryDate: string): number {
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month), 0); // Last day of expiry month
  const now = new Date();
  
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format expiry date for display
 * @param expiryDate Expiry date in MM/YY format
 * @returns Formatted expiry date string
 */
export function formatExpiryDate(expiryDate: string): string {
  const [month, year] = expiryDate.split('/');
  const fullYear = 2000 + parseInt(year);
  return `${month}/${fullYear}`;
}
