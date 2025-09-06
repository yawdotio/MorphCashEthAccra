"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { calculateFundingFee, validateFundingAmount } from "~~/utils/feeCalculation";
import { PaymentMethodModal } from "./PaymentMethodModal";
import { MTNMobileMoneyPaymentModal } from "./MTNMobileMoneyPaymentModal";
import { EnhancedMTNPaymentModal } from "./EnhancedMTNPaymentModal";
import { CryptoPaymentModal } from "./CryptoPaymentModal";

interface FundCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFundingSuccess: (fundingData: any) => void;
  card: {
    id: string;
    cardId: number;
    cardName: string;
    cardNumberMasked: string;
    balance: number;
    currency: string;
  };
}

export const FundCardModal = ({ 
  isOpen, 
  onClose, 
  onFundingSuccess,
  card
}: FundCardModalProps) => {
  const [fundingAmount, setFundingAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feeCalculation, setFeeCalculation] = useState(calculateFundingFee(100));
  const [showSuccess, setShowSuccess] = useState(false);
  const [fundingResult, setFundingResult] = useState<any>(null);
  
  // Payment workflow states
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [showMobileMoney, setShowMobileMoney] = useState(false);
  const [showMTNMobileMoney, setShowMTNMobileMoney] = useState(false);
  const [showEnhancedMTN, setShowEnhancedMTN] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'GHS' | 'USD'>(card.currency as 'GHS' | 'USD');

  // Update fee calculation when funding amount changes
  useEffect(() => {
    const validation = validateFundingAmount(fundingAmount);
    if (validation.isValid) {
      setValidationError(null);
      setFeeCalculation(calculateFundingFee(fundingAmount));
    } else {
      setValidationError(validation.error || null);
    }
  }, [fundingAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate funding amount
    const validation = validateFundingAmount(fundingAmount);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      return;
    }

    // Show payment method selection
    setShowPaymentMethod(true);
  };

  const handlePaymentMethodSelect = (method: 'mobile_money' | 'mtn_mobile_money' | 'mtn_api' | 'crypto', currency: 'GHS' | 'USD') => {
    setSelectedCurrency(currency);
    setShowPaymentMethod(false);
    
    if (method === 'mobile_money') {
      setShowMobileMoney(true);
    } else if (method === 'mtn_mobile_money') {
      setShowMTNMobileMoney(true);
    } else if (method === 'mtn_api') {
      setShowEnhancedMTN(true);
    } else {
      setShowCryptoPayment(true);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    setIsSubmitting(true);
    
    try {
      console.log('Payment successful, funding card:', paymentData);
      
      // Call the card funding API
      const response = await fetch('/api/cards/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardId: card.cardId,
          paymentReference: paymentData.referenceId || paymentData.reference || paymentData.transactionId,
          userAddress: paymentData.userAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' // Demo address
        })
      });

      const result = await response.json();

      if (result.success) {
        setFundingResult({
          ...result,
          previousBalance: card.balance,
          paymentMethod: paymentData.method || 'unknown'
        });
        setShowSuccess(true);
        
        // Close payment modals
        setShowMobileMoney(false);
        setShowMTNMobileMoney(false);
        setShowEnhancedMTN(false);
        setShowCryptoPayment(false);

        // Notify parent component
        setTimeout(() => {
          onFundingSuccess({
            cardId: card.cardId,
            newBalance: result.newBalance,
            fundingAmount: result.fundingAmount,
            paymentReference: paymentData.referenceId || paymentData.reference
          });
          handleClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to fund card');
      }
    } catch (error) {
      console.error("Error funding card:", error);
      setValidationError(error instanceof Error ? error.message : 'Failed to fund card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    // Reset all states
    setShowPaymentMethod(false);
    setShowMobileMoney(false);
    setShowMTNMobileMoney(false);
    setShowEnhancedMTN(false);
    setShowCryptoPayment(false);
    setShowSuccess(false);
    setFundingResult(null);
    setValidationError(null);
    setFundingAmount(100);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {showSuccess ? (
            // Success State
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Card Funded Successfully!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your card has been funded with {fundingResult?.fundingAmount} {selectedCurrency}.
                </p>
                
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white mb-4">
                  <div className="text-left">
                    <div className="text-sm opacity-75 mb-2">Card</div>
                    <div className="font-semibold text-lg mb-3">{card.cardName}</div>
                    <div className="font-mono text-lg mb-3">{card.cardNumberMasked}</div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="opacity-75">Previous Balance</div>
                        <div className="font-semibold">{fundingResult?.previousBalance} {selectedCurrency}</div>
                      </div>
                      <div>
                        <div className="opacity-75">New Balance</div>
                        <div className="font-semibold text-green-300">{fundingResult?.newBalance} {selectedCurrency}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span>Funding Amount:</span>
                    <span className="font-semibold">+{fundingResult?.fundingAmount} {selectedCurrency}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span>Payment Method:</span>
                    <span className="text-blue-600 font-medium">{fundingResult?.paymentMethod?.toUpperCase()}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  Your updated balance is now available for use.
                </p>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <PlusIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add Funds to Card
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Add funds to your virtual card using mobile money or crypto.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Card</div>
                      <div className="font-semibold text-gray-900">{card.cardName}</div>
                      <div className="text-sm text-gray-500 font-mono">{card.cardNumberMasked}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Current Balance</div>
                      <div className="text-lg font-bold text-gray-900">{card.balance} {card.currency}</div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Funding Amount */}
                  <div>
                    <label htmlFor="fundingAmount" className="block text-sm font-medium text-gray-700">
                      Funding Amount ({card.currency})
                    </label>
                    <input
                      type="number"
                      id="fundingAmount"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      min="10"
                      max="5000"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Amount to add to your card balance
                    </p>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <InformationCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                      <div className="text-sm">
                        <div className="font-medium text-green-900 mb-2">Payment Summary</div>
                        <div className="space-y-1 text-green-800">
                          <div className="flex justify-between">
                            <span>Funding Amount:</span>
                            <span>{feeCalculation.originalAmount.toFixed(2)} {card.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee (0.02%):</span>
                            <span>{feeCalculation.feeAmount.toFixed(2)} {card.currency}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t border-green-200 pt-1">
                            <span>Total to Pay:</span>
                            <span>{feeCalculation.totalAmount.toFixed(2)} {card.currency}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <div className="flex justify-between font-semibold text-green-900">
                            <span>New Card Balance:</span>
                            <span>{(card.balance + feeCalculation.originalAmount).toFixed(2)} {card.currency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {validationError}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !!validationError}
                      className="flex-1 bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Method Selection Modal */}
      <PaymentMethodModal
        isOpen={showPaymentMethod}
        onClose={() => setShowPaymentMethod(false)}
        onSelectPaymentMethod={handlePaymentMethodSelect}
        fundingAmount={feeCalculation.originalAmount}
        feeAmount={feeCalculation.feeAmount}
        totalAmount={feeCalculation.totalAmount}
      />

      {/* MTN Mobile Money Payment Modal (Widget) */}
      <MTNMobileMoneyPaymentModal
        isOpen={showMTNMobileMoney}
        onClose={() => setShowMTNMobileMoney(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={feeCalculation.totalAmount}
        currency={selectedCurrency}
        externalId={`FUND-${card.cardId}-${Date.now()}-${feeCalculation.totalAmount}`}
      />

      {/* Enhanced MTN Payment Modal (API) */}
      <EnhancedMTNPaymentModal
        isOpen={showEnhancedMTN}
        onClose={() => setShowEnhancedMTN(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={feeCalculation.totalAmount}
        currency={selectedCurrency}
        externalId={`FUND-${card.cardId}-${Date.now()}-${feeCalculation.totalAmount}`}
      />

      {/* Crypto Payment Modal */}
      <CryptoPaymentModal
        isOpen={showCryptoPayment}
        onClose={() => setShowCryptoPayment(false)}
        onPaymentSuccess={handlePaymentSuccess}
        fundingAmount={feeCalculation.originalAmount}
        feeAmount={feeCalculation.feeAmount}
        totalAmount={feeCalculation.totalAmount}
        ethAmount={0} // Will be calculated in modal
        currency={selectedCurrency}
      />
    </div>
  );
};
