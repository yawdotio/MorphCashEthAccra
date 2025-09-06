-- MorphCash Database Schema for Supabase
-- This file contains all the necessary tables and relationships for the MorphCash application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE account_type AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE auth_method AS ENUM ('ens', 'email', 'wallet');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'transfer', 'deposit', 'withdrawal');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE payment_method_type AS ENUM ('credit_card', 'bank_account', 'crypto_wallet');
CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'verified', 'rejected');
CREATE TYPE document_type AS ENUM ('passport', 'drivers_license', 'national_id', 'utility_bill');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(42) UNIQUE, -- Ethereum address
    ens_name VARCHAR(255) UNIQUE, -- ENS name
    ens_avatar TEXT, -- ENS avatar URL
    email VARCHAR(255) UNIQUE, -- Email address
    account_type account_type NOT NULL DEFAULT 'basic',
    auth_method auth_method NOT NULL,
    ens_profile JSONB, -- ENS profile data
    personal_info JSONB, -- Personal information
    preferences JSONB, -- User preferences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT users_auth_method_check CHECK (
        (auth_method = 'email' AND email IS NOT NULL) OR
        (auth_method = 'ens' AND ens_name IS NOT NULL) OR
        (auth_method = 'wallet' AND address IS NOT NULL)
    )
);

-- Virtual cards table
CREATE TABLE virtual_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id BIGINT NOT NULL, -- On-chain card ID
    card_name VARCHAR(255) NOT NULL,
    card_number VARCHAR(20) NOT NULL, -- Masked: ****1234
    expiry_date VARCHAR(7) NOT NULL, -- MM/YY format
    card_type VARCHAR(50) NOT NULL, -- Visa, Mastercard, etc.
    spending_limit BIGINT NOT NULL DEFAULT 0,
    current_spend BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    on_chain_tx_hash VARCHAR(66), -- Transaction hash when created on-chain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT virtual_cards_spending_limit_check CHECK (spending_limit >= 0),
    CONSTRAINT virtual_cards_current_spend_check CHECK (current_spend >= 0),
    CONSTRAINT virtual_cards_current_spend_limit_check CHECK (current_spend <= spending_limit)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES virtual_cards(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    description TEXT NOT NULL,
    merchant_name VARCHAR(255),
    merchant_address VARCHAR(255),
    status transaction_status NOT NULL DEFAULT 'pending',
    tx_hash VARCHAR(66), -- Blockchain transaction hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT transactions_amount_check CHECK (amount > 0)
);

-- Payment methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL,
    encrypted_data TEXT NOT NULL, -- Encrypted sensitive data
    last4 VARCHAR(4), -- Last 4 digits for display
    brand VARCHAR(50), -- Visa, Mastercard, etc.
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KYC documents table
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status document_status NOT NULL DEFAULT 'pending'
);

-- Create indexes for better performance
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_ens_name ON users(ens_name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_method ON users(auth_method);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_virtual_cards_user_id ON virtual_cards(user_id);
CREATE INDEX idx_virtual_cards_card_id ON virtual_cards(card_id);
CREATE INDEX idx_virtual_cards_is_active ON virtual_cards(is_active);
CREATE INDEX idx_virtual_cards_created_at ON virtual_cards(created_at);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(type);
CREATE INDEX idx_payment_methods_is_active ON payment_methods(is_active);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_type ON kyc_documents(type);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_virtual_cards_updated_at BEFORE UPDATE ON virtual_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Virtual cards policies
CREATE POLICY "Users can view own cards" ON virtual_cards
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own cards" ON virtual_cards
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own cards" ON virtual_cards
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Payment methods policies
CREATE POLICY "Users can view own payment methods" ON payment_methods
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own payment methods" ON payment_methods
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own payment methods" ON payment_methods
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own payment methods" ON payment_methods
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- KYC documents policies
CREATE POLICY "Users can view own documents" ON kyc_documents
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own documents" ON kyc_documents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own documents" ON kyc_documents
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalCards', (SELECT COUNT(*) FROM virtual_cards WHERE user_id = user_uuid),
        'activeCards', (SELECT COUNT(*) FROM virtual_cards WHERE user_id = user_uuid AND is_active = true),
        'totalTransactions', (SELECT COUNT(*) FROM transactions WHERE user_id = user_uuid),
        'totalSpent', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = user_uuid AND status = 'completed'),
        'lastTransactionAt', (SELECT MAX(created_at) FROM transactions WHERE user_id = user_uuid)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired sessions (if pg_cron is available)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

-- Insert some sample data for development
INSERT INTO users (id, address, ens_name, email, account_type, auth_method, ens_profile, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'vitalik.eth', 'vitalik@example.com', 'premium', 'ens', 
     '{"displayName": "Vitalik Buterin", "bio": "Ethereum Founder", "avatar": "", "website": "https://vitalik.ca", "twitter": "VitalikButerin", "github": "vitalik", "discord": "", "telegram": "", "isVerified": true}', 
     NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', '0x8ba1f109551bD432803012645Hac136c', 'alice.eth', 'alice@example.com', 'basic', 'ens',
     '{"displayName": "Alice", "bio": "Crypto Enthusiast", "avatar": "", "website": "", "twitter": "alice", "github": "alice", "discord": "", "telegram": "", "isVerified": false}',
     NOW());

-- Create a view for user dashboard data
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.address,
    u.ens_name,
    u.email,
    u.account_type,
    u.ens_profile,
    u.created_at,
    u.last_login_at,
    COALESCE(card_stats.total_cards, 0) as total_cards,
    COALESCE(card_stats.active_cards, 0) as active_cards,
    COALESCE(tx_stats.total_transactions, 0) as total_transactions,
    COALESCE(tx_stats.total_spent, 0) as total_spent,
    tx_stats.last_transaction_at
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_cards,
        COUNT(*) FILTER (WHERE is_active = true) as active_cards
    FROM virtual_cards
    GROUP BY user_id
) card_stats ON u.id = card_stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_transactions,
        SUM(amount) as total_spent,
        MAX(created_at) as last_transaction_at
    FROM transactions
    WHERE status = 'completed'
    GROUP BY user_id
) tx_stats ON u.id = tx_stats.user_id;
