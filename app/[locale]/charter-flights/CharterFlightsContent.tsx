'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  PaperAirplaneIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

interface CharterFlightsContentProps {
  locale: string;
  destinations: Destination[];
}

const translations = {
  es: {
    title: 'Vuelos Privados',
    subtitle: 'Viaja a tu destino de forma privada y exclusiva',
    description: 'Ofrecemos vuelos privados a los destinos más espectaculares de la región. Despega desde Cancún y llega a tu destino en minutos, no en horas. Máximo confort, flexibilidad total.',
    backToHome: 'Volver al inicio',
    passengers: 'Hasta 5 pasajeros',
    bookNow: 'Reservar ahora',
    noDestinations: 'No hay destinos disponibles',
    customTitle: '¿No encuentras tu destino?',
    customDesc: 'Ofrecemos vuelos privados personalizados a cualquier destino en la región. Contáctanos para una cotización.',
    requestQuote: 'Solicitar cotización',
  },
  en: {
    title: 'Charter Flights',
    subtitle: 'Travel to your destination privately and exclusively',
    description: 'We offer private charter flights to the most spectacular destinations in the region. Take off from Cancún and reach your destination in minutes, not hours. Maximum comfort, total flexibility.',
    backToHome: 'Back to home',
    passengers: 'Up to 5 passengers',
    bookNow: 'Book now',
    noDestinations: 'No destinations available',
    customTitle: "Can't find your destination?",
    customDesc: 'We offer custom charter flights to any destination in the region. Contact us for a quote.',
    requestQuote: 'Request a quote',
  },
};

export default function CharterFlightsContent({ locale, destinations }: CharterFlightsContentProps) {
  const t = translations[locale as keyof typeof translations] || translations.es;
  const { formatPrice, currency } = useCurrency();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-navy-600 dark:hover:text-navy-300 transition-colors mb-8"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t.backToHome}
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-navy-100 dark:bg-navy-800">
                <PaperAirplaneIcon className="w-8 h-8 text-navy-600 dark:text-navy-300" />
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

        {/* Destinations Grid */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {destinations.map((dest) => (
                <Link
                  key={dest.id}
                  href={`/${locale}/charter-flights/${dest.slug}`}
                  className="group block"
                >
                  <article
                    id={dest.slug}
                    className="h-full bg-white dark:bg-navy-900 rounded-3xl border border-navy-200 dark:border-navy-700 overflow-hidden hover:border-navy-400 dark:hover:border-navy-500 hover:shadow-xl hover:shadow-navy-100 dark:hover:shadow-navy-900/50 transition-all duration-300 scroll-mt-24"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {dest.image_url ? (
                        <Image
                          src={dest.image_url}
                          alt={locale === 'es' ? dest.name_es : dest.name_en}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
                          <PaperAirplaneIcon className="w-16 h-16 text-navy-300 dark:text-navy-600" />
                        </div>
                      )}
                      {/* Price badge */}
                      <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/95 dark:bg-navy-900/95 backdrop-blur-sm shadow-lg">
                        <div className="font-bold text-lg text-navy-600 dark:text-navy-400">
                          {dest.price_from ? formatPrice(dest.price_from) : '-'}
                        </div>
                        <div className="text-xs text-muted text-center">{currency}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-navy-600 dark:group-hover:text-navy-300 transition-colors">
                        {locale === 'es' ? dest.name_es : dest.name_en}
                      </h2>

                      <p className="text-muted mb-6 line-clamp-3">
                        {locale === 'es' ? dest.description_es : dest.description_en}
                      </p>

                      {/* Meta info */}
                      <div className="flex items-center gap-6 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-muted">
                          <ClockIcon className="w-5 h-5 text-navy-400" />
                          <span className="font-medium">{dest.flight_time || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted">
                          <UserGroupIcon className="w-5 h-5 text-navy-400" />
                          <span className="font-medium">{t.passengers}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-navy-600 group-hover:bg-navy-700 text-white font-semibold rounded-xl transition-colors">
                        <PhoneIcon className="w-4 h-4" />
                        {t.bookNow}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {destinations.length === 0 && (
              <div className="text-center py-20">
                <PaperAirplaneIcon className="w-16 h-16 text-navy-300 dark:text-navy-600 mx-auto mb-4" />
                <p className="text-xl text-muted">
                  {t.noDestinations}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-navy-900 to-navy-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              {t.customTitle}
            </h2>
            <p className="text-lg text-navy-300 mb-8">
              {t.customDesc}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-bold rounded-xl hover:bg-brand-500 hover:text-white transition-all duration-300"
            >
              {t.requestQuote}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
