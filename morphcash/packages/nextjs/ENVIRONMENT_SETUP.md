# Environment Configuration Guide

This guide will help you set up your `.env.local` file for the MorphCash application with Supabase integration.

## Quick Setup

1. **Create the file**: Create a new file called `.env.local` in the `packages/nextjs/` directory
2. **Copy the template**: Copy the configuration below into your `.env.local` file
3. **Fill in your values**: Replace the placeholder values with your actual API keys and configuration

## Required Configuration

### Supabase Setup (Required)

First, set up your Supabase project:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your Project URL and anon/public key

### Environment Variables Template

Copy this into your `.env.local` file:

```env
# =============================================================================
# MorphCash Environment Configuration
# =============================================================================
# Copy this file and fill in your actual values
# DO NOT commit this file to version control

# =============================================================================
# SUPABASE CONFIGURATION (REQUIRED)
# =============================================================================
# Get these values from your Supabase project dashboard:
# 1. Go to https://supabase.com
# 2. Select your project
# 3. Go to Settings > API
# 4. Copy the Project URL and anon/public key

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
# Generate a secure encryption key for sensitive data
# You can generate one using: openssl rand -base64 32

# Encryption Key for sensitive data (required)
NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-encryption-key-here

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
# OPTIONAL: FILE STORAGE
# =============================================================================
# If you want to use file storage for avatars, documents, etc.

# Cloudinary (for image optimization and storage)
# NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your-cloud-name
# NEXT_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-api-key
# NEXT_PUBLIC_CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# AWS S3 (alternative to Cloudinary)
# NEXT_PUBLIC_AWS_S3_BUCKET=your-s3-bucket-name
# NEXT_PUBLIC_AWS_S3_REGION=us-east-1
# NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-aws-access-key
# NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# =============================================================================
# OPTIONAL: ANALYTICS SERVICES
# =============================================================================
# Add analytics services for user tracking

# Mixpanel (for user analytics)
# NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token

# PostHog (open-source analytics)
# NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics
# NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# =============================================================================
# OPTIONAL: EXTERNAL SERVICES
# =============================================================================
# Additional services you might want to integrate

# Email service (for notifications)
# NEXT_PUBLIC_EMAIL_SERVICE_URL=https://api.emailservice.com
# NEXT_PUBLIC_EMAIL_API_KEY=your-email-api-key

# SMS service (for notifications)
# NEXT_PUBLIC_SMS_SERVICE_URL=https://api.smsservice.com
# NEXT_PUBLIC_SMS_API_KEY=your-sms-api-key

# Payment processing (if not using smart contracts)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
# NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_test_your-stripe-secret

# =============================================================================
# DEVELOPMENT CONFIGURATION
# =============================================================================
# Settings for development environment

# Debug mode (default: false)
NEXT_PUBLIC_DEBUG_MODE=false

# Log level (default: info)
NEXT_PUBLIC_LOG_LEVEL=info

# API base URL (default: auto-detected)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
# Security-related settings

# JWT secret for session tokens (if using custom auth)
# NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-here

# Session timeout in milliseconds (default: 7 days)
NEXT_PUBLIC_SESSION_TIMEOUT=604800000

# Maximum login attempts before lockout
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5

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
# LEGAL CONFIGURATION
# =============================================================================
# Legal and compliance settings

# Terms of service URL
# NEXT_PUBLIC_TERMS_URL=https://your-domain.com/terms

# Privacy policy URL
# NEXT_PUBLIC_PRIVACY_URL=https://your-domain.com/privacy

# Cookie policy URL
# NEXT_PUBLIC_COOKIE_URL=https://your-domain.com/cookies

# =============================================================================
# SUPPORT CONFIGURATION
# =============================================================================
# Support and contact information

# Support email
# NEXT_PUBLIC_SUPPORT_EMAIL=support@your-domain.com

# Support phone
# NEXT_PUBLIC_SUPPORT_PHONE=+1-555-123-4567

# Help center URL
# NEXT_PUBLIC_HELP_URL=https://help.your-domain.com

# =============================================================================
# SOCIAL MEDIA CONFIGURATION
# =============================================================================
# Social media links and configuration

# Twitter handle
# NEXT_PUBLIC_TWITTER_HANDLE=@your-handle

# Discord invite
# NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/your-invite

# Telegram group
# NEXT_PUBLIC_TELEGRAM_GROUP=https://t.me/your-group

# =============================================================================
# MARKETING CONFIGURATION
# =============================================================================
# Marketing and promotional settings

# Enable marketing emails
NEXT_PUBLIC_ENABLE_MARKETING=true

# Enable promotional banners
NEXT_PUBLIC_ENABLE_PROMOTIONS=true

# Referral program enabled
NEXT_PUBLIC_ENABLE_REFERRALS=true

# =============================================================================
# TESTING CONFIGURATION
# =============================================================================
# Testing and development settings

# Enable test mode
NEXT_PUBLIC_TEST_MODE=false

# Test user email
NEXT_PUBLIC_TEST_USER_EMAIL=test@example.com

# Test wallet address
NEXT_PUBLIC_TEST_WALLET_ADDRESS=0x1234567890123456789012345678901234567890

# =============================================================================
# VISA API CONFIGURATION (REQUIRED FOR VIRTUAL CARDS)
# =============================================================================
# Get these values from your Visa Developer Portal:
# 1. Go to https://developer.visa.com
# 2. Create a developer account
# 3. Create a new project
# 4. Go to Settings > API
# 5. Copy your API credentials

# Visa API Base URL (required for virtual cards)
NEXT_PUBLIC_VISA_API_BASE_URL=https://sandbox.api.visa.com

# Visa API Key (required)
NEXT_PUBLIC_VISA_API_KEY=your-visa-api-key-here

# Visa Client ID (required)
NEXT_PUBLIC_VISA_CLIENT_ID=your-visa-client-id-here

# Visa Buyer ID (required)
NEXT_PUBLIC_VISA_BUYER_ID=your-visa-buyer-id-here

# Visa Proxy Pool ID (optional)
NEXT_PUBLIC_VISA_PROXY_POOL_ID=your-visa-proxy-pool-id-here

# =============================================================================
# SMART CONTRACT CONFIGURATION (REQUIRED FOR VISA CARDS)
# =============================================================================
# Smart contract configuration for Visa card integration

# Visa Contract Address (required)
NEXT_PUBLIC_VISA_CONTRACT_ADDRESS=0x...

# Visa Contract Private Key (required for backend)
VISA_CONTRACT_PRIVATE_KEY=your-contract-private-key-here

# =============================================================================
# MTN MOBILE MONEY API CONFIGURATION (REQUIRED FOR MOMO PAYMENTS)
# =============================================================================
# Get these values from MTN MoMo Developer Portal:
# 1. Go to https://momodeveloper.mtn.com
# 2. Create a developer account
# 3. Subscribe to Collections API
# 4. Create API User and generate API Key
# 5. Copy your subscription key from the Collections API subscription

# MTN Subscription Key (Primary key from your Collections API subscription)
MTN_SUBSCRIPTION_KEY=your-mtn-subscription-key-here

# MTN API User ID (UUID format, created via MTN Developer Portal)
MTN_API_USER_ID=your-api-user-id-here

# MTN API Key (generated for your API User)
MTN_API_KEY=your-api-key-here

# MTN Environment (sandbox for testing, production for live)
MTN_ENVIRONMENT=sandbox

# MTN Target Environment (for API headers, usually same as MTN_ENVIRONMENT)
MTN_TARGET_ENVIRONMENT=sandbox

# =============================================================================
# PAYMENT PROVIDER CONFIGURATION (LEGACY - FOR OTHER PROVIDERS)
# =============================================================================
# Other payment verification services (optional)

# Generic Mobile Money API (for non-MTN providers)
# NEXT_PUBLIC_MOMO_API_URL=https://api.momo-provider.com
# NEXT_PUBLIC_MOMO_API_KEY=your-momo-api-key-here

# Crypto Payment API (required for crypto payments)
NEXT_PUBLIC_CRYPTO_API_URL=https://api.crypto-provider.com
NEXT_PUBLIC_CRYPTO_API_KEY=your-crypto-api-key-here

# =============================================================================
# END OF CONFIGURATION
# =============================================================================
# Remember to:
# 1. Fill in all required values (marked as "required")
# 2. Set optional values as needed
# 3. Never commit this file to version control
# 4. Use different values for development and production
# 5. Keep your API keys secure and rotate them regularly
# 6. For Visa cards, ensure all Visa API credentials are configured
```

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `morphcash` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project.supabase.co`)
   - **Project API Key** (anon/public key)
   - **Project ID** (found in the URL or project settings)

### 3. Generate Encryption Key

Generate a secure encryption key:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Create Your .env.local File

1. Create a new file called `.env.local` in `packages/nextjs/`
2. Copy the template above
3. Replace the placeholder values with your actual values:

```env
# Required values to fill in:
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_DATABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_DATABASE_API_KEY=your-actual-anon-key-here
NEXT_PUBLIC_DATABASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_ENCRYPTION_KEY=your-actual-encryption-key-here
```

### 5. Install Dependencies

```bash
cd morphcash/packages/nextjs
npm install @supabase/supabase-js
```

### 6. Test the Configuration

1. Start your development server:
   ```bash
   yarn start
   ```

2. Check the browser console for any connection errors
3. Try creating a user account
4. Verify data is being stored in Supabase

## Required vs Optional Variables

### Required (Must Fill In)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DATABASE_URL`
- `NEXT_PUBLIC_DATABASE_API_KEY`
- `NEXT_PUBLIC_ENCRYPTION_KEY`

### Optional (Can Leave as Default)
- All other variables have sensible defaults
- Uncomment and fill in only the ones you need

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Use different values** for development and production
3. **Rotate your API keys** regularly
4. **Keep your encryption key secure** - if compromised, all encrypted data is at risk
5. **Use environment-specific files** (`.env.development`, `.env.production`)

## Troubleshooting

### Common Issues

1. **"Missing Supabase configuration"**
   - Check that your `.env.local` file exists
   - Verify the variable names are correct
   - Make sure there are no extra spaces or quotes

2. **"Database connection failed"**
   - Check your Supabase URL and API key
   - Verify your project is active
   - Check network connectivity

3. **"Encryption key not set"**
   - Make sure `NEXT_PUBLIC_ENCRYPTION_KEY` is set
   - Verify the key is properly formatted

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG_MODE=true
```

This will show detailed logs in the browser console.

## Next Steps

After setting up your environment variables:

1. **Set up the database schema** using the Supabase dashboard or migration scripts
2. **Test the integration** by running your application
3. **Configure additional services** as needed (analytics, file storage, etc.)
4. **Set up production environment** with different values

Your MorphCash application is now ready to use Supabase as the persistent storage backend!
