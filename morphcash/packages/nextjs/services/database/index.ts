/**
 * Database Service Exports
 * Centralized export for all database-related functionality
 */

export { default as DatabaseService } from './database';
export { encryptionService } from './encryption';
export * from './types';

// Database configuration
export interface DatabaseConfig {
  url: string;
  apiKey: string;
  projectId?: string;
  region?: string;
  encryptionKey: string;
}

// Initialize database service
export const createDatabaseService = (config: DatabaseConfig) => {
  return new DatabaseService(config);
};

// Default configuration (will be overridden by environment variables)
export const defaultDatabaseConfig: DatabaseConfig = {
  url: process.env.NEXT_PUBLIC_DATABASE_URL || 'http://localhost:3001/api',
  apiKey: process.env.NEXT_PUBLIC_DATABASE_API_KEY || 'demo-key',
  projectId: process.env.NEXT_PUBLIC_DATABASE_PROJECT_ID,
  region: process.env.NEXT_PUBLIC_DATABASE_REGION || 'us-east-1',
  encryptionKey: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'demo-encryption-key',
};
