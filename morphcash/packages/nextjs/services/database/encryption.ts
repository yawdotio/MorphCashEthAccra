/**
 * Encryption Service
 * Handles encryption/decryption of sensitive data using wallet-derived keys
 */

import { Address } from 'viem';

export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: CryptoKey | null = null;
  private userAddress: Address | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
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
        salt: new TextEncoder().encode("morphcash-salt-v2"),
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
    if (this.userAddress === address && this.encryptionKey) {
      return; // Already initialized for this user
    }

    const signature = await this.requestSignature(address);
    this.encryptionKey = await this.generateUserKey(address, signature);
    this.userAddress = address;
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
   * Encrypt sensitive data for storage
   */
  async encryptSensitiveData(address: Address, data: any): Promise<string> {
    await this.initializeKey(address);
    const jsonString = JSON.stringify(data);
    return this.encrypt(jsonString);
  }

  /**
   * Decrypt sensitive data from storage
   */
  async decryptSensitiveData(address: Address, encryptedData: string): Promise<any> {
    await this.initializeKey(address);
    const decryptedString = await this.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  }

  /**
   * Clear encryption key (for logout)
   */
  clearKey(): void {
    this.encryptionKey = null;
    this.userAddress = null;
  }

  /**
   * Check if key is initialized for address
   */
  isInitialized(address: Address): boolean {
    return this.userAddress === address && this.encryptionKey !== null;
  }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance();
