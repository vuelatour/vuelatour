'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { getYearsOfExperienceFormatted } from '@/lib/constants';

interface Phone {
  display: string;
  link: string;
}

interface ContactInfo {
  address_es?: string;
  address_en?: string;
  phone?: string;
  phone_link?: string;
  phones?: Phone[];
  email?: string;
  whatsapp_number?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
}

interface FooterProps {
  contactInfo?: ContactInfo | null;
}

export default function Footer({ contactInfo }: FooterProps) {
  const t = useTranslations();
  const locale = useLocale();

  // Build social links array - only include if URL exists
  const socialLinks = [
    contactInfo?.facebook_url && {
      icon: FaFacebook,
      href: contactInfo.facebook_url,
      label: 'Facebook',
    },
    contactInfo?.instagram_url && {
      icon: FaInstagram,
      href: contactInfo.instagram_url,
      label: 'Instagram',
    },
    contactInfo?.tiktok_url && {
      icon: FaTiktok,
      href: contactInfo.tiktok_url,
      label: 'TikTok',
    },
    contactInfo?.youtube_url && {
      icon: FaYoutube,
      href: contactInfo.youtube_url,
      label: 'YouTube',
    },
    contactInfo?.whatsapp_number && {
      icon: FaWhatsapp,
      href: `https://wa.me/${contactInfo.whatsapp_number}`,
      label: 'WhatsApp',
    },
  ].filter(Boolean) as { icon: typeof FaFacebook; href: string; label: string }[];

  // Contact info with fallbacks
  const address = locale === 'es'
    ? (contactInfo?.address_es || 'Aeropuerto Internacional de Cancún, Terminal FBO, Cancún, Q.R., México')
    : (contactInfo?.address_en || 'Cancún International Airport, FBO Terminal, Cancún, Q.R., Mexico');

  // Get phones array or fallback to old phone field
  const phones = contactInfo?.phones && Array.isArray(contactInfo.phones) && contactInfo.phones.length > 0
    ? contactInfo.phones
    : [{ display: contactInfo?.phone || '+52 998 740 7149', link: contactInfo?.phone_link || '+529987407149' }];

  const email = contactInfo?.email || 'info@vuelatour.com';

  return (
    <footer className="bg-navy-900 border-t border-navy-800">
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
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              {t('footer.description')} {getYearsOfExperienceFormatted()} {t('footer.yearsExperience')}.
            </p>
            {/* Social Links - Only show if there are any */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-navy-800 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:bg-navy-700 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.services')}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/charter-flights`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.charterFlights')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/air-tours`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.airTours')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/cookies`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('footer.cookies')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.contactTitle')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">{address}</span>
              </li>
              {phones.map((phone, index) => (
                <li key={`phone-${index}`} className="flex items-center gap-3">
                  <PhoneIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <a
                    href={`tel:${phone.link}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {phone.display}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <EnvelopeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-navy-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <p>© 2025 Vuelatour. {t('footer.rights')}</p>
              <span>•</span>
              <Link
                href="/admin/login"
                className="hover:text-white transition-colors"
              >
                Admin
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                TAI & TAN Certified
              </span>
              <span>•</span>
              <span>{getYearsOfExperienceFormatted()} {t('footer.yearsExperience')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
