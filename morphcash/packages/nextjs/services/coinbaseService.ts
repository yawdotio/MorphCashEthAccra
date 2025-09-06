/**
 * Coinbase Developer Platform Integration Service
 * Provides ETH and stablecoin data, multi-crypto settlements, and Base network integration
 */

export interface CoinbaseConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  type: 'native' | 'erc20';
  contractAddress?: string;
  network: 'ethereum' | 'base';
}

export interface PaymentQuote {
  from: string;
  to: string;
  amount: number;
  rate: number;
  fee: number;
  total: number;
  expiresAt: string;
  quoteId: string;
}

export interface SettlementOptions {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  recipientAddress: string;
  network: 'ethereum' | 'base';
  gasless?: boolean;
}

export interface SettlementResult {
  transactionId: string;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  gasUsed?: number;
  blockNumber?: number;
  confirmationTime?: number;
}

class CoinbaseService {
  private config: CoinbaseConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: CoinbaseConfig) {
    this.config = config;
    console.log('🔧 Coinbase Service initialized:', {
      hasApiKey: !!config.apiKey,
      baseUrl: config.baseUrl,
      environment: config.environment,
      apiKeyLength: config.apiKey?.length || 0
    });
  }

  /**
   * Get real-time exchange rates for supported cryptocurrencies
   */
  async getExchangeRates(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    const cacheKey = `rate_${fromCurrency}_${toCurrency}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      console.log('📋 Using cached exchange rate for', fromCurrency, 'to', toCurrency);
      return cached;
    }

    try {
      console.log(`🔄 Fetching exchange rate: ${fromCurrency} → ${toCurrency}`);
      console.log('🌐 API URL:', `${this.config.baseUrl}/v2/exchange-rates?currency=${fromCurrency}`);
      
      // Use public API endpoint that doesn't require authentication
      const response = await fetch(
        `${this.config.baseUrl}/v2/exchange-rates?currency=${fromCurrency}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Coinbase API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 API Response data:', data);
      
      const rate = data.data.rates[toCurrency.toUpperCase()];

      if (!rate) {
        console.error('❌ Rate not found for', toCurrency.toUpperCase(), 'in rates:', data.data.rates);
        throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      }

      const exchangeRate: ExchangeRate = {
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase(),
        rate: parseFloat(rate),
        timestamp: new Date().toISOString(),
      };

      console.log('✅ Exchange rate fetched:', exchangeRate);
      this.setCachedData(cacheKey, exchangeRate);
      return exchangeRate;
    } catch (error) {
      console.error('❌ Error fetching exchange rate:', error);
      throw error;
    }
  }

  /**
   * Get supported crypto assets for payments
   */
  async getSupportedAssets(): Promise<CryptoAsset[]> {
    const cacheKey = 'supported_assets';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      console.log('📋 Using cached supported assets');
      return cached;
    }

    try {
      console.log('🔄 Using predefined supported assets...');
      
      // Since the assets API endpoint is not available, we'll use predefined assets
      // These are the standard assets we support for payments
      const supportedAssets: CryptoAsset[] = [
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          type: 'native',
          network: 'ethereum',
        },
        {
          id: 'usd-coin',
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          type: 'erc20',
          contractAddress: '0xA0b86a33E6441c8C06DdD4c4c4B4c4B4c4B4c4B4c', // USDC on Ethereum
          network: 'ethereum',
        },
        {
          id: 'usd-coin-base',
          name: 'USD Coin (Base)',
          symbol: 'USDC',
          decimals: 6,
          type: 'erc20',
          contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
          network: 'base',
        }
      ];

      console.log('✅ Predefined supported assets:', supportedAssets);
      this.setCachedData(cacheKey, supportedAssets);
      return supportedAssets;
    } catch (error) {
      console.error('❌ Error getting supported assets:', error);
      throw error;
    }
  }

  /**
   * Get payment quote for multi-crypto settlement
   */
  async getPaymentQuote(
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<PaymentQuote> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/payment-quotes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromCurrency.toUpperCase(),
            to: toCurrency.toUpperCase(),
            amount: amount.toString(),
            network: 'base', // Prefer Base network for lower fees
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        from: data.from,
        to: data.to,
        amount: parseFloat(data.amount),
        rate: parseFloat(data.rate),
        fee: parseFloat(data.fee),
        total: parseFloat(data.total),
        expiresAt: data.expires_at,
        quoteId: data.quote_id,
      };
    } catch (error) {
      console.error('Error getting payment quote:', error);
      throw error;
    }
  }

  /**
   * Execute multi-crypto settlement using Coinbase Payments
   */
  async executeSettlement(options: SettlementOptions): Promise<SettlementResult> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/settlements`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from_currency: options.fromCurrency.toUpperCase(),
            to_currency: options.toCurrency.toUpperCase(),
            amount: options.amount.toString(),
            recipient_address: options.recipientAddress,
            network: options.network,
            gasless: options.gasless || false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        transactionId: data.transaction_id,
        status: data.status,
        network: data.network,
        gasUsed: data.gas_used,
        blockNumber: data.block_number,
        confirmationTime: data.confirmation_time,
      };
    } catch (error) {
      console.error('Error executing settlement:', error);
      throw error;
    }
  }

  /**
   * Get Base network transaction status
   */
  async getTransactionStatus(transactionId: string, network: 'ethereum' | 'base' = 'base'): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    blockNumber?: number;
    gasUsed?: number;
  }> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/transactions/${transactionId}?network=${network}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        status: data.status,
        confirmations: data.confirmations || 0,
        blockNumber: data.block_number,
        gasUsed: data.gas_used,
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  /**
   * Get USDC balance for a given address on Base network
   */
  async getUSDCBalance(address: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/balances/${address}?currency=USDC&network=base`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }

      const data = await response.json();
      return parseFloat(data.balance || '0');
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      throw error;
    }
  }

  /**
   * Get ETH balance for a given address on Base network
   */
  async getETHBalance(address: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/balances/${address}?currency=ETH&network=base`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }

      const data = await response.json();
      return parseFloat(data.balance || '0');
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw error;
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string, decimals: number = 6): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    fromAmount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    try {
      console.log(`🔄 Converting currency: ${fromAmount} ${fromCurrency} → ${toCurrency}`);
      
      // Get the exchange rate
      const rate = await this.getExchangeRates(fromCurrency, toCurrency);
      const convertedAmount = fromAmount * rate.rate;
      
      console.log(`✅ Currency conversion: ${fromAmount} ${fromCurrency} = ${convertedAmount} ${toCurrency} (rate: ${rate.rate})`);
      return convertedAmount;
    } catch (err) {
      console.error('❌ Error converting currency:', err);
      throw err;
    }
  }

  // Private helper methods
  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// Create singleton instance
const coinbaseService = new CoinbaseService({
  apiKey: process.env.NEXT_PUBLIC_COINBASE_API_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_COINBASE_BASE_URL || 'https://api.coinbase.com',
  environment: (process.env.NEXT_PUBLIC_COINBASE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
});

export default coinbaseService;
export { CoinbaseService };
