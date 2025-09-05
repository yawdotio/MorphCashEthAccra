"use client";

const steps = [
  {
    step: "1",
    title: "Create Account",
    description: "Sign up with your email and verify your identity to create your Morph Cash account",
  },
  {
    step: "2", 
    title: "Fund Your Account",
    description: "Add money via bank transfer, mobile money, or cryptocurrency deposit",
  },
  {
    step: "3",
    title: "Get Virtual Card", 
    description: "Generate your virtual debit card instantly with just a 0.02% funding fee",
  },
  {
    step: "4",
    title: "Start Transacting",
    description: "Send money, make payments, and withdraw cash at ATMs across Africa and beyond",
  },
];

export const HowItWorks = () => {
  return (
    <div id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Morph Cash Works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in just a few simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 transform translate-x-1/2 w-full">
                  <div className="h-px bg-gradient-to-r from-purple-300 to-blue-300 w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
