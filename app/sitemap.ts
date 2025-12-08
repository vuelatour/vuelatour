import { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vuelatour.com';
  const locales = ['es', 'en'];
  const supabase = createBuildClient();

  // Fetch destinations and tours from database
  const [{ data: destinations }, { data: tours }] = await Promise.all([
    supabase.from('destinations').select('slug, updated_at').eq('is_active', true),
    supabase.from('air_tours').select('slug, updated_at').eq('is_active', true),
  ]);

  // Static routes
  const staticRoutes = [
    '',
    '/vuelos-charter',
    '/tours-aereos',
    '/contacto',
    '/privacidad',
    '/terminos',
    '/cookies',
  ];

  // Generate sitemap entries for static routes (both locales)
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );

  // Generate sitemap entries for destinations (both locales)
  const destinationEntries: MetadataRoute.Sitemap = (destinations || []).flatMap((dest) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/vuelos-charter/${dest.slug}`,
      lastModified: dest.updated_at ? new Date(dest.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  // Generate sitemap entries for tours (both locales)
  const tourEntries: MetadataRoute.Sitemap = (tours || []).flatMap((tour) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/tours-aereos/${tour.slug}`,
      lastModified: tour.updated_at ? new Date(tour.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  return [...staticEntries, ...destinationEntries, ...tourEntries];
}
