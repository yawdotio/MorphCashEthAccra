/**
 * Remove Account Type Script
 * Provides SQL to remove account_type column from the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function removeAccountType() {
  console.log('🔧 Remove Account Type Migration');
  console.log('================================');
  
  console.log('🚀 DATABASE MIGRATION REQUIRED:');
  console.log('===============================');
  console.log('');
  console.log('1. Go to your Supabase dashboard:');
  console.log('   https://regmqajtdlqbaoedmpfh.supabase.co');
  console.log('');
  console.log('2. Click "SQL Editor" in the left sidebar');
  console.log('');
  console.log('3. Copy and paste this SQL and click "Run":');
  console.log('');
  console.log('```sql');
  console.log('-- Remove account_type column from users table');
  console.log('ALTER TABLE users DROP COLUMN IF EXISTS account_type;');
  console.log('');
  console.log('-- Drop the account_type enum type');
  console.log('DROP TYPE IF EXISTS account_type CASCADE;');
  console.log('');
  console.log('-- Update the user_dashboard view to remove account_type reference');
  console.log('DROP VIEW IF EXISTS user_dashboard;');
  console.log('CREATE VIEW user_dashboard AS');
  console.log('SELECT ');
  console.log('    u.id,');
  console.log('    u.address,');
  console.log('    u.ens_name,');
  console.log('    u.email,');
  console.log('    u.ens_profile,');
  console.log('    u.created_at,');
  console.log('    u.last_login_at,');
  console.log('    COALESCE(card_stats.total_cards, 0) as total_cards,');
  console.log('    COALESCE(card_stats.active_cards, 0) as active_cards,');
  console.log('    COALESCE(tx_stats.total_transactions, 0) as total_transactions,');
  console.log('    COALESCE(tx_stats.total_spent, 0) as total_spent,');
  console.log('    tx_stats.last_transaction_at');
  console.log('FROM users u');
  console.log('LEFT JOIN (');
  console.log('    SELECT ');
  console.log('        user_id,');
  console.log('    COUNT(*) as total_cards,');
  console.log('    COUNT(*) FILTER (WHERE is_active = true) as active_cards');
  console.log('    FROM virtual_cards');
  console.log('    GROUP BY user_id');
  console.log(') card_stats ON u.id = card_stats.user_id');
  console.log('LEFT JOIN (');
  console.log('    SELECT ');
  console.log('        user_id,');
  console.log('    COUNT(*) as total_transactions,');
  console.log('    SUM(amount) as total_spent,');
  console.log('    MAX(created_at) as last_transaction_at');
  console.log('    FROM transactions');
  console.log('    WHERE status = \'completed\'');
  console.log('    GROUP BY user_id');
  console.log(') tx_stats ON u.id = tx_stats.user_id;');
  console.log('```');
  console.log('');
  console.log('4. After running the SQL above, come back and run this script again to test.');
  
  // Test current state
  console.log('');
  console.log('🔍 Testing current schema...');
  
  try {
    // Check if account_type column still exists
    const { data, error } = await supabase
      .from('users')
      .select('account_type')
      .limit(1);
    
    if (error) {
      if (error.message.includes('account_type')) {
        console.log('✅ account_type column has been removed!');
        console.log('');
        console.log('🎉 Migration complete! Your app should work without account_type now.');
      } else {
        console.log('❌ Other error:', error.message);
      }
    } else {
      console.log('❌ account_type column still exists. Please run the SQL above first.');
    }
    
  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
  }
}

removeAccountType();
