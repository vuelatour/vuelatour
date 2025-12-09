import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient, createBuildClient } from '@/lib/supabase/server';
import DestinationDetailContent from './DestinationDetailContent';

interface DestinationDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: DestinationDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!destination) {
    return {
      title: locale === 'es' ? 'Destino no encontrado' : 'Destination not found',
    };
  }

  const name = locale === 'es' ? destination.name_es : destination.name_en;
  const description = locale === 'es' ? destination.description_es : destination.description_en;

  // Use custom meta fields from database if available, otherwise use fallbacks
  const metaTitle = locale === 'es'
    ? (destination.meta_title_es || `Vuelo Privado a ${name} desde Cancún | Vuelatour`)
    : (destination.meta_title_en || `Private Flight to ${name} from Cancún | Vuelatour`);

  const metaDescription = locale === 'es'
    ? (destination.meta_description_es || description || `Vuelo privado desde Cancún a ${name}. Tiempo de vuelo: ${destination.flight_time || '20-45 min'}. Servicio exclusivo y horarios flexibles. Reserva hoy.`)
    : (destination.meta_description_en || description || `Private flight from Cancún to ${name}. Flight time: ${destination.flight_time || '20-45 min'}. Exclusive service and flexible schedules. Book today.`);

  // Get image URL - ensure it's absolute
  const imageUrl = destination.image_url
    ? (destination.image_url.startsWith('http') ? destination.image_url : `https://vuelatour.com${destination.image_url}`)
    : 'https://vuelatour.com/images/og/og-image.jpg';

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: locale === 'es'
      ? `vuelo privado ${name.toLowerCase()}, charter ${name.toLowerCase()}, avion privado cancun ${name.toLowerCase()}`
      : `private flight ${name.toLowerCase()}, charter ${name.toLowerCase()}, private plane cancun ${name.toLowerCase()}`,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://vuelatour.com/${locale}/charter-flights/${slug}`,
      siteName: 'Vuelatour',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: locale === 'es' ? `Vuelo privado a ${name} - Vuelatour` : `Private flight to ${name} - Vuelatour`,
        },
      ],
      type: 'website',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://vuelatour.com/${locale}/charter-flights/${slug}`,
      languages: {
        'es': `https://vuelatour.com/es/charter-flights/${slug}`,
        'en': `https://vuelatour.com/en/charter-flights/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const supabase = createBuildClient();

  const { data: destinations } = await supabase
    .from('destinations')
    .select('slug')
    .eq('is_active', true);

  const locales = ['es', 'en'];
  const params: { locale: string; slug: string }[] = [];

  destinations?.forEach((destination) => {
    locales.forEach((locale) => {
      params.push({ locale, slug: destination.slug });
    });
  });

  return params;
}

export default async function DestinationDetailPage({ params }: DestinationDetailPageProps) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!destination) {
    notFound();
  }

  // Fetch other destinations for "More destinations" section
  const { data: otherDestinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('is_active', true)
    .neq('slug', slug)
    .order('display_order', { ascending: true })
    .limit(3);

  // Fetch available services for display
  const { data: availableServices } = await supabase
    .from('destination_services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <DestinationDetailContent
      locale={locale}
      destination={destination}
      otherDestinations={otherDestinations || []}
      availableServices={availableServices || []}
    />
  );
}
