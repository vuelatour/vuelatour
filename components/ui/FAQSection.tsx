'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
  subtitle?: string;
}

export default function FAQSection({ faqs, title, subtitle }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section>
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-muted mt-2">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="card overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-foreground pr-4">{faq.question}</span>
              <ChevronDownIcon
                className={`w-5 h-5 text-muted flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 pt-0">
                <p className="text-muted leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
