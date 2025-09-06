/**
 * Database Configuration
 * Centralized configuration for database connections and settings
 */

export interface DatabaseConfig {
  // Database connection
  url: string;
  apiKey: string;
  projectId?: string;
  region?: string;
  
  // Encryption
  encryptionKey: string;
  
  // Caching
  enableCaching: boolean;
  cacheTimeout: number; // in milliseconds
  
  // Features
  enableAnalytics: boolean;
  enableRealTime: boolean;
}

// Environment-based configuration
export const getDatabaseConfig = (): DatabaseConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    // Database connection
    url: process.env.NEXT_PUBLIC_DATABASE_URL || 'http://localhost:3001/api',
    apiKey: process.env.NEXT_PUBLIC_DATABASE_API_KEY || 'demo-key',
    projectId: process.env.NEXT_PUBLIC_DATABASE_PROJECT_ID,
    region: process.env.NEXT_PUBLIC_DATABASE_REGION || 'us-east-1',
    
    // Encryption
    encryptionKey: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'demo-encryption-key-change-in-production',
    
    // Caching
    enableCaching: process.env.NEXT_PUBLIC_ENABLE_CACHING !== 'false',
    cacheTimeout: parseInt(process.env.NEXT_PUBLIC_CACHE_TIMEOUT || '300000'), // 5 minutes
    
    // Features
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
    enableRealTime: process.env.NEXT_PUBLIC_ENABLE_REALTIME !== 'false',
  };
};

// Database service URLs for different providers
export const DATABASE_PROVIDERS = {
  SUPABASE: {
    name: 'Supabase',
    url: 'https://your-project.supabase.co',
    features: ['PostgreSQL', 'Real-time', 'Auth', 'Storage'],
    setupUrl: 'https://supabase.com',
  },
  PLANETSCALE: {
    name: 'PlanetScale',
    url: 'https://your-database.planetscale.com',
    features: ['MySQL', 'Serverless', 'Branching'],
    setupUrl: 'https://planetscale.com',
  },
  MONGODB: {
    name: 'MongoDB Atlas',
    url: 'https://your-cluster.mongodb.net',
    features: ['NoSQL', 'Document-based', 'Flexible Schema'],
    setupUrl: 'https://mongodb.com/atlas',
  },
  FIREBASE: {
    name: 'Firebase',
    url: 'https://your-project.firebaseio.com',
    features: ['NoSQL', 'Real-time', 'Auth', 'Storage'],
    setupUrl: 'https://firebase.google.com',
  },
} as const;

// Required environment variables
export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_DATABASE_URL',
  'NEXT_PUBLIC_DATABASE_API_KEY',
  'NEXT_PUBLIC_ENCRYPTION_KEY',
] as const;

// Optional environment variables
export const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_DATABASE_PROJECT_ID',
  'NEXT_PUBLIC_DATABASE_REGION',
  'NEXT_PUBLIC_ENABLE_CACHING',
  'NEXT_PUBLIC_CACHE_TIMEOUT',
  'NEXT_PUBLIC_ENABLE_ANALYTICS',
  'NEXT_PUBLIC_ENABLE_REALTIME',
] as const;

// Validate configuration
export const validateDatabaseConfig = (config: DatabaseConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.url) {
    errors.push('Database URL is required');
  }
  
  if (!config.apiKey) {
    errors.push('Database API key is required');
  }
  
  if (!config.encryptionKey || config.encryptionKey === 'demo-encryption-key-change-in-production') {
    errors.push('Encryption key must be set to a secure value');
  }
  
  if (config.cacheTimeout < 1000) {
    errors.push('Cache timeout must be at least 1000ms');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get database provider info
export const getDatabaseProvider = (url: string): string => {
  if (url.includes('supabase.co')) return 'Supabase';
  if (url.includes('planetscale.com')) return 'PlanetScale';
  if (url.includes('mongodb.net')) return 'MongoDB Atlas';
  if (url.includes('firebaseio.com')) return 'Firebase';
  return 'Custom';
};
