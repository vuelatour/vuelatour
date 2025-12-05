'use client';

import ReactMarkdown from 'react-markdown';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface LegalPage {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  content_es: string;
  content_en: string;
  updated_at: string;
}

interface LegalPageContentProps {
  locale: string;
  page: LegalPage | null;
  fallbackTitle: { es: string; en: string };
}

export default function LegalPageContent({ locale, page, fallbackTitle }: LegalPageContentProps) {
  const title = locale === 'es'
    ? page?.title_es || fallbackTitle.es
    : page?.title_en || fallbackTitle.en;

  const content = locale === 'es'
    ? page?.content_es || ''
    : page?.content_en || '';

  const updatedAt = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <main className="min-h-screen pt-20 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-950 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-navy-300 hover:text-white transition-colors mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {title}
            </h1>
            {updatedAt && (
              <p className="text-navy-400 mt-3">
                {locale === 'es' ? 'Última actualización: ' : 'Last updated: '}
                {updatedAt}
              </p>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100 dark:border-navy-800">
              {content ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground border-b border-gray-200 dark:border-navy-700 pb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-8 mb-3 text-foreground">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-muted leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-outside ml-6 text-muted space-y-2 mb-6">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-outside ml-6 text-muted space-y-2 mb-6">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-muted pl-2">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-foreground">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-muted">{children}</em>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-brand-500 hover:text-brand-600 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-brand-500 pl-4 py-2 my-6 bg-brand-50 dark:bg-brand-900/20 rounded-r-lg">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted text-lg">
                    {locale === 'es'
                      ? 'El contenido estará disponible próximamente.'
                      : 'Content will be available soon.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
    </main>
  );
}
