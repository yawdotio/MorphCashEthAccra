/**
 * Simple verification script for Coinbase API setup
 * Run with: node verify-coinbase-setup.js
 */

require('dotenv').config({ path: '.env.local' });

async function verifySetup() {
  console.log('🔍 Verifying Coinbase API Setup...');
  console.log('');

  // Check environment variables
  const apiKey = process.env.NEXT_PUBLIC_COINBASE_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_COINBASE_BASE_URL || 'https://api.coinbase.com';
  const environment = process.env.NEXT_PUBLIC_COINBASE_ENVIRONMENT || 'sandbox';

  console.log('📋 Environment Variables:');
  console.log(`  API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Environment: ${environment}`);
  console.log('');

  if (!apiKey) {
    console.log('⚠️  Note: API key is not required for basic exchange rates');
    console.log('   The public Coinbase API works without authentication');
  }

  // Test exchange rates API
  try {
    console.log('🔄 Testing exchange rates API...');
    const response = await fetch(`${baseUrl}/v2/exchange-rates?currency=USD`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Exchange rates API is working');
      console.log(`📊 Sample rates:`);
      console.log(`  1 USD = ${data.data.rates.ETH} ETH`);
      console.log(`  1 USD = ${data.data.rates.USDC} USDC`);
      console.log(`  1 USD = ${data.data.rates.GHS} GHS`);
    } else {
      console.log('❌ Exchange rates API failed');
    }
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }

  console.log('');
  console.log('🎯 Next Steps:');
  console.log('1. Start your development server: yarn start');
  console.log('2. Open the crypto payment modal');
  console.log('3. Check browser console for Coinbase logs');
  console.log('4. Verify crypto payment options appear');
  console.log('');
  console.log('✅ Setup verification complete!');
}

verifySetup();
