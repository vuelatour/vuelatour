import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import CharterFlightsContent from './CharterFlightsContent';

interface CharterFlightsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CharterFlightsPageProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: 'Vuelos Privados en Cancún | Charter a Cozumel, Holbox, Mérida | Vuelatour',
    en: 'Private Charter Flights in Cancún | Fly to Cozumel, Holbox, Mérida | Vuelatour',
  };

  const descriptions = {
    es: 'Vuelos privados desde Cancún a Cozumel, Holbox, Mérida, Tulum y más destinos del Caribe mexicano. Servicio exclusivo, horarios flexibles. Reserva hoy.',
    en: 'Private charter flights from Cancún to Cozumel, Holbox, Mérida, Tulum and more Mexican Caribbean destinations. Exclusive service, flexible schedules. Book today.',
  };

  const title = titles[locale as keyof typeof titles] || titles.es;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.es;

  return {
    title,
    description,
    keywords: locale === 'es'
      ? 'vuelos privados cancun, charter cozumel, vuelo holbox, avion privado merida, vuelos ejecutivos cancun'
      : 'private flights cancun, charter cozumel, holbox flight, private plane merida, executive flights cancun',
    openGraph: {
      title,
      description,
      url: `https://vuelatour.com/${locale}/charter-flights`,
      siteName: 'Vuelatour',
      images: [
        {
          url: 'https://vuelatour.com/images/og/og-image.jpg',
          width: 1200,
          height: 630,
          alt: locale === 'es' ? 'Vuelos privados en Cancún - Vuelatour' : 'Private charter flights in Cancún - Vuelatour',
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
      canonical: `https://vuelatour.com/${locale}/charter-flights`,
      languages: {
        'es': 'https://vuelatour.com/es/charter-flights',
        'en': 'https://vuelatour.com/en/charter-flights',
      },
    },
  };
}

export default async function CharterFlightsPage({ params }: CharterFlightsPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // Fetch all active destinations
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return <CharterFlightsContent locale={locale} destinations={destinations || []} />;
}
