import type { NextApiRequest, NextApiResponse } from 'next';

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * MTN Mobile Money Authentication API
 * Creates OAuth2 token for API access according to MTN MoMo API documentation
 * @see https://momodeveloper.mtn.com/api-documentation/api-description
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed', 
      message: 'Only POST method is allowed' 
    });
  }

  try {
    // Get environment variables
    const subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY;
    const apiUserId = process.env.MTN_API_USER_ID;
    const apiKey = process.env.MTN_API_KEY;
    const environment = process.env.MTN_ENVIRONMENT || 'sandbox';

    if (!subscriptionKey || !apiUserId || !apiKey) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'MTN API credentials not configured. Please check your environment variables.'
      });
    }

    // Determine base URL based on environment
    const baseUrl = environment === 'sandbox' 
      ? 'https://sandbox.momodeveloper.mtn.com'
      : 'https://momodeveloper.mtn.com';

    // Create basic auth header (API User ID:API Key)
    const credentials = Buffer.from(`${apiUserId}:${apiKey}`).toString('base64');

    console.log('MTN Auth Request:', {
      url: `${baseUrl}/collection/token/`,
      environment,
      apiUserId: apiUserId.substring(0, 8) + '...' // Log partial for debugging
    });

    // Request access token from MTN Collections API
    const response = await fetch(`${baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'X-Target-Environment': environment,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MTN Auth Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return res.status(response.status).json({
        error: 'Authentication Failed',
        message: `Failed to obtain access token: ${response.status} ${response.statusText}`
      });
    }

    const tokenData: AuthResponse = await response.json();
    
    console.log('MTN Auth Success:', {
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in
    });
    
    res.status(200).json(tokenData);
  } catch (error) {
    console.error('MTN Auth Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
