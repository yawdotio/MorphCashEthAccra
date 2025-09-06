-- Migration: Initial Schema
-- Description: Creates the initial database schema for MorphCash
-- Date: 2024-01-01
-- Version: 1.0.0

-- This migration creates all the necessary tables, indexes, and policies
-- for the MorphCash application using Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
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
    address VARCHAR(42) UNIQUE,
    ens_name VARCHAR(255) UNIQUE,
    ens_avatar TEXT,
    email VARCHAR(255) UNIQUE,
    auth_method auth_method NOT NULL,
    ens_profile JSONB,
    personal_info JSONB,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
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
    card_id BIGINT NOT NULL,
    card_name VARCHAR(255) NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    expiry_date VARCHAR(7) NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    spending_limit BIGINT NOT NULL DEFAULT 0,
    current_spend BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    on_chain_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
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
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT transactions_amount_check CHECK (amount > 0)
);

-- Payment methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL,
    encrypted_data TEXT NOT NULL,
    last4 VARCHAR(4),
    brand VARCHAR(50),
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
