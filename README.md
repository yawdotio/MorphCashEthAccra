# MorphCash - ENS-Based Virtual Card Platform

A decentralized virtual card platform that leverages Ethereum Name Service (ENS) for user identification and secure payment processing.

## Features

- 🔐 **Multi-Authentication**: Support for ENS, email/password, and wallet authentication
- 💳 **Virtual Cards**: Create and manage virtual cards with system-generated details
- 🌐 **ENS Integration**: Real ENS ownership verification and profile management
- 🔒 **Secure Storage**: Encrypted off-chain storage for sensitive data
- 💰 **Low Fees**: 0.02% funding fee for virtual cards
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum, Wagmi, RainbowKit, Scaffold-ETH 2
- **Smart Contracts**: Solidity, OpenZeppelin
- **Authentication**: ENS, Email/Password, Wallet connection
- **Storage**: Encrypted local storage with AES-256-GCM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ETHACCRA
```

2. Install dependencies:
```bash
cd morphcash
npm install
```

3. Start the development server:
```bash
cd packages/nextjs
npm run dev
```

4. Deploy smart contracts (in a separate terminal):
```bash
cd packages/hardhat
npm run deploy
```

### Environment Setup

Create a `.env.local` file in the `packages/nextjs` directory:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
```

## Project Structure

```
morphcash/
├── packages/
│   ├── nextjs/                 # Frontend application
│   │   ├── app/               # Next.js app router
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   └── utils/             # Utility functions
│   └── hardhat/               # Smart contracts
│       ├── contracts/         # Solidity contracts
│       ├── scripts/           # Deployment scripts
│       └── test/              # Contract tests
```

## Key Components

### Authentication System
- **ENS Authentication**: Verify ENS ownership and create profiles
- **Email/Password**: Traditional authentication with secure storage
- **Wallet Connection**: Manual wallet connection (no auto-connect)

### Virtual Card System
- **System-Generated Details**: Automatic card number, expiry date, and type generation
- **Fee Management**: 0.02% funding fee calculation
- **Card Management**: Create, edit, and deactivate virtual cards

### Smart Contracts
- **YourContract.sol**: Main contract managing ENS profiles and virtual cards
- **OpenZeppelin Integration**: Security and access control

## Usage

1. **Authentication**: 
   - Connect wallet or sign in with ENS/email
   - ENS users can create profiles with metadata

2. **Virtual Cards**:
   - Navigate to Dashboard > Cards
   - Create new virtual cards with funding amounts
   - System generates card details automatically
   - Manage existing cards (edit, deactivate)

3. **Profile Management**:
   - Update ENS profile information
   - Manage authentication methods

## Security Features

- **Encrypted Storage**: Sensitive data encrypted with AES-256-GCM
- **ENS Verification**: Real ownership verification for ENS names
- **Smart Contract Security**: OpenZeppelin security patterns
- **No Auto-Connect**: Manual wallet connection for better security

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@morphcash.com or join our Discord community.

---

Built with ❤️ by the MorphCash team
