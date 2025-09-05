"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useEnsName, useEnsAvatar } from "wagmi";
import { useENSProfile } from "~~/hooks/scaffold-eth/useENSProfile";
import { apiService } from "~~/services/backendService";
import { verifyENSOwnership } from "~~/utils/ensVerification";

interface User {
  id: string;
  address?: string;
  ensName?: string;
  ensAvatar?: string;
  email?: string;
  isAuthenticated: boolean;
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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithENS: (ensName: string) => Promise<void>;
  loginWithWallet: (address: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkUserExists: (identifier: string, method: "ens" | "email") => Promise<boolean>;
  createENSProfile: (ensName: string, profileData: any) => Promise<void>;
  updateENSProfile: (ensName: string, profileData: any) => Promise<void>;
  loadENSProfile: (ensName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { address } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user exists in the system
  const checkUserExists = async (identifier: string, method: "ens" | "email"): Promise<boolean> => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem("morphcash_users") || "{}");
      if (method === "email") {
        return !!existingUsers[identifier.toLowerCase()];
      } else {
        // For ENS, check by ensName field
        return Object.values(existingUsers).some((user: any) => user.ensName === identifier);
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  // Load user data from backend on mount
  const loadUserData = async () => {
    try {
      const sessionData = localStorage.getItem("morphcash_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Validate session with backend
        const sessionResult = await apiService.validateSession(session.sessionId);
        
        if (sessionResult.success && sessionResult.data) {
          setUser({
            id: sessionResult.data.id,
            address: sessionResult.data.address,
            ensName: sessionResult.data.ensName,
            ensAvatar: sessionResult.data.ensAvatar,
            email: sessionResult.data.email,
            isAuthenticated: true,
            accountType: sessionResult.data.accountType || "basic",
            authMethod: sessionResult.data.authMethod,
            ensProfile: sessionResult.data.ensProfile,
          });
        } else {
          // Session invalid, clear it
          localStorage.removeItem("morphcash_session");
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password login
  const loginWithEmail = async (email: string, password: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem("morphcash_users") || "{}");
      const userData = existingUsers[email.toLowerCase()];

      if (!userData || userData.password !== password) {
        throw new Error("Invalid email or password");
      }

      const sessionData = {
        userId: email.toLowerCase(),
        authMethod: "email",
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("morphcash_session", JSON.stringify(sessionData));

      setUser({
        id: userData.id,
        address: userData.address,
        ensName: userData.ensName,
        ensAvatar: userData.ensAvatar,
        email: userData.email,
        isAuthenticated: true,
        accountType: userData.accountType || "basic",
        authMethod: "email",
      });
    } catch (error) {
      console.error("Error during email login:", error);
      throw error;
    }
  };

  // ENS login
  const loginWithENS = async (ensName: string) => {
    try {
      // Get user by ENS name from backend
      const result = await apiService.getUserByENS(ensName);
      
      if (!result.success || !result.data) {
        throw new Error("ENS name not found. Please register first.");
      }

      const userData = result.data;

      // Verify ENS ownership if wallet is connected
      if (address) {
        const ownershipResult = await verifyENSOwnership(ensName, address);
        if (!ownershipResult.isValid) {
          throw new Error("You don't own this ENS name. Please connect the correct wallet.");
        }
      }

      setUser({
        id: userData.id,
        address: userData.address,
        ensName: userData.ensName,
        ensAvatar: userData.ensAvatar,
        email: userData.email,
        isAuthenticated: true,
        accountType: userData.accountType || "basic",
        authMethod: "ens",
        ensProfile: userData.ensProfile,
      });

      // Create session with backend
      const sessionResult = await apiService.createSession(userData.id);
      if (sessionResult.success) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          sessionId: sessionResult.data!.sessionId,
          userId: userData.id,
          expiresAt: sessionResult.data!.expiresAt,
        }));
      }
    } catch (error) {
      console.error("Error during ENS login:", error);
      throw error;
    }
  };

  // Email/Password registration
  const registerWithEmail = async (email: string, password: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem("morphcash_users") || "{}");
      
      if (existingUsers[email.toLowerCase()]) {
        throw new Error("Email already registered");
      }

      const userId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: userId,
        email: email.toLowerCase(),
        password: password,
        accountType: "basic",
        registeredAt: new Date().toISOString(),
        authMethod: "email",
      };

      existingUsers[email.toLowerCase()] = userData;
      localStorage.setItem("morphcash_users", JSON.stringify(existingUsers));

      const sessionData = {
        userId: email.toLowerCase(),
        authMethod: "email",
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("morphcash_session", JSON.stringify(sessionData));

      setUser({
        id: userData.id,
        email: userData.email,
        isAuthenticated: true,
        accountType: userData.accountType as "basic" | "premium" | "enterprise",
        authMethod: "email",
      });
    } catch (error) {
      console.error("Error during email registration:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("morphcash_session");
  };

  // ENS Profile Functions
  const createENSProfile = async (ensName: string, profileData: any) => {
    try {
      // This would integrate with your smart contract
      // For now, we'll store it locally
      const existingUsers = JSON.parse(localStorage.getItem("morphcash_users") || "{}");
      const userId = `ens_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const isWalletAuth = ensName.startsWith('wallet_');
      const authMethod = isWalletAuth ? "wallet" : "ens";
      
      const userData = {
        id: userId,
        ensName: ensName.toLowerCase(),
        address: isWalletAuth ? ensName.replace('wallet_', '') : undefined,
        email: profileData.email || "",
        accountType: "basic" as const,
        registeredAt: new Date().toISOString(),
        authMethod: authMethod,
        ensProfile: profileData,
      };

      existingUsers[userId] = userData;
      localStorage.setItem("morphcash_users", JSON.stringify(existingUsers));

      setUser({
        id: userData.id,
        address: userData.address,
        ensName: userData.ensName,
        ensAvatar: profileData.avatar,
        email: userData.email,
        isAuthenticated: true,
        accountType: userData.accountType,
        authMethod: authMethod,
        ensProfile: profileData,
      });
    } catch (error) {
      console.error("Error creating ENS profile:", error);
      throw error;
    }
  };

  const updateENSProfile = async (ensName: string, profileData: any) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem("morphcash_users") || "{}");
      const userData = Object.values(existingUsers).find((user: any) => user.ensName === ensName) as any;

      if (userData) {
        userData.ensProfile = { ...userData.ensProfile, ...profileData };
        existingUsers[userData.id] = userData;
        localStorage.setItem("morphcash_users", JSON.stringify(existingUsers));

        setUser(prev => prev ? {
          ...prev,
          ensProfile: { ...prev.ensProfile, ...profileData }
        } : null);
      }
    } catch (error) {
      console.error("Error updating ENS profile:", error);
      throw error;
    }
  };

  const loadENSProfile = async (ensName: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem("morphcash_users") || "{}");
      const userData = Object.values(existingUsers).find((user: any) => user.ensName === ensName) as any;

      if (userData) {
        setUser({
          id: userData.id,
          ensName: userData.ensName,
          ensAvatar: userData.ensProfile?.avatar,
          email: userData.email,
          isAuthenticated: true,
          accountType: userData.accountType as "basic" | "premium" | "enterprise",
          authMethod: "ens",
          ensProfile: userData.ensProfile,
        });
      }
    } catch (error) {
      console.error("Error loading ENS profile:", error);
    }
  };

  const loginWithWallet = async (walletAddress: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem("morphcash_users") || "{}");
      const userData = Object.values(existingUsers).find((user: any) => user.address === walletAddress) as any;

      if (userData) {
        // User exists, log them in
        setUser({
          id: userData.id,
          address: userData.address,
          ensName: userData.ensName,
          ensAvatar: userData.ensProfile?.avatar,
          email: userData.email,
          isAuthenticated: true,
          accountType: userData.accountType as "basic" | "premium" | "enterprise",
          authMethod: "wallet",
          ensProfile: userData.ensProfile,
        });
      } else {
        // Create new user with wallet
        const profileData = {
          displayName: `Wallet User ${walletAddress.slice(0, 6)}`,
          bio: "Connected via wallet",
          avatar: "",
          website: "",
          twitter: "",
          github: "",
          discord: "",
          telegram: "",
        };
        
        await createENSProfile(`wallet_${walletAddress}`, profileData);
      }
    } catch (error) {
      console.error("Error logging in with wallet:", error);
      throw error;
    }
  };

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    loginWithEmail,
    loginWithENS,
    loginWithWallet,
    registerWithEmail,
    logout,
    checkUserExists,
    createENSProfile,
    updateENSProfile,
    loadENSProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
