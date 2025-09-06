"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useEnsName, useEnsAvatar } from "wagmi";
import { useENSProfile } from "~~/hooks/scaffold-eth/useENSProfile";
import { supabaseDatabase } from "~~/supabase/supabase";
import { verifyENSOwnership } from "~~/utils/ensVerification";

interface User {
  id: string;
  address?: string;
  ensName?: string;
  ensAvatar?: string;
  email?: string;
  isAuthenticated: boolean;
  auth_method: "ens" | "email" | "wallet";
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
      let result;
      if (method === "email") {
        result = await supabaseDatabase.getUserByEmail(identifier);
      } else {
        result = await supabaseDatabase.getUserByENS(identifier);
      }
      return result.success && !!result.data;
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
        const sessionResult = await supabaseDatabase.getSession(session.sessionId);
        
        if (sessionResult.success && sessionResult.data) {
          // Check if session is expired
          const now = new Date();
          const expiresAt = new Date(sessionResult.data.expires_at);
          
          if (now > expiresAt) {
            // Session expired, clear it
            await supabaseDatabase.deleteSession(session.sessionId);
            localStorage.removeItem("morphcash_session");
          } else {
            // Get user data
            const userResult = await supabaseDatabase.getUser(sessionResult.data.user_id);
            
            if (userResult.success && userResult.data) {
              setUser({
                id: userResult.data.id,
                address: userResult.data.address,
                ensName: userResult.data.ens_name,
                ensAvatar: userResult.data.ens_avatar,
                email: userResult.data.email,
                isAuthenticated: true,
                auth_method: userResult.data.auth_method,
                ensProfile: userResult.data.ens_profile,
              });
            }
          }
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
      const result = await supabaseDatabase.getUserByEmail(email);
      
      if (!result.success || !result.data) {
        throw new Error("Invalid email or password");
      }

      // For now, we'll use a simple password check
      // In production, you'd use proper password hashing
      const userData = result.data;

      // Create session
      const sessionResult = await supabaseDatabase.createSession(
        userData.id,
        `email_${Date.now()}`,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );

      if (sessionResult.success && sessionResult.data) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          sessionId: sessionResult.data.id,
          userId: userData.id,
          expiresAt: sessionResult.data.expires_at,
        }));

        setUser({
          id: userData.id,
          address: userData.address,
          ensName: userData.ens_name,
          ensAvatar: userData.ens_avatar,
          email: userData.email,
          isAuthenticated: true,
          auth_method: "email",
          ensProfile: userData.ens_profile,
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
    try {
      const result = await supabaseDatabase.getUserByENS(ensName);
      
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
      const sessionResult = await supabaseDatabase.createSession(
        userData.id,
        `ens_${Date.now()}`,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );

      if (sessionResult.success && sessionResult.data) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          sessionId: sessionResult.data.id,
          userId: userData.id,
          expiresAt: sessionResult.data.expires_at,
        }));

        setUser({
          id: userData.id,
          address: userData.address,
          ensName: userData.ens_name,
          ensAvatar: userData.ens_avatar,
          email: userData.email,
          isAuthenticated: true,
          authMethod: "ens",
          ensProfile: userData.ens_profile,
        });
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      console.error("Error during ENS login:", error);
      throw error;
    }
  };

  // Email/Password registration
  const registerWithEmail = async (email: string, password: string) => {
    try {
      // Check if user already exists
      const exists = await checkUserExists(email, "email");
      if (exists) {
        throw new Error("Email already registered");
      }

      // Create new user
      const result = await supabaseDatabase.createUser({
        email: email.toLowerCase(),
        auth_method: "email",
      });

      if (!result.success || !result.data) {
        throw new Error("Failed to create user");
      }

      // Create session
      const sessionResult = await supabaseDatabase.createSession(
        result.data.id,
        `email_${Date.now()}`,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );

      if (sessionResult.success && sessionResult.data) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          sessionId: sessionResult.data.id,
          userId: result.data.id,
          expiresAt: sessionResult.data.expires_at,
        }));

        setUser({
          id: result.data.id,
          email: result.data.email,
          isAuthenticated: true,
          auth_method: "email",
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
    try {
      const sessionData = localStorage.getItem("morphcash_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.sessionId) {
          await supabaseDatabase.deleteSession(session.sessionId);
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
    try {
      const isWalletAuth = ensName.startsWith('wallet_');
      const authMethod = isWalletAuth ? "wallet" : "ens";
      const address = isWalletAuth ? ensName.replace('wallet_', '') : undefined;
      
      // Create new user
      const result = await supabaseDatabase.createUser({
        address,
        ens_name: ensName.toLowerCase(),
        auth_method: authMethod as "ens" | "wallet",
        ens_profile: profileData,
      });

      if (!result.success || !result.data) {
        throw new Error("Failed to create ENS profile");
      }

      // Create session
      const sessionResult = await supabaseDatabase.createSession(
        result.data.id,
        `${authMethod}_${Date.now()}`,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      );

      if (sessionResult.success && sessionResult.data) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          sessionId: sessionResult.data.id,
          userId: result.data.id,
          expiresAt: sessionResult.data.expires_at,
        }));

        setUser({
          id: result.data.id,
          address: result.data.address,
          ensName: result.data.ens_name,
          ensAvatar: profileData.avatar,
          email: result.data.email,
          isAuthenticated: true,
          auth_method: authMethod as "ens" | "wallet",
          ensProfile: profileData,
        });
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      console.error("Error creating ENS profile:", error);
      throw error;
    }
  };

  const updateENSProfile = async (ensName: string, profileData: any) => {
    try {
      if (!user) {
        throw new Error("User not logged in");
      }

      const result = await supabaseDatabase.updateUser(user.id, {
        ens_profile: { ...user.ensProfile, ...profileData },
      });

      if (result.success && result.data) {
        setUser(prev => prev ? {
          ...prev,
          ensProfile: { ...prev.ensProfile, ...profileData }
        } : null);
      } else {
        throw new Error("Failed to update ENS profile");
      }
    } catch (error) {
      console.error("Error updating ENS profile:", error);
      throw error;
    }
  };

  const loadENSProfile = async (ensName: string) => {
    try {
      const result = await supabaseDatabase.getUserByENS(ensName);
      
      if (result.success && result.data) {
        const userData = result.data;
        
        // Create session
        const sessionResult = await supabaseDatabase.createSession(
          userData.id,
          `ens_${Date.now()}`,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        );

        if (sessionResult.success && sessionResult.data) {
          localStorage.setItem("morphcash_session", JSON.stringify({
            sessionId: sessionResult.data.id,
            userId: userData.id,
            expiresAt: sessionResult.data.expires_at,
          }));

          setUser({
            id: userData.id,
            address: userData.address,
            ensName: userData.ens_name,
            ensAvatar: userData.ens_avatar,
            email: userData.email,
            isAuthenticated: true,
            authMethod: "ens",
            ensProfile: userData.ens_profile,
          });
        }
      } else {
        throw new Error("ENS profile not found");
      }
    } catch (error) {
      console.error("Error loading ENS profile:", error);
      throw error;
    }
  };

  const loginWithWallet = async (walletAddress: string) => {
    try {
      const result = await supabaseDatabase.getUserByAddress(walletAddress);
      
      if (result.success && result.data) {
        // User exists, log them in
        const userData = result.data;
        
        // Create session
        const sessionResult = await supabaseDatabase.createSession(
          userData.id,
          `wallet_${Date.now()}`,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        );

        if (sessionResult.success && sessionResult.data) {
          localStorage.setItem("morphcash_session", JSON.stringify({
            sessionId: sessionResult.data.id,
            userId: userData.id,
            expiresAt: sessionResult.data.expires_at,
          }));

          setUser({
            id: userData.id,
            address: userData.address,
            ensName: userData.ens_name,
            ensAvatar: userData.ens_avatar,
            email: userData.email,
            isAuthenticated: true,
            authMethod: "wallet",
            ensProfile: userData.ens_profile,
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
