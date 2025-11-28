'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CameraIcon,
  SparklesIcon,
  SunIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useCurrency } from '@/contexts/CurrencyContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Benefit {
  key: string;
  title_es: string;
  title_en: string;
  desc_es: string;
  desc_en: string;
}

interface Destination {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  long_description_es?: string | null;
  long_description_en?: string | null;
  flight_time: string | null;
  price_from: number | null;
  image_url: string | null;
  services_included?: string[] | null;
  benefits?: Benefit[] | null;
  max_passengers?: number | null;
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

interface DestinationDetailContentProps {
  locale: string;
  destination: Destination;
  otherDestinations: Destination[];
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

// Default benefits (fallback)
const DEFAULT_BENEFITS: Benefit[] = [
  { key: 'time', title_es: 'Ahorra tiempo', title_en: 'Save time', desc_es: 'Evita largas horas de carretera y llega en minutos', desc_en: 'Avoid long road trips and arrive in minutes' },
  { key: 'comfort', title_es: 'Máximo confort', title_en: 'Maximum comfort', desc_es: 'Viaja en avioneta privada con todas las comodidades', desc_en: 'Travel in a private aircraft with all amenities' },
  { key: 'views', title_es: 'Vistas increíbles', title_en: 'Incredible views', desc_es: 'Disfruta del paisaje del Caribe desde las alturas', desc_en: 'Enjoy the Caribbean landscape from above' },
  { key: 'flexible', title_es: 'Horarios flexibles', title_en: 'Flexible schedules', desc_es: 'Elige el horario que mejor se adapte a tu itinerario', desc_en: 'Choose the time that best fits your itinerary' },
];

const translations = {
  es: {
    backToFlights: 'Ver todos los destinos',
    flightTime: 'Tiempo de vuelo',
    from: 'Desde',
    perPerson: 'por persona',
    bookNow: 'Reservar ahora',
    callUs: 'Llamar ahora',
    servicesIncluded: 'Servicios incluidos',
    whyChoose: '¿Por qué volar a',
    otherDestinations: 'Otros destinos populares',
    viewDestination: 'Ver destino',
    ctaTitle: '¿Listo para tu aventura?',
    ctaDesc: 'Contacta con nosotros para reservar tu vuelo privado y vivir una experiencia inolvidable.',
    contactNow: 'Contactar ahora',
    passengers: 'pasajeros',
    upTo: 'Hasta',
  },
  en: {
    backToFlights: 'View all destinations',
    flightTime: 'Flight time',
    from: 'From',
    perPerson: 'per person',
    bookNow: 'Book now',
    callUs: 'Call us',
    servicesIncluded: 'Services included',
    whyChoose: 'Why fly to',
    otherDestinations: 'Other popular destinations',
    viewDestination: 'View destination',
    ctaTitle: 'Ready for your adventure?',
    ctaDesc: 'Contact us to book your private flight and experience something unforgettable.',
    contactNow: 'Contact us now',
    passengers: 'passengers',
    upTo: 'Up to',
  },
};

export default function DestinationDetailContent({
  locale,
  destination,
  otherDestinations,
  availableServices,
}: DestinationDetailContentProps) {
  const t = translations[locale as keyof typeof translations] || translations.es;
  const { formatPrice } = useCurrency();

  const name = locale === 'es' ? destination.name_es : destination.name_en;
  const description = locale === 'es'
    ? (destination.long_description_es || destination.description_es)
    : (destination.long_description_en || destination.description_en);

  // Get services to display from database
  const selectedServiceKeys = destination.services_included || [];
  const servicesToShow = availableServices.filter(s => selectedServiceKeys.includes(s.key));

  // Get benefits to display (use database values or defaults)
  const benefitsToShow = destination.benefits && destination.benefits.length > 0
    ? destination.benefits
    : DEFAULT_BENEFITS;

  const maxPassengers = destination.max_passengers || 5;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {destination.image_url ? (
            <Image
              src={destination.image_url}
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
                href={`/${locale}/charter-flights`}
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-6"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                {t.backToFlights}
              </Link>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPinIcon className="w-5 h-5 text-brand-400" />
                    <span className="text-brand-400 font-medium">Cancún → {name}</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {name}
                  </h1>
                  {destination.flight_time && (
                    <div className="flex items-center gap-2 text-white/80">
                      <ClockIcon className="w-5 h-5" />
                      <span>{t.flightTime}: {destination.flight_time}</span>
                    </div>
                  )}
                </div>

                {destination.price_from && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <p className="text-white/70 text-sm mb-1">{t.from}</p>
                    <p className="text-4xl font-bold text-white">
                      {formatPrice(destination.price_from)}
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
              {/* Left Column - Description and Benefits */}
              <div className="lg:col-span-2 space-y-12">
                {/* Description */}
                {description && (
                  <div>
                    <p className="text-lg md:text-xl text-muted leading-relaxed">
                      {description}
                    </p>
                  </div>
                )}

                {/* Services Included */}
                <div className="bg-gradient-to-br from-brand-50 to-white dark:from-navy-900 dark:to-navy-950 rounded-3xl p-8 border border-brand-100 dark:border-brand-900">
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
                          className="flex items-center gap-3 p-4 bg-white dark:bg-navy-800 rounded-xl shadow-sm"
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

                {/* Why Choose */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-8">
                    {t.whyChoose} {name}?
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {benefitsToShow.map((benefit) => {
                      const title = locale === 'es' ? benefit.title_es : benefit.title_en;
                      const desc = locale === 'es' ? benefit.desc_es : benefit.desc_en;
                      return (
                        <div
                          key={benefit.key}
                          className="flex gap-4 p-6 bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                        >
                          <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-900/50 h-fit">
                            <PaperAirplaneIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">{title}</h3>
                            <p className="text-muted text-sm">{desc}</p>
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
                    <p className="text-sm text-muted mb-2">{t.from}</p>
                    <p className="text-4xl font-bold text-brand-600 dark:text-brand-400">
                      {destination.price_from ? formatPrice(destination.price_from) : '-'}
                    </p>
                    <p className="text-sm text-muted">{t.perPerson}</p>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-6 py-3 border-y border-gray-100 dark:border-navy-800">
                    <UserGroupIcon className="w-5 h-5 text-brand-500" />
                    <span className="text-sm font-medium">{t.upTo} {maxPassengers} {t.passengers}</span>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href={`/${locale}/contact?destination=${destination.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
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

        {/* Other Destinations */}
        {otherDestinations.length > 0 && (
          <section className="py-16 md:py-20 bg-gray-50 dark:bg-navy-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
                {t.otherDestinations}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {otherDestinations.map((dest) => {
                  const destName = locale === 'es' ? dest.name_es : dest.name_en;
                  return (
                    <Link
                      key={dest.id}
                      href={`/${locale}/charter-flights/${dest.slug}`}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
                    >
                      {dest.image_url ? (
                        <Image
                          src={dest.image_url}
                          alt={destName}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{destName}</h3>
                        <div className="flex items-center justify-between">
                          {dest.price_from && (
                            <span className="text-brand-300 font-semibold">
                              {formatPrice(dest.price_from)}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
                            {t.viewDestination}
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
            <PaperAirplaneIcon className="w-16 h-16 text-white/30 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              {t.ctaTitle}
            </h2>
            <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
              {t.ctaDesc}
            </p>
            <Link
              href={`/${locale}/contact?destination=${destination.slug}`}
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
