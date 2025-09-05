import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes, NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";
import { Address } from "viem";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

// Types for secure storage
export interface CreditCardData {
  id: string;
  cardNumber: string; // Full card number (encrypted)
  cvv: string; // CVV (encrypted)
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  brand: string; // Visa, Mastercard, etc.
  last4: string; // Last 4 digits for display
  isDefault: boolean;
  createdAt: string;
}

export interface BankAccountData {
  id: string;
  accountNumber: string; // Encrypted
  routingNumber: string; // Encrypted
  accountType: string; // Checking, Savings
  bankName: string;
  accountHolderName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string; // Encrypted
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
}

type GlobalState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  
  // Secure storage state
  secureData: {
    creditCards: CreditCardData[];
    bankAccounts: BankAccountData[];
    personalInfo: PersonalInfoData | null;
  };
  setCreditCards: (cards: CreditCardData[]) => void;
  setBankAccounts: (accounts: BankAccountData[]) => void;
  setPersonalInfo: (info: PersonalInfoData | null) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrency: {
    price: 0,
    isFetching: true,
  },
  setNativeCurrencyPrice: (newValue: number): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
  setIsNativeCurrencyFetching: (newValue: boolean): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
  targetNetwork: {
    ...scaffoldConfig.targetNetworks[0],
    ...NETWORKS_EXTRA_DATA[scaffoldConfig.targetNetworks[0].id],
  },
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
  
  // Secure storage state
  secureData: {
    creditCards: [],
    bankAccounts: [],
    personalInfo: null,
  },
  setCreditCards: (cards: CreditCardData[]): void =>
    set(state => ({ secureData: { ...state.secureData, creditCards: cards } })),
  setBankAccounts: (accounts: BankAccountData[]): void =>
    set(state => ({ secureData: { ...state.secureData, bankAccounts: accounts } })),
  setPersonalInfo: (info: PersonalInfoData | null): void =>
    set(state => ({ secureData: { ...state.secureData, personalInfo: info } })),
}));

/**
 * Secure Storage Service
 * Handles encryption/decryption of sensitive user data using wallet-derived keys
 */
export class SecureStorageService {
  private static instance: SecureStorageService;
  private encryptionKey: CryptoKey | null = null;

  private constructor() {}

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Generate encryption key from wallet signature
   */
  private async generateUserKey(address: Address, signature: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(signature + address),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("morphcash-salt-v1"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Request signature from user for key generation
   */
  private async requestSignature(address: Address): Promise<string> {
    const message = `MorphCash authentication for ${address} - ${Date.now()}`;
    
    // This would integrate with your wallet connection
    // For now, we'll use a mock signature
    return `0x${Buffer.from(message).toString('hex')}`;
  }

  /**
   * Initialize encryption key for user
   */
  async initializeKey(address: Address): Promise<void> {
    const signature = await this.requestSignature(address);
    this.encryptionKey = await this.generateUserKey(address, signature);
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error("Encryption key not initialized");
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      this.encryptionKey,
      encodedData
    );

    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...result));
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error("Encryption key not initialized");
    }

    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      this.encryptionKey,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Store credit card data securely
   */
  async storeCreditCard(address: Address, cardData: Omit<CreditCardData, 'id' | 'createdAt'>): Promise<CreditCardData> {
    if (!this.encryptionKey) {
      await this.initializeKey(address);
    }

    const encryptedCard: CreditCardData = {
      ...cardData,
      id: crypto.randomUUID(),
      cardNumber: await this.encrypt(cardData.cardNumber),
      cvv: await this.encrypt(cardData.cvv),
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage (in production, this would be a secure database)
    const existingCards = this.getStoredCreditCards(address);
    existingCards.push(encryptedCard);
    localStorage.setItem(`morphcash_cards_${address}`, JSON.stringify(existingCards));

    return encryptedCard;
  }

  /**
   * Get credit cards for user
   */
  async getCreditCards(address: Address): Promise<CreditCardData[]> {
    if (!this.encryptionKey) {
      await this.initializeKey(address);
    }

    const encryptedCards = this.getStoredCreditCards(address);
    const decryptedCards: CreditCardData[] = [];

    for (const card of encryptedCards) {
      try {
        const decryptedCard: CreditCardData = {
          ...card,
          cardNumber: await this.decrypt(card.cardNumber),
          cvv: await this.decrypt(card.cvv),
        };
        decryptedCards.push(decryptedCard);
      } catch (error) {
        console.error("Error decrypting card:", error);
      }
    }

    return decryptedCards;
  }

  /**
   * Get stored credit cards from localStorage
   */
  private getStoredCreditCards(address: Address): CreditCardData[] {
    const stored = localStorage.getItem(`morphcash_cards_${address}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Remove credit card
   */
  async removeCreditCard(address: Address, cardId: string): Promise<void> {
    const cards = this.getStoredCreditCards(address);
    const filteredCards = cards.filter(card => card.id !== cardId);
    localStorage.setItem(`morphcash_cards_${address}`, JSON.stringify(filteredCards));
  }

  /**
   * Clear all user data
   */
  clearUserData(address: Address): void {
    localStorage.removeItem(`morphcash_cards_${address}`);
    localStorage.removeItem(`morphcash_banks_${address}`);
    localStorage.removeItem(`morphcash_personal_${address}`);
    this.encryptionKey = null;
  }
}

// Export singleton instance
export const secureStorage = SecureStorageService.getInstance();
