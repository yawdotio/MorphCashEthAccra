"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Digital Cash Access Made for{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Africa
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Send money, receive payments, and access digital cash easily with virtual cards that work everywhere. 
            Fund your account through bank transfer, mobile money, or cryptocurrency.
          </p>
          
          {/* Fee Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto border border-white/20 shadow-lg">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">₵</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Transparent Pricing</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Only pay a <span className="font-semibold text-green-600">0.02% fee</span> when funding your virtual cards
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">₵100</div>
                <div className="text-gray-500">funding</div>
                <div className="text-green-600 font-medium">₵0.02 fee</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">₵1,000</div>
                <div className="text-gray-500">funding</div>
                <div className="text-green-600 font-medium">₵0.20 fee</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">₵10,000</div>
                <div className="text-gray-500">funding</div>
                <div className="text-green-600 font-medium">₵2.00 fee</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 group"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
