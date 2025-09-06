import type { NextApiRequest, NextApiResponse } from 'next';

interface FundCardRequest {
  cardId: number;
  paymentReference: string;
  userAddress: string;
}

interface FundCardResponse {
  success: boolean;
  newBalance?: number;
  fundingAmount?: number;
  message?: string;
  error?: string;
}

/**
 * Fund Virtual Card API
 * Adds funds to an existing virtual card after payment verification
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FundCardResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { cardId, paymentReference, userAddress }: FundCardRequest = req.body;

    // Validate required fields
    if (!cardId || !paymentReference || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: cardId, paymentReference, userAddress'
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }

    console.log('Funding card:', {
      cardId,
      paymentReference,
      userAddress: userAddress.substring(0, 10) + '...'
    });

    // Step 1: Verify payment
    const paymentVerification = await verifyPaymentForFunding(paymentReference, userAddress);
    
    if (!paymentVerification.success) {
      return res.status(400).json({
        success: false,
        error: paymentVerification.error || 'Payment verification failed'
      });
    }

    // Step 2: Get current card details
    const cardDetails = await getCardDetails(cardId, userAddress);
    
    if (!cardDetails.success) {
      return res.status(404).json({
        success: false,
        error: cardDetails.error || 'Card not found'
      });
    }

    // Step 3: Calculate platform fee (0.02%)
    const platformFee = (paymentVerification.amount! * 2) / 10000;
    const fundingAmount = paymentVerification.amount! - platformFee;

    // Step 4: Update card balance in smart contract
    const contractResult = await fundCardInContract({
      userAddress,
      cardId,
      paymentReference,
      fundingAmount,
      paymentMethod: paymentVerification.paymentMethod!
    });

    if (!contractResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fund card in smart contract: ' + contractResult.error
      });
    }

    // Step 5: Update database record
    const newBalance = cardDetails.currentBalance! + fundingAmount;
    
    await updateCardBalanceInDatabase(cardId, userAddress, newBalance);

    // Step 6: Record transaction
    await recordCardTransaction({
      cardId,
      userAddress,
      type: 'fund',
      amount: fundingAmount,
      currency: paymentVerification.currency!,
      description: `Card funding via ${paymentVerification.paymentMethod}`,
      reference: paymentReference
    });

    console.log('Card funded successfully:', {
      cardId,
      fundingAmount,
      newBalance,
      paymentReference
    });

    res.status(200).json({
      success: true,
      newBalance,
      fundingAmount,
      message: `Card funded successfully with ${fundingAmount} ${paymentVerification.currency}`
    });

  } catch (error) {
    console.error('Card funding error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

/**
 * Verify payment for card funding
 */
async function verifyPaymentForFunding(
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
 * Get card details
 */
async function getCardDetails(
  cardId: number, 
  userAddress: string
): Promise<{
  success: boolean;
  currentBalance?: number;
  error?: string;
}> {
  try {
    // In a real implementation, this would query the database/contract
    // For simulation, we'll return mock data
    
    // Simulate database/contract lookup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate card exists (90% of the time)
    const cardExists = Math.random() > 0.1;
    
    if (cardExists) {
      const currentBalance = Math.floor(Math.random() * 1000) + 100; // Random balance between 100-1100
      
      return {
        success: true,
        currentBalance
      };
    } else {
      return {
        success: false,
        error: 'Card not found or not owned by user'
      };
    }
    
  } catch (error) {
    console.error('Card lookup error:', error);
    return {
      success: false,
      error: 'Failed to retrieve card details'
    };
  }
}

/**
 * Fund card in smart contract
 */
async function fundCardInContract(data: {
  userAddress: string;
  cardId: number;
  paymentReference: string;
  fundingAmount: number;
  paymentMethod: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Simulate contract call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Simulated contract funding:', {
      userAddress: data.userAddress,
      cardId: data.cardId,
      fundingAmount: data.fundingAmount,
      paymentReference: data.paymentReference,
      paymentMethod: data.paymentMethod
    });

    // Simulate success (95% success rate)
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Contract transaction failed'
      };
    }
    
  } catch (error) {
    console.error('Contract funding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Contract error'
    };
  }
}

/**
 * Update card balance in database
 */
async function updateCardBalanceInDatabase(
  cardId: number,
  userAddress: string,
  newBalance: number
): Promise<void> {
  try {
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Database balance updated:', {
      cardId,
      userAddress,
      newBalance
    });
    
  } catch (error) {
    console.error('Database update error:', error);
    throw new Error('Failed to update card balance in database');
  }
}

/**
 * Record card transaction
 */
async function recordCardTransaction(data: {
  cardId: number;
  userAddress: string;
  type: 'fund' | 'spend' | 'refund' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  reference: string;
}): Promise<void> {
  try {
    // Simulate transaction recording
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Transaction recorded:', {
      cardId: data.cardId,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      reference: data.reference
    });
    
  } catch (error) {
    console.error('Transaction recording error:', error);
    // Don't throw error as this is not critical for the funding operation
  }
}
