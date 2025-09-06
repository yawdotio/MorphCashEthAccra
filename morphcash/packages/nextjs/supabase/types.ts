/**
 * Supabase Database Types
 * Generated types for the MorphCash database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          address: string | null
          ens_name: string | null
          ens_avatar: string | null
          email: string | null
          auth_method: 'ens' | 'email' | 'wallet'
          ens_profile: Json | null
          personal_info: Json | null
          preferences: Json | null
          created_at: string
          updated_at: string
          last_login_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          address?: string | null
          ens_name?: string | null
          ens_avatar?: string | null
          email?: string | null
          auth_method: 'ens' | 'email' | 'wallet'
          ens_profile?: Json | null
          personal_info?: Json | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          address?: string | null
          ens_name?: string | null
          ens_avatar?: string | null
          email?: string | null
          auth_method?: 'ens' | 'email' | 'wallet'
          ens_profile?: Json | null
          personal_info?: Json | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
        }
      }
      virtual_cards: {
        Row: {
          id: string
          user_id: string
          card_id: number
          card_name: string
          card_number: string
          expiry_date: string
          card_type: string
          spending_limit: number
          current_spend: number
          is_active: boolean
          on_chain_tx_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: number
          card_name: string
          card_number: string
          expiry_date: string
          card_type: string
          spending_limit?: number
          current_spend?: number
          is_active?: boolean
          on_chain_tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: number
          card_name?: string
          card_number?: string
          expiry_date?: string
          card_type?: string
          spending_limit?: number
          current_spend?: number
          is_active?: boolean
          on_chain_tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          card_id: string | null
          type: 'payment' | 'refund' | 'transfer' | 'deposit' | 'withdrawal'
          amount: number
          currency: string
          description: string
          merchant_name: string | null
          merchant_address: string | null
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          tx_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id?: string | null
          type: 'payment' | 'refund' | 'transfer' | 'deposit' | 'withdrawal'
          amount: number
          currency?: string
          description: string
          merchant_name?: string | null
          merchant_address?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string | null
          type?: 'payment' | 'refund' | 'transfer' | 'deposit' | 'withdrawal'
          amount?: number
          currency?: string
          description?: string
          merchant_name?: string | null
          merchant_address?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          tx_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: 'credit_card' | 'bank_account' | 'crypto_wallet'
          encrypted_data: string
          last4: string | null
          brand: string | null
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'credit_card' | 'bank_account' | 'crypto_wallet'
          encrypted_data: string
          last4?: string | null
          brand?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'credit_card' | 'bank_account' | 'crypto_wallet'
          encrypted_data?: string
          last4?: string | null
          brand?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          last_used_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          last_used_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          last_used_at?: string
        }
      }
      kyc_documents: {
        Row: {
          id: string
          user_id: string
          type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill'
          file_name: string
          file_url: string
          uploaded_at: string
          status: 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          user_id: string
          type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill'
          file_name: string
          file_url: string
          uploaded_at?: string
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill'
          file_name?: string
          file_url?: string
          uploaded_at?: string
          status?: 'pending' | 'approved' | 'rejected'
        }
      }
    }
    Views: {
      user_dashboard: {
        Row: {
          id: string
          address: string | null
          ens_name: string | null
          email: string | null
          ens_profile: Json | null
          created_at: string
          last_login_at: string | null
          total_cards: number
          active_cards: number
          total_transactions: number
          total_spent: number
          last_transaction_at: string | null
        }
      }
      recent_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'payment' | 'refund' | 'transfer' | 'deposit' | 'withdrawal'
          amount: number
          currency: string
          description: string
          merchant_name: string | null
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          created_at: string
          card_name: string | null
          card_type: string | null
        }
      }
      active_virtual_cards: {
        Row: {
          id: string
          user_id: string
          card_id: number
          card_name: string
          card_number: string
          expiry_date: string
          card_type: string
          spending_limit: number
          current_spend: number
          is_active: boolean
          on_chain_tx_hash: string | null
          created_at: string
          updated_at: string
          ens_name: string | null
          email: string | null
          spending_percentage: number
          days_until_expiry: number | null
        }
      }
    }
    Functions: {
      get_user_stats: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_transaction_stats: {
        Args: {
          user_uuid: string
          period_type?: string
        }
        Returns: Json
      }
    }
    Enums: {
      auth_method: 'ens' | 'email' | 'wallet'
      transaction_type: 'payment' | 'refund' | 'transfer' | 'deposit' | 'withdrawal'
      transaction_status: 'pending' | 'completed' | 'failed' | 'cancelled'
      payment_method_type: 'credit_card' | 'bank_account' | 'crypto_wallet'
      kyc_status: 'none' | 'pending' | 'verified' | 'rejected'
      document_type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill'
      document_status: 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
