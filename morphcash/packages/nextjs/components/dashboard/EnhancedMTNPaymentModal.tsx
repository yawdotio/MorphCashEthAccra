"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { paymentService } from "~~/services/paymentService";

interface EnhancedMTNPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentData: any) => void;
  amount: number;
  currency: 'GHS' | 'USD';
  externalId: string;
}

type PaymentMethod = 'widget' | 'api';
type PaymentStatus = 'idle' | 'processing' | 'pending' | 'success' | 'failed';

export const EnhancedMTNPaymentModal = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  currency,
  externalId
}: EnhancedMTNPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('widget');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPayment, setCurrentPayment] = useState<any>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setPhoneNumber('');
      setReferenceId(null);
      setError(null);
      setCurrentPayment(null);
    }
  }, [isOpen]);

  // Poll payment status when we have a reference ID
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (referenceId && paymentStatus === 'pending') {
      interval = setInterval(async () => {
        try {
          const result = await paymentService.checkMTNPaymentStatus(referenceId);
          
          if (result.success) {
            if (result.status === 'SUCCESSFUL') {
              setPaymentStatus('success');
              setCurrentPayment(result);
              clearInterval(interval);
              
              // Call success callback after a short delay
              setTimeout(() => {
                onPaymentSuccess({
                  referenceId,
                  externalId,
                  amount: result.amount || amount,
                  currency: result.currency || currency,
                  financialTransactionId: result.financialTransactionId,
                  method: 'mtn_api'
                });
              }, 2000);
            } else if (result.status === 'FAILED') {
              setPaymentStatus('failed');
              setError('Payment failed or was rejected');
              clearInterval(interval);
            }
            // Continue polling for PENDING status
          } else {
            setPaymentStatus('failed');
            setError(result.error || 'Failed to check payment status');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
          setPaymentStatus('failed');
          setError('Error checking payment status');
          clearInterval(interval);
        }
      }, 5000); // Poll every 5 seconds

      // Stop polling after 10 minutes
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          if (paymentStatus === 'pending') {
            setPaymentStatus('failed');
            setError('Payment verification timeout');
          }
        }
      }, 600000); // 10 minutes
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [referenceId, paymentStatus, amount, currency, externalId, onPaymentSuccess]);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Ghana MTN number patterns: 024, 054, 055, 059
    const mtnPatterns = [/^233(24|54|55|59)\d{7}$/, /^0(24|54|55|59)\d{7}$/, /^(24|54|55|59)\d{7}$/];
    
    return mtnPatterns.some(pattern => pattern.test(cleanPhone));
  };

  const handleApiPayment = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your MTN Mobile Money number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid MTN Mobile Money number (024, 054, 055, or 059)');
      return;
    }

    setPaymentStatus('processing');
    setError(null);

    try {
      const result = await paymentService.requestMTNPayment({
        amount,
        currency,
        externalId,
        phoneNumber,
        payerMessage: `Payment for virtual card - ${externalId}`,
        payeeNote: `MorphCash card payment - ${externalId}`
      });

      if (result.success && result.referenceId) {
        setReferenceId(result.referenceId);
        setPaymentStatus('pending');
      } else {
        setPaymentStatus('failed');
        setError(result.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('API payment error:', error);
      setPaymentStatus('failed');
      setError('Failed to process payment request');
    }
  };

  const handleWidgetPayment = () => {
    setPaymentMethod('widget');
    // The widget component will handle the payment flow
  };

  const handleClose = () => {
    if (paymentStatus === 'processing' || paymentStatus === 'pending') return;
    onClose();
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-8 h-8 text-red-500" />;
      case 'processing':
      case 'pending':
        return <ClockIcon className="w-8 h-8 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Initiating payment request...';
      case 'pending':
        return 'Payment request sent. Please check your phone to approve the payment.';
      case 'success':
        return 'Payment completed successfully!';
      case 'failed':
        return error || 'Payment failed. Please try again.';
      default:
        return 'Choose how you want to pay with MTN Mobile Money';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">MTN Mobile Money Payment</h2>
          <button
            onClick={handleClose}
            disabled={paymentStatus === 'processing' || paymentStatus === 'pending'}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold text-gray-900">
              {paymentService.formatCurrency(amount, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Reference</span>
            <span className="text-sm font-mono text-gray-700">{externalId}</span>
          </div>
          {referenceId && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Payment ID</span>
              <span className="text-xs font-mono text-gray-700">{referenceId.substring(0, 8)}...</span>
            </div>
          )}
        </div>

        {/* Status Display */}
        {paymentStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl border ${getStatusColor()}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div className="flex-1">
                <p className="text-sm font-medium">{getStatusText()}</p>
                {currentPayment && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p>Transaction ID: {currentPayment.financialTransactionId}</p>
                    <p>Amount: {currentPayment.amount} {currentPayment.currency}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        {paymentStatus === 'idle' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Payment Method
              </label>
              
              {/* API Payment Method */}
              <div className="space-y-4">
                <div className="border-2 border-yellow-200 rounded-xl p-4 bg-yellow-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Direct API Payment</h3>
                      <p className="text-sm text-gray-600">Enter your MTN number for direct payment</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MTN Mobile Money Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="024XXXXXXX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your 10-digit MTN number (024, 054, 055, or 059)
                      </p>
                    </div>
                    
                    <button
                      onClick={handleApiPayment}
                      disabled={!phoneNumber.trim()}
                      className="w-full bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Payment Request
                    </button>
                  </div>
                </div>

                {/* Widget Payment Method */}
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Widget Payment</h3>
                      <p className="text-sm text-gray-600">Use MTN's payment widget (fallback)</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleWidgetPayment}
                    className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Use Payment Widget
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {paymentStatus === 'failed' && (
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setError(null);
                setReferenceId(null);
              }}
              className="flex-1 bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {paymentStatus === 'success' && (
          <button
            onClick={handleClose}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        )}

        {/* Instructions */}
        {paymentStatus === 'pending' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check your phone for an MTN Mobile Money payment request</li>
              <li>• Enter your PIN to approve the payment</li>
              <li>• You will receive a confirmation SMS</li>
              <li>• Your virtual card will be created automatically</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
