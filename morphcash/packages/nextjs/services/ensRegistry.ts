import { createPublicClient, http, getContract } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

/**
 * ENS Registry Service
 * Provides real integration with the ENS registry contract
 */

// ENS Registry Contract ABI (simplified)
const ENS_REGISTRY_ABI = [
  {
    inputs: [{ name: "name", type: "bytes32" }],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "name", type: "bytes32" }],
    name: "resolver",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "name", type: "bytes32" }],
    name: "ttl",
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ENS Resolver Contract ABI (simplified)
const ENS_RESOLVER_ABI = [
  {
    inputs: [{ name: "name", type: "bytes32" }],
    name: "addr",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Contract addresses
const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const ENS_RESOLVER_ADDRESS = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";

// Create public client for mainnet
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Get ENS Registry contract instance
const ensRegistry = getContract({
  address: ENS_REGISTRY_ADDRESS,
  abi: ENS_REGISTRY_ABI,
  client: publicClient,
});

// Get ENS Resolver contract instance
const ensResolver = getContract({
  address: ENS_RESOLVER_ADDRESS,
  abi: ENS_RESOLVER_ABI,
  client: publicClient,
});

export interface ENSRegistryResult {
  owner: string;
  resolver: string;
  ttl: bigint;
  resolvedAddress?: string;
}

/**
 * Get ENS name information from the registry
 * @param ensName The ENS name to query
 * @returns Promise<ENSRegistryResult>
 */
export const getENSInfo = async (ensName: string): Promise<ENSRegistryResult | null> => {
  try {
    const normalizedName = normalize(ensName);
    const nameHash = keccak256(toUtf8Bytes(normalizedName));
    
    // Get owner, resolver, and TTL from registry
    const [owner, resolver, ttl] = await Promise.all([
      ensRegistry.read.owner([nameHash]),
      ensRegistry.read.resolver([nameHash]),
      ensRegistry.read.ttl([nameHash]),
    ]);
    
    // If no owner, the name doesn't exist
    if (owner === "0x0000000000000000000000000000000000000000") {
      return null;
    }
    
    // Try to resolve the address
    let resolvedAddress: string | undefined;
    if (resolver !== "0x0000000000000000000000000000000000000000") {
      try {
        resolvedAddress = await ensResolver.read.addr([nameHash]);
      } catch (error) {
        console.warn("Could not resolve address for ENS name:", ensName);
      }
    }
    
    return {
      owner,
      resolver,
      ttl,
      resolvedAddress,
    };
  } catch (error) {
    console.error("Error getting ENS info:", error);
    return null;
  }
};

/**
 * Verify ENS ownership
 * @param ensName The ENS name to verify
 * @param walletAddress The wallet address to check
 * @returns Promise<boolean>
 */
export const verifyENSOwnership = async (
  ensName: string,
  walletAddress: string
): Promise<boolean> => {
  try {
    const ensInfo = await getENSInfo(ensName);
    
    if (!ensInfo) {
      return false;
    }
    
    // Check if the wallet address owns the ENS name
    return ensInfo.owner.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying ENS ownership:", error);
    return false;
  }
};

/**
 * Check if ENS name is available for registration
 * @param ensName The ENS name to check
 * @returns Promise<boolean>
 */
export const isENSAvailable = async (ensName: string): Promise<boolean> => {
  try {
    const ensInfo = await getENSInfo(ensName);
    return ensInfo === null;
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
    const ensInfo = await getENSInfo(ensName);
    
    if (!ensInfo) {
      return null;
    }
    
    // Convert TTL to expiration date
    const expirationTimestamp = Number(ensInfo.ttl) * 1000;
    return new Date(expirationTimestamp);
  } catch (error) {
    console.error("Error getting ENS expiration:", error);
    return null;
  }
};

/**
 * Resolve ENS name to address
 * @param ensName The ENS name to resolve
 * @returns Promise<string | null>
 */
export const resolveENSName = async (ensName: string): Promise<string | null> => {
  try {
    const ensInfo = await getENSInfo(ensName);
    return ensInfo?.resolvedAddress || null;
  } catch (error) {
    console.error("Error resolving ENS name:", error);
    return null;
  }
};

// Import keccak256 and toUtf8Bytes
import { keccak256, toUtf8Bytes } from "viem";
