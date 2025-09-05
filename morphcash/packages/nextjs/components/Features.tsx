"use client";

import { CreditCardIcon, ShieldCheckIcon, BanknotesIcon, ChartBarIcon, DevicePhoneMobileIcon, UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

const features = [
  {
    name: "Virtual Debit Cards",
    description: "Get instant virtual cards for seamless online shopping and ATM withdrawals worldwide.",
    icon: CreditCardIcon,
  },
  {
    name: "Multiple Funding Options",
    description: "Fund your account via bank transfer, mobile money, or cryptocurrency.",
    icon: BanknotesIcon,
  },
  {
    name: "Secure Transactions",
    description: "PIN verification for all transactions with advanced encryption technology.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Instant Transfers",
    description: "Send money to friends and family instantly, regardless of their bank.",
    icon: BanknotesIcon,
  },
  {
    name: "Financial Dashboard",
    description: "Track your spending, view transaction history, and manage your finances.",
    icon: ChartBarIcon,
  },
  {
    name: "User-Friendly Interface",
    description: "Intuitive design that makes digital banking accessible to everyone.",
    icon: DevicePhoneMobileIcon,
  },
  {
    name: "Ultra-Low Fees",
    description: "Only 0.02% fee when funding virtual cards - one of the lowest rates in Africa.",
    icon: CurrencyDollarIcon,
  },
];

export const Features = () => {
  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Morph Cash
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of digital banking in Africa
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative group p-8 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
