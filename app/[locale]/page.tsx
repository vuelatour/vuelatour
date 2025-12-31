import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import { LocalBusinessSchema, ServiceSchema, OrganizationSchema } from '@/components/seo/SchemaMarkup';
import { createClient } from '@/lib/supabase/server';
import { getYearsOfExperienceFormatted } from '@/lib/constants';

// Dynamic imports for below-the-fold components to reduce initial JS bundle
const LazyServicesWrapper = dynamic(() => import('@/components/home/LazyServicesWrapper'), {
  loading: () => <div className="min-h-[400px] bg-navy-50 dark:bg-navy-900 animate-pulse" />,
});

const TripAdvisorSection = dynamic(() => import('@/components/home/TripAdvisorSection'), {
  loading: () => <div className="min-h-[300px] bg-white dark:bg-navy-950 animate-pulse" />,
});

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // Run all queries in parallel for better performance
  const [
    { data: destinations },
    { data: tours },
    { data: content },
    { data: images },
  ] = await Promise.all([
    // Fetch destinations
    supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    // Fetch tours
    supabase
      .from('air_tours')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    // Fetch site content
    supabase
      .from('site_content')
      .select('key, value_es, value_en'),
    // Fetch only hero and fleet images
    supabase
      .from('site_images')
      .select('id, key, url, alt_es, alt_en, category, is_primary')
      .in('category', ['hero', 'fleet']),
  ]);

  // Transform images to a map by category
  const imagesMap = (images || []).reduce((acc, img) => {
    const category = img.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(img);
    return acc;
  }, {} as Record<string, typeof images>);

  // Helper to get primary image from a category (or fallback to first)
  const getPrimaryImage = (category: string) => {
    const categoryImages = imagesMap[category] || [];
    return categoryImages.find((img: any) => img.is_primary) || categoryImages[0] || null;
  };

  // Get hero image (primary or first from hero category)
  const heroImage = getPrimaryImage('hero');

  // Get fleet image (primary or first from fleet category)
  const fleetImage = getPrimaryImage('fleet');

  // Transform content to a key-value map
  const contentMap = (content || []).reduce((acc, item) => {
    acc[item.key] = {
      es: item.value_es,
      en: item.value_en,
    };
    return acc;
  }, {} as Record<string, { es: string; en: string }>);

  return (
    <>
      {/* SEO Schema Markup */}
      <LocalBusinessSchema
        locale={locale}
        heroImageUrl={heroImage?.url}
        fleetImageUrl={fleetImage?.url}
      />
      <ServiceSchema locale={locale} />
      <OrganizationSchema locale={locale} />

      {/* Page Content */}
      <HeroSection
        locale={locale}
        content={contentMap}
        heroImage={heroImage}
        featuredTour={tours?.[0] || null}
        featuredDestination={destinations?.[0] || null}
        hasPopularData={false}
      />
      <LazyServicesWrapper
        locale={locale}
        destinations={destinations || []}
        tours={tours || []}
      />
      <TripAdvisorSection locale={locale} />
    </>
  );
}

// Metadata for SEO
export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // Fetch hero image for OG meta - prioritize primary image
  const { data: images } = await supabase
    .from('site_images')
    .select('url, alt_es, alt_en, is_primary')
    .eq('category', 'hero')
    .order('is_primary', { ascending: false })
    .limit(1);

  const heroImage = images?.[0];

  // Get OG image URL - use hero image if available, fallback to static
  const ogImageUrl = heroImage?.url
    ? (heroImage.url.startsWith('http') ? heroImage.url : `https://www.vuelatour.com${heroImage.url}`)
    : 'https://www.vuelatour.com/images/og/og-image.jpg';

  const ogImageAlt = heroImage
    ? (locale === 'es' ? heroImage.alt_es : heroImage.alt_en) || 'Vuelatour'
    : locale === 'es' ? 'Vuelatour - Vuelos en Cancún' : 'Vuelatour - Flights in Cancún';

  const titles = {
    es: 'Vuelatour | Vuelos Privados y Tours Aéreos en Cancún',
    en: 'Vuelatour | Charter Flights & Air Tours in Cancún',
  };

  const yearsExp = getYearsOfExperienceFormatted();
  const descriptions = {
    es: `Vuelos privados y tours aéreos en Cancún. Sobrevuela Tulum, Chichén Itzá, Cozumel. ${yearsExp} años de experiencia. Reserva hoy.`,
    en: `Private flights and air tours in Cancún. Fly over Tulum, Chichén Itzá, Cozumel. ${yearsExp} years experience. Book today.`,
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
    keywords: locale === 'es'
      ? 'vuelos privados cancun, tours aereos riviera maya, vuelos privados mexico, paseos aereos cancun, chichen itza desde el aire'
      : 'charter flights cancun, air tours riviera maya, private flights mexico, aerial tours cancun, chichen itza from above',
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.es,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
      url: `https://www.vuelatour.com/${locale}`,
      siteName: 'Vuelatour',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.es,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://www.vuelatour.com/${locale}`,
      languages: {
        'es': 'https://www.vuelatour.com/es',
        'en': 'https://www.vuelatour.com/en',
        'x-default': 'https://www.vuelatour.com/en',
      },
    },
  };
}