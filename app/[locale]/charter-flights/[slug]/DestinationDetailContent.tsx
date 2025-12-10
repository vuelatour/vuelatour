'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeftIcon,
  ClockIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SparklesIcon,
  SunIcon,
  CameraIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useCurrency } from '@/contexts/CurrencyContext';
import LazySection from '@/components/ui/LazySection';
import { trackItemView } from '@/lib/analytics';

interface Benefit {
  key: string;
  title_es: string;
  title_en: string;
  desc_es: string;
  desc_en: string;
}

interface AircraftPricing {
  aircraft_name: string;
  max_passengers: number;
  price_usd: number;
  notes_es: string;
  notes_en: string;
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
  aircraft_pricing?: AircraftPricing[] | null;
  gallery_images?: string[] | null;
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
    pricingTitle: 'Tarifas de vuelo',
    forUpTo: 'Para hasta',
    moreInfoAbout: 'Más información sobre la',
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
    pricingTitle: 'Flight rates',
    forUpTo: 'For up to',
    moreInfoAbout: 'More info about the',
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

  // Get aircraft pricing
  const aircraftPricing = destination.aircraft_pricing && destination.aircraft_pricing.length > 0
    ? destination.aircraft_pricing
    : null;

  // Get minimum price from aircraft pricing or fallback to price_from
  const minPrice = aircraftPricing
    ? Math.min(...aircraftPricing.map(p => p.price_usd))
    : destination.price_from;

  // Gallery images (only show if explicitly set in admin)
  const galleryImages = destination.gallery_images && destination.gallery_images.length > 0
    ? destination.gallery_images
    : [];
  const hasGallery = galleryImages.length > 0;

  // Track destination view on mount
  useEffect(() => {
    trackItemView('destination', name, destination.id);
  }, [name, destination.id]);

  // Carousel and Lightbox state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextLightboxImage = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };

  const prevLightboxImage = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <>
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {destination.image_url ? (
            <Image
              src={destination.image_url}
              alt={locale === 'es'
                ? `Vuelo privado a ${name} - Vista aérea del destino - Vuelatour`
                : `Private flight to ${name} - Aerial view of destination - Vuelatour`}
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
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    {name}
                  </h1>
                  {destination.flight_time && (
                    <div className="flex items-center gap-2 text-white/80">
                      <ClockIcon className="w-5 h-5" />
                      <span>{t.flightTime}: {destination.flight_time}</span>
                    </div>
                  )}
                </div>

                {minPrice && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <p className="text-white/70 text-sm mb-1">{t.from}</p>
                    <p className="text-4xl font-bold text-white">
                      ${minPrice.toLocaleString()} USD
                    </p>
                    <p className="text-white/70 text-sm">{aircraftPricing ? `${aircraftPricing.length} ${locale === 'es' ? 'opciones de avión' : 'aircraft options'}` : t.perPerson}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Pricing Cards - First for better conversion */}
            {aircraftPricing && aircraftPricing.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  {t.pricingTitle}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aircraftPricing.map((pricing, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-navy-900 rounded-2xl border-2 border-gray-100 dark:border-navy-800 p-6 shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted">
                            {t.forUpTo} {pricing.max_passengers} {t.passengers}
                          </p>
                          <p className="text-3xl font-bold text-foreground">
                            ${pricing.price_usd.toLocaleString()} <span className="text-lg font-normal text-muted">USD</span>
                          </p>
                        </div>
                        <div className="py-2 px-4 bg-brand-50 dark:bg-brand-900/30 rounded-xl">
                          <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm">
                            {pricing.aircraft_name}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted mb-4">
                        {locale === 'es' ? pricing.notes_es : pricing.notes_en}
                      </p>
                      <Link
                        href={`/${locale}/contact?destination=${destination.slug}&aircraft=${encodeURIComponent(pricing.aircraft_name)}&price=${pricing.price_usd}`}
                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        {t.bookNow}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery and Description Section */}
            {(hasGallery || description) && (
              <div className={`mb-16 grid gap-8 items-start ${hasGallery && description ? 'lg:grid-cols-2' : ''}`}>
                {/* Gallery Carousel */}
                {hasGallery && (
                  <div className="relative group">
                    {/* Main Carousel Image */}
                    <div
                      className="aspect-[4/3] relative rounded-2xl overflow-hidden cursor-pointer"
                      onClick={openLightbox}
                    >
                      <Image
                        src={galleryImages[currentSlide]}
                        alt={locale === 'es'
                          ? `Vuelo privado a ${name} - Galería imagen ${currentSlide + 1} de ${galleryImages.length} - Vuelatour`
                          : `Private flight to ${name} - Gallery image ${currentSlide + 1} of ${galleryImages.length} - Vuelatour`}
                        fill
                        className="object-cover transition-all duration-500"
                      />
                      {/* Image counter */}
                      <div className="absolute top-4 right-4 bg-black/50 px-3 py-1.5 rounded-full text-white text-sm font-medium">
                        {currentSlide + 1} / {galleryImages.length}
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-navy-900/90 hover:bg-white dark:hover:bg-navy-800 text-foreground rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Previous"
                        >
                          <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-navy-900/90 hover:bg-white dark:hover:bg-navy-800 text-foreground rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Next"
                        >
                          <ChevronRightIcon className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Dot Indicators */}
                    {galleryImages.length > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        {galleryImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              idx === currentSlide
                                ? 'bg-brand-500 w-6'
                                : 'bg-gray-300 dark:bg-navy-700 hover:bg-gray-400 dark:hover:bg-navy-600'
                            }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {description && (
                  <div className={hasGallery ? '' : 'max-w-3xl'}>
                    {!description.trim().startsWith('#') && (
                      <h2 className="text-2xl md:text-3xl font-bold mb-6">
                        {locale === 'es' ? 'Sobre este destino' : 'About this destination'}
                      </h2>
                    )}
                    <div className="prose prose-lg dark:prose-invert prose-brand max-w-none">
                      <ReactMarkdown
                        components={{
                          h2: ({ children }) => <h2 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
                          p: ({ children }) => <p className="text-muted leading-relaxed mb-4">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside text-muted space-y-1 mb-4">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside text-muted space-y-1 mb-4">{children}</ol>,
                          li: ({ children }) => <li className="text-muted">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          a: ({ href, children }) => (
                            <a href={href} className="text-brand-500 hover:text-brand-600 underline" target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {description}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Services Included */}
            {servicesToShow.length > 0 && (
              <div className="bg-gradient-to-br from-brand-50 to-white dark:from-navy-900 dark:to-navy-950 rounded-3xl p-8 border border-brand-100 dark:border-brand-900 mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <CheckCircleIcon className="w-7 h-7 text-brand-500" />
                  {t.servicesIncluded}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {servicesToShow.map((service) => {
                    const ServiceIcon = ICON_MAP[service.icon] || CheckCircleIcon;
                    const label = locale === 'es' ? service.label_es : service.label_en;
                    return (
                      <div
                        key={service.key}
                        className="flex flex-col items-center text-center gap-2 p-3 sm:p-4 bg-white dark:bg-navy-800 rounded-xl shadow-sm"
                      >
                        <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/50">
                          <ServiceIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-tight">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Why Choose */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">
                {t.whyChoose} {name}?
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </section>

        {/* Other Destinations */}
        {otherDestinations.length > 0 && (
          <LazySection animation="slide-up" className="py-16 md:py-20 bg-gray-50 dark:bg-navy-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
                {t.otherDestinations}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {otherDestinations.map((dest, index) => {
                  const destName = locale === 'es' ? dest.name_es : dest.name_en;
                  return (
                    <LazySection
                      key={dest.id}
                      animation="scale"
                      delay={index * 100}
                    >
                      <Link
                        href={`/${locale}/charter-flights/${dest.slug}`}
                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden block"
                      >
                        {dest.image_url ? (
                          <Image
                            src={dest.image_url}
                            alt={locale === 'es'
                              ? `Vuelo privado a ${destName} - Vuelatour Cancún`
                              : `Private flight to ${destName} - Vuelatour Cancún`}
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
                    </LazySection>
                  );
                })}
              </div>
            </div>
          </LazySection>
        )}

        {/* Bottom CTA */}
        <LazySection animation="fade" className="py-16 md:py-20 bg-gradient-to-r from-brand-600 to-brand-500">
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
        </LazySection>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && hasGallery && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {/* Navigation - Previous */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevLightboxImage(); }}
              className="absolute left-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryImages[currentSlide]}
              alt={locale === 'es'
                ? `Vuelo privado a ${name} - Imagen ${currentSlide + 1} de ${galleryImages.length} - Vuelatour`
                : `Private flight to ${name} - Image ${currentSlide + 1} of ${galleryImages.length} - Vuelatour`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[85vh]"
            />
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
              {currentSlide + 1} / {galleryImages.length}
            </div>
          </div>

          {/* Navigation - Next */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextLightboxImage(); }}
              className="absolute right-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRightIcon className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
