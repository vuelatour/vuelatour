import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AirToursContent from './AirToursContent';

interface AirToursPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AirToursPageProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: 'Tours Aéreos en Cancún | Sobrevuela Chichén Itzá, Tulum, Isla Mujeres | Vuelatour',
    en: 'Air Tours in Cancún | Fly Over Chichén Itzá, Tulum, Isla Mujeres | Vuelatour',
  };

  const descriptions = {
    es: 'Tours aéreos panorámicos en Cancún y Riviera Maya. Sobrevuela Chichén Itzá, Tulum, la Zona Hotelera e Isla Mujeres. Experiencia única e inolvidable. Reserva hoy.',
    en: 'Panoramic air tours in Cancún and Riviera Maya. Fly over Chichén Itzá, Tulum, Hotel Zone and Isla Mujeres. Unique and unforgettable experience. Book today.',
  };

  const title = titles[locale as keyof typeof titles] || titles.es;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.es;

  return {
    title,
    description,
    keywords: locale === 'es'
      ? 'tours aereos cancun, vuelo chichen itza, tour aereo tulum, paseo aereo riviera maya, vuelo panoramico cancun'
      : 'air tours cancun, chichen itza flight, tulum air tour, riviera maya aerial tour, panoramic flight cancun',
    openGraph: {
      title,
      description,
      url: `https://vuelatour.com/${locale}/air-tours`,
      siteName: 'Vuelatour',
      images: [
        {
          url: 'https://vuelatour.com/images/og/og-image.jpg',
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
      images: ['https://vuelatour.com/images/og/og-image.jpg'],
    },
    alternates: {
      canonical: `https://vuelatour.com/${locale}/air-tours`,
      languages: {
        'es': 'https://vuelatour.com/es/air-tours',
        'en': 'https://vuelatour.com/en/air-tours',
      },
    },
  };
}

export default async function AirToursPage({ params }: AirToursPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // Fetch all active tours
  const { data: tours } = await supabase
    .from('air_tours')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return <AirToursContent locale={locale} tours={tours || []} />;
}
