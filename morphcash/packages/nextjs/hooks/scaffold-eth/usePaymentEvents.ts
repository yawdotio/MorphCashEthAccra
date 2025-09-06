import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useScaffoldWatchContractEvent } from '~~/hooks/scaffold-eth';
import userService from '~~/services/userService';
import { useEnhancedAuth } from '~~/contexts/EnhancedAuthContext';
import { VirtualCardGenerator } from '~~/services/database/virtualCardsSchema';

export interface CardFundingEvent {
  fundingId: bigint;
  user: string;
  amount: bigint;
  cardType: string;
  transactionHash: string;
  blockNumber: bigint;
}

export const usePaymentEvents = () => {
  const { address } = useAccount();
  const { user, isAuthenticated } = useEnhancedAuth();
  const [processedEvents, setProcessedEvents] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Watch for CardFundingSuccess events
  useScaffoldWatchContractEvent({
    contractName: "PaymentContract",
    eventName: "CardFundingSuccess",
    onLogs: (logs) => {
      console.log('🎉 CardFundingSuccess event received in usePaymentEvents:', logs);
      
      logs.forEach(async (log) => {
        const { fundingId, user: eventUser, amount, cardType, transactionHash } = log.args;
        
        // Check if this event is for the current user
        if (eventUser.toLowerCase() !== address?.toLowerCase()) return;
        
        const eventKey = `${fundingId}-${transactionHash}`;
        
        // Skip if already processed
        if (processedEvents.has(eventKey)) return;

        if (!user || !isAuthenticated || isProcessing) return;

        setIsProcessing(true);
        
        try {
          console.log('🎯 Processing payment event for card creation:', { fundingId, amount, cardType });
          
          // Generate card details using the VirtualCardGenerator
          const cardNumber = VirtualCardGenerator.generateCardNumber('visa');
          const cardName = `${cardType} Card`;
          const spendingLimit = Number(amount) * 0.8; // 80% of funding amount
          
          // Create card in database
          const result = await userService.createVirtualCard(user.id, {
            cardName,
            cardNumber,
            cardType: cardType as string,
            spendingLimit: BigInt(Math.floor(spendingLimit)),
            onChainTxHash: transactionHash as string,
          });

          if (result.success) {
            console.log('✅ Card created from payment event:', result.data);
            setProcessedEvents(prev => new Set([...prev, eventKey]));
          } else {
            console.error('❌ Failed to create card from payment event:', result.error);
          }
        } catch (error) {
          console.error('❌ Error processing payment event:', error);
        } finally {
          setIsProcessing(false);
        }
      });
    },
  });

  return {
    isProcessing,
  };
};

