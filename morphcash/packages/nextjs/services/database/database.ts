/**
 * Database Service
 * Handles all database operations for persistent storage
 */

import { 
  User, 
  VirtualCard, 
  Transaction, 
  PaymentMethod, 
  Session,
  DatabaseResponse, 
  PaginatedResponse,
  DatabaseConfig,
  ENSProfile,
  PersonalInfo,
  UserPreferences
} from './types';

class DatabaseService {
  private config: DatabaseConfig;
  private baseUrl: string;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.baseUrl = config.url;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<DatabaseResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Database request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async requestPaginated<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error("Database paginated request failed:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // User Management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(userId: string): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  async getUserByAddress(address: string): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/address/${address}`);
  }

  async getUserByENS(ensName: string): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/ens/${ensName}`);
  }

  async getUserByEmail(email: string): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/email/${email}`);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(userId: string): Promise<DatabaseResponse<void>> {
    return this.request<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ENS Profile Management
  async updateENSProfile(userId: string, profile: Partial<ENSProfile>): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/${userId}/ens-profile`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async verifyENSProfile(userId: string, txHash: string): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/${userId}/verify-ens`, {
      method: 'POST',
      body: JSON.stringify({ txHash }),
    });
  }

  // Personal Info Management
  async updatePersonalInfo(userId: string, info: Partial<PersonalInfo>): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/${userId}/personal-info`, {
      method: 'PUT',
      body: JSON.stringify(info),
    });
  }

  async updateKYCStatus(userId: string, status: PersonalInfo['kycStatus']): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/${userId}/kyc-status`, {
      method: 'PUT',
      body: JSON.stringify({ kycStatus: status }),
    });
  }

  // User Preferences
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<DatabaseResponse<User>> {
    return this.request<User>(`/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Virtual Cards Management
  async createVirtualCard(cardData: Omit<VirtualCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<VirtualCard>> {
    return this.request<VirtualCard>('/virtual-cards', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  async getVirtualCards(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<VirtualCard>> {
    return this.requestPaginated<VirtualCard>(`/virtual-cards?userId=${userId}&page=${page}&limit=${limit}`);
  }

  async getVirtualCard(cardId: string): Promise<DatabaseResponse<VirtualCard>> {
    return this.request<VirtualCard>(`/virtual-cards/${cardId}`);
  }

  async updateVirtualCard(cardId: string, updates: Partial<VirtualCard>): Promise<DatabaseResponse<VirtualCard>> {
    return this.request<VirtualCard>(`/virtual-cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteVirtualCard(cardId: string): Promise<DatabaseResponse<void>> {
    return this.request<void>(`/virtual-cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // Transactions Management
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<Transaction>> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactions(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
    return this.requestPaginated<Transaction>(`/transactions?userId=${userId}&page=${page}&limit=${limit}`);
  }

  async getTransaction(transactionId: string): Promise<DatabaseResponse<Transaction>> {
    return this.request<Transaction>(`/transactions/${transactionId}`);
  }

  async updateTransactionStatus(transactionId: string, status: Transaction['status'], txHash?: string): Promise<DatabaseResponse<Transaction>> {
    return this.request<Transaction>(`/transactions/${transactionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, txHash }),
    });
  }

  // Payment Methods Management
  async createPaymentMethod(paymentData: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<PaymentMethod>> {
    return this.request<PaymentMethod>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentMethods(userId: string): Promise<DatabaseResponse<PaymentMethod[]>> {
    return this.request<PaymentMethod[]>(`/payment-methods?userId=${userId}`);
  }

  async updatePaymentMethod(paymentId: string, updates: Partial<PaymentMethod>): Promise<DatabaseResponse<PaymentMethod>> {
    return this.request<PaymentMethod>(`/payment-methods/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePaymentMethod(paymentId: string): Promise<DatabaseResponse<void>> {
    return this.request<void>(`/payment-methods/${paymentId}`, {
      method: 'DELETE',
    });
  }

  // Session Management
  async createSession(sessionData: Omit<Session, 'id' | 'createdAt' | 'lastUsedAt'>): Promise<DatabaseResponse<Session>> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getSession(sessionId: string): Promise<DatabaseResponse<Session>> {
    return this.request<Session>(`/sessions/${sessionId}`);
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<DatabaseResponse<Session>> {
    return this.request<Session>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSession(sessionId: string): Promise<DatabaseResponse<void>> {
    return this.request<void>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async deleteUserSessions(userId: string): Promise<DatabaseResponse<void>> {
    return this.request<void>(`/sessions/user/${userId}`, {
      method: 'DELETE',
    });
  }

  // Analytics and Reporting
  async getUserStats(userId: string): Promise<DatabaseResponse<{
    totalCards: number;
    activeCards: number;
    totalTransactions: number;
    totalSpent: bigint;
    lastTransactionAt?: string;
  }>> {
    return this.request(`/users/${userId}/stats`);
  }

  async getTransactionStats(userId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<DatabaseResponse<{
    period: string;
    totalTransactions: number;
    totalAmount: bigint;
    averageAmount: bigint;
    topMerchants: Array<{ name: string; count: number; amount: bigint }>;
  }>> {
    return this.request(`/users/${userId}/transaction-stats?period=${period}`);
  }
}

export default DatabaseService;
