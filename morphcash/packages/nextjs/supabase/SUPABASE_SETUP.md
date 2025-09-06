# Supabase Setup Guide for MorphCash

This guide will help you set up Supabase as your database provider for the MorphCash application.

## Prerequisites

- A Supabase account (free at [supabase.com](https://supabase.com))
- Node.js and npm/yarn installed
- Your MorphCash project ready

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `morphcash` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project.supabase.co`)
   - **Project API Key** (anon/public key)
   - **Project ID** (found in the URL or project settings)

## Step 3: Install Supabase Client

```bash
cd morphcash/packages/nextjs
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

## Step 4: Set Up Environment Variables

Create a `.env.local` file in `packages/nextjs/`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-project-id

# Database Configuration (for compatibility)
NEXT_PUBLIC_DATABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_DATABASE_API_KEY=your-anon-key-here
NEXT_PUBLIC_DATABASE_PROJECT_ID=your-project-id

# Encryption
NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-encryption-key-here

# Features
NEXT_PUBLIC_ENABLE_CACHING=true
NEXT_PUBLIC_CACHE_TIMEOUT=300000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
```

## Step 5: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project:
   ```bash
   cd morphcash/packages/nextjs
   supabase init
   ```

3. Link to your remote project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

## Step 6: Configure Row Level Security (RLS)

The schema includes RLS policies, but you may need to enable them:

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Ensure RLS is enabled for all tables
3. The policies should be automatically created from the schema

## Step 7: Set Up Authentication (Optional)

If you want to use Supabase Auth alongside wallet authentication:

1. Go to **Authentication** → **Settings**
2. Configure your authentication providers
3. Set up email templates if needed
4. Configure redirect URLs

## Step 8: Test the Connection

1. Start your development server:
   ```bash
   yarn start
   ```

2. Check the browser console for any connection errors
3. Try creating a user account
4. Verify data is being stored in Supabase

## Step 9: Set Up Real-time (Optional)

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Enable real-time for the tables you want to sync
3. The application will automatically use real-time features

## Step 10: Configure Storage (Optional)

For file uploads (avatars, documents):

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `morphcash-files`
3. Set up appropriate policies for file access
4. Update your environment variables if needed

## Environment Variables Reference

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

## Database Schema Overview

The schema includes these main tables:

- **users**: User profiles and authentication data
- **virtual_cards**: Virtual card management
- **transactions**: Transaction history
- **payment_methods**: Encrypted payment method storage
- **sessions**: User session management
- **kyc_documents**: KYC document storage

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Encrypted Storage**: Sensitive data is encrypted
- **Session Management**: Secure session handling
- **API Key Protection**: Proper key management

## Monitoring and Analytics

1. Go to **Logs** in your Supabase dashboard to monitor API usage
2. Use **Database** → **Logs** to monitor database performance
3. Set up alerts for unusual activity

## Troubleshooting

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

## Production Deployment

1. **Set up production environment variables**
2. **Configure production database**
3. **Set up monitoring and alerts**
4. **Configure backup strategies**
5. **Set up CDN for file storage**

## Support

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

## Next Steps

After setting up Supabase:

1. **Test all features** to ensure they work correctly
2. **Set up monitoring** for your database
3. **Configure backups** for production
4. **Set up analytics** to track usage
5. **Plan for scaling** as your user base grows

Your MorphCash application is now ready to use Supabase as the persistent storage backend!
