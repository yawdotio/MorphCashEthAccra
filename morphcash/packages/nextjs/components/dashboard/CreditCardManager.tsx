"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { secureStorage, CreditCardData } from "~~/services/store/store";
import { 
  PlusIcon, 
  CreditCardIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { AddCreditCardModal } from "./AddCreditCardModal";

export const CreditCardManager = () => {
  const { address } = useAccount();
  const [cards, setCards] = useState<CreditCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCardNumbers, setShowCardNumbers] = useState<{ [key: string]: boolean }>({});

  const loadCards = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const userCards = await secureStorage.getCreditCards(address);
      setCards(userCards);
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (cardData: Omit<CreditCardData, 'id' | 'createdAt'>) => {
    if (!address) return;
    
    try {
      await secureStorage.storeCreditCard(address, cardData);
      await loadCards();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    if (!address) return;
    
    try {
      await secureStorage.removeCreditCard(address, cardId);
      await loadCards();
    } catch (error) {
      console.error("Error removing card:", error);
    }
  };

  const toggleCardNumberVisibility = (cardId: string) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  useEffect(() => {
    loadCards();
  }, [address]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Credit Cards</h3>
          <p className="text-sm text-gray-600">Securely stored and encrypted payment methods</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Card
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Secure Storage</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your credit card information is encrypted using your wallet signature and stored securely. 
              Only you can decrypt and access this data.
            </p>
          </div>
        </div>
      </div>

      {/* Cards List */}
      {cards.length > 0 ? (
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center">
                    <CreditCardIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{card.cardholderName}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {showCardNumbers[card.id] ? card.cardNumber : `**** **** **** ${card.last4}`}
                      </span>
                      <button
                        onClick={() => toggleCardNumberVisibility(card.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showCardNumbers[card.id] ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{card.brand}</p>
                    <p className="text-sm text-gray-500">
                      {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {card.isDefault && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Default Card
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Cards</h3>
          <p className="text-gray-500 mb-6">Add your first credit card to start making payments</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Credit Card
          </button>
        </div>
      )}

      {/* Add Card Modal */}
      <AddCreditCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddCard={handleAddCard}
      />
    </div>
  );
};
