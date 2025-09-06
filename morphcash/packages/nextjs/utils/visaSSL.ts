/**
 * Visa Two-Way SSL Authentication Utilities
 * Handles SSL certificate management for Visa API integration
 * Documentation: https://developer.visa.com/pages/working-with-visa-apis/two-way-ssl
 */

// Server-side only imports
const fs = typeof window === 'undefined' ? require('fs') : null;
const path = typeof window === 'undefined' ? require('path') : null;

export interface VisaSSLCredentials {
  privateKeyPath: string;
  clientCertPath: string;
  caCertPath: string;
  keyStorePath?: string;
  keyStorePassword?: string;
}

export interface VisaSSLConfig {
  credentials: VisaSSLCredentials;
  baseUrl: string;
  userId: string;
  password: string;
}

export class VisaSSLManager {
  private config: VisaSSLConfig;

  constructor(config: VisaSSLConfig) {
    this.config = config;
  }

  /**
   * Validate SSL certificate files exist
   */
  validateCertificates(): { valid: boolean; errors: string[] } {
    if (typeof window !== 'undefined') {
      return { valid: false, errors: ['SSL validation not available in browser'] };
    }

    const errors: string[] = [];

    // Check if certificate files exist
    if (!fs?.existsSync(this.config.credentials.privateKeyPath)) {
      errors.push(`Private key file not found: ${this.config.credentials.privateKeyPath}`);
    }

    if (!fs?.existsSync(this.config.credentials.clientCertPath)) {
      errors.push(`Client certificate file not found: ${this.config.credentials.clientCertPath}`);
    }

    if (!fs?.existsSync(this.config.credentials.caCertPath)) {
      errors.push(`CA certificate file not found: ${this.config.credentials.caCertPath}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get SSL configuration for HTTP requests
   */
  getSSLConfig() {
    if (typeof window !== 'undefined') {
      throw new Error('SSL configuration not available in browser');
    }

    return {
      key: fs?.readFileSync(this.config.credentials.privateKeyPath),
      cert: fs?.readFileSync(this.config.credentials.clientCertPath),
      ca: fs?.readFileSync(this.config.credentials.caCertPath),
      rejectUnauthorized: true
    };
  }

  /**
   * Get basic authentication header
   */
  getAuthHeader(): string {
    const authString = `${this.config.userId}:${this.config.password}`;
    return `Basic ${Buffer.from(authString).toString('base64')}`;
  }

  /**
   * Get request headers for Visa API
   */
  getRequestHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': this.getAuthHeader()
    };
  }

  /**
   * Create keystore from certificates (for Java applications)
   */
  async createKeystore(): Promise<{ success: boolean; keystorePath?: string; error?: string }> {
    if (typeof window !== 'undefined') {
      return { success: false, error: 'Keystore creation not available in browser' };
    }

    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const keystorePath = this.config.credentials.keyStorePath || 'visa-keystore.p12';
      const password = this.config.credentials.keyStorePassword || 'visa123';

      // Create PKCS12 keystore
      const command = `openssl pkcs12 -export -in "${this.config.credentials.clientCertPath}" -inkey "${this.config.credentials.privateKeyPath}" -certfile "${this.config.credentials.clientCertPath}" -out "${keystorePath}" -passout pass:${password}`;

      await execAsync(command);

      return {
        success: true,
        keystorePath
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create keystore'
      };
    }
  }

  /**
   * Convert certificates to different formats
   */
  async convertCertificates(): Promise<{ success: boolean; error?: string }> {
    if (typeof window !== 'undefined') {
      return { success: false, error: 'Certificate conversion not available in browser' };
    }

    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // Convert DigiCert CA certificate from DER to PEM format
      const digiCertCommand = `openssl x509 -inform der -in DigiCertGlobalRootCA.crt -outform pem -out DigiCertGlobalRootCA.pem`;
      await execAsync(digiCertCommand);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert certificates'
      };
    }
  }
}

/**
 * Create Visa SSL configuration from environment variables
 */
export function createVisaSSLConfig(): VisaSSLConfig {
  const credentials: VisaSSLCredentials = {
    privateKeyPath: process.env.VISA_PRIVATE_KEY_PATH || './certs/privateKey.pem',
    clientCertPath: process.env.VISA_CLIENT_CERT_PATH || './certs/cert.pem',
    caCertPath: process.env.VISA_CA_CERT_PATH || './certs/VDPCA-Sandbox.pem',
    keyStorePath: process.env.VISA_KEYSTORE_PATH || './certs/visa-keystore.p12',
    keyStorePassword: process.env.VISA_KEYSTORE_PASSWORD || 'visa123'
  };

  return {
    credentials,
    baseUrl: process.env.NEXT_PUBLIC_VISA_API_BASE_URL || 'https://sandbox.api.visa.com',
    userId: process.env.NEXT_PUBLIC_VISA_USER_ID || '',
    password: process.env.NEXT_PUBLIC_VISA_PASSWORD || ''
  };
}

/**
 * Download required certificates for Visa API
 */
export async function downloadVisaCertificates(): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    return { success: false, error: 'Certificate download not available in browser' };
  }

  try {
    const https = require('https');
    const fs = require('fs');
    const path = require('path');

    // Create certs directory if it doesn't exist
    const certsDir = './certs';
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }

    // Download DigiCert Global Root CA certificate
    const digiCertUrl = 'https://dl.cacerts.digicert.com/DigiCertGlobalRootCA.crt';
    const digiCertPath = path.join(certsDir, 'DigiCertGlobalRootCA.crt');

    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(digiCertPath);
      https.get(digiCertUrl, (response: any) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      }).on('error', (err: any) => {
        fs.unlink(digiCertPath, () => {});
        reject(err);
      });
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download certificates'
    };
  }
}

/**
 * Generate CSR (Certificate Signing Request) for Visa API
 */
export async function generateCSR(organizationInfo: {
  country: string;
  state: string;
  locality: string;
  organization: string;
  organizationalUnit: string;
  commonName: string;
  emailAddress: string;
}): Promise<{ success: boolean; csrPath?: string; privateKeyPath?: string; error?: string }> {
  if (typeof window !== 'undefined') {
    return { success: false, error: 'CSR generation not available in browser' };
  }

  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const certsDir = './certs';
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }

    const privateKeyPath = path.join(certsDir, 'privateKey.pem');
    const csrPath = path.join(certsDir, 'certreq.csr');

    // Create OpenSSL configuration file
    const configContent = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = ${organizationInfo.country}
ST = ${organizationInfo.state}
L = ${organizationInfo.locality}
O = ${organizationInfo.organization}
OU = ${organizationInfo.organizationalUnit}
CN = ${organizationInfo.commonName}
emailAddress = ${organizationInfo.emailAddress}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${organizationInfo.commonName}
`;

    const configPath = path.join(certsDir, 'openssl.conf');
    fs.writeFileSync(configPath, configContent);

    // Generate CSR and private key
    const command = `openssl req -new -keyout "${privateKeyPath}" -out "${csrPath}" -config "${configPath}" -passout pass:visa123`;
    await execAsync(command);

    return {
      success: true,
      csrPath,
      privateKeyPath
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate CSR'
    };
  }
}

