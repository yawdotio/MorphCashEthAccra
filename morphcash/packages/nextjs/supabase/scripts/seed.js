/**
 * Supabase Seed Script
 * Populates the database with sample data for development
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('🌱 Seeding MorphCash database...');
  
  try {
    // Create sample users
    console.log('👤 Creating sample users...');
    const users = await createSampleUsers();
    
    if (users.length === 0) {
      console.log('⚠️  No users created. Database might already be seeded.');
      return true;
    }
    
    // Create sample virtual cards
    console.log('💳 Creating sample virtual cards...');
    await createSampleVirtualCards(users);
    
    // Create sample transactions
    console.log('💰 Creating sample transactions...');
    await createSampleTransactions(users);
    
    // Create sample payment methods
    console.log('🏦 Creating sample payment methods...');
    await createSamplePaymentMethods(users);
    
    console.log('✅ Database seeded successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    return false;
  }
}

async function createSampleUsers() {
  const sampleUsers = [
    {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      ens_name: 'vitalik.eth',
      email: 'vitalik@example.com',
      account_type: 'premium',
      auth_method: 'ens',
      ens_profile: {
        displayName: 'Vitalik Buterin',
        bio: 'Ethereum Founder and Researcher',
        avatar: 'https://avatars.githubusercontent.com/u/552656?v=4',
        website: 'https://vitalik.ca',
        twitter: 'VitalikButerin',
        github: 'vitalik',
        discord: '',
        telegram: '',
        isVerified: true
      },
      preferences: {
        theme: 'dark',
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false
        },
        privacy: {
          showBalance: true,
          showTransactions: true,
          allowAnalytics: true
        }
      }
    },
    {
      address: '0x8ba1f109551bD432803012645Hac136c',
      ens_name: 'alice.eth',
      email: 'alice@example.com',
      account_type: 'basic',
      auth_method: 'ens',
      ens_profile: {
        displayName: 'Alice',
        bio: 'Crypto Enthusiast and Developer',
        avatar: '',
        website: 'https://alice.dev',
        twitter: 'alice_crypto',
        github: 'alice',
        discord: 'alice#1234',
        telegram: '@alice_crypto',
        isVerified: false
      },
      preferences: {
        theme: 'light',
        currency: 'EUR',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          sms: false,
          marketing: true
        },
        privacy: {
          showBalance: false,
          showTransactions: true,
          allowAnalytics: false
        }
      }
    },
    {
      address: '0x1234567890123456789012345678901234567890',
      ens_name: 'bob.eth',
      email: 'bob@example.com',
      account_type: 'enterprise',
      auth_method: 'wallet',
      ens_profile: {
        displayName: 'Bob Smith',
        bio: 'Enterprise User',
        avatar: '',
        website: 'https://bobcorp.com',
        twitter: 'bob_smith',
        github: 'bobsmith',
        discord: '',
        telegram: '',
        isVerified: true
      },
      preferences: {
        theme: 'auto',
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: true,
          marketing: false
        },
        privacy: {
          showBalance: true,
          showTransactions: false,
          allowAnalytics: true
        }
      }
    }
  ];
  
  const createdUsers = [];
  
  for (const user of sampleUsers) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      console.warn('⚠️  Warning: Could not create user:', error.message);
    } else {
      createdUsers.push(data);
      console.log(`✅ Created user: ${user.ens_name || user.email}`);
    }
  }
  
  return createdUsers;
}

async function createSampleVirtualCards(users) {
  const sampleCards = [
    {
      user_id: users[0].id,
      card_id: 1,
      card_name: 'Vitalik Main Card',
      card_number: '****1234',
      expiry_date: '12/26',
      card_type: 'Visa',
      spending_limit: 100000, // $1000 in cents
      current_spend: 25000, // $250 in cents
      is_active: true,
      on_chain_tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    {
      user_id: users[0].id,
      card_id: 2,
      card_name: 'Vitalik Travel Card',
      card_number: '****5678',
      expiry_date: '08/27',
      card_type: 'Mastercard',
      spending_limit: 50000, // $500 in cents
      current_spend: 0,
      is_active: true,
      on_chain_tx_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    },
    {
      user_id: users[1].id,
      card_id: 3,
      card_name: 'Alice Shopping Card',
      card_number: '****9012',
      expiry_date: '06/26',
      card_type: 'Visa',
      spending_limit: 25000, // $250 in cents
      current_spend: 15000, // $150 in cents
      is_active: true,
      on_chain_tx_hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
    }
  ];
  
  for (const card of sampleCards) {
    const { error } = await supabase
      .from('virtual_cards')
      .insert(card);
    
    if (error) {
      console.warn('⚠️  Warning: Could not create virtual card:', error.message);
    } else {
      console.log(`✅ Created virtual card: ${card.card_name}`);
    }
  }
}

async function createSampleTransactions(users) {
  const sampleTransactions = [
    {
      user_id: users[0].id,
      card_id: users[0].id, // This would be the actual card ID in a real scenario
      type: 'payment',
      amount: 5000, // $50 in cents
      currency: 'USD',
      description: 'Coffee at Starbucks',
      merchant_name: 'Starbucks',
      merchant_address: '123 Main St, San Francisco, CA',
      status: 'completed',
      tx_hash: '0x1111111111111111111111111111111111111111111111111111111111111111'
    },
    {
      user_id: users[0].id,
      card_id: users[0].id,
      type: 'payment',
      amount: 15000, // $150 in cents
      currency: 'USD',
      description: 'Grocery shopping',
      merchant_name: 'Whole Foods',
      merchant_address: '456 Market St, San Francisco, CA',
      status: 'completed',
      tx_hash: '0x2222222222222222222222222222222222222222222222222222222222222222'
    },
    {
      user_id: users[1].id,
      card_id: users[1].id,
      type: 'payment',
      amount: 2500, // $25 in cents
      currency: 'EUR',
      description: 'Lunch at restaurant',
      merchant_name: 'Café de la Paix',
      merchant_address: '789 Champs-Élysées, Paris, France',
      status: 'completed',
      tx_hash: '0x3333333333333333333333333333333333333333333333333333333333333333'
    },
    {
      user_id: users[1].id,
      card_id: users[1].id,
      type: 'payment',
      amount: 10000, // $100 in cents
      currency: 'EUR',
      description: 'Online shopping',
      merchant_name: 'Amazon',
      merchant_address: 'Online',
      status: 'pending',
      tx_hash: null
    }
  ];
  
  for (const transaction of sampleTransactions) {
    const { error } = await supabase
      .from('transactions')
      .insert(transaction);
    
    if (error) {
      console.warn('⚠️  Warning: Could not create transaction:', error.message);
    } else {
      console.log(`✅ Created transaction: ${transaction.description}`);
    }
  }
}

async function createSamplePaymentMethods(users) {
  const samplePaymentMethods = [
    {
      user_id: users[0].id,
      type: 'credit_card',
      encrypted_data: 'encrypted_credit_card_data_here',
      last4: '1234',
      brand: 'Visa',
      is_default: true,
      is_active: true
    },
    {
      user_id: users[0].id,
      type: 'bank_account',
      encrypted_data: 'encrypted_bank_account_data_here',
      last4: '5678',
      brand: 'Chase',
      is_default: false,
      is_active: true
    },
    {
      user_id: users[1].id,
      type: 'credit_card',
      encrypted_data: 'encrypted_credit_card_data_here',
      last4: '9012',
      brand: 'Mastercard',
      is_default: true,
      is_active: true
    }
  ];
  
  for (const paymentMethod of samplePaymentMethods) {
    const { error } = await supabase
      .from('payment_methods')
      .insert(paymentMethod);
    
    if (error) {
      console.warn('⚠️  Warning: Could not create payment method:', error.message);
    } else {
      console.log(`✅ Created payment method: ${paymentMethod.brand} ****${paymentMethod.last4}`);
    }
  }
}

async function main() {
  console.log('🌱 MorphCash Database Seeding');
  console.log('==============================');
  
  const success = await seedDatabase();
  
  if (success) {
    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample data includes:');
    console.log('- 3 users (Vitalik, Alice, Bob)');
    console.log('- 3 virtual cards');
    console.log('- 4 transactions');
    console.log('- 3 payment methods');
  } else {
    console.log('\n❌ Seeding failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run seeding
main().catch(console.error);
