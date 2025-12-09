import { createClient } from '@/lib/supabase/server';
import LegalPageContent from '@/components/legal/LegalPageContent';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from('legal_pages')
    .select('title_es, title_en')
    .eq('slug', 'cookies')
    .single();

  const title = locale === 'es'
    ? page?.title_es || 'Política de Cookies'
    : page?.title_en || 'Cookie Policy';

  const fullTitle = `${title} | Vuelatour`;
  const description = locale === 'es'
    ? 'Información sobre el uso de cookies en el sitio web de Vuelatour. Conoce qué cookies utilizamos y cómo gestionarlas.'
    : 'Information about cookie usage on Vuelatour website. Learn what cookies we use and how to manage them.';

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: `https://vuelatour.com/${locale}/cookies`,
      siteName: 'Vuelatour',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `https://vuelatour.com/${locale}/cookies`,
      languages: {
        'es': 'https://vuelatour.com/es/cookies',
        'en': 'https://vuelatour.com/en/cookies',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CookiesPage({ params }: PageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('slug', 'cookies')
    .single();

  return (
    <LegalPageContent
      locale={locale}
      page={page}
      fallbackTitle={{ es: 'Política de Cookies', en: 'Cookie Policy' }}
    />
  );
}
