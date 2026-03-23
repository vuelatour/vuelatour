import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import FAQPageContent from './FAQPageContent';
import { FAQSchema } from '@/components/seo/SchemaMarkup';

interface FAQPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FAQPageProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: 'Preguntas Frecuentes | Vuelos Privados y Tours Aéreos | Vuelatour',
    en: 'Frequently Asked Questions | Charter Flights and Air Tours | Vuelatour',
  };

  const descriptions = {
    es: 'Resuelve tus dudas sobre vuelos privados y tours aéreos en Cancún. Precios, seguridad, equipaje, reservaciones y más. Vuelatour responde.',
    en: 'Get answers about charter flights and air tours in Cancún. Pricing, safety, luggage, bookings, and more. Vuelatour answers.',
  };

  const title = titles[locale as keyof typeof titles] || titles.es;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.es;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.vuelatour.com/${locale}/faq`,
      siteName: 'Vuelatour',
      images: [{ url: 'https://www.vuelatour.com/images/og/og-image.jpg', width: 1200, height: 630 }],
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: `https://www.vuelatour.com/${locale}/faq`,
      languages: {
        'es': 'https://www.vuelatour.com/es/faq',
        'en': 'https://www.vuelatour.com/en/faq',
        'x-default': 'https://www.vuelatour.com/en/faq',
      },
    },
  };
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Transform for schema
  const faqsForSchema = (faqs || []).map(f => ({
    question: locale === 'es' ? f.question_es : f.question_en,
    answer: locale === 'es' ? f.answer_es : f.answer_en,
  }));

  return (
    <>
      <FAQSchema faqs={faqsForSchema} />
      <FAQPageContent locale={locale} faqs={faqs || []} />
    </>
  );
}
