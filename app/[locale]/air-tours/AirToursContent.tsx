'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  GlobeAmericasIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  PhoneIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

interface AirToursContentProps {
  locale: string;
  tours: AirTour[];
}

const translations = {
  es: {
    title: 'Tours Aéreos',
    subtitle: 'Experiencias panorámicas inolvidables',
    description: 'Descubre el Caribe mexicano desde una perspectiva única. Nuestros tours aéreos te ofrecen vistas espectaculares de la zona hotelera, las ruinas mayas, cenotes y las playas más hermosas de la región.',
    backToHome: 'Volver al inicio',
    passengers: 'Hasta 5 pasajeros',
    includes: 'Incluye',
    bookTour: 'Reservar este tour',
    noTours: 'No hay tours disponibles',
    customTitle: '¿Buscas una experiencia personalizada?',
    customDesc: 'Diseñamos tours aéreos a medida para grupos, eventos especiales y ocasiones únicas.',
    contactNow: 'Contactar ahora',
  },
  en: {
    title: 'Air Tours',
    subtitle: 'Unforgettable panoramic experiences',
    description: 'Discover the Mexican Caribbean from a unique perspective. Our air tours offer spectacular views of the hotel zone, Mayan ruins, cenotes and the most beautiful beaches in the region.',
    backToHome: 'Back to home',
    passengers: 'Up to 5 passengers',
    includes: 'Includes',
    bookTour: 'Book this tour',
    noTours: 'No tours available',
    customTitle: 'Looking for a custom experience?',
    customDesc: 'We design custom air tours for groups, special events, and unique occasions.',
    contactNow: 'Contact us now',
  },
};

export default function AirToursContent({ locale, tours }: AirToursContentProps) {
  const t = translations[locale as keyof typeof translations] || translations.es;
  const { formatPrice, currency } = useCurrency();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-brand-50 to-white dark:from-navy-950 dark:to-navy-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-8"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t.backToHome}
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-brand-100 dark:bg-brand-900/50">
                <GlobeAmericasIcon className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold">{t.title}</h1>
                <p className="text-lg text-muted mt-2">{t.subtitle}</p>
              </div>
            </div>

            <p className="text-muted max-w-3xl">
              {t.description}
            </p>
          </div>
        </section>

        {/* Tours Grid */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
              {tours.map((tour) => {
                const highlights = locale === 'es' ? tour.highlights_es : tour.highlights_en;

                return (
                  <Link
                    key={tour.id}
                    href={`/${locale}/air-tours/${tour.slug}`}
                    className="group block"
                  >
                    <article
                      id={tour.slug}
                      className="h-full bg-white dark:bg-navy-900 rounded-3xl border border-brand-200 dark:border-brand-800 overflow-hidden hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-xl hover:shadow-brand-100 dark:hover:shadow-brand-900/30 transition-all duration-300 scroll-mt-24"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {tour.image_url ? (
                          <Image
                            src={tour.image_url}
                            alt={locale === 'es' ? tour.name_es : tour.name_en}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                            <GlobeAmericasIcon className="w-20 h-20 text-brand-300 dark:text-brand-700" />
                          </div>
                        )}
                        {/* Price badge */}
                        <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/95 dark:bg-navy-900/95 backdrop-blur-sm shadow-lg">
                          <div className="font-bold text-xl text-brand-600 dark:text-brand-400">
                            {tour.price_from ? formatPrice(tour.price_from) : '-'}
                          </div>
                          <div className="text-xs text-muted text-center">{currency}</div>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-navy-900/80 backdrop-blur-sm flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-white" />
                          <span className="text-sm font-medium text-white">{tour.duration || '-'}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 lg:p-8">
                        <h2 className="text-2xl lg:text-3xl font-bold mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {locale === 'es' ? tour.name_es : tour.name_en}
                        </h2>

                        <p className="text-muted mb-6 line-clamp-3">
                          {locale === 'es' ? tour.description_es : tour.description_en}
                        </p>

                        {/* Highlights */}
                        {highlights && highlights.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
                              {t.includes}
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {highlights.slice(0, 4).map((highlight, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircleIcon className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-4 mb-6 py-4 border-t border-b border-gray-100 dark:border-navy-800">
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <UserGroupIcon className="w-5 h-5 text-brand-400" />
                            <span>{t.passengers}</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-brand-500 group-hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
                          <PhoneIcon className="w-4 h-4" />
                          {t.bookTour}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            {tours.length === 0 && (
              <div className="text-center py-20">
                <GlobeAmericasIcon className="w-16 h-16 text-brand-300 dark:text-brand-700 mx-auto mb-4" />
                <p className="text-xl text-muted">
                  {t.noTours}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-brand-600 to-brand-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              {t.customTitle}
            </h2>
            <p className="text-lg text-brand-100 mb-8">
              {t.customDesc}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold rounded-xl hover:bg-navy-900 hover:text-white transition-all duration-300"
            >
              {t.contactNow}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
