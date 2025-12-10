import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import ContactForm from '@/components/contact/ContactForm';
import { EmailLink, PhoneLinks, WhatsAppButton } from '@/components/contact/ContactInfoLinks';
import LazyMap from '@/components/ui/LazyMap';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Phone {
  display: string;
  link: string;
}

interface ContactPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    destination?: string;
    tour?: string;
    aircraft?: string;
    price?: string;
  }>;
}

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { locale } = await params;
  const urlParams = await searchParams;
  const t = await getTranslations('contact');
  const supabase = await createClient();

  // Fetch contact info from database
  const { data: dbContactInfo } = await supabase
    .from('contact_info')
    .select('*')
    .single();

  // Get phones array or fallback to old phone field
  const phones: Phone[] = dbContactInfo?.phones && Array.isArray(dbContactInfo.phones) && dbContactInfo.phones.length > 0
    ? dbContactInfo.phones
    : [{ display: dbContactInfo?.phone || '+52 998 740 7149', link: dbContactInfo?.phone_link || '+529987407149' }];

  // Build contact info array with database values or defaults
  const contactInfoItems = [
    {
      icon: MapPinIcon,
      title: locale === 'es' ? 'Dirección' : 'Address',
      content: locale === 'es'
        ? (dbContactInfo?.address_es || 'Aeropuerto Internacional de Cancún, Terminal FBO, Cancún, Q.R., México')
        : (dbContactInfo?.address_en || 'Cancún International Airport, FBO Terminal, Cancún, Q.R., Mexico'),
    },
    {
      icon: EnvelopeIcon,
      title: locale === 'es' ? 'Email' : 'Email',
      content: dbContactInfo?.email || 'info@vuelatour.com',
      href: `mailto:${dbContactInfo?.email || 'info@vuelatour.com'}`,
    },
    {
      icon: ClockIcon,
      title: locale === 'es' ? 'Horario' : 'Hours',
      content: locale === 'es'
        ? (dbContactInfo?.hours_es || 'Lunes a Domingo: 6:00 AM - 8:00 PM')
        : (dbContactInfo?.hours_en || 'Monday to Sunday: 6:00 AM - 8:00 PM'),
    },
  ];

  // WhatsApp configuration
  const whatsappNumber = dbContactInfo?.whatsapp_number || '529987407149';
  const whatsappMessage = locale === 'es'
    ? (dbContactInfo?.whatsapp_message_es || '')
    : (dbContactInfo?.whatsapp_message_en || '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''}`;

  // Google Maps URL
  const googleMapsEmbed = dbContactInfo?.google_maps_embed ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.2847392889904!2d-86.87699268507456!3d21.036544985994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f4c2b05aef653db%3A0xce32b73c625fcd8a!2sAeropuerto%20Internacional%20de%20Canc%C3%BAn!5e0!3m2!1ses-419!2smx!4v1640000000000!5m2!1ses-419!2smx';

  return (
    <main className="min-h-screen pt-28 md:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            {t('title')}
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="order-1 lg:order-1">
            <div className="card p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">
                {locale === 'es' ? 'Envíanos un mensaje' : 'Send us a message'}
              </h2>
              <ContactForm locale={locale} searchParams={urlParams} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="order-2 lg:order-2">
            <h2 className="text-xl font-semibold mb-6">
              {locale === 'es' ? 'Información de Contacto' : 'Contact Information'}
            </h2>
            <div className="space-y-6">
              {contactInfoItems.map((item, index) => (
                <div key={index} className="card p-4 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                    <item.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    {item.href && item.title === 'Email' ? (
                      <EmailLink email={item.content} />
                    ) : item.href ? (
                      <a
                        href={item.href}
                        className="text-muted hover:text-brand-600 transition-colors"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-muted">{item.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Multiple Phones in Single Card */}
              <div className="card p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                    <PhoneIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">
                      {locale === 'es' ? 'Teléfono' : 'Phone'}
                    </h3>
                    <PhoneLinks phones={phones} />
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <WhatsAppButton whatsappUrl={whatsappUrl} locale={locale} />

              {/* Map */}
              <div className="card overflow-hidden">
                <LazyMap
                  src={googleMapsEmbed}
                  height={300}
                  title={locale === 'es' ? 'Ubicación de Vuelatour' : 'Vuelatour Location'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: ContactPageProps) {
  const { locale } = await params;

  const titles = {
    es: 'Contacto | Reserva tu Vuelo Privado en Cancún | Vuelatour',
    en: 'Contact | Book Your Private Flight in Cancún | Vuelatour',
  };

  const descriptions = {
    es: 'Contáctanos para reservar tu vuelo privado o tour aéreo en Cancún. Atención personalizada por WhatsApp. Respondemos en menos de 24 horas.',
    en: 'Contact us to book your charter flight or air tour in Cancún. Personalized attention via WhatsApp. We respond within 24 hours.',
  };

  const title = titles[locale as keyof typeof titles] || titles.es;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.es;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.vuelatour.com/${locale}/contact`,
      siteName: 'Vuelatour',
      images: [
        {
          url: 'https://www.vuelatour.com/images/og/og-image.jpg',
          width: 1200,
          height: 630,
          alt: locale === 'es' ? 'Contacta a Vuelatour' : 'Contact Vuelatour',
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
      canonical: `https://www.vuelatour.com/${locale}/contact`,
      languages: {
        'es': 'https://www.vuelatour.com/es/contact',
        'en': 'https://www.vuelatour.com/en/contact',
        'x-default': 'https://www.vuelatour.com/en/contact',
      },
    },
  };
}
