import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import { LocalBusinessSchema, ServiceSchema, OrganizationSchema } from '@/components/seo/SchemaMarkup';
import { createClient } from '@/lib/supabase/server';
import { getYearsOfExperienceFormatted } from '@/lib/constants';

// Dynamic imports for below-the-fold components to reduce initial JS bundle
const LazyServicesWrapper = dynamic(() => import('@/components/home/LazyServicesWrapper'), {
  loading: () => <div className="min-h-[400px] bg-navy-50 dark:bg-navy-900 animate-pulse" />,
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
    { data: testimonials },
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
    // Fetch featured testimonials
    supabase
      .from('testimonials')
      .select('id, author_name, author_location, rating, text_es, text_en, source, review_date')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .limit(4),
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
      {/* Testimonials + TripAdvisor unified section */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with TripAdvisor branding */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-[#00AA6C]" />
                ))}
              </div>
              <span className="text-2xl font-bold">4.9</span>
              <span className="text-muted">({locale === 'es' ? '35 reseñas' : '35 reviews'})</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {locale === 'es' ? 'Lo que dicen nuestros clientes' : 'What our clients say'}
            </h2>
            <p className="text-muted">
              {locale === 'es' ? 'Reseñas verificadas de viajeros que volaron con nosotros' : 'Verified reviews from travelers who flew with us'}
            </p>
          </div>

          {/* Testimonial cards from DB */}
          {testimonials && testimonials.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {testimonials.map((t) => (
                <div key={t.id} className="card p-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-navy-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted mb-4 text-sm leading-relaxed">&ldquo;{locale === 'es' ? t.text_es : t.text_en}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{t.author_name}</p>
                      {t.author_location && <p className="text-xs text-muted">{t.author_location}</p>}
                    </div>
                    <span className="text-xs text-muted bg-gray-100 dark:bg-navy-800 px-2 py-1 rounded">
                      {t.source === 'tripadvisor' ? 'TripAdvisor' : t.source === 'google' ? 'Google' : t.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA to TripAdvisor */}
          <div className="text-center">
            <a
              href="https://www.tripadvisor.com/Attraction_Review-g150807-d12135503-Reviews-Vuelatour-Cancun_Yucatan_Peninsula.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00AA6C] hover:bg-[#009660] text-white font-medium rounded-lg transition-colors"
            >
              {locale === 'es' ? 'Ver todas las reseñas en TripAdvisor' : 'See all reviews on TripAdvisor'}
            </a>
          </div>
        </div>
      </section>
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
    es: 'Vuelatour | Vuelos Privados y Tours Aéreos en Cancún y Riviera Maya',
    en: 'Vuelatour | Private Flights & Airplane Tours in Cancún, Mexico',
  };

  const yearsExp = getYearsOfExperienceFormatted();
  const descriptions = {
    es: `Vuelos privados y tours aéreos panorámicos en Cancún. Sobrevuela Chichén Itzá, Tulum, Cozumel en avioneta privada. ${yearsExp} años de experiencia, pilotos certificados. Cotiza hoy.`,
    en: `Private charter flights and airplane tours in Cancún. Fly over Chichén Itzá, Tulum, Cozumel by private plane. ${yearsExp} years experience, certified pilots. Book today.`,
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
    keywords: locale === 'es'
      ? 'vuelos privados cancun, tours aereos cancun, avioneta cancun, vuelo panoramico cancun, vuelo chichen itza, tour aereo tulum, vuelos privados riviera maya'
      : 'cancun airplane tours, private plane cancun, charter flights cancun, cancun plane tours, scenic flight cancun, chichen itza flight, tulum air tour',
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