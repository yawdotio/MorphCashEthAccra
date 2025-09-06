/**
 * User Service
 * Centralized service for user management, authentication, and data persistence
 */

import { Address } from 'viem';
import { SupabaseDatabaseService } from '~~/supabase/supabase';
import { User, DatabaseResponse, PaginatedResponse, VirtualCard, Transaction, PaymentMethod } from './database/types';
import { encryptionService } from './database/encryption';
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';

export interface UserServiceConfig {
  database: SupabaseDatabaseService;
  enableCaching: boolean;
  cacheTimeout: number; // in milliseconds
}

class UserService {
  private config: UserServiceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config: UserServiceConfig) {
    this.config = config;
  }

  private getCacheKey(key: string): string {
    return key;
  }

  private getCachedData<T>(key: string): T | null {
    if (!this.config.enableCaching) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCachedData<T>(key: string, data: T): void {
    if (!this.config.enableCaching) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(userId));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // User Management
  async createUser(userData: {
    address?: string;
    ens_name?: string;
    ens_avatar?: string;
    email?: string;
    password_hash?: string;
    auth_method: "ens" | "email" | "wallet";
    ens_profile?: any;
  }): Promise<DatabaseResponse<User>> {
    const user = await this.config.database.createUser({
      ...userData,
      is_active: true,
    });

    if (user.success && user.data) {
      this.setCachedData(`user:${user.data.id}`, user.data);
    }

    return user;
  }

  async getUser(userId: string): Promise<DatabaseResponse<User>> {
    const cacheKey = this.getCacheKey(`user:${userId}`);
    const cached = this.getCachedData<User>(cacheKey);
    
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await this.config.database.getUser(userId);
    if (result.success && result.data) {
      this.setCachedData(cacheKey, result.data);
    }

    return result;
  }

  async getUserByAddress(address: string): Promise<DatabaseResponse<User>> {
    const cacheKey = this.getCacheKey(`user:address:${address}`);
    const cached = this.getCachedData<User>(cacheKey);
    
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await this.config.database.getUserByAddress(address);
    if (result.success && result.data) {
      this.setCachedData(cacheKey, result.data);
      this.setCachedData(`user:${result.data.id}`, result.data);
    }

    return result;
  }

  async getUserByEmail(email: string): Promise<DatabaseResponse<User>> {
    const cacheKey = this.getCacheKey(`user:email:${email}`);
    const cached = this.getCachedData<User>(cacheKey);
    
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await this.config.database.getUserByEmail(email);
    if (result.success && result.data) {
      this.setCachedData(cacheKey, result.data);
      this.setCachedData(`user:${result.data.id}`, result.data);
    }

    return result;
  }

  async getUserByENS(ensName: string): Promise<DatabaseResponse<User>> {
    const cacheKey = this.getCacheKey(`user:ens:${ensName}`);
    const cached = this.getCachedData<User>(cacheKey);
    
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await this.config.database.getUserByENS(ensName);
    if (result.success && result.data) {
      this.setCachedData(cacheKey, result.data);
      this.setCachedData(`user:${result.data.id}`, result.data);
    }

    return result;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<DatabaseResponse<User>> {
    const result = await this.config.database.updateUser(userId, updates);
    
    if (result.success && result.data) {
      this.clearUserCache(userId);
      this.setCachedData(`user:${userId}`, result.data);
    }

    return result;
  }

  // Virtual Cards Management
  async createVirtualCard(userId: string, cardData: {
    cardName: string;
    cardNumber: string;
    cardType: string;
    spendingLimit: bigint;
    onChainTxHash?: string;
  }): Promise<DatabaseResponse<VirtualCard>> {
    const result = await this.config.database.createVirtualCard({
      userId,
      cardId: BigInt(0), // Will be updated after on-chain creation
      ...cardData,
      currentSpend: BigInt(0),
      isActive: true,
    });

    if (result.success && result.data) {
      this.clearUserCache(userId);
    }

    return result;
  }

  async getVirtualCards(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<VirtualCard>> {
    const cacheKey = this.getCacheKey(`cards:${userId}:${page}:${limit}`);
    const cached = this.getCachedData<PaginatedResponse<VirtualCard>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.config.database.getVirtualCards(userId, page, limit);
    if (result.success) {
      this.setCachedData(cacheKey, result);
    }

    return result;
  }

  async updateVirtualCard(cardId: string, updates: Partial<VirtualCard>): Promise<DatabaseResponse<VirtualCard>> {
    const result = await this.config.database.updateVirtualCard(cardId, updates);
    
    if (result.success && result.data) {
      // Clear all card caches for this user
      const userId = result.data.userId;
      this.clearUserCache(userId);
    }

    return result;
  }

  // Payment Methods Management
  async createPaymentMethod(userId: string, paymentData: {
    type: "credit_card" | "bank_account" | "crypto_wallet";
    data: any; // Sensitive data to be encrypted
    last4?: string;
    brand?: string;
    isDefault?: boolean;
  }): Promise<DatabaseResponse<PaymentMethod>> {
    // Encrypt sensitive data
    const encryptedData = await encryptionService.encryptSensitiveData(
      paymentData.data.address as Address,
      paymentData.data
    );

    const result = await this.config.database.createPaymentMethod({
      userId,
      type: paymentData.type,
      encryptedData,
      last4: paymentData.last4,
      brand: paymentData.brand,
      isDefault: paymentData.isDefault || false,
      isActive: true,
    });

    if (result.success) {
      this.clearUserCache(userId);
    }

    return result;
  }

  async getPaymentMethods(userId: string): Promise<DatabaseResponse<PaymentMethod[]>> {
    const cacheKey = this.getCacheKey(`payment-methods:${userId}`);
    const cached = this.getCachedData<PaymentMethod[]>(cacheKey);
    
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await this.config.database.getPaymentMethods(userId);
    if (result.success && result.data) {
      this.setCachedData(cacheKey, result.data);
    }

    return result;
  }

  // Transaction Management
  async createTransaction(transactionData: {
    userId: string;
    cardId?: string;
    type: "payment" | "refund" | "transfer" | "deposit" | "withdrawal";
    amount: bigint;
    currency: string;
    description: string;
    merchantName?: string;
    merchantAddress?: string;
    status?: "pending" | "completed" | "failed" | "cancelled";
    txHash?: string;
  }): Promise<DatabaseResponse<Transaction>> {
    const result = await this.config.database.createTransaction({
      ...transactionData,
      status: transactionData.status || "pending",
    });

    if (result.success) {
      this.clearUserCache(transactionData.userId);
    }

    return result;
  }

  async getTransactions(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
    const cacheKey = this.getCacheKey(`transactions:${userId}:${page}:${limit}`);
    const cached = this.getCachedData<PaginatedResponse<Transaction>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.config.database.getTransactions(userId, page, limit);
    if (result.success) {
      this.setCachedData(cacheKey, result);
    }

    return result;
  }

  // Session Management
  async createSession(userId: string, token: string, expiresAt: string, metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<DatabaseResponse<{ sessionId: string; expiresAt: string }>> {
    const result = await this.config.database.createSession({
      userId,
      token,
      expiresAt,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return {
      success: result.success,
      data: result.data ? { sessionId: result.data.id, expiresAt: result.data.expiresAt } : undefined,
      error: result.error,
    };
  }

  async validateSession(token: string): Promise<DatabaseResponse<User>> {
    const result = await this.config.database.getSession(token);
    
    if (!result.success || !result.data) {
      return { success: false, error: "Invalid session" };
    }

    const session = result.data;
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (now > expiresAt) {
      // Session expired
      await this.config.database.deleteSession(token);
      return { success: false, error: "Session expired" };
    }

    // Update last used timestamp
    await this.config.database.updateSession(token, {
      last_used_at: now.toISOString(),
    });

    // Get user data
    return this.getUser(session.user_id);
  }

  async deleteSession(token: string): Promise<DatabaseResponse<void>> {
    return this.config.database.deleteSession(token);
  }

  // Utility Methods
  async getUserStats(userId: string): Promise<DatabaseResponse<{
    totalCards: number;
    activeCards: number;
    totalTransactions: number;
    totalSpent: bigint;
    lastTransactionAt?: string;
  }>> {
    return this.config.database.getUserStats(userId);
  }

  // Clear all caches
  clearAllCaches(): void {
    this.cache.clear();
  }

  // Clear caches for specific user
  clearUserCaches(userId: string): void {
    this.clearUserCache(userId);
  }
}

export default UserService;
