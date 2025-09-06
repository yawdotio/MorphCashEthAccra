import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { useEnhancedAuth } from "~~/contexts/EnhancedAuthContext";
import { userService } from "~~/services/userService";
import { useState, useEffect } from "react";

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
  const { user, isAuthenticated } = useEnhancedAuth();
  const [dbCards, setDbCards] = useState<VirtualCard[] | undefined>(undefined);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  // Read user's virtual cards from contract - only call when address is available
  const { data: contractCards, isLoading: isContractLoading, refetch: refetchContractCards, error: contractError } = useScaffoldReadContract({
    contractName: "VirtualCardContract",
    functionName: "getUserVirtualCards",
    args: address ? [address] : [undefined],
    query: {
      enabled: !!address, // Only run query when address is available
    },
  });

  // Read user's card count from contract - only call when address is available
  const { data: contractCardCount } = useScaffoldReadContract({
    contractName: "VirtualCardContract",
    functionName: "getUserCardCount",
    args: address ? [address] : [undefined],
    query: {
      enabled: !!address, // Only run query when address is available
    },
  });

  // Fetch cards from database for email/ENS users
  const fetchDbCards = async () => {
    if (!user || !isAuthenticated) return;
    
    setIsDbLoading(true);
    setDbError(null);
    
    try {
      const result = await userService.getUserVirtualCards(user.id);
      if (result.success && result.data) {
        // Convert database cards to VirtualCard format
        const virtualCards: VirtualCard[] = result.data.map(card => ({
          cardId: BigInt(card.card_id),
          cardName: card.card_name,
          cardNumber: card.card_number,
          expiryDate: card.expiry_date,
          cardType: card.card_type,
          spendingLimit: BigInt(card.spending_limit),
          currentSpend: BigInt(card.current_spend),
          isActive: card.is_active,
          createdAt: BigInt(new Date(card.created_at).getTime()),
        }));
        setDbCards(virtualCards);
      } else {
        setDbCards([]);
      }
    } catch (error) {
      console.error('Error fetching database cards:', error);
      setDbError(error instanceof Error ? error : new Error('Failed to fetch cards'));
    } finally {
      setIsDbLoading(false);
    }
  };

  // Fetch database cards when user is authenticated but has no wallet address
  useEffect(() => {
    if (isAuthenticated && user && !address) {
      fetchDbCards();
    }
  }, [isAuthenticated, user, address]);

  // Write functions
  const { writeContractAsync: createCard, isPending: isCreating, error: createError } = useScaffoldWriteContract("VirtualCardContract");
  const { writeContractAsync: updateCard, isPending: isUpdating } = useScaffoldWriteContract("VirtualCardContract");
  const { writeContractAsync: deactivateCard, isPending: isDeactivating } = useScaffoldWriteContract("VirtualCardContract");

  // Determine which cards to use and loading state
  const cards = address ? contractCards as VirtualCard[] | undefined : dbCards;
  const cardCount = address ? contractCardCount as bigint | undefined : (dbCards ? BigInt(dbCards.length) : undefined);
  const isLoading = address ? isContractLoading : isDbLoading;
  const cardsError = address ? contractError : dbError;

  // Refetch function
  const refetchCards = async () => {
    if (address) {
      refetchContractCards();
    } else {
      await fetchDbCards();
    }
  };

  return {
    cards,
    cardCount,
    isLoading,
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
