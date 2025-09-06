# Database Setup Guide

This guide will help you set up persistent user storage for your MorphCash application.

## Overview

The enhanced storage solution provides:
- **Persistent User Profiles**: Store user data, ENS profiles, and preferences
- **Virtual Cards Management**: Hybrid on-chain + database storage
- **Transaction History**: Complete transaction tracking
- **Payment Methods**: Encrypted storage for sensitive data
- **Session Management**: Secure authentication sessions
- **Real-time Updates**: Live data synchronization

## Required API Keys & Services

### 1. Database Service (Choose One)

#### Option A: Supabase (Recommended)
- **Why**: PostgreSQL with real-time features, built-in auth, and easy setup
- **Setup**: 
  1. Go to [supabase.com](https://supabase.com)
  2. Create a new project
  3. Get your project URL and API key from Settings > API
- **Environment Variables**:
  ```env
  NEXT_PUBLIC_DATABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_DATABASE_API_KEY=your-anon-key
  NEXT_PUBLIC_DATABASE_PROJECT_ID=your-project-id
  ```

#### Option B: PlanetScale
- **Why**: MySQL-compatible, serverless, with branching
- **Setup**:
  1. Go to [planetscale.com](https://planetscale.com)
  2. Create a new database
  3. Get your connection string and API key
- **Environment Variables**:
  ```env
  NEXT_PUBLIC_DATABASE_URL=https://your-database.planetscale.com
  NEXT_PUBLIC_DATABASE_API_KEY=your-api-key
  NEXT_PUBLIC_DATABASE_REGION=us-east-1
  ```

#### Option C: MongoDB Atlas
- **Why**: NoSQL, flexible schema, document-based
- **Setup**:
  1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
  2. Create a new cluster
  3. Get your connection string and API key
- **Environment Variables**:
  ```env
  NEXT_PUBLIC_DATABASE_URL=https://your-cluster.mongodb.net
  NEXT_PUBLIC_DATABASE_API_KEY=your-api-key
  NEXT_PUBLIC_DATABASE_REGION=us-east-1
  ```

### 2. Encryption Key (Required)
Generate a secure encryption key for sensitive data:

```bash
# Generate a secure key
openssl rand -base64 32
```

Add to your environment:
```env
NEXT_PUBLIC_ENCRYPTION_KEY=your-generated-key-here
```

### 3. Optional Services

#### File Storage (for avatars, documents)
- **Cloudinary**: For image optimization and storage
- **AWS S3**: For general file storage
- **Supabase Storage**: If using Supabase

#### Analytics (optional)
- **Mixpanel**: For user analytics
- **PostHog**: Open-source analytics
- **Google Analytics**: Basic tracking

## Environment Configuration

Create a `.env.local` file in your `packages/nextjs` directory:

```env
# Database Configuration
NEXT_PUBLIC_DATABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_DATABASE_API_KEY=your-anon-key
NEXT_PUBLIC_DATABASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_DATABASE_REGION=us-east-1

# Encryption
NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-encryption-key

# Features
NEXT_PUBLIC_ENABLE_CACHING=true
NEXT_PUBLIC_CACHE_TIMEOUT=300000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true

# Optional: File Storage
NEXT_PUBLIC_CLOUDINARY_URL=your-cloudinary-url
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-key

# Optional: Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
```

## Database Schema

The system will automatically create the following tables:

### Users Table
- `id` (Primary Key)
- `address` (Ethereum address)
- `ensName` (ENS name)
- `email` (Email address)
- `accountType` (basic/premium/enterprise)
- `authMethod` (ens/email/wallet)
- `ensProfile` (JSON)
- `personalInfo` (JSON)
- `preferences` (JSON)
- `createdAt`, `updatedAt`, `lastLoginAt`
- `isActive` (boolean)

### Virtual Cards Table
- `id` (Primary Key)
- `userId` (Foreign Key)
- `cardId` (On-chain card ID)
- `cardName`, `cardNumber`, `expiryDate`, `cardType`
- `spendingLimit`, `currentSpend`
- `isActive` (boolean)
- `onChainTxHash` (Transaction hash)
- `createdAt`, `updatedAt`

### Transactions Table
- `id` (Primary Key)
- `userId` (Foreign Key)
- `cardId` (Foreign Key, optional)
- `type` (payment/refund/transfer/deposit/withdrawal)
- `amount`, `currency`, `description`
- `merchantName`, `merchantAddress`
- `status` (pending/completed/failed/cancelled)
- `txHash` (Blockchain transaction hash)
- `createdAt`, `updatedAt`

### Payment Methods Table
- `id` (Primary Key)
- `userId` (Foreign Key)
- `type` (credit_card/bank_account/crypto_wallet)
- `encryptedData` (Encrypted sensitive data)
- `last4`, `brand` (Display data)
- `isDefault`, `isActive` (boolean)
- `createdAt`, `updatedAt`

### Sessions Table
- `id` (Primary Key)
- `userId` (Foreign Key)
- `token` (Session token)
- `expiresAt` (Expiration timestamp)
- `ipAddress`, `userAgent`
- `createdAt`, `lastUsedAt`

## Setup Steps

1. **Choose a Database Provider** and get your API keys
2. **Set up environment variables** in `.env.local`
3. **Generate encryption key** for sensitive data
4. **Deploy database schema** (will be created automatically)
5. **Test the connection** by running the app

## Testing the Setup

1. Start your development server:
   ```bash
   yarn start
   ```

2. Check the browser console for any database connection errors
3. Try creating a user account
4. Verify data is being stored in your database

## Migration from Current System

The new system is designed to work alongside your existing smart contracts:

1. **Virtual Cards**: Continue using on-chain storage, but sync with database
2. **User Data**: Migrate from localStorage to database
3. **Sessions**: Replace localStorage sessions with database sessions
4. **Encryption**: Enhanced encryption for sensitive data

## Security Considerations

- **Encryption**: All sensitive data is encrypted using wallet-derived keys
- **API Keys**: Store securely and rotate regularly
- **Database Access**: Use proper access controls and IP restrictions
- **Session Management**: Implement proper session expiration and cleanup
- **Data Validation**: Validate all inputs before storing

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your API key and URL
   - Verify network connectivity
   - Check database provider status

2. **Encryption Errors**
   - Ensure encryption key is set
   - Check key format (should be base64)

3. **Session Issues**
   - Clear localStorage and try again
   - Check session expiration settings

### Debug Mode

Enable debug logging by adding to your environment:
```env
NEXT_PUBLIC_DEBUG_MODE=true
```

## Support

For issues with:
- **Database Setup**: Check your provider's documentation
- **Code Issues**: Check the console for error messages
- **Configuration**: Verify all environment variables are set correctly

## Next Steps

After setting up the database:

1. **Test all features** to ensure they work correctly
2. **Set up monitoring** for your database
3. **Configure backups** for production
4. **Set up analytics** to track usage
5. **Plan for scaling** as your user base grows
