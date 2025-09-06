import type { NextApiRequest, NextApiResponse } from 'next';
import { VirtualCardDatabaseService, CreateVirtualCardData } from '~~/services/database/virtualCardsSchema';

interface CreateVerifiedCardRequest {
  paymentReference: string;
  cardName: string;
  spendingLimit: number;
  userAddress: string;
}

interface CreateVerifiedCardResponse {
  success: boolean;
  cardId?: number;
  cardData?: any;
  message?: string;
  error?: string;
}

/**
 * Create Virtual Card API - Payment Verified
 * Creates a virtual card after payment verification
 * Integrates with smart contract and database
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateVerifiedCardResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { paymentReference, cardName, spendingLimit, userAddress }: CreateVerifiedCardRequest = req.body;

    // Validate required fields
    if (!paymentReference || !cardName || !spendingLimit || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: paymentReference, cardName, spendingLimit, userAddress'
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }

    console.log('Creating verified card:', {
      paymentReference,
      cardName,
      spendingLimit,
      userAddress: userAddress.substring(0, 10) + '...'
    });

    // Step 1: Verify payment exists and is valid
    const paymentVerification = await verifyPaymentForCardCreation(paymentReference, userAddress);
    
    if (!paymentVerification.success) {
      return res.status(400).json({
        success: false,
        error: paymentVerification.error || 'Payment verification failed'
      });
    }

    // Step 2: Create card in database with generated details
    const cardData: CreateVirtualCardData = {
      userAddress,
      cardId: 0, // Will be set after smart contract creation
      cardName,
      spendingLimit,
      balance: paymentVerification.amount!,
      currency: paymentVerification.currency!,
      paymentReference
    };

    const databaseRecord = await VirtualCardDatabaseService.createVirtualCard(cardData);
    
    // Step 3: Create card in smart contract
    const contractResult = await createCardInContract({
      userAddress,
      cardName,
      cardNumber: databaseRecord.card_number_masked,
      cvc: 'XXX', // Don't expose real CVC to contract
      cardType: databaseRecord.card_type,
      spendingLimit,
      paymentReference,
      amount: paymentVerification.amount!,
      currency: paymentVerification.currency!,
      paymentMethod: paymentVerification.paymentMethod!
    });

    if (!contractResult.success) {
      // TODO: Rollback database record creation
      return res.status(500).json({
        success: false,
        error: 'Failed to create card in smart contract: ' + contractResult.error
      });
    }

    // Step 4: Update database record with contract card ID
    const finalCardData = {
      ...databaseRecord,
      card_id: contractResult.cardId!
    };

    console.log('Card created successfully:', {
      cardId: contractResult.cardId,
      balance: paymentVerification.amount,
      paymentReference
    });

    // Return safe card data (no sensitive information)
    const safeCardData = VirtualCardDatabaseService.getSafeCardData(finalCardData);

    res.status(201).json({
      success: true,
      cardId: contractResult.cardId,
      cardData: safeCardData,
      message: 'Virtual card created successfully'
    });

  } catch (error) {
    console.error('Card creation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

/**
 * Verify payment for card creation
 */
async function verifyPaymentForCardCreation(
  paymentReference: string, 
  userAddress: string
): Promise<{
  success: boolean;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  error?: string;
}> {
  try {
    // Check if payment is MTN Mobile Money (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(paymentReference)) {
      // Verify MTN payment
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = process.env.VERCEL_URL || 'localhost:3000';
      
      const mtnResponse = await fetch(`${protocol}://${host}/api/mtn/payment-status/${paymentReference}`);
      
      if (mtnResponse.ok) {
        const mtnData = await mtnResponse.json();
        
        if (mtnData.success && mtnData.status === 'SUCCESSFUL') {
          return {
            success: true,
            amount: mtnData.amount,
            currency: mtnData.currency,
            paymentMethod: 'mtn'
          };
        } else {
          return {
            success: false,
            error: 'MTN payment not successful or still pending'
          };
        }
      }
    }

    // Check crypto payment verification
    if (paymentReference.startsWith('ETH_') || paymentReference.startsWith('CRYPTO_')) {
      const cryptoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/payments/verify-crypto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: paymentReference,
          userAddress
        })
      });

      if (cryptoResponse.ok) {
        const cryptoData = await cryptoResponse.json();
        
        if (cryptoData.success && cryptoData.data?.status === 'confirmed') {
          return {
            success: true,
            amount: cryptoData.data.amount,
            currency: cryptoData.data.currency,
            paymentMethod: 'crypto'
          };
        }
      }
    }

    // Check mobile money payment verification
    if (paymentReference.startsWith('momo_') || paymentReference.startsWith('MM_')) {
      const momoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/payments/verify-momo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: paymentReference,
          amount: 100, // TODO: Get actual amount from payment data
          currency: 'GHS',
          provider: 'mtn'
        })
      });

      if (momoResponse.ok) {
        const momoData = await momoResponse.json();
        
        if (momoData.success && momoData.data?.status === 'confirmed') {
          return {
            success: true,
            amount: momoData.data.amount,
            currency: momoData.data.currency,
            paymentMethod: 'momo'
          };
        }
      }
    }

    return {
      success: false,
      error: 'Payment not found or not verified'
    };

  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: 'Payment verification failed'
    };
  }
}

/**
 * Create card in smart contract
 */
async function createCardInContract(data: {
  userAddress: string;
  cardName: string;
  cardNumber: string;
  cvc: string;
  cardType: string;
  spendingLimit: number;
  paymentReference: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}): Promise<{
  success: boolean;
  cardId?: number;
  error?: string;
}> {
  try {
    // In a real implementation, this would interact with the smart contract
    // For simulation, we'll generate a card ID and simulate contract interaction
    
    const cardId = Math.floor(Math.random() * 1000000) + 1;
    
    // Simulate contract call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Simulated contract interaction:', {
      userAddress: data.userAddress,
      cardName: data.cardName,
      cardNumber: data.cardNumber,
      cardType: data.cardType,
      spendingLimit: data.spendingLimit,
      balance: data.amount,
      paymentReference: data.paymentReference
    });

    // Simulate success (95% success rate)
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      // Record payment in contract (simulated)
      console.log('Contract payment recorded:', {
        paymentReference: data.paymentReference,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        currency: data.currency,
        user: data.userAddress
      });

      // Create card in contract (simulated)
      console.log('Contract card created:', {
        cardId,
        user: data.userAddress,
        cardName: data.cardName,
        balance: data.amount
      });

      return {
        success: true,
        cardId
      };
    } else {
      return {
        success: false,
        error: 'Contract transaction failed'
      };
    }
    
  } catch (error) {
    console.error('Contract interaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Contract error'
    };
  }
}
