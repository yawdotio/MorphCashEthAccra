"use client";

import { useAuth } from "~~/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { LoginModal } from "./LoginModal";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAuthenticated)) {
      // Show login modal if not authenticated
      setShowLoginModal(true);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.isAuthenticated) {
    return (
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          router.push('/');
          setShowLoginModal(false);
        }}
      />
    );
  }

  return <>{children}</>;
};
