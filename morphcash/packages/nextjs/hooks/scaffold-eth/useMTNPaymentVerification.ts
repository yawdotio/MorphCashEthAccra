"use client";

import { useState, useEffect, useCallback } from 'react';
import { paymentService, MTNMobileMoneyPaymentData } from '~~/services/paymentService';

export interface PaymentVerificationState {
  status: 'idle' | 'verifying' | 'success' | 'failed' | 'pending';
  invoice: any | null;
  error: string | null;
  isVerifying: boolean;
}

export interface UseMTNPaymentVerificationReturn {
  verificationState: PaymentVerificationState;
  verifyPayment: (invoice: any) => Promise<void>;
  resetVerification: () => void;
  startPolling: (invoiceId: string, externalId: string) => void;
  stopPolling: () => void;
}

export const useMTNPaymentVerification = (): UseMTNPaymentVerificationReturn => {
  const [verificationState, setVerificationState] = useState<PaymentVerificationState>({
    status: 'idle',
    invoice: null,
    error: null,
    isVerifying: false
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const verifyPayment = useCallback(async (invoice: any) => {
    if (!invoice) return;

    setVerificationState(prev => ({
      ...prev,
      status: 'verifying',
      isVerifying: true,
      error: null
    }));

    try {
      const paymentData: MTNMobileMoneyPaymentData = {
        apiUserId: invoice.payee?.partyId || '',
        amount: invoice.amount,
        currency: invoice.currency,
        externalId: invoice.externalId,
        invoiceId: invoice.invoiceId,
        paymentReference: invoice.paymentReference,
        status: invoice.status
      };

      const result = await paymentService.processMTNMobileMoneyPayment(paymentData);

      if (result.success) {
        setVerificationState(prev => ({
          ...prev,
          status: 'success',
          invoice: {
            ...invoice,
            verified: true,
            transactionId: result.transactionId,
            reference: result.reference
          },
          isVerifying: false
        }));
      } else {
        setVerificationState(prev => ({
          ...prev,
          status: 'failed',
          error: result.error || 'Payment verification failed',
          isVerifying: false
        }));
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationState(prev => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment verification failed',
        isVerifying: false
      }));
    }
  }, []);

  const startPolling = useCallback((invoiceId: string, externalId: string) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    setVerificationState(prev => ({
      ...prev,
      status: 'pending',
      isVerifying: true
    }));

    const interval = setInterval(async () => {
      try {
        const statusResult = await paymentService.verifyMTNPaymentStatus(invoiceId, externalId);
        
        if (statusResult.status === 'SUCCESSFUL') {
          setVerificationState(prev => ({
            ...prev,
            status: 'success',
            invoice: statusResult.invoice,
            isVerifying: false
          }));
          clearInterval(interval);
          setPollingInterval(null);
        } else if (statusResult.status === 'FAILED') {
          setVerificationState(prev => ({
            ...prev,
            status: 'failed',
            error: 'Payment failed',
            isVerifying: false
          }));
          clearInterval(interval);
          setPollingInterval(null);
        }
        // Continue polling for PENDING status
      } catch (error) {
        console.error('Polling error:', error);
        setVerificationState(prev => ({
          ...prev,
          status: 'failed',
          error: 'Error checking payment status',
          isVerifying: false
        }));
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);

    // Stop polling after 10 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollingInterval(null);
        setVerificationState(prev => ({
          ...prev,
          status: 'failed',
          error: 'Payment verification timeout',
          isVerifying: false
        }));
      }
    }, 600000); // 10 minutes
  }, [pollingInterval]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setVerificationState(prev => ({
      ...prev,
      isVerifying: false
    }));
  }, [pollingInterval]);

  const resetVerification = useCallback(() => {
    stopPolling();
    setVerificationState({
      status: 'idle',
      invoice: null,
      error: null,
      isVerifying: false
    });
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    verificationState,
    verifyPayment,
    resetVerification,
    startPolling,
    stopPolling
  };
};
