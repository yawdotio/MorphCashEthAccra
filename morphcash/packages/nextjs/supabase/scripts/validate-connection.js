/**
 * Supabase Connection Validation Script
 * Validates Supabase connection and provides migration instructions
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateConnection() {
  console.log('🔧 MorphCash Supabase Connection Validation');
  console.log('==========================================');
  
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\n📋 Next Steps:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the migration files in order:');
      console.log('   - 001_initial_schema.sql');
      console.log('   - 002_indexes_and_triggers.sql');
      console.log('   - 003_rls_policies.sql');
      console.log('   - 004_functions_and_views.sql');
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log(`📍 Project URL: ${supabaseUrl}`);
    console.log(`📊 User count: ${data?.length || 0}`);
    
    console.log('\n📋 Database Migration Instructions:');
    console.log('=====================================');
    console.log('Since the Supabase client cannot execute raw SQL directly,');
    console.log('please follow these steps to set up your database:');
    console.log('');
    console.log('1. 🌐 Go to your Supabase project dashboard:');
    console.log(`   ${supabaseUrl.replace('/rest/v1', '')}`);
    console.log('');
    console.log('2. 📝 Navigate to "SQL Editor" in the left sidebar');
    console.log('');
    console.log('3. 📄 Run each migration file in order:');
    console.log('   • Copy and paste the content of 001_initial_schema.sql');
    console.log('   • Click "Run" and wait for completion');
    console.log('   • Repeat for 002_indexes_and_triggers.sql');
    console.log('   • Repeat for 003_rls_policies.sql');
    console.log('   • Repeat for 004_functions_and_views.sql');
    console.log('');
    console.log('4. ✅ Verify tables were created in "Table Editor"');
    console.log('');
    console.log('📁 Migration files location:');
    console.log('   ./supabase/migrations/');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Run validation
validateConnection().catch(console.error);
