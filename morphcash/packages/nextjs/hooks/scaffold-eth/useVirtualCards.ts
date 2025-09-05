import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

export interface VirtualCard {
  cardId: bigint;
  cardName: string;
  cardNumber: string; // Masked: ****1234
  expiryDate: string;
  cardType: string; // Visa, Mastercard, etc.
  spendingLimit: bigint;
  currentSpend: bigint;
  isActive: boolean;
  createdAt: bigint;
}

export const useVirtualCards = () => {
  const { address } = useAccount();

  // Read user's virtual cards
  const { data: cards, isLoading: isCardsLoading, refetch: refetchCards, error: cardsError } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getUserVirtualCards",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Read user's card count
  const { data: cardCount } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getUserCardCount",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Write functions
  const { writeAsync: createCard, isLoading: isCreating, error: createError } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "createVirtualCard",
  });

  const { writeAsync: updateCard, isLoading: isUpdating } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "updateVirtualCard",
  });

  const { writeAsync: deactivateCard, isLoading: isDeactivating } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "deactivateVirtualCard",
  });

  return {
    cards: cards as VirtualCard[] | undefined,
    cardCount: cardCount as bigint | undefined,
    isLoading: isCardsLoading,
    isCreating,
    isUpdating,
    isDeactivating,
    createCard: createCard || (() => { throw new Error("createCard not available. Contract may not be deployed or connected."); }),
    updateCard,
    deactivateCard,
    refetchCards,
    createError,
    cardsError,
  };
};
