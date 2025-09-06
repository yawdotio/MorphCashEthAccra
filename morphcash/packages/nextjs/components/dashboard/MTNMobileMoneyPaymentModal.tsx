"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { MTNMobileMoneyWidget } from "./MTNMobileMoneyWidget";
import { useMTNPaymentVerification } from "~~/hooks/scaffold-eth/useMTNPaymentVerification";
import { paymentService } from "~~/services/paymentService";

interface MTNMobileMoneyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (invoice: any) => void;
  amount: number;
  currency: 'GHS' | 'USD';
  externalId: string;
}

export const MTNMobileMoneyPaymentModal = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  currency,
  externalId
}: MTNMobileMoneyPaymentModalProps) => {
  const [apiUserId] = useState('b12d7b22-3057-4c8e-ad50-63904171d18c'); // Demo UUID
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'created' | 'verifying' | 'success' | 'failed'>('idle');
  
  const {
    verificationState,
    verifyPayment,
    resetVerification,
    startPolling,
    stopPolling
  } = useMTNPaymentVerification();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setCurrentInvoice(null);
      resetVerification();
    }
  }, [isOpen, resetVerification]);

  // Handle payment created event
  const handlePaymentCreated = (invoice: any) => {
    console.log('Payment created:', invoice);
    setCurrentInvoice(invoice);
    setPaymentStatus('created');
    
    // Start polling for payment status
    if (invoice.invoiceId) {
      startPolling(invoice.invoiceId, invoice.externalId);
    }
  };

  // Handle payment success event
  const handlePaymentSuccess = async (invoice: any) => {
    console.log('Payment successful:', invoice);
    setCurrentInvoice(invoice);
    setPaymentStatus('verifying');
    
    // Verify the payment
    await verifyPayment(invoice);
  };

  // Handle payment failed event
  const handlePaymentFailed = (invoice: any) => {
    console.log('Payment failed:', invoice);
    setCurrentInvoice(invoice);
    setPaymentStatus('failed');
    stopPolling();
  };

  // Handle payment canceled event
  const handlePaymentCanceled = (invoice: any) => {
    console.log('Payment canceled:', invoice);
    setCurrentInvoice(invoice);
    setPaymentStatus('failed');
    stopPolling();
  };

  // Handle verification state changes
  useEffect(() => {
    if (verificationState.status === 'success') {
      setPaymentStatus('success');
      // Call success callback after a short delay
      setTimeout(() => {
        onPaymentSuccess(verificationState.invoice || currentInvoice);
      }, 2000);
    } else if (verificationState.status === 'failed') {
      setPaymentStatus('failed');
    } else if (verificationState.status === 'pending') {
      setPaymentStatus('verifying');
    }
  }, [verificationState.status, verificationState.invoice, currentInvoice, onPaymentSuccess]);

  const handleClose = () => {
    if (paymentStatus === 'verifying') return; // Prevent closing during verification
    stopPolling();
    resetVerification();
    onClose();
  };

  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-8 h-8 text-red-500" />;
      case 'created':
      case 'verifying':
        return <ClockIcon className="w-8 h-8 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'created':
        return 'Payment initiated. Please complete on your mobile device.';
      case 'verifying':
        return 'Verifying payment...';
      case 'success':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return 'Pay with MTN Mobile Money';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'created':
      case 'verifying':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">MTN Mobile Money Payment</h2>
          <button
            onClick={handleClose}
            disabled={paymentStatus === 'verifying'}
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
        </div>

        {/* Status Display */}
        {paymentStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl border ${getStatusColor()}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div className="flex-1">
                <p className="text-sm font-medium">{getStatusText()}</p>
                {verificationState.error && (
                  <p className="text-xs text-red-600 mt-1">{verificationState.error}</p>
                )}
                {currentInvoice && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p>Invoice ID: {currentInvoice.invoiceId}</p>
                    <p>Payment Ref: {currentInvoice.paymentReference}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MTN Mobile Money Widget */}
        {paymentStatus === 'idle' && (
          <div className="mb-6">
            <MTNMobileMoneyWidget
              apiUserId={apiUserId}
              amount={amount}
              currency={currency}
              externalId={externalId}
              onPaymentCreated={handlePaymentCreated}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailed={handlePaymentFailed}
              onPaymentCanceled={handlePaymentCanceled}
              className="w-full"
            />
          </div>
        )}

        {/* Instructions */}
        {paymentStatus === 'idle' && (
          <div className="text-center text-sm text-gray-600">
            <p>Click the button above to pay with MTN Mobile Money</p>
            <p className="mt-1">You will be redirected to complete the payment</p>
          </div>
        )}

        {/* Action Buttons */}
        {paymentStatus === 'failed' && (
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setCurrentInvoice(null);
                resetVerification();
              }}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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
      </div>
    </div>
  );
};
