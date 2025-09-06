/**
 * Supabase Setup Script
 * Helps set up the database schema and initial configuration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up MorphCash database...');
  
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    console.log('📝 Creating database schema...');
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error creating schema:', error.message);
      return false;
    }
    
    console.log('✅ Database schema created successfully!');
    
    // Test connection
    console.log('🔍 Testing database connection...');
    const { data, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    
    // Create sample data
    console.log('🌱 Creating sample data...');
    await createSampleData();
    
    console.log('🎉 Database setup completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

async function createSampleData() {
  // Create sample users
  const sampleUsers = [
    {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      ens_name: 'vitalik.eth',
      email: 'vitalik@example.com',
      account_type: 'premium',
      auth_method: 'ens',
      ens_profile: {
        displayName: 'Vitalik Buterin',
        bio: 'Ethereum Founder',
        avatar: '',
        website: 'https://vitalik.ca',
        twitter: 'VitalikButerin',
        github: 'vitalik',
        discord: '',
        telegram: '',
        isVerified: true
      }
    },
    {
      address: '0x8ba1f109551bD432803012645Hac136c',
      ens_name: 'alice.eth',
      email: 'alice@example.com',
      account_type: 'basic',
      auth_method: 'ens',
      ens_profile: {
        displayName: 'Alice',
        bio: 'Crypto Enthusiast',
        avatar: '',
        website: '',
        twitter: 'alice',
        github: 'alice',
        discord: '',
        telegram: '',
        isVerified: false
      }
    }
  ];
  
  for (const user of sampleUsers) {
    const { error } = await supabase
      .from('users')
      .insert(user);
    
    if (error) {
      console.warn('⚠️  Warning: Could not create sample user:', error.message);
    }
  }
  
  console.log('✅ Sample data created!');
}

async function main() {
  console.log('🔧 MorphCash Supabase Setup');
  console.log('============================');
  
  const success = await setupDatabase();
  
  if (success) {
    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your development server: yarn start');
    console.log('2. Test the application');
    console.log('3. Check the Supabase dashboard for your data');
  } else {
    console.log('\n❌ Setup failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the setup
main().catch(console.error);
