/**
 * Fee Calculation Utilities
 * Handles the 0.02% fee system for virtual card funding
 */

export interface FeeCalculation {
  originalAmount: number;
  feeAmount: number;
  totalAmount: number;
  feePercentage: number;
}

/**
 * Calculate the 0.02% fee for virtual card funding
 * @param amount The amount to fund the virtual card
 * @returns FeeCalculation object with fee details
 */
export const calculateFundingFee = (amount: number): FeeCalculation => {
  const feePercentage = 0.02; // 0.02%
  const feeAmount = (amount * feePercentage) / 100;
  const totalAmount = amount + feeAmount;

  return {
    originalAmount: amount,
    feeAmount: Math.round(feeAmount * 100) / 100, // Round to 2 decimal places
    totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
    feePercentage,
  };
};

/**
 * Calculate the fee for a specific amount with custom percentage
 * @param amount The amount to calculate fee for
 * @param percentage The fee percentage (default: 0.02)
 * @returns FeeCalculation object with fee details
 */
export const calculateFee = (amount: number, percentage: number = 0.02): FeeCalculation => {
  const feeAmount = (amount * percentage) / 100;
  const totalAmount = amount + feeAmount;

  return {
    originalAmount: amount,
    feeAmount: Math.round(feeAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    feePercentage: percentage,
  };
};

/**
 * Format currency amount for display
 * @param amount The amount to format
 * @param currency The currency symbol (default: '₵')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = '₵'): string => {
  return `${currency} ${amount.toFixed(2)}`;
};

/**
 * Validate funding amount
 * @param amount The amount to validate
 * @returns Validation result with error message if invalid
 */
export const validateFundingAmount = (amount: number): { isValid: boolean; error?: string } => {
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (amount < 1) {
    return { isValid: false, error: 'Minimum funding amount is ₵1.00' };
  }
  
  if (amount > 100000) {
    return { isValid: false, error: 'Maximum funding amount is ₵100,000.00' };
  }
  
  return { isValid: true };
};

/**
 * Get fee information for display
 * @param amount The funding amount
 * @returns Formatted fee information string
 */
export const getFeeInfo = (amount: number): string => {
  const feeCalc = calculateFundingFee(amount);
  return `Fee: ${formatCurrency(feeCalc.feeAmount)} (${feeCalc.feePercentage}%)`;
};

/**
 * Get total amount with fee for display
 * @param amount The funding amount
 * @returns Formatted total amount string
 */
export const getTotalWithFee = (amount: number): string => {
  const feeCalc = calculateFundingFee(amount);
  return `Total: ${formatCurrency(feeCalc.totalAmount)}`;
};
