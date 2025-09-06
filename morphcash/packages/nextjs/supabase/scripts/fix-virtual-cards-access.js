#!/usr/bin/env node

/**
 * Fix Virtual Cards Access Script
 * 
 * This script provides instructions to fix the RLS policies for virtual cards
 * so that all authenticated users (email, wallet, ENS) can view virtual cards.
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Virtual Cards Access Fix');
console.log('===========================');
console.log('');

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  process.exit(1);
}

console.log('✅ Supabase configuration found');
console.log('');

console.log('📋 To fix virtual cards access for all authenticated users, please follow these steps:');
console.log('');
console.log('1. Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard');
console.log('');
console.log('2. Navigate to your project and go to:');
console.log('   SQL Editor (in the left sidebar)');
console.log('');
console.log('3. Run the following SQL commands:');
console.log('');
console.log('   -- Drop existing virtual cards policies');
console.log('   DROP POLICY IF EXISTS "Users can view own cards" ON virtual_cards;');
console.log('   DROP POLICY IF EXISTS "Users can insert own cards" ON virtual_cards;');
console.log('   DROP POLICY IF EXISTS "Users can update own cards" ON virtual_cards;');
console.log('   DROP POLICY IF EXISTS "Users can delete own cards" ON virtual_cards;');
console.log('   DROP POLICY IF EXISTS "Allow all virtual card operations" ON virtual_cards;');
console.log('');
console.log('   -- Create new policies that work with custom authentication');
console.log('   CREATE POLICY "Allow all virtual card operations" ON virtual_cards');
console.log('       FOR ALL USING (true);');
console.log('');
console.log('4. Click "Run" to execute the SQL commands');
console.log('');
console.log('5. Test your application - email-authenticated users should now be able to view virtual cards!');
console.log('');
console.log('💡 This creates a permissive policy for virtual cards that allows all operations');
console.log('   for all users, regardless of authentication method (email, wallet, ENS).');
console.log('');

// Test connection
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🧪 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('');
    console.log('🚀 You can now proceed with the virtual cards access fix above!');
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

testConnection();
