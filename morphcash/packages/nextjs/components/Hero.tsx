"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-base-content mb-6">
            Digital Cash Access Made for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Africa</span>
          </h1>
          <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Send money, receive payments, and access digital cash easily with virtual cards that work everywhere. Fund
            your account through bank transfer, mobile money, or cryptocurrency.
          </p>

          {/* Fee Information */}
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto border border-base-300/20 shadow-lg">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-success to-success rounded-full flex items-center justify-center mr-3">
                <span className="text-success-content font-bold text-sm">₵</span>
              </div>
              <h3 className="text-lg font-semibold text-base-content">Transparent Pricing</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Only pay a <span className="font-semibold text-success">0.02% fee</span> when funding your virtual cards
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-base-content">₵100</div>
                <div className="text-base-content/60">funding</div>
                <div className="text-success font-medium">₵0.02 fee</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-base-content">₵1,000</div>
                <div className="text-base-content/60">funding</div>
                <div className="text-success font-medium">₵0.20 fee</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-base-content">₵10,000</div>
                <div className="text-base-content/60">funding</div>
                <div className="text-success font-medium">₵2.00 fee</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-content font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center px-8 py-4 bg-base-100 text-base-content font-semibold rounded-xl border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
