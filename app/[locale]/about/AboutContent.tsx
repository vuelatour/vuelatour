'use client';

import Link from 'next/link';
import {
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  CheckBadgeIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { getYearsOfExperience } from '@/lib/constants';

interface AboutContentProps {
  locale: string;
}

const translations = {
  es: {
    heroTitle: 'Sobre Vuelatour',
    heroSubtitle: 'Volando sobre el Caribe mexicano desde 2001',
    heroDesc: 'Somos una empresa de aviación mexicana con sede en Cancún, dedicada a ofrecer vuelos privados charter y tours aéreos panorámicos en la Península de Yucatán y más allá.',

    statsYears: 'Años de experiencia',
    statsFlights: 'Vuelos realizados',
    statsRating: 'Calificación promedio',
    statsDestinations: 'Destinos disponibles',

    historyTitle: 'Nuestra historia',
    historyP1: 'Vuelatour nació en 2001 con la visión de hacer accesible la aviación privada en el Caribe mexicano. Desde nuestras primeras operaciones en el Aeropuerto Internacional de Cancún, hemos crecido hasta convertirnos en una referencia en vuelos charter y tours aéreos en la región.',
    historyP2: 'A lo largo de más de dos décadas, hemos transportado miles de pasajeros a destinos como Cozumel, Holbox, Mérida, Playa del Carmen, Chetumal y Mahahual, además de ofrecer experiencias aéreas inolvidables sobrevolando Chichén Itzá, la zona hotelera de Cancún y la Riviera Maya.',
    historyP3: 'Nuestra filosofía se resume en nuestro lema: "Flying is wonderful!" Creemos que cada vuelo es una oportunidad para crear recuerdos extraordinarios, ya sea un viaje de negocios, una escapada romántica o una aventura familiar.',

    safetyTitle: 'Seguridad y certificaciones',
    safetyDesc: 'Tu seguridad es nuestra prioridad absoluta. Cumplimos con los más altos estándares de la aviación mexicana e internacional.',
    certTAI: 'Certificación TAI',
    certTAIDesc: 'Transporte Aéreo Individual — Autorización de la AFAC (Agencia Federal de Aviación Civil) para operar vuelos privados charter con pasajeros.',
    certTAN: 'Certificación TAN',
    certTANDesc: 'Transporte Aéreo No Regular — Permiso para operaciones de vuelo no programadas, lo que nos permite ofrecer horarios 100% flexibles.',
    certMaint: 'Mantenimiento certificado',
    certMaintDesc: 'Todas nuestras aeronaves reciben mantenimiento preventivo y correctivo bajo los estándares de la DGAC y fabricantes, con bitácoras auditables.',
    certPilots: 'Pilotos certificados',
    certPilotsDesc: 'Nuestros pilotos cuentan con licencias vigentes, miles de horas de vuelo y capacitación continua en seguridad operacional.',

    fleetTitle: 'Nuestra flota',
    fleetDesc: 'Contamos con aeronaves modernas y bien mantenidas para cada tipo de experiencia, desde vuelos cortos hasta viajes de mayor alcance.',
    fleetCTA: 'Conocer nuestra flota',

    whyTitle: '¿Por qué elegir Vuelatour?',
    why1Title: 'Experiencia comprobada',
    why1Desc: 'Más de dos décadas operando en el Caribe mexicano nos respaldan. Conocemos cada ruta, cada condición meteorológica y cada detalle para garantizar tu seguridad y comodidad.',
    why2Title: 'Atención personalizada',
    why2Desc: 'No somos una aerolínea masiva. Cada vuelo es personalizado según tus necesidades: horarios, rutas y servicios adaptados a ti.',
    why3Title: 'Precios transparentes',
    why3Desc: 'Cotizaciones claras sin sorpresas. El precio incluye piloto, aeronave, agua, kit de seguridad y la flexibilidad de elegir tu horario.',
    why4Title: 'Disponibilidad todo el año',
    why4Desc: 'Operamos los 365 días del año, de 6:00 AM a 8:00 PM. Si el clima no permite volar, reprogramamos sin costo adicional.',

    ctaTitle: '¿Listo para volar con nosotros?',
    ctaDesc: 'Solicita una cotización sin compromiso y descubre la forma más exclusiva de explorar el Caribe mexicano.',
    ctaButton: 'Solicitar cotización',
    ctaCall: 'Llamar ahora',
  },
  en: {
    heroTitle: 'About Vuelatour',
    heroSubtitle: 'Flying over the Mexican Caribbean since 2001',
    heroDesc: 'We are a Mexican aviation company based in Cancún, dedicated to offering private charter flights and panoramic air tours across the Yucatan Peninsula and beyond.',

    statsYears: 'Years of experience',
    statsFlights: 'Flights completed',
    statsRating: 'Average rating',
    statsDestinations: 'Available destinations',

    historyTitle: 'Our story',
    historyP1: 'Vuelatour was born in 2001 with the vision of making private aviation accessible in the Mexican Caribbean. From our first operations at Cancún International Airport, we have grown to become a reference in charter flights and air tours in the region.',
    historyP2: 'Over more than two decades, we have transported thousands of passengers to destinations like Cozumel, Holbox, Mérida, Playa del Carmen, Chetumal, and Mahahual, while also offering unforgettable aerial experiences flying over Chichén Itzá, the Cancún Hotel Zone, and the Riviera Maya.',
    historyP3: 'Our philosophy is summed up in our motto: "Flying is wonderful!" We believe every flight is an opportunity to create extraordinary memories, whether it\'s a business trip, a romantic getaway, or a family adventure.',

    safetyTitle: 'Safety and certifications',
    safetyDesc: 'Your safety is our absolute priority. We comply with the highest standards of Mexican and international aviation.',
    certTAI: 'TAI Certification',
    certTAIDesc: 'Individual Air Transport — Authorization from AFAC (Federal Civil Aviation Agency) to operate private charter flights with passengers.',
    certTAN: 'TAN Certification',
    certTANDesc: 'Non-Regular Air Transport — Permit for non-scheduled flight operations, allowing us to offer 100% flexible schedules.',
    certMaint: 'Certified maintenance',
    certMaintDesc: 'All our aircraft receive preventive and corrective maintenance under DGAC and manufacturer standards, with auditable logbooks.',
    certPilots: 'Certified pilots',
    certPilotsDesc: 'Our pilots hold current licenses, thousands of flight hours, and continuous training in operational safety.',

    fleetTitle: 'Our fleet',
    fleetDesc: 'We have modern and well-maintained aircraft for every type of experience, from short flights to longer-range trips.',
    fleetCTA: 'Discover our fleet',

    whyTitle: 'Why choose Vuelatour?',
    why1Title: 'Proven experience',
    why1Desc: 'Over two decades operating in the Mexican Caribbean back us up. We know every route, every weather condition, and every detail to guarantee your safety and comfort.',
    why2Title: 'Personalized attention',
    why2Desc: 'We are not a mass airline. Every flight is personalized to your needs: schedules, routes, and services adapted to you.',
    why3Title: 'Transparent pricing',
    why3Desc: 'Clear quotes with no surprises. The price includes pilot, aircraft, water, safety kit, and the flexibility to choose your schedule.',
    why4Title: 'Year-round availability',
    why4Desc: 'We operate 365 days a year, from 6:00 AM to 8:00 PM. If weather doesn\'t allow flying, we reschedule at no additional cost.',

    ctaTitle: 'Ready to fly with us?',
    ctaDesc: 'Request a no-obligation quote and discover the most exclusive way to explore the Mexican Caribbean.',
    ctaButton: 'Request a quote',
    ctaCall: 'Call now',
  },
};

export default function AboutContent({ locale }: AboutContentProps) {
  const t = translations[locale as keyof typeof translations] || translations.es;
  const years = getYearsOfExperience();

  const stats = [
    { value: `${years}+`, label: t.statsYears, icon: ClockIcon },
    { value: '5,000+', label: t.statsFlights, icon: PaperAirplaneIcon },
    { value: '4.9', label: t.statsRating, icon: StarIcon },
    { value: '10+', label: t.statsDestinations, icon: UserGroupIcon },
  ];

  const certifications = [
    { title: t.certTAI, desc: t.certTAIDesc, icon: CheckBadgeIcon },
    { title: t.certTAN, desc: t.certTANDesc, icon: CheckBadgeIcon },
    { title: t.certMaint, desc: t.certMaintDesc, icon: ShieldCheckIcon },
    { title: t.certPilots, desc: t.certPilotsDesc, icon: UserGroupIcon },
  ];

  const whyItems = [
    { title: t.why1Title, desc: t.why1Desc },
    { title: t.why2Title, desc: t.why2Desc },
    { title: t.why3Title, desc: t.why3Desc },
    { title: t.why4Title, desc: t.why4Desc },
  ];

  return (
    <main className="min-h-screen pt-28 md:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.heroTitle}</h1>
          <p className="text-lg text-brand-600 dark:text-brand-400 font-medium mb-4">{t.heroSubtitle}</p>
          <p className="text-muted max-w-3xl mx-auto text-lg">{t.heroDesc}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-6 text-center">
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-brand-600 dark:text-brand-400" />
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{t.historyTitle}</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted leading-relaxed mb-4">{t.historyP1}</p>
            <p className="text-muted leading-relaxed mb-4">{t.historyP2}</p>
            <p className="text-muted leading-relaxed">{t.historyP3}</p>
          </div>
        </section>

        {/* Safety & Certifications */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t.safetyTitle}</h2>
          <p className="text-muted mb-8 text-lg">{t.safetyDesc}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {certifications.map((cert) => (
              <div key={cert.title} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                    <cert.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{cert.title}</h3>
                    <p className="text-muted text-sm">{cert.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fleet CTA */}
        <section className="mb-16 card p-8 text-center bg-gray-50 dark:bg-navy-800/50">
          <PaperAirplaneIcon className="w-10 h-10 mx-auto mb-4 text-brand-600 dark:text-brand-400" />
          <h2 className="text-2xl font-bold mb-3">{t.fleetTitle}</h2>
          <p className="text-muted mb-6 max-w-2xl mx-auto">{t.fleetDesc}</p>
          <Link
            href={`/${locale}/fleet`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
          >
            {t.fleetCTA}
          </Link>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t.whyTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {whyItems.map((item, idx) => (
              <div key={idx} className="card p-6">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="card p-8 md:p-12 text-center bg-brand-600 dark:bg-brand-700 text-white rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-brand-100 mb-8 max-w-2xl mx-auto">{t.ctaDesc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-3 bg-white text-brand-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t.ctaButton}
            </Link>
            <a
              href="tel:+529987407149"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {t.ctaCall}
            </a>
          </div>
        </section>

      </div>
    </main>
  );
}
