-- Migration: Remove account_type field
-- Description: Removes the account_type column and enum from the database
-- Date: 2024-01-01
-- Version: 1.0.4

-- Remove account_type column from users table
ALTER TABLE users DROP COLUMN IF EXISTS account_type;

-- Drop the account_type enum type
DROP TYPE IF EXISTS account_type CASCADE;

-- Update the user_dashboard view to remove account_type reference
DROP VIEW IF EXISTS user_dashboard;
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.address,
    u.ens_name,
    u.email,
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
