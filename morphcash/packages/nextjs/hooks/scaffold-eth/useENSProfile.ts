import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { keccak256, stringToBytes } from "viem";
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
  const ensHash = ensName ? keccak256(stringToBytes(ensName)) : undefined;

  // Read profile data
  const { data: profile, isLoading: isProfileLoading } = useScaffoldReadContract({
    contractName: "ENSProfileContract",
    functionName: "getProfile",
    args: ensHash ? [ensHash] : undefined,
  });

  // Write profile data
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

export const useENSProfileByAddress = (userAddress?: string) => {
  // Read profile data by address
  const { data: profile, isLoading: isProfileLoading } = useScaffoldReadContract({
    contractName: "ENSProfileContract",
    functionName: "getProfileByAddress",
    args: userAddress ? [userAddress] : undefined,
  });

  return {
    profile: profile as UserProfile | undefined,
    isLoading: isProfileLoading,
  };
};
