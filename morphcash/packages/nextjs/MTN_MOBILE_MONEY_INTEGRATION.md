# MTN Mobile Money Integration

This document describes the implementation of MTN Mobile Money payment integration using the official MTN Mobile Money widget API.

## Overview

The integration provides a complete payment flow where users are redirected to MTN's payment system, complete the payment, and then the system verifies the payment before creating a virtual card.

## Components

### 1. MTNMobileMoneyWidget (`components/dashboard/MTNMobileMoneyWidget.tsx`)

A React component that wraps the MTN Mobile Money widget with proper event handling.

**Features:**
- Automatic widget initialization
- Event listeners for all payment states
- Real-time status updates
- Error handling
- Dynamic attribute updates

**Props:**
```typescript
interface MTNMobileMoneyWidgetProps {
  apiUserId: string;           // Your MTN API user ID (UUID)
  amount: number;              // Payment amount
  currency: string;            // Currency code (e.g., 'GHS', 'EUR')
  externalId: string;          // Your payment reference
  onPaymentCreated?: (invoice: any) => void;
  onPaymentSuccess?: (invoice: any) => void;
  onPaymentFailed?: (invoice: any) => void;
  onPaymentCanceled?: (invoice: any) => void;
  className?: string;
}
```

### 2. MTNMobileMoneyPaymentModal (`components/dashboard/MTNMobileMoneyPaymentModal.tsx`)

A complete payment modal that handles the entire MTN Mobile Money payment flow.

**Features:**
- Payment initiation
- Real-time status monitoring
- Payment verification
- Error handling
- Success/failure callbacks

### 3. useMTNPaymentVerification Hook (`hooks/scaffold-eth/useMTNPaymentVerification.ts`)

A custom React hook for managing payment verification state and polling.

**Features:**
- Payment verification
- Status polling
- Error handling
- State management

**Usage:**
```typescript
const {
  verificationState,
  verifyPayment,
  resetVerification,
  startPolling,
  stopPolling
} = useMTNPaymentVerification();
```

### 4. Payment Service Updates (`services/paymentService.ts`)

Extended payment service with MTN Mobile Money specific methods.

**New Methods:**
- `processMTNMobileMoneyPayment()` - Process payment verification
- `verifyMTNPaymentStatus()` - Check payment status via API

## Integration Steps

### 1. Environment Configuration

First, configure your MTN API credentials in `.env.local`:

```env
# MTN Mobile Money API Configuration
MTN_SUBSCRIPTION_KEY=your-subscription-key-here
MTN_API_USER_ID=your-api-user-id-here
MTN_API_KEY=your-api-key-here
MTN_ENVIRONMENT=sandbox
MTN_TARGET_ENVIRONMENT=sandbox
```

**Quick Setup:**
Run the automated setup script:
```bash
node scripts/setup-mtn-integration.js
```

### 2. Add Script to HTML Head

The MTN Mobile Money widget script is already added to `app/layout.tsx`:

```html
<script 
  src="https://widget.northeurope.cloudapp.azure.com:9443/v0.1.0/mobile-money-widget-mtn.js"
  async
/>
```

### 3. Backend API Endpoints

The integration includes complete backend API endpoints for MTN Collections API:

#### Authentication Endpoint
`POST /api/mtn/auth`
- Creates OAuth2 access token for MTN API
- Returns access token and expiration time

#### Payment Request Endpoint  
`POST /api/mtn/request-payment`
- Creates a requestToPay transaction
- Requires: amount, currency, externalId, phoneNumber
- Returns: referenceId for tracking

#### Payment Status Endpoint
`GET /api/mtn/payment-status/[referenceId]`
- Checks payment status using MTN API
- Returns: status, amount, financialTransactionId, etc.

### 4. Use the Widget Component

```tsx
import { MTNMobileMoneyWidget } from './components/dashboard/MTNMobileMoneyWidget';

<MTNMobileMoneyWidget
  apiUserId="your-api-user-id"
  amount={100}
  currency="GHS"
  externalId="PAYMENT-123"
  onPaymentSuccess={(invoice) => {
    console.log('Payment successful:', invoice);
    // Handle successful payment
  }}
  onPaymentFailed={(invoice) => {
    console.log('Payment failed:', invoice);
    // Handle failed payment
  }}
/>
```

### 5. Use the Enhanced Payment Modal (Recommended)

```tsx
import { EnhancedMTNPaymentModal } from './components/dashboard/EnhancedMTNPaymentModal';

<EnhancedMTNPaymentModal
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  onPaymentSuccess={(paymentData) => {
    // Create virtual card after successful payment
    console.log('Payment successful:', paymentData);
    createVirtualCard(cardData);
  }}
  amount={totalAmount}
  currency="GHS"
  externalId={`CARD-${Date.now()}-${totalAmount}`}
/>
```

### 6. Use the Payment Modal (Widget-based)

```tsx
import { MTNMobileMoneyPaymentModal } from './components/dashboard/MTNMobileMoneyPaymentModal';

<MTNMobileMoneyPaymentModal
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  onPaymentSuccess={(invoice) => {
    // Create virtual card after successful payment
    createVirtualCard(cardData);
  }}
  amount={totalAmount}
  currency="GHS"
  externalId={`CARD-${Date.now()}-${totalAmount}`}
/>
```

## Payment Flow

1. **User initiates payment** - Clicks payment button
2. **Widget loads** - MTN widget initializes with payment details
3. **User redirected** - Widget redirects to MTN payment system
4. **Payment completed** - User completes payment on mobile device
5. **Payment verification** - System verifies payment with MTN API
6. **Card creation** - Virtual card is created upon successful verification

## Event Handling

The integration listens to four MTN widget events:

### mobile-money-qr-payment-created
Triggered when payment is initiated and invoice is created.

```typescript
window.addEventListener("mobile-money-qr-payment-created", (event) => {
  console.log("Invoice created:", event.detail);
  // Start polling for payment status
});
```

### mobile-money-qr-payment-successful
Triggered when payment is completed successfully.

```typescript
window.addEventListener("mobile-money-qr-payment-successful", (event) => {
  console.log("Payment successful:", event.detail);
  // Verify payment and create card
});
```

### mobile-money-qr-payment-failed
Triggered when payment fails.

```typescript
window.addEventListener("mobile-money-qr-payment-failed", (event) => {
  console.log("Payment failed:", event.detail);
  // Handle payment failure
});
```

### mobile-money-qr-payment-canceled
Triggered when user cancels payment.

```typescript
window.addEventListener("mobile-money-qr-payment-canceled", (event) => {
  console.log("Payment canceled:", event.detail);
  // Handle payment cancellation
});
```

## Testing

### Sandbox Environment

The integration uses MTN's sandbox environment for testing. Different amounts trigger different responses:

- **GHS 1-19**: PENDING status
- **GHS 20-79**: FAILED status  
- **GHS 80+**: SUCCESSFUL status

### Demo Component

Use the `MTNPaymentDemo` component to test the integration:

```tsx
import { MTNPaymentDemo } from './components/dashboard/MTNPaymentDemo';

<MTNPaymentDemo />
```

## Configuration

### API User ID

Replace the demo API user ID with your actual MTN API user ID:

```typescript
const apiUserId = 'your-actual-api-user-id'; // Replace demo UUID
```

### Production Script

For production, replace the sandbox script URL with the production URL:

```html
<script src="TODO_REPLACE_WITH_PRODUCTION_PATH"></script>
```

## Error Handling

The integration includes comprehensive error handling:

- **Widget loading errors** - Fallback UI when widget fails to load
- **Payment verification errors** - Retry mechanisms and user feedback
- **Network errors** - Timeout handling and retry logic
- **API errors** - Graceful degradation and error messages

## Security Considerations

- **API User ID** - Store securely, never expose in client-side code
- **Payment verification** - Always verify payments server-side
- **HTTPS** - Ensure all communications are encrypted
- **Input validation** - Validate all payment data before processing

## Browser Support

The widget supports:
- Modern evergreen browsers
- Internet Explorer 11+
- Mobile browsers

## Troubleshooting

### Widget Not Loading
- Check if script is loaded correctly
- Verify API user ID format (must be valid UUID)
- Check browser console for errors

### Payment Not Verifying
- Ensure payment was actually completed
- Check network connectivity
- Verify API credentials
- Check payment status with MTN support

### Events Not Firing
- Ensure event listeners are attached before widget initialization
- Check if widget is properly initialized
- Verify all required attributes are present

## Support

For MTN Mobile Money API support:
- [MTN Developer Portal](https://momodeveloper.mtn.com/)
- [API Documentation](https://momodeveloper.mtn.com/widget-api)
- [Support Center](https://momodeveloper.mtn.com/support)
