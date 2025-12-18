'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { UserType } from '@/contexts/AuthContext';
import { Users, Package, TrendingUp, Shield, Zap, Target } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType>('influencer');
  const { user, userProfile } = useAuth();

  const openAuthModal = (userType: UserType) => {
    setSelectedUserType(userType);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="mb-6 text-5xl font-bold leading-tight">
            Connect Brands with
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Authentic Micro Influencers
            </span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
            The marketplace where agencies find genuine micro influencers and
            creators discover meaningful brand partnerships.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal('influencer')}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-medium text-white shadow-lg transition-transform hover:scale-105 dark:from-blue-500 dark:to-blue-600"
            >
              <Users className="h-5 w-5" />
              I'm an Influencer
            </button>
            <button
              onClick={() => openAuthModal('agency')}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 text-lg font-medium text-white shadow-lg transition-transform hover:scale-105 dark:from-purple-500 dark:to-purple-600"
            >
              <Package className="h-5 w-5" />
              I'm an Agency
            </button>
          </div>
        </section>

        {/* Features for Both Sides */}
        <section className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-16 md:grid-cols-2">
              {/* For Influencers */}
              <div>
                <div className="mb-4 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  ✨ For Influencers
                </div>
                <h3 className="mb-6 text-3xl font-bold">
                  Monetize Your Influence
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Perfect Matches</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Find brands that align with your values and audience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Secure Payments</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Get paid fairly and on time for your work
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Grow Your Brand</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Build your portfolio and expand your reach
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Agencies */}
              <div>
                <div className="mb-4 inline-flex rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  🏢 For Agencies
                </div>
                <h3 className="mb-6 text-3xl font-bold">
                  Find Authentic Voices
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Quality Creators</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Access vetted micro influencers with engaged audiences
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950">
                      <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Fast Campaigns</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Launch and manage campaigns efficiently
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Real Results</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Track performance and ROI in real-time
          </p>
        </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-zinc-200 py-20 dark:border-zinc-800">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h3 className="mb-4 text-4xl font-bold">Ready to Get Started?</h3>
            <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
              Join thousands of influencers and agencies creating authentic connections
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => openAuthModal('influencer')}
                className="rounded-full bg-blue-600 px-8 py-4 font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Sign Up as Influencer
              </button>
              <button
                onClick={() => openAuthModal('agency')}
                className="rounded-full bg-purple-600 px-8 py-4 font-medium text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                Sign Up as Agency
              </button>
            </div>
        </div>
        </section>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialUserType={selectedUserType}
      />
    </div>
  );
}
