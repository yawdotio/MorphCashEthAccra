import type { NextApiRequest, NextApiResponse } from 'next';

interface StatusResponse {
  success: boolean;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  amount?: number;
  currency?: string;
  financialTransactionId?: string;
  externalId?: string;
  payer?: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage?: string;
  payeeNote?: string;
  reason?: string;
  referenceId?: string;
}

interface ErrorResponse {
  success: false;
  status: 'FAILED';
  message: string;
  code?: string;
}

/**
 * MTN Mobile Money Payment Status Check API
 * Checks the status of a requestToPay transaction according to MTN MoMo API documentation
 * @see https://momodeveloper.mtn.com/api-documentation/api-description
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      status: 'FAILED',
      message: 'Only GET method is allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    const { referenceId } = req.query;

    if (!referenceId || typeof referenceId !== 'string') {
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        message: 'Missing or invalid reference ID',
        code: 'INVALID_REFERENCE_ID'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(referenceId)) {
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        message: 'Invalid reference ID format. Must be a valid UUID.',
        code: 'INVALID_UUID_FORMAT'
      });
    }

    console.log('MTN Status Check Request:', {
      referenceId,
      timestamp: new Date().toISOString()
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
        status: 'FAILED',
        message: 'Failed to authenticate with MTN API',
        code: 'AUTH_FAILED'
      });
    }

    const { access_token } = await authResponse.json();

    // Check payment status
    const subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY;
    const environment = process.env.MTN_ENVIRONMENT || 'sandbox';
    
    const baseUrl = environment === 'sandbox' 
      ? 'https://sandbox.momodeveloper.mtn.com'
      : 'https://momodeveloper.mtn.com';

    console.log('MTN Status Check API Call:', {
      url: `${baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
      environment
    });

    const statusResponse = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey!,
        'X-Target-Environment': environment,
        'Content-Type': 'application/json'
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('MTN Status Check Error:', {
        status: statusResponse.status,
        statusText: statusResponse.statusText,
        body: errorText
      });

      let errorMessage = 'Status check failed';
      let errorCode = 'STATUS_CHECK_FAILED';

      // Handle specific MTN error codes
      if (statusResponse.status === 400) {
        errorMessage = 'Invalid request. Please check the reference ID.';
        errorCode = 'INVALID_REQUEST';
      } else if (statusResponse.status === 401) {
        errorMessage = 'Authentication failed. Please try again.';
        errorCode = 'UNAUTHORIZED';
      } else if (statusResponse.status === 404) {
        errorMessage = 'Payment not found. Please check the reference ID.';
        errorCode = 'PAYMENT_NOT_FOUND';
      } else if (statusResponse.status === 500) {
        errorMessage = 'MTN service temporarily unavailable. Please try again later.';
        errorCode = 'SERVICE_UNAVAILABLE';
      }

      return res.status(statusResponse.status).json({
        success: false,
        status: 'FAILED',
        message: errorMessage,
        code: errorCode
      });
    }

    const statusData = await statusResponse.json();
    
    console.log('MTN Status Check Success:', {
      referenceId,
      status: statusData.status,
      externalId: statusData.externalId,
      amount: statusData.amount
    });

    // Parse the response according to MTN API specification
    const response: StatusResponse = {
      success: true,
      status: statusData.status as 'PENDING' | 'SUCCESSFUL' | 'FAILED',
      referenceId,
      externalId: statusData.externalId
    };

    // Add optional fields if present
    if (statusData.amount) {
      response.amount = parseFloat(statusData.amount);
    }
    
    if (statusData.currency) {
      response.currency = statusData.currency;
    }
    
    if (statusData.financialTransactionId) {
      response.financialTransactionId = statusData.financialTransactionId;
    }
    
    if (statusData.payer) {
      response.payer = {
        partyIdType: statusData.payer.partyIdType,
        partyId: statusData.payer.partyId
      };
    }
    
    if (statusData.payerMessage) {
      response.payerMessage = statusData.payerMessage;
    }
    
    if (statusData.payeeNote) {
      response.payeeNote = statusData.payeeNote;
    }

    // Add reason for failed payments
    if (statusData.status === 'FAILED' && statusData.reason) {
      response.reason = statusData.reason;
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('MTN Status Check Error:', error);
    res.status(500).json({
      success: false,
      status: 'FAILED',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'INTERNAL_ERROR'
    });
  }
}
