'use client';

import Link from 'next/link';

interface CreatorStory {
  id: string;
  name: string;
  genre: string;
  avatar: string;
  monthlyEarnings: number;
  testimonial: string;
  profileUrl?: string;
}

// Mock data - will be replaced with API call
const creatorStories: CreatorStory[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    genre: 'Hip-Hop/Trap',
    avatar: '🎤',
    monthlyEarnings: 3400,
    testimonial:
      'BroLab transformed my music career. I went from zero income to $3,400 a month in just 3 months. The platform is incredibly easy to use.',
    profileUrl: '#',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    genre: 'Electronic/Ambient',
    avatar: '🎹',
    monthlyEarnings: 2100,
    testimonial:
      "Finally a platform that respects producers. Zero commission, instant payouts, and genuine control over my work. Highly recommend!",
    profileUrl: '#',
  },
  {
    id: '3',
    name: 'David Foster',
    genre: 'R&B/Soul',
    avatar: '🎸',
    monthlyEarnings: 5200,
    testimonial:
      "The community here is incredible. I've collaborated with artists from around the world and my earnings keep growing every month.",
    profileUrl: '#',
  },
];

export function CreatorSuccessStories() {
  return (
    <section
      className="py-12 md:py-16 lg:py-20 px-4 md:px-8"
      aria-label="Creator success stories"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            Creator Success Stories
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Real creators earning real money. Here are their stories.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {creatorStories.map((story, index) => (
            <div
              key={story.id}
              className="animate-fade-in opacity-0"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <Link href={story.profileUrl || '#'}>
                <div className="group relative h-full p-6 md:p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/10 to-orange-500/10" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Avatar & Name */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="text-5xl md:text-6xl flex-shrink-0">
                        {story.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                          {story.name}
                        </h3>
                        <p className="text-sm md:text-base text-gray-400 font-medium">
                          {story.genre}
                        </p>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <blockquote className="mb-5 md:mb-6">
                      <p className="text-gray-300 text-sm md:text-base leading-relaxed italic">
                        &ldquo;{story.testimonial}&rdquo;
                      </p>
                    </blockquote>

                    {/* Earnings Badge */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Monthly Earnings
                        </span>
                      </div>
                      <div className="px-3 md:px-4 py-1.5 md:py-2 bg-green-500/20 border border-green-500/50 rounded-full">
                        <span className="text-lg md:text-xl font-bold text-green-400">
                          ${story.monthlyEarnings.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* View Profile CTA */}
                    <button
                      className="mt-5 md:mt-6 w-full py-2.5 md:py-3 px-4 text-white font-semibold rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-all duration-300 text-sm md:text-base group-hover:text-cyan-300"
                      aria-label={`View ${story.name}'s profile`}
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-gray-400 text-base md:text-lg mb-4 md:mb-6">
            Could be your success story next.
          </p>
          <button
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1"
            aria-label="Join as a creator"
          >
            Become a Creator
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
