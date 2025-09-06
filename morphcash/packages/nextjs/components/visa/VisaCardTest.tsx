"use client";

import { useState, useEffect } from "react";
import { visaCardIntegration, CardCreationRequest } from "~~/services/visaCardIntegration";
import { visaService } from "~~/services/visaService";
import { motion } from "framer-motion";

export const VisaCardTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cardData, setCardData] = useState<any>(null);
  const [sslStatus, setSslStatus] = useState<{
    configured: boolean;
    errors: string[];
  }>({ configured: false, errors: [] });

  const [formData, setFormData] = useState({
    cardName: "Test Visa Card",
    spendingLimit: 1000,
    paymentMethod: "momo" as "momo" | "crypto",
    paymentReference: "",
    paymentAmount: 50,
    paymentCurrency: "USD"
  });

  // Check SSL configuration on component mount
  useEffect(() => {
    const checkSSLStatus = () => {
      const configured = visaService.isConfigured();
      const errors = visaService.getSSLValidationErrors();
      setSslStatus({ configured, errors });
    };

    checkSSLStatus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'spendingLimit' || name === 'paymentAmount' ? Number(value) : value
    }));
  };

  const generatePaymentReference = () => {
    const prefix = formData.paymentMethod === 'momo' ? 'momo_' : 'crypto_';
    const reference = prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setFormData(prev => ({ ...prev, paymentReference: reference }));
  };

  const handleCreateCard = async () => {
    if (!formData.paymentReference) {
      setMessage("Please generate a payment reference first");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setCardData(null);

    try {
      const request: CardCreationRequest = {
        userId: "test-user-id", // In production, get from auth context
        cardName: formData.cardName,
        spendingLimit: formData.spendingLimit,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference,
        paymentAmount: formData.paymentAmount,
        paymentCurrency: formData.paymentCurrency,
        authorizationControls: {
          merchantCategoryCodes: [],
          transactionLimits: {
            daily: 500,
            monthly: 5000,
            perTransaction: 1000
          }
        }
      };

      const result = await visaCardIntegration.createVirtualCard(request);

      if (result.success && result.data) {
        setCardData(result.data);
        setMessage("Card created successfully!");
      } else {
        setMessage(`Card creation failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPayment = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // Test payment verification
      const response = await fetch(`/api/payments/verify-${formData.paymentMethod}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: formData.paymentReference,
          amount: formData.paymentAmount,
          currency: formData.paymentCurrency
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Payment verified successfully!");
      } else {
        setMessage(`Payment verification failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Payment verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Visa Card Integration Test</h2>
      
      {/* SSL Status Display */}
      <div className={`p-4 rounded-lg mb-6 ${
        sslStatus.configured 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            sslStatus.configured ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <h3 className={`font-semibold ${
            sslStatus.configured ? 'text-green-800' : 'text-red-800'
          }`}>
            SSL Configuration Status
          </h3>
        </div>
        {sslStatus.configured ? (
          <p className="text-green-700 text-sm">✅ Two-Way SSL is properly configured</p>
        ) : (
          <div>
            <p className="text-red-700 text-sm mb-2">❌ SSL configuration issues detected:</p>
            <ul className="text-red-600 text-sm list-disc list-inside">
              {sslStatus.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <p className="text-red-600 text-sm mt-2">
              Please run <code className="bg-red-100 px-1 rounded">node scripts/setup-visa-ssl.js</code> to set up certificates.
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Card Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Name
            </label>
            <input
              type="text"
              name="cardName"
              value={formData.cardName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spending Limit (USD)
            </label>
            <input
              type="number"
              name="spendingLimit"
              value={formData.spendingLimit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="momo">Mobile Money</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (USD)
            </label>
            <input
              type="number"
              name="paymentAmount"
              value={formData.paymentAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Reference
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="paymentReference"
                value={formData.paymentReference}
                onChange={handleInputChange}
                placeholder="Generate payment reference"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <motion.button
                onClick={generatePaymentReference}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate
              </motion.button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <motion.button
            onClick={handleTestPayment}
            disabled={isLoading || !formData.paymentReference}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Testing..." : "Test Payment"}
          </motion.button>

          <motion.button
            onClick={handleCreateCard}
            disabled={isLoading || !formData.paymentReference}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Creating..." : "Create Visa Card"}
          </motion.button>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              message.includes("successfully") || message.includes("verified")
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Card Data Display */}
        {cardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-3">Created Card Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Card ID:</span> {cardData.cardId}
              </div>
              <div>
                <span className="font-medium">Visa Account ID:</span> {cardData.visaAccountId}
              </div>
              <div>
                <span className="font-medium">Card Number:</span> {cardData.cardNumber}
              </div>
              <div>
                <span className="font-medium">Expiry Date:</span> {cardData.expiryDate}
              </div>
              <div>
                <span className="font-medium">CVV:</span> {cardData.cvv}
              </div>
              <div>
                <span className="font-medium">Cardholder Name:</span> {cardData.cardholderName}
              </div>
              <div>
                <span className="font-medium">Spending Limit:</span> ${cardData.spendingLimit}
              </div>
              <div>
                <span className="font-medium">Currency:</span> {cardData.currency}
              </div>
              <div>
                <span className="font-medium">Status:</span> {cardData.status}
              </div>
              <div>
                <span className="font-medium">Created At:</span> {new Date(cardData.createdAt).toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Test Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Fill in the card details above</li>
            <li>2. Generate a payment reference</li>
            <li>3. Test payment verification first</li>
            <li>4. Create the Visa card</li>
            <li>5. Check the card details in the response</li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
};
