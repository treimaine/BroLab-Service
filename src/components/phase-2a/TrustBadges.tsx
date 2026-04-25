'use client';

import { useState } from 'react';

interface Badge {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  category: 'payment' | 'compliance' | 'support';
}

const badges: Badge[] = [
  {
    id: 'stripe',
    category: 'payment',
    icon: (
      <svg
        className="w-8 h-8 md:w-10 md:h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8m-4-4h8" />
      </svg>
    ),
    title: 'Stripe Certified',
    description: 'Industry-leading payment processing',
  },
  {
    id: 'ssl',
    category: 'payment',
    icon: (
      <svg
        className="w-8 h-8 md:w-10 md:h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'SSL Encrypted',
    description: 'Secure data transmission',
  },
  {
    id: 'gdpr',
    category: 'compliance',
    icon: (
      <svg
        className="w-8 h-8 md:w-10 md:h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    title: 'GDPR Compliant',
    description: 'Your data is protected',
  },
  {
    id: 'privacy',
    category: 'compliance',
    icon: (
      <svg
        className="w-8 h-8 md:w-10 md:h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: 'Data Privacy',
    description: 'Your information stays private',
  },
  {
    id: 'support',
    category: 'support',
    icon: (
      <svg
        className="w-8 h-8 md:w-10 md:h-10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: '24/7 Support',
    description: "We're always here to help",
  },
];

export function TrustBadges() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      className="py-12 md:py-16 lg:py-20 px-4 md:px-8 bg-slate-900/50"
      aria-label="Trust and security badges"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            Your Trust Matters
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Built with the highest security and compliance standards
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <div
              key={badge.id}
              className="animate-fade-in opacity-0"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.08}s both`,
              }}
            >
              <button
                onMouseEnter={() => setHoveredId(badge.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`w-full h-full p-5 md:p-6 rounded-lg border-2 transition-all duration-300 ${
                  badge.category === 'payment'
                    ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/30'
                    : badge.category === 'compliance'
                      ? 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/30'
                      : 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/30'
                } hover:-translate-y-1`}
                aria-label={`${badge.title}: ${badge.description}`}
              >
                <div className="flex flex-col items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`transition-all duration-300 ${
                      badge.category === 'payment'
                        ? 'text-green-500'
                        : badge.category === 'compliance'
                          ? 'text-blue-500'
                          : 'text-purple-500'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-white text-sm md:text-base text-center">
                    {badge.title}
                  </h3>

                  {/* Description (visible on hover) */}
                  <p
                    className={`text-xs md:text-sm text-gray-400 text-center transition-all duration-300 ${
                      hoveredId === badge.id
                        ? 'opacity-100'
                        : 'opacity-0 hidden md:block'
                    }`}
                  >
                    {badge.description}
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Trust Message */}
        <div className="mt-12 md:mt-16 p-6 md:p-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg text-center">
          <p className="text-gray-300 text-base md:text-lg">
            <span className="text-green-400 font-semibold">✓ Verified & Secure</span>
            {' '}— All transactions are protected with industry-leading encryption and compliance standards.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
