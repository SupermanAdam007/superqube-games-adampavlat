'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AffiliateLink {
  id: string;
  contentId: string;
  influencerId: string;
  productId: string;
  destinationUrl: string;
  active: boolean;
}

export default function AffiliateRedirectPage({ params }: { params: Promise<{ linkId: string }> }) {
  const resolvedParams = use(params);
  const linkId = resolvedParams.linkId;
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Get IP and location information
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        // Get location from IP (using ipapi.co free tier)
        let location = 'Unknown';
        try {
          const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
          const locationData = await locationResponse.json();
          location = `${locationData.city || 'Unknown'}, ${locationData.country_name || 'Unknown'}`;
        } catch (error) {
          console.error('Error fetching location:', error);
        }

        // Fetch affiliate link details
        const linkRef = doc(db, 'affiliateLinks', linkId);
        const linkSnap = await getDoc(linkRef);

        if (!linkSnap.exists()) {
          setStatus('error');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        const linkData = linkSnap.data() as AffiliateLink;

        if (!linkData.active) {
          setStatus('error');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        // Track the click in Firestore
        await addDoc(collection(db, 'clicks'), {
          linkId,
          contentId: linkData.contentId,
          influencerId: linkData.influencerId,
          productId: linkData.productId,
          ip,
          location,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct',
        });

        // Redirect to destination
        setStatus('redirecting');
        window.location.href = linkData.destinationUrl;
      } catch (error) {
        console.error('Error handling affiliate redirect:', error);
        setStatus('error');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleRedirect();
  }, [linkId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Preparing your link...
            </p>
          </>
        )}
        
        {status === 'redirecting' && (
          <>
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Redirecting...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-950">
              <svg
                className="h-12 w-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Link not found or expired
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Redirecting to homepage...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

