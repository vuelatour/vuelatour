'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ContactFormProps {
  locale: string;
}

export default function ContactForm({ locale }: ContactFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    destination: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
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
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        destination: '',
        message: '',
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
    name: locale === 'es' ? 'Nombre completo' : 'Full name',
    email: locale === 'es' ? 'Correo electrónico' : 'Email address',
    phone: locale === 'es' ? 'Teléfono (opcional)' : 'Phone (optional)',
    service: locale === 'es' ? 'Tipo de servicio' : 'Service type',
    destination: locale === 'es' ? 'Destino de interés (opcional)' : 'Destination of interest (optional)',
    message: locale === 'es' ? 'Mensaje (opcional)' : 'Message (optional)',
    submit: locale === 'es' ? 'Enviar mensaje' : 'Send message',
    sending: locale === 'es' ? 'Enviando...' : 'Sending...',
    selectService: locale === 'es' ? 'Selecciona un servicio' : 'Select a service',
    charter: locale === 'es' ? 'Vuelo Charter' : 'Charter Flight',
    tour: locale === 'es' ? 'Tour Aéreo' : 'Air Tour',
    general: locale === 'es' ? 'Consulta General' : 'General Inquiry',
    successTitle: locale === 'es' ? '¡Mensaje enviado!' : 'Message sent!',
    successMessage: locale === 'es'
      ? 'Gracias por contactarnos. Te responderemos en menos de 24 horas.'
      : 'Thank you for contacting us. We will respond within 24 hours.',
    sendAnother: locale === 'es' ? 'Enviar otro mensaje' : 'Send another message',
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{labels.successTitle}</h3>
        <p className="text-muted mb-6">{labels.successMessage}</p>
        <button
          onClick={() => setSuccess(false)}
          className="text-brand-500 hover:text-brand-600 font-medium"
        >
          {labels.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          className="w-full px-4 py-3 rounded-lg border border-default bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
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
          className="w-full px-4 py-3 rounded-lg border border-default bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          {labels.phone}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-default bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Service Type */}
      <div>
        <label htmlFor="service_type" className="block text-sm font-medium mb-2">
          {labels.service}
        </label>
        <select
          id="service_type"
          name="service_type"
          value={formData.service_type}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-default bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        >
          <option value="">{labels.selectService}</option>
          <option value="charter">{labels.charter}</option>
          <option value="tour">{labels.tour}</option>
          <option value="general">{labels.general}</option>
        </select>
      </div>

      {/* Destination */}
      <div>
        <label htmlFor="destination" className="block text-sm font-medium mb-2">
          {labels.destination}
        </label>
        <input
          type="text"
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          placeholder={locale === 'es' ? 'ej. Cozumel, Holbox...' : 'e.g. Cozumel, Holbox...'}
          className="w-full px-4 py-3 rounded-lg border border-default bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          {labels.message}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-default bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
        />
      </div>

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
        className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {loading ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
