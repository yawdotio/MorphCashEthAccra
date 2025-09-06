"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoginModal } from "./auth/LoginModal";
import { ArrowRightOnRectangleIcon, Bars3Icon, BugAntIcon, UserIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useAuth } from "~~/contexts/AuthContext";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Features",
    href: "/#features",
  },
  {
    label: "How It Works",
    href: "/#how-it-works",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const handleCloseLogin = () => {
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    logout();
  };

  // Close modal and redirect to dashboard when user successfully logs in
  useEffect(() => {
    if (user && user.isAuthenticated && showLoginModal) {
      setShowLoginModal(false);
      router.push("/dashboard");
    }
  }, [user, showLoginModal, router]);

  return (
    <>
      <div
        className="sticky top-0 z-50 navbar bg-base-100/80 backdrop-blur-md border-b border-base-300 min-h-0 flex-shrink-0 justify-between shadow-sm px-0 sm:px-2"
        style={{ position: "sticky" }}
      >
        <div className="navbar-start w-auto lg:w-1/2">
          <div className="lg:hidden dropdown" ref={burgerMenuRef}>
            <div
              tabIndex={0}
              className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
              onClick={() => {
                setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
              }}
            >
              <Bars3Icon className="h-1/2" />
            </div>
            {isDrawerOpen && (
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
                onClick={() => {
                  setIsDrawerOpen(false);
                }}
              >
                <HeaderMenuLinks />
              </ul>
            )}
          </div>
          <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
            <div className="flex relative w-8 h-8">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-primary-content font-bold text-sm">M</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold leading-tight text-lg text-base-content">MorphCash</span>
            </div>
          </Link>
          <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
            <HeaderMenuLinks />
          </ul>
        </div>
        <div className="navbar-end flex-grow mr-4">
          {user && user.isAuthenticated ? (
            <div className="flex items-center gap-2 mr-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-base-content/70">
                <UserIcon className="h-4 w-4" />
                <span>{user.ensName || user.email || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm hover:bg-error/10 hover:text-error transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn btn-ghost btn-sm mr-2 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
            >
              <UserIcon className="h-4 w-4 mr-1" />
              Log In
            </button>
          )}
          <RainbowKitCustomConnectButton />
          <FaucetButton />
        </div>
      </div>

      {/* Login Modal - Outside header div */}
      <LoginModal isOpen={showLoginModal} onClose={handleCloseLogin} />
    </>
  );
};
