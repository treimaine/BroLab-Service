'use client';

import { useEffect, useState } from 'react';

interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
}

const stats: StatItem[] = [
  { label: 'Active Creators', value: 2847, suffix: '+' },
  { label: 'Monthly Revenue', value: 847, suffix: 'K+' },
  { label: 'Avg Earnings', value: 2847, suffix: '/mo' },
];

export function CreatorStatsCounter() {
  const [animatedValues, setAnimatedValues] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
  });

  useEffect(() => {
    // Use Intersection Observer for performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-counter');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const startAnimation = () => {
    const duration = 2500; // 2.5 seconds
    const startTime = performance.now();
    const maxValues = [2847, 847, 2847];

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newValues: Record<number, number> = {};
      maxValues.forEach((max, i) => {
        newValues[i] = Math.floor(max * easeProgress);
      });

      setAnimatedValues(newValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <section
      id="stats-counter"
      className="py-12 md:py-16 lg:py-20 px-4 md:px-8"
      aria-label="Creator statistics"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Join creators{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
              earning on BroLab
            </span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Real creators, real earnings. See what&apos;s possible.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="animate-fade-in opacity-0 transition-opacity duration-500"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 md:p-8 border border-slate-700 hover:border-cyan-500/50 transition-colors duration-300">
                {/* Stat Value */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                    {animatedValues[index]?.toLocaleString() || 0}
                  </span>
                  {stat.suffix && (
                    <span className="text-2xl md:text-3xl font-semibold text-orange-500">
                      {stat.suffix}
                    </span>
                  )}
                </div>

                {/* Stat Label */}
                <p className="text-gray-400 text-sm md:text-base font-medium">
                  {stat.label}
                </p>

                {/* Decorative line */}
                <div className="mt-4 h-1 bg-gradient-to-r from-cyan-500/50 to-orange-500/20 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-14 text-center">
          <button
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1"
            aria-label="Start earning with BroLab"
          >
            Start Earning Today
          </button>
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
