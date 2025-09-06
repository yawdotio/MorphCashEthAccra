"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="mx-auto max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6"
          >
            Digital Cash Access Made for{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              Africa
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Send money, receive payments, and access digital cash easily with virtual cards that work everywhere. 
            Fund your account through bank transfer, mobile money, or cryptocurrency.
          </motion.p>
          
          {/* Fee Information */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto border border-white/20 shadow-lg"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
              className="flex items-center justify-center mb-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">₵</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Transparent Pricing</h3>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              className="text-gray-600 mb-4"
            >
              Only pay a <span className="font-semibold text-green-600">0.02% fee</span> when funding your virtual cards
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm"
            >
              {[
                { amount: "₵100", fee: "₵0.02" },
                { amount: "₵1,000", fee: "₵0.20" },
                { amount: "₵10,000", fee: "₵2.00" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 + index * 0.1, ease: "easeOut" }}
                  className="text-center"
                >
                  <div className="font-semibold text-gray-900">{item.amount}</div>
                  <div className="text-gray-500">funding</div>
                  <div className="text-green-600 font-medium">{item.fee} fee</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href="#features"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
