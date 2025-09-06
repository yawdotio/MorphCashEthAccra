"use client";

import { useState } from "react";

import { useEnhancedAuth } from "~~/contexts/EnhancedAuthContext";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { CheckCircleIcon, EnvelopeIcon, UserIcon, WalletIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useAuth } from "~~/contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "register" | "ens" | "wallet";

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { loginWithEmail, loginWithENS, loginWithWallet, registerWithEmail } = useEnhancedAuth();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [ensName, setEnsName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (authMode === "register") {
<<<<<<< HEAD
        await registerWithEmail(email, password, displayName);
=======
        await registerWithEmail(email, password, password); // Using same password for confirm
>>>>>>> 35e7e38bd57cd5d92aea9a4b62d5f37a29e2a79b
      } else {
        await loginWithEmail(email, password, displayName);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose(); // Let Header handle the redirect
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
        onClose(); // Let Header handle the redirect
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
    if (isConnected && address) {
      try {
        setIsLoading(true);
        await loginWithWallet(address);
        setSuccess(true);
        setTimeout(() => {
          onClose(); // Let Header handle the redirect
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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setEnsName("");
    setError("");
    setSuccess(false);
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
  };

  const handleClose = () => {
    // Only redirect to home if not a successful login
    if (!success) {
      router.push("/");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-base-content/50 transition-opacity" onClick={handleClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-base-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-base-100 text-base-content/50 hover:text-base-content focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={handleClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
              <CheckCircleIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-base-content">
                {authMode === "login" && "Sign in to MorphCash"}
                {authMode === "register" && "Create your account"}
                {authMode === "ens" && "Sign in with ENS"}
                {authMode === "wallet" && "Connect Wallet"}
              </h3>

              <div className="mt-2">
                <p className="text-sm text-base-content/70">
                  {authMode === "login" && "Enter your email and password to access your account."}
                  {authMode === "register" && "Create a new account with your email and password."}
                  {authMode === "ens" && "Sign in using your ENS name."}
                  {authMode === "wallet" && "Connect your wallet to sign in to your account."}
                </p>
              </div>

              {/* Auth Method Tabs */}
              <div className="mt-4">
                <div className="flex space-x-1 rounded-lg bg-base-200 p-1">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      authMode === "login" || authMode === "register"
                        ? "bg-base-100 text-base-content shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("ens")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      authMode === "ens"
                        ? "bg-base-100 text-base-content shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    ENS
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("wallet")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      authMode === "wallet"
                        ? "bg-base-100 text-base-content shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    <WalletIcon className="h-4 w-4 inline mr-1" />
                    Wallet
                  </button>
                </div>
              </div>

              {/* Email/Password Form */}
              {(authMode === "login" || authMode === "register") && (
                <form onSubmit={handleEmailSubmit} className="mt-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-base-content">
                      Email Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="password" className="block text-sm font-medium text-base-content">
                      Password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="displayName" className="block text-sm font-medium text-base-content">
                      Display Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="displayName"
                        id="displayName"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        required
                        className="block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        placeholder="Enter your display name"
                      />
                    </div>
                    <p className="mt-1 text-xs text-base-content/70">
                      This name will be displayed throughout the app instead of your email
                    </p>
                  </div>

                  {authMode === "login" && (
                    <div className="mt-4 text-right">
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Don&apos;t have an account? Sign up
                      </button>
                    </div>
                  )}

                  {authMode === "register" && (
                    <div className="mt-4 text-right">
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Already have an account? Sign in
                      </button>
                    </div>
                  )}

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading || !email || !password || !displayName}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-content shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isLoading ? "Processing..." : authMode === "login" ? "Sign In" : "Sign Up"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-base-300 bg-base-100 px-4 py-2 text-base font-medium text-base-content shadow-sm hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* ENS Form */}
              {authMode === "ens" && (
                <form onSubmit={handleENSSubmit} className="mt-4">
                  <div>
                    <label htmlFor="ensName" className="block text-sm font-medium text-base-content">
                      ENS Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="ensName"
                        id="ensName"
                        value={ensName}
                        onChange={e => setEnsName(e.target.value)}
                        required
                        className="block w-full h-12 px-3 rounded-md border-base-300 bg-base-100 text-base-content shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        placeholder="Enter your ENS name (e.g., vitalik.eth)"
                      />
                    </div>
                    <p className="mt-1 text-xs text-base-content/70">
                      Don&apos;t have an ENS name yet?{" "}
                      <button
                        type="button"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open("https://app.ens.domains/", "_blank");
                        }}
                        className="text-primary hover:text-primary/80 underline"
                      >
                        Register one on the official ENS website
                      </button>
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading || !ensName}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-content shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isLoading ? "Processing..." : "Sign In with ENS"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-base-300 bg-base-100 px-4 py-2 text-base font-medium text-base-content shadow-sm hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Wallet Connection Form */}
              {authMode === "wallet" && (
                <div className="mt-4">
                  <div className="text-center">
                    <WalletIcon className="mx-auto h-12 w-12 text-base-content/50" />
                    <h3 className="mt-2 text-sm font-medium text-base-content">Connect Your Wallet</h3>
                    <p className="mt-1 text-sm text-base-content/70">Connect your wallet to sign in to your account.</p>
                  </div>

                  <div className="mt-6">
                    <RainbowKitCustomConnectButton />
                  </div>

                  {isConnected && address && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Wallet Connected</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Address: {address}</p>
                            <button
                              onClick={handleWalletConnect}
                              disabled={isLoading}
                              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? "Signing In..." : "Sign In with Wallet"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

              {success && (
                <div className="mt-3 text-sm text-green-600 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {authMode === "register" ? "Account created successfully!" : "Signed in successfully!"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
