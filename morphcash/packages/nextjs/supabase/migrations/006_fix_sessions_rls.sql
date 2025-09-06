-- Migration: Fix Sessions RLS Policies
-- Description: Updates RLS policies for sessions table to work with custom auth
-- Date: 2024-01-01
-- Version: 1.0.3

-- Drop existing sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;

-- Create new sessions policies that work with custom authentication
-- For now, we'll use permissive policies since we're handling auth at the application level
CREATE POLICY "Allow all session operations" ON sessions
    FOR ALL USING (true);

-- Alternative: If you want more restrictive policies, you can use:
-- CREATE POLICY "Allow session creation" ON sessions
--     FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow session reading" ON sessions
--     FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow session updates" ON sessions
--     FOR UPDATE USING (true);
-- 
-- CREATE POLICY "Allow session deletion" ON sessions
--     FOR DELETE USING (true);
