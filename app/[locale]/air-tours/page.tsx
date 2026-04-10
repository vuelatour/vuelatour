import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AirToursContent from './AirToursContent';

interface AirToursPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AirToursPageProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: 'Tours Aéreos en Cancún | Vuelos Panorámicos sobre Chichén Itzá y Tulum | Vuelatour',
    en: 'Cancún Airplane Tours | Scenic Plane Tours over Chichén Itzá & Tulum | Vuelatour',
  };

  const descriptions = {
    es: 'Tours aéreos y vuelos panorámicos en Cancún desde $299 USD. Sobrevuela Chichén Itzá, Tulum, la Zona Hotelera e Isla Mujeres en avioneta privada. Pilotos certificados, 25+ años de experiencia. Reserva hoy.',
    en: 'Cancún airplane tours and scenic plane tours from $299 USD. Fly over Chichén Itzá, Tulum, the Hotel Zone and Isla Mujeres in a private aircraft. Certified pilots, 25+ years experience. Book today.',
  };

  const title = titles[locale as keyof typeof titles] || titles.es;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.es;

  return {
    title,
    description,
    keywords: locale === 'es'
      ? 'tours aereos cancun, vuelo panoramico cancun, tour aereo tulum, vuelo chichen itza, paseo aereo riviera maya, avioneta cancun, vuelo panoramico tulum'
      : 'cancun airplane tours, cancun plane tours, scenic flight cancun, tulum air tour, chichen itza flight tour, cancun aerial tour, private plane tour cancun',
    openGraph: {
      title,
      description,
      url: `https://www.vuelatour.com/${locale}/air-tours`,
      siteName: 'Vuelatour',
      images: [
        {
          url: 'https://www.vuelatour.com/images/og/og-image.jpg',
          width: 1200,
          height: 630,
          alt: locale === 'es' ? 'Tours aéreos en Cancún - Vuelatour' : 'Air tours in Cancún - Vuelatour',
        },
      ],
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.vuelatour.com/images/og/og-image.jpg'],
    },
    alternates: {
      canonical: `https://www.vuelatour.com/${locale}/air-tours`,
      languages: {
        'es': 'https://www.vuelatour.com/es/air-tours',
        'en': 'https://www.vuelatour.com/en/air-tours',
        'x-default': 'https://www.vuelatour.com/en/air-tours',
      },
    },
  };
}

export default async function AirToursPage({ params }: AirToursPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // Fetch tours and SEO content in parallel
  const [{ data: tours }, { data: seoRows }] = await Promise.all([
    supabase
      .from('air_tours')
      .select('id, slug, name_es, name_en, description_es, description_en, duration, price_from, image_url, highlights_es, highlights_en, aircraft_pricing')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('site_content')
      .select('key, value_es, value_en')
      .in('key', ['tours_seo_title', 'tours_seo_content']),
  ]);

  // Pick localized value for each key
  const seoMap = Object.fromEntries(
    (seoRows || []).map((row) => [row.key, locale === 'es' ? row.value_es : row.value_en])
  );

  return (
    <AirToursContent
      locale={locale}
      tours={tours || []}
      seoTitle={seoMap.tours_seo_title || null}
      seoContent={seoMap.tours_seo_content || null}
    />
  );
}
