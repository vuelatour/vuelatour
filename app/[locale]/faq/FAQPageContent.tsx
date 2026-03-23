'use client';

import Link from 'next/link';
import FAQSection from '@/components/ui/FAQSection';

interface DBFaq {
  id: string;
  question_es: string;
  question_en: string;
  answer_es: string;
  answer_en: string;
  category: string;
}

interface FAQPageContentProps {
  locale: string;
  faqs: DBFaq[];
}

const categoryLabels = {
  es: {
    general: 'Preguntas generales',
    pricing: 'Precios y cotizaciones',
    charter: 'Vuelos privados',
    tours: 'Tours aéreos',
    safety: 'Seguridad',
  } as Record<string, string>,
  en: {
    general: 'General questions',
    pricing: 'Pricing and quotes',
    charter: 'Charter flights',
    tours: 'Air tours',
    safety: 'Safety',
  } as Record<string, string>,
};

const categoryOrder = ['general', 'pricing', 'charter', 'tours', 'safety'];

export default function FAQPageContent({ locale, faqs }: FAQPageContentProps) {
  const labels = categoryLabels[locale as keyof typeof categoryLabels] || categoryLabels.es;

  // Group by category
  const grouped = categoryOrder
    .map(cat => ({
      category: cat,
      label: labels[cat] || cat,
      items: faqs
        .filter(f => f.category === cat)
        .map(f => ({
          question: locale === 'es' ? f.question_es : f.question_en,
          answer: locale === 'es' ? f.answer_es : f.answer_en,
        })),
    }))
    .filter(g => g.items.length > 0);

  return (
    <main className="min-h-screen pt-28 md:pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Encuentra respuestas a las preguntas más comunes sobre nuestros servicios de vuelos privados y tours aéreos en Cancún.'
              : 'Find answers to the most common questions about our charter flight and air tour services in Cancún.'}
          </p>
        </div>

        {/* FAQ Sections by category */}
        <div className="space-y-10">
          {grouped.map((group) => (
            <FAQSection
              key={group.category}
              faqs={group.items}
              title={group.label}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 card p-8 text-center">
          <h2 className="text-xl font-bold mb-3">
            {locale === 'es' ? '¿No encontraste lo que buscas?' : 'Didn\'t find what you\'re looking for?'}
          </h2>
          <p className="text-muted mb-6">
            {locale === 'es'
              ? 'Contáctanos directamente y con gusto resolveremos todas tus dudas.'
              : 'Contact us directly and we\'ll be happy to answer all your questions.'}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
          >
            {locale === 'es' ? 'Contactar' : 'Contact us'}
          </Link>
        </div>
      </div>
    </main>
  );
}
