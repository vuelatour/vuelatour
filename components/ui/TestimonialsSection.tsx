'use client';

import { StarIcon } from '@heroicons/react/24/solid';

interface Testimonial {
  id: string;
  author_name: string;
  author_location: string | null;
  rating: number;
  text_es: string;
  text_en: string;
  source: string;
  review_date: string | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  locale: string;
  title?: string;
  subtitle?: string;
}

const sourceLabels: Record<string, string> = {
  google: 'Google',
  tripadvisor: 'TripAdvisor',
  direct: 'Direct',
};

export default function TestimonialsSection({ testimonials, locale, title, subtitle }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  return (
    <section>
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-muted mt-2">{subtitle}</p>}
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => {
          const text = locale === 'es' ? t.text_es : t.text_en;
          return (
            <div key={t.id} className="card p-6">
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-navy-600'}`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted mb-4 text-sm leading-relaxed">&ldquo;{text}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{t.author_name}</p>
                  {t.author_location && (
                    <p className="text-xs text-muted">{t.author_location}</p>
                  )}
                </div>
                <span className="text-xs text-muted bg-gray-100 dark:bg-navy-800 px-2 py-1 rounded">
                  {sourceLabels[t.source] || t.source}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
