'use client';

import { useState } from 'react';
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
  PaperAirplaneIcon,
  MapPinIcon,
  GlobeAmericasIcon,
  SunIcon,
  SparklesIcon,
  CameraIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserGroupIcon,
  HeartIcon,
  StarIcon,
  BoltIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

// Icon mapping for dynamic rendering
const ICON_MAP: { [key: string]: any } = {
  SunIcon,
  SparklesIcon,
  CameraIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserGroupIcon,
  HeartIcon,
  StarIcon,
  BoltIcon,
  FireIcon,
};

// Available icons for services
const AVAILABLE_ICONS = [
  { key: 'CheckCircleIcon', label: 'Check Circle' },
  { key: 'ShieldCheckIcon', label: 'Shield Check' },
  { key: 'SunIcon', label: 'Sun' },
  { key: 'SparklesIcon', label: 'Sparkles' },
  { key: 'CameraIcon', label: 'Camera' },
  { key: 'UserGroupIcon', label: 'User Group' },
  { key: 'HeartIcon', label: 'Heart' },
  { key: 'StarIcon', label: 'Star' },
  { key: 'BoltIcon', label: 'Bolt' },
  { key: 'FireIcon', label: 'Fire' },
];

interface Service {
  id: string;
  key: string;
  label_es: string;
  label_en: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

interface ServicesContentProps {
  user: User;
  destinationServices: Service[];
  tourServices: Service[];
}

type ServiceType = 'destination' | 'tour';

const emptyService: Omit<Service, 'id'> = {
  key: '',
  label_es: '',
  label_en: '',
  icon: 'CheckCircleIcon',
  display_order: 0,
  is_active: true,
};

export default function ServicesContent({
  user,
  destinationServices: initialDestinationServices,
  tourServices: initialTourServices,
}: ServicesContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const [destinationServices, setDestinationServices] = useState(initialDestinationServices);
  const [tourServices, setTourServices] = useState(initialTourServices);
  const [activeTab, setActiveTab] = useState<ServiceType>('destination');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<Service, 'id'>>(emptyService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentServices = activeTab === 'destination' ? destinationServices : tourServices;
  const setCurrentServices = activeTab === 'destination' ? setDestinationServices : setTourServices;
  const tableName = activeTab === 'destination' ? 'destination_services' : 'tour_services';

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      key: service.key,
      label_es: service.label_es,
      label_en: service.label_en,
      icon: service.icon,
      display_order: service.display_order,
      is_active: service.is_active,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      ...emptyService,
      display_order: currentServices.length,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(emptyService);
    setError('');
  };

  const generateKey = (label: string) => {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleSave = async () => {
    if (!formData.label_es || !formData.label_en) {
      setError('Los nombres en español e inglés son requeridos');
      return;
    }

    setLoading(true);
    setError('');

    const dataToSave = {
      ...formData,
      key: formData.key || generateKey(formData.label_es),
    };

    try {
      if (isCreating) {
        const { data, error: insertError } = await supabase
          .from(tableName)
          .insert([dataToSave])
          .select()
          .single();

        if (insertError) throw insertError;
        setCurrentServices([...currentServices, data]);
        toast.success('Servicio creado exitosamente');
      } else if (editingId) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update(dataToSave)
          .eq('id', editingId);

        if (updateError) throw updateError;
        setCurrentServices(currentServices.map(s =>
          s.id === editingId ? { ...s, ...dataToSave } : s
        ));
        toast.success('Servicio actualizado');
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
    toast('¿Eliminar este servicio?', {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setLoading(true);
          try {
            const { error: deleteError } = await supabase
              .from(tableName)
              .delete()
              .eq('id', id);

            if (deleteError) throw deleteError;
            setCurrentServices(currentServices.filter(s => s.id !== id));
            toast.success('Servicio eliminado');
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

  const handleToggleActive = async (service: Service) => {
    try {
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (updateError) throw updateError;
      setCurrentServices(currentServices.map(s =>
        s.id === service.id ? { ...s, is_active: !s.is_active } : s
      ));
      toast.success(service.is_active ? 'Servicio desactivado' : 'Servicio activado');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...currentServices].sort((a, b) => a.display_order - b.display_order);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= sorted.length) return;

    const currentItem = sorted[index];
    const swapItem = sorted[newIndex];

    try {
      await supabase
        .from(tableName)
        .update({ display_order: swapItem.display_order })
        .eq('id', currentItem.id);

      await supabase
        .from(tableName)
        .update({ display_order: currentItem.display_order })
        .eq('id', swapItem.id);

      const updated = currentServices.map(s => {
        if (s.id === currentItem.id) return { ...s, display_order: swapItem.display_order };
        if (s.id === swapItem.id) return { ...s, display_order: currentItem.display_order };
        return s;
      });
      setCurrentServices(updated);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al reordenar');
    }
  };

  const sortedServices = [...currentServices].sort((a, b) => a.display_order - b.display_order);

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Servicios</h1>
        <p className="text-navy-400 mt-1">
          Gestiona los servicios disponibles para destinos y tours
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('destination'); handleCancel(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'destination'
              ? 'bg-navy-600 text-white'
              : 'bg-navy-800 text-navy-400 hover:bg-navy-700'
          }`}
        >
          <MapPinIcon className="w-5 h-5" />
          Vuelos Privados
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-navy-700">
            {destinationServices.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('tour'); handleCancel(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'tour'
              ? 'bg-brand-500 text-white'
              : 'bg-navy-800 text-navy-400 hover:bg-navy-700'
          }`}
        >
          <GlobeAmericasIcon className="w-5 h-5" />
          Tours Aéreos
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-navy-700">
            {tourServices.length}
          </span>
        </button>
      </div>

      {error && !editingId && !isCreating && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isCreating || editingId) && (
        <div className="mb-6 bg-navy-900 rounded-xl border border-navy-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {isCreating ? 'Nuevo servicio' : 'Editar servicio'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">
                Key (identificador único)
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="Se genera automáticamente"
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-navy-500 mt-1">Dejar vacío para generar automáticamente</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">Icono</label>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-500/20 flex-shrink-0">
                  {(() => {
                    const PreviewIcon = ICON_MAP[formData.icon] || CheckCircleIcon;
                    return <PreviewIcon className="w-6 h-6 text-brand-400" />;
                  })()}
                </div>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="flex-1 px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon.key} value={icon.key}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">
                <span className="mr-1">🇪🇸</span> Nombre (Español)
              </label>
              <input
                type="text"
                value={formData.label_es}
                onChange={(e) => setFormData({ ...formData, label_es: e.target.value })}
                placeholder="ej: Agua embotellada"
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">
                <span className="mr-1">🇺🇸</span> Nombre (Inglés)
              </label>
              <input
                type="text"
                value={formData.label_en}
                onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                placeholder="ej: Bottled water"
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
            <span className="text-sm text-navy-300">Activo</span>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-lg transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="bg-navy-900 rounded-xl border border-navy-800 overflow-hidden">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h3 className="font-medium text-white">
            {activeTab === 'destination' ? 'Servicios para Vuelos Privados' : 'Servicios para Tours Aéreos'}
          </h3>
          <button
            onClick={handleCreate}
            disabled={isCreating || editingId !== null}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Agregar
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-navy-800">
            <tr>
              <th className="px-2 py-3 text-center text-xs font-medium text-navy-400 uppercase w-16">Orden</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Servicio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase hidden md:table-cell">Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-navy-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800 bg-navy-900">
            {sortedServices.map((service, index) => (
              <tr
                key={service.id}
                className={`bg-navy-900 hover:bg-navy-800/50 ${editingId === service.id ? 'bg-navy-800/50 ring-1 ring-brand-500' : ''}`}
              >
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
                      disabled={index === sortedServices.length - 1}
                      className={`p-1 rounded transition-colors ${
                        index === sortedServices.length - 1 ? 'text-navy-700 cursor-not-allowed' : 'text-navy-400 hover:text-white hover:bg-navy-700'
                      }`}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const ServiceIcon = ICON_MAP[service.icon] || CheckCircleIcon;
                      return (
                        <div className="p-2 rounded-lg bg-brand-500/20 flex-shrink-0">
                          <ServiceIcon className="w-5 h-5 text-brand-400" />
                        </div>
                      );
                    })()}
                    <div>
                      <p className="text-white font-medium">{service.label_es}</p>
                      <p className="text-navy-500 text-sm">{service.label_en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-navy-400 text-sm font-mono hidden md:table-cell">
                  {service.key}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      service.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-navy-700 text-navy-400'
                    }`}
                  >
                    {service.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedServices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-500">
                  No hay servicios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-navy-900/50 rounded-xl border border-navy-800">
        <p className="text-sm text-navy-400">
          <strong className="text-navy-300">Nota:</strong> Los servicios definidos aquí aparecerán como opciones
          seleccionables al editar cada {activeTab === 'destination' ? 'destino' : 'tour'}. Solo los servicios
          activos estarán disponibles para seleccionar.
        </p>
      </div>
    </AdminLayout>
  );
}
