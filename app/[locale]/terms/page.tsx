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
    .eq('slug', 'terms')
    .single();

  const title = locale === 'es'
    ? page?.title_es || 'Términos y Condiciones'
    : page?.title_en || 'Terms and Conditions';

  const fullTitle = `${title} | Vuelatour`;
  const description = locale === 'es'
    ? 'Términos y condiciones de uso de los servicios de vuelos privados y tours aéreos de Vuelatour en Cancún.'
    : 'Terms and conditions of use for Vuelatour private flights and air tours services in Cancún.';

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: `https://vuelatour.com/${locale}/terms`,
      siteName: 'Vuelatour',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `https://vuelatour.com/${locale}/terms`,
      languages: {
        'es': 'https://vuelatour.com/es/terms',
        'en': 'https://vuelatour.com/en/terms',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('slug', 'terms')
    .single();

  return (
    <LegalPageContent
      locale={locale}
      page={page}
      fallbackTitle={{ es: 'Términos y Condiciones', en: 'Terms and Conditions' }}
    />
  );
}
