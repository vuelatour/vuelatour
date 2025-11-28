'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  ClockIcon,
  PhoneIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CameraIcon,
  SparklesIcon,
  SunIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Feature {
  key: string;
  title_es: string;
  title_en: string;
  desc_es: string;
  desc_en: string;
}

interface AirTour {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  long_description_es?: string | null;
  long_description_en?: string | null;
  duration: string | null;
  price_from: number | null;
  image_url: string | null;
  highlights_es: string[] | null;
  highlights_en: string[] | null;
  services_included?: string[] | null;
  features?: Feature[] | null;
  max_passengers?: number | null;
  departure_location_es?: string | null;
  departure_location_en?: string | null;
}

interface ServiceOption {
  id: string;
  key: string;
  label_es: string;
  label_en: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

interface TourDetailContentProps {
  locale: string;
  tour: AirTour;
  otherTours: AirTour[];
  availableServices: ServiceOption[];
}

// Icon mapping for dynamic services
const ICON_MAP: { [key: string]: any } = {
  SunIcon,
  SparklesIcon,
  CameraIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserGroupIcon,
};

// Default features (fallback)
const DEFAULT_FEATURES: Feature[] = [
  { key: 'views', title_es: 'Vistas panorámicas', title_en: 'Panoramic views', desc_es: 'Observa paisajes increíbles desde las alturas', desc_en: 'Observe incredible landscapes from the heights' },
  { key: 'comfort', title_es: 'Vuelo cómodo', title_en: 'Comfortable flight', desc_es: 'Avionetas modernas y bien mantenidas', desc_en: 'Modern and well-maintained aircraft' },
  { key: 'memories', title_es: 'Recuerdos inolvidables', title_en: 'Unforgettable memories', desc_es: 'Llévate fotos espectaculares de tu aventura', desc_en: 'Take spectacular photos of your adventure' },
  { key: 'expert', title_es: 'Pilotos expertos', title_en: 'Expert pilots', desc_es: 'Más de 15 años de experiencia en la región', desc_en: 'Over 15 years of experience in the region' },
];

const translations = {
  es: {
    backToTours: 'Ver todos los tours',
    duration: 'Duración',
    from: 'Desde',
    perPerson: 'por persona',
    bookNow: 'Reservar ahora',
    callUs: 'Llamar ahora',
    highlights: 'Lo que verás',
    servicesIncluded: 'Incluido en el tour',
    experience: 'Una experiencia única',
    experienceDesc: 'Nuestros tours aéreos te permiten ver el Caribe mexicano como nunca antes. Vuela sobre playas de arena blanca, ruinas mayas ancestrales, y la selva tropical en una experiencia que recordarás para siempre.',
    otherTours: 'Otros tours que te pueden interesar',
    viewTour: 'Ver tour',
    ctaTitle: '¿Listo para ver el Caribe desde el cielo?',
    ctaDesc: 'Reserva tu tour aéreo y vive una aventura panorámica que nunca olvidarás.',
    contactNow: 'Reservar ahora',
    passengers: 'pasajeros',
    upTo: 'Hasta',
    reviews: 'reseñas',
    departure: 'Despegue desde',
  },
  en: {
    backToTours: 'View all tours',
    duration: 'Duration',
    from: 'From',
    perPerson: 'per person',
    bookNow: 'Book now',
    callUs: 'Call us',
    highlights: 'What you\'ll see',
    servicesIncluded: 'Included in the tour',
    experience: 'A unique experience',
    experienceDesc: 'Our air tours allow you to see the Mexican Caribbean like never before. Fly over white sand beaches, ancient Mayan ruins, and tropical jungle in an experience you\'ll remember forever.',
    otherTours: 'Other tours you might like',
    viewTour: 'View tour',
    ctaTitle: 'Ready to see the Caribbean from the sky?',
    ctaDesc: 'Book your air tour and live a panoramic adventure you\'ll never forget.',
    contactNow: 'Book now',
    passengers: 'passengers',
    upTo: 'Up to',
    reviews: 'reviews',
    departure: 'Departure from',
  },
};

export default function TourDetailContent({
  locale,
  tour,
  otherTours,
  availableServices,
}: TourDetailContentProps) {
  const t = translations[locale as keyof typeof translations] || translations.es;
  const { formatPrice } = useCurrency();

  const name = locale === 'es' ? tour.name_es : tour.name_en;
  const description = locale === 'es'
    ? (tour.long_description_es || tour.description_es)
    : (tour.long_description_en || tour.description_en);
  const highlights = locale === 'es' ? tour.highlights_es : tour.highlights_en;
  const departureLocation = locale === 'es'
    ? (tour.departure_location_es || 'Aeropuerto de Cancún')
    : (tour.departure_location_en || 'Cancún Airport');

  // Get services to display from database
  const selectedServiceKeys = tour.services_included || [];
  const servicesToShow = availableServices.filter(s => selectedServiceKeys.includes(s.key));

  // Get features to display (use database values or defaults)
  const featuresToShow = tour.features && tour.features.length > 0
    ? tour.features
    : DEFAULT_FEATURES;

  const maxPassengers = tour.max_passengers || 5;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {tour.image_url ? (
            <Image
              src={tour.image_url}
              alt={name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-800" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <Link
                href={`/${locale}/air-tours`}
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-6"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                {t.backToTours}
              </Link>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-white/80 text-sm">4.9 (150+ {t.reviews})</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/80">
                    {tour.duration && (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5" />
                        <span>{t.duration}: {tour.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{t.departure}: {departureLocation}</span>
                    </div>
                  </div>
                </div>

                {tour.price_from && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <p className="text-white/70 text-sm mb-1">{t.from}</p>
                    <p className="text-4xl font-bold text-white">
                      {formatPrice(tour.price_from)}
                    </p>
                    <p className="text-white/70 text-sm">{t.perPerson}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Left Column - Description and Details */}
              <div className="lg:col-span-2 space-y-12">
                {/* Description */}
                {description && (
                  <div>
                    <p className="text-lg md:text-xl text-muted leading-relaxed">
                      {description}
                    </p>
                  </div>
                )}

                {/* Highlights */}
                {highlights && highlights.length > 0 && (
                  <div className="bg-gradient-to-br from-brand-50 to-white dark:from-navy-900 dark:to-navy-950 rounded-3xl p-8 border border-brand-100 dark:border-brand-900">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <GlobeAmericasIcon className="w-7 h-7 text-brand-500" />
                      {t.highlights}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {highlights.map((highlight, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-white dark:bg-navy-800 rounded-xl shadow-sm"
                        >
                          <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/50">
                            <CheckCircleIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                          </div>
                          <span className="font-medium">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Included */}
                {servicesToShow.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <CheckCircleIcon className="w-7 h-7 text-brand-500" />
                      {t.servicesIncluded}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {servicesToShow.map((service) => {
                        const ServiceIcon = ICON_MAP[service.icon] || CheckCircleIcon;
                        const label = locale === 'es' ? service.label_es : service.label_en;
                        return (
                          <div
                            key={service.key}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 rounded-xl border border-gray-100 dark:border-navy-800"
                          >
                            <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/50">
                              <ServiceIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Experience Section */}
                <div className="bg-navy-900 dark:bg-navy-950 rounded-3xl p-8 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {t.experience}
                  </h2>
                  <p className="text-gray-300 mb-8">
                    {t.experienceDesc}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {featuresToShow.map((feature) => {
                      const title = locale === 'es' ? feature.title_es : feature.title_en;
                      const desc = locale === 'es' ? feature.desc_es : feature.desc_en;
                      return (
                        <div key={feature.key} className="flex gap-4">
                          <div className="p-3 rounded-xl bg-brand-500/20 h-fit">
                            <StarIcon className="w-6 h-6 text-brand-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">{title}</h3>
                            <p className="text-gray-400 text-sm">{desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white dark:bg-navy-900 rounded-3xl border border-gray-200 dark:border-navy-800 p-6 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted mb-4">4.9/5 (150+ {t.reviews})</p>
                    <p className="text-sm text-muted mb-2">{t.from}</p>
                    <p className="text-4xl font-bold text-brand-600 dark:text-brand-400">
                      {tour.price_from ? formatPrice(tour.price_from) : '-'}
                    </p>
                    <p className="text-sm text-muted">{t.perPerson}</p>
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-6 py-3 border-y border-gray-100 dark:border-navy-800">
                    <div className="flex items-center gap-2 text-sm">
                      <UserGroupIcon className="w-5 h-5 text-brand-500" />
                      <span className="font-medium">{t.upTo} {maxPassengers} {t.passengers}</span>
                    </div>
                    {tour.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <ClockIcon className="w-5 h-5 text-brand-500" />
                        <span className="font-medium">{tour.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Link
                      href={`/${locale}/contact?tour=${tour.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors"
                    >
                      <GlobeAmericasIcon className="w-5 h-5" />
                      {t.bookNow}
                    </Link>
                    <a
                      href="tel:+529987407149"
                      className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-navy-900 dark:bg-white hover:bg-navy-800 dark:hover:bg-gray-100 text-white dark:text-navy-900 font-bold rounded-xl transition-colors"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      {t.callUs}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Tours */}
        {otherTours.length > 0 && (
          <section className="py-16 md:py-20 bg-gray-50 dark:bg-navy-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
                {t.otherTours}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {otherTours.map((otherTour) => {
                  const tourName = locale === 'es' ? otherTour.name_es : otherTour.name_en;
                  return (
                    <Link
                      key={otherTour.id}
                      href={`/${locale}/air-tours/${otherTour.slug}`}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
                    >
                      {otherTour.image_url ? (
                        <Image
                          src={otherTour.image_url}
                          alt={tourName}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{tourName}</h3>
                        <div className="flex items-center justify-between">
                          {otherTour.price_from && (
                            <span className="text-brand-300 font-semibold">
                              {formatPrice(otherTour.price_from)}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
                            {t.viewTour}
                            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-brand-600 to-brand-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <GlobeAmericasIcon className="w-16 h-16 text-white/30 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              {t.ctaTitle}
            </h2>
            <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
              {t.ctaDesc}
            </p>
            <Link
              href={`/${locale}/contact?tour=${tour.slug}`}
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
