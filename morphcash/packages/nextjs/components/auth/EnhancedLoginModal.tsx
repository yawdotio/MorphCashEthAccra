"use client";

import { useState, useEffect } from "react";
import { useEnhancedAuth } from "~~/contexts/EnhancedAuthContext";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "register" | "ens" | "wallet";

export const EnhancedLoginModal = ({ isOpen, onClose }: EnhancedLoginModalProps) => {
  const { loginWithEmail, loginWithENS, loginWithWallet, registerWithEmail } = useEnhancedAuth();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ensName, setEnsName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setEnsName("");
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        match: false
      });
    }
  }, [isOpen]);

  // Auto-connect wallet if available
  useEffect(() => {
    if (isConnected && address && authMode === "wallet") {
      handleWalletConnect();
    }
  }, [isConnected, address, authMode]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEnsName("");
    setError("");
    setSuccess(false);
    setPasswordValidation({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      match: false
    });
  };

  // Password validation effect
  useEffect(() => {
    if (authMode === "register") {
      setPasswordValidation({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        match: password === confirmPassword && password.length > 0
      });
    }
  }, [password, confirmPassword, authMode]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (authMode === "register") {
        // Client-side validation for registration
        if (!passwordValidation.length || !passwordValidation.uppercase || !passwordValidation.lowercase || !passwordValidation.number) {
          throw new Error("Please ensure your password meets all requirements");
        }
        if (!passwordValidation.match) {
          throw new Error("Passwords do not match");
        }
        await registerWithEmail(email, password, confirmPassword);
      } else {
        await loginWithEmail(email, password);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleENSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await loginWithENS(ensName);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    if (!isConnected) {
      try {
        await connect({ connector: connectors[0] });
      } catch (err) {
        setError("Failed to connect wallet");
      }
    } else if (address) {
      setIsLoading(true);
      setError("");

      try {
        await loginWithWallet(address);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          resetForm();
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setError("");
    } catch (err) {
      setError("Failed to disconnect wallet");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {authMode === "login" && "Welcome Back"}
              {authMode === "register" && "Create Account"}
              {authMode === "ens" && "ENS Login"}
              {authMode === "wallet" && "Wallet Connect"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Auth Mode Selector */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              {[
                { key: "login", label: "Login" },
                { key: "register", label: "Register" },
                { key: "ens", label: "ENS" },
                { key: "wallet", label: "Wallet" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => {
                    setAuthMode(mode.key as AuthMode);
                    setError("");
                    setSuccess(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    authMode === mode.key
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="text-green-800 text-sm">
                    {authMode === "register" ? "Account created successfully!" : "Login successful!"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-800 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email/Password Form */}
            {(authMode === "login" || authMode === "register") && (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (only for registration) */}
                {authMode === "register" && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Password Requirements (only for registration) */}
                {authMode === "register" && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center text-xs ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One uppercase letter
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One lowercase letter
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One number
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidation.match ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.match ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Passwords match
                      </div>
                    </div>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={
                    isLoading || 
                    (authMode === "register" && 
                      (!passwordValidation.length || !passwordValidation.uppercase || !passwordValidation.lowercase || !passwordValidation.number || !passwordValidation.match)
                    )
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {authMode === "register" ? "Creating Account..." : "Signing In..."}
                    </div>
                  ) : (
                    authMode === "register" ? "Create Account" : "Sign In"
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* ENS Form */}
            {authMode === "ens" && (
              <motion.form
                key="ens-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleENSSubmit}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="ensName" className="block text-sm font-medium text-gray-700 mb-1">
                    ENS Name
                  </label>
                  <input
                    type="text"
                    id="ensName"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your ENS name (e.g., vitalik.eth)"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In with ENS"
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Wallet Connect */}
            {authMode === "wallet" && (
              <motion.div
                key="wallet-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isConnected ? "Wallet Connected" : "Connect Your Wallet"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {isConnected 
                      ? `Connected to ${address?.slice(0, 6)}...${address?.slice(-4)}`
                      : "Connect your wallet to sign in securely"
                    }
                  </p>
                </div>

                {isConnected ? (
                  <div className="space-y-3">
                    <motion.button
                      onClick={handleWalletConnect}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        "Sign In with Wallet"
                      )}
                    </motion.button>
                    <motion.button
                      onClick={handleDisconnect}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                    >
                      Disconnect Wallet
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={handleWalletConnect}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Connect Wallet
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <a href="#" className="text-purple-600 hover:text-purple-700">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-purple-600 hover:text-purple-700">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
