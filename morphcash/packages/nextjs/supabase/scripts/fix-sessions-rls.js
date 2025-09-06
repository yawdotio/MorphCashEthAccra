#!/usr/bin/env node

/**
 * Fix Sessions RLS Policies Script
 * 
 * This script provides instructions to fix the RLS policies for the sessions table
 * so that session creation works with your custom authentication system.
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Sessions RLS Policy Fix');
console.log('==========================');
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

console.log('📋 To fix the sessions RLS policy issue, please follow these steps:');
console.log('');
console.log('1. Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard');
console.log('');
console.log('2. Navigate to your project and go to:');
console.log('   SQL Editor (in the left sidebar)');
console.log('');
console.log('3. Run the following SQL commands:');
console.log('');
console.log('   -- Drop existing sessions policies');
console.log('   DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;');
console.log('   DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;');
console.log('   DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;');
console.log('   DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;');
console.log('');
console.log('   -- Create new permissive policy for sessions');
console.log('   CREATE POLICY "Allow all session operations" ON sessions');
console.log('       FOR ALL USING (true);');
console.log('');
console.log('4. Click "Run" to execute the SQL commands');
console.log('');
console.log('5. Test your application - session creation should now work!');
console.log('');
console.log('💡 Note: This creates a permissive policy for sessions since you\'re using');
console.log('   custom authentication. In production, you may want to implement');
console.log('   more restrictive policies based on your application logic.');
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
    console.log('🚀 You can now proceed with the RLS policy fix above!');
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

testConnection();
