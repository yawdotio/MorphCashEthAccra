# 🚀 MorphCash Quick Start Guide

Get MorphCash up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))

## Step 1: Clone and Install

```bash
# Navigate to your project
cd morphcash/packages/nextjs

# Install dependencies
yarn install
```

## Step 2: Set Up Supabase (Required)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Create your project (takes 2-3 minutes)

### 2.2 Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **Project API Key** (the `anon` key)

### 2.3 Set Up Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql` 
3. Paste and run it in the SQL editor

## Step 3: Configure Environment

### Option A: Automated Setup (Recommended)
```bash
node scripts/setup-environment.js
```
Follow the prompts to enter your Supabase credentials.

### Option B: Manual Setup
```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local and add your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_ENCRYPTION_KEY=your-32-character-encryption-key
```

## Step 4: Start the Application

### Terminal 1: Start Blockchain
```bash
cd ../hardhat
yarn chain
```

### Terminal 2: Deploy Contracts
```bash
cd ../hardhat
yarn deploy
```

### Terminal 3: Start Frontend
```bash
cd ../nextjs
yarn start
```

## Step 5: Open the App

Visit `http://localhost:3000` and you should see:

### In Browser Console:
```
🔗 Supabase Client Initialized: {
  status: 'CONNECTED',
  url: 'https://your-project.supabase.co',
  projectId: 'your-project'
}

🔧 Supabase Database Service Initialized: {
  service: 'SupabaseDatabaseService',
  mode: 'Production/Database'
}
```

## ✅ You're Ready!

You can now:
- ✅ **Create accounts** with ENS, email, or wallet
- ✅ **Create virtual cards** with real payment integration
- ✅ **Use MTN Mobile Money** for funding cards
- ✅ **View transactions** and manage cards

## 🔧 Troubleshooting

### "Supabase Configuration Error"
- Make sure your `.env.local` file exists in `packages/nextjs/`
- Verify your Supabase URL and API key are correct
- Check that your Supabase project is active

### "User Creation Failed"
- Verify your database schema is set up (run `supabase/schema.sql`)
- Check Supabase dashboard for any RLS policy issues
- Ensure your API key has the right permissions

### "Contract Not Found"
- Make sure you ran `yarn deploy` in the hardhat directory
- Check that the local blockchain is running (`yarn chain`)

## 🎯 Next Steps

1. **Set up MTN Mobile Money** (optional)
   - Get credentials from [momodeveloper.mtn.com](https://momodeveloper.mtn.com)
   - Run the MTN setup script

2. **Customize the UI** 
   - Edit components in `components/dashboard/`
   - Modify colors and branding

3. **Deploy to Production**
   - Set up production Supabase project
   - Deploy to Vercel/Netlify
   - Configure environment variables

## 📚 Documentation

- **Complete Setup**: `ENVIRONMENT_SETUP.md`
- **Supabase Guide**: `supabase/SUPABASE_SETUP.md`
- **MTN Integration**: `MTN_MOBILE_MONEY_INTEGRATION.md`
- **Virtual Cards**: `SIMULATED_CARD_SYSTEM.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`

## 🆘 Need Help?

1. Check the browser console for error messages
2. Review the terminal output for any errors
3. Verify all environment variables are set correctly
4. Check that all services are running (blockchain, frontend)

---

**Happy Building!** 🎉
