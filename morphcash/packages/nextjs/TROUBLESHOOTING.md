# 🛠️ MorphCash Troubleshooting Guide

This guide helps you resolve common issues when using MorphCash.

## 🚨 "Failed to Create User" Error

### **Problem**
When trying to sign up, you get an error message: "Failed to create user"

### **Root Cause**
This error occurs because the database is not properly configured. The system is trying to connect to Supabase, but the credentials are missing or incorrect.

### **Solutions**

#### **Option 1: Quick Setup (Recommended)**
Run the automated setup script:

```bash
cd packages/nextjs
node scripts/setup-environment.js
```

Follow the prompts and choose **"Demo Mode"** if you just want to test the application without setting up a database.

#### **Option 2: Manual Configuration**

1. **Create `.env.local` file**:
   ```bash
   cd packages/nextjs
   cp env.example .env.local
   ```

2. **For Demo Mode** (no database setup required):
   ```env
   # Add these to your .env.local file
   NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
   NEXT_PUBLIC_DATABASE_URL=http://localhost:3001/api
   NEXT_PUBLIC_DATABASE_API_KEY=demo-key
   NEXT_PUBLIC_ENCRYPTION_KEY=demo-encryption-key-change-in-production
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=3a8170812b534d0ff9d794f19a901d64
   NEXT_PUBLIC_ALCHEMY_API_KEY=oKxs-03sij-U_N0iOlrSsZFr29-IqbuF
   NODE_ENV=development
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

#### **Option 3: Set Up Real Database (Supabase)**

1. **Sign up for Supabase**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new account and project

2. **Get your credentials**:
   - In your Supabase dashboard, go to Settings → API
   - Copy your Project URL and anon/public API key

3. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up database tables**:
   - Go to your Supabase dashboard → SQL Editor
   - Run the SQL script from `supabase/schema.sql`

## 🔄 Other Common Issues

### **"Contract not deployed" Error**

**Problem**: Smart contract functions are not working.

**Solution**:
```bash
cd packages/hardhat
npm run deploy
```

### **Wallet Connection Issues**

**Problem**: Cannot connect wallet or transactions fail.

**Solutions**:
1. Make sure you have a Web3 wallet installed (MetaMask, etc.)
2. Switch to the correct network (localhost for development)
3. Check if you have test ETH in your wallet

### **MTN Mobile Money Not Working**

**Problem**: MTN payments fail or don't work.

**Solutions**:
1. Make sure you've configured MTN API credentials in `.env.local`
2. For testing, use amounts > 80 GHS for successful payments
3. Use valid MTN phone numbers (024XXXXXXX, 054XXXXXXX, 055XXXXXXX)

### **Page Not Found (404) Errors**

**Problem**: Dashboard or other pages show 404 errors.

**Solutions**:
1. Make sure you're logged in before accessing protected pages
2. Clear browser cache and cookies
3. Restart the development server

### **Environment Variables Not Loading**

**Problem**: Configuration not taking effect.

**Solutions**:
1. Ensure `.env.local` is in the `packages/nextjs` directory
2. Restart the development server after making changes
3. Check that variable names match exactly (case-sensitive)

## 🚀 Development Setup Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] **Environment Variables**
  - [ ] `.env.local` file exists in `packages/nextjs`
  - [ ] Database credentials configured (or demo mode enabled)
  - [ ] WalletConnect Project ID set
  - [ ] Alchemy API key set

- [ ] **Dependencies**
  - [ ] `npm install` run in root `morphcash` directory
  - [ ] All packages installed successfully

- [ ] **Smart Contracts**
  - [ ] Hardhat local network running (`npm run chain`)
  - [ ] Contracts deployed (`npm run deploy`)

- [ ] **Development Server**
  - [ ] Frontend running (`npm run dev`)
  - [ ] No console errors in browser
  - [ ] Can access localhost:3000

- [ ] **Database (if using Supabase)**
  - [ ] Supabase project created
  - [ ] Database tables created
  - [ ] API credentials configured

## 🔍 Debug Mode

Enable debug mode to see more detailed error messages:

1. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_DEBUG=true
   ```

2. **Check browser console** for detailed error messages

3. **Check terminal output** for server-side errors

## 📞 Getting Help

If you're still having issues:

1. **Check the logs**:
   - Browser console (F12)
   - Terminal where you ran `npm run dev`
   - Hardhat terminal (if running contracts)

2. **Common file locations**:
   - Environment config: `packages/nextjs/.env.local`
   - Contracts: `packages/hardhat/contracts/`
   - Frontend: `packages/nextjs/app/`

3. **Restart everything**:
   ```bash
   # Stop all processes (Ctrl+C)
   # Then restart:
   cd packages/nextjs
   npm run dev
   
   # In a new terminal:
   cd packages/hardhat
   npm run chain
   
   # In another terminal:
   cd packages/hardhat
   npm run deploy
   ```

## ✅ Test Your Setup

After following the troubleshooting steps, test your setup:

1. **Visit** `http://localhost:3000`
2. **Click** "Get Started" or "Sign Up"
3. **Try** creating an account with:
   - ENS name (if you have one)
   - Email and password
   - Wallet connection

If signup works, your environment is properly configured! 🎉

## 🎯 Quick Demo Mode Setup

For the fastest setup without any external dependencies:

```bash
cd packages/nextjs

# Create minimal .env.local for demo mode
echo "NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
NEXT_PUBLIC_DATABASE_URL=http://localhost:3001/api
NEXT_PUBLIC_DATABASE_API_KEY=demo-key
NEXT_PUBLIC_ENCRYPTION_KEY=demo-encryption-key-change-in-production
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=3a8170812b534d0ff9d794f19a901d64
NEXT_PUBLIC_ALCHEMY_API_KEY=oKxs-03sij-U_N0iOlrSsZFr29-IqbuF
NODE_ENV=development" > .env.local

# Start the application
npm run dev
```

This will allow you to test the application with mock data and no external database dependencies.

---

**Still need help?** Check the other documentation files:
- `ENVIRONMENT_SETUP.md` - Detailed environment configuration
- `SETUP_COMPLETE.md` - Complete setup instructions  
- `SIMULATED_CARD_SYSTEM.md` - Virtual card system documentation
