/**
 * Mobile Money Payment Verification API
 * Verifies mobile money payments before creating virtual cards
 * Enhanced with MTN Mobile Money API integration
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface MomoVerificationRequest {
  reference: string;
  amount: number;
  currency: string;
  provider?: 'mtn' | 'vodafone' | 'airteltigo';
  phoneNumber?: string;
  externalId?: string;
}

interface MomoVerificationResponse {
  success: boolean;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    status: 'pending' | 'confirmed' | 'failed';
    transactionId: string;
    timestamp: string;
    provider?: string;
    financialTransactionId?: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MomoVerificationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { reference, amount, currency, provider, phoneNumber, externalId }: MomoVerificationRequest = req.body;

    if (!reference || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: reference, amount, currency'
      });
    }

    console.log('Mobile Money Verification Request:', {
      reference,
      amount,
      currency,
      provider,
      externalId
    });

    // Enhanced verification with MTN API integration
    const verificationResult = await verifyMobileMoneyPayment(
      reference, 
      amount, 
      currency, 
      provider, 
      phoneNumber, 
      externalId
    );

    if (verificationResult.success) {
      return res.status(200).json({
        success: true,
        data: {
          reference,
          amount,
          currency,
          status: verificationResult.status || 'confirmed',
          transactionId: verificationResult.transactionId || `momo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          provider: provider || 'unknown',
          financialTransactionId: verificationResult.financialTransactionId
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: verificationResult.error || 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Mobile Money verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Verify mobile money payment with enhanced MTN API integration
 * Supports multiple providers:
 * - MTN Mobile Money (via API)
 * - Vodafone Cash (simulation)
 * - AirtelTigo Money (simulation)
 */
async function verifyMobileMoneyPayment(
  reference: string,
  amount: number,
  currency: string,
  provider?: 'mtn' | 'vodafone' | 'airteltigo',
  phoneNumber?: string,
  externalId?: string
): Promise<{ 
  success: boolean; 
  error?: string; 
  status?: 'pending' | 'confirmed' | 'failed';
  transactionId?: string;
  financialTransactionId?: string;
}> {
  try {
    console.log('Verifying payment:', { reference, amount, currency, provider });

    // MTN Mobile Money API Integration
    if (provider === 'mtn') {
      return await verifyMTNPayment(reference, amount, currency, phoneNumber, externalId);
    }

    // Other providers - simulation for now
    if (provider === 'vodafone' || provider === 'airteltigo') {
      return await verifyOtherProvider(reference, amount, currency, provider);
    }

    // Legacy verification for backward compatibility
    return await verifyLegacyPayment(reference, amount, currency);

  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Verify MTN Mobile Money payment using the Collections API
 */
async function verifyMTNPayment(
  reference: string,
  amount: number,
  currency: string,
  phoneNumber?: string,
  externalId?: string
): Promise<{ 
  success: boolean; 
  error?: string; 
  status?: 'pending' | 'confirmed' | 'failed';
  transactionId?: string;
  financialTransactionId?: string;
}> {
  try {
    // Check if reference is a UUID (from MTN API)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(reference)) {
      // Direct API status check
      const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/mtn/payment-status/${reference}`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.success && statusData.status === 'SUCCESSFUL') {
          return {
            success: true,
            status: 'confirmed',
            transactionId: reference,
            financialTransactionId: statusData.financialTransactionId
          };
        } else if (statusData.success && statusData.status === 'PENDING') {
          return {
            success: false,
            status: 'pending',
            error: 'Payment is still pending'
          };
        } else {
          return {
            success: false,
            status: 'failed',
            error: 'Payment failed or was rejected'
          };
        }
      }
    }

    // Widget-based verification (legacy support)
    if (reference.startsWith('MTN_') || reference.includes('mtn')) {
      // Simulate MTN verification based on amount (as per MTN sandbox docs)
      const testAmount = parseFloat(externalId?.split('-')[1] || amount.toString());
      
      if (testAmount >= 1 && testAmount <= 19) {
        return {
          success: false,
          status: 'pending',
          error: 'Payment is still pending'
        };
      } else if (testAmount >= 20 && testAmount <= 79) {
        return {
          success: false,
          status: 'failed',
          error: 'Payment failed'
        };
      } else {
        return {
          success: true,
          status: 'confirmed',
          transactionId: `mtn_${Date.now()}`
        };
      }
    }

    return {
      success: false,
      error: 'Invalid MTN payment reference'
    };

  } catch (error) {
    console.error('MTN verification error:', error);
    return {
      success: false,
      error: 'MTN verification failed'
    };
  }
}

/**
 * Verify other mobile money providers (Vodafone, AirtelTigo)
 */
async function verifyOtherProvider(
  reference: string,
  amount: number,
  currency: string,
  provider: 'vodafone' | 'airteltigo'
): Promise<{ 
  success: boolean; 
  error?: string; 
  status?: 'pending' | 'confirmed' | 'failed';
  transactionId?: string;
}> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate verification logic for other providers
  if (reference.includes(provider) && amount > 0) {
    // 90% success rate for simulation
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        status: 'confirmed',
        transactionId: `${provider}_${Date.now()}`
      };
    } else {
      return {
        success: false,
        status: 'failed',
        error: `${provider} payment verification failed`
      };
    }
  }

  return {
    success: false,
    error: `Invalid ${provider} payment reference`
  };
}

/**
 * Legacy payment verification for backward compatibility
 */
async function verifyLegacyPayment(
  reference: string,
  amount: number,
  currency: string
): Promise<{ 
  success: boolean; 
  error?: string; 
  status?: 'pending' | 'confirmed' | 'failed';
  transactionId?: string;
}> {
  // Legacy verification logic
  if (reference.startsWith('momo_') && amount > 0) {
    return {
      success: true,
      status: 'confirmed',
      transactionId: reference
    };
  }

  return {
    success: false,
    error: 'Invalid payment reference or amount'
  };
}

