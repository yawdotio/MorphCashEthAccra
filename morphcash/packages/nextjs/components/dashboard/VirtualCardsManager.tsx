"use client";

import { useState } from "react";
import { useVirtualCards } from "~~/hooks/scaffold-eth/useVirtualCards";
import { useAccount } from "wagmi";
import { 
  PlusIcon, 
  CreditCardIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { CreateVirtualCardModal } from "./CreateVirtualCardModal";
import { EditVirtualCardModal } from "./EditVirtualCardModal";
import { VirtualCardIcon } from "./VirtualCardIcon";

export const VirtualCardsManager = () => {
  const { address } = useAccount();
  const { cards, isLoading, createCard, updateCard, deactivateCard, refetchCards, createError, cardsError } = useVirtualCards();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [showCardNumbers, setShowCardNumbers] = useState<{ [key: number]: boolean }>({});

  const toggleCardNumberVisibility = (cardIndex: number) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardIndex]: !prev[cardIndex]
    }));
  };

  const handleCreateCard = async (cardData: {
    cardName: string;
    cardNumber: string;
    expiryDate: string;
    cardType: string;
    spendingLimit: number;
    fundingAmount: number;
    feeAmount: number;
    totalAmount: number;
  }) => {
    try {
      console.log("Creating card with data:", cardData);
      console.log("createCard function:", createCard);
      console.log("createError:", createError);
      console.log("address:", address);
      
      if (!createCard) {
        throw new Error("createCard function is not available. Please check if the contract is deployed and connected.");
      }
      
      console.log("Calling createCard with args:", [
        cardData.cardName,
        cardData.cardNumber,
        cardData.cardType,
        BigInt(cardData.spendingLimit)
      ]);
      
      const result = await createCard({
        args: [
          cardData.cardName,
          cardData.cardNumber,
          cardData.cardType,
          BigInt(cardData.spendingLimit)
        ],
      });
      
      console.log("Card creation result:", result);
      setShowCreateModal(false);
      refetchCards();
    } catch (error) {
      console.error("Error creating card:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      // Show user-friendly error message
      alert(`Failed to create card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateCard = async (cardIndex: number, cardData: {
    cardName: string;
    spendingLimit: number;
  }) => {
    try {
      await updateCard({
        args: [
          BigInt(cardIndex),
          cardData.cardName,
          BigInt(cardData.spendingLimit)
        ],
      });
      setEditingCard(null);
      refetchCards();
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const handleDeactivateCard = async (cardIndex: number) => {
    try {
      await deactivateCard({
        args: [BigInt(cardIndex)],
      });
      refetchCards();
    } catch (error) {
      console.error("Error deactivating card:", error);
    }
  };

  // Debug logging
  console.log("VirtualCardsManager Debug:", {
    address,
    cards,
    isLoading,
    cardsError,
    createError
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (cardsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading cards: {cardsError.message}</p>
        <button 
          onClick={() => refetchCards()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">Manage your virtual cards for secure payments</p>
          {cards && (
            <p className="text-sm text-gray-500 mt-1">
              {cards.length} card{cards.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetchCards()}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Virtual Card
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {cards && cards.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {cards.map((card, index) => (
            <VirtualCardIcon
              key={card.cardId.toString()}
              card={card}
              index={index}
              onEdit={setEditingCard}
              onDeactivate={handleDeactivateCard}
              onToggleVisibility={toggleCardNumberVisibility}
              showCardNumber={showCardNumbers[index] || false}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Virtual Cards Yet</h3>
            <p className="text-gray-500 mb-6">Create your first virtual card to start making secure payments</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
            >
              Create Virtual Card
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateVirtualCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCard={handleCreateCard}
      />

      {editingCard !== null && (
        <EditVirtualCardModal
          isOpen={editingCard !== null}
          onClose={() => setEditingCard(null)}
          onUpdateCard={(data: { cardName: string; spendingLimit: number }) => handleUpdateCard(editingCard, data)}
          card={cards?.[editingCard]}
        />
      )}
    </div>
  );
};
