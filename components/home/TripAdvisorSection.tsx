'use client';

import { useEffect, useRef } from 'react';
import LazySection from '@/components/ui/LazySection';

interface TripAdvisorSectionProps {
  locale: string;
}

const translations = {
  es: {
    title: 'Lo que dicen nuestros clientes',
    subtitle: 'Opiniones verificadas en TripAdvisor',
  },
  en: {
    title: 'What our clients say',
    subtitle: 'Verified reviews on TripAdvisor',
  },
};

export default function TripAdvisorSection({ locale }: TripAdvisorSectionProps) {
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const t = translations[locale as keyof typeof translations] || translations.en;

  useEffect(() => {
    // Clean up any existing widgets first
    const container = widgetContainerRef.current;
    if (!container) return;

    // Create the rating widget
    const ratingWidget = document.createElement('div');
    ratingWidget.id = 'TA_cdsratingsonlywide189';
    ratingWidget.className = 'TA_cdsratingsonlywide';
    ratingWidget.innerHTML = `
      <ul id="CYsYgKBP" class="TA_links oRr4FPr">
        <li id="BdhJ8cCOr" class="WQFrH2F"><a target="_blank" href="https://www.tripadvisor.com/Attraction_Review-g150807-d12135503-Reviews-Vuelatour-Cancun_Yucatan_Peninsula.html"><img src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg" alt="TripAdvisor"/></a></li>
      </ul>
    `;

    // Create the scrolling reviews widget
    const reviewsWidget = document.createElement('div');
    reviewsWidget.id = 'TA_cdsscrollingravewide319';
    reviewsWidget.className = 'TA_cdsscrollingravewide';
    reviewsWidget.innerHTML = `
      <ul id="CIx4g5" class="TA_links D5JkWLY">
        <li id="tEHvVCMSq" class="MxchZ4sQG"><a target="_blank" href="https://www.tripadvisor.com/"><img src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg" alt="TripAdvisor"/></a></li>
      </ul>
    `;

    // Create wrappers for styling
    const ratingWrapper = document.createElement('div');
    ratingWrapper.className = 'tripadvisor-rating-wrapper';
    ratingWrapper.appendChild(ratingWidget);

    const reviewsWrapper = document.createElement('div');
    reviewsWrapper.className = 'tripadvisor-reviews-wrapper';
    reviewsWrapper.appendChild(reviewsWidget);

    // Append widgets to container
    container.appendChild(ratingWrapper);
    container.appendChild(reviewsWrapper);

    // Load TripAdvisor scripts
    const loadScript = (src: string) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.setAttribute('data-loadtrk', '');
      script.onload = () => {
        (script as any).loadtrk = true;
      };
      document.body.appendChild(script);
      return script;
    };

    const script1 = loadScript('https://www.jscache.com/wejs?wtype=cdsratingsonlywide&uniq=189&locationId=12135503&lang=en_US&border=true&display_version=2');
    const script2 = loadScript('https://www.jscache.com/wejs?wtype=cdsscrollingravewide&uniq=319&locationId=12135503&lang=en_US&border=true&shadow=false&display_version=2');

    // Cleanup function
    return () => {
      container.innerHTML = '';
      script1.remove();
      script2.remove();
    };
  }, []);

  return (
    <LazySection animation="fade" className="py-16 md:py-20 bg-gray-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-muted">
            {t.subtitle}
          </p>
        </div>

        <div
          ref={widgetContainerRef}
          className="flex flex-col items-center gap-8"
        >
          {/* TripAdvisor widgets will be injected here */}
        </div>
      </div>
    </LazySection>
  );
}
