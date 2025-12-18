'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Target, TrendingUp, Zap } from 'lucide-react';

// Helper function to convert Firestore Timestamp to Date
function toDate(timestamp: Date | { seconds: number; nanoseconds: number }): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  // Firestore Timestamp object
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(); // Fallback
}

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not logged in (after loading completes)
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl bg-white p-12 shadow-lg dark:bg-zinc-900">
          <h2 className="mb-4 text-3xl font-bold">
            Welcome, {userProfile.displayName || 'there'}! 👋
          </h2>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            {userProfile.userType === 'agency'
              ? "You're signed in as an Agency. You can now browse micro influencers and create campaigns."
              : "You're signed in as an Influencer. You can now browse opportunities and connect with brands."}
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {userProfile.userType === 'influencer' ? (
              <>
                <Link
                  href="/generate"
                  className="rounded-xl border border-zinc-200 p-6 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <Zap className="mb-3 h-8 w-8 text-blue-600" />
                  <h3 className="mb-2 font-semibold">Generate Content</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Create AI-powered promotional content
                  </p>
                </Link>

                <Link
                  href="/analytics"
                  className="rounded-xl border border-zinc-200 p-6 transition-all hover:border-purple-500 hover:bg-purple-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <TrendingUp className="mb-3 h-8 w-8 text-purple-600" />
                  <h3 className="mb-2 font-semibold">Analytics</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Track your performance and earnings
                  </p>
                </Link>

                <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                  <Target className="mb-3 h-8 w-8 text-orange-600" />
                  <h3 className="mb-2 font-semibold">Browse</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Explore brand opportunities
                  </p>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/analytics"
                  className="rounded-xl border border-zinc-200 p-6 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <TrendingUp className="mb-3 h-8 w-8 text-blue-600" />
                  <h3 className="mb-2 font-semibold">Analytics</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Monitor campaign performance
                  </p>
                </Link>

                <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                  <Target className="mb-3 h-8 w-8 text-purple-600" />
                  <h3 className="mb-2 font-semibold">Campaigns</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Create and manage campaigns
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                  <Zap className="mb-3 h-8 w-8 text-orange-600" />
                  <h3 className="mb-2 font-semibold">Influencers</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Discover micro influencers
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-12 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-800/50">
            <h3 className="mb-4 text-xl font-semibold">Your Profile Details</h3>
            <dl className="space-y-3">
              <div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
                <dt className="font-medium text-zinc-600 dark:text-zinc-400">Email:</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{userProfile.email}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
                <dt className="font-medium text-zinc-600 dark:text-zinc-400">User Type:</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">
                  {userProfile.userType === 'agency' ? 'Agency' : 'Influencer'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
                <dt className="font-medium text-zinc-600 dark:text-zinc-400">Display Name:</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">
                  {userProfile.displayName || 'Not set'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-zinc-600 dark:text-zinc-400">Member Since:</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">
                  {toDate(userProfile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}

