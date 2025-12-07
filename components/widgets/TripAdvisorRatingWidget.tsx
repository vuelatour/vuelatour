'use client';

import Image from 'next/image';

interface TripAdvisorRatingWidgetProps {
  locale?: string;
}

const translations = {
  es: {
    rating: '5.0',
    excellent: 'Excelente',
    reviews: '35 reseñas',
  },
  en: {
    rating: '5.0',
    excellent: 'Excellent',
    reviews: '35 reviews',
  },
};

// 5 green circles for TripAdvisor rating
function TripAdvisorRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full bg-[#00AA6C]"
        />
      ))}
    </div>
  );
}

export default function TripAdvisorRatingWidget({ locale = 'en' }: TripAdvisorRatingWidgetProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <a
      href="https://www.tripadvisor.com/Attraction_Review-g150807-d12135503-Reviews-Vuelatour-Cancun_Yucatan_Peninsula.html"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
        <Image
          src="https://static.tacdn.com/img2/brand_refresh_2025/logos/logo.svg"
          alt="TripAdvisor"
          width={28}
          height={28}
          className="w-7 h-7"
        />
      </div>
      <div className="flex flex-col">
        <TripAdvisorRating />
        <span className="text-xs text-muted mt-1">{t.reviews}</span>
      </div>
    </a>
  );
}
