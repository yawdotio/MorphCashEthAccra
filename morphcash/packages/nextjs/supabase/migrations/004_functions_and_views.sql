-- Migration: Functions and Views
-- Description: Creates utility functions and views for common operations
-- Date: 2024-01-01
-- Version: 1.0.3

-- Create function to get user statistics
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

-- Create function to get transaction statistics by period
CREATE OR REPLACE FUNCTION get_transaction_stats(
    user_uuid UUID,
    period_type VARCHAR(10) DEFAULT 'month'
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate date range based on period
    CASE period_type
        WHEN 'day' THEN
            start_date := DATE_TRUNC('day', NOW());
            end_date := start_date + INTERVAL '1 day';
        WHEN 'week' THEN
            start_date := DATE_TRUNC('week', NOW());
            end_date := start_date + INTERVAL '1 week';
        WHEN 'month' THEN
            start_date := DATE_TRUNC('month', NOW());
            end_date := start_date + INTERVAL '1 month';
        WHEN 'year' THEN
            start_date := DATE_TRUNC('year', NOW());
            end_date := start_date + INTERVAL '1 year';
        ELSE
            start_date := DATE_TRUNC('month', NOW());
            end_date := start_date + INTERVAL '1 month';
    END CASE;
    
    SELECT json_build_object(
        'period', period_type,
        'totalTransactions', (SELECT COUNT(*) FROM transactions WHERE user_id = user_uuid AND created_at >= start_date AND created_at < end_date),
        'totalAmount', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = user_uuid AND created_at >= start_date AND created_at < end_date AND status = 'completed'),
        'averageAmount', (SELECT COALESCE(AVG(amount), 0) FROM transactions WHERE user_id = user_uuid AND created_at >= start_date AND created_at < end_date AND status = 'completed'),
        'topMerchants', (
            SELECT json_agg(
                json_build_object(
                    'name', merchant_name,
                    'count', merchant_count,
                    'amount', merchant_amount
                )
            )
            FROM (
                SELECT 
                    merchant_name,
                    COUNT(*) as merchant_count,
                    SUM(amount) as merchant_amount
                FROM transactions 
                WHERE user_id = user_uuid 
                    AND created_at >= start_date 
                    AND created_at < end_date 
                    AND status = 'completed'
                    AND merchant_name IS NOT NULL
                GROUP BY merchant_name
                ORDER BY merchant_count DESC
                LIMIT 5
            ) top_merchants
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for user dashboard data
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

-- Create view for recent transactions
CREATE VIEW recent_transactions AS
SELECT 
    t.id,
    t.user_id,
    t.type,
    t.amount,
    t.currency,
    t.description,
    t.merchant_name,
    t.status,
    t.created_at,
    vc.card_name,
    vc.card_type
FROM transactions t
LEFT JOIN virtual_cards vc ON t.card_id = vc.id
ORDER BY t.created_at DESC;

-- Create view for active virtual cards
CREATE VIEW active_virtual_cards AS
SELECT 
    vc.*,
    u.ens_name,
    u.email,
    CASE 
        WHEN vc.spending_limit > 0 THEN 
            ROUND((vc.current_spend::numeric / vc.spending_limit::numeric) * 100, 2)
        ELSE 0
    END as spending_percentage,
    CASE 
        WHEN vc.expiry_date IS NOT NULL THEN
            EXTRACT(DAYS FROM (vc.expiry_date::date - CURRENT_DATE))
        ELSE NULL
    END as days_until_expiry
FROM virtual_cards vc
JOIN users u ON vc.user_id = u.id
WHERE vc.is_active = true
ORDER BY vc.created_at DESC;
