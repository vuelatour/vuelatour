import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient, createBuildClient } from '@/lib/supabase/server';
import TourDetailContent from './TourDetailContent';

interface TourDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: TourDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: tour } = await supabase
    .from('air_tours')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!tour) {
    return {
      title: locale === 'es' ? 'Tour no encontrado' : 'Tour not found',
    };
  }

  const name = locale === 'es' ? tour.name_es : tour.name_en;
  const description = locale === 'es' ? tour.description_es : tour.description_en;

  // Use custom meta fields from database if available, otherwise use fallbacks
  const metaTitle = locale === 'es'
    ? (tour.meta_title_es || `${name} - Tour Aéreo en Cancún | Vuelatour`)
    : (tour.meta_title_en || `${name} - Air Tour in Cancún | Vuelatour`);

  const metaDescription = locale === 'es'
    ? (tour.meta_description_es || description || `Tour aéreo panorámico: ${name}. Duración: ${tour.duration || '30-60 min'}. Vive una experiencia única sobrevolando el Caribe mexicano. Reserva hoy.`)
    : (tour.meta_description_en || description || `Panoramic air tour: ${name}. Duration: ${tour.duration || '30-60 min'}. Live a unique experience flying over the Mexican Caribbean. Book today.`);

  // Get image URL - ensure it's absolute
  const imageUrl = tour.image_url
    ? (tour.image_url.startsWith('http') ? tour.image_url : `https://vuelatour.com${tour.image_url}`)
    : 'https://vuelatour.com/images/og/og-image.jpg';

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: locale === 'es'
      ? `tour aereo ${name.toLowerCase()}, paseo aereo cancun, vuelo panoramico ${name.toLowerCase()}, experiencia aerea cancun`
      : `air tour ${name.toLowerCase()}, aerial tour cancun, panoramic flight ${name.toLowerCase()}, aerial experience cancun`,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://vuelatour.com/${locale}/air-tours/${slug}`,
      siteName: 'Vuelatour',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: locale === 'es' ? `Tour aéreo ${name} - Vuelatour` : `Air tour ${name} - Vuelatour`,
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
      canonical: `https://vuelatour.com/${locale}/air-tours/${slug}`,
      languages: {
        'es': `https://vuelatour.com/es/air-tours/${slug}`,
        'en': `https://vuelatour.com/en/air-tours/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const supabase = createBuildClient();

  const { data: tours } = await supabase
    .from('air_tours')
    .select('slug')
    .eq('is_active', true);

  const locales = ['es', 'en'];
  const params: { locale: string; slug: string }[] = [];

  tours?.forEach((tour) => {
    locales.forEach((locale) => {
      params.push({ locale, slug: tour.slug });
    });
  });

  return params;
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: tour } = await supabase
    .from('air_tours')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!tour) {
    notFound();
  }

  // Fetch other tours for "More tours" section
  const { data: otherTours } = await supabase
    .from('air_tours')
    .select('*')
    .eq('is_active', true)
    .neq('slug', slug)
    .order('display_order', { ascending: true })
    .limit(3);

  // Fetch available services for display
  const { data: availableServices } = await supabase
    .from('tour_services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <TourDetailContent
      locale={locale}
      tour={tour}
      otherTours={otherTours || []}
      availableServices={availableServices || []}
    />
  );
}
