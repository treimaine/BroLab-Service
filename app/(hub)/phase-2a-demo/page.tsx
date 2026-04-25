import { Phase2ASection } from '@/components/phase-2a';

export const metadata = {
  title: 'Phase 2A Demo - Trust Signals & Social Proof',
  description: 'Demo page showcasing Phase 2A trust-building components',
};

export default function Phase2ADemo() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 py-8 px-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Phase 2A: Trust Signals & Social Proof
          </h1>
          <p className="text-gray-400">
            Production-ready components for building trust and driving conversions
          </p>
        </div>
      </header>

      {/* Components Demo */}
      <Phase2ASection />

      {/* Footer Info */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-2">CreatorStatsCounter</h3>
              <p className="text-gray-400 text-sm">
                Animated metrics display with Intersection Observer optimization
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">TrustBadges</h3>
              <p className="text-gray-400 text-sm">
                Security & compliance signals with hover interactions
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">CreatorSuccessStories</h3>
              <p className="text-gray-400 text-sm">
                Social proof cards with testimonials and earnings
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-gray-500 text-sm">
              <strong>Integration:</strong> Import{' '}
              <code className="bg-slate-800 px-2 py-1 rounded">Phase2ASection</code> from{' '}
              <code className="bg-slate-800 px-2 py-1 rounded">@/components/phase-2a</code>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              <strong>Documentation:</strong> See{' '}
              <code className="bg-slate-800 px-2 py-1 rounded">src/components/phase-2a/README.md</code>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              <strong>Git Commits:</strong> a6e6506, 2f6abc7
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
