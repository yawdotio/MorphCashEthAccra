# MorphCash Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                MORPHCASH ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │   SMART         │    │   DATABASE      │
│   (Next.js)     │    │   CONTRACTS     │    │   (Supabase)    │
│                 │    │   (Ethereum)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Detailed Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    USER LAYER                                   │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│   ENS Users     │   Email Users   │  Wallet Users   │    Mobile Users         │
│                 │                 │                 │                         │
│ • ENS Profile   │ • Email Auth    │ • Direct Wallet │ • MTN Mobile Money      │
│ • On-chain ID   │ • Traditional   │ • Web3 Native   │ • Off-chain Only        │
│ • Decentralized │ • Centralized   │ • Full Control  │ • Phone-based           │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   AUTH CONTEXT  │  │  SMART CONTRACT │  │   EVENT SYSTEM  │  │   SERVICES  │ │
│  │                 │  │     HOOKS       │  │                 │  │             │ │
│  │ • EnhancedAuth  │  │ • useScaffold   │  │ • Event Listeners│  │ • UserService│ │
│  │ • Multi-method  │  │ • useVirtualCards│  │ • CardFunding   │  │ • SmartContract│ │
│  │ • Session Mgmt  │  │ • useENSProfile │  │ • Real-time     │  │ • BackendService│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BLOCKCHAIN    │    │   EVENT BRIDGE  │    │   DATABASE      │
│   LAYER         │    │                 │    │   LAYER         │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ ENSProfileContract│    │ CardFundingListener│  │ Supabase Tables │
│ • createProfile  │    │ • Event Watcher │    │ • users         │
│ • updateProfile  │    │ • Auto Card     │    │ • virtual_cards │
│ • getProfile     │    │   Creation      │    │ • transactions  │
│                 │    │ • Real-time     │    │ • payment_methods│
│ VirtualCardV2    │    │   Updates       │    │ • sessions      │
│ • createCard     │    │                 │    │                 │
│ • updateCard     │    │                 │    │ • RLS Security  │
│ • deactivateCard │    │                 │    │ • Encryption    │
│ • getUserCards   │    │                 │    │ • Real-time     │
│                 │    │                 │    │                 │
│ PaymentContract  │    │                 │    │                 │
│ • fundCard       │    │                 │    │                 │
│ • setLimits      │    │                 │    │                 │
│ • withdraw       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Data Flow Patterns

### 1. User Registration Flow
```
User Registration
├── ENS Method
│   ├── Frontend → ENSProfileContract.createProfile()
│   ├── On-chain Profile Created
│   └── Supabase User Record Created
├── Email Method
│   └── Supabase Auth → User Record Created
├── Wallet Method
│   ├── Wallet Connection
│   └── Supabase User Record Created
└── Mobile Method
    └── Supabase User Record Created
```

### 2. Card Creation Flow
```
Card Creation Request
├── Crypto Payment Path
│   ├── PaymentContract.fundCard() → ETH Payment
│   ├── CardFundingSuccess Event Emitted
│   ├── CardFundingListener Catches Event
│   ├── Supabase virtual_cards Record Created
│   └── Frontend UI Updated
└── Mobile Money Path
    ├── MTN Mobile Money Payment
    ├── Payment Verification
    ├── Supabase virtual_cards Record Created
    └── Frontend UI Updated
```

### 3. Transaction Processing Flow
```
Transaction Request
├── Frontend Validation
├── Smart Contract Validation (if applicable)
├── Database Transaction Record
├── Real-time Event Emission
└── UI Update
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   CONTRACT      │  │   FRONTEND      │  │   DATABASE      │  │   NETWORK   │ │
│  │   SECURITY      │  │   SECURITY      │  │   SECURITY      │  │   SECURITY  │ │
│  │                 │  │                 │  │                 │  │             │ │
│  │ • Ownable       │  │ • Input         │  │ • RLS (Row      │  │ • HTTPS     │ │
│  │ • ReentrancyGuard│  │   Validation    │  │   Level Security)│  │ • CORS      │ │
│  │ • Access Control│  │ • XSS Protection│  │ • Encryption    │  │ • Rate      │ │
│  │ • Input         │  │ • CSRF          │  │ • Secure        │  │   Limiting  │ │
│  │   Validation    │  │   Protection    │  │   Sessions      │  │ • Firewall  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **State Management**: Zustand + React Context
- **Web3 Integration**: Wagmi + Viem
- **Styling**: Tailwind CSS
- **Authentication**: Custom multi-method auth

### Smart Contracts
- **Language**: Solidity ^0.8.0
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin Contracts
- **Testing**: Hardhat Test Suite
- **Deployment**: Hardhat Deploy

### Database
- **Primary**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Security**: Row Level Security (RLS)

### Infrastructure
- **Frontend Hosting**: Vercel
- **Database**: Supabase Cloud
- **Blockchain**: Ethereum (Local/Testnet/Mainnet)
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in Supabase + Vercel Analytics

## Key Architectural Decisions

### 1. Event-Driven Architecture
- **Rationale**: Decouples blockchain and database operations
- **Benefits**: Real-time updates, scalability, maintainability
- **Implementation**: Smart contract events → Frontend listeners → Database operations

### 2. Hybrid Data Storage
- **On-chain**: User profiles, card metadata, payment records
- **Off-chain**: Sensitive data, transaction history, user preferences
- **Rationale**: Balance between decentralization and practical requirements

### 3. Multi-Authentication Support
- **ENS**: For Web3 native users
- **Email**: For traditional users
- **Wallet**: For direct wallet users
- **Mobile**: For mobile money users
- **Rationale**: Maximize user accessibility and adoption

### 4. Secure Data Handling
- **Encryption**: Wallet-derived keys for sensitive data
- **Local Storage**: Encrypted sensitive data storage
- **Database Security**: RLS and encryption at rest
- **Rationale**: Protect user data while maintaining usability

This architecture provides a robust, scalable, and secure foundation for the MorphCash virtual card platform, combining the benefits of blockchain technology with traditional web application patterns.
