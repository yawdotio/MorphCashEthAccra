import { useEnsName, useEnsAddress } from "wagmi";
import { normalize } from "viem/ens";
import { keccak256, stringToBytes } from "viem";

/**
 * ENS Verification Utilities
 * Provides functions to verify ENS ownership and resolve ENS names
 */

export interface ENSVerificationResult {
  isValid: boolean;
  resolvedAddress?: string;
  error?: string;
}

/**
 * Verify if a wallet address owns a specific ENS name
 * @param ensName The ENS name to verify (e.g., "vitalik.eth")
 * @param walletAddress The wallet address to check ownership for
 * @returns Promise<ENSVerificationResult>
 */
export const verifyENSOwnership = async (
  ensName: string,
  walletAddress: string
): Promise<ENSVerificationResult> => {
  try {
    // Normalize the ENS name
    const normalizedName = normalize(ensName);
    
    // This would typically involve:
    // 1. Resolving the ENS name to get the current owner address
    // 2. Comparing with the provided wallet address
    // 3. Verifying the name is not expired
    
    // For now, we'll simulate this with a mock verification
    // In production, this would use the ENS registry contract
    
    // Mock verification logic (replace with real ENS registry calls)
    const mockVerification = await mockVerifyENSOwnership(normalizedName, walletAddress);
    
    return mockVerification;
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "ENS verification failed"
    };
  }
};

/**
 * Mock ENS ownership verification
 * In production, this would query the ENS registry contract
 */
const mockVerifyENSOwnership = async (
  ensName: string,
  walletAddress: string
): Promise<ENSVerificationResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock verification logic
  // In production, this would:
  // 1. Query the ENS registry contract
  // 2. Get the current owner of the ENS name
  // 3. Check if the owner matches the wallet address
  // 4. Verify the name is not expired
  
  // For demo purposes, we'll accept certain patterns
  const validPatterns = [
    /^test\d+\.eth$/,
    /^demo\d+\.eth$/,
    /^morph\d+\.eth$/,
    /^vitalik\.eth$/,
    /^alice\.eth$/,
    /^bob\.eth$/
  ];
  
  const isValidPattern = validPatterns.some(pattern => pattern.test(ensName));
  
  if (!isValidPattern) {
    return {
      isValid: false,
      error: "ENS name not found or not owned by this address"
    };
  }
  
  return {
    isValid: true,
    resolvedAddress: walletAddress
  };
};

/**
 * Resolve ENS name to address
 * @param ensName The ENS name to resolve
 * @returns Promise<string | null>
 */
export const resolveENSName = async (ensName: string): Promise<string | null> => {
  try {
    const normalizedName = normalize(ensName);
    
    // In production, this would use the ENS resolver contract
    // For now, we'll return a mock address
    return "0x" + keccak256(stringToBytes(normalizedName)).slice(2, 42);
  } catch (error) {
    console.error("Error resolving ENS name:", error);
    return null;
  }
};

/**
 * Check if an ENS name is available for registration
 * @param ensName The ENS name to check
 * @returns Promise<boolean>
 */
export const isENSAvailable = async (ensName: string): Promise<boolean> => {
  try {
    const normalizedName = normalize(ensName);
    
    // In production, this would query the ENS registry
    // For now, we'll simulate availability check
    const unavailableNames = [
      "vitalik.eth",
      "alice.eth", 
      "bob.eth",
      "test.eth",
      "demo.eth"
    ];
    
    return !unavailableNames.includes(normalizedName);
  } catch (error) {
    console.error("Error checking ENS availability:", error);
    return false;
  }
};

/**
 * Get ENS name expiration date
 * @param ensName The ENS name to check
 * @returns Promise<Date | null>
 */
export const getENSExpiration = async (ensName: string): Promise<Date | null> => {
  try {
    const normalizedName = normalize(ensName);
    
    // In production, this would query the ENS registry
    // For now, we'll return a mock expiration date (1 year from now)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    return expirationDate;
  } catch (error) {
    console.error("Error getting ENS expiration:", error);
    return null;
  }
};

/**
 * Generate ENS name hash for smart contract storage
 * @param ensName The ENS name to hash
 * @returns string The keccak256 hash
 */
export const generateENSHash = (ensName: string): string => {
  try {
    const normalizedName = normalize(ensName);
    return keccak256(stringToBytes(normalizedName));
  } catch (error) {
    console.error("Error generating ENS hash:", error);
    throw new Error("Invalid ENS name format");
  }
};
