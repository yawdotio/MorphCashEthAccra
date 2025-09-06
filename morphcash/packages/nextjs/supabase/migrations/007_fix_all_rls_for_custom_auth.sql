-- Migration: Fix All RLS Policies for Custom Authentication
-- Description: Updates all RLS policies to work with custom authentication system
-- Date: 2024-01-01
-- Version: 1.0.4

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

DROP POLICY IF EXISTS "Users can view own cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can update own cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON virtual_cards;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can insert own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete own payment methods" ON payment_methods;

DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;

DROP POLICY IF EXISTS "Users can view own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON kyc_documents;

-- Create permissive policies for custom authentication
-- Note: In production, implement proper authorization at the application level

-- Users policies
CREATE POLICY "Allow all user operations" ON users
    FOR ALL USING (true);

-- Virtual cards policies
CREATE POLICY "Allow all virtual card operations" ON virtual_cards
    FOR ALL USING (true);

-- Transactions policies
CREATE POLICY "Allow all transaction operations" ON transactions
    FOR ALL USING (true);

-- Payment methods policies
CREATE POLICY "Allow all payment method operations" ON payment_methods
    FOR ALL USING (true);

-- Sessions policies
CREATE POLICY "Allow all session operations" ON sessions
    FOR ALL USING (true);

-- KYC documents policies
CREATE POLICY "Allow all document operations" ON kyc_documents
    FOR ALL USING (true);

-- Note: These permissive policies allow all operations on all tables.
-- In a production environment, you should implement proper authorization
-- at the application level and use more restrictive RLS policies based
-- on your specific business logic and security requirements.
