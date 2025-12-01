'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import AdminLayout from '@/components/admin/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MapPinIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  SunIcon,
  SparklesIcon,
  CameraIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  PhotoIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import ImageSelector from '@/components/admin/ImageSelector';
import GalleryTab from '@/components/admin/GalleryTab';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import Image from 'next/image';

// Service interface (from database)
interface ServiceOption {
  id: string;
  key: string;
  label_es: string;
  label_en: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

// Icon mapping for dynamic services
const ICON_MAP: { [key: string]: any } = {
  SunIcon,
  SparklesIcon,
  CameraIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserGroupIcon,
};

// Default benefits
const DEFAULT_BENEFITS = [
  { key: 'time', title_es: 'Ahorra tiempo', title_en: 'Save time', desc_es: 'Evita largas horas de carretera y llega en minutos', desc_en: 'Avoid long road trips and arrive in minutes' },
  { key: 'comfort', title_es: 'Máximo confort', title_en: 'Maximum comfort', desc_es: 'Viaja en avioneta privada con todas las comodidades', desc_en: 'Travel in a private aircraft with all amenities' },
  { key: 'views', title_es: 'Vistas increíbles', title_en: 'Incredible views', desc_es: 'Disfruta del paisaje del Caribe desde las alturas', desc_en: 'Enjoy the Caribbean landscape from above' },
  { key: 'flexible', title_es: 'Horarios flexibles', title_en: 'Flexible schedules', desc_es: 'Elige el horario que mejor se adapte a tu itinerario', desc_en: 'Choose the time that best fits your itinerary' },
];

interface Benefit {
  key: string;
  title_es: string;
  title_en: string;
  desc_es: string;
  desc_en: string;
}

interface AircraftPricing {
  aircraft_name: string;
  max_passengers: number;
  price_usd: number;
  notes_es: string;
  notes_en: string;
}

// Default aircraft pricing
const DEFAULT_AIRCRAFT_PRICING: AircraftPricing[] = [
  { aircraft_name: 'Cessna 206', max_passengers: 5, price_usd: 750, notes_es: 'No incluye impuestos y posibles cargos extras*', notes_en: 'Does not include taxes and possible extra charges*' },
];

interface Destination {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  long_description_es?: string | null;
  long_description_en?: string | null;
  flight_time: string | null;
  price_from: number | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  services_included?: string[] | null;
  benefits?: Benefit[] | null;
  aircraft_pricing?: AircraftPricing[] | null;
  gallery_images?: string[] | null;
  meta_title_es?: string | null;
  meta_title_en?: string | null;
  meta_description_es?: string | null;
  meta_description_en?: string | null;
}

interface DestinationsContentProps {
  user: User;
  destinations: Destination[];
  availableServices: ServiceOption[];
}

const emptyDestination: Omit<Destination, 'id'> = {
  slug: '',
  name_es: '',
  name_en: '',
  description_es: '',
  description_en: '',
  long_description_es: '',
  long_description_en: '',
  flight_time: '',
  price_from: 0,
  image_url: '',
  is_active: true,
  display_order: 0,
  services_included: ['climate', 'luggage', 'water', 'photos', 'sanitizer', 'safety'],
  benefits: DEFAULT_BENEFITS,
  aircraft_pricing: DEFAULT_AIRCRAFT_PRICING,
  gallery_images: [],
  meta_title_es: '',
  meta_title_en: '',
  meta_description_es: '',
  meta_description_en: '',
};

type TabKey = 'basic' | 'content' | 'pricing' | 'gallery' | 'services' | 'seo';

export default function DestinationsContent({ user, destinations: initialDestinations, availableServices }: DestinationsContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [destinations, setDestinations] = useState(initialDestinations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<Destination, 'id'>>(emptyDestination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  // Close drawer with Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [drawerOpen]);

  const handleEdit = (destination: Destination) => {
    setEditingId(destination.id);
    setFormData({
      slug: destination.slug,
      name_es: destination.name_es,
      name_en: destination.name_en,
      description_es: destination.description_es || '',
      description_en: destination.description_en || '',
      long_description_es: destination.long_description_es || '',
      long_description_en: destination.long_description_en || '',
      flight_time: destination.flight_time || '',
      price_from: destination.price_from || 0,
      image_url: destination.image_url || '',
      is_active: destination.is_active,
      display_order: destination.display_order,
      services_included: destination.services_included || ['climate', 'luggage', 'water', 'photos', 'sanitizer', 'safety'],
      benefits: (destination.benefits && destination.benefits.length > 0) ? destination.benefits : DEFAULT_BENEFITS,
      aircraft_pricing: (destination.aircraft_pricing && destination.aircraft_pricing.length > 0) ? destination.aircraft_pricing : DEFAULT_AIRCRAFT_PRICING,
      gallery_images: destination.gallery_images || [],
      meta_title_es: destination.meta_title_es || '',
      meta_title_en: destination.meta_title_en || '',
      meta_description_es: destination.meta_description_es || '',
      meta_description_en: destination.meta_description_en || '',
    });
    setIsCreating(false);
    setActiveTab('basic');
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      ...emptyDestination,
      display_order: destinations.length,
    });
    setActiveTab('basic');
    setDrawerOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(emptyDestination);
    setError('');
    setDrawerOpen(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      if (isCreating) {
        const { data, error: insertError } = await supabase
          .from('destinations')
          .insert([formData])
          .select()
          .single();

        if (insertError) throw insertError;
        setDestinations([...destinations, data]);
        toast.success('Destino creado exitosamente');
      } else if (editingId) {
        const { error: updateError } = await supabase
          .from('destinations')
          .update(formData)
          .eq('id', editingId);

        if (updateError) throw updateError;
        setDestinations(destinations.map(d =>
          d.id === editingId ? { ...d, ...formData } : d
        ));
        toast.success('Destino actualizado');
      }

      handleCancel();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
      toast.error(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast('¿Eliminar este destino?', {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setLoading(true);
          try {
            const { error: deleteError } = await supabase
              .from('destinations')
              .delete()
              .eq('id', id);

            if (deleteError) throw deleteError;
            setDestinations(destinations.filter(d => d.id !== id));
            toast.success('Destino eliminado');
            router.refresh();
          } catch (err: any) {
            toast.error(err.message || 'Error al eliminar');
          } finally {
            setLoading(false);
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  const handleToggleActive = async (destination: Destination) => {
    try {
      const { error: updateError } = await supabase
        .from('destinations')
        .update({ is_active: !destination.is_active })
        .eq('id', destination.id);

      if (updateError) throw updateError;
      setDestinations(destinations.map(d =>
        d.id === destination.id ? { ...d, is_active: !d.is_active } : d
      ));
      toast.success(destination.is_active ? 'Destino desactivado' : 'Destino activado');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const sortedDestinations = [...destinations].sort((a, b) => a.display_order - b.display_order);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= sortedDestinations.length) return;

    const currentItem = sortedDestinations[index];
    const swapItem = sortedDestinations[newIndex];

    try {
      const { error: error1 } = await supabase
        .from('destinations')
        .update({ display_order: swapItem.display_order })
        .eq('id', currentItem.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('destinations')
        .update({ display_order: currentItem.display_order })
        .eq('id', swapItem.id);

      if (error2) throw error2;

      const updatedDestinations = destinations.map(d => {
        if (d.id === currentItem.id) return { ...d, display_order: swapItem.display_order };
        if (d.id === swapItem.id) return { ...d, display_order: currentItem.display_order };
        return d;
      });
      setDestinations(updatedDestinations);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al reordenar');
    }
  };

  const toggleService = (serviceKey: string) => {
    const current = formData.services_included || [];
    if (current.includes(serviceKey)) {
      setFormData({ ...formData, services_included: current.filter(s => s !== serviceKey) });
    } else {
      setFormData({ ...formData, services_included: [...current, serviceKey] });
    }
  };

  const updateBenefit = (index: number, field: keyof Benefit, value: string) => {
    const currentBenefits = (formData.benefits && formData.benefits.length > 0) ? formData.benefits : DEFAULT_BENEFITS;
    const benefits = [...currentBenefits];
    benefits[index] = { ...benefits[index], [field]: value };
    setFormData({ ...formData, benefits });
  };

  // Aircraft pricing functions
  const getCurrentPricing = () => {
    return (formData.aircraft_pricing && formData.aircraft_pricing.length > 0)
      ? formData.aircraft_pricing
      : DEFAULT_AIRCRAFT_PRICING;
  };

  const addAircraftPricing = () => {
    const currentPricing = getCurrentPricing();
    const newPricing: AircraftPricing = {
      aircraft_name: '',
      max_passengers: 5,
      price_usd: 0,
      notes_es: 'No incluye impuestos y posibles cargos extras*',
      notes_en: 'Does not include taxes and possible extra charges*',
    };
    setFormData({ ...formData, aircraft_pricing: [...currentPricing, newPricing] });
  };

  const removeAircraftPricing = (index: number) => {
    const currentPricing = getCurrentPricing();
    if (currentPricing.length <= 1) {
      toast.error('Debe haber al menos un precio de avión');
      return;
    }
    const newPricing = currentPricing.filter((_, i) => i !== index);
    setFormData({ ...formData, aircraft_pricing: newPricing });
  };

  const updateAircraftPricing = (index: number, field: keyof AircraftPricing, value: string | number) => {
    const currentPricing = getCurrentPricing();
    const newPricing = [...currentPricing];
    newPricing[index] = { ...newPricing[index], [field]: value };
    setFormData({ ...formData, aircraft_pricing: newPricing });
  };

  const sortedDestinations = [...destinations].sort((a, b) => a.display_order - b.display_order);

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'basic', label: 'Básico', icon: MapPinIcon },
    { key: 'content', label: 'Contenido', icon: DocumentTextIcon },
    { key: 'pricing', label: 'Precios', icon: CurrencyDollarIcon },
    { key: 'gallery', label: 'Galería', icon: PhotoIcon },
    { key: 'services', label: 'Servicios', icon: Cog6ToothIcon },
    { key: 'seo', label: 'SEO', icon: MagnifyingGlassIcon },
  ];

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Destinos</h1>
          <p className="text-navy-400 mt-1">Gestiona los destinos de vuelos privados</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating || editingId !== null}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Destino
        </button>
      </div>

      {error && !drawerOpen && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Destinations List */}
      <div className="bg-navy-900 rounded-xl border border-navy-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-800">
            <tr>
              <th className="px-2 py-3 text-center text-xs font-medium text-navy-400 uppercase w-16">Orden</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Destino</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase hidden md:table-cell">Tiempo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase hidden md:table-cell">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-navy-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {sortedDestinations.map((destination, index) => (
              <tr key={destination.id} className={`hover:bg-navy-800/30 ${editingId === destination.id ? 'bg-navy-800/50 ring-1 ring-brand-500' : ''}`}>
                <td className="px-2 py-4">
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded transition-colors ${
                        index === 0 ? 'text-navy-700 cursor-not-allowed' : 'text-navy-400 hover:text-white hover:bg-navy-700'
                      }`}
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-navy-500 font-mono">{index + 1}</span>
                    <button
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === sortedDestinations.length - 1}
                      className={`p-1 rounded transition-colors ${
                        index === sortedDestinations.length - 1 ? 'text-navy-700 cursor-not-allowed' : 'text-navy-400 hover:text-white hover:bg-navy-700'
                      }`}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-navy-800">
                      {destination.image_url ? (
                        <Image
                          src={destination.image_url}
                          alt={destination.name_es}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized={destination.image_url.startsWith('http')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPinIcon className="w-6 h-6 text-navy-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{destination.name_es}</p>
                      <p className="text-navy-500 text-sm">{destination.name_en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-navy-300 hidden md:table-cell">
                  {destination.flight_time || '-'}
                </td>
                <td className="px-4 py-4 text-navy-300 hidden md:table-cell">
                  {destination.price_from ? `$${destination.price_from.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleToggleActive(destination)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      destination.is_active ? 'bg-green-500/20 text-green-400' : 'bg-navy-700 text-navy-400'
                    }`}
                  >
                    {destination.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(destination)}
                      className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(destination.id)}
                      className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedDestinations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-500">
                  No hay destinos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer lateral con tabs */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCancel} />
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-navy-900 border-l border-navy-800 z-50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800 bg-navy-900 sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-white">
                {isCreating ? 'Nuevo Destino' : 'Editar Destino'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-navy-800 bg-navy-950/50 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-navy-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Tab: Basic Info */}
              {activeTab === 'basic' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">Slug (URL)</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="cozumel"
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">Orden</label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">
                        <span className="mr-1">🇪🇸</span> Nombre (ES)
                      </label>
                      <input
                        type="text"
                        value={formData.name_es}
                        onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                        placeholder="Cozumel"
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">
                        <span className="mr-1">🇺🇸</span> Nombre (EN)
                      </label>
                      <input
                        type="text"
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        placeholder="Cozumel"
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">Tiempo de vuelo</label>
                      <input
                        type="text"
                        value={formData.flight_time || ''}
                        onChange={(e) => setFormData({ ...formData, flight_time: e.target.value })}
                        placeholder="45 min"
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">Precio desde (USD)</label>
                      <input
                        type="number"
                        value={formData.price_from || ''}
                        onChange={(e) => setFormData({ ...formData, price_from: parseFloat(e.target.value) || 0 })}
                        placeholder="450"
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <ImageSelector
                    value={formData.image_url || ''}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    category="destinations"
                    label="Imagen principal"
                    description="Imagen destacada del destino"
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                    <span className="text-sm text-navy-300">Destino activo</span>
                  </div>
                </div>
              )}

              {/* Tab: Content */}
              {activeTab === 'content' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">
                      <span className="mr-1">🇪🇸</span> Descripción corta (ES)
                    </label>
                    <p className="text-xs text-navy-500 mb-2">Para tarjetas de listado</p>
                    <textarea
                      value={formData.description_es || ''}
                      onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                      rows={2}
                      placeholder="Breve descripción..."
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">
                      <span className="mr-1">🇺🇸</span> Descripción corta (EN)
                    </label>
                    <textarea
                      value={formData.description_en || ''}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      rows={2}
                      placeholder="Short description..."
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="border-t border-navy-800 pt-5">
                    <MarkdownEditor
                      value={formData.long_description_es || ''}
                      onChange={(value) => setFormData({ ...formData, long_description_es: value })}
                      label="🇪🇸 Descripción detallada (ES)"
                      description="Para la página de detalle. Soporta formato markdown."
                      placeholder="Descripción completa del destino..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <MarkdownEditor
                      value={formData.long_description_en || ''}
                      onChange={(value) => setFormData({ ...formData, long_description_en: value })}
                      label="🇺🇸 Descripción detallada (EN)"
                      description="For the detail page. Supports markdown formatting."
                      placeholder="Full description..."
                      rows={6}
                    />
                  </div>
                </div>
              )}

              {/* Tab: Pricing */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Precios por Avión</h3>
                      <p className="text-xs text-navy-500 mt-1">Configura los precios según el tipo de aeronave</p>
                    </div>
                    <button
                      type="button"
                      onClick={addAircraftPricing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Agregar avión
                    </button>
                  </div>

                  <div className="space-y-4">
                    {getCurrentPricing().map((pricing, index) => (
                      <div key={index} className="bg-navy-800/50 rounded-lg p-4 border border-navy-700">
                        <div className="flex items-center justify-between mb-4">
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {pricing.aircraft_name || 'Nuevo avión'}
                            </span>
                          </span>
                          {getCurrentPricing().length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAircraftPricing(index)}
                              className="p-1.5 text-navy-400 hover:text-red-400 hover:bg-navy-700 rounded transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-navy-400 mb-1">Nombre del avión</label>
                            <input
                              type="text"
                              value={pricing.aircraft_name}
                              onChange={(e) => updateAircraftPricing(index, 'aircraft_name', e.target.value)}
                              placeholder="Ej: Cessna 206"
                              className="w-full px-3 py-2 text-sm bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-400 mb-1">Máx. pasajeros</label>
                            <input
                              type="number"
                              value={pricing.max_passengers}
                              onChange={(e) => updateAircraftPricing(index, 'max_passengers', parseInt(e.target.value) || 0)}
                              placeholder="5"
                              min="1"
                              className="w-full px-3 py-2 text-sm bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-xs font-medium text-navy-400 mb-1">Precio desde (USD)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">$</span>
                            <input
                              type="number"
                              value={pricing.price_usd}
                              onChange={(e) => updateAircraftPricing(index, 'price_usd', parseInt(e.target.value) || 0)}
                              placeholder="750"
                              min="0"
                              className="w-full pl-7 pr-3 py-2 text-sm bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-navy-400 mb-1">
                              <span className="mr-1">🇪🇸</span> Notas (ES)
                            </label>
                            <input
                              type="text"
                              value={pricing.notes_es}
                              onChange={(e) => updateAircraftPricing(index, 'notes_es', e.target.value)}
                              placeholder="No incluye impuestos..."
                              className="w-full px-3 py-2 text-sm bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-400 mb-1">
                              <span className="mr-1">🇺🇸</span> Notes (EN)
                            </label>
                            <input
                              type="text"
                              value={pricing.notes_en}
                              onChange={(e) => updateAircraftPricing(index, 'notes_en', e.target.value)}
                              placeholder="Does not include taxes..."
                              className="w-full px-3 py-2 text-sm bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preview */}
                  <div className="border-t border-navy-800 pt-6">
                    <h4 className="text-sm font-semibold text-white mb-3">Vista previa</h4>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {getCurrentPricing().map((pricing, index) => (
                        <div key={index} className="flex-shrink-0 w-48 bg-white rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-1">
                            Para hasta {pricing.max_passengers} pasajeros
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${pricing.price_usd.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">USD</p>
                          <p className="text-xs text-brand-500 mt-2">{pricing.aircraft_name || 'Avión'}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{pricing.notes_es}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Gallery */}
              {activeTab === 'gallery' && (
                <GalleryTab
                  galleryImages={formData.gallery_images || []}
                  onUpdate={(images) => setFormData({ ...formData, gallery_images: images })}
                  category="destinations"
                />
              )}

              {/* Tab: Services & Benefits */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">Servicios incluidos</h3>
                      <a
                        href="/admin/services"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        <span>Gestionar servicios</span>
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    {availableServices.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableServices.map((service) => {
                          const ServiceIcon = ICON_MAP[service.icon] || CheckCircleIcon;
                          return (
                            <button
                              key={service.key}
                              type="button"
                              onClick={() => toggleService(service.key)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                                formData.services_included?.includes(service.key)
                                  ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                                  : 'bg-navy-800 border-navy-700 text-navy-400 hover:border-navy-600'
                              }`}
                            >
                              <ServiceIcon className={`w-4 h-4 flex-shrink-0 ${formData.services_included?.includes(service.key) ? 'text-brand-400' : 'text-navy-500'}`} />
                              <span className="truncate">{service.label_es}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-700 text-center">
                        <p className="text-navy-400 text-sm mb-2">No hay servicios configurados</p>
                        <a
                          href="/admin/services"
                          className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                          <span>Agregar servicios</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-navy-800 pt-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Beneficios (4 items)</h3>
                    <p className="text-xs text-navy-500 mb-4">Sección &quot;¿Por qué volar a este destino?&quot; en la página de detalle</p>
                    <div className="space-y-4">
                      {((formData.benefits && formData.benefits.length > 0) ? formData.benefits : DEFAULT_BENEFITS).map((benefit, index) => (
                        <div key={benefit.key} className="bg-navy-800/50 rounded-lg p-4 border border-navy-700">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-xs text-navy-500 uppercase">{benefit.key}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={benefit.title_es}
                              onChange={(e) => updateBenefit(index, 'title_es', e.target.value)}
                              placeholder="Título (ES)"
                              className="w-full px-2 py-1.5 text-sm bg-navy-900 border border-navy-600 rounded text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <input
                              type="text"
                              value={benefit.title_en}
                              onChange={(e) => updateBenefit(index, 'title_en', e.target.value)}
                              placeholder="Title (EN)"
                              className="w-full px-2 py-1.5 text-sm bg-navy-900 border border-navy-600 rounded text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <input
                              type="text"
                              value={benefit.desc_es}
                              onChange={(e) => updateBenefit(index, 'desc_es', e.target.value)}
                              placeholder="Descripción (ES)"
                              className="w-full px-2 py-1.5 text-sm bg-navy-900 border border-navy-600 rounded text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <input
                              type="text"
                              value={benefit.desc_en}
                              onChange={(e) => updateBenefit(index, 'desc_en', e.target.value)}
                              placeholder="Description (EN)"
                              className="w-full px-2 py-1.5 text-sm bg-navy-900 border border-navy-600 rounded text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-5">
                  <div className="bg-navy-800/50 rounded-lg p-4 border border-navy-700">
                    <h3 className="text-sm font-semibold text-white mb-2">Vista previa en Google</h3>
                    <div className="bg-white rounded-lg p-3 text-sm">
                      <p className="text-blue-600 font-medium truncate">
                        {formData.meta_title_es || `Vuelo Privado a ${formData.name_es}` || 'Título de la página'}
                      </p>
                      <p className="text-green-700 text-xs truncate">vuelatour.com/es/charter-flights/{formData.slug || 'destino'}</p>
                      <p className="text-gray-600 text-xs line-clamp-2">
                        {formData.meta_description_es || formData.description_es || 'Descripción de la página...'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">🇪🇸 Meta título</label>
                      <input
                        type="text"
                        value={formData.meta_title_es || ''}
                        onChange={(e) => setFormData({ ...formData, meta_title_es: e.target.value })}
                        placeholder={`Vuelo Privado a ${formData.name_es || 'Destino'}`}
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <p className="text-xs text-navy-500 mt-1">{(formData.meta_title_es || '').length}/60</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">🇺🇸 Meta título</label>
                      <input
                        type="text"
                        value={formData.meta_title_en || ''}
                        onChange={(e) => setFormData({ ...formData, meta_title_en: e.target.value })}
                        placeholder={`Private Flight to ${formData.name_en || 'Destination'}`}
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <p className="text-xs text-navy-500 mt-1">{(formData.meta_title_en || '').length}/60</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">🇪🇸 Meta descripción</label>
                    <textarea
                      value={formData.meta_description_es || ''}
                      onChange={(e) => setFormData({ ...formData, meta_description_es: e.target.value })}
                      rows={2}
                      placeholder="Descripción para buscadores..."
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-xs text-navy-500 mt-1">{(formData.meta_description_es || '').length}/160</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">🇺🇸 Meta descripción</label>
                    <textarea
                      value={formData.meta_description_en || ''}
                      onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })}
                      rows={2}
                      placeholder="Description for search engines..."
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-xs text-navy-500 mt-1">{(formData.meta_description_en || '').length}/160</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-navy-800 bg-navy-900 sticky bottom-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-lg transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
