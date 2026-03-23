import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import FleetPageContent from './FleetPageContent';

interface FleetPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FleetPageProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: 'Nuestra Flota | Aeronaves para Vuelos Privados y Tours Aéreos | Vuelatour',
    en: 'Our Fleet | Aircraft for Charter Flights and Air Tours | Vuelatour',
  };

  const descriptions = {
    es: 'Conoce nuestra flota de aeronaves para vuelos privados y tours aéreos en Cancún. Cessna 206, Cessna 182, Kodiak 100, Piper Seneca V.',
    en: 'Discover our aircraft fleet for charter flights and air tours in Cancún. Cessna 206, Cessna 182, Kodiak 100, Piper Seneca V.',
  };

  const title = titles[locale as keyof typeof titles] || titles.es;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.es;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.vuelatour.com/${locale}/fleet`,
      siteName: 'Vuelatour',
      images: [
        {
          url: 'https://www.vuelatour.com/images/og/og-image.jpg',
          width: 1200,
          height: 630,
          alt: locale === 'es' ? 'Flota de Vuelatour' : 'Vuelatour Fleet',
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
      canonical: `https://www.vuelatour.com/${locale}/fleet`,
      languages: {
        'es': 'https://www.vuelatour.com/es/fleet',
        'en': 'https://www.vuelatour.com/en/fleet',
        'x-default': 'https://www.vuelatour.com/en/fleet',
      },
    },
  };
}

export default async function FleetPage({ params }: FleetPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: aircraft } = await supabase
    .from('aircraft')
    .select('id, name, slug, max_passengers, description_es, description_en, image_url, specs')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return <FleetPageContent locale={locale} aircraft={aircraft || []} />;
}
