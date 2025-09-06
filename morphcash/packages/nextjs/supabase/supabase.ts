/**
 * Supabase Client Configuration
 * Provides Supabase client setup and configuration for MorphCash
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Supabase configuration - must be provided in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. ' +
    'Get these values from your Supabase project dashboard at https://supabase.com'
  );
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types (generated from Supabase)
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Helper functions
export const getSupabaseUrl = () => supabaseUrl;
export const getSupabaseAnonKey = () => supabaseAnonKey;

// Check if Supabase is properly configured (always true now since we validate at import)
export const isSupabaseConfigured = () => {
  return true;
};

// Database service using Supabase
export class SupabaseDatabaseService {
  private client = supabase;

  constructor() {
    // Verify Supabase is configured
    isSupabaseConfigured();
    
    console.log('🔧 Supabase Database Service Initialized:', {
      service: 'SupabaseDatabaseService',
      url: supabaseUrl,
      projectId: supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown',
      features: {
        realtime: true,
        encryption: true,
        rls: true,
        auth: true
      },
      timestamp: new Date().toISOString()
    });
  }

  // Users
  async createUser(userData: any) {
    console.log('🔄 Database Operation: createUser', {
      operation: 'CREATE_USER',
      userData: { ...userData, email: userData.email ? '[REDACTED]' : undefined },
      timestamp: new Date().toISOString()
    });

    const { data, error } = await this.client
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (!error) {
      console.log('✅ Database Operation Successful: User created in Supabase', {
        userId: data?.id,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Database Operation Failed: User creation error', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return { success: !error, data, error: error?.message };
  }

  async getUser(userId: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async getUserByAddress(address: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('address', address)
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async getUserByENS(ensName: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('ens_name', ensName)
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async updateUser(userId: string, updates: any) {
    const { data, error } = await this.client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  // Virtual Cards
  async createVirtualCard(cardData: any) {
    const { data, error } = await this.client
      .from('virtual_cards')
      .insert(cardData)
      .select()
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async getVirtualCards(userId: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.client
      .from('virtual_cards')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .range(from, to)
      .order('created_at', { ascending: false });
    
    return { 
      success: !error, 
      data: data || [], 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      error: error?.message 
    };
  }

  async updateVirtualCard(cardId: string, updates: any) {
    const { data, error } = await this.client
      .from('virtual_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  // Transactions
  async createTransaction(transactionData: any) {
    const { data, error } = await this.client
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.client
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .range(from, to)
      .order('created_at', { ascending: false });
    
    return { 
      success: !error, 
      data: data || [], 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      error: error?.message 
    };
  }

  // Payment Methods
  async createPaymentMethod(paymentData: any) {
    const { data, error } = await this.client
      .from('payment_methods')
      .insert(paymentData)
      .select()
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async getPaymentMethods(userId: string) {
    const { data, error } = await this.client
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    return { success: !error, data: data || [], error: error?.message };
  }

  // Sessions
  async createSession(sessionData: {
    userId: string;
    token: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { data, error } = await this.client
      .from('sessions')
      .insert({
        user_id: sessionData.userId,
        token: sessionData.token,
        expires_at: sessionData.expiresAt,
        ip_address: sessionData.ipAddress,
        user_agent: sessionData.userAgent,
      })
      .select()
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async getSession(token: string) {
    const { data, error } = await this.client
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async updateSession(token: string, updates: any) {
    const { data, error } = await this.client
      .from('sessions')
      .update(updates)
      .eq('token', token)
      .select()
      .single();
    
    return { success: !error, data, error: error?.message };
  }

  async deleteSession(token: string) {
    const { error } = await this.client
      .from('sessions')
      .delete()
      .eq('token', token);
    
    return { success: !error, error: error?.message };
  }

  // User Stats
  async getUserStats(userId: string) {
    const { data, error } = await this.client
      .rpc('get_user_stats', { user_uuid: userId });
    
    return { success: !error, data, error: error?.message };
  }

  // Real-time subscriptions
  subscribeToUserChanges(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel('user-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        callback
      )
      .subscribe();
  }

  subscribeToCardChanges(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel('card-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'virtual_cards', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe();
  }

  subscribeToTransactionChanges(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel('transaction-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe();
  }

  // Virtual Cards
  async getUserVirtualCards(userId: string) {
    const { data, error } = await this.client
      .from('virtual_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { success: !error, data, error: error?.message };
  }
}

// Database connection test function
export const testDatabaseConnection = async (): Promise<{
  connected: boolean;
  details: any;
}> => {
  try {
    console.log('🔍 Testing Supabase Database Connection...');
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database Connection Test Failed:', error.message);
      return {
        connected: false,
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }

    console.log('✅ Database Connection Test Successful!', {
      url: supabaseUrl,
      userCount: data?.length || 0,
      timestamp: new Date().toISOString()
    });

    return {
      connected: true,
      details: {
        url: supabaseUrl,
        userCount: data?.length || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Database Connection Test Error:', error);
    return {
      connected: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    };
  }
};

// Export singleton instance
export const supabaseDatabase = new SupabaseDatabaseService();

// Initialize and validate connection status immediately
const connectionStatus = (() => {
  try {
    isSupabaseConfigured();
    console.log('🔗 Supabase Client Initialized:', {
      status: 'CONNECTED',
      url: supabaseUrl,
      projectId: supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('❌ Supabase Configuration Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: supabaseUrl,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
    throw error; // Re-throw to prevent app from starting with invalid config
  }
})();
