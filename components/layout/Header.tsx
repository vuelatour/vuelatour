'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

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
    const path = pathname.split('/').slice(2).join('/');
    router.push(`/${newLocale}/${path}`);
  };

  const navLinks = [
    { label: t('nav.charterFlights'), href: `/${locale}/charter-flights` },
    { label: t('nav.airTours'), href: `/${locale}/air-tours` },
    { label: t('nav.contact'), href: `/${locale}/contact` },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-navy-900 transition-all duration-300 ${
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
              src="/images/logo/vuelatour-logo.png"
              alt={locale === 'es'
                ? 'Vuelatour - Logo de empresa de vuelos privados y tours aéreos en Cancún y Riviera Maya'
                : 'Vuelatour - Charter flights and air tours company logo in Cancún and Riviera Maya'}
              width={150}
              height={40}
              className="h-8 md:h-10 w-auto"
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
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-navy-800">
              {['es', 'en'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    locale === lang
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-navy-800 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle theme"
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
            >
              {t('nav.getQuote')}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-navy-800 text-gray-300 hover:text-white transition-colors"
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
          <div className="md:hidden py-4 border-t border-navy-800 animate-slide-down bg-navy-900">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium rounded-lg text-gray-200 hover:bg-navy-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Language */}
              <div className="px-4 pt-4 mt-2 border-t border-navy-800">
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
                          ? 'bg-brand-500 text-white'
                          : 'bg-navy-800 text-gray-300'
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.getQuote')}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}