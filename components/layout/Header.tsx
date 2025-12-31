'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import ChristmasDecoration from '@/components/decorations/ChristmasDecoration';
import { trackLanguageChange, trackEvent, trackNavigation } from '@/lib/analytics';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check system preference and localStorage
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'dark' || (!stored && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const changeLanguage = (newLocale: string) => {
    trackLanguageChange(newLocale);
    const path = pathname.split('/').slice(2).join('/');
    router.push(`/${newLocale}/${path}`);
  };

  const handleCtaClick = (source: string) => {
    trackEvent('cta_click', { source, cta_type: 'get_quote' });
  };

  const navLinks = [
    { label: t('nav.charterFlights'), href: `/${locale}/charter-flights` },
    { label: t('nav.airTours'), href: `/${locale}/air-tours` },
    { label: t('nav.contact'), href: `/${locale}/contact` },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-navy-900 transition-all duration-300 ${
        scrolled || mobileMenuOpen ? 'shadow-lg' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex-shrink-0"
            aria-label={locale === 'es' ? 'Vuelatour - Ir al inicio' : 'Vuelatour - Go to home'}
            title={locale === 'es' ? 'Vuelatour - Vuelos Privados y Tours Aéreos en Cancún' : 'Vuelatour - Charter Flights and Air Tours in Cancún'}
          >
            <Image
              src={darkMode ? '/images/logo/logo-vuelatour-dark.webp' : '/images/logo/logo-vuelatour.webp'}
              alt={locale === 'es'
                ? 'Vuelatour - Logo de empresa de vuelos privados y tours aéreos en Cancún y Riviera Maya'
                : 'Vuelatour - Charter flights and air tours company logo in Cancún and Riviera Maya'}
              width={150}
              height={40}
              style={{ width: 'auto', height: '2rem' }}
              className="md:h-10"
              priority
              title={locale === 'es' ? 'Vuelatour' : 'Vuelatour'}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-brand-600 dark:text-gray-300 dark:hover:text-white transition-colors"
                onClick={() => trackNavigation(link.label, 'header')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-navy-800">
              {['es', 'en'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    locale === lang
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900 dark:bg-navy-800 dark:text-gray-300 dark:hover:text-white transition-colors"
              aria-label={darkMode
                ? (locale === 'es' ? 'Cambiar a modo claro' : 'Switch to light mode')
                : (locale === 'es' ? 'Cambiar a modo oscuro' : 'Switch to dark mode')
              }
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* CTA Button */}
            <Link
              href={`/${locale}/contact`}
              className="hidden md:inline-flex btn-primary text-sm"
              onClick={() => handleCtaClick('header_desktop')}
            >
              {t('nav.getQuote')}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900 dark:bg-navy-800 dark:text-gray-300 dark:hover:text-white transition-colors"
              aria-label={mobileMenuOpen
                ? (locale === 'es' ? 'Cerrar menú de navegación' : 'Close navigation menu')
                : (locale === 'es' ? 'Abrir menú de navegación' : 'Open navigation menu')
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-navy-800 animate-slide-down bg-white dark:bg-navy-900">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-navy-800 transition-colors"
                  onClick={() => {
                    trackNavigation(link.label, 'header');
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Language */}
              <div className="px-4 pt-4 mt-2 border-t border-gray-200 dark:border-navy-800">
                <div className="flex gap-2">
                  {['es', 'en'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        changeLanguage(lang);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        locale === lang
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-gray-300'
                      }`}
                    >
                      {lang === 'es' ? 'Español' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="px-4 pt-4">
                <Link
                  href={`/${locale}/contact`}
                  className="block w-full text-center btn-primary text-sm"
                  onClick={() => {
                    handleCtaClick('header_mobile');
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('nav.getQuote')}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Christmas Decoration - Only shows in December */}
      <ChristmasDecoration />
    </header>
  );
}