"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface MTNMobileMoneyWidgetProps {
  apiUserId: string;
  amount: number;
  currency: string;
  externalId: string;
  onPaymentCreated?: (invoice: any) => void;
  onPaymentSuccess?: (invoice: any) => void;
  onPaymentFailed?: (invoice: any) => void;
  onPaymentCanceled?: (invoice: any) => void;
  className?: string;
}

type PaymentStatus = 'idle' | 'created' | 'pending' | 'successful' | 'failed' | 'canceled';

export const MTNMobileMoneyWidget = ({
  apiUserId,
  amount,
  currency,
  externalId,
  onPaymentCreated,
  onPaymentSuccess,
  onPaymentFailed,
  onPaymentCanceled,
  className = ""
}: MTNMobileMoneyWidgetProps) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Initialize the widget when component mounts
  useEffect(() => {
    if (!widgetRef.current) return;

    // Set up the widget element with required attributes
    const widgetElement = widgetRef.current;
    widgetElement.className = `mobile-money-qr-payment ${className}`;
    widgetElement.setAttribute('data-api-user-id', apiUserId);
    widgetElement.setAttribute('data-amount', amount.toString());
    widgetElement.setAttribute('data-currency', currency);
    widgetElement.setAttribute('data-external-id', externalId);

    // Set up event listeners
    const handlePaymentCreated = (event: CustomEvent) => {
      console.log('Payment created:', event.detail);
      setCurrentInvoice(event.detail);
      setPaymentStatus('created');
      onPaymentCreated?.(event.detail);
    };

    const handlePaymentSuccess = (event: CustomEvent) => {
      console.log('Payment successful:', event.detail);
      setCurrentInvoice(event.detail);
      setPaymentStatus('successful');
      onPaymentSuccess?.(event.detail);
    };

    const handlePaymentFailed = (event: CustomEvent) => {
      console.log('Payment failed:', event.detail);
      setCurrentInvoice(event.detail);
      setPaymentStatus('failed');
      setError('Payment failed. Please try again.');
      onPaymentFailed?.(event.detail);
    };

    const handlePaymentCanceled = (event: CustomEvent) => {
      console.log('Payment canceled:', event.detail);
      setCurrentInvoice(event.detail);
      setPaymentStatus('canceled');
      onPaymentCanceled?.(event.detail);
    };

    // Add event listeners
    window.addEventListener('mobile-money-qr-payment-created', handlePaymentCreated as EventListener);
    window.addEventListener('mobile-money-qr-payment-successful', handlePaymentSuccess as EventListener);
    window.addEventListener('mobile-money-qr-payment-failed', handlePaymentFailed as EventListener);
    window.addEventListener('mobile-money-qr-payment-canceled', handlePaymentCanceled as EventListener);

    // Initialize the widget
    if (typeof window !== 'undefined' && (window as any).mobileMoneyReinitializeWidgets) {
      (window as any).mobileMoneyReinitializeWidgets();
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener('mobile-money-qr-payment-created', handlePaymentCreated as EventListener);
      window.removeEventListener('mobile-money-qr-payment-successful', handlePaymentSuccess as EventListener);
      window.removeEventListener('mobile-money-qr-payment-failed', handlePaymentFailed as EventListener);
      window.removeEventListener('mobile-money-qr-payment-canceled', handlePaymentCanceled as EventListener);
    };
  }, [apiUserId, amount, currency, externalId, onPaymentCreated, onPaymentSuccess, onPaymentFailed, onPaymentCanceled, className]);

  // Update widget attributes when props change
  useEffect(() => {
    if (!widgetRef.current) return;

    const widgetElement = widgetRef.current;
    widgetElement.setAttribute('data-amount', amount.toString());
    widgetElement.setAttribute('data-currency', currency);
    widgetElement.setAttribute('data-external-id', externalId);

    // Reinitialize widget with new attributes
    if (typeof window !== 'undefined' && (window as any).mobileMoneyReinitializeWidgets) {
      (window as any).mobileMoneyReinitializeWidgets();
    }
  }, [amount, currency, externalId]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'successful':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'created':
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'created':
        return 'Payment initiated. Please complete on your mobile device.';
      case 'pending':
        return 'Payment is being processed...';
      case 'successful':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'canceled':
        return 'Payment was canceled.';
      default:
        return 'Click to pay with MTN Mobile Money';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'successful':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'created':
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'canceled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full">
      {/* MTN Mobile Money Widget */}
      <div ref={widgetRef} className="w-full" />
      
      {/* Status Display */}
      {paymentStatus !== 'idle' && (
        <div className={`mt-4 p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div className="flex-1">
              <p className="text-sm font-medium">{getStatusText()}</p>
              {currentInvoice && (
                <div className="mt-2 text-xs text-gray-600">
                  <p>Reference: {currentInvoice.paymentReference}</p>
                  <p>Amount: {currentInvoice.amount} {currentInvoice.currency}</p>
                  {currentInvoice.invoiceId && (
                    <p>Invoice ID: {currentInvoice.invoiceId}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center space-x-3">
            <XCircleIcon className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
