"use client";

const testimonials = [
  {
    content:
      "Morph Cash has revolutionized how I receive payments from my international clients. The virtual card makes it so easy to access my funds anywhere.",
    author: "Adeola Johnson",
    role: "Freelance Designer, Nigeria",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
  },
  {
    content:
      "I love how I can easily fund my account using M-Pesa. The transaction fees are much lower than traditional banks, and transfers are instant.",
    author: "James Mwangi",
    role: "Small Business Owner, Kenya",
    avatar:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
  },
  {
    content:
      "As a student studying abroad, Morph Cash has made it incredibly easy for my parents to send me money. It's safe and always reliable.",
    author: "Fatima Diallo",
    role: "Student, Senegal",
    avatar:
      "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
  },
];

export const Testimonials = () => {
  return (
    <div className="py-24 bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-base-content mb-4">What Our Users Say</h2>
          <p className="text-xl text-base-content/70">Join thousands of satisfied customers across Africa</p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 bg-base-200 rounded-2xl border border-base-300 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center mb-6">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={testimonial.avatar}
                    alt={testimonial.author}
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-base-content">{testimonial.author}</h4>
                    <p className="text-sm text-base-content/70">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-base-content/80 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
