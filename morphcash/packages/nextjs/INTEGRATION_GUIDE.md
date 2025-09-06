# Integration Guide: Persistent User Storage

This guide explains how to integrate the new persistent user storage solution into your MorphCash application.

## What's Been Created

### 1. Database Services
- **`services/database/`**: Complete database abstraction layer
- **`services/userService.ts`**: Centralized user management service
- **`config/database.ts`**: Database configuration and validation

### 2. Enhanced Authentication
- **`contexts/EnhancedAuthContext.tsx`**: New auth context with database integration
- **`hooks/scaffold-eth/useEnhancedVirtualCards.ts`**: Enhanced virtual cards hook

### 3. API Layer
- **`pages/api/database/[...path].ts`**: Mock API for development
- **`DATABASE_SETUP.md`**: Complete setup guide

## Integration Steps

### Step 1: Set Up Environment Variables

Create a `.env.local` file in `packages/nextjs/`:

```env
# Database Configuration
NEXT_PUBLIC_DATABASE_URL=http://localhost:3000/api/database
NEXT_PUBLIC_DATABASE_API_KEY=demo-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-encryption-key-here

# Features
NEXT_PUBLIC_ENABLE_CACHING=true
NEXT_PUBLIC_CACHE_TIMEOUT=300000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### Step 2: Replace Auth Context

Update your `app/layout.tsx` to use the enhanced auth context:

```tsx
// Replace this import
// import { AuthProvider } from "~~/contexts/AuthContext";

// With this
import { EnhancedAuthProvider } from "~~/contexts/EnhancedAuthContext";

// Replace AuthProvider with EnhancedAuthProvider
<EnhancedAuthProvider>
  {children}
</EnhancedAuthProvider>
```

### Step 3: Update Components

Replace the old auth hook with the enhanced one:

```tsx
// Replace this import
// import { useAuth } from "~~/contexts/AuthContext";

// With this
import { useEnhancedAuth } from "~~/contexts/EnhancedAuthContext";

// Update hook usage
const { user, loginWithEmail, loginWithENS, loginWithWallet } = useEnhancedAuth();
```

### Step 4: Update Virtual Cards

Replace the virtual cards hook:

```tsx
// Replace this import
// import { useVirtualCards } from "~~/hooks/scaffold-eth/useVirtualCards";

// With this
import { useEnhancedVirtualCards } from "~~/hooks/scaffold-eth/useEnhancedVirtualCards";

// Update hook usage
const { cards, createCard, updateCard, deactivateCard } = useEnhancedVirtualCards();
```

### Step 5: Test the Integration

1. Start your development server:
   ```bash
   yarn start
   ```

2. Test user registration and login
3. Test virtual card creation and management
4. Verify data persistence across page refreshes

## Key Features

### 1. Persistent User Storage
- User profiles stored in database
- ENS profiles with verification
- Personal information and preferences
- Session management

### 2. Enhanced Virtual Cards
- Hybrid on-chain + database storage
- Real-time synchronization
- Enhanced metadata and analytics
- Better error handling

### 3. Transaction History
- Complete transaction tracking
- Merchant information
- Status management
- Analytics and reporting

### 4. Secure Data Storage
- Encrypted sensitive data
- Wallet-derived encryption keys
- Secure session management
- Data validation

## Migration from Current System

### Gradual Migration
1. **Phase 1**: Deploy new system alongside existing
2. **Phase 2**: Migrate user data from localStorage
3. **Phase 3**: Update components to use new services
4. **Phase 4**: Remove old localStorage dependencies

### Data Migration
```typescript
// Example migration script
const migrateUserData = async () => {
  const existingUsers = JSON.parse(localStorage.getItem("morphcash_users") || "{}");
  
  for (const [key, userData] of Object.entries(existingUsers)) {
    await userService.createUser({
      address: userData.address,
      ensName: userData.ensName,
      email: userData.email,
      accountType: userData.accountType,
      authMethod: userData.authMethod,
      ensProfile: userData.ensProfile,
    });
  }
};
```

## Production Deployment

### 1. Choose a Database Provider
- **Supabase** (recommended for ease of use)
- **PlanetScale** (for MySQL compatibility)
- **MongoDB Atlas** (for NoSQL flexibility)

### 2. Set Up Production Environment
```env
NEXT_PUBLIC_DATABASE_URL=https://your-production-db.com
NEXT_PUBLIC_DATABASE_API_KEY=your-production-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-production-encryption-key
```

### 3. Deploy Database Schema
The system will automatically create the required tables when first accessed.

### 4. Set Up Monitoring
- Database performance monitoring
- Error tracking
- User analytics
- Security monitoring

## Security Considerations

### 1. Encryption
- All sensitive data is encrypted
- Wallet-derived encryption keys
- Secure key management

### 2. Authentication
- Secure session management
- Proper token validation
- Session expiration

### 3. Data Validation
- Input sanitization
- Type checking
- SQL injection prevention

### 4. Access Control
- API key management
- Rate limiting
- IP restrictions

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check environment variables
   - Verify database URL and API key
   - Check network connectivity

2. **Encryption Errors**
   - Ensure encryption key is set
   - Check key format and length
   - Verify wallet connection

3. **Session Issues**
   - Clear localStorage
   - Check session expiration
   - Verify user authentication

### Debug Mode
Enable debug logging:
```env
NEXT_PUBLIC_DEBUG_MODE=true
```

## Performance Optimization

### 1. Caching
- Enable caching for better performance
- Configure cache timeout
- Clear caches when needed

### 2. Database Optimization
- Use proper indexes
- Optimize queries
- Monitor performance

### 3. Real-time Updates
- Enable real-time features
- Use WebSocket connections
- Optimize update frequency

## Next Steps

1. **Set up your chosen database provider**
2. **Configure environment variables**
3. **Test the integration thoroughly**
4. **Deploy to production**
5. **Monitor and optimize**

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Test with the mock API first
4. Check database provider documentation

The new system provides a robust foundation for persistent user storage while maintaining compatibility with your existing smart contracts and UI components.
