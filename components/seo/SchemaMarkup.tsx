import Script from 'next/script';

interface LocalBusinessSchemaProps {
  locale: string;
  heroImageUrl?: string | null;
  fleetImageUrl?: string | null;
}

export function LocalBusinessSchema({ locale, heroImageUrl, fleetImageUrl }: LocalBusinessSchemaProps) {
  // Use dynamic images if available, fallback to static
  const heroImg = heroImageUrl || '/images/hero/hero-aerial-cancun.jpg';
  const fleetImg = fleetImageUrl || '/images/fleet/cessna-206.jpg';

  // Ensure URLs are absolute
  const getAbsoluteUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `https://vuelatour.com${url}`;
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://vuelatour.com',
    name: 'Vuelatour',
    alternateName: locale === 'es' ? 'Vuelatour Cancún' : 'Vuelatour Cancun',
    description: locale === 'es'
      ? 'Vuelos privados y tours aéreos panorámicos en Cancún y la Riviera Maya. 15+ años de experiencia.'
      : 'Private charter flights and panoramic air tours in Cancún and the Riviera Maya. 15+ years of experience.',
    url: 'https://vuelatour.com',
    telephone: '+52-998-740-7149',
    email: 'info@vuelatour.com',
    logo: {
      '@type': 'ImageObject',
      '@id': 'https://vuelatour.com/#logo',
      url: 'https://vuelatour.com/images/logo/vuelatour-logo.png',
      contentUrl: 'https://vuelatour.com/images/logo/vuelatour-logo.png',
      caption: locale === 'es'
        ? 'Vuelatour - Vuelos privados y tours aéreos en Cancún y Riviera Maya'
        : 'Vuelatour - Charter flights and air tours in Cancún and Riviera Maya',
      width: 150,
      height: 40,
      inLanguage: locale === 'es' ? 'es-MX' : 'en-US',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle 1 Aeropuerto Cancún',
      addressLocality: 'Cancún',
      addressRegion: 'Quintana Roo',
      postalCode: '77569',
      addressCountry: 'MX',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 21.0367,
      longitude: -86.8770,
    },
    image: [
      {
        '@type': 'ImageObject',
        url: 'https://vuelatour.com/images/logo/vuelatour-logo.png',
        caption: locale === 'es' ? 'Logo de Vuelatour' : 'Vuelatour Logo',
        width: 150,
        height: 40,
      },
      getAbsoluteUrl(heroImg),
      getAbsoluteUrl(fleetImg),
    ],
    priceRange: '$299 - $1,500 USD',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '150',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '07:00',
      closes: '19:00',
    },
    sameAs: [
      'https://facebook.com/vuelatour',
      'https://instagram.com/vuelatour',
      'https://tiktok.com/@vuelatour',
    ],
  };

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ServiceSchemaProps {
  locale: string;
}

export function ServiceSchema({ locale }: ServiceSchemaProps) {
  const services = [
    {
      '@type': 'Service',
      name: locale === 'es' ? 'Vuelos Privados' : 'Private Charter Flights',
      description: locale === 'es'
        ? 'Vuelos privados a destinos en México, USA y Centroamérica'
        : 'Private flights to destinations in Mexico, USA, and Central America',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Vuelatour',
      },
      areaServed: {
        '@type': 'Place',
        name: 'Riviera Maya, Mexico',
      },
      offers: {
        '@type': 'Offer',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          minPrice: '450',
        },
      },
    },
    {
      '@type': 'Service',
      name: locale === 'es' ? 'Tours Aéreos Panorámicos' : 'Panoramic Air Tours',
      description: locale === 'es'
        ? 'Tours aéreos sobre Cancún, Tulum, Chichén Itzá y más'
        : 'Air tours over Cancún, Tulum, Chichén Itzá and more',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Vuelatour',
      },
      areaServed: {
        '@type': 'Place',
        name: 'Cancún, Quintana Roo',
      },
      offers: {
        '@type': 'Offer',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          minPrice: '299',
        },
      },
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': services,
  };

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface TourSchemaProps {
  tour: {
    name: string;
    description: string;
    image: string;
    price: string;
    duration: string;
  };
  locale: string;
}

export function TourSchema({ tour, locale }: TourSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.name,
    description: tour.description,
    image: `https://vuelatour.com${tour.image}`,
    touristType: locale === 'es' ? 'Turistas y viajeros' : 'Tourists and travelers',
    offers: {
      '@type': 'Offer',
      price: tour.price.replace('$', '').replace(',', ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    itinerary: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale === 'es' ? 'Despegue desde Aeropuerto de Cancún' : 'Departure from Cancún Airport',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: tour.name,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: locale === 'es' ? 'Regreso a Cancún' : 'Return to Cancún',
        },
      ],
    },
    provider: {
      '@type': 'LocalBusiness',
      name: 'Vuelatour',
      url: 'https://vuelatour.com',
    },
  };

  return (
    <Script
      id={`tour-schema-${tour.name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface OrganizationSchemaProps {
  locale: string;
}

export function OrganizationSchema({ locale }: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://vuelatour.com/#organization',
    name: 'Vuelatour',
    alternateName: ['Vuelatour Cancún', 'Vuelatour Mexico', 'Vuelos Privados Cancún'],
    url: 'https://vuelatour.com',
    logo: {
      '@type': 'ImageObject',
      '@id': 'https://vuelatour.com/#logo',
      url: 'https://vuelatour.com/images/logo/vuelatour-logo.png',
      contentUrl: 'https://vuelatour.com/images/logo/vuelatour-logo.png',
      caption: locale === 'es'
        ? 'Vuelatour - Empresa de vuelos privados y tours aéreos en Cancún, México'
        : 'Vuelatour - Charter flights and air tours company in Cancún, Mexico',
      width: 150,
      height: 40,
      encodingFormat: 'image/png',
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://vuelatour.com/images/logo/vuelatour-logo.png',
      width: 150,
      height: 40,
    },
    description: locale === 'es'
      ? 'Vuelatour es una empresa de aviación que ofrece vuelos privados charter y tours aéreos panorámicos en Cancún, Riviera Maya y toda la Península de Yucatán. Con más de 15 años de experiencia y certificación FAA.'
      : 'Vuelatour is an aviation company offering private charter flights and panoramic air tours in Cancún, Riviera Maya, and the entire Yucatan Peninsula. With over 15 years of experience and FAA certification.',
    foundingDate: '2010',
    foundingLocation: {
      '@type': 'Place',
      name: 'Cancún, Quintana Roo, México',
    },
    areaServed: [
      {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 21.0367,
          longitude: -86.8770,
        },
        geoRadius: '500 km',
      },
      {
        '@type': 'Place',
        name: 'Cancún',
      },
      {
        '@type': 'Place',
        name: 'Riviera Maya',
      },
      {
        '@type': 'Place',
        name: 'Quintana Roo',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+52-998-740-7149',
      contactType: locale === 'es' ? 'Reservaciones' : 'Reservations',
      email: 'info@vuelatour.com',
      availableLanguage: ['Spanish', 'English'],
      areaServed: 'MX',
    },
    sameAs: [
      'https://facebook.com/vuelatour',
      'https://instagram.com/vuelatour',
      'https://tiktok.com/@vuelatour',
    ],
    slogan: locale === 'es'
      ? 'La forma más rápida y exclusiva de explorar el Caribe mexicano'
      : 'The fastest and most exclusive way to explore the Mexican Caribbean',
    knowsAbout: locale === 'es'
      ? ['Vuelos privados', 'Tours aéreos', 'Aviación', 'Turismo en Cancún', 'Riviera Maya']
      : ['Private flights', 'Air tours', 'Aviation', 'Cancún tourism', 'Riviera Maya'],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://vuelatour.com${item.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: Array<{ question: string; answer: string }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}