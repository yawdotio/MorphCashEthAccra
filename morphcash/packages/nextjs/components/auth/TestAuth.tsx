"use client";

import { useState } from "react";
import { useEnhancedAuth } from "~~/contexts/EnhancedAuthContext";
import { motion } from "framer-motion";

export const TestAuth = () => {
  const { user, loginWithEmail, registerWithEmail, logout } = useEnhancedAuth();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      await registerWithEmail(email, password, password); // Using same password for confirm
      setMessage("Registration successful!");
    } catch (error) {
      setMessage(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      await loginWithEmail(email, password);
      setMessage("Login successful!");
    } catch (error) {
      setMessage(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMessage("Logged out successfully!");
    } catch (error) {
      setMessage(`Logout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Auth Test</h2>
      
      {user?.isAuthenticated ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">Logged In</h3>
            <p className="text-green-700">
              User ID: {user.id}
            </p>
            <p className="text-green-700">
              Email: {user.email || "N/A"}
            </p>
            <p className="text-green-700">
              Auth Method: {user.authMethod}
            </p>
          </div>
          
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              onClick={handleRegister}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Loading..." : "Register"}
            </motion.button>
            
            <motion.button
              onClick={handleLogin}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Loading..." : "Login"}
            </motion.button>
          </div>
        </div>
      )}
      
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg ${
            message.includes("successful") 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message}
        </motion.div>
      )}
    </motion.div>
  );
};
