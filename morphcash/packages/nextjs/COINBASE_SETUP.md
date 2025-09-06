# Coinbase Developer Platform Integration Setup

This guide will help you set up Coinbase Developer Platform integration for multi-crypto payments and settlements.

## 🚀 Features

- **Real-time Exchange Rates**: Get live ETH and USDC rates from Coinbase
- **Multi-Crypto Settlements**: Support for ETH and USDC payments
- **Base Network Integration**: Lower fees and faster transactions
- **Gasless Transactions**: USDC payments on Base network
- **Smart Wallet Integration**: Seamless wallet connection
- **Balance Checking**: Real-time wallet balance monitoring

## 📋 Prerequisites

1. **Coinbase Developer Account**: Sign up at [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)
2. **Base Network Access**: Ensure you have access to Base testnet/mainnet
3. **Coinbase Wallet**: Install the Coinbase Wallet browser extension

## 🔧 Setup Instructions

### 1. Create Coinbase Developer Account

1. Visit [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)
2. Sign up or log in with your Coinbase account
3. Create a new application
4. Note down your API key and other credentials

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Coinbase Developer Platform Configuration
NEXT_PUBLIC_COINBASE_API_KEY=your-coinbase-api-key-here
NEXT_PUBLIC_COINBASE_BASE_URL=https://api.coinbase.com
NEXT_PUBLIC_COINBASE_ENVIRONMENT=sandbox
```

### 3. Install Required Dependencies

The integration uses the following packages (already included):

```bash
# Core dependencies (already installed)
@supabase/supabase-js
@heroicons/react
```

### 4. Base Network Configuration

Update your Hardhat configuration to include Base network:

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    base: {
      url: "https://mainnet.base.org", // or testnet URL
      accounts: [process.env.PRIVATE_KEY],
    },
    baseTestnet: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
    }
  }
};
```

## 🎯 Usage Examples

### Basic Exchange Rate Fetching

```typescript
import { useCoinbase } from '~~/hooks/useCoinbase';

const MyComponent = () => {
  const { exchangeRates, isLoadingRates, refreshRates } = useCoinbase();

  // Get ETH rate
  const ethRate = exchangeRates['GHS_ETH'];
  
  return (
    <div>
      {isLoadingRates ? (
        <p>Loading rates...</p>
      ) : (
        <p>1 ETH = {ethRate?.rate.toFixed(2)} GHS</p>
      )}
    </div>
  );
};
```

### Multi-Crypto Payment

```typescript
import { useCoinbase } from '~~/hooks/useCoinbase';

const PaymentComponent = () => {
  const { 
    getPaymentQuote, 
    executeSettlement, 
    isGeneratingQuote 
  } = useCoinbase();

  const handlePayment = async () => {
    // Get payment quote
    const quote = await getPaymentQuote('GHS', 'USDC', 100);
    
    if (quote) {
      // Execute settlement
      const result = await executeSettlement({
        fromCurrency: 'GHS',
        toCurrency: 'USDC',
        amount: 100,
        recipientAddress: '0x...',
        network: 'base',
        gasless: true
      });
    }
  };
};
```

### Wallet Integration

```typescript
import { CoinbaseWalletButton } from '~~/components/coinbase/CoinbaseWalletButton';

const WalletComponent = () => {
  const handleWalletConnected = (address: string) => {
    console.log('Wallet connected:', address);
  };

  return (
    <CoinbaseWalletButton
      onWalletConnected={handleWalletConnected}
      onWalletDisconnected={() => console.log('Disconnected')}
      onError={(error) => console.error(error)}
    />
  );
};
```

## 🔄 API Endpoints

### Exchange Rates
- **GET** `/v2/exchange-rates?currency={from}`
- Returns real-time exchange rates for supported currencies

### Payment Quotes
- **POST** `/v2/payment-quotes`
- Generate payment quotes for multi-crypto settlements

### Settlements
- **POST** `/v2/settlements`
- Execute multi-crypto settlements

### Balances
- **GET** `/v2/balances/{address}?currency={currency}&network=base`
- Get wallet balances for specific currencies

## 🌐 Supported Networks

### Base Network (Recommended)
- **Mainnet**: `https://mainnet.base.org`
- **Testnet**: `https://sepolia.base.org`
- **Features**: Lower fees, faster transactions, gasless USDC

### Ethereum Network
- **Mainnet**: `https://mainnet.infura.io/v3/{key}`
- **Testnet**: `https://sepolia.infura.io/v3/{key}`
- **Features**: Full compatibility, higher fees

## 💰 Supported Currencies

### Fiat Currencies
- GHS (Ghana Cedi)
- USD (US Dollar)

### Cryptocurrencies
- ETH (Ethereum)
- USDC (USD Coin)

## 🔒 Security Features

### Gasless Transactions
- USDC payments on Base network are gasless
- No need for users to hold ETH for gas fees
- Improved user experience

### Smart Wallet Integration
- ERC-4337 compatible smart wallets
- Programmable transaction logic
- Enhanced security features

### Real-time Monitoring
- Live transaction status updates
- Automatic confirmation tracking
- Error handling and retry logic

## 🚨 Error Handling

The integration includes comprehensive error handling:

```typescript
const { error, clearError } = useCoinbase();

if (error) {
  console.error('Coinbase error:', error);
  clearError(); // Clear the error
}
```

## 📊 Monitoring and Analytics

### Transaction Tracking
- Real-time status updates
- Confirmation monitoring
- Gas usage tracking

### Performance Metrics
- Exchange rate accuracy
- Settlement success rates
- User experience metrics

## 🔧 Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key in Coinbase Developer Portal
   - Check environment variable configuration

2. **Network Connection Issues**
   - Ensure Base network is accessible
   - Check RPC endpoint configuration

3. **Wallet Connection Failed**
   - Install Coinbase Wallet extension
   - Check browser permissions

4. **Exchange Rate Errors**
   - Verify supported currency pairs
   - Check API rate limits

### Debug Mode

Enable debug logging:

```typescript
// In your component
const { exchangeRates, error } = useCoinbase({
  autoRefresh: true,
  refreshInterval: 10000 // 10 seconds for debugging
});
```

## 📈 Performance Optimization

### Caching
- Exchange rates are cached for 5 minutes
- Asset data is cached for 10 minutes
- Automatic cache invalidation

### Rate Limiting
- Respects Coinbase API rate limits
- Automatic retry with exponential backoff
- Graceful degradation on errors

## 🎉 Next Steps

1. **Test Integration**: Use sandbox environment for testing
2. **Deploy to Production**: Switch to production API keys
3. **Monitor Performance**: Set up analytics and monitoring
4. **User Onboarding**: Implement wallet connection flow
5. **Support Multi-Currency**: Add more supported currencies

## 📞 Support

- **Coinbase Developer Docs**: [developers.coinbase.com](https://developers.coinbase.com)
- **Base Network Docs**: [docs.base.org](https://docs.base.org)
- **Community Support**: [Coinbase Developer Discord](https://discord.gg/coinbase)

---

**Note**: This integration provides a foundation for multi-crypto payments. Customize the implementation based on your specific requirements and business logic.
