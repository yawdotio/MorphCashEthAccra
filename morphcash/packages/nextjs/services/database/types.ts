/**
 * Database Types and Interfaces
 * Defines the data models for persistent storage
 */

export interface User {
  id: string;
  address?: string;
  ens_name?: string;
  ens_avatar?: string;
  email?: string;
  password_hash?: string; // For email authentication
  auth_method: "ens" | "email" | "wallet";
  ens_profile?: ENSProfile;
  personal_info?: PersonalInfo;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}

export interface ENSProfile {
  displayName: string;
  bio: string;
  avatar: string;
  website: string;
  twitter: string;
  github: string;
  discord: string;
  telegram: string;
  isVerified: boolean;
  verificationTxHash?: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: Address;
  kycStatus: "none" | "pending" | "verified" | "rejected";
  kycDocuments?: KYCDocument[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface KYCDocument {
  id: string;
  type: "passport" | "drivers_license" | "national_id" | "utility_bill";
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    showBalance: boolean;
    showTransactions: boolean;
    allowAnalytics: boolean;
  };
}

export interface VirtualCard {
  id: string;
  userId: string;
  cardId: bigint; // On-chain card ID
  cardName: string;
  cardNumber: string; // Masked: ****1234
  expiryDate: string;
  cardType: string; // Visa, Mastercard, etc.
  spendingLimit: bigint;
  currentSpend: bigint;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  onChainTxHash?: string; // Transaction hash when created on-chain
}

export interface Transaction {
  id: string;
  userId: string;
  cardId?: string;
  type: "payment" | "refund" | "transfer" | "deposit" | "withdrawal";
  amount: bigint;
  currency: string;
  description: string;
  merchantName?: string;
  merchantAddress?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  txHash?: string; // Blockchain transaction hash
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "credit_card" | "bank_account" | "crypto_wallet";
  encryptedData: string; // Encrypted sensitive data
  last4?: string; // Last 4 digits for display
  brand?: string; // Visa, Mastercard, etc.
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface DatabaseConfig {
  url: string;
  apiKey: string;
  projectId?: string; // For Supabase
  region?: string;
  encryptionKey: string; // For sensitive data encryption
}
