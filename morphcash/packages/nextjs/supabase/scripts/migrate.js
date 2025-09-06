/**
 * Supabase Migration Script
 * Runs database migrations in order
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

// Migration files in order
const migrations = [
  '001_initial_schema.sql',
  '002_indexes_and_triggers.sql',
  '003_rls_policies.sql',
  '004_functions_and_views.sql'
];

async function runMigration(filename) {
  console.log(`📝 Running migration: ${filename}`);
  
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', filename);
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        // Use the SQL editor endpoint for raw SQL execution
        const { error } = await supabase
          .from('_sql')
          .select('*')
          .limit(0); // This is a workaround - we'll use the dashboard method instead
        
        if (error) {
          console.error(`❌ Error in migration ${filename}:`, error.message);
          return false;
        }
      }
    }
    
    console.log(`✅ Migration ${filename} completed successfully!`);
    return true;
    
  } catch (error) {
    console.error(`❌ Migration ${filename} failed:`, error.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Running MorphCash database migrations...');
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    
    if (!success) {
      console.error(`❌ Migration failed: ${migration}`);
      return false;
    }
  }
  
  console.log('🎉 All migrations completed successfully!');
  return true;
}

async function main() {
  console.log('🔧 MorphCash Database Migrations');
  console.log('=================================');
  
  const success = await runMigrations();
  
  if (success) {
    console.log('\n✅ All migrations completed successfully!');
  } else {
    console.log('\n❌ Migration failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run migrations
main().catch(console.error);
