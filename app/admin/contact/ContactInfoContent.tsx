'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
  GlobeAltIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { User } from '@supabase/supabase-js';

interface Phone {
  display: string;
  link: string;
}

interface ContactInfo {
  id: string;
  address_es: string;
  address_en: string;
  phone: string;
  phone_link: string;
  phones: Phone[] | null;
  email: string;
  hours_es: string;
  hours_en: string;
  whatsapp_number: string;
  whatsapp_message_es: string;
  whatsapp_message_en: string;
  google_maps_embed: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  updated_at: string;
}

interface ContactInfoContentProps {
  user: User;
  contactInfo: ContactInfo | null;
}

type TabKey = 'general' | 'whatsapp' | 'social' | 'map';

export default function ContactInfoContent({ user, contactInfo }: ContactInfoContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    address_es: contactInfo?.address_es || '',
    address_en: contactInfo?.address_en || '',
    phone: contactInfo?.phone || '',
    phone_link: contactInfo?.phone_link || '',
    email: contactInfo?.email || '',
    hours_es: contactInfo?.hours_es || '',
    hours_en: contactInfo?.hours_en || '',
    whatsapp_number: contactInfo?.whatsapp_number || '',
    whatsapp_message_es: contactInfo?.whatsapp_message_es || '',
    whatsapp_message_en: contactInfo?.whatsapp_message_en || '',
    google_maps_embed: contactInfo?.google_maps_embed || '',
    facebook_url: contactInfo?.facebook_url || '',
    instagram_url: contactInfo?.instagram_url || '',
    tiktok_url: contactInfo?.tiktok_url || '',
    youtube_url: contactInfo?.youtube_url || '',
  });

  const [phones, setPhones] = useState<Phone[]>(
    contactInfo?.phones || [{ display: '', link: '' }]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filter out empty phones
      const validPhones = phones.filter(p => p.display.trim() !== '' && p.link.trim() !== '');

      if (contactInfo?.id) {
        // Update existing
        const { error } = await supabase
          .from('contact_info')
          .update({
            ...formData,
            phones: validPhones,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contactInfo.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('contact_info')
          .insert({
            ...formData,
            phones: validPhones,
          });

        if (error) throw error;
      }

      toast.success('Información guardada correctamente');
      router.refresh();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error al guardar la información');
    } finally {
      setSaving(false);
    }
  };

  const addPhone = () => {
    setPhones([...phones, { display: '', link: '' }]);
  };

  const removePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const updatePhone = (index: number, field: 'display' | 'link', value: string) => {
    const newPhones = [...phones];
    newPhones[index][field] = value;
    setPhones(newPhones);
  };

  const tabs = [
    { key: 'general' as TabKey, label: 'General', icon: MapPinIcon },
    { key: 'whatsapp' as TabKey, label: 'WhatsApp', icon: ChatBubbleLeftRightIcon },
    { key: 'social' as TabKey, label: 'Redes Sociales', icon: GlobeAltIcon },
    { key: 'map' as TabKey, label: 'Mapa', icon: MapIcon },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Información de Contacto</h1>
          <p className="text-navy-400 mt-1">
            Administra la información de contacto que aparece en el sitio
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <CheckIcon className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-500 text-white'
                : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-navy-900 rounded-xl border border-navy-800 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              {/* Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-navy-300">
                  <MapPinIcon className="w-5 h-5" />
                  <span className="font-medium">Dirección</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      Dirección (Español)
                    </label>
                    <textarea
                      value={formData.address_es}
                      onChange={(e) => setFormData({ ...formData, address_es: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      Dirección (English)
                    </label>
                    <textarea
                      value={formData.address_en}
                      onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Phones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-navy-300">
                    <PhoneIcon className="w-5 h-5" />
                    <span className="font-medium">Teléfonos</span>
                  </div>
                  <button
                    type="button"
                    onClick={addPhone}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white rounded-lg transition-colors text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Agregar teléfono
                  </button>
                </div>

                <div className="space-y-3">
                  {phones.map((phone, index) => (
                    <div key={index} className="flex gap-3 items-start p-3 bg-navy-800 rounded-lg border border-navy-700">
                      <div className="flex-1 grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-navy-400 mb-1">
                            Número mostrado
                          </label>
                          <input
                            type="text"
                            value={phone.display}
                            onChange={(e) => updatePhone(index, 'display', e.target.value)}
                            placeholder="+52 998 740 7149"
                            className="w-full px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-400 mb-1">
                            Número para enlace (sin espacios)
                          </label>
                          <input
                            type="text"
                            value={phone.link}
                            onChange={(e) => updatePhone(index, 'link', e.target.value)}
                            placeholder="+529987407149"
                            className="w-full px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                      {phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhone(index)}
                          className="mt-6 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar teléfono"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-navy-300">
                  <EnvelopeIcon className="w-5 h-5" />
                  <span className="font-medium">Email</span>
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@vuelatour.com"
                  className="w-full max-w-md px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Hours */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-navy-300">
                  <ClockIcon className="w-5 h-5" />
                  <span className="font-medium">Horario de atención</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      Horario (Español)
                    </label>
                    <input
                      type="text"
                      value={formData.hours_es}
                      onChange={(e) => setFormData({ ...formData, hours_es: e.target.value })}
                      placeholder="Lunes a Domingo: 6:00 AM - 8:00 PM"
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      Horario (English)
                    </label>
                    <input
                      type="text"
                      value={formData.hours_en}
                      onChange={(e) => setFormData({ ...formData, hours_en: e.target.value })}
                      placeholder="Monday to Sunday: 6:00 AM - 8:00 PM"
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-navy-300">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span className="font-medium">Configuración de WhatsApp</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-400 mb-1">
                    Número de WhatsApp (solo números, con código de país)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="529987407149"
                    className="w-full max-w-md px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-xs text-navy-500 mt-1">
                    Ejemplo: 529987407149 (52 es el código de México)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      Mensaje predeterminado (Español)
                    </label>
                    <textarea
                      value={formData.whatsapp_message_es}
                      onChange={(e) => setFormData({ ...formData, whatsapp_message_es: e.target.value })}
                      rows={3}
                      placeholder="Hola, me gustaría obtener más información..."
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      Mensaje predeterminado (English)
                    </label>
                    <textarea
                      value={formData.whatsapp_message_en}
                      onChange={(e) => setFormData({ ...formData, whatsapp_message_en: e.target.value })}
                      rows={3}
                      placeholder="Hello, I would like to get more information..."
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>
                </div>

                {/* Preview */}
                {formData.whatsapp_number && (
                  <div className="p-4 bg-navy-800 rounded-lg">
                    <p className="text-sm text-navy-400 mb-2">Vista previa del enlace:</p>
                    <a
                      href={`https://wa.me/${formData.whatsapp_number}${formData.whatsapp_message_es ? `?text=${encodeURIComponent(formData.whatsapp_message_es)}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Probar WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-navy-300">
                  <GlobeAltIcon className="w-5 h-5" />
                  <span className="font-medium">Redes Sociales</span>
                </div>
                <p className="text-sm text-navy-500">
                  Deja en blanco los campos de las redes que no uses
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/vuelatour"
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/vuelatour"
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      TikTok URL
                    </label>
                    <input
                      type="url"
                      value={formData.tiktok_url}
                      onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                      placeholder="https://tiktok.com/@vuelatour"
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-400 mb-1">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/@vuelatour"
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-navy-300">
                  <MapIcon className="w-5 h-5" />
                  <span className="font-medium">Google Maps</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-400 mb-1">
                    URL del iframe de Google Maps
                  </label>
                  <textarea
                    value={formData.google_maps_embed}
                    onChange={(e) => setFormData({ ...formData, google_maps_embed: e.target.value })}
                    rows={3}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-navy-500 mt-1">
                    Ve a Google Maps → Compartir → Incorporar un mapa → Copia solo la URL del src
                  </p>
                </div>

                {/* Preview */}
                {formData.google_maps_embed && (
                  <div>
                    <p className="text-sm text-navy-400 mb-2">Vista previa:</p>
                    <div className="rounded-lg overflow-hidden border border-navy-700">
                      <iframe
                        src={formData.google_maps_embed}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Last updated */}
          {contactInfo?.updated_at && (
            <div className="pt-4 border-t border-navy-800">
              <p className="text-sm text-navy-500">
                Última actualización: {formatDate(contactInfo.updated_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
