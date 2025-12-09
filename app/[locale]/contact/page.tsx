import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import ContactForm from '@/components/contact/ContactForm';
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
            <div className="space-y-6">
              {contactInfoItems.map((item, index) => (
                <div key={index} className="card p-4 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                    <item.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-muted hover:text-brand-500 transition-colors"
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
                    <div className="space-y-2">
                      {phones.map((phone, index) => (
                        <a
                          key={`phone-${index}`}
                          href={`tel:${phone.link}`}
                          className="block text-muted hover:text-brand-500 transition-colors"
                        >
                          {phone.display}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {locale === 'es' ? 'Contáctanos por WhatsApp' : 'Contact us on WhatsApp'}
              </a>

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
      url: `https://vuelatour.com/${locale}/contact`,
      siteName: 'Vuelatour',
      images: [
        {
          url: 'https://vuelatour.com/images/og/og-image.jpg',
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
      images: ['https://vuelatour.com/images/og/og-image.jpg'],
    },
    alternates: {
      canonical: `https://vuelatour.com/${locale}/contact`,
      languages: {
        'es': 'https://vuelatour.com/es/contact',
        'en': 'https://vuelatour.com/en/contact',
      },
    },
  };
}
