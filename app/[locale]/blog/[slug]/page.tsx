import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient, createBuildClient } from '@/lib/supabase/server';
import BlogPostContent from './BlogPostContent';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) {
    return { title: locale === 'es' ? 'Artículo no encontrado' : 'Post not found' };
  }

  const title = locale === 'es'
    ? (post.meta_title_es || post.title_es)
    : (post.meta_title_en || post.title_en);
  const description = locale === 'es'
    ? (post.meta_description_es || post.excerpt_es || '')
    : (post.meta_description_en || post.excerpt_en || '');
  const imageUrl = post.image_url || 'https://www.vuelatour.com/images/og/og-image.jpg';

  return {
    title: `${title} | Vuelatour`,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.vuelatour.com/${locale}/blog/${slug}`,
      siteName: 'Vuelatour',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    alternates: {
      canonical: `https://www.vuelatour.com/${locale}/blog/${slug}`,
      languages: {
        'es': `https://www.vuelatour.com/es/blog/${slug}`,
        'en': `https://www.vuelatour.com/en/blog/${slug}`,
        'x-default': `https://www.vuelatour.com/en/blog/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const supabase = createBuildClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('is_published', true);

  const locales = ['es', 'en'];
  const params: { locale: string; slug: string }[] = [];

  posts?.forEach((post) => {
    locales.forEach((locale) => {
      params.push({ locale, slug: post.slug });
    });
  });

  return params;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) {
    notFound();
  }

  // Article schema
  const title = locale === 'es' ? post.title_es : post.title_en;
  const description = locale === 'es' ? (post.excerpt_es || '') : (post.excerpt_en || '');
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: post.image_url || 'https://www.vuelatour.com/images/og/og-image.jpg',
    author: { '@type': 'Organization', name: 'Vuelatour' },
    publisher: {
      '@type': 'Organization',
      name: 'Vuelatour',
      logo: { '@type': 'ImageObject', url: 'https://www.vuelatour.com/images/logo/logo-vuelatour.webp' },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    url: `https://www.vuelatour.com/${locale}/blog/${slug}`,
    mainEntityOfPage: `https://www.vuelatour.com/${locale}/blog/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogPostContent locale={locale} post={post} />
    </>
  );
}
