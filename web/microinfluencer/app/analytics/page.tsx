'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, MousePointerClick, DollarSign, Eye, Users, Calendar, Filter } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ClickData {
  id: string;
  contentId: string;
  ip: string;
  location: string;
  timestamp: Date;
  productId: string;
}

interface ContentPerformance {
  contentId: string;
  platform: string;
  clicks: number;
  views: number;
  conversions: number;
  earnings: number;
  createdAt: Date;
}

export default function AnalyticsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7days');
  const [influencerFilter, setInfluencerFilter] = useState('all');
  const [availableInfluencers, setAvailableInfluencers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!loading && (!user || !userProfile)) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        // For agency, show mock data for multiple influencers
        if (userProfile?.userType === 'agency') {
          setAvailableInfluencers([
            { id: 'inf_1', name: 'Sarah Johnson' },
            { id: 'inf_2', name: 'Mike Chen' },
            { id: 'inf_3', name: 'Emma Davis' }
          ]);

          setContentPerformance([
            {
              contentId: 'content_1',
              platform: 'Instagram - Sarah Johnson',
              clicks: 245,
              views: 3420,
              conversions: 12,
              earnings: 156.80,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
              contentId: 'content_2',
              platform: 'TikTok - Mike Chen',
              clicks: 189,
              views: 5120,
              conversions: 8,
              earnings: 98.40,
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
              contentId: 'content_3',
              platform: 'Instagram - Emma Davis',
              clicks: 312,
              views: 4250,
              conversions: 15,
              earnings: 225.00,
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]);
        } else {
          // Influencer data
          setContentPerformance([
            {
              contentId: 'content_1',
              platform: 'Instagram',
              clicks: 245,
              views: 3420,
              conversions: 12,
              earnings: 156.80,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
              contentId: 'content_2',
              platform: 'TikTok',
              clicks: 189,
              views: 5120,
              conversions: 8,
              earnings: 98.40,
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            }
          ]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, dateFilter]);

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const totalClicks = contentPerformance.reduce((sum, item) => sum + item.clicks, 0);
  const totalViews = contentPerformance.reduce((sum, item) => sum + item.views, 0);
  const totalConversions = contentPerformance.reduce((sum, item) => sum + item.conversions, 0);
  const totalEarnings = contentPerformance.reduce((sum, item) => sum + item.earnings, 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold">Analytics Dashboard</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {userProfile.userType === 'influencer'
                ? 'Track your content performance and earnings'
                : 'Monitor campaign performance across influencers'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {userProfile.userType === 'agency' && availableInfluencers.length > 0 && (
              <select
                value={influencerFilter}
                onChange={(e) => setInfluencerFilter(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="all">All Influencers</option>
                {availableInfluencers.map((inf) => (
                  <option key={inf.id} value={inf.id}>
                    {inf.name}
                  </option>
                ))}
              </select>
            )}
            
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-zinc-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="24hours">Last 24 hours</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <Eye className="h-8 w-8 text-blue-600" />
              <span className="text-xs font-medium text-green-600">+12.5%</span>
            </div>
            <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Views</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <MousePointerClick className="h-8 w-8 text-purple-600" />
              <span className="text-xs font-medium text-green-600">+8.3%</span>
            </div>
            <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Clicks</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <span className="text-xs font-medium text-green-600">+15.2%</span>
            </div>
            <p className="text-3xl font-bold">{conversionRate}%</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Conversion Rate</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span className="text-xs font-medium text-green-600">+22.1%</span>
            </div>
            <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Earnings</p>
          </div>
        </div>

        {/* Content Performance Table */}
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-zinc-900">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Content Performance</h3>
          </div>

          {contentPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-sm dark:border-zinc-800">
                    <th className="pb-3 font-medium text-zinc-600 dark:text-zinc-400">Platform</th>
                    <th className="pb-3 font-medium text-zinc-600 dark:text-zinc-400">Views</th>
                    <th className="pb-3 font-medium text-zinc-600 dark:text-zinc-400">Clicks</th>
                    <th className="pb-3 font-medium text-zinc-600 dark:text-zinc-400">Conversions</th>
                    <th className="pb-3 font-medium text-zinc-600 dark:text-zinc-400">Earnings</th>
                    <th className="pb-3 font-medium text-zinc-600 dark:text-zinc-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contentPerformance.map((content, index) => (
                    <tr
                      key={content.contentId}
                      className="border-b border-zinc-100 dark:border-zinc-800/50"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-950">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{content.platform}</span>
                        </div>
                      </td>
                      <td className="py-4">{content.views.toLocaleString()}</td>
                      <td className="py-4">{content.clicks.toLocaleString()}</td>
                      <td className="py-4">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                          {content.conversions}
                        </span>
                      </td>
                      <td className="py-4 font-semibold text-green-600">
                        ${content.earnings.toFixed(2)}
                      </td>
                      <td className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {content.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BarChart3 className="mx-auto mb-4 h-16 w-16 text-zinc-400" />
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                No content data yet
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                {userProfile.userType === 'influencer'
                  ? 'Generate and publish content to see analytics here'
                  : 'Create campaigns to start tracking performance'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

