import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import HeroCards from './HeroCards';
import { getYearsOfExperienceFormatted } from '@/lib/constants';

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

interface FeaturedItem {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  price_from: number | null;
  duration: string | null;
  image_url: string | null;
}

interface HeroSectionProps {
  locale: string;
  content: ContentMap;
  heroImage?: HeroImage | null;
  featuredTour?: FeaturedItem | null;
  featuredDestination?: FeaturedItem | null;
  hasPopularData?: boolean;
}

export default function HeroSection({ locale, content, heroImage, featuredTour, featuredDestination, hasPopularData }: HeroSectionProps) {
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
          fetchPriority="high"
          quality={75}
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgEEAgMBAAAAAAAAAAAAAQIDAAQFERIhBjFBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AyXxrIZC3uZIrG8uIYgiFljkKqSQTsgdnQ0PtKUoP/9k="
          unoptimized={heroImageUrl.startsWith('http')}
        />
        {/* Solid overlay - no gradient */}
        <div className="absolute inset-0 bg-white/90 dark:bg-navy-950/90" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="overflow-hidden">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {t('badge')}
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              {getContent('hero_title', t('titleLine1'))}
              <br />
              <span className="text-brand-600">
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
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-default">
              {[
                { value: getYearsOfExperienceFormatted(), label: t('stats.years') },
                { value: '5,000+', label: t('stats.flights') },
                { value: '4.9', label: t('stats.rating') },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-xl sm:text-2xl font-semibold">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Feature cards (visible on larger screens) */}
          <div className="hidden lg:block">
            <HeroCards
              locale={locale}
              featuredTour={featuredTour}
              featuredDestination={featuredDestination}
              hasPopularData={hasPopularData}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
