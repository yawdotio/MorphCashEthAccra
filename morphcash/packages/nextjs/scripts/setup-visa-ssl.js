#!/usr/bin/env node

/**
 * Visa SSL Certificate Setup Script
 * Automates the setup of Two-Way SSL certificates for Visa API integration
 * Documentation: https://developer.visa.com/pages/working-with-visa-apis/two-way-ssl
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class VisaSSLCertificateManager {
  constructor() {
    this.certsDir = './certs';
    this.ensureCertsDirectory();
  }

  ensureCertsDirectory() {
    if (!fs.existsSync(this.certsDir)) {
      fs.mkdirSync(this.certsDir, { recursive: true });
      console.log('✅ Created certs directory');
    }
  }

  async downloadDigiCertCA() {
    console.log('📥 Downloading DigiCert Global Root CA certificate...');
    
    const digiCertUrl = 'https://dl.cacerts.digicert.com/DigiCertGlobalRootCA.crt';
    const digiCertPath = path.join(this.certsDir, 'DigiCertGlobalRootCA.crt');
    const digiCertPemPath = path.join(this.certsDir, 'DigiCertGlobalRootCA.pem');

    try {
      // Download certificate
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(digiCertPath);
        https.get(digiCertUrl, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(true);
          });
        }).on('error', (err) => {
          fs.unlink(digiCertPath, () => {});
          reject(err);
        });
      });

      // Convert from DER to PEM format
      const convertCommand = `openssl x509 -inform der -in "${digiCertPath}" -outform pem -out "${digiCertPemPath}"`;
      await execAsync(convertCommand);

      console.log('✅ DigiCert Global Root CA certificate downloaded and converted');
      return digiCertPemPath;
    } catch (error) {
      console.error('❌ Failed to download DigiCert certificate:', error.message);
      throw error;
    }
  }

  async generateCSR(organizationInfo) {
    console.log('🔐 Generating Certificate Signing Request (CSR)...');

    const privateKeyPath = path.join(this.certsDir, 'privateKey.pem');
    const csrPath = path.join(this.certsDir, 'certreq.csr');

    try {
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

      const configPath = path.join(this.certsDir, 'openssl.conf');
      fs.writeFileSync(configPath, configContent);

      // Generate CSR and private key
      const command = `openssl req -new -keyout "${privateKeyPath}" -out "${csrPath}" -config "${configPath}" -passout pass:visa123`;
      await execAsync(command);

      console.log('✅ CSR and private key generated');
      console.log(`   Private Key: ${privateKeyPath}`);
      console.log(`   CSR: ${csrPath}`);
      
      return { privateKeyPath, csrPath };
    } catch (error) {
      console.error('❌ Failed to generate CSR:', error.message);
      throw error;
    }
  }

  async createKeystore(privateKeyPath, clientCertPath, caCertPath) {
    console.log('🔑 Creating keystore...');

    const keystorePath = path.join(this.certsDir, 'visa-keystore.p12');
    const keystorePassword = 'visa123';

    try {
      // Create PKCS12 keystore
      const command = `openssl pkcs12 -export -in "${clientCertPath}" -inkey "${privateKeyPath}" -certfile "${clientCertPath}" -out "${keystorePath}" -passout pass:${keystorePassword}`;
      await execAsync(command);

      console.log('✅ PKCS12 keystore created');
      console.log(`   Keystore: ${keystorePath}`);
      console.log(`   Password: ${keystorePassword}`);

      return { keystorePath, keystorePassword };
    } catch (error) {
      console.error('❌ Failed to create keystore:', error.message);
      throw error;
    }
  }

  async createJavaKeystore(p12Path, password) {
    console.log('☕ Creating Java KeyStore (JKS)...');

    const jksPath = path.join(this.certsDir, 'visa-keystore.jks');

    try {
      // Convert PKCS12 to JKS
      const command = `keytool -importkeystore -srckeystore "${p12Path}" -srcstoretype PKCS12 -destkeystore "${jksPath}" -deststoretype JKS -srcstorepass ${password} -deststorepass ${password}`;
      await execAsync(command);

      console.log('✅ Java KeyStore created');
      console.log(`   JKS: ${jksPath}`);
      console.log(`   Password: ${password}`);

      return jksPath;
    } catch (error) {
      console.error('❌ Failed to create Java KeyStore:', error.message);
      throw error;
    }
  }

  generateEnvironmentTemplate() {
    const envTemplate = `# Visa SSL Certificate Configuration
VISA_PRIVATE_KEY_PATH=./certs/privateKey.pem
VISA_CLIENT_CERT_PATH=./certs/cert.pem
VISA_CA_CERT_PATH=./certs/VDPCA-Sandbox.pem
VISA_KEYSTORE_PATH=./certs/visa-keystore.p12
VISA_KEYSTORE_PASSWORD=visa123

# Visa API Configuration
NEXT_PUBLIC_VISA_API_BASE_URL=https://sandbox.api.visa.com
NEXT_PUBLIC_VISA_USER_ID=your-visa-user-id
NEXT_PUBLIC_VISA_PASSWORD=your-visa-password
NEXT_PUBLIC_VISA_CLIENT_ID=your-visa-client-id
NEXT_PUBLIC_VISA_BUYER_ID=your-visa-buyer-id
NEXT_PUBLIC_VISA_PROXY_POOL_ID=your-visa-proxy-pool-id
`;

    const envPath = path.join(this.certsDir, '.env.visa.template');
    fs.writeFileSync(envPath, envTemplate);
    console.log(`✅ Environment template created: ${envPath}`);
  }

  printInstructions() {
    console.log('\n📋 Next Steps:');
    console.log('1. Submit the CSR (certreq.csr) to Visa Developer Portal');
    console.log('2. Download the client certificate from Visa');
    console.log('3. Download the VDP CA certificate from Visa');
    console.log('4. Place the certificates in the certs/ directory:');
    console.log('   - cert.pem (client certificate)');
    console.log('   - VDPCA-Sandbox.pem (VDP CA certificate)');
    console.log('5. Update your .env.local with the certificate paths');
    console.log('6. Test the connection using the Visa Card Test component');
  }
}

async function main() {
  console.log('🚀 Visa SSL Certificate Setup');
  console.log('==============================\n');

  const manager = new VisaSSLCertificateManager();

  try {
    // Download DigiCert CA certificate
    await manager.downloadDigiCertCA();

    // Get organization information
    const organizationInfo = {
      country: 'US',
      state: 'California',
      locality: 'San Francisco',
      organization: 'MorphCash',
      organizationalUnit: 'Development',
      commonName: 'morphcash.visa',
      emailAddress: 'dev@morphcash.com'
    };

    // Generate CSR
    const { privateKeyPath, csrPath } = await manager.generateCSR(organizationInfo);

    // Generate environment template
    manager.generateEnvironmentTemplate();

    // Print instructions
    manager.printInstructions();

    console.log('\n✅ SSL certificate setup completed!');
    console.log('\n📁 Files created:');
    console.log(`   - ${path.join(manager.certsDir, 'DigiCertGlobalRootCA.pem')}`);
    console.log(`   - ${privateKeyPath}`);
    console.log(`   - ${csrPath}`);
    console.log(`   - ${path.join(manager.certsDir, '.env.visa.template')}`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = VisaSSLCertificateManager;

