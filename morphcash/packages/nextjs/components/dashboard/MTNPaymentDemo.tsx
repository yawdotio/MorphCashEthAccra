"use client";

import { useState } from "react";
import { PlayIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { MTNMobileMoneyWidget } from "./MTNMobileMoneyWidget";
import { useMTNPaymentVerification } from "~~/hooks/scaffold-eth/useMTNPaymentVerification";

export const MTNPaymentDemo = () => {
  const [showWidget, setShowWidget] = useState(false);
  const [paymentData, setPaymentData] = useState({
    apiUserId: 'b12d7b22-3057-4c8e-ad50-63904171d18c', // Demo UUID
    amount: 50,
    currency: 'GHS',
    externalId: `DEMO-${Date.now()}`
  });

  const {
    verificationState,
    verifyPayment,
    resetVerification
  } = useMTNPaymentVerification();

  const handlePaymentCreated = (invoice: any) => {
    console.log('Payment created:', invoice);
  };

  const handlePaymentSuccess = async (invoice: any) => {
    console.log('Payment successful:', invoice);
    await verifyPayment(invoice);
  };

  const handlePaymentFailed = (invoice: any) => {
    console.log('Payment failed:', invoice);
  };

  const handlePaymentCanceled = (invoice: any) => {
    console.log('Payment canceled:', invoice);
  };

  const resetDemo = () => {
    setShowWidget(false);
    resetVerification();
    setPaymentData({
      apiUserId: 'b12d7b22-3057-4c8e-ad50-63904171d18c',
      amount: 50,
      currency: 'GHS',
      externalId: `DEMO-${Date.now()}`
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">MTN Mobile Money Integration Demo</h3>
        <p className="text-gray-600">Test the MTN Mobile Money widget with different amounts</p>
      </div>

      {/* Amount Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Test Amount (based on MTN sandbox behavior)
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { amount: 10, label: 'GHS 10', description: 'PENDING' },
            { amount: 50, label: 'GHS 50', description: 'SUCCESSFUL' },
            { amount: 30, label: 'GHS 30', description: 'FAILED' }
          ].map((option) => (
            <button
              key={option.amount}
              onClick={() => setPaymentData(prev => ({ ...prev, amount: option.amount }))}
              className={`p-3 rounded-xl border-2 transition-all ${
                paymentData.amount === option.amount
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Status */}
      {verificationState.status !== 'idle' && (
        <div className="mb-6 p-4 rounded-xl bg-gray-50">
          <div className="flex items-center space-x-3">
            {verificationState.status === 'success' && (
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                Status: {verificationState.status.toUpperCase()}
              </p>
              {verificationState.invoice && (
                <div className="text-sm text-gray-600 mt-1">
                  <p>Invoice ID: {verificationState.invoice.invoiceId}</p>
                  <p>Reference: {verificationState.invoice.paymentReference}</p>
                </div>
              )}
              {verificationState.error && (
                <p className="text-sm text-red-600 mt-1">{verificationState.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Widget */}
      {showWidget && (
        <div className="mb-6">
          <MTNMobileMoneyWidget
            apiUserId={paymentData.apiUserId}
            amount={paymentData.amount}
            currency={paymentData.currency}
            externalId={paymentData.externalId}
            onPaymentCreated={handlePaymentCreated}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
            onPaymentCanceled={handlePaymentCanceled}
            className="w-full"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {!showWidget ? (
          <button
            onClick={() => setShowWidget(true)}
            className="flex-1 bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
          >
            <PlayIcon className="w-5 h-5" />
            <span>Start Payment</span>
          </button>
        ) : (
          <button
            onClick={resetDemo}
            className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Reset Demo
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Start Payment" to initialize the MTN widget</li>
          <li>• The widget will redirect you to MTN's payment system</li>
          <li>• Complete the payment on your mobile device</li>
          <li>• The system will verify the payment and create your card</li>
          <li>• Different amounts trigger different responses (see amounts above)</li>
        </ul>
      </div>
    </div>
  );
};
