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

  // Note: Contract-based card reading is disabled since we're using payment events
  // All cards are now stored in the database and created via payment events

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

  // Fetch database cards when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDbCards();
    }
  }, [isAuthenticated, user]);

  // Note: Update and deactivate functions are disabled since we're using database-only approach
  // All card management is now handled through the database

  // Use database cards for all users
  const cards = dbCards;
  const cardCount = dbCards ? BigInt(dbCards.length) : undefined;
  const isLoading = isDbLoading;
  const cardsError = dbError;

  // Refetch function
  const refetchCards = async () => {
    await fetchDbCards();
  };

  return {
    cards,
    cardCount,
    isLoading,
    refetchCards,
    cardsError,
  };
};
