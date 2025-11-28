'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import {
  PaperAirplaneIcon,
  GlobeAmericasIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Destination {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  flight_time: string | null;
  price_from: number | null;
  image_url: string | null;
}

interface AirTour {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  duration: string | null;
  price_from: number | null;
  image_url: string | null;
  highlights_es: string[] | null;
  highlights_en: string[] | null;
}

interface ServicesSectionProps {
  locale: string;
  destinations: Destination[];
  tours: AirTour[];
}

const MAX_ITEMS = 3;

export default function ServicesSection({ locale, destinations, tours }: ServicesSectionProps) {
  const t = useTranslations('services');
  const { formatPrice, currency } = useCurrency();

  // Limit to first 3 items
  const displayedDestinations = destinations.slice(0, MAX_ITEMS);
  const displayedTours = tours.slice(0, MAX_ITEMS);

  const hasMoreDestinations = destinations.length > MAX_ITEMS;
  const hasMoreTours = tours.length > MAX_ITEMS;

  return (
    <section id="services" className="py-20 md:py-28 bg-gradient-to-b from-transparent via-navy-50/30 to-transparent dark:via-navy-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 mb-4">
            {locale === 'es' ? 'Experiencias Exclusivas' : 'Exclusive Experiences'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-5">
            {t('title')}
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column - Charter Flights */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-navy-100 dark:bg-navy-800">
                <PaperAirplaneIcon className="w-6 h-6 text-navy-600 dark:text-navy-300" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{t('charter.title')}</h3>
                <p className="text-sm text-muted">{t('charter.subtitle')}</p>
              </div>
            </div>

            {/* Charter Destinations Cards */}
            <div className="space-y-4">
              {displayedDestinations.map((dest, index) => (
                <Link
                  key={dest.id}
                  href={`/${locale}/charter-flights/${dest.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:border-navy-400 dark:hover:border-navy-500 hover:shadow-lg hover:shadow-navy-100 dark:hover:shadow-navy-900/50 transition-all duration-300">
                    <div className="flex">
                      {/* Image */}
                      <div className="relative w-28 sm:w-36 flex-shrink-0">
                        <div className="aspect-[4/3] relative">
                          {dest.image_url ? (
                            <Image
                              src={dest.image_url}
                              alt={locale === 'es' ? dest.name_es : dest.name_en}
                              fill
                              sizes="144px"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
                              <PaperAirplaneIcon className="w-10 h-10 text-navy-300 dark:text-navy-600" />
                            </div>
                          )}
                        </div>
                        {/* Ranking badge */}
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-navy-900/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow p-4 flex flex-col justify-center min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-lg truncate group-hover:text-navy-600 dark:group-hover:text-navy-300 transition-colors">
                            {locale === 'es' ? dest.name_es : dest.name_en}
                          </h4>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-lg text-navy-600 dark:text-navy-400">
                              {dest.price_from ? formatPrice(dest.price_from) : '-'}
                            </div>
                            <div className="text-xs text-muted">{currency}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <ClockIcon className="w-4 h-4" />
                          <span>{dest.flight_time || '-'}</span>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex items-center pr-4">
                        <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center group-hover:bg-navy-600 dark:group-hover:bg-navy-600 transition-colors">
                          <ArrowRightIcon className="w-4 h-4 text-navy-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {displayedDestinations.length === 0 && (
                <div className="text-center py-12 text-muted rounded-2xl border border-dashed border-navy-200 dark:border-navy-700">
                  {locale === 'es' ? 'No hay destinos disponibles' : 'No destinations available'}
                </div>
              )}
            </div>

            {/* Charter CTA */}
            <Link
              href={`/${locale}/charter-flights`}
              className="group flex items-center justify-center gap-2 w-full mt-6 py-4 text-sm font-semibold text-navy-700 dark:text-navy-200 bg-navy-100 dark:bg-navy-800 hover:bg-navy-600 hover:text-white dark:hover:bg-navy-600 rounded-xl transition-all duration-300"
            >
              {hasMoreDestinations
                ? (locale === 'es' ? `Ver los ${destinations.length} destinos` : `View all ${destinations.length} destinations`)
                : t('charter.viewAll')
              }
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right Column - Air Tours */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-900/50">
                <GlobeAmericasIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{t('tours.title')}</h3>
                <p className="text-sm text-muted">{t('tours.subtitle')}</p>
              </div>
            </div>

            {/* Tours Cards */}
            <div className="space-y-4">
              {displayedTours.map((tour, index) => (
                <Link
                  key={tour.id}
                  href={`/${locale}/air-tours/${tour.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-navy-900 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-lg hover:shadow-brand-100 dark:hover:shadow-brand-900/30 transition-all duration-300">
                    <div className="flex">
                      {/* Image */}
                      <div className="relative w-28 sm:w-36 flex-shrink-0">
                        <div className="aspect-[4/3] relative">
                          {tour.image_url ? (
                            <Image
                              src={tour.image_url}
                              alt={locale === 'es' ? tour.name_es : tour.name_en}
                              fill
                              sizes="144px"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                              <GlobeAmericasIcon className="w-10 h-10 text-brand-300 dark:text-brand-700" />
                            </div>
                          )}
                        </div>
                        {/* Ranking badge */}
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-brand-600/90 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow p-4 flex flex-col justify-center min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-lg truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {locale === 'es' ? tour.name_es : tour.name_en}
                          </h4>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-lg text-brand-600 dark:text-brand-400">
                              {tour.price_from ? formatPrice(tour.price_from) : '-'}
                            </div>
                            <div className="text-xs text-muted">{currency}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <ClockIcon className="w-4 h-4" />
                          <span>{tour.duration || '-'}</span>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex items-center pr-4">
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                          <ArrowRightIcon className="w-4 h-4 text-brand-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {displayedTours.length === 0 && (
                <div className="text-center py-12 text-muted rounded-2xl border border-dashed border-brand-200 dark:border-brand-800">
                  {locale === 'es' ? 'No hay tours disponibles' : 'No tours available'}
                </div>
              )}
            </div>

            {/* Tours CTA */}
            <Link
              href={`/${locale}/air-tours`}
              className="group flex items-center justify-center gap-2 w-full mt-6 py-4 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all duration-300"
            >
              {hasMoreTours
                ? (locale === 'es' ? `Ver los ${tours.length} tours` : `View all ${tours.length} tours`)
                : t('tours.viewAll')
              }
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-20 p-8 rounded-3xl bg-gradient-to-r from-navy-900 to-navy-800 dark:from-navy-800 dark:to-navy-900 border border-navy-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold text-white mb-2">{t('custom.title')}</h4>
              <p className="text-navy-300">{t('custom.description')}</p>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="group flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-semibold rounded-xl hover:bg-brand-500 hover:text-white transition-all duration-300 whitespace-nowrap"
            >
              {t('custom.cta')}
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
