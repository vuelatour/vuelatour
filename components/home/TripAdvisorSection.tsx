'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import LazySection from '@/components/ui/LazySection';

interface TripAdvisorSectionProps {
  locale: string;
}

interface Review {
  name: string;
  location: string;
  title: string;
  text: string;
}

const reviews: { es: Review[]; en: Review[] } = {
  en: [
    {
      name: 'socaltraveler399',
      location: 'Tustin',
      title: 'Lovely Birds-eye View of Cancun and Isla Mujeres',
      text: 'My wife and I enjoyed our air tour of the Cancun/Isla Mujeres very much during our visit to Cancun last August. The pilot was friendly and welcoming, and he made us feel very safe in the air. Seeing the hotel zone and Isla Mujeres from the air was simply amazing.',
    },
    {
      name: 'Amb_Medic',
      location: 'Minnesota',
      title: 'Safe, reliable, and state of the art aircraft',
      text: 'This was our first experience Vuelatour. We used them for a round trip flight from Cancun to Cozumel. Everything about our experience was outstanding. Their communication was exceptional and they always responded quickly. The aircraft was modern, with a leather interior and state of the art glass cockpit.',
    },
    {
      name: 'Kim B',
      location: 'Calgary, Canada',
      title: 'Amazing First Time Private flight',
      text: 'Rather than take the ferry we decided to book with this family owned and operated airline. Once we made our way to the FBO we were promptly greeted and escorted through security and out to the plane. Pablo and his father were so helpful, professional and fun. Would HIGHLY recommend.',
    },
    {
      name: 'Ron S',
      location: '3 contributions',
      title: 'The Only Way to Go',
      text: "Fantastic trip and experience to fly from Cancun to Cozumel and back for a Day Trip. We'll never take ground transportation and the Ferry again. 20-25 minutes ground to ground and the day is yours. Very easy to book using WhatsApp for your booking and communication with the pilot.",
    },
    {
      name: 'Traveling Toes',
      location: 'Utah',
      title: 'Above and beyond',
      text: 'We had the pleasure of flying with this company on our trip to Cozumel. Pablo, one of the owners was at the airport when we arrived. He was so friendly and informative. The plane was in excellent condition. From take off to landing it was a smooth trip. I would highly recommend this company.',
    },
    {
      name: 'Libre G',
      location: 'Columbus, GA',
      title: 'Great, fast transfer from Cancun airport to Cozumel',
      text: 'My husband and I used this service as a transfer from Cancun airport to Cozumel. Our pilot was Captain Manolo and he was outstanding! Vuelatour was a convenient option and the photos you are able to take make it a very memorable experience. If you are on the fence about this service - do it!',
    },
    {
      name: 'lisabishop01',
      location: 'London, UK',
      title: 'Fantastic quick transfer Cancun to Cozumel feel like a VIP!',
      text: 'Excellent experience to fly directly from Cancun to Cozumel, this is a quick way to make your transfer only 20 mins direct airport to airport. The service is professional and we felt totally comfortable with our captains. We even got to see the magnificent coastline on our daytime transfer.',
    },
    {
      name: 'SGoodwin07',
      location: 'United States',
      title: 'Cancun to Cozumel - Fantastic Experience and Service!',
      text: "My family I traveled via private plane with Vuelatour from Cancun to Cozumel. Pablo is excellent to work with and his company provides fantastic service. I can't imagine there's a more convenient (or memorable) way to travel from the mainland to Cozumel. Don't hesitate to reach out - you will be in great hands!",
    },
  ],
  es: [
    {
      name: 'socaltraveler399',
      location: 'Tustin',
      title: 'Hermosa vista aérea de Cancún e Isla Mujeres',
      text: 'Mi esposa y yo disfrutamos mucho nuestro tour aéreo de Cancún/Isla Mujeres durante nuestra visita a Cancún. El piloto fue amable y acogedor, y nos hizo sentir muy seguros en el aire. Ver la zona hotelera e Isla Mujeres desde el aire fue simplemente increíble.',
    },
    {
      name: 'Amb_Medic',
      location: 'Minnesota',
      title: 'Seguro, confiable y aeronave de última generación',
      text: 'Esta fue nuestra primera experiencia con Vuelatour. Los usamos para un vuelo de ida y vuelta de Cancún a Cozumel. Todo sobre nuestra experiencia fue excepcional. Su comunicación fue excepcional y siempre respondieron rápidamente. La aeronave era moderna, con interior de piel y cabina de vidrio.',
    },
    {
      name: 'Kim B',
      location: 'Calgary, Canadá',
      title: 'Increíble primer vuelo privado',
      text: 'En lugar de tomar el ferry, decidimos reservar con esta aerolínea familiar. Una vez que llegamos al FBO, nos recibieron y escoltaron por seguridad hasta el avión. Pablo y su padre fueron muy serviciales, profesionales y divertidos. ¡Lo recomiendo ALTAMENTE!',
    },
    {
      name: 'Ron S',
      location: '3 contribuciones',
      title: 'La única forma de viajar',
      text: 'Fantástico viaje y experiencia para volar de Cancún a Cozumel y regresar en un día. Nunca más tomaremos transporte terrestre y el ferry. 20-25 minutos de puerta a puerta y el día es tuyo. Muy fácil reservar usando WhatsApp para tu reservación y comunicación con el piloto.',
    },
    {
      name: 'Traveling Toes',
      location: 'Utah',
      title: 'Más allá de las expectativas',
      text: 'Tuvimos el placer de volar con esta compañía en nuestro viaje a Cozumel. Pablo, uno de los dueños, estaba en el aeropuerto cuando llegamos. Fue muy amable e informativo. El avión estaba en excelentes condiciones. Desde el despegue hasta el aterrizaje fue un viaje suave. Altamente recomendado.',
    },
    {
      name: 'Libre G',
      location: 'Columbus, GA',
      title: 'Excelente y rápido traslado del aeropuerto de Cancún a Cozumel',
      text: 'Mi esposo y yo usamos este servicio como traslado del aeropuerto de Cancún a Cozumel. Nuestro piloto fue el Capitán Manolo y fue excepcional. Vuelatour fue una opción conveniente y las fotos que puedes tomar lo hacen una experiencia muy memorable. ¡Si estás indeciso - hazlo!',
    },
    {
      name: 'lisabishop01',
      location: 'Londres, UK',
      title: '¡Fantástico traslado rápido de Cancún a Cozumel, siéntete VIP!',
      text: 'Excelente experiencia volar directamente de Cancún a Cozumel, es una forma rápida de hacer tu traslado en solo 20 mins directo de aeropuerto a aeropuerto. El servicio es profesional y nos sentimos totalmente cómodos con nuestros capitanes. Incluso vimos la magnífica costa.',
    },
    {
      name: 'SGoodwin07',
      location: 'Estados Unidos',
      title: 'Cancún a Cozumel - ¡Fantástica experiencia y servicio!',
      text: 'Mi familia y yo viajamos en avión privado con Vuelatour de Cancún a Cozumel. Pablo es excelente para trabajar y su compañía proporciona un servicio fantástico. No puedo imaginar una forma más conveniente (o memorable) de viajar. No dudes en contactarlos - ¡estarás en buenas manos!',
    },
  ],
};

const translations = {
  es: {
    title: 'Lo que dicen nuestros clientes',
    subtitle: 'Reseñas verificadas en TripAdvisor',
    rating: '5.0',
    ratingText: 'Excelente',
    reviewCount: '35 reseñas',
    cta: 'Ver todas las reseñas en TripAdvisor',
  },
  en: {
    title: 'What our clients say',
    subtitle: 'Verified reviews on TripAdvisor',
    rating: '5.0',
    ratingText: 'Excellent',
    reviewCount: '35 reviews',
    cta: 'See all reviews on TripAdvisor',
  },
};

// 5 green circles for TripAdvisor rating
function TripAdvisorRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full bg-[#00AA6C]"
        />
      ))}
    </div>
  );
}

export default function TripAdvisorSection({ locale }: TripAdvisorSectionProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const localizedReviews = reviews[locale as keyof typeof reviews] || reviews.en;

  // Show 3 reviews at a time, rotating
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleReviews = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % localizedReviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [localizedReviews.length]);

  const getVisibleReviews = () => {
    const result = [];
    for (let i = 0; i < visibleReviews; i++) {
      const index = (currentIndex + i) % localizedReviews.length;
      result.push(localizedReviews[index]);
    }
    return result;
  };

  return (
    <LazySection animation="fade" className="py-16 md:py-20 bg-gray-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
              <Image
                src="https://static.tacdn.com/img2/brand_refresh_2025/logos/logo.svg"
                alt="TripAdvisor"
                width={36}
                height={36}
                className="w-9 h-9"
              />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-muted mb-4">
            {t.subtitle}
          </p>

          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-3">
            <TripAdvisorRating />
            <span className="text-2xl font-bold">{t.rating}</span>
            <span className="text-muted">({t.reviewCount})</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {getVisibleReviews().map((review, index) => (
            <div
              key={`${review.name}-${index}`}
              className="card p-6 transition-all duration-500"
            >
              {/* Reviewer Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-navy-700 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {review.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">{review.name}</div>
                  <div className="text-xs text-muted">{review.location}</div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-3">
                <TripAdvisorRating />
              </div>

              {/* Review Title */}
              <h3 className="font-semibold mb-2 line-clamp-2">
                {review.title}
              </h3>

              {/* Review Text */}
              <p className="text-sm text-muted line-clamp-4">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href="https://www.tripadvisor.com/Attraction_Review-g150807-d12135503-Reviews-Vuelatour-Cancun_Yucatan_Peninsula.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00AA6C] hover:bg-[#009660] text-white font-medium rounded-lg transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <Image
                src="https://static.tacdn.com/img2/brand_refresh_2025/logos/logo.svg"
                alt=""
                width={18}
                height={18}
                className="w-[18px] h-[18px]"
              />
            </div>
            {t.cta}
          </a>
        </div>
      </div>
    </LazySection>
  );
}
