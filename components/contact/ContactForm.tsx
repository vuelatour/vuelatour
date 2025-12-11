'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircleIcon, ExclamationCircleIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { trackContactFormSubmit, trackBookingClick } from '@/lib/analytics';

interface SearchParams {
  destination?: string;
  tour?: string;
  aircraft?: string;
  price?: string;
}

interface ContactFormProps {
  locale: string;
  searchParams?: SearchParams;
}

interface Destination {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
}

interface AirTour {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
}

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function ContactForm({ locale, searchParams }: ContactFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [airTours, setAirTours] = useState<AirTour[]>([]);

  // Extract pre-selection info from URL params
  const preSelectedDestination = searchParams?.destination;
  const preSelectedTour = searchParams?.tour;
  const preSelectedAircraft = searchParams?.aircraft;
  const preSelectedPrice = searchParams?.price;

  const hasPreSelection = preSelectedDestination || preSelectedTour;
  const isCharterQuote = !!preSelectedDestination;
  const isTourQuote = !!preSelectedTour;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: preSelectedDestination ? 'charter' : preSelectedTour ? 'tour' : '',
    destination: preSelectedDestination || '',
    tour: preSelectedTour || '',
    message: '',
    // New quote fields
    travel_date: '',
    departure_time: '',
    return_date: '',
    return_time: '',
    departure_location: '',
    departure_location_other: '',
    destination_other: '',
    number_of_passengers: '2',
    aircraft_selected: preSelectedAircraft || '',
  });

  // Load destinations and tours from database
  useEffect(() => {
    const loadData = async () => {
      // Load destinations
      const { data: destData } = await supabase
        .from('destinations')
        .select('id, slug, name_es, name_en')
        .eq('is_active', true)
        .order('display_order');

      if (destData) setDestinations(destData);

      // Load air tours
      const { data: tourData } = await supabase
        .from('air_tours')
        .select('id, slug, name_es, name_en')
        .eq('is_active', true)
        .order('display_order');

      if (tourData) setAirTours(tourData);
    };

    loadData();
  }, [supabase]);

  // Update form when searchParams change
  useEffect(() => {
    if (preSelectedDestination || preSelectedTour) {
      setFormData(prev => ({
        ...prev,
        service_type: preSelectedDestination ? 'charter' : 'tour',
        destination: preSelectedDestination || '',
        tour: preSelectedTour || '',
        aircraft_selected: preSelectedAircraft || '',
      }));
    }
  }, [preSelectedDestination, preSelectedTour, preSelectedAircraft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Find destination_id or tour_id based on slug
      let destination_id = null;
      let tour_id = null;

      if (formData.service_type === 'charter' && formData.destination) {
        const dest = destinations.find(d => d.slug === formData.destination);
        destination_id = dest?.id || null;
      }

      if (formData.service_type === 'tour' && formData.tour) {
        const tour = airTours.find(t => t.slug === formData.tour);
        tour_id = tour?.id || null;
      }

      // Helper to ensure dates are stored correctly without timezone shift
      // Append time with explicit Cancun timezone offset to prevent UTC conversion issues
      // Cancun is UTC-5 (no daylight saving), so we add +00:00 to make the date be interpreted as-is
      const formatDateForDB = (dateStr: string | null) => {
        if (!dateStr) return null;
        // Send as ISO string with explicit timezone to prevent Supabase from shifting
        // Using noon UTC ensures the date stays correct regardless of server timezone
        return `${dateStr}T12:00:00+00:00`;
      };

      const { error: insertError } = await supabase
        .from('contact_requests')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          service_type: formData.service_type || null,
          destination: formData.destination || null,
          message: formData.message || null,
          status: 'pending',
          // New quote fields - format dates to avoid timezone issues
          travel_date: formatDateForDB(formData.travel_date),
          departure_time: formData.departure_time || null,
          return_date: formatDateForDB(formData.return_date),
          return_time: formData.return_time || null,
          departure_location: formData.departure_location || null,
          departure_location_other: formData.departure_location_other || null,
          destination_other: formData.destination_other || null,
          number_of_passengers: parseInt(formData.number_of_passengers) || null,
          aircraft_selected: formData.aircraft_selected || null,
          destination_id,
          tour_id,
        }]);

      if (insertError) throw insertError;

      // Track successful form submission
      const formType = formData.service_type === 'charter' ? 'charter_quote' :
                       formData.service_type === 'tour' ? 'tour_quote' : 'contact';
      trackContactFormSubmit(formType);

      // Track booking click if it's a quote request
      if (formData.service_type === 'charter' && formData.destination) {
        trackBookingClick('destination', formData.destination);
      } else if (formData.service_type === 'tour' && formData.tour) {
        trackBookingClick('tour', formData.tour);
      }

      // Send email notification to Vuelatour team
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
            service_type: formData.service_type,
            destination: formData.destination,
            destination_other: formData.destination_other,
            departure_location: formData.departure_location,
            departure_location_other: formData.departure_location_other,
            travel_date: formData.travel_date,
            departure_time: formData.departure_time,
            return_date: formData.return_date,
            return_time: formData.return_time,
            aircraft_selected: formData.aircraft_selected,
            tour: formData.tour,
            number_of_passengers: parseInt(formData.number_of_passengers) || null,
            preSelectedPrice: preSelectedPrice,
          }),
        });
      } catch (emailError) {
        // Log but don't fail the form submission if email fails
        console.error('Email notification error:', emailError);
      }

      setSuccess(true);

      // Scroll to top of the page smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        destination: '',
        tour: '',
        message: '',
        travel_date: '',
        departure_time: '',
        return_date: '',
        return_time: '',
        departure_location: '',
        departure_location_other: '',
        destination_other: '',
        number_of_passengers: '2',
        aircraft_selected: '',
      });
    } catch (err: any) {
      setError(locale === 'es'
        ? 'Error al enviar el mensaje. Por favor intenta de nuevo.'
        : 'Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const labels = {
    // Existing labels
    name: locale === 'es' ? 'Nombre completo' : 'Your Name',
    email: locale === 'es' ? 'Correo electrónico' : 'E-Mail Address',
    phone: locale === 'es' ? 'Teléfono' : 'Phone Number',
    service: locale === 'es' ? 'Tipo de servicio' : 'Service type',
    destination: locale === 'es' ? 'Destino de interés (opcional)' : 'Destination of interest (optional)',
    message: locale === 'es' ? 'Mensaje (opcional)' : 'Message (optional)',
    submit: locale === 'es' ? 'Enviar cotización' : 'Send quote request',
    sending: locale === 'es' ? 'Enviando...' : 'Sending...',
    selectService: locale === 'es' ? 'Selecciona un servicio' : 'Select a service',
    charter: locale === 'es' ? 'Vuelo Privado' : 'Charter Flight',
    tour: locale === 'es' ? 'Tour Aéreo' : 'Air Tour',
    general: locale === 'es' ? 'Consulta General' : 'General Inquiry',
    successTitle: locale === 'es' ? '¡Cotización enviada!' : 'Quote sent!',
    successMessage: locale === 'es'
      ? 'Gracias por contactarnos. Te responderemos en menos de 24 horas.'
      : 'Thank you for contacting us. We will respond within 24 hours.',
    sendAnother: locale === 'es' ? 'Enviar otra cotización' : 'Send another quote',
    preSelectionTitle: locale === 'es' ? 'Tu selección' : 'Your selection',
    preSelectionDestination: locale === 'es' ? 'Destino' : 'Destination',
    preSelectionTour: locale === 'es' ? 'Tour' : 'Tour',
    preSelectionAircraft: locale === 'es' ? 'Aeronave' : 'Aircraft',
    preSelectionPrice: locale === 'es' ? 'Precio' : 'Price',
    clearSelection: locale === 'es' ? 'Cambiar selección' : 'Change selection',

    // New quote labels
    charterTitle: locale === 'es' ? 'Cotiza tu Vuelo Privado' : 'Get a quote for your Charter flight',
    charterSubtitle: locale === 'es'
      ? 'Nos pondremos en contacto contigo en pocas horas con una oferta sin compromiso. ¡Gracias por elegirnos!'
      : 'We will get in touch with you within a few hours with a non-binding offer. Thank you for choosing us!',
    tourTitle: locale === 'es' ? 'Cotiza tu Tour Aéreo' : 'Get a quote for your Air Tour',
    tourSubtitle: locale === 'es'
      ? 'Nos pondremos en contacto contigo con una oferta sin compromiso en 24 horas. ¡Gracias por elegirnos! ¿Quieres ver más? ¡Echa un vistazo a nuestros otros Tours Aéreos!'
      : 'We will reach out to you with a non binding offer within 24 hours. Thank you for choosing us! Want to see more? Have a look at our other Air Tours!',
    travelDate: locale === 'es' ? 'Fecha de viaje (YYYY-MM-DD)' : 'Travel Date (YYYY-MM-DD)',
    departureTime: locale === 'es' ? 'Hora de salida (hora de Cancún, México)' : 'Time of departure (Cancún, Mexico time)',
    returnDate: locale === 'es' ? 'Si es necesario, Fecha de regreso (YYYY-MM-DD)' : 'If required, Date of return (YYYY-MM-DD)',
    returnTime: locale === 'es' ? 'Hora de regreso (hora de Cancún, México)' : 'Time of return (Cancún, Mexico time)',
    departingFrom: locale === 'es' ? 'Saliendo desde...' : 'Departing from...',
    departingFromOther: locale === 'es' ? 'En caso de haber seleccionado "Otra Ubicación"' : 'In case of having selected "Other Location"',
    wantToGoTo: locale === 'es' ? 'Quiero ir a...' : 'I want to go to...',
    destinationOther: locale === 'es' ? 'En caso de haber seleccionado "Otro Destino"' : 'In case of having selected "Other Destination"',
    numberOfPassengers: locale === 'es' ? 'Número de Pasajeros' : 'Number of Passengers',
    selectOption: locale === 'es' ? '—Por favor, elige una opción—' : '—Please choose an option—',
    otherLocation: locale === 'es' ? 'Otra Ubicación' : 'Other Location',
    otherDestination: locale === 'es' ? 'Otro Destino' : 'Other Destination',
    selectTour: locale === 'es' ? 'Selecciona un tour' : 'Select a tour',
    selectDestination: locale === 'es' ? 'Selecciona un destino' : 'Select a destination',
    personalComments: locale === 'es' ? 'Comentarios personales' : 'Personal comments',
  };

  // Format slug to display name
  const formatSlug = (slug: string) => {
    return slug.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{labels.successTitle}</h3>
        <p className="text-muted mb-6">{labels.successMessage}</p>
        <a
          href={`/${locale}/contact`}
          className="inline-block text-brand-600 hover:text-brand-700 font-medium transition-colors"
        >
          {labels.sendAnother}
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Title based on quote type */}
      {(isCharterQuote || isTourQuote) && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {isCharterQuote ? labels.charterTitle : labels.tourTitle}
          </h2>
          <p className="text-muted text-sm">
            {isCharterQuote ? labels.charterSubtitle : labels.tourSubtitle}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Pre-selection Card */}
        {hasPreSelection && (
          <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/50">
                  <PaperAirplaneIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">
                    {labels.preSelectionTitle}
                  </p>
                  <p className="font-semibold text-foreground">
                    {preSelectedDestination && formatSlug(preSelectedDestination)}
                    {preSelectedTour && formatSlug(preSelectedTour)}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted">
                    {preSelectedAircraft && (
                      <span>{labels.preSelectionAircraft}: <strong className="text-foreground">{preSelectedAircraft}</strong></span>
                    )}
                    {preSelectedPrice && (
                      <span>{labels.preSelectionPrice}: <strong className="text-brand-600 dark:text-brand-400">{locale === 'es' ? 'Desde' : 'From'} ${preSelectedPrice} USD</strong></span>
                    )}
                  </div>
                </div>
              </div>
              <a
                href={`/${locale}/contact`}
                className="text-xs text-muted hover:text-brand-600 transition-colors flex items-center gap-1"
              >
                <XMarkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{labels.clearSelection}</span>
              </a>
            </div>
          </div>
        )}

        {/* SERVICE TYPE - ALWAYS FIRST */}
        <div>
          <label htmlFor="service_type" className="block text-sm font-medium mb-2">
            {labels.service} *
          </label>
          <select
            id="service_type"
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            required
            disabled={!!hasPreSelection}
            className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <option value="">{labels.selectService}</option>
            <option value="charter">{labels.charter}</option>
            <option value="tour">{labels.tour}</option>
          </select>
        </div>

        {/* CHARTER FLIGHT SPECIFIC FIELDS */}
        {formData.service_type === 'charter' && (
          <>
            {/* Travel Date */}
            <div>
              <label htmlFor="travel_date" className="block text-sm font-medium mb-2">
                {labels.travelDate} *
              </label>
              <input
                type="date"
                id="travel_date"
                name="travel_date"
                value={formData.travel_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Departure Time */}
            <div>
              <label htmlFor="departure_time" className="block text-sm font-medium mb-2">
                {labels.departureTime} *
              </label>
              <select
                id="departure_time"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              >
                <option value="">{labels.selectOption}</option>
                {TIME_OPTIONS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Return Date (optional) */}
            <div>
              <label htmlFor="return_date" className="block text-sm font-medium mb-2">
                {labels.returnDate}
              </label>
              <input
                type="date"
                id="return_date"
                name="return_date"
                value={formData.return_date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Return Time (conditional) */}
            {formData.return_date && (
              <div>
                <label htmlFor="return_time" className="block text-sm font-medium mb-2">
                  {labels.returnTime}
                </label>
                <select
                  id="return_time"
                  name="return_time"
                  value={formData.return_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                >
                  <option value="">{labels.selectOption}</option>
                  {TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Departing From */}
            <div>
              <label htmlFor="departure_location" className="block text-sm font-medium mb-2">
                {labels.departingFrom} *
              </label>
              <select
                id="departure_location"
                name="departure_location"
                value={formData.departure_location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              >
                <option value="">{labels.selectOption}</option>
                <option value="Cancún">Cancún</option>
                <option value="Playa del Carmen">Playa del Carmen</option>
                <option value="Tulum">Tulum</option>
                <option value="Cozumel">Cozumel</option>
                <option value="other">{labels.otherLocation}</option>
              </select>
            </div>

            {/* Departure Location Other (conditional) */}
            {formData.departure_location === 'other' && (
              <div>
                <label htmlFor="departure_location_other" className="block text-sm font-medium mb-2">
                  {labels.departingFromOther} *
                </label>
                <input
                  type="text"
                  id="departure_location_other"
                  name="departure_location_other"
                  value={formData.departure_location_other}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Destination Selection */}
            <div>
              <label htmlFor="destination" className="block text-sm font-medium mb-2">
                {labels.wantToGoTo} *
              </label>
              <select
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                disabled={!!preSelectedDestination}
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="">{labels.selectDestination}</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.slug}>
                    {locale === 'es' ? dest.name_es : dest.name_en}
                  </option>
                ))}
                <option value="other">{labels.otherDestination}</option>
              </select>
            </div>

            {/* Destination Other (conditional) */}
            {formData.destination === 'other' && (
              <div>
                <label htmlFor="destination_other" className="block text-sm font-medium mb-2">
                  {labels.destinationOther} *
                </label>
                <input
                  type="text"
                  id="destination_other"
                  name="destination_other"
                  value={formData.destination_other}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </>
        )}

        {/* AIR TOUR SPECIFIC FIELDS */}
        {formData.service_type === 'tour' && (
          <>
            {/* Tour Selection */}
            <div>
              <label htmlFor="tour" className="block text-sm font-medium mb-2">
                {labels.tour} *
              </label>
              <select
                id="tour"
                name="tour"
                value={formData.tour}
                onChange={handleChange}
                required
                disabled={!!preSelectedTour}
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="">{labels.selectTour}</option>
                {airTours.map(tour => (
                  <option key={tour.id} value={tour.slug}>
                    {locale === 'es' ? tour.name_es : tour.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Passengers */}
            <div>
              <label htmlFor="number_of_passengers" className="block text-sm font-medium mb-2">
                {labels.numberOfPassengers} *
              </label>
              <input
                type="number"
                id="number_of_passengers"
                name="number_of_passengers"
                value={formData.number_of_passengers}
                onChange={handleChange}
                min="1"
                max="20"
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Travel Date */}
            <div>
              <label htmlFor="travel_date" className="block text-sm font-medium mb-2">
                {labels.travelDate} *
              </label>
              <input
                type="date"
                id="travel_date"
                name="travel_date"
                value={formData.travel_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Departure Time */}
            <div>
              <label htmlFor="departure_time" className="block text-sm font-medium mb-2">
                {labels.departureTime} *
              </label>
              <select
                id="departure_time"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              >
                <option value="">{labels.selectOption}</option>
                {TIME_OPTIONS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* COMMON FIELDS - APPEAR AFTER SERVICE-SPECIFIC FIELDS */}
        {formData.service_type && (
          <>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                {labels.name} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {labels.email} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                {labels.phone} *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Personal Comments / Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                {formData.service_type === 'tour' ? labels.personalComments : labels.message}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-default bg-white dark:bg-navy-900 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <ExclamationCircleIcon className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? labels.sending : labels.submit}
        </button>
      </form>
    </div>
  );
}
