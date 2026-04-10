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

  // Static routes - paths match the actual filesystem structure
  // (no localized slugs; both locales use the same URL paths)
  const staticRoutes: { path: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/charter-flights', priority: 0.9 },
    { path: '/air-tours', priority: 0.9 },
    { path: '/contact', priority: 0.8 },
    { path: '/about', priority: 0.8 },
    { path: '/fleet', priority: 0.7 },
    { path: '/faq', priority: 0.7 },
    { path: '/blog', priority: 0.7 },
    { path: '/privacy', priority: 0.5 },
    { path: '/terms', priority: 0.5 },
    { path: '/cookies', priority: 0.5 },
  ];

  // Generate sitemap entries for static routes (both locales)
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route.path}`,
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
