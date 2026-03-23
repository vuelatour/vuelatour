import { Metadata } from 'next';
import AboutContent from './AboutContent';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: 'Sobre Nosotros | Vuelatour - Vuelos Privados en Cancún desde 2001',
    en: 'About Us | Vuelatour - Charter Flights in Cancún since 2001',
  };

  const descriptions = {
    es: 'Conoce Vuelatour: más de 24 años de experiencia en vuelos privados y tours aéreos en Cancún. Certificaciones TAI & TAN, pilotos expertos y flota moderna. Tu seguridad es nuestra prioridad.',
    en: 'Discover Vuelatour: over 24 years of experience in charter flights and air tours in Cancún. TAI & TAN certifications, expert pilots, and a modern fleet. Your safety is our priority.',
  };

  const title = titles[locale as keyof typeof titles] || titles.es;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.es;

  return {
    title,
    description,
    keywords: locale === 'es'
      ? 'vuelatour, vuelos privados cancun empresa, tours aereos cancun seguridad, aviacion cancun certificada, TAI TAN aviacion mexico'
      : 'vuelatour, charter flights cancun company, air tours cancun safety, certified aviation cancun, TAI TAN aviation mexico',
    openGraph: {
      title,
      description,
      url: `https://www.vuelatour.com/${locale}/about`,
      siteName: 'Vuelatour',
      images: [
        {
          url: 'https://www.vuelatour.com/images/og/og-image.jpg',
          width: 1200,
          height: 630,
          alt: locale === 'es' ? 'Sobre Vuelatour' : 'About Vuelatour',
        },
      ],
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.vuelatour.com/images/og/og-image.jpg'],
    },
    alternates: {
      canonical: `https://www.vuelatour.com/${locale}/about`,
      languages: {
        'es': 'https://www.vuelatour.com/es/about',
        'en': 'https://www.vuelatour.com/en/about',
        'x-default': 'https://www.vuelatour.com/en/about',
      },
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  return <AboutContent locale={locale} />;
}
