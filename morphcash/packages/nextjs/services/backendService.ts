/**
 * Backend Service
 * Provides API integration for persistent data storage
 * In production, this would connect to a real backend API
 */

export interface UserProfile {
  id: string;
  address?: string;
  ensName?: string;
  ensAvatar?: string;
  email?: string;
  accountType: "basic" | "premium" | "enterprise";
  authMethod: "ens" | "email" | "wallet";
  ensProfile?: {
    displayName: string;
    bio: string;
    avatar: string;
    website: string;
    twitter: string;
    github: string;
    discord: string;
    telegram: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class BackendService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || "demo-key";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Backend request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a new user profile
   */
  async createUser(profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">): Promise<BackendResponse<UserProfile>> {
    const userProfile: UserProfile = {
      ...profile,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.request<UserProfile>("/users", {
      method: "POST",
      body: JSON.stringify(userProfile),
    });
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<BackendResponse<UserProfile>> {
    return this.request<UserProfile>(`/users/${userId}`);
  }

  /**
   * Get user by ENS name
   */
  async getUserByENS(ensName: string): Promise<BackendResponse<UserProfile>> {
    return this.request<UserProfile>(`/users/ens/${ensName}`);
  }

  /**
   * Get user by wallet address
   */
  async getUserByAddress(address: string): Promise<BackendResponse<UserProfile>> {
    return this.request<UserProfile>(`/users/address/${address}`);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<BackendResponse<UserProfile>> {
    return this.request<UserProfile>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...updates,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<BackendResponse<void>> {
    return this.request<void>(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  /**
   * Verify ENS ownership with backend
   */
  async verifyENSOwnership(ensName: string, walletAddress: string): Promise<BackendResponse<boolean>> {
    return this.request<boolean>("/ens/verify", {
      method: "POST",
      body: JSON.stringify({ ensName, walletAddress }),
    });
  }

  /**
   * Store ENS profile on-chain
   */
  async storeENSProfileOnChain(
    ensName: string,
    profile: UserProfile["ensProfile"],
    walletAddress: string
  ): Promise<BackendResponse<string>> {
    return this.request<string>("/ens/store-profile", {
      method: "POST",
      body: JSON.stringify({ ensName, profile, walletAddress }),
    });
  }

  /**
   * Get ENS profile from chain
   */
  async getENSProfileFromChain(ensName: string): Promise<BackendResponse<UserProfile["ensProfile"]>> {
    return this.request<UserProfile["ensProfile"]>(`/ens/profile/${ensName}`);
  }

  /**
   * Create session
   */
  async createSession(userId: string): Promise<BackendResponse<{ sessionId: string; expiresAt: string }>> {
    return this.request<{ sessionId: string; expiresAt: string }>("/sessions", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  /**
   * Validate session
   */
  async validateSession(sessionId: string): Promise<BackendResponse<UserProfile>> {
    return this.request<UserProfile>(`/sessions/${sessionId}`);
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<BackendResponse<void>> {
    return this.request<void>(`/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const backendService = new BackendService();

// Mock implementation for development
export class MockBackendService {
  private users: Map<string, UserProfile> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: string }> = new Map();

  async createUser(profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">): Promise<BackendResponse<UserProfile>> {
    const userProfile: UserProfile = {
      ...profile,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(userProfile.id, userProfile);
    return { success: true, data: userProfile };
  }

  async getUser(userId: string): Promise<BackendResponse<UserProfile>> {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: user };
  }

  async getUserByENS(ensName: string): Promise<BackendResponse<UserProfile>> {
    const user = Array.from(this.users.values()).find(u => u.ensName === ensName);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: user };
  }

  async getUserByAddress(address: string): Promise<BackendResponse<UserProfile>> {
    const user = Array.from(this.users.values()).find(u => u.address === address);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: user };
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<BackendResponse<UserProfile>> {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(userId, updatedUser);
    return { success: true, data: updatedUser };
  }

  async verifyENSOwnership(ensName: string, walletAddress: string): Promise<BackendResponse<boolean>> {
    // Mock verification - in production this would call the ENS registry
    const mockValidNames = ["vitalik.eth", "alice.eth", "bob.eth", "test.eth", "demo.eth"];
    const isValid = mockValidNames.includes(ensName.toLowerCase());
    return { success: true, data: isValid };
  }

  async createSession(userId: string): Promise<BackendResponse<{ sessionId: string; expiresAt: string }>> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    
    this.sessions.set(sessionId, { userId, expiresAt });
    return { success: true, data: { sessionId, expiresAt } };
  }

  async validateSession(sessionId: string): Promise<BackendResponse<UserProfile>> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, error: "Session not found" };
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(sessionId);
      return { success: false, error: "Session expired" };
    }

    return this.getUser(session.userId);
  }

  async deleteSession(sessionId: string): Promise<BackendResponse<void>> {
    this.sessions.delete(sessionId);
    return { success: true };
  }
}

// Use mock service in development, real service in production
export const apiService = process.env.NODE_ENV === "production" ? backendService : new MockBackendService();
