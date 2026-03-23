'use client';

import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  excerpt_es: string | null;
  excerpt_en: string | null;
  image_url: string | null;
  category: string;
  published_at: string | null;
}

interface BlogContentProps {
  locale: string;
  posts: BlogPost[];
}

const categoryLabels = {
  es: { guides: 'Guías', destinations: 'Destinos', tips: 'Consejos', news: 'Noticias' } as Record<string, string>,
  en: { guides: 'Guides', destinations: 'Destinations', tips: 'Tips', news: 'News' } as Record<string, string>,
};

export default function BlogContent({ locale, posts }: BlogContentProps) {
  const labels = categoryLabels[locale as keyof typeof categoryLabels] || categoryLabels.es;

  return (
    <main className="min-h-screen pt-28 md:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'es' ? 'Blog y Guías de Viaje' : 'Blog & Travel Guides'}
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Descubre todo sobre vuelos privados, tours aéreos y los mejores destinos del Caribe mexicano.'
              : 'Discover everything about charter flights, air tours, and the best destinations in the Mexican Caribbean.'}
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const title = locale === 'es' ? post.title_es : post.title_en;
              const excerpt = locale === 'es' ? post.excerpt_es : post.excerpt_en;

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="card overflow-hidden group hover:shadow-xl transition-all"
                >
                  {post.image_url ? (
                    <div className="relative h-48 bg-gray-100 dark:bg-navy-800 overflow-hidden">
                      <Image
                        src={post.image_url}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 dark:bg-navy-800 flex items-center justify-center">
                      <span className="text-muted text-sm">Vuelatour</span>
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase">
                      {labels[post.category] || post.category}
                    </span>
                    <h2 className="font-semibold text-lg mt-1 mb-2 group-hover:text-brand-600 transition-colors">
                      {title}
                    </h2>
                    {excerpt && (
                      <p className="text-muted text-sm line-clamp-3">{excerpt}</p>
                    )}
                    {post.published_at && (
                      <p className="text-xs text-muted mt-3">
                        {new Date(post.published_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted text-lg">
              {locale === 'es' ? 'Próximamente publicaremos contenido. ¡Vuelve pronto!' : 'Content coming soon. Check back later!'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
