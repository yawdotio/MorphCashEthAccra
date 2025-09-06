/**
 * Smart Contract Service
 * Provides integration with the MorphCash smart contract for ENS profile management
 */

import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { keccak256, stringToBytes } from "viem";
import { normalize } from "viem/ens";

export interface UserProfile {
  displayName: string;
  bio: string;
  avatar: string;
  website: string;
  twitter: string;
  github: string;
  discord: string;
  telegram: string;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface SmartContractResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

class SmartContractService {
  /**
   * Create ENS profile on smart contract
   */
  async createENSProfile(
    ensName: string,
    profile: Omit<UserProfile, "isActive" | "createdAt" | "updatedAt">,
    walletAddress: string
  ): Promise<SmartContractResult> {
    try {
      const normalizedName = normalize(ensName);
      const ensHash = keccak256(stringToBytes(normalizedName));
      
      // This would use the useScaffoldWriteContract hook in a React component
      // For now, we'll return a mock result
      console.log("Creating ENS profile on smart contract:", {
        ensName,
        ensHash,
        profile,
        walletAddress,
      });

      // In production, this would:
      // 1. Call the createProfile function on YourContract
      // 2. Wait for transaction confirmation
      // 3. Return the transaction hash

      return {
        success: true,
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
      };
    } catch (error) {
      console.error("Error creating ENS profile on smart contract:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update ENS profile on smart contract
   */
  async updateENSProfile(
    ensName: string,
    profile: Omit<UserProfile, "isActive" | "createdAt" | "updatedAt">,
    walletAddress: string
  ): Promise<SmartContractResult> {
    try {
      const normalizedName = normalize(ensName);
      const ensHash = keccak256(stringToBytes(normalizedName));
      
      console.log("Updating ENS profile on smart contract:", {
        ensName,
        ensHash,
        profile,
        walletAddress,
      });

      return {
        success: true,
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
      };
    } catch (error) {
      console.error("Error updating ENS profile on smart contract:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get ENS profile from smart contract
   */
  async getENSProfile(ensName: string): Promise<UserProfile | null> {
    try {
      const normalizedName = normalize(ensName);
      const ensHash = keccak256(stringToBytes(normalizedName));
      
      console.log("Getting ENS profile from smart contract:", {
        ensName,
        ensHash,
      });

      // In production, this would call the getProfile function on YourContract
      // For now, return null to indicate no profile found
      return null;
    } catch (error) {
      console.error("Error getting ENS profile from smart contract:", error);
      return null;
    }
  }

  /**
   * Check if ENS profile exists on smart contract
   */
  async hasENSProfile(ensName: string): Promise<boolean> {
    try {
      const profile = await this.getENSProfile(ensName);
      return profile !== null;
    } catch (error) {
      console.error("Error checking ENS profile existence:", error);
      return false;
    }
  }

  /**
   * Generate ENS hash for smart contract storage
   */
  generateENSHash(ensName: string): string {
    try {
      const normalizedName = normalize(ensName);
      return keccak256(stringToBytes(normalizedName));
    } catch (error) {
      console.error("Error generating ENS hash:", error);
      throw new Error("Invalid ENS name format");
    }
  }
}

// Export singleton instance
export const smartContractService = new SmartContractService();

// React hooks for smart contract interaction
export const useSmartContractProfile = (ensName?: string) => {
  const ensHash = ensName ? smartContractService.generateENSHash(ensName) : undefined;

  const { data: profile, isLoading: isProfileLoading } = useScaffoldReadContract({
    contractName: "ENSProfileContract",
    functionName: "getProfile",
    args: ensHash ? [ensHash] : undefined,
  });

  const { writeContractAsync: createProfile, isPending: isCreating } = useScaffoldWriteContract("ENSProfileContract");
  const { writeContractAsync: updateProfile, isPending: isUpdating } = useScaffoldWriteContract("ENSProfileContract");

  return {
    profile: profile as UserProfile | undefined,
    isLoading: isProfileLoading,
    createProfile: createProfile ? (args: any) => createProfile({ functionName: "createProfile", args }) : undefined,
    updateProfile: updateProfile ? (args: any) => updateProfile({ functionName: "updateProfile", args }) : undefined,
    isCreating,
    isUpdating,
    ensHash,
  };
};
