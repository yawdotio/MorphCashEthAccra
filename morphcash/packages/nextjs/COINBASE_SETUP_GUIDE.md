# Coinbase API Setup Guide

## Current Status
✅ **Exchange Rates API**: Working (no authentication required)
❌ **Assets API**: Not available (using predefined assets instead)

## What's Working
1. **Exchange Rates**: The Coinbase API `/v2/exchange-rates` endpoint works without authentication
2. **Currency Conversion**: We can convert between USD, GHS, ETH, and USDC
3. **Predefined Assets**: We use hardcoded asset definitions for ETH and USDC

## Environment Variables Required
Add these to your `.env.local` file:

```bash
# Coinbase API Configuration
NEXT_PUBLIC_COINBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_COINBASE_BASE_URL=https://api.coinbase.com
NEXT_PUBLIC_COINBASE_ENVIRONMENT=sandbox
```

## How to Get a Coinbase API Key

### Option 1: Public API (Recommended for our use case)
The public Coinbase API doesn't require authentication for basic exchange rates, which is what we need.

### Option 2: Coinbase Developer Platform
If you want to use authenticated endpoints:

1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com)
2. Create a new project
3. Generate an API key
4. Set the required permissions

## Current Implementation

### Exchange Rates
- ✅ Fetches real-time rates from Coinbase
- ✅ Supports USD, GHS, ETH, USDC
- ✅ Cached for 5 minutes

### Supported Assets
- ✅ ETH on Ethereum network
- ✅ USDC on Ethereum network  
- ✅ USDC on Base network
- ✅ Predefined contract addresses

### Currency Conversion
- ✅ Converts between any supported currencies
- ✅ Uses real-time exchange rates
- ✅ Handles errors gracefully

## Testing the Integration

1. **Start your development server**:
   ```bash
   yarn start
   ```

2. **Open the crypto payment modal**:
   - Go to the virtual cards page
   - Click "Create Virtual Card"
   - Select "Crypto Payment"

3. **Check the browser console**:
   - Look for Coinbase API logs
   - Verify exchange rates are loading
   - Check that crypto options appear

## Expected Behavior

When you open the crypto payment modal, you should see:

1. **Exchange Rate Info**: Real-time rates for ETH and USDC
2. **Crypto Payment Options**: 
   - ETH on Ethereum (not gasless)
   - USDC on Ethereum (not gasless)
   - USDC on Base (gasless)
3. **Amount Conversion**: Correct amounts in each currency

## Troubleshooting

### If crypto options don't appear:
1. Check browser console for errors
2. Verify environment variables are set
3. Check network tab for API calls

### If exchange rates are wrong:
1. The rates are real-time from Coinbase
2. Check if the API is responding correctly
3. Verify currency codes (USD, GHS, ETH, USDC)

### If conversion is incorrect:
1. Check the exchange rate calculation
2. Verify the rate is being fetched correctly
3. Check for rounding errors

## Next Steps

The current implementation should work for basic crypto payments. If you need more advanced features like:

- Real-time asset discovery
- Advanced trading features
- Wallet integration
- Payment processing

You would need to implement JWT authentication with the Coinbase Developer Platform API.
