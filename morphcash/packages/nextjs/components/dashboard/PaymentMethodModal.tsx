"use client";

import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  DevicePhoneMobileIcon, 
  CurrencyDollarIcon,
  ArrowPathIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { paymentService, SupportedCurrency } from "~~/services/paymentService";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentMethod: (method: 'mobile_money' | 'mtn_mobile_money' | 'mtn_api' | 'crypto', currency: SupportedCurrency) => void;
  fundingAmount: number;
  feeAmount: number;
  totalAmount: number;
}

interface ExchangeRate {
  ghsToEth: number;
  ethToGhs: number;
  usdToEth: number;
  ethToUsd: number;
  lastUpdated: string;
}

export const PaymentMethodModal = ({
  isOpen,
  onClose,
  onSelectPaymentMethod,
  fundingAmount,
  feeAmount,
  totalAmount
}: PaymentMethodModalProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('GHS');
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [ethAmount, setEthAmount] = useState<number>(0);

  // Fetch real-time exchange rate
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const rate = await paymentService.getExchangeRate();
      setExchangeRate(rate);
      
      // Calculate ETH amount for the selected currency
      const calculatedEthAmount = await paymentService.convertToEth(totalAmount, selectedCurrency);
      setEthAmount(calculatedEthAmount);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Fallback rates
      const fallbackRate = {
        ghsToEth: 0.000025,
        ethToGhs: 40000,
        usdToEth: 0.00023,
        ethToUsd: 4300,
        lastUpdated: new Date().toISOString()
      };
      setExchangeRate(fallbackRate);
      
      const calculatedEthAmount = selectedCurrency === 'GHS' 
        ? totalAmount * fallbackRate.ghsToEth 
        : totalAmount * fallbackRate.usdToEth;
      setEthAmount(calculatedEthAmount);
    } finally {
      setIsLoadingRate(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExchangeRate();
    }
  }, [isOpen, totalAmount, selectedCurrency]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Payment Method</h2>
          <p className="text-gray-600">Select how you'd like to fund your virtual card</p>
        </div>

        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Currency
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedCurrency('GHS')}
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedCurrency === 'GHS'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <GlobeAltIcon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">GHS</div>
                  <div className="text-xs text-gray-500">Ghanaian Cedi</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedCurrency === 'USD'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">USD</div>
                  <div className="text-xs text-gray-500">US Dollar</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Funding Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Funding Amount:</span>
            <span className="font-semibold">{paymentService.formatCurrency(fundingAmount, selectedCurrency)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Platform Fee (0.02%):</span>
            <span className="font-semibold">{paymentService.formatCurrency(feeAmount, selectedCurrency)}</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="text-gray-900 font-semibold">Total Amount:</span>
            <span className="text-lg font-bold text-purple-600">{paymentService.formatCurrency(totalAmount, selectedCurrency)}</span>
          </div>
        </div>

        {/* Exchange Rate Info */}
        {exchangeRate && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-800">Current Exchange Rate:</span>
              <button
                onClick={fetchExchangeRate}
                disabled={isLoadingRate}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoadingRate ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="text-sm text-blue-700">
              {selectedCurrency === 'GHS' ? (
                <>
                  <p>1 ETH = GHS {exchangeRate.ethToGhs.toFixed(2)}</p>
                  <p>1 GHS = ETH {exchangeRate.ghsToEth.toFixed(8)}</p>
                </>
              ) : (
                <>
                  <p>1 ETH = ${exchangeRate.ethToUsd.toFixed(2)}</p>
                  <p>1 USD = ETH {exchangeRate.usdToEth.toFixed(8)}</p>
                </>
              )}
              <p className="text-xs text-blue-600 mt-1">
                Last updated: {new Date(exchangeRate.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="space-y-4">
          {/* MTN Mobile Money API Option (Recommended) */}
          <button
            onClick={() => onSelectPaymentMethod('mtn_api', selectedCurrency)}
            className="w-full p-4 border-2 border-yellow-300 bg-yellow-50 rounded-xl hover:border-yellow-400 hover:bg-yellow-100 transition-all duration-200 group relative"
          >
            <div className="absolute top-2 right-2">
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Recommended
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center group-hover:bg-yellow-300 transition-colors">
                <DevicePhoneMobileIcon className="h-6 w-6 text-yellow-700" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">MTN Mobile Money (Direct)</h3>
                <p className="text-sm text-gray-600">Direct API integration with real-time verification</p>
                <p className="text-sm text-gray-500">Enter phone number, get instant payment request</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{paymentService.formatCurrency(totalAmount, selectedCurrency)}</p>
                <p className="text-xs text-gray-500">Total amount</p>
              </div>
            </div>
          </button>

          {/* MTN Mobile Money Widget Option */}
          <button
            onClick={() => onSelectPaymentMethod('mtn_mobile_money', selectedCurrency)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <DevicePhoneMobileIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">MTN Mobile Money (Widget)</h3>
                <p className="text-sm text-gray-600">Pay with MTN Mobile Money widget</p>
                <p className="text-sm text-gray-500">Redirect to MTN system for payment</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{paymentService.formatCurrency(totalAmount, selectedCurrency)}</p>
                <p className="text-xs text-gray-500">Total amount</p>
              </div>
            </div>
          </button>

          {/* Mobile Money Option */}
          <button
            onClick={() => onSelectPaymentMethod('mobile_money', selectedCurrency)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">Mobile Money</h3>
                <p className="text-sm text-gray-600">
                  {selectedCurrency === 'GHS' 
                    ? 'Pay with Vodafone or AirtelTigo' 
                    : 'Pay with international mobile money'
                  }
                </p>
                <p className="text-sm text-gray-500">Instant payment processing</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{paymentService.formatCurrency(totalAmount, selectedCurrency)}</p>
                <p className="text-xs text-gray-500">Total amount</p>
              </div>
            </div>
          </button>

          {/* Crypto Option */}
          <button
            onClick={() => onSelectPaymentMethod('crypto', selectedCurrency)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">Ethereum (ETH)</h3>
                <p className="text-sm text-gray-600">Pay with cryptocurrency</p>
                <p className="text-sm text-gray-500">Decentralized payment</p>
              </div>
              <div className="text-right">
                {isLoadingRate ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">ETH {ethAmount.toFixed(6)}</p>
                    <p className="text-xs text-gray-500">≈ {paymentService.formatCurrency(totalAmount, selectedCurrency)}</p>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Payments are processed securely and your virtual card will be created automatically upon successful payment.
          </p>
        </div>
      </div>
    </div>
  );
};
