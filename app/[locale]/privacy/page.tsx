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
    .eq('slug', 'privacy')
    .single();

  const title = locale === 'es'
    ? page?.title_es || 'Aviso de Privacidad'
    : page?.title_en || 'Privacy Policy';

  const fullTitle = `${title} | Vuelatour`;
  const description = locale === 'es'
    ? 'Política de privacidad y protección de datos personales de Vuelatour. Conoce cómo protegemos tu información.'
    : 'Privacy policy and personal data protection of Vuelatour. Learn how we protect your information.';

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: `https://vuelatour.com/${locale}/privacy`,
      siteName: 'Vuelatour',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `https://vuelatour.com/${locale}/privacy`,
      languages: {
        'es': 'https://vuelatour.com/es/privacy',
        'en': 'https://vuelatour.com/en/privacy',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('slug', 'privacy')
    .single();

  return (
    <LegalPageContent
      locale={locale}
      page={page}
      fallbackTitle={{ es: 'Aviso de Privacidad', en: 'Privacy Policy' }}
    />
  );
}
