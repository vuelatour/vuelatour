'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaTiktok, href: 'https://tiktok.com', label: 'TikTok' },
    { icon: FaWhatsapp, href: 'https://wa.me/5219987407149', label: 'WhatsApp' },
  ];

  return (
    <footer className="border-t border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href={`/${locale}`}
              className="inline-block mb-4"
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
                className="h-10 w-auto"
                title={locale === 'es' ? 'Vuelatour' : 'Vuelatour'}
              />
            </Link>
            <p className="text-sm text-muted mb-6 max-w-xs">
              {t('footer.description')}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg surface-muted flex items-center justify-center text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/charter-flights`}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t('nav.charterFlights')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/air-tours`}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t('nav.airTours')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contactTitle')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted">{t('contact.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 text-muted flex-shrink-0" />
                <a
                  href="tel:+529987407149"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t('contact.phone')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <EnvelopeIcon className="w-4 h-4 text-muted flex-shrink-0" />
                <a
                  href="mailto:info@vuelatour.com"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t('contact.email')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-default">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted">
            <div className="flex items-center gap-4">
              <p>© 2025 Vuelatour. {t('footer.rights')}</p>
              <span>•</span>
              <Link
                href="/admin/login"
                className="hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                FAA Certified
              </span>
              <span>•</span>
              <span>15+ {t('footer.yearsExperience')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}