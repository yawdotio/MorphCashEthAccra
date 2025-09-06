#!/usr/bin/env node

/**
 * MorphCash Environment Setup Script
 * Helps users configure their environment variables for the application
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_FILE_PATH = path.join(__dirname, '..', '.env.local');
const EXAMPLE_FILE_PATH = path.join(__dirname, '..', 'env.example');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorText(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log(colorText('\n🚀 Welcome to MorphCash Environment Setup!\n', 'cyan'));
  console.log('This script will help you configure your environment variables.');
  console.log('You can skip any step by pressing Enter (default values will be used).\n');

  // Check if .env.local already exists
  if (fs.existsSync(ENV_FILE_PATH)) {
    console.log(colorText('⚠️  .env.local file already exists!', 'yellow'));
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log(colorText('👋 Setup cancelled. Your existing .env.local file is unchanged.', 'blue'));
      rl.close();
      return;
    }
  }

  const envVars = {};

  console.log(colorText('\n📦 BLOCKCHAIN CONFIGURATION', 'magenta'));
  console.log('Configure blockchain and Web3 settings for the application.');

  // WalletConnect Project ID
  console.log(colorText('\n🔗 WalletConnect Project ID', 'cyan'));
  console.log('Get your project ID from: https://cloud.walletconnect.com');
  envVars.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = await question('Enter your WalletConnect Project ID (default: 3a8170812b534d0ff9d794f19a901d64): ') || '3a8170812b534d0ff9d794f19a901d64';

  // Alchemy API Key
  console.log(colorText('\n⚡ Alchemy API Key', 'cyan'));
  console.log('Get your API key from: https://dashboard.alchemyapi.io');
  envVars.NEXT_PUBLIC_ALCHEMY_API_KEY = await question('Enter your Alchemy API Key (default: oKxs-03sij-U_N0iOlrSsZFr29-IqbuF): ') || 'oKxs-03sij-U_N0iOlrSsZFr29-IqbuF';

  console.log(colorText('\n🗃️  DATABASE CONFIGURATION (REQUIRED)', 'magenta'));
  console.log('MorphCash requires Supabase for persistent data storage.');

  const dbChoice = await question('\nWould you like to configure Supabase now?\n1. Yes, I have Supabase credentials\n2. No, I\'ll set it up later\nChoose (1-2, default: 1): ') || '1';

  if (dbChoice === '1') {
    // Supabase Configuration
    console.log(colorText('\n🚀 Supabase Configuration', 'cyan'));
    console.log('Sign up at: https://supabase.com');
    console.log('Create a new project and get your URL and API key from Settings > API.');
    
    envVars.NEXT_PUBLIC_SUPABASE_URL = await question('Enter your Supabase URL (https://your-project.supabase.co): ');
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = await question('Enter your Supabase Anonymous Key: ');
    
    if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log(colorText('❌ Supabase credentials are required for MorphCash to work.', 'red'));
      console.log(colorText('Please get your credentials from https://supabase.com and run this script again.', 'yellow'));
      process.exit(1);
    }
  } else {
    console.log(colorText('\n⚠️  Skipping Supabase Setup', 'yellow'));
    console.log('You can set up Supabase later by:');
    console.log('1. Creating an account at https://supabase.com');
    console.log('2. Creating a new project');
    console.log('3. Adding NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
    console.log('4. Running the database schema from supabase/schema.sql');
    
    // Create empty file with instructions
    envVars.NEXT_PUBLIC_SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
  }

  // Encryption Key
  console.log(colorText('\n🔐 Security Configuration', 'cyan'));
  const encryptionKey = await question('Enter a 32-character encryption key (or press Enter to generate one): ');
  if (encryptionKey && encryptionKey.length >= 32) {
    envVars.NEXT_PUBLIC_ENCRYPTION_KEY = encryptionKey;
  } else {
    // Generate a random 32-character key
    const randomKey = require('crypto').randomBytes(16).toString('hex');
    envVars.NEXT_PUBLIC_ENCRYPTION_KEY = randomKey;
    console.log(colorText(`Generated encryption key: ${randomKey}`, 'green'));
  }

  console.log(colorText('\n💰 MTN MOBILE MONEY CONFIGURATION (Optional)', 'magenta'));
  console.log('Configure MTN Mobile Money integration for payments.');
  
  const configureMTN = await question('\nDo you want to configure MTN Mobile Money? (y/N): ');
  if (configureMTN.toLowerCase() === 'y' || configureMTN.toLowerCase() === 'yes') {
    console.log(colorText('\n📱 MTN Collections API', 'cyan'));
    console.log('Sign up at: https://momodeveloper.mtn.com');
    console.log('Subscribe to the Collections API and create API credentials.');
    
    envVars.MTN_SUBSCRIPTION_KEY = await question('Enter your MTN Subscription Key: ');
    envVars.MTN_API_USER_ID = await question('Enter your MTN API User ID: ');
    envVars.MTN_API_KEY = await question('Enter your MTN API Key: ');
    envVars.MTN_ENVIRONMENT = await question('Enter environment (sandbox/production, default: sandbox): ') || 'sandbox';
    envVars.MTN_TARGET_ENVIRONMENT = envVars.MTN_ENVIRONMENT;
  }

  // Optional settings
  console.log(colorText('\n⚙️  Optional Settings', 'cyan'));
  const configureOptional = await question('Do you want to configure optional settings? (y/N): ');
  if (configureOptional.toLowerCase() === 'y' || configureOptional.toLowerCase() === 'yes') {
    envVars.NEXT_PUBLIC_ENABLE_CACHING = await question('Enable caching? (true/false, default: true): ') || 'true';
    envVars.NEXT_PUBLIC_CACHE_TIMEOUT = await question('Cache timeout in ms (default: 300000): ') || '300000';
    envVars.NEXT_PUBLIC_ENABLE_ANALYTICS = await question('Enable analytics? (true/false, default: true): ') || 'true';
    envVars.NEXT_PUBLIC_ENABLE_REALTIME = await question('Enable real-time features? (true/false, default: true): ') || 'true';
  }

  // Set NODE_ENV
  envVars.NODE_ENV = 'development';

  // Generate .env.local content
  let envContent = '# MorphCash Environment Configuration\n';
  envContent += '# Generated by setup script\n';
  envContent += `# Created on: ${new Date().toISOString()}\n\n`;

  envContent += '# =============================================================================\n';
  envContent += '# BLOCKCHAIN CONFIGURATION\n';
  envContent += '# =============================================================================\n\n';
  envContent += `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=${envVars.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}\n`;
  envContent += `NEXT_PUBLIC_ALCHEMY_API_KEY=${envVars.NEXT_PUBLIC_ALCHEMY_API_KEY}\n\n`;

  envContent += '# =============================================================================\n';
  envContent += '# DATABASE CONFIGURATION (SUPABASE) - REQUIRED\n';
  envContent += '# =============================================================================\n\n';
  envContent += `NEXT_PUBLIC_SUPABASE_URL=${envVars.NEXT_PUBLIC_SUPABASE_URL}\n`;
  envContent += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}\n`;
  envContent += `NEXT_PUBLIC_ENCRYPTION_KEY=${envVars.NEXT_PUBLIC_ENCRYPTION_KEY}\n\n`;

  if (envVars.MTN_SUBSCRIPTION_KEY) {
    envContent += '# =============================================================================\n';
    envContent += '# MTN MOBILE MONEY CONFIGURATION\n';
    envContent += '# =============================================================================\n\n';
    envContent += `MTN_SUBSCRIPTION_KEY=${envVars.MTN_SUBSCRIPTION_KEY}\n`;
    envContent += `MTN_API_USER_ID=${envVars.MTN_API_USER_ID}\n`;
    envContent += `MTN_API_KEY=${envVars.MTN_API_KEY}\n`;
    envContent += `MTN_ENVIRONMENT=${envVars.MTN_ENVIRONMENT}\n`;
    envContent += `MTN_TARGET_ENVIRONMENT=${envVars.MTN_TARGET_ENVIRONMENT}\n\n`;
  }

  if (envVars.NEXT_PUBLIC_ENABLE_CACHING) {
    envContent += '# =============================================================================\n';
    envContent += '# OPTIONAL CONFIGURATION\n';
    envContent += '# =============================================================================\n\n';
    envContent += `NEXT_PUBLIC_ENABLE_CACHING=${envVars.NEXT_PUBLIC_ENABLE_CACHING}\n`;
    envContent += `NEXT_PUBLIC_CACHE_TIMEOUT=${envVars.NEXT_PUBLIC_CACHE_TIMEOUT}\n`;
    envContent += `NEXT_PUBLIC_ENABLE_ANALYTICS=${envVars.NEXT_PUBLIC_ENABLE_ANALYTICS}\n`;
    envContent += `NEXT_PUBLIC_ENABLE_REALTIME=${envVars.NEXT_PUBLIC_ENABLE_REALTIME}\n\n`;
  }

  envContent += `NODE_ENV=${envVars.NODE_ENV}\n`;

  // Write the .env.local file
  try {
    fs.writeFileSync(ENV_FILE_PATH, envContent);
    console.log(colorText('\n✅ Success! Your .env.local file has been created.', 'green'));
    console.log(colorText(`📁 Location: ${ENV_FILE_PATH}`, 'blue'));
    
    console.log(colorText('\n🎯 Next Steps:', 'cyan'));
    console.log('1. Start the development server: npm run dev');
    console.log('2. Deploy smart contracts: cd ../hardhat && npm run deploy');
    
    if (dbChoice === '1' && envVars.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      console.log('3. Set up Supabase database tables (see SETUP_COMPLETE.md)');
    }
    
    if (envVars.MTN_SUBSCRIPTION_KEY) {
      console.log('4. Test MTN Mobile Money integration');
    }

    console.log('\n📖 For more information, check:');
    console.log('   - ENVIRONMENT_SETUP.md');
    console.log('   - SETUP_COMPLETE.md');
    console.log('   - SIMULATED_CARD_SYSTEM.md');

  } catch (error) {
    console.log(colorText('\n❌ Error creating .env.local file:', 'red'));
    console.log(colorText(error.message, 'red'));
  }

  rl.close();
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log(colorText('\n\n👋 Setup cancelled by user.', 'yellow'));
  rl.close();
  process.exit(0);
});

// Run the script
main().catch(error => {
  console.log(colorText('\n❌ Error during setup:', 'red'));
  console.log(colorText(error.message, 'red'));
  rl.close();
  process.exit(1);
});
