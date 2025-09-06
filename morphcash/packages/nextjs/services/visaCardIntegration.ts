/**
 * Visa Card Integration Service
 * Handles the integration between smart contract and Visa API
 * Ensures payment verification before card creation
 */

import { visaService, VisaCardRequest, VisaCardResponse } from './visaService';
import { supabaseDatabase } from '~~/supabase/supabase';

export interface CardCreationRequest {
  userId: string;
  cardName: string;
  spendingLimit: number;
  paymentMethod: 'momo' | 'crypto';
  paymentReference: string;
  paymentAmount: number;
  paymentCurrency: string;
  authorizationControls?: {
    merchantCategoryCodes?: string[];
    merchantIds?: string[];
    transactionLimits?: {
      daily?: number;
      monthly?: number;
      perTransaction?: number;
    };
  };
}

export interface CardCreationResponse {
  success: boolean;
  data?: {
    cardId: string;
    visaAccountId: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    spendingLimit: number;
    currency: string;
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
  };
  error?: string;
  visaErrorCode?: string;
}

export class VisaCardIntegrationService {
  private contractAddress: string;
  private privateKey: string;

  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_VISA_CONTRACT_ADDRESS || '';
    this.privateKey = process.env.VISA_CONTRACT_PRIVATE_KEY || '';
  }

  /**
   * Create a virtual card with payment verification
   */
  async createVirtualCard(request: CardCreationRequest): Promise<CardCreationResponse> {
    try {
      // Step 1: Verify payment first
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

      // Step 2: Create Visa account
      const visaRequest: VisaCardRequest = {
        clientId: process.env.NEXT_PUBLIC_VISA_CLIENT_ID || '',
        buyerId: process.env.NEXT_PUBLIC_VISA_BUYER_ID || '',
        proxyPoolId: process.env.NEXT_PUBLIC_VISA_PROXY_POOL_ID,
        cardholderName: request.cardName,
        creditLimit: request.spendingLimit,
        currency: request.paymentCurrency,
        authorizationControls: request.authorizationControls,
        paymentMethod: request.paymentMethod,
        paymentReference: request.paymentReference,
        paymentAmount: request.paymentAmount,
        paymentCurrency: request.paymentCurrency
      };

      const visaResponse = await visaService.createVirtualCard(visaRequest);

      if (!visaResponse.success || !visaResponse.data) {
        return {
          success: false,
          error: visaResponse.error || 'Failed to create Visa account',
          visaErrorCode: visaResponse.visaErrorCode
        };
      }

      // Step 3: Store card in database
      const cardData = {
        user_id: request.userId,
        card_name: request.cardName,
        card_number: visaResponse.data.cardNumber,
        expiry_date: visaResponse.data.expiryDate,
        cvv: visaResponse.data.cvv,
        card_type: 'Visa',
        spending_limit: request.spendingLimit,
        current_spend: 0,
        is_active: true,
        visa_account_id: visaResponse.data.accountId,
        payment_reference: request.paymentReference,
        payment_method: request.paymentMethod,
        authorization_controls: request.authorizationControls || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const dbResult = await supabaseDatabase.createVirtualCard(cardData);

      if (!dbResult.success || !dbResult.data) {
        return {
          success: false,
          error: 'Failed to store card in database'
        };
      }

      // Step 4: Call smart contract to record the card creation
      // This would typically be done through a backend service that has access to the private key
      const contractResult = await this.recordCardInContract(
        request.userId,
        dbResult.data.id,
        visaResponse.data.accountId,
        request.paymentReference,
        request.paymentMethod
      );

      if (!contractResult.success) {
        // Rollback database entry
        await supabaseDatabase.updateVirtualCard(dbResult.data.id, { is_active: false });
        return {
          success: false,
          error: 'Failed to record card in smart contract'
        };
      }

      return {
        success: true,
        data: {
          cardId: dbResult.data.id,
          visaAccountId: visaResponse.data.accountId,
          cardNumber: visaResponse.data.cardNumber,
          expiryDate: visaResponse.data.expiryDate,
          cvv: visaResponse.data.cvv,
          cardholderName: request.cardName,
          spendingLimit: request.spendingLimit,
          currency: request.paymentCurrency,
          status: 'active',
          createdAt: new Date().toISOString()
        }
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
      if (method === 'momo') {
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
      }

      if (method === 'crypto') {
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
      }

      return false;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Record card creation in smart contract
   * This would typically be done by a backend service
   */
  private async recordCardInContract(
    userId: string,
    cardId: string,
    visaAccountId: string,
    paymentReference: string,
    paymentMethod: 'momo' | 'crypto'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, this would call a backend service that interacts with the smart contract
      // The backend service would have access to the private key and would:
      // 1. Verify the payment in the smart contract
      // 2. Create the virtual card record
      // 3. Complete the card creation with Visa details

      const response = await fetch('/api/visa/record-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          cardId,
          visaAccountId,
          paymentReference,
          paymentMethod
        })
      });

      const result = await response.json();
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Contract interaction failed'
      };
    }
  }

  /**
   * Update card spending limit
   */
  async updateCardLimit(
    cardId: string,
    newLimit: number,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update in database
      const dbResult = await supabaseDatabase.updateVirtualCard(cardId, {
        spending_limit: newLimit,
        updated_at: new Date().toISOString()
      });

      if (!dbResult.success) {
        return {
          success: false,
          error: 'Failed to update card in database'
        };
      }

      // Update in smart contract
      const contractResult = await this.updateContractCardLimit(cardId, newLimit, userId);

      if (!contractResult.success) {
        return {
          success: false,
          error: 'Failed to update card in smart contract'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Deactivate card
   */
  async deactivateCard(
    cardId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update in database
      const dbResult = await supabaseDatabase.updateVirtualCard(cardId, {
        is_active: false,
        updated_at: new Date().toISOString()
      });

      if (!dbResult.success) {
        return {
          success: false,
          error: 'Failed to deactivate card in database'
        };
      }

      // Update in smart contract
      const contractResult = await this.deactivateContractCard(cardId, userId);

      if (!contractResult.success) {
        return {
          success: false,
          error: 'Failed to deactivate card in smart contract'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update card limit in smart contract
   */
  private async updateContractCardLimit(
    cardId: string,
    newLimit: number,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/visa/update-card-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          newLimit,
          userId
        })
      });

      const result = await response.json();
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Contract update failed'
      };
    }
  }

  /**
   * Deactivate card in smart contract
   */
  private async deactivateContractCard(
    cardId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/visa/deactivate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          userId
        })
      });

      const result = await response.json();
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Contract deactivation failed'
      };
    }
  }

  /**
   * Get user's virtual cards
   */
  async getUserCards(userId: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const result = await supabaseDatabase.getVirtualCards(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cards'
      };
    }
  }
}

// Export singleton instance
export const visaCardIntegration = new VisaCardIntegrationService();

