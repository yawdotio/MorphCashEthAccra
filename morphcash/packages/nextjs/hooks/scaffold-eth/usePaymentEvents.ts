import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useScaffoldEventHistory } from '~~/hooks/scaffold-eth';
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

  // Listen for CardFundingSuccess events
  const { data: cardFundingEvents, isLoading, error } = useScaffoldEventHistory({
    contractName: "PaymentContract",
    eventName: "CardFundingSuccess",
    fromBlock: 0n,
    watch: true,
    enabled: !!address,
  });

  // Process new events and create cards in database
  useEffect(() => {
    const processEvents = async () => {
      if (!cardFundingEvents || !user || !isAuthenticated || isProcessing) return;

      // Filter events for current user
      const userEvents = cardFundingEvents.filter(event => 
        event.args.user.toLowerCase() === address?.toLowerCase()
      );

      for (const event of userEvents) {
        const eventKey = `${event.args.fundingId}-${event.transactionHash}`;
        
        // Skip if already processed
        if (processedEvents.has(eventKey)) continue;

        setIsProcessing(true);
        
        try {
          // Generate card details using the VirtualCardGenerator
          const cardNumber = VirtualCardGenerator.generateCardNumber('visa');
          const cardName = `${event.args.cardType} Card`;
          const spendingLimit = Number(event.args.amount) * 0.8; // 80% of funding amount
          
          // Create card in database
          const result = await userService.createVirtualCard(user.id, {
            cardName,
            cardNumber,
            cardType: event.args.cardType,
            spendingLimit: BigInt(Math.floor(spendingLimit)),
            onChainTxHash: event.transactionHash,
          });

          if (result.success) {
            console.log('Card created from payment event:', result.data);
            setProcessedEvents(prev => new Set([...prev, eventKey]));
          } else {
            console.error('Failed to create card from payment event:', result.error);
          }
        } catch (error) {
          console.error('Error processing payment event:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    processEvents();
  }, [cardFundingEvents, user, isAuthenticated, address, processedEvents, isProcessing]);

  return {
    cardFundingEvents,
    isLoading,
    error,
    isProcessing,
  };
};

