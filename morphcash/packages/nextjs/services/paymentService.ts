/**
 * Payment Service
 * Handles payment processing, exchange rates, and payment method integrations
 */

export type SupportedCurrency = 'GHS' | 'USD';

export interface ExchangeRate {
  ghsToEth: number;
  ethToGhs: number;
  usdToEth: number;
  ethToUsd: number;
  lastUpdated: string;
  source: 'coinbase' | 'fallback';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  error?: string;
}

export interface MobileMoneyPaymentData {
  phoneNumber: string;
  provider: 'mtn' | 'vodafone' | 'airteltigo';
  amount: number;
  currency: SupportedCurrency;
  reference: string;
}

export interface CryptoPaymentData {
  amount: number; // in ETH
  address: string;
  reference: string;
  currency: SupportedCurrency;
}

class PaymentService {
  private static instance: PaymentService;
  private exchangeRateCache: ExchangeRate | null = null;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Fetch real-time exchange rate from Coinbase API
   */
  async getExchangeRate(): Promise<ExchangeRate> {
    // Check cache first
    if (this.exchangeRateCache && this.isCacheValid()) {
      return this.exchangeRateCache;
    }

    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
      const data = await response.json();
      
      if (data.data && data.data.rates) {
        const rates = data.data.rates;
        
        // Get GHS rates
        const ghsToEthRate = rates.GHS ? 1 / parseFloat(rates.GHS) : 0.000025;
        const ethToGhsRate = rates.GHS ? parseFloat(rates.GHS) : 40000;
        
        // Get USD rates
        const usdToEthRate = rates.USD ? 1 / parseFloat(rates.USD) : 0.00023;
        const ethToUsdRate = rates.USD ? parseFloat(rates.USD) : 4300;
        
        const exchangeRate: ExchangeRate = {
          ghsToEth: ghsToEthRate,
          ethToGhs: ethToGhsRate,
          usdToEth: usdToEthRate,
          ethToUsd: ethToUsdRate,
          lastUpdated: new Date().toISOString(),
          source: 'coinbase'
        };

        this.exchangeRateCache = exchangeRate;
        return exchangeRate;
      }
    } catch (error) {
      console.error('Error fetching exchange rate from Coinbase:', error);
    }

    // Fallback to cached rate or default
    if (this.exchangeRateCache) {
      return this.exchangeRateCache;
    }

    // Ultimate fallback (should be updated regularly)
    const fallbackRate: ExchangeRate = {
      ghsToEth: 0.000025, // Approximate rate
      ethToGhs: 40000,
      usdToEth: 0.00023,
      ethToUsd: 4300,
      lastUpdated: new Date().toISOString(),
      source: 'fallback'
    };

    this.exchangeRateCache = fallbackRate;
    return fallbackRate;
  }

  /**
   * Convert amount to ETH using current exchange rate
   */
  async convertToEth(amount: number, currency: SupportedCurrency): Promise<number> {
    const exchangeRate = await this.getExchangeRate();
    
    if (currency === 'GHS') {
      return amount * exchangeRate.ghsToEth;
    } else if (currency === 'USD') {
      return amount * exchangeRate.usdToEth;
    }
    
    throw new Error(`Unsupported currency: ${currency}`);
  }

  /**
   * Convert ETH amount to specified currency using current exchange rate
   */
  async convertEthToCurrency(ethAmount: number, currency: SupportedCurrency): Promise<number> {
    const exchangeRate = await this.getExchangeRate();
    
    if (currency === 'GHS') {
      return ethAmount * exchangeRate.ethToGhs;
    } else if (currency === 'USD') {
      return ethAmount * exchangeRate.ethToUsd;
    }
    
    throw new Error(`Unsupported currency: ${currency}`);
  }

  /**
   * Convert GHS amount to ETH using current exchange rate (legacy)
   */
  async convertGhsToEth(ghsAmount: number): Promise<number> {
    return this.convertToEth(ghsAmount, 'GHS');
  }

  /**
   * Convert ETH amount to GHS using current exchange rate (legacy)
   */
  async convertEthToGhs(ethAmount: number): Promise<number> {
    return this.convertEthToCurrency(ethAmount, 'GHS');
  }

  /**
   * Check if cached exchange rate is still valid
   */
  private isCacheValid(): boolean {
    if (!this.exchangeRateCache) return false;
    const now = new Date().getTime();
    const cacheTime = new Date(this.exchangeRateCache.lastUpdated).getTime();
    return (now - cacheTime) < this.cacheExpiry;
  }

  /**
   * Generate payment reference
   */
  generatePaymentReference(type: 'mobile_money' | 'crypto'): string {
    const prefix = type === 'mobile_money' ? 'MM' : 'CRYPTO';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate payment address (in production, this would be from your backend)
   */
  generatePaymentAddress(): string {
    // In production, this should be generated by your backend
    // For demo purposes, using a placeholder address
    return '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  }

  /**
   * Process mobile money payment
   * In production, this would integrate with actual mobile money APIs
   */
  async processMobileMoneyPayment(paymentData: MobileMoneyPaymentData): Promise<PaymentResult> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment processing (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        return {
          success: true,
          transactionId: `MM_${Date.now()}`,
          reference: paymentData.reference
        };
      } else {
        return {
          success: false,
          error: 'Payment failed. Please try again.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Payment processing error. Please try again.'
      };
    }
  }

  /**
   * Process crypto payment
   * In production, this would monitor blockchain for transaction confirmation
   */
  async processCryptoPayment(paymentData: CryptoPaymentData): Promise<PaymentResult> {
    try {
      // Simulate payment monitoring
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate payment detection (85% success rate for demo)
      const isSuccess = Math.random() > 0.15;
      
      if (isSuccess) {
        return {
          success: true,
          transactionId: `ETH_${Date.now()}`,
          reference: paymentData.reference
        };
      } else {
        return {
          success: false,
          error: 'Payment not detected. Please try again.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Payment monitoring error. Please try again.'
      };
    }
  }

  /**
   * Validate mobile money phone number
   */
  validateMobileMoneyNumber(phoneNumber: string, provider: 'mtn' | 'vodafone' | 'airteltigo'): boolean {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    
    // Basic validation patterns for Ghana mobile numbers
    const patterns = {
      mtn: /^(024|054|055|059)\d{7}$/,
      vodafone: /^(020|050)\d{7}$/,
      airteltigo: /^(026|056)\d{7}$/
    };

    return patterns[provider].test(cleanNumber);
  }

  /**
   * Get supported mobile money providers
   */
  getSupportedProviders(): Array<{id: 'mtn' | 'vodafone' | 'airteltigo', name: string}> {
    return [
      { id: 'mtn', name: 'MTN Mobile Money' },
      { id: 'vodafone', name: 'Vodafone Cash' },
      { id: 'airteltigo', name: 'AirtelTigo Money' }
    ];
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: SupportedCurrency | 'ETH'): string {
    if (currency === 'GHS') {
      return `GHS ${amount.toFixed(2)}`;
    } else if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    } else if (currency === 'ETH') {
      return `ETH ${amount.toFixed(6)}`;
    }
    
    throw new Error(`Unsupported currency: ${currency}`);
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: SupportedCurrency): string {
    if (currency === 'GHS') {
      return '₵';
    } else if (currency === 'USD') {
      return '$';
    }
    
    throw new Error(`Unsupported currency: ${currency}`);
  }

  /**
   * Get payment status (for monitoring)
   */
  async getPaymentStatus(reference: string): Promise<'pending' | 'completed' | 'failed'> {
    // In production, this would check actual payment status
    // For demo, simulate status based on reference
    const isCompleted = Math.random() > 0.3;
    return isCompleted ? 'completed' : 'pending';
  }
}

export const paymentService = PaymentService.getInstance();
