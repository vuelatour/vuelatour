'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ClockIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  FireIcon,
} from '@heroicons/react/24/solid';
import { useCurrency } from '@/contexts/CurrencyContext';

// Dynamically import TripAdvisor widget to avoid SSR issues
const TripAdvisorRatingWidget = dynamic(
  () => import('@/components/widgets/TripAdvisorRatingWidget'),
  { ssr: false }
);

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

interface HeroCardsProps {
  locale: string;
  featuredTour?: FeaturedItem | null;
  featuredDestination?: FeaturedItem | null;
  hasPopularData?: boolean;
}

// Simulated recent bookings for social proof
const recentBookings = {
  es: [
    { name: 'María', city: 'CDMX', service: 'Tour a Chichén Itzá', time: 'hace 2 horas' },
    { name: 'Carlos', city: 'Guadalajara', service: 'Vuelo a Cozumel', time: 'hace 4 horas' },
    { name: 'Ana', city: 'Monterrey', service: 'Tour Panorámico', time: 'hace 6 horas' },
    { name: 'Roberto', city: 'Puebla', service: 'Vuelo a Tulum', time: 'ayer' },
  ],
  en: [
    { name: 'John', city: 'Texas', service: 'Chichén Itzá Tour', time: '2 hours ago' },
    { name: 'Sarah', city: 'California', service: 'Cozumel Flight', time: '4 hours ago' },
    { name: 'Mike', city: 'New York', service: 'Panoramic Tour', time: '6 hours ago' },
    { name: 'Emily', city: 'Florida', service: 'Tulum Flight', time: 'yesterday' },
  ],
};

const translations = {
  es: {
    featured: 'Destacado',
    popular: 'Más Popular',
    from: 'Desde',
    bookNow: 'Reservar',
    viewMore: 'Ver más',
    spotsLeft: 'lugares disponibles hoy',
    socialProof: 'reservó',
    certified: 'Operador Certificado',
    certifiedDesc: 'TAI & TAN',
    availableToday: 'Disponible hoy',
  },
  en: {
    featured: 'Featured',
    popular: 'Most Popular',
    from: 'From',
    bookNow: 'Book Now',
    viewMore: 'View more',
    spotsLeft: 'spots available today',
    socialProof: 'booked',
    certified: 'Certified Operator',
    certifiedDesc: 'TAI & TAN',
    availableToday: 'Available today',
  },
};

export default function HeroCards({ locale, featuredTour, featuredDestination, hasPopularData }: HeroCardsProps) {
  const t = translations[locale as keyof typeof translations] || translations.es;
  const bookings = recentBookings[locale as keyof typeof recentBookings] || recentBookings.es;
  const { formatPrice } = useCurrency();

  // Rotate through social proof messages
  const [currentBooking, setCurrentBooking] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentBooking((prev) => (prev + 1) % bookings.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [bookings.length]);

  // Use featured tour or destination
  const featured = featuredTour || featuredDestination;
  const featuredType = featuredTour ? 'air-tours' : 'charter-flights';
  const featuredName = featured
    ? (locale === 'es' ? featured.name_es : featured.name_en)
    : null;

  return (
    <div className="grid gap-3">
      {/* Featured Tour/Destination Card */}
      {featured && (
        <Link
          href={`/${locale}/${featuredType}/${featured.slug}`}
          className="group card p-0 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <div className="relative">
            {/* Image */}
            <div className="relative h-32 overflow-hidden">
              {featured.image_url ? (
                <Image
                  src={featured.image_url}
                  alt={featuredName || (locale === 'es' ? 'Destino destacado - Vuelatour' : 'Featured destination - Vuelatour')}
                  fill
                  sizes="400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Badge - shows "Most Popular" if based on real data, "Featured" otherwise */}
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-brand-500 text-white text-xs font-medium">
                <FireIcon className="w-3 h-3" />
                {hasPopularData ? t.popular : t.featured}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate group-hover:text-brand-600 transition-colors">
                    {featuredName}
                  </h3>
                  {featured.duration && (
                    <div className="flex items-center gap-1 text-sm text-muted mt-1">
                      <ClockIcon className="w-4 h-4" />
                      {featured.duration}
                    </div>
                  )}
                </div>
                {featured.price_from && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-muted">{t.from}</div>
                    <div className="font-bold text-brand-600">
                      {formatPrice(featured.price_from)}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-brand-600 font-medium group-hover:underline">
                  {t.viewMore} →
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Social Proof Card - Rotating */}
      <div className="card p-4 overflow-hidden">
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
            <UserGroupIcon className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <span className="font-semibold">{bookings[currentBooking].name}</span>
              <span className="text-muted"> de {bookings[currentBooking].city}</span>
            </div>
            <div className="text-xs text-muted truncate">
              {t.socialProof} <span className="text-brand-600">{bookings[currentBooking].service}</span> · {bookings[currentBooking].time}
            </div>
          </div>
        </div>
      </div>

      {/* Certification Badge */}
      <div className="card p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckBadgeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="text-sm font-medium">{t.certified}</div>
            <div className="text-xs text-muted">{t.certifiedDesc}</div>
          </div>
        </div>
      </div>

      {/* TripAdvisor Rating Widget */}
      <div className="card p-3">
        <TripAdvisorRatingWidget locale={locale} />
      </div>
    </div>
  );
}
