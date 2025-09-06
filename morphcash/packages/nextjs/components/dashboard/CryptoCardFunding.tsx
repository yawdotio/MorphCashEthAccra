"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { 
  CreditCardIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface CryptoCardFundingProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Component for funding virtual cards with crypto payments
 * Uses the new PaymentContract.fundCard function
 */
export const CryptoCardFunding = ({ onSuccess, onError }: CryptoCardFundingProps) => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ghsAmount: 100,
    cardType: "Visa",
    paymentReference: "",
  });

  // Initialize the write contract hook for PaymentContract
  const { writeContractAsync: fundCardAsync } = useScaffoldWriteContract({
    contractName: "PaymentContract",
  });

  const handleFunding = async () => {
    if (!address) {
      onError?.("Please connect your wallet");
      return;
    }

    if (!formData.paymentReference) {
      onError?.("Please enter a payment reference");
      return;
    }

    setIsLoading(true);

    try {
      // Convert GHS amount to ETH (this is a simplified conversion)
      // In production, you'd use a real exchange rate API
      const ethAmount = formData.ghsAmount / 1000; // Simplified: 1 ETH = 1000 GHS
      
      console.log("Funding card with:", {
        ghsAmount: formData.ghsAmount,
        cardType: formData.cardType,
        paymentReference: formData.paymentReference,
        ethAmount: ethAmount,
      });

      // Call the fundCard function on the PaymentContract
      const result = await fundCardAsync({
        functionName: "fundCard",
        args: [
          BigInt(formData.ghsAmount * 100), // Convert to cents
          formData.cardType,
          formData.paymentReference,
        ],
        value: parseEther(ethAmount.toString()),
      });

      console.log("Card funding transaction sent:", result);
      
      // The CardFundingListener component will automatically handle the success event
      // and create the card in Supabase
      onSuccess?.();
      
    } catch (error: any) {
      console.error("Error funding card:", error);
      onError?.(error.message || "Failed to fund card");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePaymentReference = () => {
    const ref = `MORPH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setFormData(prev => ({ ...prev, paymentReference: ref }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <CreditCardIcon className="h-8 w-8 text-purple-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Fund Virtual Card with Crypto</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (GHS)
          </label>
          <div className="relative">
            <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={formData.ghsAmount}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                ghsAmount: parseFloat(e.target.value) || 0 
              }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter amount in GHS"
              min="1"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Type
          </label>
          <select
            value={formData.cardType}
            onChange={(e) => setFormData(prev => ({ ...prev, cardType: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="MorphCard">MorphCard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Reference
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.paymentReference}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter payment reference"
            />
            <button
              type="button"
              onClick={generatePaymentReference}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">How it works:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Send ETH to fund your virtual card</li>
                <li>• The smart contract will emit a success event</li>
                <li>• Your virtual card will be automatically created in Supabase</li>
                <li>• You can use the card for online payments</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleFunding}
          disabled={isLoading || !formData.paymentReference}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Fund Card with Crypto
            </>
          )}
        </button>
      </div>
    </div>
  );
};
