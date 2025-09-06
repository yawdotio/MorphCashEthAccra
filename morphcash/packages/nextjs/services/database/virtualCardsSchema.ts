/**
 * Virtual Cards Database Schema and Types
 * Defines the database structure for storing card details including sensitive information
 */

import { encryptionService } from './encryption';

// Database schema for virtual cards table
export interface VirtualCardRecord {
  id: string; // UUID primary key
  user_address: string; // Ethereum address of the card owner
  card_id: number; // Card ID from smart contract
  card_name: string;
  card_number_encrypted: string; // Full 16-digit card number (encrypted)
  card_number_masked: string; // Masked version (****1234) for display
  expiry_date: string; // MM/YY format
  cvc_encrypted: string; // 3-4 digit CVC (encrypted)
  card_type: string; // Visa, Mastercard, etc.
  spending_limit: number;
  balance: number; // Current available balance
  current_spend: number;
  is_active: boolean;
  currency: string; // GHS, USD, etc.
  payment_reference: string; // Reference to the funding payment
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Database schema for payment records table
export interface PaymentRecord {
  id: string; // UUID primary key
  payment_reference: string; // Unique payment reference
  user_address: string; // Ethereum address
  payment_method: string; // mtn, crypto, etc.
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'failed' | 'processed';
  transaction_id?: string; // External transaction ID
  created_at: string;
  verified_at?: string;
  processed_at?: string;
}

// Database schema for card transactions table
export interface CardTransaction {
  id: string; // UUID primary key
  card_record_id: string; // Foreign key to virtual_cards.id
  user_address: string;
  transaction_type: 'spend' | 'refund' | 'fund' | 'transfer';
  amount: number;
  currency: string;
  merchant?: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

// Type for creating a new virtual card
export interface CreateVirtualCardData {
  userAddress: string;
  cardId: number;
  cardName: string;
  spendingLimit: number;
  balance: number;
  currency: string;
  paymentReference: string;
}

// Type for card details with decrypted sensitive data
export interface VirtualCardDetails {
  id: string;
  userAddress: string;
  cardId: number;
  cardName: string;
  cardNumber: string; // Decrypted full number
  cardNumberMasked: string;
  expiryDate: string;
  cvc: string; // Decrypted CVC
  cardType: string;
  spendingLimit: number;
  balance: number;
  currentSpend: number;
  isActive: boolean;
  currency: string;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
}

// Type for safe card display (no sensitive data)
export interface SafeVirtualCard {
  id: string;
  userAddress: string;
  cardId: number;
  cardName: string;
  cardNumberMasked: string;
  expiryDate: string;
  cardType: string;
  spendingLimit: number;
  balance: number;
  currentSpend: number;
  isActive: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Virtual Card Generator Utilities
 */
export class VirtualCardGenerator {
  /**
   * Generate a realistic 16-digit card number
   * Uses Luhn algorithm for validation
   */
  static generateCardNumber(cardType: 'visa' | 'mastercard' = 'visa'): string {
    const visaPrefix = '4';
    const mastercardPrefix = '5';
    
    let prefix = cardType === 'visa' ? visaPrefix : mastercardPrefix;
    let cardNumber = prefix;
    
    // Generate 14 more digits
    for (let i = 0; i < 14; i++) {
      cardNumber += Math.floor(Math.random() * 10).toString();
    }
    
    // Add Luhn check digit
    const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
    cardNumber += checkDigit.toString();
    
    return cardNumber;
  }

  /**
   * Calculate Luhn check digit
   */
  private static calculateLuhnCheckDigit(cardNumber: string): number {
    const digits = cardNumber.split('').map(Number);
    let sum = 0;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      
      if ((digits.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
    }
    
    return (10 - (sum % 10)) % 10;
  }

  /**
   * Generate a masked card number for display
   */
  static maskCardNumber(cardNumber: string): string {
    if (cardNumber.length !== 16) {
      throw new Error('Card number must be 16 digits');
    }
    
    return `****${'*'.repeat(8)}${cardNumber.slice(-4)}`;
  }

  /**
   * Generate a 3-4 digit CVC
   */
  static generateCVC(cardType: 'visa' | 'mastercard' = 'visa'): string {
    const length = cardType === 'visa' ? 3 : 3; // Both use 3 digits typically
    let cvc = '';
    
    for (let i = 0; i < length; i++) {
      cvc += Math.floor(Math.random() * 10).toString();
    }
    
    return cvc;
  }

  /**
   * Generate expiry date (3 years from now)
   */
  static generateExpiryDate(): string {
    const now = new Date();
    const expiryDate = new Date(now.getFullYear() + 3, now.getMonth(), 1);
    
    const month = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
    const year = expiryDate.getFullYear().toString().slice(-2);
    
    return `${month}/${year}`;
  }

  /**
   * Generate card type based on card number
   */
  static getCardType(cardNumber: string): string {
    if (cardNumber.startsWith('4')) {
      return 'Visa';
    } else if (cardNumber.startsWith('5')) {
      return 'Mastercard';
    } else {
      return 'Unknown';
    }
  }
}

/**
 * Virtual Card Database Service
 */
export class VirtualCardDatabaseService {
  /**
   * Create a new virtual card record in the database
   */
  static async createVirtualCard(data: CreateVirtualCardData): Promise<VirtualCardRecord> {
    const cardNumber = VirtualCardGenerator.generateCardNumber('visa');
    const cvc = VirtualCardGenerator.generateCVC('visa');
    const expiryDate = VirtualCardGenerator.generateExpiryDate();
    const cardType = VirtualCardGenerator.getCardType(cardNumber);
    
    const record: VirtualCardRecord = {
      id: crypto.randomUUID(),
      user_address: data.userAddress,
      card_id: data.cardId,
      card_name: data.cardName,
      card_number_encrypted: await encryptionService.encryptSensitiveData(data.userAddress as any, cardNumber),
      card_number_masked: VirtualCardGenerator.maskCardNumber(cardNumber),
      expiry_date: expiryDate,
      cvc_encrypted: await encryptionService.encryptSensitiveData(data.userAddress as any, cvc),
      card_type: cardType,
      spending_limit: data.spendingLimit,
      balance: data.balance,
      current_spend: 0,
      is_active: true,
      currency: data.currency,
      payment_reference: data.paymentReference,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return record;
  }

  /**
   * Decrypt sensitive card data for authorized access
   */
  static async decryptCardData(record: VirtualCardRecord): Promise<VirtualCardDetails> {
    const cardNumber = await encryptionService.decryptSensitiveData(record.user_address as any, record.card_number_encrypted);
    const cvc = await encryptionService.decryptSensitiveData(record.user_address as any, record.cvc_encrypted);
    
    return {
      id: record.id,
      userAddress: record.user_address,
      cardId: record.card_id,
      cardName: record.card_name,
      cardNumber,
      cardNumberMasked: record.card_number_masked,
      expiryDate: record.expiry_date,
      cvc,
      cardType: record.card_type,
      spendingLimit: record.spending_limit,
      balance: record.balance,
      currentSpend: record.current_spend,
      isActive: record.is_active,
      currency: record.currency,
      paymentReference: record.payment_reference,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  /**
   * Get safe card data for display (no sensitive information)
   */
  static getSafeCardData(record: VirtualCardRecord): SafeVirtualCard {
    return {
      id: record.id,
      userAddress: record.user_address,
      cardId: record.card_id,
      cardName: record.card_name,
      cardNumberMasked: record.card_number_masked,
      expiryDate: record.expiry_date,
      cardType: record.card_type,
      spendingLimit: record.spending_limit,
      balance: record.balance,
      currentSpend: record.current_spend,
      isActive: record.is_active,
      currency: record.currency,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  /**
   * Update card balance
   */
  static async updateCardBalance(
    cardId: string, 
    newBalance: number, 
    currentSpend?: number
  ): Promise<Partial<VirtualCardRecord>> {
    const updates: Partial<VirtualCardRecord> = {
      balance: newBalance,
      updated_at: new Date().toISOString(),
    };
    
    if (currentSpend !== undefined) {
      updates.current_spend = currentSpend;
    }
    
    return updates;
  }

  /**
   * Create a payment record
   */
  static createPaymentRecord(
    paymentReference: string,
    userAddress: string,
    paymentMethod: string,
    amount: number,
    currency: string,
    transactionId?: string
  ): PaymentRecord {
    return {
      id: crypto.randomUUID(),
      payment_reference: paymentReference,
      user_address: userAddress,
      payment_method: paymentMethod,
      amount,
      currency,
      status: 'pending',
      transaction_id: transactionId,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create a card transaction record
   */
  static createCardTransaction(
    cardRecordId: string,
    userAddress: string,
    type: 'spend' | 'refund' | 'fund' | 'transfer',
    amount: number,
    currency: string,
    description: string,
    reference: string
  ): CardTransaction {
    return {
      id: crypto.randomUUID(),
      card_record_id: cardRecordId,
      user_address: userAddress,
      transaction_type: type,
      amount,
      currency,
      description,
      reference,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }
}

// SQL schema for database creation
export const DATABASE_SCHEMA = {
  virtual_cards: `
    CREATE TABLE IF NOT EXISTS virtual_cards (
      id UUID PRIMARY KEY,
      user_address VARCHAR(42) NOT NULL,
      card_id INTEGER NOT NULL,
      card_name VARCHAR(100) NOT NULL,
      card_number_encrypted TEXT NOT NULL,
      card_number_masked VARCHAR(19) NOT NULL,
      expiry_date VARCHAR(5) NOT NULL,
      cvc_encrypted TEXT NOT NULL,
      card_type VARCHAR(20) NOT NULL,
      spending_limit DECIMAL(15,2) NOT NULL,
      balance DECIMAL(15,2) NOT NULL DEFAULT 0,
      current_spend DECIMAL(15,2) NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      currency VARCHAR(3) NOT NULL,
      payment_reference VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      UNIQUE(user_address, card_id)
    );
  `,
  
  payment_records: `
    CREATE TABLE IF NOT EXISTS payment_records (
      id UUID PRIMARY KEY,
      payment_reference VARCHAR(100) UNIQUE NOT NULL,
      user_address VARCHAR(42) NOT NULL,
      payment_method VARCHAR(20) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      currency VARCHAR(3) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      transaction_id VARCHAR(100),
      created_at TIMESTAMP NOT NULL,
      verified_at TIMESTAMP,
      processed_at TIMESTAMP
    );
  `,
  
  card_transactions: `
    CREATE TABLE IF NOT EXISTS card_transactions (
      id UUID PRIMARY KEY,
      card_record_id UUID NOT NULL,
      user_address VARCHAR(42) NOT NULL,
      transaction_type VARCHAR(20) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      currency VARCHAR(3) NOT NULL,
      merchant VARCHAR(100),
      description TEXT NOT NULL,
      reference VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL,
      completed_at TIMESTAMP,
      FOREIGN KEY (card_record_id) REFERENCES virtual_cards(id)
    );
  `
};
