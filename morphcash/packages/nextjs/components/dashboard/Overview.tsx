"use client";

import { useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  BanknotesIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ProtectedRoute } from "~~/components/auth/ProtectedRoute";
import { useAuth } from "~~/contexts/AuthContext";
import { useVirtualCards } from "~~/hooks/scaffold-eth/useVirtualCards";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";

const OverviewContent = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { user } = useAuth();
  const { address } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useWatchBalance({ address });
  const { cards, isLoading: isCardsLoading } = useVirtualCards();

  // Get user display name and initial
  const displayName = user?.displayName || user?.ensProfile?.displayName || user?.ensName || user?.email || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const accountType = user?.accountType || "basic";

  // Format balance
  const formattedBalance = balance ? Number(formatEther(balance.value)) : 0;
  const balanceText = balanceVisible ? `₵ ${formattedBalance.toFixed(2)}` : "• • • •";
  const availableText = balanceVisible ? `Available: ₵ ${formattedBalance.toFixed(2)}` : "Available: • • •";

  // Get active cards count
  const activeCardsCount = cards?.filter(card => card.isActive).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-base-content">Overview</h1>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-primary-content font-bold text-sm">{userInitial}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-base-content">{displayName}</p>
            <p className="text-xs text-base-content/70 capitalize">{accountType} Package</p>
          </div>
        </div>
      </div>

      {/* KYC Warning */}
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 text-warning mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-warning-content mb-2">Complete KYC Verification</h3>
            <p className="text-sm text-warning-content/80 mb-4">
              Verify your identity to unlock all features and increase your transaction limits.
            </p>
            <button className="bg-warning text-warning-content px-4 py-2 rounded-lg text-sm font-medium hover:bg-warning/90 transition-colors duration-200">
              Start Verification
            </button>
          </div>
          <div className="text-sm text-warning font-medium">Not Verified</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Total Balance */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-primary-content relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-content/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Total Balance</h3>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 hover:bg-primary-content/10 rounded-lg transition-colors duration-200"
              >
                {balanceVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <div className="text-3xl font-bold mb-2">
              {isBalanceLoading ? (
                <div className="animate-pulse bg-primary-content/20 h-8 w-24 rounded"></div>
              ) : (
                balanceText
              )}
            </div>
            <p className="text-primary-content/80 text-sm">
              {isBalanceLoading ? (
                <div className="animate-pulse bg-primary-content/20 h-4 w-32 rounded"></div>
              ) : (
                availableText
              )}
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-base-content">Pending</h3>
            <div className="p-2 bg-base-200 rounded-lg">
              <DocumentArrowDownIcon className="h-5 w-5 text-base-content/70" />
            </div>
          </div>
          <div className="text-3xl font-bold text-base-content mb-2">₵ 0.00</div>
          <p className="text-base-content/70 text-sm">Processing transactions</p>
        </div>

        {/* Active Cards */}
        <div className="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-base-content">Active Cards</h3>
            <div className="p-2 bg-base-200 rounded-lg">
              <CreditCardIcon className="h-5 w-5 text-base-content/70" />
            </div>
          </div>
          <div className="text-3xl font-bold text-base-content mb-2">
            {isCardsLoading ? <div className="animate-pulse bg-base-300 h-8 w-12 rounded"></div> : activeCardsCount}
          </div>
          <p className="text-base-content/70 text-sm">Virtual cards in use</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-base-content mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <button className="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-200">
              <PlusIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-base-content mb-1">Add Funds</h3>
          </button>

          <button className="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group text-center">
            <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-info/20 transition-colors duration-200">
              <PaperAirplaneIcon className="h-6 w-6 text-info" />
            </div>
            <h3 className="font-medium text-base-content mb-1">Send Money</h3>
          </button>

          <Link
            href="/dashboard/cards"
            className="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group text-center block"
          >
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 transition-colors duration-200">
              <CreditCardIcon className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-medium text-base-content mb-1">New Card</h3>
          </Link>

          <button className="bg-base-100 rounded-2xl p-6 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-warning/20 transition-colors duration-200">
              <DocumentArrowDownIcon className="h-6 w-6 text-warning" />
            </div>
            <h3 className="font-medium text-base-content mb-1">Statement</h3>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-base-content">Recent Transactions</h2>
          <Link href="/dashboard/transactions" className="text-primary hover:text-primary/80 font-medium text-sm">
            View All
          </Link>
        </div>
        <div className="bg-base-100 rounded-2xl border border-base-300 p-6">
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-base-200 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BanknotesIcon className="h-6 w-6 text-base-content/50" />
            </div>
            <p className="text-base-content/70">No transactions yet</p>
            <p className="text-sm text-base-content/50 mt-1">Your transaction history will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Overview = () => {
  return (
    <ProtectedRoute>
      <OverviewContent />
    </ProtectedRoute>
  );
};
