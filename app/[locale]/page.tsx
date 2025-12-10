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

  // Fetch destinations from Supabase
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Fetch air tours from Supabase
  const { data: tours } = await supabase
    .from('air_tours')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Get most popular destination/tour based on contact requests
  // Query contact_requests grouped by destination field to find the most requested
  const { data: popularRequests } = await supabase
    .from('contact_requests')
    .select('destination, service_type')
    .not('destination', 'is', null)
    .not('destination', 'eq', '');

  // Count occurrences and find the most popular
  const destinationCounts: Record<string, { count: number; type: string }> = {};
  (popularRequests || []).forEach((req) => {
    if (req.destination) {
      const slug = req.destination.toLowerCase().replace(/\s+/g, '-');
      if (!destinationCounts[slug]) {
        destinationCounts[slug] = { count: 0, type: req.service_type || 'charter' };
      }
      destinationCounts[slug].count++;
    }
  });

  // Find the most popular slug
  let mostPopularSlug: string | null = null;
  let maxCount = 0;
  let popularType = 'charter';
  Object.entries(destinationCounts).forEach(([slug, data]) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      mostPopularSlug = slug;
      popularType = data.type;
    }
  });

  // Find the actual destination or tour that matches the most popular
  let popularItem = null;
  if (mostPopularSlug && maxCount >= 1) {
    // Try to find in destinations first
    popularItem = (destinations || []).find(
      (d) => d.slug === mostPopularSlug || d.name_es.toLowerCase().includes(mostPopularSlug!) || d.name_en.toLowerCase().includes(mostPopularSlug!)
    );
    // If not found, try tours
    if (!popularItem) {
      popularItem = (tours || []).find(
        (t) => t.slug === mostPopularSlug || t.name_es.toLowerCase().includes(mostPopularSlug!) || t.name_en.toLowerCase().includes(mostPopularSlug!)
      );
      if (popularItem) popularType = 'tour';
    }
  }

  // Fetch site content from Supabase
  const { data: content } = await supabase
    .from('site_content')
    .select('*');

  // Fetch site images from Supabase
  const { data: images } = await supabase
    .from('site_images')
    .select('*');

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
        featuredTour={popularType === 'tour' && popularItem ? popularItem : (tours?.[0] || null)}
        featuredDestination={popularType !== 'tour' && popularItem ? popularItem : (destinations?.[0] || null)}
        hasPopularData={!!popularItem}
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