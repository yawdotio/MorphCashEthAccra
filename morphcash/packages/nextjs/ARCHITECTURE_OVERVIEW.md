# MorphCash Architecture Overview

## System Architecture Summary

MorphCash is a hybrid Web3/Web2 application that combines blockchain smart contracts with traditional database storage to provide virtual card services. The architecture follows a clean separation of concerns with event-driven communication between blockchain and database layers.

## Core Components

### 1. Smart Contracts Layer (Ethereum)

#### ENSProfileContract.sol
- **Purpose**: Manages ENS-based user profiles on-chain
- **Key Functions**:
  - `createProfile(ensHash, ensName, profile)` - Create ENS profile
  - `updateProfile(ensHash, ensName, profile)` - Update profile data
  - `getProfile(ensHash)` - Retrieve profile by ENS hash
  - `getProfileByAddress(address)` - Get profile by wallet address
- **Data Stored**: Display name, bio, avatar, social links, timestamps
- **Events**: `ProfileCreated`, `ProfileUpdated`

#### VirtualCardContractV2.sol
- **Purpose**: Enhanced virtual card management with balance tracking
- **Key Functions**:
  - `createVirtualCard(cardName, cardNumber, cardType, spendingLimit)` - Create card
  - `updateVirtualCard(cardIndex, cardName, spendingLimit)` - Update card
  - `deactivateVirtualCard(cardIndex)` - Deactivate card
  - `getUserVirtualCards(address)` - Get user's cards
- **Data Stored**: Card details, spending limits, balances, payment references
- **Events**: `VirtualCardCreated`, `VirtualCardUpdated`, `VirtualCardDeactivated`

#### PaymentContract.sol
- **Purpose**: Blockchain payment processing for card funding
- **Key Functions**:
  - `fundCard(ghsAmount, cardType, paymentReference)` - Fund card with ETH
  - `setFundingLimits(min, max)` - Set funding limits (owner only)
  - `withdraw(amount)` - Withdraw contract balance (owner only)
- **Data Stored**: Funding records, transaction hashes, user payments
- **Events**: `CardFundingInitiated`, `CardFundingSuccess`, `CardFundingFailed`

### 2. Frontend Layer (Next.js + React)

#### Authentication & User Management
- **EnhancedAuthContext**: Manages user authentication state
- **Auth Methods**: ENS, Email, Wallet-based authentication
- **User Service**: Centralized user management with caching

#### Smart Contract Integration
- **Scaffold-ETH Hooks**: 
  - `useScaffoldReadContract` - Read contract data
  - `useScaffoldWriteContract` - Write contract functions
  - `useScaffoldWatchContractEvent` - Listen to contract events
- **Custom Hooks**:
  - `useVirtualCards` - Virtual card management
  - `useENSProfile` - ENS profile management
  - `useEnhancedVirtualCards` - Advanced card operations

#### Event-Driven Architecture
- **CardFundingListener**: Listens to `CardFundingSuccess` events
- **Automatic Card Creation**: Creates Supabase records when funding succeeds
- **Real-time Updates**: Frontend responds to blockchain events

### 3. Database Layer (Supabase)

#### Core Tables

**Users Table**
```sql
- id (UUID, Primary Key)
- address (VARCHAR(42)) - Ethereum address
- ens_name (VARCHAR(255)) - ENS name
- ens_avatar (TEXT) - ENS avatar URL
- email (VARCHAR(255)) - Email address
- account_type (ENUM) - basic, premium, enterprise
- auth_method (ENUM) - ens, email, wallet
- ens_profile (JSONB) - ENS profile data
- personal_info (JSONB) - Personal information
- preferences (JSONB) - User preferences
- created_at, updated_at, last_login_at
- is_active (BOOLEAN)
```

**Virtual Cards Table**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key) - References users.id
- card_id (BIGINT) - On-chain card ID
- card_name (VARCHAR(255))
- card_number (VARCHAR(20)) - Masked: ****1234
- expiry_date (VARCHAR(7)) - MM/YY format
- card_type (VARCHAR(50)) - Visa, Mastercard, etc.
- spending_limit (BIGINT)
- current_spend (BIGINT)
- is_active (BOOLEAN)
- on_chain_tx_hash (VARCHAR(66)) - Transaction hash
- created_at, updated_at
```

**Transactions Table**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- card_id (UUID, Foreign Key) - References virtual_cards.id
- type (ENUM) - payment, refund, transfer, deposit, withdrawal
- amount (BIGINT)
- currency (VARCHAR(10))
- description (TEXT)
- merchant_name (VARCHAR(255))
- merchant_address (VARCHAR(255))
- status (ENUM) - pending, completed, failed, cancelled
- tx_hash (VARCHAR(66)) - Blockchain transaction hash
- created_at, updated_at
```

**Payment Methods Table**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- type (ENUM) - credit_card, bank_account, crypto_wallet
- encrypted_data (TEXT) - Encrypted sensitive data
- last4 (VARCHAR(4)) - Last 4 digits for display
- brand (VARCHAR(50)) - Visa, Mastercard, etc.
- is_default (BOOLEAN)
- is_active (BOOLEAN)
- created_at, updated_at
```

## Data Flow Architecture

### 1. User Registration Flow
```
User → Frontend → Authentication Choice
├── ENS: ENSProfileContract.createProfile()
├── Email: Supabase Auth
└── Wallet: Address-based authentication
```

### 2. Card Creation Flow
```
User → Frontend → Payment Method Selection
├── Crypto Payment:
│   ├── PaymentContract.fundCard() → ETH Payment
│   ├── CardFundingSuccess Event → CardFundingListener
│   └── Supabase: Create virtual_cards record
└── Mobile Money:
    └── Supabase: Create virtual_cards record directly
```

### 3. Payment Processing Flow
```
Transaction → Frontend → Payment Processing
├── On-chain: Smart contract validation
├── Off-chain: Supabase transaction record
└── Event: Real-time updates to frontend
```

## Key Architectural Patterns

### 1. Event-Driven Architecture
- **Blockchain Events**: Smart contracts emit events for state changes
- **Frontend Listeners**: React components listen to contract events
- **Database Sync**: Events trigger Supabase operations
- **Real-time Updates**: UI updates based on event emissions

### 2. Hybrid Data Storage
- **On-chain**: User profiles, card metadata, payment records
- **Off-chain**: Sensitive data, transaction history, user preferences
- **Synchronization**: Events ensure data consistency

### 3. Multi-Authentication Support
- **ENS**: Decentralized identity with on-chain profiles
- **Email**: Traditional authentication for non-crypto users
- **Wallet**: Direct wallet connection for Web3 users

### 4. Secure Data Handling
- **Encryption**: Sensitive data encrypted before storage
- **Wallet-derived Keys**: Encryption keys derived from user's wallet
- **Local Storage**: Encrypted data stored locally for security

## Service Layer Architecture

### Frontend Services
- **UserService**: User management and authentication
- **SmartContractService**: Blockchain interaction wrapper
- **BackendService**: API communication
- **SecureStorageService**: Encrypted local storage

### Database Services
- **SupabaseDatabaseService**: Database operations
- **EncryptionService**: Data encryption/decryption
- **CacheService**: Data caching and optimization

## Security Considerations

### 1. Smart Contract Security
- **Ownable Pattern**: Contract ownership management
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Access Control**: Role-based function access

### 2. Data Security
- **Encryption**: Sensitive data encrypted at rest
- **Wallet Integration**: Keys derived from user wallets
- **RLS (Row Level Security)**: Database-level access control
- **Session Management**: Secure session handling

### 3. Frontend Security
- **Input Sanitization**: All user inputs validated
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Storage**: Encrypted local storage

## Scalability Considerations

### 1. Database Optimization
- **Indexing**: Optimized database indexes
- **Caching**: Multi-level caching strategy
- **Pagination**: Efficient data pagination
- **Connection Pooling**: Database connection optimization

### 2. Frontend Performance
- **Code Splitting**: Lazy loading of components
- **State Management**: Efficient state updates
- **Event Optimization**: Debounced event handling
- **Caching**: Client-side data caching

### 3. Blockchain Integration
- **Event Filtering**: Efficient event listening
- **Batch Operations**: Optimized contract calls
- **Gas Optimization**: Efficient transaction handling
- **Network Selection**: Multi-chain support

## Deployment Architecture

### 1. Smart Contracts
- **Hardhat**: Development and testing framework
- **Deployment Scripts**: Automated contract deployment
- **Verification**: Contract source code verification
- **Upgradeability**: Proxy pattern for contract upgrades

### 2. Frontend
- **Next.js**: React framework with SSR/SSG
- **Vercel**: Deployment platform
- **CDN**: Global content delivery
- **Environment Management**: Multi-environment support

### 3. Database
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Primary database
- **Real-time**: WebSocket connections
- **Backups**: Automated backup system

## Monitoring and Analytics

### 1. Smart Contract Monitoring
- **Event Tracking**: Contract event monitoring
- **Transaction Analysis**: Gas usage and success rates
- **Error Handling**: Failed transaction tracking
- **Performance Metrics**: Contract interaction metrics

### 2. Frontend Monitoring
- **Error Tracking**: Client-side error monitoring
- **Performance Metrics**: Page load and interaction times
- **User Analytics**: User behavior tracking
- **A/B Testing**: Feature experimentation

### 3. Database Monitoring
- **Query Performance**: Database query optimization
- **Connection Monitoring**: Database connection health
- **Storage Usage**: Database storage monitoring
- **Backup Status**: Backup system monitoring

This architecture provides a robust, scalable, and secure foundation for the MorphCash virtual card platform, combining the benefits of blockchain technology with traditional web application patterns.
