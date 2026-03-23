import { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vuelatour.com';
  const locales = ['es', 'en'];
  const supabase = createBuildClient();

  // Fetch destinations, tours, and blog posts from database
  const [{ data: destinations }, { data: tours }, { data: blogPosts }] = await Promise.all([
    supabase.from('destinations').select('slug, updated_at').eq('is_active', true),
    supabase.from('air_tours').select('slug, updated_at').eq('is_active', true),
    supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true),
  ]);

  // Static routes with locale-specific paths
  const staticRoutes: { path: { es: string; en: string }; priority: number }[] = [
    { path: { es: '', en: '' }, priority: 1 },
    { path: { es: '/vuelos-charter', en: '/charter-flights' }, priority: 0.9 },
    { path: { es: '/tours-aereos', en: '/air-tours' }, priority: 0.9 },
    { path: { es: '/contacto', en: '/contact' }, priority: 0.8 },
    { path: { es: '/about', en: '/about' }, priority: 0.8 },
    { path: { es: '/fleet', en: '/fleet' }, priority: 0.7 },
    { path: { es: '/faq', en: '/faq' }, priority: 0.7 },
    { path: { es: '/blog', en: '/blog' }, priority: 0.7 },
    { path: { es: '/privacidad', en: '/privacy' }, priority: 0.5 },
    { path: { es: '/terminos', en: '/terms' }, priority: 0.5 },
    { path: { es: '/cookies', en: '/cookies' }, priority: 0.5 },
  ];

  // Generate sitemap entries for static routes (both locales)
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route.path[locale as keyof typeof route.path]}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    }))
  );

  // Generate sitemap entries for destinations (both locales)
  const destinationEntries: MetadataRoute.Sitemap = (destinations || []).flatMap((dest) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/charter-flights/${dest.slug}`,
      lastModified: dest.updated_at ? new Date(dest.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
  );

  // Generate sitemap entries for tours (both locales)
  const tourEntries: MetadataRoute.Sitemap = (tours || []).flatMap((tour) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/air-tours/${tour.slug}`,
      lastModified: tour.updated_at ? new Date(tour.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
  );

  // Generate sitemap entries for blog posts (both locales)
  const blogEntries: MetadataRoute.Sitemap = (blogPosts || []).flatMap((post) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...destinationEntries, ...tourEntries, ...blogEntries];
}
