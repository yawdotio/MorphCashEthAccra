-- Migration: Fix Virtual Cards Access for All Authenticated Users
-- Description: Updates RLS policies for virtual cards to allow access for all authenticated users
-- Date: 2024-01-01
-- Version: 1.0.5

-- Drop existing virtual cards policies
DROP POLICY IF EXISTS "Users can view own cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can update own cards" ON virtual_cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON virtual_cards;
DROP POLICY IF EXISTS "Allow all virtual card operations" ON virtual_cards;

-- Create new permissive policy for virtual cards
-- This allows all authenticated users (email, wallet, ENS) to access virtual cards
CREATE POLICY "Allow all virtual card operations" ON virtual_cards
    FOR ALL USING (true);

-- Note: This policy allows all operations on virtual_cards for all users.
-- This is appropriate since you want all authenticated users to be able to
-- view and interact with virtual cards regardless of their authentication method.
