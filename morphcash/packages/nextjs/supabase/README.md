# MorphCash Supabase Integration

This directory contains all the necessary files for integrating MorphCash with Supabase as the database provider.

## 📁 Directory Structure

```
supabase/
├── schema.sql                 # Complete database schema
├── migrations/                # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_indexes_and_triggers.sql
│   ├── 003_rls_policies.sql
│   └── 004_functions_and_views.sql
├── scripts/                   # Utility scripts
│   ├── setup.js              # Initial setup
│   ├── migrate.js            # Run migrations
│   ├── seed.js               # Seed sample data
│   └── reset.js              # Reset database
├── supabase.ts               # Supabase client configuration
├── types.ts                  # TypeScript types
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🚀 Quick Start

### 1. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and API key from Settings → API
3. Set up environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key
```

### 2. Install Dependencies

```bash
cd morphcash/packages/nextjs
npm install @supabase/supabase-js
```

### 3. Set Up Database

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Click "Run" to execute

#### Option B: Using Scripts
```bash
# Run setup script
npm run setup

# Or run migrations individually
npm run migrate
npm run seed
```

### 4. Test the Integration

```bash
# Start your development server
yarn start

# Check the browser console for any errors
# Try creating a user account
# Verify data is being stored in Supabase
```

## 📊 Database Schema

### Tables

- **users**: User profiles and authentication data
- **virtual_cards**: Virtual card management
- **transactions**: Transaction history
- **payment_methods**: Encrypted payment method storage
- **sessions**: User session management
- **kyc_documents**: KYC document storage

### Views

- **user_dashboard**: Aggregated user data for dashboard
- **recent_transactions**: Recent transactions with card info
- **active_virtual_cards**: Active cards with computed fields

### Functions

- **get_user_stats()**: Get user statistics
- **cleanup_expired_sessions()**: Clean up expired sessions
- **get_transaction_stats()**: Get transaction statistics by period

## 🔧 Scripts

### Setup Script
```bash
npm run setup
```
Runs the complete setup including schema creation and sample data.

### Migration Script
```bash
npm run migrate
```
Runs all database migrations in order.

### Seed Script
```bash
npm run seed
```
Populates the database with sample data for development.

### Reset Script
```bash
npm run reset
```
⚠️ **WARNING**: This will delete ALL data in your database!

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Encrypted Storage**: Sensitive data is encrypted with wallet-derived keys
- **Session Management**: Secure session handling with expiration
- **API Key Protection**: Proper key management and validation

## 📈 Performance Features

- **Indexes**: Optimized indexes for common queries
- **Triggers**: Automatic timestamp updates
- **Views**: Pre-computed aggregations
- **Real-time**: Live data synchronization

## 🧪 Development

### Sample Data

The seed script creates:
- 3 sample users (Vitalik, Alice, Bob)
- 3 virtual cards with different spending limits
- 4 sample transactions
- 3 payment methods

### Testing

1. Start your development server
2. Check the browser console for errors
3. Try creating a user account
4. Test virtual card creation
5. Verify data persistence

## 🚀 Production Deployment

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key

# Optional
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_ENABLE_CACHING=true
NEXT_PUBLIC_CACHE_TIMEOUT=300000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### Monitoring

1. Set up monitoring in Supabase dashboard
2. Configure alerts for unusual activity
3. Monitor database performance
4. Set up backup strategies

## 🔍 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your API keys
   - Verify the project URL
   - Ensure your project is active

2. **RLS Errors**
   - Check that RLS policies are properly set up
   - Verify user authentication
   - Check the policies in the Supabase dashboard

3. **Real-time Not Working**
   - Ensure real-time is enabled for your tables
   - Check your subscription code
   - Verify network connectivity

### Debug Mode

Enable debug logging:
```env
NEXT_PUBLIC_DEBUG_MODE=true
```

## 📚 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🤝 Support

- **Supabase Community**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)
- **Documentation**: [supabase.com/docs](https://supabase.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
