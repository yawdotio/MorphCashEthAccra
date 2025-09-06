"use client";

import { useState } from "react";
import { useVirtualCards } from "~~/hooks/scaffold-eth/useVirtualCards";
import { usePaymentEvents } from "~~/hooks/scaffold-eth/usePaymentEvents";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { useEnhancedAuth } from "~~/contexts/EnhancedAuthContext";
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
  const { user } = useEnhancedAuth();
  const { cards, isLoading, refetchCards, cardsError } = useVirtualCards();
  const { isProcessing: isProcessingPayment } = usePaymentEvents();
  const { writeContractAsync: fundCard } = useScaffoldWriteContract("PaymentContract");
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
      console.log("User:", user);
      console.log("Address:", address);
      console.log("Auth method:", user?.auth_method);
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      if (address && user.auth_method === 'wallet') {
        // For wallet users, use PaymentContract to fund card
        console.log("Funding card via PaymentContract...");
        
        if (!fundCard) {
          throw new Error("PaymentContract not available. Please check if the contract is deployed and connected.");
        }
        
        // Generate payment reference
        const paymentReference = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Convert funding amount to wei (assuming it's in ETH)
        const fundingAmountWei = BigInt(Math.floor(cardData.fundingAmount * 1e18));
        
        const result = await fundCard({
          functionName: "createPayment",
          args: [
            fundingAmountWei, // amount in wei
            BigInt(Math.floor(cardData.fundingAmount)), // ghsAmount (for reference)
            "crypto", // paymentMethod
            paymentReference
          ] as const,
        });
        
        console.log("Card funding result:", result);
        
        if (result) {
          console.log("Card funding initiated successfully. Card will be created automatically when payment is processed.");
          setShowCreateModal(false);
          // The usePaymentEvents hook will automatically create the card when the event is emitted
        }
      } else {
        // For email/ENS users, use API route
        console.log("Creating card via API for email/ENS user...");
        
        const sessionData = localStorage.getItem("morphcash_session");
        if (!sessionData) {
          throw new Error("No active session found");
        }
        
        const session = JSON.parse(sessionData);
        
        const response = await fetch('/api/cards/create-for-email-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            cardName: cardData.cardName,
            cardNumber: cardData.cardNumber,
            cardType: cardData.cardType,
            spendingLimit: cardData.spendingLimit,
            token: session.token
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to create card');
        }
        
        console.log("Card creation result:", result);
        
        if (result.success) {
          console.log("Card created successfully, refetching cards...");
          await refetchCards();
          setShowCreateModal(false);
        }
      }
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
      // TODO: Implement database-based card update
      console.log("Card update functionality needs to be implemented for database cards");
      setEditingCard(null);
      refetchCards();
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const handleDeactivateCard = async (cardIndex: number) => {
    try {
      // TODO: Implement database-based card deactivation
      console.log("Card deactivation functionality needs to be implemented for database cards");
      refetchCards();
    } catch (error) {
      console.error("Error deactivating card:", error);
    }
  };

  // Debug logging
  console.log("VirtualCardsManager Debug:", {
    address,
    user,
    cards,
    isLoading,
    cardsError,
    isProcessingPayment
  });

  // Show connection prompt if not authenticated
  // Only show this if we're definitely not authenticated (not just loading)
  if (!isLoading && !user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700 mb-4">Please sign in with your email, wallet, or ENS to view and manage virtual cards.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // If we're still loading authentication state, show loading
  if (!isLoading && user === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  if (isLoading || isProcessingPayment) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">
          {isProcessingPayment ? "Processing payment and creating card..." : "Loading your virtual cards..."}
        </span>
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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your First Virtual Card</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get started with secure virtual payments. Create your first virtual card to begin making transactions with enhanced security.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 inline mr-2" />
              Create Your First Card
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
