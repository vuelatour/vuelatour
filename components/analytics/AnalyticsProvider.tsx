'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initializeAnalytics, trackPageView, hasAnalyticsConsent, grantAnalyticsConsent } from '@/lib/analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Initialize analytics on mount if consent exists (deferred for performance)
  useEffect(() => {
    // Use requestIdleCallback to defer non-critical analytics initialization
    const initializeWhenIdle = () => {
      if (hasAnalyticsConsent()) {
        initializeAnalytics();
      }
    };

    // Listen for consent being granted
    const handleConsentGranted = () => {
      initializeAnalytics();
    };

    let cleanupId: number | NodeJS.Timeout;

    // Check if requestIdleCallback is supported (fallback to setTimeout)
    if ('requestIdleCallback' in globalThis) {
      cleanupId = globalThis.requestIdleCallback(initializeWhenIdle, { timeout: 2000 });
      globalThis.addEventListener('cookieConsentGranted', handleConsentGranted as EventListener);

      return () => {
        globalThis.cancelIdleCallback(cleanupId as number);
        globalThis.removeEventListener('cookieConsentGranted', handleConsentGranted as EventListener);
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      cleanupId = setTimeout(initializeWhenIdle, 1000);
      globalThis.addEventListener('cookieConsentGranted', handleConsentGranted as EventListener);

      return () => {
        clearTimeout(cleanupId as NodeJS.Timeout);
        globalThis.removeEventListener('cookieConsentGranted', handleConsentGranted as EventListener);
      };
    }
  }, []);

  // Track page views on route change (also deferred)
  useEffect(() => {
    if (hasAnalyticsConsent()) {
      // Defer page view tracking slightly to not block rendering
      const timeoutId = setTimeout(() => {
        trackPageView(pathname);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname]);

  return <>{children}</>;
}
