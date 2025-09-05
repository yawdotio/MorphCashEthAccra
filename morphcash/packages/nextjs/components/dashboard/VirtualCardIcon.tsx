"use client";

import { useState } from "react";
import { CreditCardIcon, XMarkIcon, EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { VirtualCard } from "~~/hooks/scaffold-eth/useVirtualCards";

interface VirtualCardIconProps {
  card: VirtualCard;
  index: number;
  onEdit: (index: number) => void;
  onDeactivate: (index: number) => void;
  onToggleVisibility: (index: number) => void;
  showCardNumber: boolean;
}

export const VirtualCardIcon = ({ 
  card, 
  index, 
  onEdit, 
  onDeactivate, 
  onToggleVisibility, 
  showCardNumber 
}: VirtualCardIconProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getCardTypeColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return 'from-blue-600 to-blue-800';
      case 'mastercard':
        return 'from-red-600 to-yellow-500';
      case 'american express':
        return 'from-green-600 to-blue-600';
      case 'discover':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-purple-600 to-blue-600';
    }
  };

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return 'V';
      case 'mastercard':
        return 'M';
      case 'american express':
        return 'A';
      case 'discover':
        return 'D';
      default:
        return 'C';
    }
  };

  return (
    <>
      {/* Card Icon */}
      <div 
        className={`relative w-32 h-20 rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
          card.isActive 
            ? `bg-gradient-to-br ${getCardTypeColor(card.cardType)}` 
            : 'bg-gradient-to-br from-gray-400 to-gray-600'
        }`}
        onClick={() => setShowDetails(true)}
      >
        {/* Card Content */}
        <div className="p-3 h-full flex flex-col justify-between text-white">
          {/* Card Type Badge */}
          <div className="flex justify-between items-start">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">{getCardTypeIcon(card.cardType)}</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${card.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
          
          {/* Card Number */}
          <div className="text-right">
            <p className="text-xs opacity-80">Card Number</p>
            <p className="text-sm font-mono font-bold">
              {showCardNumber ? card.cardNumber : '**** **** **** ' + card.cardNumber.slice(-4)}
            </p>
          </div>
          
          {/* Card Name */}
          <div className="text-xs opacity-90 truncate">
            {card.cardName}
          </div>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-xl transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            <CreditCardIcon className="h-6 w-6 text-white/80" />
          </div>
        </div>
      </div>

      {/* Card Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowDetails(false)}
            />
            
            <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
              {/* Close Button */}
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setShowDetails(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                  <CreditCardIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {card.cardName}
                  </h3>
                  
                  {/* Card Preview */}
                  <div className={`w-full h-24 rounded-xl shadow-lg mb-6 bg-gradient-to-br ${getCardTypeColor(card.cardType)}`}>
                    <div className="p-4 h-full flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{getCardTypeIcon(card.cardType)}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${card.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-80">Card Number</p>
                        <p className="text-sm font-mono font-bold">
                          {showCardNumber ? card.cardNumber : '**** **** **** ' + card.cardNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{card.cardType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expires:</span>
                      <span className="font-medium">{card.expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${card.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {card.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Spending Limit:</span>
                      <span className="font-medium">₵{Number(card.spendingLimit) / 100}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Spend:</span>
                      <span className="font-medium">₵{Number(card.currentSpend) / 100}</span>
                    </div>
                  </div>

                  {/* Spending Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Spending Progress</span>
                      <span className="font-medium">
                        ₵{Number(card.currentSpend) / 100} / ₵{Number(card.spendingLimit) / 100}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((Number(card.currentSpend) / Number(card.spendingLimit)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => onToggleVisibility(index)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      {showCardNumber ? (
                        <>
                          <EyeSlashIcon className="h-4 w-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Show
                        </>
                      )}
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          onEdit(index);
                          setShowDetails(false);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => {
                          onDeactivate(index);
                          setShowDetails(false);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
