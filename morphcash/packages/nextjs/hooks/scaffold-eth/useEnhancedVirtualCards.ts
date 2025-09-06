/**
 * Enhanced Virtual Cards Hook
 * Integrates on-chain virtual cards with persistent database storage
 */

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { UserService } from '~~/services/userService';
import { VirtualCard, DatabaseResponse, PaginatedResponse } from '~~/services/database/types';
import { useEnhancedAuth } from '~~/contexts/EnhancedAuthContext';

export interface EnhancedVirtualCard extends VirtualCard {
  // Additional computed properties
  spendingPercentage: number;
  daysUntilExpiry: number;
  isExpired: boolean;
}

export const useEnhancedVirtualCards = () => {
  const { address } = useAccount();
  const { user } = useEnhancedAuth();
  const [userService, setUserService] = useState<UserService | null>(null);
  const [cards, setCards] = useState<EnhancedVirtualCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user service
  useEffect(() => {
    if (user) {
      // This would be initialized in the auth context
      // For now, we'll create a mock service
      setUserService(null); // Will be replaced with actual service
    }
  }, [user]);

  // Read user's virtual cards from smart contract
  const { 
    data: onChainCards, 
    isLoading: isOnChainLoading, 
    refetch: refetchOnChainCards, 
    error: onChainError 
  } = useScaffoldReadContract({
    contractName: "VirtualCardContractV2",
    functionName: "getUserVirtualCards",
    args: address ? [address] : [undefined],
    query: {
      enabled: !!address,
    },
  });

  // Write functions for smart contract
  const { writeContractAsync: createCardContract, isPending: isCreating } = useScaffoldWriteContract("VirtualCardContractV2");
  const { writeContractAsync: updateCardContract, isPending: isUpdating } = useScaffoldWriteContract("VirtualCardContractV2");
  const { writeContractAsync: deactivateCardContract, isPending: isDeactivating } = useScaffoldWriteContract("VirtualCardContractV2");

  // Load cards from database
  const loadCards = async () => {
    if (!userService || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await userService.getVirtualCards(user.id);
      
      if (result.success && result.data) {
        const enhancedCards = result.data.map(card => enhanceCard(card));
        setCards(enhancedCards);
      } else {
        setError(result.error || "Failed to load cards");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhance card with computed properties
  const enhanceCard = (card: VirtualCard): EnhancedVirtualCard => {
    const spendingPercentage = Number(card.spendingLimit) > 0 
      ? (Number(card.currentSpend) / Number(card.spendingLimit)) * 100 
      : 0;

    const expiryDate = new Date(card.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysUntilExpiry < 0;

    return {
      ...card,
      spendingPercentage,
      daysUntilExpiry,
      isExpired,
    };
  };

  // Create a new virtual card
  const createCard = async (cardData: {
    cardName: string;
    cardNumber: string;
    cardType: string;
    spendingLimit: number;
  }) => {
    if (!userService || !user || !createCardContract) {
      throw new Error("Service not available");
    }

    try {
      // First, create on-chain
      const onChainResult = await createCardContract({
        functionName: "createVirtualCard",
        args: [
          cardData.cardName,
          cardData.cardNumber,
          cardData.cardType,
          BigInt(cardData.spendingLimit)
        ],
      });

      // Then, create in database
      const dbResult = await userService.createVirtualCard(user.id, {
        cardName: cardData.cardName,
        cardNumber: cardData.cardNumber,
        cardType: cardData.cardType,
        spendingLimit: BigInt(cardData.spendingLimit),
        onChainTxHash: onChainResult,
      });

      if (dbResult.success) {
        // Refresh cards
        await loadCards();
        return dbResult.data;
      } else {
        throw new Error(dbResult.error || "Failed to create card in database");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      throw error;
    }
  };

  // Update a virtual card
  const updateCard = async (cardId: string, updates: {
    cardName?: string;
    spendingLimit?: number;
  }) => {
    if (!userService || !updateCardContract) {
      throw new Error("Service not available");
    }

    try {
      // Get current card data
      const currentCard = cards.find(card => card.id === cardId);
      if (!currentCard) {
        throw new Error("Card not found");
      }

      // Update on-chain
      const onChainResult = await updateCardContract({
        functionName: "updateVirtualCard",
        args: [
          currentCard.cardId,
          updates.cardName || currentCard.cardName,
          BigInt(updates.spendingLimit || Number(currentCard.spendingLimit))
        ],
      });

      // Update in database
      const dbResult = await userService.updateVirtualCard(cardId, {
        cardName: updates.cardName,
        spendingLimit: updates.spendingLimit ? BigInt(updates.spendingLimit) : undefined,
      });

      if (dbResult.success) {
        // Refresh cards
        await loadCards();
        return dbResult.data;
      } else {
        throw new Error(dbResult.error || "Failed to update card in database");
      }
    } catch (error) {
      console.error("Error updating card:", error);
      throw error;
    }
  };

  // Deactivate a virtual card
  const deactivateCard = async (cardId: string) => {
    if (!userService || !deactivateCardContract) {
      throw new Error("Service not available");
    }

    try {
      // Get current card data
      const currentCard = cards.find(card => card.id === cardId);
      if (!currentCard) {
        throw new Error("Card not found");
      }

      // Deactivate on-chain
      const onChainResult = await deactivateCardContract({
        functionName: "deactivateVirtualCard",
        args: [currentCard.cardId],
      });

      // Update in database
      const dbResult = await userService.updateVirtualCard(cardId, {
        isActive: false,
      });

      if (dbResult.success) {
        // Refresh cards
        await loadCards();
        return dbResult.data;
      } else {
        throw new Error(dbResult.error || "Failed to deactivate card in database");
      }
    } catch (error) {
      console.error("Error deactivating card:", error);
      throw error;
    }
  };

  // Refresh cards
  const refetchCards = async () => {
    await loadCards();
  };

  // Load cards when user or service changes
  useEffect(() => {
    if (userService && user) {
      loadCards();
    }
  }, [userService, user]);

  return {
    cards,
    isLoading: isLoading || isOnChainLoading,
    isCreating,
    isUpdating,
    isDeactivating,
    error: error || (onChainError ? onChainError.message : null),
    createCard,
    updateCard,
    deactivateCard,
    refetchCards,
  };
};
