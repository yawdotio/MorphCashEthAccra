"use client";

import { useState } from "react";
import { 
  XMarkIcon, 
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { paymentService, SupportedCurrency } from "~~/services/paymentService";

interface MobileMoneyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  fundingAmount: number;
  feeAmount: number;
  totalAmount: number;
  currency: SupportedCurrency;
}

type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed';

export const MobileMoneyPaymentModal = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  fundingAmount,
  feeAmount,
  totalAmount,
  currency
}: MobileMoneyPaymentModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [paymentReference, setPaymentReference] = useState('');

  const generatePaymentReference = () => {
    return 'MM' + Date.now().toString().slice(-8);
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }

    setPaymentStatus('processing');
    const reference = generatePaymentReference();
    setPaymentReference(reference);

    // Simulate payment processing
    // In a real implementation, this would integrate with a mobile money API
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate payment success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setPaymentStatus('success');
        // Call success callback after a short delay
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
    }
  };

  const handleClose = () => {
    if (paymentStatus === 'processing') return; // Prevent closing during processing
    setPaymentStatus('pending');
    setPhoneNumber('');
    setPaymentReference('');
    onClose();
  };

  if (!isOpen) return null;

  const providerNames = {
    mtn: 'MTN Mobile Money',
    vodafone: 'Vodafone Cash',
    airteltigo: 'AirtelTigo Money'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        {paymentStatus !== 'processing' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <DevicePhoneMobileIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mobile Money Payment</h2>
          <p className="text-gray-600">Complete your payment using mobile money</p>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Funding Amount:</span>
            <span className="font-semibold">{paymentService.formatCurrency(fundingAmount, currency)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Platform Fee (0.02%):</span>
            <span className="font-semibold">{paymentService.formatCurrency(feeAmount, currency)}</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="text-gray-900 font-semibold">Total Amount:</span>
            <span className="text-lg font-bold text-green-600">{paymentService.formatCurrency(totalAmount, currency)}</span>
          </div>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'pending' && (
          <div className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Mobile Money Provider
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(providerNames).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedProvider(key as any)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedProvider === key
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xs font-medium">{name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0241234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your {providerNames[selectedProvider]} registered number
              </p>
            </div>

            {/* Payment Button */}
            <button
              onClick={handleInitiatePayment}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Pay {paymentService.formatCurrency(totalAmount, currency)} with {providerNames[selectedProvider]}
            </button>
          </div>
        )}

        {/* Processing State */}
        {paymentStatus === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600 mb-4">
              Please check your phone for a payment prompt from {providerNames[selectedProvider]}
            </p>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Reference:</strong> {paymentReference}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Amount: {paymentService.formatCurrency(totalAmount, currency)}
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {paymentStatus === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your virtual card is being created...
            </p>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong>Reference:</strong> {paymentReference}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Amount: {paymentService.formatCurrency(totalAmount, currency)}
              </p>
            </div>
          </div>
        )}

        {/* Failed State */}
        {paymentStatus === 'failed' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">
              There was an issue processing your payment. Please try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentStatus('pending')}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {paymentStatus === 'pending' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You will receive a payment prompt on your phone. Complete the payment to create your virtual card.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
