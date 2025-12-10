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
    ? (destination.image_url.startsWith('http') ? destination.image_url : `https://www.vuelatour.com${destination.image_url}`)
    : 'https://www.vuelatour.com/images/og/og-image.jpg';

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: locale === 'es'
      ? `vuelo privado ${name.toLowerCase()}, charter ${name.toLowerCase()}, avion privado cancun ${name.toLowerCase()}`
      : `private flight ${name.toLowerCase()}, charter ${name.toLowerCase()}, private plane cancun ${name.toLowerCase()}`,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://www.vuelatour.com/${locale}/charter-flights/${slug}`,
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
      canonical: `https://www.vuelatour.com/${locale}/charter-flights/${slug}`,
      languages: {
        'es': `https://www.vuelatour.com/es/charter-flights/${slug}`,
        'en': `https://www.vuelatour.com/en/charter-flights/${slug}`,
        'x-default': `https://www.vuelatour.com/en/charter-flights/${slug}`,
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

  const name = locale === 'es' ? destination.name_es : destination.name_en;
  const description = locale === 'es' ? destination.description_es : destination.description_en;
  const imageUrl = destination.image_url
    ? (destination.image_url.startsWith('http') ? destination.image_url : `https://www.vuelatour.com${destination.image_url}`)
    : 'https://www.vuelatour.com/images/og/og-image.jpg';

  // Build schemas for rendering
  const aircraftPricing = destination.aircraft_pricing || [];
  const prices = aircraftPricing.map((p: any) => p.price_usd);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: locale === 'es' ? `Vuelo Privado a ${name}` : `Private Flight to ${name}`,
    description: description || (locale === 'es'
      ? `Vuelo privado desde Cancún a ${name}. Servicio exclusivo y horarios flexibles.`
      : `Private flight from Cancún to ${name}. Exclusive service and flexible schedules.`),
    image: imageUrl,
    brand: { '@type': 'Brand', name: 'Vuelatour' },
    offers: aircraftPricing.length > 1 ? {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: aircraftPricing.length,
      offers: aircraftPricing.map((pricing: any) => ({
        '@type': 'Offer',
        name: `${name} - ${pricing.aircraft_name}`,
        price: pricing.price_usd,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        url: `https://www.vuelatour.com/${locale}/charter-flights/${slug}`,
      })),
    } : aircraftPricing.length === 1 ? {
      '@type': 'Offer',
      price: aircraftPricing[0].price_usd,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      url: `https://www.vuelatour.com/${locale}/charter-flights/${slug}`,
    } : { '@type': 'Offer', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '150' },
    url: `https://www.vuelatour.com/${locale}/charter-flights/${slug}`,
    category: locale === 'es' ? 'Vuelos Privados' : 'Private Charter Flights',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://www.vuelatour.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: locale === 'es' ? 'Vuelos Privados' : 'Charter Flights', item: `https://www.vuelatour.com/${locale}/charter-flights` },
      { '@type': 'ListItem', position: 3, name: name, item: `https://www.vuelatour.com/${locale}/charter-flights/${slug}` },
    ],
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <DestinationDetailContent
        locale={locale}
        destination={destination}
        otherDestinations={otherDestinations || []}
        availableServices={availableServices || []}
      />
    </>
  );
}
