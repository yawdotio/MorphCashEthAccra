"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, CreditCardIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { calculateFundingFee, validateFundingAmount } from "~~/utils/feeCalculation";
import { PaymentMethodModal } from "./PaymentMethodModal";
import { MTNMobileMoneyPaymentModal } from "./MTNMobileMoneyPaymentModal";
import { EnhancedMTNPaymentModal } from "./EnhancedMTNPaymentModal";
import { CryptoPaymentModal } from "./CryptoPaymentModal";

interface EnhancedCreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: (cardData: any) => void;
}

export const EnhancedCreateCardModal = ({ 
  isOpen, 
  onClose, 
  onCardCreated 
}: EnhancedCreateCardModalProps) => {
  const [formData, setFormData] = useState({
    cardName: "",
    spendingLimit: 1000,
    fundingAmount: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feeCalculation, setFeeCalculation] = useState(calculateFundingFee(100));
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCard, setCreatedCard] = useState<any>(null);
  
  // Payment workflow states
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [showMobileMoney, setShowMobileMoney] = useState(false);
  const [showMTNMobileMoney, setShowMTNMobileMoney] = useState(false);
  const [showEnhancedMTN, setShowEnhancedMTN] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'GHS' | 'USD'>('GHS');

  // Update fee calculation when funding amount changes
  useEffect(() => {
    const validation = validateFundingAmount(formData.fundingAmount);
    if (validation.isValid) {
      setValidationError(null);
      setFeeCalculation(calculateFundingFee(formData.fundingAmount));
    } else {
      setValidationError(validation.error || null);
    }
  }, [formData.fundingAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate funding amount before submitting
    const validation = validateFundingAmount(formData.fundingAmount);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      return;
    }

    if (!formData.cardName.trim()) {
      setValidationError('Card name is required');
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
      console.log('Payment successful, creating card:', paymentData);
      
      // Call the verified card creation API
      const response = await fetch('/api/cards/create-verified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentReference: paymentData.referenceId || paymentData.reference || paymentData.transactionId,
          cardName: formData.cardName,
          spendingLimit: formData.spendingLimit,
          userAddress: paymentData.userAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' // Demo address
        })
      });

      const result = await response.json();

      if (result.success) {
        setCreatedCard(result.cardData);
        setShowSuccess(true);
        
        // Close payment modals
        setShowMobileMoney(false);
        setShowMTNMobileMoney(false);
        setShowEnhancedMTN(false);
        setShowCryptoPayment(false);

        // Notify parent component
        setTimeout(() => {
          onCardCreated(result.cardData);
          handleClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to create card');
      }
    } catch (error) {
      console.error("Error creating card:", error);
      setValidationError(error instanceof Error ? error.message : 'Failed to create card');
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
    setCreatedCard(null);
    setValidationError(null);
    setFormData({
      cardName: "",
      spendingLimit: 1000,
      fundingAmount: 100,
    });
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
                  Card Created Successfully!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your virtual card has been created and funded with{' '}
                  {feeCalculation.originalAmount} {selectedCurrency}.
                </p>
                
                {createdCard && (
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white mb-4">
                    <div className="text-left">
                      <div className="text-sm opacity-75 mb-2">Card Name</div>
                      <div className="font-semibold text-lg mb-3">{createdCard.cardName}</div>
                      <div className="text-sm opacity-75 mb-1">Card Number</div>
                      <div className="font-mono text-lg mb-3">{createdCard.cardNumberMasked}</div>
                      <div className="flex justify-between text-sm">
                        <div>
                          <div className="opacity-75">Balance</div>
                          <div className="font-semibold">{createdCard.balance} {createdCard.currency}</div>
                        </div>
                        <div>
                          <div className="opacity-75">Expires</div>
                          <div className="font-semibold">{createdCard.expiryDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Your card will be available in your dashboard shortly...
                </p>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CreditCardIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create Virtual Card
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Create a new virtual card for secure online payments. Fund it immediately with mobile money or crypto.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Card Name */}
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      Card Name
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Shopping Card, Travel Card"
                      required
                    />
                  </div>

                  {/* Spending Limit */}
                  <div>
                    <label htmlFor="spendingLimit" className="block text-sm font-medium text-gray-700">
                      Monthly Spending Limit
                    </label>
                    <input
                      type="number"
                      id="spendingLimit"
                      value={formData.spendingLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, spendingLimit: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="100"
                      max="10000"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum amount you can spend with this card per month
                    </p>
                  </div>

                  {/* Initial Funding */}
                  <div>
                    <label htmlFor="fundingAmount" className="block text-sm font-medium text-gray-700">
                      Initial Funding Amount
                    </label>
                    <input
                      type="number"
                      id="fundingAmount"
                      value={formData.fundingAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, fundingAmount: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="10"
                      max="5000"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Amount to add to your card balance initially
                    </p>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
                      <div className="text-sm">
                        <div className="font-medium text-blue-900 mb-2">Payment Summary</div>
                        <div className="space-y-1 text-blue-800">
                          <div className="flex justify-between">
                            <span>Funding Amount:</span>
                            <span>{feeCalculation.originalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee (0.02%):</span>
                            <span>{feeCalculation.feeAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
                            <span>Total to Pay:</span>
                            <span>{feeCalculation.totalAmount.toFixed(2)}</span>
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
                      className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !!validationError}
                      className="flex-1 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating...' : 'Continue to Payment'}
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

      {/* Mobile Money Payment Modal */}
      <MobileMoneyPaymentModal
        isOpen={showMobileMoney}
        onClose={() => setShowMobileMoney(false)}
        onPaymentSuccess={handlePaymentSuccess}
        fundingAmount={feeCalculation.originalAmount}
        feeAmount={feeCalculation.feeAmount}
        totalAmount={feeCalculation.totalAmount}
        currency={selectedCurrency}
      />

      {/* MTN Mobile Money Payment Modal (Widget) */}
      <MTNMobileMoneyPaymentModal
        isOpen={showMTNMobileMoney}
        onClose={() => setShowMTNMobileMoney(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={feeCalculation.totalAmount}
        currency={selectedCurrency}
        externalId={`CARD-${Date.now()}-${feeCalculation.totalAmount}`}
      />

      {/* Enhanced MTN Payment Modal (API) */}
      <EnhancedMTNPaymentModal
        isOpen={showEnhancedMTN}
        onClose={() => setShowEnhancedMTN(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={feeCalculation.totalAmount}
        currency={selectedCurrency}
        externalId={`CARD-${Date.now()}-${feeCalculation.totalAmount}`}
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
