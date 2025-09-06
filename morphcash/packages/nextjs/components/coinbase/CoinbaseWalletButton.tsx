/**
 * Coinbase Smart Wallet Integration Component
 * Provides gasless transactions and seamless crypto payments
 */

import { useState, useEffect } from 'react';
import { 
  WalletIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { useCoinbase } from '~~/hooks/useCoinbase';

interface CoinbaseWalletButtonProps {
  onWalletConnected: (address: string) => void;
  onWalletDisconnected: () => void;
  onError: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export const CoinbaseWalletButton = ({
  onWalletConnected,
  onWalletDisconnected,
  onError,
  className = '',
  disabled = false
}: CoinbaseWalletButtonProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<{ eth: number; usdc: number }>({ eth: 0, usdc: 0 });
  
  const { 
    getBalance, 
    isCheckingBalance, 
    error, 
    clearError 
  } = useCoinbase();

  // Check if Coinbase Wallet is available
  const isCoinbaseWalletAvailable = typeof window !== 'undefined' && 
    (window as any).ethereum?.isCoinbaseWallet;

  // Connect to Coinbase Wallet
  const connectWallet = async () => {
    if (!isCoinbaseWalletAvailable) {
      onError('Coinbase Wallet not detected. Please install Coinbase Wallet extension.');
      return;
    }

    setIsConnecting(true);
    clearError();

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        onWalletConnected(address);
        
        // Fetch balances
        await fetchBalances(address);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      onError(errorMessage);
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setBalance({ eth: 0, usdc: 0 });
    onWalletDisconnected();
  };

  // Fetch wallet balances
  const fetchBalances = async (address: string) => {
    try {
      const [ethBalance, usdcBalance] = await Promise.all([
        getBalance(address, 'ETH'),
        getBalance(address, 'USDC')
      ]);
      
      setBalance({ eth: ethBalance, usdc: usdcBalance });
    } catch (err) {
      console.error('Error fetching balances:', err);
    }
  };

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isCoinbaseWalletAvailable) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts',
          });
          
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            setWalletAddress(address);
            setIsConnected(true);
            await fetchBalances(address);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkConnection();
  }, [isCoinbaseWalletAvailable]);

  // Listen for account changes
  useEffect(() => {
    if (isCoinbaseWalletAvailable) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          const newAddress = accounts[0];
          setWalletAddress(newAddress);
          onWalletConnected(newAddress);
          fetchBalances(newAddress);
        }
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [walletAddress, onWalletConnected]);

  // Show error if any
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  if (isConnected && walletAddress) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-900">Coinbase Wallet Connected</p>
              <p className="text-sm text-green-700 font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
        
        {/* Balance Display */}
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-700">ETH Balance</p>
              <p className="font-semibold text-green-900">
                {isCheckingBalance ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin inline" />
                ) : (
                  `${balance.eth.toFixed(6)} ETH`
                )}
              </p>
            </div>
            <div>
              <p className="text-green-700">USDC Balance</p>
              <p className="font-semibold text-green-900">
                {isCheckingBalance ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin inline" />
                ) : (
                  `${balance.usdc.toFixed(2)} USDC`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={disabled || isConnecting || !isCoinbaseWalletAvailable}
      className={`
        w-full flex items-center justify-center space-x-3 px-6 py-4 
        rounded-xl border-2 border-dashed transition-all
        ${isCoinbaseWalletAvailable && !disabled && !isConnecting
          ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 text-blue-700'
          : 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed'
        }
        ${className}
      `}
    >
      {isConnecting ? (
        <>
          <ArrowPathIcon className="h-6 w-6 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : !isCoinbaseWalletAvailable ? (
        <>
          <ExclamationTriangleIcon className="h-6 w-6" />
          <span>Coinbase Wallet Not Found</span>
        </>
      ) : (
        <>
          <WalletIcon className="h-6 w-6" />
          <span>Connect Coinbase Wallet</span>
        </>
      )}
    </button>
  );
};
