import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface ContentMap {
  [key: string]: {
    es: string;
    en: string;
  };
}

interface HeroImage {
  id: string;
  key: string;
  url: string;
  alt_es: string | null;
  alt_en: string | null;
  category: string | null;
  is_primary?: boolean;
}

interface HeroSectionProps {
  locale: string;
  content: ContentMap;
  heroImage?: HeroImage | null;
}

export default function HeroSection({ locale, content, heroImage }: HeroSectionProps) {
  const t = useTranslations('hero');

  // Helper to get content with fallback to translations
  const getContent = (key: string, fallback: string) => {
    if (content[key]) {
      return locale === 'es' ? content[key].es : content[key].en;
    }
    return fallback;
  };

  // Hero image URL - use dynamic image from admin or fallback to static
  const heroImageUrl = heroImage?.url || '/images/hero/hero-aerial-cancun.jpg';

  // Hero image alt text for SEO - use dynamic alt or fallback
  const heroImageAlt = heroImage
    ? (locale === 'es' ? heroImage.alt_es : heroImage.alt_en) || heroImage.key
    : locale === 'es'
      ? 'Avioneta Cessna sobre las playas turquesa de Cancún - Vuelatour vuelos privados'
      : 'Cessna aircraft over turquoise Cancún beaches - Vuelatour private flights';

  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 pb-12 md:pt-24 md:pb-16 overflow-hidden">
      {/* Background Image with solid overlay */}
      <div className="absolute inset-0">
        <Image
          src={heroImageUrl}
          alt={heroImageAlt}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
          unoptimized={heroImageUrl.startsWith('http')}
        />
        {/* Solid overlay - no gradient */}
        <div className="absolute inset-0 bg-white/90 dark:bg-navy-950/90" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {t('badge')}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              {getContent('hero_title', t('titleLine1'))}
              <br />
              <span className="text-brand-500">
                {getContent('hero_subtitle', t('titleLine2'))}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted max-w-xl mb-8">
              {t('subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/contact`}
                className="btn-primary inline-flex items-center justify-center gap-2 text-base"
              >
                {t('cta.primary')}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <a
                href="#services"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-base"
              >
                {t('cta.secondary')}
              </a>
            </div>

            {/* Stats - Minimal */}
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-default">
              {[
                { value: '15+', label: t('stats.years') },
                { value: '5,000+', label: t('stats.flights') },
                { value: '4.9', label: t('stats.rating') },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Feature cards (visible on larger screens) */}
          <div className="hidden lg:block">
            <div className="grid gap-4">
              {/* Featured Aircraft Card */}
              <div className="card p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-navy-100 dark:bg-navy-800">
                    <Image
                      src="/images/fleet/cessna-206.jpg"
                      alt={locale === 'es' ? 'Cessna 206 - Flota Vuelatour' : 'Cessna 206 - Vuelatour Fleet'}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-muted mb-1">{locale === 'es' ? 'Nuestra Flota' : 'Our Fleet'}</div>
                    <div className="font-semibold">Cessna 206</div>
                    <div className="text-sm text-muted">{locale === 'es' ? 'Hasta 5 pasajeros' : 'Up to 5 passengers'}</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted mb-1">{locale === 'es' ? 'Próximo vuelo disponible' : 'Next flight available'}</div>
                    <div className="font-semibold text-brand-500">{locale === 'es' ? 'Hoy' : 'Today'}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-navy-800 flex items-center justify-center">
                    <span className="text-xl">✈️</span>
                  </div>
                </div>
              </div>

              {/* Certification Badge */}
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                  </div>
                  <div>
                    <div className="font-medium">FAA Certified</div>
                    <div className="text-sm text-muted">{locale === 'es' ? 'Operador certificado' : 'Certified operator'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
