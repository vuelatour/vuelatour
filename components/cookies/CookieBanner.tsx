'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  timestamp: number;
}

const COOKIE_CONSENT_KEY = 'vuelatour_cookie_consent';

export default function CookieBanner() {
  const locale = useLocale();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true, // Always required
    analytics: false,
    timestamp: 0,
  });

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookieConsent;
        setConsent(parsed);
        // Don't show banner if consent was given
        setShowBanner(false);
      } catch {
        // Invalid stored consent, show banner
        setShowBanner(true);
      }
    } else {
      // No consent stored, show banner
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);

    // Dispatch event for analytics initialization
    if (newConsent.analytics) {
      window.dispatchEvent(new CustomEvent('cookieConsentGranted', { detail: newConsent }));
    }
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      timestamp: Date.now(),
    });
  };

  const acceptEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      timestamp: Date.now(),
    });
  };

  const saveSettings = () => {
    saveConsent({
      ...consent,
      timestamp: Date.now(),
    });
  };

  const texts = {
    es: {
      title: 'Usamos cookies',
      description: 'Utilizamos cookies esenciales para el funcionamiento del sitio y cookies de análisis para mejorar tu experiencia.',
      acceptAll: 'Aceptar todas',
      acceptEssential: 'Solo esenciales',
      settings: 'Configurar',
      settingsTitle: 'Configuración de Cookies',
      essential: 'Cookies Esenciales',
      essentialDesc: 'Necesarias para el funcionamiento básico del sitio. No se pueden desactivar.',
      analytics: 'Cookies de Análisis',
      analyticsDesc: 'Nos ayudan a entender cómo usas el sitio para mejorarlo (Google Analytics).',
      save: 'Guardar preferencias',
      learnMore: 'Más información sobre nuestra política de cookies',
    },
    en: {
      title: 'We use cookies',
      description: 'We use essential cookies for site functionality and analytics cookies to improve your experience.',
      acceptAll: 'Accept all',
      acceptEssential: 'Essential only',
      settings: 'Settings',
      settingsTitle: 'Cookie Settings',
      essential: 'Essential Cookies',
      essentialDesc: 'Necessary for basic site functionality. Cannot be disabled.',
      analytics: 'Analytics Cookies',
      analyticsDesc: 'Help us understand how you use the site to improve it (Google Analytics).',
      save: 'Save preferences',
      learnMore: 'Learn more about our cookie policy',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.es;

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Main Banner */}
        {!showSettings && (
          <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-navy-700 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{t.title}</h3>
                <p className="text-sm text-muted">
                  {t.description}{' '}
                  <Link
                    href={`/${locale}/cookies`}
                    className="text-brand-500 hover:text-brand-600 underline"
                  >
                    {t.learnMore}
                  </Link>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  {t.settings}
                </button>
                <button
                  onClick={acceptEssential}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                >
                  {t.acceptEssential}
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                >
                  {t.acceptAll}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-navy-700 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{t.settingsTitle}</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-navy-800">
                <div>
                  <h4 className="font-medium mb-1">{t.essential}</h4>
                  <p className="text-sm text-muted">{t.essentialDesc}</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-brand-500 rounded-full opacity-50 cursor-not-allowed">
                    <div className="absolute top-0.5 left-[22px] w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-navy-800">
                <div>
                  <h4 className="font-medium mb-1">{t.analytics}</h4>
                  <p className="text-sm text-muted">{t.analyticsDesc}</p>
                </div>
                <button
                  onClick={() => setConsent(prev => ({ ...prev, analytics: !prev.analytics }))}
                  className="relative flex-shrink-0"
                >
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      consent.analytics ? 'bg-brand-500' : 'bg-gray-300 dark:bg-navy-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        consent.analytics ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={saveSettings}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                {t.save}
              </button>
              <Link
                href={`/${locale}/cookies`}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors text-center"
              >
                {t.learnMore}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper hook to check cookie consent from other components
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      try {
        setConsent(JSON.parse(savedConsent));
      } catch {
        setConsent(null);
      }
    }
  }, []);

  return consent;
}
