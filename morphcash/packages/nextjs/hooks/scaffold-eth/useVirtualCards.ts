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

  // Read user's virtual cards - only call when address is available
  const { data: cards, isLoading: isCardsLoading, refetch: refetchCards, error: cardsError } = useScaffoldReadContract({
    contractName: "VirtualCardContract",
    functionName: "getUserVirtualCards",
    args: address ? [address] : [undefined],
    query: {
      enabled: !!address, // Only run query when address is available
    },
  });

  // Read user's card count - only call when address is available
  const { data: cardCount } = useScaffoldReadContract({
    contractName: "VirtualCardContract",
    functionName: "getUserCardCount",
    args: address ? [address] : [undefined],
    query: {
      enabled: !!address, // Only run query when address is available
    },
  });

  // Write functions
  const { writeContractAsync: createCard, isPending: isCreating, error: createError } = useScaffoldWriteContract("VirtualCardContract");
  const { writeContractAsync: updateCard, isPending: isUpdating } = useScaffoldWriteContract("VirtualCardContract");
  const { writeContractAsync: deactivateCard, isPending: isDeactivating } = useScaffoldWriteContract("VirtualCardContract");

  return {
    cards: cards as VirtualCard[] | undefined,
    cardCount: cardCount as bigint | undefined,
    isLoading: isCardsLoading,
    isCreating,
    isUpdating,
    isDeactivating,
    createCard: createCard ? (args: any) => createCard({ functionName: "createVirtualCard", args }) : (() => { throw new Error("createCard not available. Contract may not be deployed or connected."); }),
    updateCard: updateCard ? (args: any) => updateCard({ functionName: "updateVirtualCard", args }) : undefined,
    deactivateCard: deactivateCard ? (args: any) => deactivateCard({ functionName: "deactivateVirtualCard", args }) : undefined,
    refetchCards,
    createError,
    cardsError,
  };
};
