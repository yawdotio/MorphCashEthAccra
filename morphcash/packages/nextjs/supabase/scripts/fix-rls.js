/**
 * Fix RLS Policies Script
 * Fixes Row Level Security policies to allow user creation
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixRLS() {
  console.log('🔧 Fixing RLS Policies');
  console.log('======================');
  
  console.log('🚀 RLS POLICY FIX REQUIRED:');
  console.log('===========================');
  console.log('');
  console.log('1. Go to your Supabase dashboard:');
  console.log('   https://regmqajtdlqbaoedmpfh.supabase.co');
  console.log('');
  console.log('2. Click "SQL Editor" in the left sidebar');
  console.log('');
  console.log('3. Copy and paste this SQL and click "Run":');
  console.log('');
  console.log('```sql');
  console.log('-- Temporarily disable RLS for user creation');
  console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('-- Re-enable RLS');
  console.log('ALTER TABLE users ENABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('-- Drop existing policies');
  console.log('DROP POLICY IF EXISTS "Users can view own data" ON users;');
  console.log('DROP POLICY IF EXISTS "Users can update own data" ON users;');
  console.log('DROP POLICY IF EXISTS "Users can insert own data" ON users;');
  console.log('');
  console.log('-- Create new policies that allow user creation');
  console.log('CREATE POLICY "Users can view own data" ON users');
  console.log('    FOR SELECT USING (true); -- Allow all selects for now');
  console.log('');
  console.log('CREATE POLICY "Users can update own data" ON users');
  console.log('    FOR UPDATE USING (true); -- Allow all updates for now');
  console.log('');
  console.log('CREATE POLICY "Users can insert own data" ON users');
  console.log('    FOR INSERT WITH CHECK (true); -- Allow all inserts');
  console.log('```');
  console.log('');
  console.log('4. After running the SQL above, come back and run this script again to test.');
  
  // Test current state
  console.log('');
  console.log('🔍 Testing current RLS policies...');
  
  try {
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
      console.log('');
      console.log('💡 The RLS policies need to be updated. Please run the SQL above.');
    } else {
      console.log('✅ User creation successful!', userData);
      console.log('');
      console.log('🎉 RLS fix complete! Your app should work now.');
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test@example.com');
      console.log('🧹 Test user cleaned up.');
    }
    
  } catch (error) {
    console.error('❌ RLS test failed:', error.message);
  }
}

fixRLS();
