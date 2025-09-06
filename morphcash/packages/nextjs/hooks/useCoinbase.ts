/**
 * Custom hook for Coinbase Developer Platform integration
 * Provides real-time crypto data and multi-crypto settlement capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import coinbaseService, { ExchangeRate, CryptoAsset, PaymentQuote, SettlementOptions, SettlementResult } from '~~/services/coinbaseService';

export interface UseCoinbaseOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  supportedCurrencies?: string[];
}

export interface UseCoinbaseReturn {
  // Exchange rates
  exchangeRates: Record<string, ExchangeRate>;
  isLoadingRates: boolean;
  refreshRates: () => Promise<void>;
  
  // Supported assets
  supportedAssets: CryptoAsset[];
  isLoadingAssets: boolean;
  refreshAssets: () => Promise<void>;
  
  // Payment quotes
  getPaymentQuote: (from: string, to: string, amount: number) => Promise<PaymentQuote | null>;
  isGeneratingQuote: boolean;
  
  // Settlements
  executeSettlement: (options: SettlementOptions) => Promise<SettlementResult | null>;
  isExecutingSettlement: boolean;
  
  // Balances
  getBalance: (address: string, currency: string) => Promise<number>;
  isCheckingBalance: boolean;
  
  // Utility functions
  convertCurrency: (amount: number, from: string, to: string) => Promise<number>;
  formatCurrency: (amount: number, currency: string, decimals?: number) => string;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useCoinbase = (options: UseCoinbaseOptions = {}): UseCoinbaseReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    supportedCurrencies = ['GHS', 'USD', 'ETH', 'USDC']
  } = options;

  // State
  const [exchangeRates, setExchangeRates] = useState<Record<string, ExchangeRate>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [supportedAssets, setSupportedAssets] = useState<CryptoAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [isExecutingSettlement, setIsExecutingSettlement] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh exchange rates
  const refreshRates = useCallback(async () => {
    setIsLoadingRates(true);
    setError(null);
    
    try {
      const rates: Record<string, ExchangeRate> = {};
      
      // Get rates for supported currency pairs
      for (const fromCurrency of supportedCurrencies) {
        for (const toCurrency of ['ETH', 'USDC']) {
          if (fromCurrency !== toCurrency) {
            try {
              const rate = await coinbaseService.getExchangeRates(fromCurrency, toCurrency);
              rates[`${fromCurrency}_${toCurrency}`] = rate;
            } catch (err) {
              console.warn(`Failed to get rate for ${fromCurrency} to ${toCurrency}:`, err);
            }
          }
        }
      }
      
      setExchangeRates(rates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rates';
      setError(errorMessage);
      console.error('Error refreshing exchange rates:', err);
    } finally {
      setIsLoadingRates(false);
    }
  }, [supportedCurrencies]);

  // Refresh supported assets
  const refreshAssets = useCallback(async () => {
    setIsLoadingAssets(true);
    setError(null);
    
    try {
      const assets = await coinbaseService.getSupportedAssets();
      setSupportedAssets(assets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch supported assets';
      setError(errorMessage);
      console.error('Error refreshing supported assets:', err);
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  // Get payment quote
  const getPaymentQuote = useCallback(async (from: string, to: string, amount: number): Promise<PaymentQuote | null> => {
    setIsGeneratingQuote(true);
    setError(null);
    
    try {
      const quote = await coinbaseService.getPaymentQuote(from, to, amount);
      return quote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate payment quote';
      setError(errorMessage);
      console.error('Error generating payment quote:', err);
      return null;
    } finally {
      setIsGeneratingQuote(false);
    }
  }, []);

  // Execute settlement
  const executeSettlement = useCallback(async (options: SettlementOptions): Promise<SettlementResult | null> => {
    setIsExecutingSettlement(true);
    setError(null);
    
    try {
      const result = await coinbaseService.executeSettlement(options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute settlement';
      setError(errorMessage);
      console.error('Error executing settlement:', err);
      return null;
    } finally {
      setIsExecutingSettlement(false);
    }
  }, []);

  // Get balance
  const getBalance = useCallback(async (address: string, currency: string): Promise<number> => {
    setIsCheckingBalance(true);
    setError(null);
    
    try {
      if (currency === 'ETH') {
        return await coinbaseService.getETHBalance(address);
      } else if (currency === 'USDC') {
        return await coinbaseService.getUSDCBalance(address);
      } else {
        throw new Error(`Unsupported currency: ${currency}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get balance';
      setError(errorMessage);
      console.error('Error getting balance:', err);
      return 0;
    } finally {
      setIsCheckingBalance(false);
    }
  }, []);

  // Convert currency
  const convertCurrency = useCallback(async (amount: number, from: string, to: string): Promise<number> => {
    try {
      return await coinbaseService.convertCurrency(amount, from, to);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert currency';
      setError(errorMessage);
      console.error('Error converting currency:', err);
      return amount; // Return original amount on error
    }
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number, currency: string, decimals: number = 6): string => {
    return coinbaseService.formatCurrency(amount, currency, decimals);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      // Initial load
      refreshRates();
      refreshAssets();
      
      // Set up interval
      const interval = setInterval(() => {
        refreshRates();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshRates, refreshAssets]);

  return {
    exchangeRates,
    isLoadingRates,
    refreshRates,
    supportedAssets,
    isLoadingAssets,
    refreshAssets,
    getPaymentQuote,
    isGeneratingQuote,
    executeSettlement,
    isExecutingSettlement,
    getBalance,
    isCheckingBalance,
    convertCurrency,
    formatCurrency,
    error,
    clearError,
  };
};
