#!/usr/bin/env node

/**
 * Environment Setup Script for MorphCash
 * This script helps users set up their .env.local file
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

// Generate a secure encryption key
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('base64');
}

// Create .env.local file with placeholder values
function createEnvFile() {
  const envContent = `# =============================================================================
# MorphCash Environment Configuration
# =============================================================================
# This file contains environment variables for local development
# DO NOT commit this file to version control

# =============================================================================
# SUPABASE CONFIGURATION (REQUIRED)
# =============================================================================
# For development, we'll use placeholder values
# In production, replace with your actual Supabase project values

# Supabase Project URL (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous/Public Key (required)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Project ID (optional, for some features)
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-project-id

# =============================================================================
# DATABASE CONFIGURATION (for compatibility)
# =============================================================================
# These should match your Supabase values for compatibility

# Database URL (should match Supabase URL)
NEXT_PUBLIC_DATABASE_URL=https://your-project-id.supabase.co

# Database API Key (should match Supabase anon key)
NEXT_PUBLIC_DATABASE_API_KEY=your-anon-key-here

# Database Project ID (optional)
NEXT_PUBLIC_DATABASE_PROJECT_ID=your-project-id

# Database Region (optional)
NEXT_PUBLIC_DATABASE_REGION=us-east-1

# =============================================================================
# ENCRYPTION CONFIGURATION (REQUIRED)
# =============================================================================
# Generated secure encryption key for sensitive data

# Encryption Key for sensitive data (required)
NEXT_PUBLIC_ENCRYPTION_KEY=${generateEncryptionKey()}

# =============================================================================
# APPLICATION FEATURES
# =============================================================================
# Enable/disable various features

# Enable caching for better performance (default: true)
NEXT_PUBLIC_ENABLE_CACHING=true

# Cache timeout in milliseconds (default: 300000 = 5 minutes)
NEXT_PUBLIC_CACHE_TIMEOUT=300000

# Enable analytics (default: true)
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Enable real-time features (default: true)
NEXT_PUBLIC_ENABLE_REALTIME=true

# =============================================================================
# BLOCKCHAIN CONFIGURATION
# =============================================================================
# Your existing blockchain configuration

# Target network (default: localhost)
NEXT_PUBLIC_TARGET_NETWORK=localhost

# Chain ID (default: 31337 for localhost)
NEXT_PUBLIC_CHAIN_ID=31337

# =============================================================================
# DEVELOPMENT CONFIGURATION
# =============================================================================
# Settings for development environment

# Debug mode (default: false)
NEXT_PUBLIC_DEBUG_MODE=true

# Log level (default: info)
NEXT_PUBLIC_LOG_LEVEL=info

# API base URL (default: auto-detected)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# =============================================================================
# FEATURE FLAGS
# =============================================================================
# Enable/disable specific features

# Enable virtual card creation
NEXT_PUBLIC_ENABLE_VIRTUAL_CARDS=true

# Enable ENS integration
NEXT_PUBLIC_ENABLE_ENS=true

# Enable KYC verification
NEXT_PUBLIC_ENABLE_KYC=true

# Enable real-time notifications
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Enable dark mode
NEXT_PUBLIC_ENABLE_DARK_MODE=true

# Enable multi-language support
NEXT_PUBLIC_ENABLE_I18N=false

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
# Security-related settings

# Session timeout in milliseconds (default: 7 days)
NEXT_PUBLIC_SESSION_TIMEOUT=604800000

# Maximum login attempts before lockout
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5

# =============================================================================
# API RATE LIMITING
# =============================================================================
# Rate limiting configuration

# API rate limit (requests per minute)
NEXT_PUBLIC_API_RATE_LIMIT=100

# Database rate limit (queries per minute)
NEXT_PUBLIC_DB_RATE_LIMIT=1000

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
# CORS settings for API access

# Allowed origins (comma-separated)
NEXT_PUBLIC_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# =============================================================================
# BACKUP CONFIGURATION
# =============================================================================
# Database backup settings

# Enable automatic backups
NEXT_PUBLIC_ENABLE_BACKUPS=true

# Backup frequency (in hours)
NEXT_PUBLIC_BACKUP_FREQUENCY=24

# =============================================================================
# TESTING CONFIGURATION
# =============================================================================
# Testing and development settings

# Enable test mode
NEXT_PUBLIC_TEST_MODE=true

# Test user email
NEXT_PUBLIC_TEST_USER_EMAIL=test@example.com

# Test wallet address
NEXT_PUBLIC_TEST_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with placeholder values');
    console.log('📝 Please update the Supabase configuration with your actual values');
    console.log('🔗 See ENVIRONMENT_SETUP.md for detailed instructions');
    return true;
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🚀 Setting up MorphCash environment...\n');

  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local file already exists');
    console.log('   If you want to recreate it, delete the existing file first');
    return;
  }

  // Create .env.local file
  const success = createEnvFile();
  
  if (success) {
    console.log('\n🎉 Environment setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up a Supabase project at https://supabase.com');
    console.log('   2. Update the Supabase configuration in .env.local');
    console.log('   3. Run "yarn start" to start the development server');
    console.log('\n📖 For detailed instructions, see ENVIRONMENT_SETUP.md');
  } else {
    console.log('\n❌ Environment setup failed');
    console.log('   Please check the error messages above and try again');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createEnvFile, generateEncryptionKey };
