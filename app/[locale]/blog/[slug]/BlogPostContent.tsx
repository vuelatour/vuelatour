'use client';

import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BlogPost {
  slug: string;
  title_es: string;
  title_en: string;
  content_es: string;
  content_en: string;
  image_url: string | null;
  author: string;
  published_at: string | null;
  category: string;
}

interface BlogPostContentProps {
  locale: string;
  post: BlogPost;
}

export default function BlogPostContent({ locale, post }: BlogPostContentProps) {
  const title = locale === 'es' ? post.title_es : post.title_en;
  const content = locale === 'es' ? post.content_es : post.content_en;

  return (
    <main className="min-h-screen pt-28 md:pt-32 pb-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-600 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {locale === 'es' ? 'Volver al blog' : 'Back to blog'}
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span>{post.author}</span>
            {post.published_at && (
              <>
                <span>&middot;</span>
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.image_url}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:dark:border-navy-700 prose-h2:pb-3
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:leading-relaxed prose-p:text-gray-600 prose-p:dark:text-gray-300
          prose-li:text-gray-600 prose-li:dark:text-gray-300 prose-li:leading-relaxed
          prose-strong:text-foreground prose-strong:dark:text-white
          prose-blockquote:border-brand-500 prose-blockquote:bg-brand-50 prose-blockquote:dark:bg-brand-900/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
          prose-a:text-brand-600 prose-a:dark:text-brand-400 prose-a:no-underline hover:prose-a:underline
        ">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="mt-12 card p-8 text-center">
          <h2 className="text-xl font-bold mb-3">
            {locale === 'es' ? '¿Te gustaría vivir esta experiencia?' : 'Would you like to live this experience?'}
          </h2>
          <p className="text-muted mb-6">
            {locale === 'es'
              ? 'Contáctanos y recibe una cotización personalizada sin compromiso.'
              : 'Contact us and receive a personalized no-obligation quote.'}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
          >
            {locale === 'es' ? 'Solicitar cotización' : 'Request a quote'}
          </Link>
        </div>
      </article>
    </main>
  );
}
