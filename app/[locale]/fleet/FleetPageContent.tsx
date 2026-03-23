'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import LazySection from '@/components/ui/LazySection';

interface FleetAircraft {
  id: string;
  name: string;
  slug: string;
  max_passengers: number;
  description_es: string | null;
  description_en: string | null;
  image_url: string | null;
  specs: Record<string, string> | null;
}

interface FleetPageContentProps {
  locale: string;
  aircraft: FleetAircraft[];
}

const translations = {
  es: {
    title: 'Nuestra Flota',
    subtitle: 'Aeronaves para cada tipo de experiencia',
    description: 'Contamos con una flota de aeronaves modernas y bien mantenidas, listas para ofrecerte la mejor experiencia en vuelos privados y tours aéreos en Cancún y la Riviera Maya.',
    passengers: 'pasajeros',
    getQuote: 'Cotizar con esta aeronave',
    specs: 'Especificaciones',
    specLabels: {
      engine: 'Motor',
      cruise_speed: 'Velocidad crucero',
      range: 'Alcance',
      ceiling: 'Techo de vuelo',
    } as Record<string, string>,
    noPhoto: 'Foto próximamente',
  },
  en: {
    title: 'Our Fleet',
    subtitle: 'Aircraft for every type of experience',
    description: 'We have a fleet of modern and well-maintained aircraft, ready to offer you the best experience in charter flights and air tours in Cancún and the Riviera Maya.',
    passengers: 'passengers',
    getQuote: 'Get a quote with this aircraft',
    specs: 'Specifications',
    specLabels: {
      engine: 'Engine',
      cruise_speed: 'Cruise speed',
      range: 'Range',
      ceiling: 'Service ceiling',
    } as Record<string, string>,
    noPhoto: 'Photo coming soon',
  },
};

export default function FleetPageContent({ locale, aircraft }: FleetPageContentProps) {
  const t = translations[locale as keyof typeof translations] || translations.es;

  return (
    <main className="min-h-screen pt-28 md:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg text-brand-600 dark:text-brand-400 font-medium mb-3">
            {t.subtitle}
          </p>
          <p className="text-muted max-w-3xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Aircraft Grid */}
        <LazySection>
          <div className="grid md:grid-cols-2 gap-8">
            {aircraft.map((plane) => {
              const description = locale === 'es' ? plane.description_es : plane.description_en;
              const hasSpecs = plane.specs && Object.values(plane.specs).some(v => v);

              return (
                <div
                  key={plane.id}
                  className="card overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-64 bg-gray-100 dark:bg-navy-800 overflow-hidden">
                    {plane.image_url ? (
                      <Image
                        src={plane.image_url}
                        alt={plane.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-muted text-sm">{t.noPhoto}</p>
                      </div>
                    )}
                    {/* Passengers badge */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-navy-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <UserGroupIcon className="w-4 h-4 text-brand-600" />
                      <span className="text-sm font-medium">
                        {plane.max_passengers} {t.passengers}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2">{plane.name}</h2>
                    {description && (
                      <p className="text-muted mb-4">{description}</p>
                    )}

                    {/* Specs */}
                    {hasSpecs && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold mb-2 text-foreground">{t.specs}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(plane.specs!).map(([key, value]) => {
                            if (!value) return null;
                            return (
                              <div key={key} className="text-sm">
                                <span className="text-muted">{t.specLabels[key] || key}: </span>
                                <span className="font-medium">{value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <Link
                      href={`/${locale}/contact?aircraft=${encodeURIComponent(plane.name)}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {t.getQuote}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </LazySection>
      </div>
    </main>
  );
}
