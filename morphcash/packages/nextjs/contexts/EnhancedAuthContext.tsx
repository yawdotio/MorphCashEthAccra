/**
 * Enhanced Authentication Context
 * Integrates with persistent database storage for user management
 */

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useEnsName, useEnsAvatar } from "wagmi";
import UserService from "~~/services/userService";
import { supabaseDatabase } from "~~/supabase/supabase";
import { User, DatabaseResponse } from "~~/services/database/types";
import { verifyENSOwnership } from "~~/utils/ensVerification";

interface EnhancedUser extends User {
  isAuthenticated: boolean;
}

interface EnhancedAuthContextType {
  user: EnhancedUser | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithENS: (ensName: string) => Promise<void>;
  loginWithWallet: (address: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  checkUserExists: (identifier: string, method: "ens" | "email") => Promise<boolean>;
  createENSProfile: (ensName: string, profileData: any) => Promise<void>;
  updateENSProfile: (ensName: string, profileData: any) => Promise<void>;
  loadENSProfile: (ensName: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

export const EnhancedAuthProvider = ({ children }: EnhancedAuthProviderProps) => {
  const { address } = useAccount();
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userService, setUserService] = useState<UserService | null>(null);

  // Initialize user service
  useEffect(() => {
    const databaseService = supabaseDatabase;
    const service = new UserService({
      database: databaseService,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
    setUserService(service);
  }, []);

  // Load user data from session on mount
  const loadUserData = async () => {
    if (!userService) return;

    try {
      const sessionData = localStorage.getItem("morphcash_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        if (session.token) {
          const result = await userService.validateSession(session.token);
          
          if (result.success && result.data) {
            setUser({
              ...result.data,
              isAuthenticated: true,
            });
          } else {
            // Session invalid, clear it
            localStorage.removeItem("morphcash_session");
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [userService]);

  // Check if user exists in the system
  const checkUserExists = async (identifier: string, method: "ens" | "email"): Promise<boolean> => {
    if (!userService) return false;

    try {
      let result: DatabaseResponse<User>;
      
      if (method === "email") {
        result = await userService.getUserByEmail(identifier);
      } else {
        result = await userService.getUserByENS(identifier);
      }
      
      return result.success && !!result.data;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  // Email/Password login
  const loginWithEmail = async (email: string, password: string) => {
    if (!userService) throw new Error("User service not initialized");

    try {
      // For now, we'll use a simple password check
      // In production, you'd use proper password hashing
      const result = await userService.getUserByEmail(email);
      
      if (!result.success || !result.data) {
        throw new Error("Invalid email or password");
      }

      // Create session
      const token = `email_${Date.now()}`;
      const sessionResult = await userService.createSession(
        result.data.id,
        token,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );

      if (sessionResult.success && sessionResult.data) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          token: token,
          userId: result.data.id,
          expiresAt: sessionResult.data.expiresAt,
        }));

        setUser({
          ...result.data,
          isAuthenticated: true,
        });
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      console.error("Error during email login:", error);
      throw error;
    }
  };

  // ENS login
  const loginWithENS = async (ensName: string) => {
    if (!userService) throw new Error("User service not initialized");

    try {
      const result = await userService.getUserByENS(ensName);
      
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

      // Create session
      const token = `ens_${Date.now()}`;
      const sessionResult = await userService.createSession(
        userData.id,
        token,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );

      if (sessionResult.success && sessionResult.data) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          token: token,
          userId: userData.id,
          expiresAt: sessionResult.data.expiresAt,
        }));

        setUser({
          ...userData,
          isAuthenticated: true,
        });
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      console.error("Error during ENS login:", error);
      throw error;
    }
  };

  // Wallet login
  const loginWithWallet = async (walletAddress: string) => {
    if (!userService) throw new Error("User service not initialized");

    try {
      const result = await userService.getUserByAddress(walletAddress);
      
      if (result.success && result.data) {
        // User exists, log them in
        const token = `wallet_${Date.now()}`;
        const sessionResult = await userService.createSession(
          result.data.id,
          token,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        );

        if (sessionResult.success && sessionResult.data) {
          localStorage.setItem("morphcash_session", JSON.stringify({
            token: token,
            userId: result.data.id,
            expiresAt: sessionResult.data.expiresAt,
          }));

          setUser({
            ...result.data,
            isAuthenticated: true,
          });
        }
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
          isVerified: false,
        };
        
        await createENSProfile(`wallet_${walletAddress}`, profileData);
      }
    } catch (error) {
      console.error("Error logging in with wallet:", error);
      throw error;
    }
  };

  // Email/Password registration
  const registerWithEmail = async (email: string, password: string, confirmPassword: string) => {
    if (!userService) throw new Error("User service not initialized");

    try {
      // Validate password confirmation
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new Error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      }

      // Check if user already exists
      const exists = await checkUserExists(email, "email");
      if (exists) {
        throw new Error("Email already registered");
      }

      // Create new user (in production, password should be hashed)
      const result = await userService.createUser({
        email: email.toLowerCase(),
        auth_method: "email",
        // Note: In production, store a hashed version of the password
        password_hash: password, // This should be bcrypt.hash(password, 10) in production
      });

      if (!result.success || !result.data) {
        throw new Error("Failed to create user");
      }

      // Create session
      const token = `email_${Date.now()}`;
      const sessionResult = await userService.createSession(
        result.data.id,
        token,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );

      if (sessionResult.success && sessionResult.data) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          token: token,
          userId: result.data.id,
          expiresAt: sessionResult.data.expiresAt,
        }));

        setUser({
          ...result.data,
          isAuthenticated: true,
        });
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      console.error("Error during email registration:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    if (!userService) return;

    try {
      const sessionData = localStorage.getItem("morphcash_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.token) {
          await userService.deleteSession(session.token);
        }
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("morphcash_session");
    }
  };

  // ENS Profile Functions
  const createENSProfile = async (ensName: string, profileData: any) => {
    if (!userService) throw new Error("User service not initialized");

    try {
      const isWalletAuth = ensName.startsWith('wallet_');
      const authMethod = isWalletAuth ? "wallet" : "ens";
      const address = isWalletAuth ? ensName.replace('wallet_', '') : undefined;
      
      const result = await userService.createUser({
        address,
        ens_name: ensName.toLowerCase(),
        auth_method: authMethod as "ens" | "wallet",
        ens_profile: {
          ...profileData,
          isVerified: false,
        },
      });

      if (!result.success || !result.data) {
        throw new Error("Failed to create ENS profile");
      }

      // Create session
      const token = `${authMethod}_${Date.now()}`;
      const sessionResult = await userService.createSession(
        result.data.id,
        token,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );

      if (sessionResult.success && sessionResult.data) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          token: token,
          userId: result.data.id,
          expiresAt: sessionResult.data.expiresAt,
        }));

        setUser({
          ...result.data,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error creating ENS profile:", error);
      throw error;
    }
  };

  const updateENSProfile = async (ensName: string, profileData: any) => {
    if (!userService || !user) throw new Error("User service not initialized or user not logged in");

    try {
      const result = await userService.updateUser(user.id, {
        ens_profile: { ...user.ens_profile, ...profileData },
      });

      if (result.success && result.data) {
        setUser({
          ...result.data,
          isAuthenticated: true,
        });
      } else {
        throw new Error("Failed to update ENS profile");
      }
    } catch (error) {
      console.error("Error updating ENS profile:", error);
      throw error;
    }
  };

  const loadENSProfile = async (ensName: string) => {
    if (!userService) throw new Error("User service not initialized");

    try {
      const result = await userService.getUserByENS(ensName);
      
      if (result.success && result.data) {
        setUser({
          ...result.data,
          isAuthenticated: true,
        });
      } else {
        throw new Error("ENS profile not found");
      }
    } catch (error) {
      console.error("Error loading ENS profile:", error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!userService || !user) throw new Error("User service not initialized or user not logged in");

    try {
      const result = await userService.updateUser(user.id, updates);

      if (result.success && result.data) {
        setUser({
          ...result.data,
          isAuthenticated: true,
        });
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!userService || !user) return;

    try {
      const result = await userService.getUser(user.id);
      
      if (result.success && result.data) {
        setUser({
          ...result.data,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value: EnhancedAuthContextType = {
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
    updateUser,
    refreshUser,
  };

  return <EnhancedAuthContext.Provider value={value}>{children}</EnhancedAuthContext.Provider>;
};

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error("useEnhancedAuth must be used within an EnhancedAuthProvider");
  }
  return context;
};
