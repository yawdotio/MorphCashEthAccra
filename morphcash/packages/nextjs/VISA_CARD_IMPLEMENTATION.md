# Visa Card Implementation Guide

This guide outlines the integration of Visa's B2B Virtual Account Payment Method API with MorphCash for creating virtual cards. The implementation ensures payment verification before card creation and stores card details in persistent storage.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Integration](#api-integration)
4. [Smart Contract Integration](#smart-contract-integration)
5. [Payment Verification](#payment-verification)
6. [Database Schema](#database-schema)
7. [Environment Setup](#environment-setup)
8. [Implementation Steps](#implementation-steps)
9. [Testing](#testing)
10. [Production Deployment](#production-deployment)
11. [Security Considerations](#security-considerations)
12. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Visa Card Implementation integrates [Visa's B2B Virtual Account Payment Method API](https://developer.visa.com/capabilities/vpa/docs-getting-started) to create virtual cards for users. The system ensures:

- **Payment Verification**: Cards are only created after confirmed payment (Mobile Money or Crypto)
- **Persistent Storage**: Card details stored in Supabase database
- **Smart Contract Integration**: Card creation recorded on blockchain
- **Security**: Encrypted storage of sensitive card data

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Visa API      │
│                 │    │                  │    │                 │
│ 1. User Request │───▶│ 2. Verify Payment│───▶│ 3. Create Card  │
│                 │    │                  │    │                 │
│ 6. Display Card │◀───│ 5. Store in DB   │◀───│ 4. Return Data  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   Smart Contract│
         │              │                 │
         └─────────────▶│ 7. Record Card  │
                        └─────────────────┘
```

## 🔌 API Integration

### Visa B2B Virtual Account Payment Method

**Documentation**: [Visa Developer Portal](https://developer.visa.com/capabilities/vpa/docs-getting-started)

**Key Features**:
- Virtual account creation with authorization controls
- Multiple payment options (supplier-initiated and buyer-initiated)
- Account control options using authorization controls
- Credit limit adjustments at the processor
- Support for pseudo accounts and TSYS VANs

**Required Parameters**:
- `clientId`: Corporation identifier
- `buyerId`: Buyer identifier
- `proxyPoolId`: Proxy pool identifier (optional)
- `accountControls`: Authorization controls and limits
- `cardholderInfo`: Cardholder details

### Two-Way SSL Authentication

**Documentation**: [Visa Two-Way SSL Guide](https://developer.visa.com/pages/working-with-visa-apis/two-way-ssl)

**Authentication Method**: Visa uses Two-Way SSL (Mutual Authentication) for secure API access.

**Required Certificates**:
- **Private Key**: Client's private key for digital signatures
- **Client Certificate**: Issued by Visa for client authentication
- **CA Certificate**: Visa's Certificate Authority root certificate
- **DigiCert CA**: DigiCert Global Root CA certificate

**SSL Handshake Process**:
1. Client requests access to protected resource
2. Server presents its certificate to client
3. Client verifies server's certificate
4. Client sends its certificate to server
5. Server verifies client's credentials
6. Server grants access if authentication succeeds

### API Endpoints Used

1. **Create Account**: `POST /vpa/v1/accounts`
2. **Update Controls**: `PUT /vpa/v1/accounts/{accountId}/controls`
3. **Get Account**: `GET /vpa/v1/accounts/{accountId}`
4. **Suspend Account**: `POST /vpa/v1/accounts/{accountId}/suspend`
5. **Reactivate Account**: `POST /vpa/v1/accounts/{accountId}/reactivate`

## 🔗 Smart Contract Integration

### VisaVirtualCardContract.sol

The smart contract handles:
- Payment verification before card creation
- Card creation with Visa API integration
- Spending limit management
- Card deactivation
- Transaction recording

**Key Functions**:
```solidity
function createVisaVirtualCard(
    string memory cardName,
    uint256 spendingLimit,
    string memory paymentReference,
    PaymentMethod paymentMethod
) external payable

function verifyPayment(
    address user,
    string memory reference,
    uint256 amount,
    string memory currency,
    PaymentMethod method
) external onlyVisaApiService

function completeVisaCardCreation(
    address user,
    uint256 cardIndex,
    string memory visaAccountId,
    string memory cardNumber,
    string memory cvv
) external onlyVisaApiService
```

## 💳 Payment Verification

### Mobile Money Verification

**Supported Providers**:
- MTN Mobile Money
- Vodafone Cash
- AirtelTigo Money
- Orange Money

**Process**:
1. User initiates payment
2. Payment reference generated
3. Payment verified via provider API
4. Card creation proceeds if verified

### Crypto Payment Verification

**Supported Methods**:
- Bitcoin
- Ethereum
- USDC
- USDT

**Process**:
1. User initiates crypto payment
2. Transaction hash recorded
3. Payment verified on blockchain
4. Card creation proceeds if confirmed

## 🗄️ Database Schema

### Virtual Cards Table

```sql
CREATE TABLE virtual_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_name VARCHAR(255) NOT NULL,
    card_number VARCHAR(19) NOT NULL,
    expiry_date VARCHAR(5) NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    card_type VARCHAR(50) DEFAULT 'Visa',
    spending_limit DECIMAL(15,2) NOT NULL,
    current_spend DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    visa_account_id VARCHAR(255) NOT NULL,
    payment_reference VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    authorization_controls JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ⚙️ Environment Setup

### Required Environment Variables

```env
# Visa API Configuration
NEXT_PUBLIC_VISA_API_BASE_URL=https://sandbox.api.visa.com
NEXT_PUBLIC_VISA_USER_ID=your-visa-user-id
NEXT_PUBLIC_VISA_PASSWORD=your-visa-password
NEXT_PUBLIC_VISA_CLIENT_ID=your-client-id
NEXT_PUBLIC_VISA_BUYER_ID=your-buyer-id
NEXT_PUBLIC_VISA_PROXY_POOL_ID=your-proxy-pool-id

# Visa SSL Certificate Configuration
VISA_PRIVATE_KEY_PATH=./certs/privateKey.pem
VISA_CLIENT_CERT_PATH=./certs/cert.pem
VISA_CA_CERT_PATH=./certs/VDPCA-Sandbox.pem
VISA_KEYSTORE_PATH=./certs/visa-keystore.p12
VISA_KEYSTORE_PASSWORD=visa123

# Smart Contract Configuration
NEXT_PUBLIC_VISA_CONTRACT_ADDRESS=0x...
VISA_CONTRACT_PRIVATE_KEY=your-private-key

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Payment Verification
NEXT_PUBLIC_MOMO_API_URL=https://api.momo-provider.com
NEXT_PUBLIC_CRYPTO_API_URL=https://api.crypto-provider.com
```

## 🚀 Implementation Steps

### Step 1: Visa Developer Account Setup

1. **Create Visa Developer Account**
   - Go to [Visa Developer Portal](https://developer.visa.com)
   - Sign up for a developer account
   - Create a new project

2. **Get API Credentials**
   - Navigate to your project
   - Go to Settings → API
   - Copy your User ID, Password, Client ID, and Buyer ID

3. **Configure Sandbox Environment**
   - Use sandbox URLs for testing
   - Note the Proxy Pool ID for your project

### Step 2: Two-Way SSL Certificate Setup

1. **Run SSL Setup Script**
   ```bash
   cd morphcash/packages/nextjs
   node scripts/setup-visa-ssl.js
   ```

2. **Submit CSR to Visa**
   - Upload the generated `certreq.csr` to Visa Developer Portal
   - Download the client certificate (`cert.pem`)
   - Download the VDP CA certificate (`VDPCA-Sandbox.pem`)

3. **Place Certificates**
   - Place `cert.pem` in `./certs/` directory
   - Place `VDPCA-Sandbox.pem` in `./certs/` directory
   - Ensure `privateKey.pem` is in `./certs/` directory

4. **Verify SSL Configuration**
   - Check the Visa Card Test component at `/debug`
   - Ensure SSL status shows "✅ Two-Way SSL is properly configured"

### Step 3: Smart Contract Deployment

1. **Deploy VisaVirtualCardContract**
   ```bash
   cd morphcash/packages/hardhat
   npx hardhat run scripts/deployVisaContract.js --network localhost
   ```

2. **Set Visa API Service Address**
   ```solidity
   contract.setVisaApiService(yourApiServiceAddress);
   ```

3. **Configure Card Creation Fee**
   ```solidity
   contract.setCardCreationFee(0.02 ether); // 0.02 ETH
   ```

### Step 4: Backend API Setup

1. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js ethers
   ```

2. **Configure Environment Variables**
   - Add Visa API credentials to `.env.local`
   - Add smart contract address and private key

3. **Deploy API Endpoints**
   - Payment verification endpoints
   - Visa card creation endpoints
   - Smart contract interaction endpoints

### Step 5: Frontend Integration

1. **Install Visa Service**
   ```typescript
   import { visaCardIntegration } from '~~/services/visaCardIntegration';
   ```

2. **Create Card Component**
   ```typescript
   const createCard = async (cardData: CardCreationRequest) => {
     const result = await visaCardIntegration.createVirtualCard(cardData);
     return result;
   };
   ```

3. **Handle Payment Verification**
   ```typescript
   const verifyPayment = async (method: string, reference: string) => {
     // Verify payment before card creation
   };
   ```

## 🧪 Testing

### Test Card Creation Flow

1. **Start Development Server**
   ```bash
   yarn start
   ```

2. **Test Payment Verification**
   - Go to `/debug` page
   - Use the Visa Card Test section
   - Test with mock payment references

3. **Test Card Creation**
   - Create a test payment reference
   - Verify payment
   - Create virtual card
   - Verify card details in database

### Test Scenarios

1. **Successful Card Creation**
   - Valid payment reference
   - Sufficient payment amount
   - Valid user account

2. **Payment Verification Failure**
   - Invalid payment reference
   - Insufficient payment amount
   - Expired payment

3. **Visa API Failure**
   - Invalid API credentials
   - Network timeout
   - API rate limiting

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Visa API credentials configured
- [ ] Smart contract deployed to mainnet
- [ ] Database schema applied
- [ ] Payment providers integrated
- [ ] Security measures implemented
- [ ] Monitoring and logging configured

### Production Environment Variables

```env
# Production Visa API
NEXT_PUBLIC_VISA_API_BASE_URL=https://api.visa.com
NEXT_PUBLIC_VISA_API_KEY=prod-api-key
NEXT_PUBLIC_VISA_CLIENT_ID=prod-client-id
NEXT_PUBLIC_VISA_BUYER_ID=prod-buyer-id

# Production Smart Contract
NEXT_PUBLIC_VISA_CONTRACT_ADDRESS=0x...
VISA_CONTRACT_PRIVATE_KEY=prod-private-key

# Production Database
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

## 🔒 Security Considerations

### Data Encryption

- **Card Numbers**: Encrypted using AES-256-GCM
- **CVV**: Encrypted using AES-256-GCM
- **Private Keys**: Stored in secure environment variables

### Access Control

- **API Keys**: Rotated regularly
- **Smart Contract**: Owner-only functions protected
- **Database**: Row-level security policies

### Payment Security

- **Payment Verification**: Multiple verification steps
- **Transaction Limits**: Enforced at multiple levels
- **Fraud Detection**: Real-time monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Payment Verification Fails**
   - Check payment reference format
   - Verify payment provider API
   - Check payment amount and currency

2. **Visa API Errors**
   - Verify API credentials
   - Check API rate limits
   - Review error codes

3. **Smart Contract Errors**
   - Check contract address
   - Verify private key
   - Check gas limits

4. **Database Errors**
   - Check Supabase connection
   - Verify table schema
   - Check RLS policies

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| V001 | Payment verification failed | Check payment reference |
| V002 | Visa API error | Check API credentials |
| V003 | Smart contract error | Check contract configuration |
| V004 | Database error | Check database connection |
| V005 | SSL certificate error | Check certificate files and paths |
| V006 | SSL handshake failed | Verify certificate validity and CA chain |
| V007 | Certificate not found | Run SSL setup script and place certificates |

### SSL Troubleshooting

**Common SSL Issues**:

1. **Certificate Not Found**
   - Ensure certificate files are in the correct location
   - Check file paths in environment variables
   - Run `node scripts/setup-visa-ssl.js` to generate certificates

2. **SSL Handshake Failed**
   - Verify certificate validity (not expired)
   - Check CA certificate chain
   - Ensure private key matches client certificate

3. **Certificate Validation Errors**
   - Verify certificate was issued by Visa
   - Check certificate format (should be PEM)
   - Ensure all required certificates are present

4. **Connection Refused**
   - Check Visa API base URL
   - Verify network connectivity
   - Check firewall settings

## 📞 Support

For technical support:
- **Visa API**: [Visa Developer Support](https://developer.visa.com/support)
- **MorphCash**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Visa API Docs](https://developer.visa.com/capabilities/vpa/docs-getting-started)

## 📄 License

This implementation is part of the MorphCash project and follows the same license terms.

---

**Note**: This implementation is for educational and development purposes. For production use, ensure proper security audits and compliance with financial regulations.
