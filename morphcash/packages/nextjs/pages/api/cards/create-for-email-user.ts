import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Contract ABI (simplified for createVirtualCardForUser)
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "string", "name": "cardName", "type": "string"},
      {"internalType": "string", "name": "cardNumber", "type": "string"},
      {"internalType": "string", "name": "cardType", "type": "string"},
      {"internalType": "uint256", "name": "spendingLimit", "type": "uint256"}
    ],
    "name": "createVirtualCardForUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      userId, 
      cardName, 
      cardNumber, 
      cardType, 
      spendingLimit,
      token 
    } = req.body;

    // Validate required fields
    if (!userId || !cardName || !cardNumber || !cardType || !spendingLimit || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the user exists and get their session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Verify the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For email users, we need to create a temporary address or use a system address
    // For now, let's create the card directly in the database since the contract
    // requires a wallet address which email users don't have
    
    // Generate card data
    const cardData = {
      user_id: userId,
      card_id: Date.now(), // Simple ID generation
      card_name: cardName,
      card_number: cardNumber,
      expiry_date: generateExpiryDate(),
      card_type: cardType,
      spending_limit: spendingLimit,
      current_spend: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create card in database
    const { data: card, error: cardError } = await supabase
      .from('virtual_cards')
      .insert(cardData)
      .select()
      .single();

    if (cardError) {
      console.error('Database error:', cardError);
      return res.status(500).json({ error: 'Failed to create card in database' });
    }

    // Update session last used
    await supabase
      .from('sessions')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', token);

    return res.status(200).json({ 
      success: true, 
      data: card,
      message: 'Card created successfully' 
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateExpiryDate(): string {
  const now = new Date();
  const expiryYear = now.getFullYear() + 3;
  const expiryMonth = now.getMonth() + 1;
  return `${expiryMonth.toString().padStart(2, '0')}/${expiryYear.toString().slice(-2)}`;
}
