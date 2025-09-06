"use client";

import { useState } from "react";
import { useEnhancedAuth } from "~~/contexts/EnhancedAuthContext";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { XMarkIcon, CheckCircleIcon, UserIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { verifyENSOwnership, isENSAvailable } from "~~/utils/ensVerification";
import { apiService } from "~~/services/backendService";
import { smartContractService } from "~~/services/smartContractService";

interface ENSRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ENSRegistration = ({ isOpen, onClose }: ENSRegistrationProps) => {
  const { registerWithEmail } = useEnhancedAuth();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [ensName, setEnsName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verificationStep, setVerificationStep] = useState<"input" | "verify" | "complete">("input");
  const [ensInfo, setEnsInfo] = useState<{
    isAvailable: boolean;
    isOwned: boolean;
    ownerAddress?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Step 1: Check if ENS name is available
      const isAvailable = await isENSAvailable(ensName);
      
      if (!isAvailable) {
        setError("This ENS name is not available for registration");
        return;
      }

      // Step 2: If wallet is connected, verify ownership
      if (isConnected && address) {
        const ownershipResult = await verifyENSOwnership(ensName, address);
        
        if (!ownershipResult.isValid) {
          setError(ownershipResult.error || "You don't own this ENS name. Please connect the wallet that owns it.");
          return;
        }

        setEnsInfo({
          isAvailable: true,
          isOwned: true,
          ownerAddress: address,
        });
      } else {
        // If no wallet connected, proceed with email-only registration
        setEnsInfo({
          isAvailable: true,
          isOwned: false,
        });
      }

      setVerificationStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Create user profile with backend service
      const userProfile = {
        ens_name: ensName.toLowerCase(),
        email: email.toLowerCase(),
        address: ensInfo?.ownerAddress,
        auth_method: "ens" as const,
        ens_profile: {
          displayName: ensName.split('.')[0], // Use ENS name as display name
          bio: `ENS profile for ${ensName}`,
          avatar: "",
          website: "",
          twitter: "",
          github: "",
          discord: "",
          telegram: "",
        },
      };

      const result = await apiService.createUser(userProfile);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create user profile");
      }

      // Store profile on smart contract if wallet is connected
      if (ensInfo?.isOwned && ensInfo.ownerAddress) {
        const contractResult = await smartContractService.createENSProfile(
          ensName,
          userProfile.ensProfile!,
          ensInfo.ownerAddress
        );

        if (!contractResult.success) {
          console.warn("Failed to store profile on smart contract:", contractResult.error);
          // Don't fail the registration, just log the warning
        }
      }

      // Store session
      const sessionResult = await apiService.createSession(result.data!.id);
      if (sessionResult.success) {
        localStorage.setItem("morphcash_session", JSON.stringify({
          sessionId: sessionResult.data!.sessionId,
          userId: result.data!.id,
          expiresAt: sessionResult.data!.expiresAt,
        }));
      }

      setVerificationStep("complete");
      setSuccess(true);
      
      setTimeout(() => {
        handleClose();
        setSuccess(false);
        setEnsName("");
        setEmail("");
        setVerificationStep("input");
        setEnsInfo(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/');
    onClose();
  };

  console.log("ENSRegistration render - isOpen:", isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 transition-opacity" onClick={handleClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {verificationStep === "input" && "Register ENS Name"}
                {verificationStep === "verify" && "Verify ENS Ownership"}
                {verificationStep === "complete" && "Registration Complete"}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {verificationStep === "input" && "Register your ENS name to use it for authentication. You'll need to provide an email for account recovery."}
                  {verificationStep === "verify" && "Please verify that you own this ENS name by connecting your wallet."}
                  {verificationStep === "complete" && "Your ENS name has been successfully registered!"}
                </p>
              </div>

              {verificationStep === "input" && (
                <form onSubmit={handleSubmit} className="mt-4">
                  <div>
                    <label htmlFor="ensName" className="block text-sm font-medium text-gray-700">
                      ENS Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="ensName"
                        id="ensName"
                        value={ensName}
                        onChange={(e) => setEnsName(e.target.value)}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        placeholder="Enter your ENS name (e.g., vitalik.eth)"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Make sure you own this ENS name on Ethereum.
                    </p>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address (for recovery)
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading || !ensName || !email}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isLoading ? "Verifying..." : "Verify ENS Name"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {verificationStep === "verify" && (
                <div className="mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">ENS Name Verified</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          ENS Name: <strong>{ensName}</strong>
                        </p>
                        {ensInfo?.isOwned && (
                          <p className="text-sm text-blue-700">
                            Owner: <strong>{ensInfo.ownerAddress}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      {ensInfo?.isOwned 
                        ? "Your wallet owns this ENS name. Click below to complete registration."
                        : "This ENS name is available. Click below to complete registration."
                      }
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={handleCompleteRegistration}
                      disabled={isLoading}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isLoading ? "Completing..." : "Complete Registration"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setVerificationStep("input")}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {verificationStep === "complete" && (
                <div className="mt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Registration Complete!</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your ENS name <strong>{ensName}</strong> has been successfully registered.
                        </p>
                        <p className="text-sm text-green-700">
                          You can now sign in using your ENS name.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-3 text-sm text-green-600 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  ENS name registered successfully! You can now sign in with it.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
