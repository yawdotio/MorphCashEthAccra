/**
 * Check Database Schema Script
 * Verifies what columns exist in the users table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('🔍 Checking Database Schema');
  console.log('==========================');
  
  try {
    // Check if we can access the users table
    console.log('📋 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
      return;
    }
    
    console.log('✅ Users table accessible');
    
    // Try to get table structure by attempting different column selections
    console.log('\n🔍 Testing column existence...');
    
    const columnsToTest = [
      'id', 'email', 'password_hash', 'address', 'ens_name', 
      'auth_method', 'created_at', 'updated_at'
    ];
    
    for (const column of columnsToTest) {
      try {
        const { error } = await supabase
          .from('users')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ Column '${column}' - ${error.message}`);
        } else {
          console.log(`✅ Column '${column}' exists`);
        }
      } catch (err) {
        console.log(`❌ Column '${column}' - ${err.message}`);
      }
    }
    
    console.log('\n📋 Migration Status Check:');
    console.log('==========================');
    console.log('If you see missing columns above, you need to run the database migrations.');
    console.log('');
    console.log('🚀 To fix this:');
    console.log('1. Go to your Supabase dashboard: https://regmqajtdlqbaoedmpfh.supabase.co');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Run the migration files in order:');
    console.log('   - 001_initial_schema.sql');
    console.log('   - 002_indexes_and_triggers.sql');
    console.log('   - 003_rls_policies.sql');
    console.log('   - 004_functions_and_views.sql');
    console.log('');
    console.log('📁 Migration files are in: ./supabase/migrations/');
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkSchema();
