import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

interface PaymentRequest {
  amount: number;
  currency: string;
  externalId: string;
  phoneNumber: string;
  payerMessage?: string;
  payeeNote?: string;
}

interface PaymentResponse {
  success: boolean;
  referenceId?: string;
  message?: string;
  externalId?: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
}

/**
 * MTN Mobile Money Payment Request API
 * Creates a requestToPay transaction according to MTN MoMo API documentation
 * @see https://momodeveloper.mtn.com/api-documentation/api-description
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Only POST method is allowed' 
    });
  }

  try {
    const { amount, currency, externalId, phoneNumber, payerMessage, payeeNote }: PaymentRequest = req.body;

    // Validate required fields
    if (!amount || !currency || !externalId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, currency, externalId, phoneNumber'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Validate phone number format (basic validation)
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (cleanPhoneNumber.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    console.log('MTN Payment Request:', {
      amount,
      currency,
      externalId,
      phoneNumber: phoneNumber.substring(0, 6) + '...' // Log partial for privacy
    });

    // Get access token
    const protocol = req.headers.host?.includes('localhost') ? 'http' : 'https';
    const authResponse = await fetch(`${protocol}://${req.headers.host}/api/mtn/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!authResponse.ok) {
      const authError = await authResponse.json();
      console.error('MTN Auth Error:', authError);
      return res.status(500).json({
        success: false,
        message: 'Failed to authenticate with MTN API',
        code: 'AUTH_FAILED'
      });
    }

    const { access_token } = await authResponse.json();

    // Create payment request
    const referenceId = uuidv4();
    const subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY;
    const environment = process.env.MTN_ENVIRONMENT || 'sandbox';
    
    const baseUrl = environment === 'sandbox' 
      ? 'https://sandbox.momodeveloper.mtn.com'
      : 'https://momodeveloper.mtn.com';

    // Prepare payment payload according to MTN API specification
    const paymentPayload = {
      amount: amount.toString(),
      currency,
      externalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber
      },
      payerMessage: payerMessage || `Payment for virtual card funding - ${externalId}`,
      payeeNote: payeeNote || `MorphCash virtual card payment - ${externalId}`
    };

    console.log('MTN Payment Payload:', {
      ...paymentPayload,
      payer: {
        ...paymentPayload.payer,
        partyId: paymentPayload.payer.partyId.substring(0, 6) + '...'
      }
    });

    // Send payment request to MTN Collections API
    const paymentResponse = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey!,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': environment,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentPayload)
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('MTN Payment Request Error:', {
        status: paymentResponse.status,
        statusText: paymentResponse.statusText,
        body: errorText
      });

      let errorMessage = 'Payment request failed';
      let errorCode = 'PAYMENT_REQUEST_FAILED';

      // Handle specific MTN error codes
      if (paymentResponse.status === 400) {
        errorMessage = 'Invalid payment details. Please check your information.';
        errorCode = 'INVALID_REQUEST';
      } else if (paymentResponse.status === 401) {
        errorMessage = 'Authentication failed. Please try again.';
        errorCode = 'UNAUTHORIZED';
      } else if (paymentResponse.status === 409) {
        errorMessage = 'Duplicate transaction. Please use a different reference.';
        errorCode = 'DUPLICATE_TRANSACTION';
      } else if (paymentResponse.status === 500) {
        errorMessage = 'MTN service temporarily unavailable. Please try again later.';
        errorCode = 'SERVICE_UNAVAILABLE';
      }

      return res.status(paymentResponse.status).json({
        success: false,
        message: errorMessage,
        code: errorCode
      });
    }

    console.log('MTN Payment Request Success:', {
      referenceId,
      externalId,
      status: 'PENDING'
    });

    res.status(200).json({
      success: true,
      referenceId,
      externalId,
      message: 'Payment request created successfully'
    });
  } catch (error) {
    console.error('MTN Payment Request Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'INTERNAL_ERROR'
    });
  }
}
