import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import BlogContent from './BlogContent';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: 'Blog | Guías de Viaje y Tours Aéreos en Cancún | Vuelatour',
    en: 'Blog | Travel Guides and Air Tours in Cancún | Vuelatour',
  };

  const descriptions = {
    es: 'Guías de viaje, consejos y todo lo que necesitas saber sobre vuelos privados y tours aéreos en Cancún, la Riviera Maya y la Península de Yucatán.',
    en: 'Travel guides, tips, and everything you need to know about charter flights and air tours in Cancún, the Riviera Maya, and the Yucatan Peninsula.',
  };

  const title = titles[locale as keyof typeof titles] || titles.es;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.es;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.vuelatour.com/${locale}/blog`,
      siteName: 'Vuelatour',
      images: [{ url: 'https://www.vuelatour.com/images/og/og-image.jpg', width: 1200, height: 630 }],
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: `https://www.vuelatour.com/${locale}/blog`,
      languages: {
        'es': 'https://www.vuelatour.com/es/blog',
        'en': 'https://www.vuelatour.com/en/blog',
        'x-default': 'https://www.vuelatour.com/en/blog',
      },
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title_es, title_en, excerpt_es, excerpt_en, image_url, category, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  return <BlogContent locale={locale} posts={posts || []} />;
}
