"use client";

import { useState } from "react";
import { 
  ExclamationTriangleIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PlusIcon,
  PaperAirplaneIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

export const Overview = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">yaw123456</p>
            <p className="text-xs text-gray-500">Basic Package</p>
          </div>
        </div>
      </div>

      {/* KYC Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Complete KYC Verification</h3>
            <p className="text-sm text-yellow-700 mb-4">
              Verify your identity to unlock all features and increase your transaction limits.
            </p>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors duration-200">
              Start Verification
            </button>
          </div>
          <div className="text-sm text-yellow-600 font-medium">Not Verified</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Total Balance */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Total Balance</h3>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                {balanceVisible ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="text-3xl font-bold mb-2">
              {balanceVisible ? "₵ 0.00" : "• • • •"}
            </div>
            <p className="text-purple-100 text-sm">Available: ₵ 0.00</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Pending</h3>
            <div className="p-2 bg-gray-100 rounded-lg">
              <DocumentArrowDownIcon className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">₵ 0.00</div>
          <p className="text-gray-500 text-sm">Processing transactions</p>
        </div>

        {/* Active Cards */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Active Cards</h3>
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCardIcon className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">0</div>
          <p className="text-gray-500 text-sm">Virtual cards in use</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <button className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-200">
              <PlusIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Add Funds</h3>
          </button>

          <button className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-200">
              <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Send Money</h3>
          </button>

          <Link href="/dashboard/cards" className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group text-center block">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-200">
              <CreditCardIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">New Card</h3>
          </Link>

          <button className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors duration-200">
              <DocumentArrowDownIcon className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Statement</h3>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <Link href="/dashboard/transactions" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
            View All
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BanknotesIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">Your transaction history will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};
