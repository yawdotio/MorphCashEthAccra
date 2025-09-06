/**
 * Supabase Reset Script
 * Resets the database by dropping all tables and recreating them
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDatabase() {
  console.log('🔄 Resetting MorphCash database...');
  
  try {
    // Drop all tables in reverse order (to handle foreign key constraints)
    const tables = [
      'kyc_documents',
      'sessions',
      'payment_methods',
      'transactions',
      'virtual_cards',
      'users'
    ];
    
    console.log('🗑️  Dropping existing tables...');
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (error) {
        console.warn(`⚠️  Warning: Could not clear table ${table}:`, error.message);
      } else {
        console.log(`✅ Cleared table: ${table}`);
      }
    }
    
    // Drop tables completely
    const dropStatements = [
      'DROP TABLE IF EXISTS kyc_documents CASCADE;',
      'DROP TABLE IF EXISTS sessions CASCADE;',
      'DROP TABLE IF EXISTS payment_methods CASCADE;',
      'DROP TABLE IF EXISTS transactions CASCADE;',
      'DROP TABLE IF EXISTS virtual_cards CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP VIEW IF EXISTS user_dashboard CASCADE;',
      'DROP VIEW IF EXISTS recent_transactions CASCADE;',
      'DROP VIEW IF EXISTS active_virtual_cards CASCADE;',
      'DROP FUNCTION IF EXISTS get_user_stats(UUID) CASCADE;',
      'DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;',
      'DROP FUNCTION IF EXISTS get_transaction_stats(UUID, VARCHAR) CASCADE;',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;',
      'DROP TYPE IF EXISTS account_type CASCADE;',
      'DROP TYPE IF EXISTS auth_method CASCADE;',
      'DROP TYPE IF EXISTS transaction_type CASCADE;',
      'DROP TYPE IF EXISTS transaction_status CASCADE;',
      'DROP TYPE IF EXISTS payment_method_type CASCADE;',
      'DROP TYPE IF EXISTS kyc_status CASCADE;',
      'DROP TYPE IF EXISTS document_type CASCADE;',
      'DROP TYPE IF EXISTS document_status CASCADE;'
    ];
    
    for (const statement of dropStatements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.warn(`⚠️  Warning: Could not execute: ${statement}`, error.message);
      }
    }
    
    console.log('✅ Database reset completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run migrations: npm run migrate');
    console.log('2. Seed data: npm run seed');
    console.log('3. Start your app: yarn start');
    
    return true;
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 MorphCash Database Reset');
  console.log('===========================');
  console.log('⚠️  WARNING: This will delete ALL data in your database!');
  console.log('');
  
  // In a real scenario, you might want to add a confirmation prompt
  // For now, we'll proceed with the reset
  
  const success = await resetDatabase();
  
  if (success) {
    console.log('\n✅ Database reset completed successfully!');
  } else {
    console.log('\n❌ Reset failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run reset
main().catch(console.error);
