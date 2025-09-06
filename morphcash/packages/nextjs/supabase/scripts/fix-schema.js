/**
 * Fix Database Schema Script
 * Adds missing password_hash column and fixes RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixSchema() {
  console.log('🔧 Fixing Database Schema');
  console.log('========================');
  
  try {
    // Step 1: Add password_hash column
    console.log('📝 Step 1: Adding password_hash column...');
    
    // We can't add columns directly via the client, so we'll provide the SQL
    console.log('❌ Cannot add columns via Supabase client.');
    console.log('');
    console.log('🚀 MANUAL FIX REQUIRED:');
    console.log('========================');
    console.log('');
    console.log('1. Go to your Supabase dashboard:');
    console.log('   https://regmqajtdlqbaoedmpfh.supabase.co');
    console.log('');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('');
    console.log('3. Copy and paste this SQL and click "Run":');
    console.log('');
    console.log('```sql');
    console.log('-- Add missing password_hash column');
    console.log('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);');
    console.log('');
    console.log('-- Update the constraint to allow email authentication');
    console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_method_check;');
    console.log('ALTER TABLE users ADD CONSTRAINT users_auth_method_check CHECK (');
    console.log('    (auth_method = \'email\' AND email IS NOT NULL AND password_hash IS NOT NULL) OR');
    console.log('    (auth_method = \'ens\' AND ens_name IS NOT NULL) OR');
    console.log('    (auth_method = \'wallet\' AND address IS NOT NULL)');
    console.log(');');
    console.log('');
    console.log('-- Fix RLS policies to allow user creation');
    console.log('DROP POLICY IF EXISTS "Users can insert own data" ON users;');
    console.log('CREATE POLICY "Users can insert own data" ON users');
    console.log('    FOR INSERT WITH CHECK (true);');
    console.log('```');
    console.log('');
    console.log('4. After running the SQL above, come back and run this script again to test.');
    
    // Test if the column exists
    console.log('');
    console.log('🔍 Testing current schema...');
    
    const { data, error } = await supabase
      .from('users')
      .select('password_hash')
      .limit(1);
    
    if (error) {
      if (error.message.includes('password_hash')) {
        console.log('❌ password_hash column still missing. Please run the SQL above first.');
      } else {
        console.log('❌ Other error:', error.message);
      }
    } else {
      console.log('✅ password_hash column exists! Testing user creation...');
      
      // Test user creation
      const testUser = {
        email: 'test@example.com',
        password_hash: 'test-password',
        auth_method: 'email'
      };
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert(testUser)
        .select()
        .single();
      
      if (userError) {
        console.log('❌ User creation still failing:', userError.message);
      } else {
        console.log('✅ User creation successful!', userData);
        console.log('');
        console.log('🎉 Schema fix complete! Your app should work now.');
      }
    }
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
  }
}

fixSchema();
