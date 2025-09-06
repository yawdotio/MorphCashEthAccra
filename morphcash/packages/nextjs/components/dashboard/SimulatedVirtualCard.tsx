"use client";

import { useState } from "react";
import { 
  CreditCardIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PlusIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

interface SimulatedVirtualCardProps {
  card: {
    id: string;
    cardId: number;
    cardName: string;
    cardNumberMasked: string;
    expiryDate: string;
    cardType: string;
    balance: number;
    currentSpend: number;
    spendingLimit: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
  };
  onFundCard: (cardId: number) => void;
  onViewTransactions: (cardId: number) => void;
}

export const SimulatedVirtualCard = ({ 
  card, 
  onFundCard, 
  onViewTransactions 
}: SimulatedVirtualCardProps) => {
  const [showBalance, setShowBalance] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'GHS' ? 'GHS' : 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getBalanceColor = () => {
    const balancePercentage = (card.balance / card.spendingLimit) * 100;
    if (balancePercentage > 50) return 'text-green-600';
    if (balancePercentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCardGradient = () => {
    switch (card.cardType.toLowerCase()) {
      case 'visa':
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'mastercard':
        return 'bg-gradient-to-br from-red-600 to-red-800';
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Card Visual */}
      <div className={`${getCardGradient()} p-6 text-white relative`}>
        {/* Card Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${card.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm font-medium">
              {card.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">Balance</div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold ${showBalance ? '' : 'blur-sm'}`}>
                {formatCurrency(card.balance, card.currency)}
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 hover:bg-white/20 rounded"
              >
                {showBalance ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Card Number */}
        <div className="mb-6">
          <div className="text-lg font-mono tracking-wider">
            {card.cardNumberMasked}
          </div>
        </div>

        {/* Card Details */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs opacity-75 uppercase">Cardholder Name</div>
            <div className="font-semibold truncate max-w-32">{card.cardName}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">Expires</div>
            <div className="font-semibold">{card.expiryDate}</div>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCardIcon className="w-8 h-8" />
            <span className="text-sm font-medium">{card.cardType}</span>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-6">
        {/* Balance and Limits */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Available Balance</div>
            <div className={`text-xl font-bold ${getBalanceColor()}`}>
              {formatCurrency(card.balance, card.currency)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Spending Limit</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(card.spendingLimit, card.currency)}
            </div>
          </div>
        </div>

        {/* Spending Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Spent this period</span>
            <span>{formatCurrency(card.currentSpend, card.currency)} / {formatCurrency(card.spendingLimit, card.currency)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((card.currentSpend / card.spendingLimit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onFundCard(card.cardId)}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Funds</span>
          </button>
          <button
            onClick={() => onViewTransactions(card.cardId)}
            className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            <ClockIcon className="w-5 h-5" />
            <span>Transactions</span>
          </button>
        </div>

        {/* Recent Activity Indicator */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Last activity: {new Date(card.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-gray-500">
              ID: {card.cardId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
