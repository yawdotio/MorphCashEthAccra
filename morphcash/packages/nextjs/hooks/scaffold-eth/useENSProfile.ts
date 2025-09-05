import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { keccak256, toUtf8Bytes } from "viem";
import { useAccount } from "wagmi";

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

export const useENSProfile = (ensName?: string) => {
  const { address } = useAccount();
  
  // Convert ENS name to hash
  const ensHash = ensName ? keccak256(toUtf8Bytes(ensName)) : undefined;

  // Read profile data
  const { data: profile, isLoading: isProfileLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getProfile",
    args: ensHash ? [ensHash] : undefined,
    enabled: !!ensHash,
  });

  // Write profile data
  const { writeAsync: createProfile, isLoading: isCreating } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "createProfile",
  });

  const { writeAsync: updateProfile, isLoading: isUpdating } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "updateProfile",
  });

  return {
    profile: profile as UserProfile | undefined,
    isLoading: isProfileLoading,
    createProfile,
    updateProfile,
    isCreating,
    isUpdating,
    ensHash,
  };
};

export const useENSProfileByAddress = (userAddress?: string) => {
  // Read profile data by address
  const { data: profile, isLoading: isProfileLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getProfileByAddress",
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress,
  });

  return {
    profile: profile as UserProfile | undefined,
    isLoading: isProfileLoading,
  };
};
