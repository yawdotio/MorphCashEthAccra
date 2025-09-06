/**
 * Visa B2B Virtual Account Payment Method Service
 * Integrates with Visa's API to create and manage virtual cards
 * Documentation: https://developer.visa.com/capabilities/vpa/docs-getting-started
 * SSL Authentication: https://developer.visa.com/pages/working-with-visa-apis/two-way-ssl
 */

import { VisaSSLManager, createVisaSSLConfig } from '~~/utils/visaSSL';
import https from 'https';

export interface VisaCardRequest {
  // Required for account creation
  clientId: string;
  buyerId: string;
  proxyPoolId?: string;
  
  // Card details
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName: string;
  
  // Account controls
  creditLimit: number;
  currency: string;
  authorizationControls?: {
    merchantCategoryCodes?: string[];
    merchantIds?: string[];
    transactionLimits?: {
      daily?: number;
      monthly?: number;
      perTransaction?: number;
    };
  };
  
  // Payment verification
  paymentMethod: 'momo' | 'crypto';
  paymentReference: string;
  paymentAmount: number;
  paymentCurrency: string;
}

export interface VisaCardResponse {
  success: boolean;
  data?: {
    accountId: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    creditLimit: number;
    currency: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    lastUpdated: string;
  };
  error?: string;
  visaErrorCode?: string;
}

export interface VisaAccountControls {
  merchantCategoryCodes?: string[];
  merchantIds?: string[];
  transactionLimits?: {
    daily?: number;
    monthly?: number;
    perTransaction?: number;
  };
  geographicRestrictions?: string[];
  timeRestrictions?: {
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
  };
}

export class VisaService {
  private sslManager: VisaSSLManager;
  private baseUrl: string;
  private clientId: string;
  private buyerId: string;
  private proxyPoolId?: string;

  constructor() {
    const sslConfig = createVisaSSLConfig();
    this.sslManager = new VisaSSLManager(sslConfig);
    this.baseUrl = sslConfig.baseUrl;
    this.clientId = process.env.NEXT_PUBLIC_VISA_CLIENT_ID || '';
    this.buyerId = process.env.NEXT_PUBLIC_VISA_BUYER_ID || '';
    this.proxyPoolId = process.env.NEXT_PUBLIC_VISA_PROXY_POOL_ID;
  }

  /**
   * Verify if Visa service is properly configured
   */
  isConfigured(): boolean {
    const sslValidation = this.sslManager.validateCertificates();
    return !!(this.clientId && this.buyerId && sslValidation.valid);
  }

  /**
   * Get SSL configuration validation errors
   */
  getSSLValidationErrors(): string[] {
    const validation = this.sslManager.validateCertificates();
    return validation.errors;
  }

  /**
   * Create a new virtual card account
   */
  async createVirtualCard(request: VisaCardRequest): Promise<VisaCardResponse> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Visa API not properly configured. Please check environment variables.'
        };
      }

      // Verify payment before creating card
      const paymentVerified = await this.verifyPayment(
        request.paymentMethod,
        request.paymentReference,
        request.paymentAmount,
        request.paymentCurrency
      );

      if (!paymentVerified) {
        return {
          success: false,
          error: 'Payment verification failed. Cannot create virtual card without confirmed payment.'
        };
      }

      // Create account request payload
      const accountPayload = {
        clientId: this.clientId,
        buyerId: this.buyerId,
        proxyPoolId: this.proxyPoolId,
        accountControls: {
          creditLimit: request.creditLimit,
          currency: request.currency,
          authorizationControls: request.authorizationControls || {},
          ...this.getDefaultAccountControls()
        },
        cardholderInfo: {
          name: request.cardholderName,
          email: request.email || '',
          phone: request.phone || ''
        },
        paymentReference: request.paymentReference
      };

      // Make API call to create account
      const response = await this.makeApiCall('/vpa/v1/accounts', 'POST', accountPayload);

      if (response.success && response.data) {
        // Generate card details (in production, these would come from Visa)
        const cardData = await this.generateCardDetails(response.data.accountId);
        
        return {
          success: true,
          data: {
            accountId: response.data.accountId,
            cardNumber: cardData.cardNumber,
            expiryDate: cardData.expiryDate,
            cvv: cardData.cvv,
            cardholderName: request.cardholderName,
            creditLimit: request.creditLimit,
            currency: request.currency,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to create virtual card',
        visaErrorCode: response.visaErrorCode
      };

    } catch (error) {
      console.error('Error creating virtual card:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Verify payment before creating card
   */
  private async verifyPayment(
    method: 'momo' | 'crypto',
    reference: string,
    amount: number,
    currency: string
  ): Promise<boolean> {
    try {
      // For Mobile Money verification
      if (method === 'momo') {
        return await this.verifyMobileMoneyPayment(reference, amount, currency);
      }
      
      // For Crypto verification
      if (method === 'crypto') {
        return await this.verifyCryptoPayment(reference, amount, currency);
      }

      return false;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Verify Mobile Money payment
   */
  private async verifyMobileMoneyPayment(
    reference: string,
    amount: number,
    currency: string
  ): Promise<boolean> {
    try {
      // This would integrate with your mobile money provider
      // For now, we'll simulate verification
      const response = await fetch('/api/payments/verify-momo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          amount,
          currency
        })
      });

      const result = await response.json();
      return result.success && result.data?.status === 'confirmed';
    } catch (error) {
      console.error('Mobile Money verification error:', error);
      return false;
    }
  }

  /**
   * Verify Crypto payment
   */
  private async verifyCryptoPayment(
    reference: string,
    amount: number,
    currency: string
  ): Promise<boolean> {
    try {
      // This would integrate with your crypto payment provider
      // For now, we'll simulate verification
      const response = await fetch('/api/payments/verify-crypto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          amount,
          currency
        })
      });

      const result = await response.json();
      return result.success && result.data?.status === 'confirmed';
    } catch (error) {
      console.error('Crypto verification error:', error);
      return false;
    }
  }

  /**
   * Generate card details for the account
   */
  private async generateCardDetails(accountId: string): Promise<{
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  }> {
    // In production, this would call Visa's card generation API
    // For now, we'll generate test data
    const cardNumber = this.generateCardNumber();
    const expiryDate = this.generateExpiryDate();
    const cvv = this.generateCVV();

    return {
      cardNumber,
      expiryDate,
      cvv
    };
  }

  /**
   * Generate a test card number (Visa format)
   */
  private generateCardNumber(): string {
    // Visa cards start with 4
    const prefix = '4';
    const randomDigits = Array.from({ length: 15 }, () => 
      Math.floor(Math.random() * 10)
    ).join('');
    return prefix + randomDigits;
  }

  /**
   * Generate expiry date (MM/YY format)
   */
  private generateExpiryDate(): string {
    const now = new Date();
    const year = now.getFullYear() + 3; // 3 years from now
    const month = Math.floor(Math.random() * 12) + 1;
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  }

  /**
   * Generate CVV
   */
  private generateCVV(): string {
    return Math.floor(Math.random() * 900 + 100).toString();
  }

  /**
   * Get default account controls
   */
  private getDefaultAccountControls(): VisaAccountControls {
    return {
      merchantCategoryCodes: [], // Allow all merchants by default
      merchantIds: [], // Allow all merchants by default
      transactionLimits: {
        daily: 10000, // $10,000 daily limit
        monthly: 100000, // $100,000 monthly limit
        perTransaction: 5000 // $5,000 per transaction limit
      },
      geographicRestrictions: [], // No geographic restrictions
      timeRestrictions: {
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: [1, 2, 3, 4, 5, 6, 7] // All days
      }
    };
  }

  /**
   * Make API call to Visa using Two-Way SSL
   */
  private async makeApiCall(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<{ success: boolean; data?: any; error?: string; visaErrorCode?: string }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const sslConfig = this.sslManager.getSSLConfig();
      const headers = this.sslManager.getRequestHeaders();

      return new Promise((resolve) => {
        const options: https.RequestOptions = {
          method,
          headers,
          key: sslConfig.key,
          cert: sslConfig.cert,
          ca: sslConfig.ca,
          rejectUnauthorized: true
        };

        const req = https.request(url, options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            try {
              const result = JSON.parse(responseData);

              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve({
                  success: true,
                  data: result
                });
              } else {
                resolve({
                  success: false,
                  error: result.message || `HTTP ${res.statusCode}: API call failed`,
                  visaErrorCode: result.errorCode
                });
              }
            } catch (parseError) {
              resolve({
                success: false,
                error: 'Failed to parse response',
                visaErrorCode: 'PARSE_ERROR'
              });
            }
          });
        });

        req.on('error', (error) => {
          resolve({
            success: false,
            error: error.message || 'Network error'
          });
        });

        if (data && (method === 'POST' || method === 'PUT')) {
          req.write(JSON.stringify(data));
        }

        req.end();
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Update account controls
   */
  async updateAccountControls(
    accountId: string,
    controls: VisaAccountControls
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeApiCall(
        `/vpa/v1/accounts/${accountId}/controls`,
        'PUT',
        { accountControls: controls }
      );

      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails(accountId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await this.makeApiCall(
        `/vpa/v1/accounts/${accountId}`,
        'GET'
      );

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Suspend account
   */
  async suspendAccount(accountId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.makeApiCall(
        `/vpa/v1/accounts/${accountId}/suspend`,
        'POST'
      );

      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Reactivate account
   */
  async reactivateAccount(accountId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.makeApiCall(
        `/vpa/v1/accounts/${accountId}/reactivate`,
        'POST'
      );

      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const visaService = new VisaService();
