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
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import ImageSelector from '@/components/admin/ImageSelector';
import Image from 'next/image';
import type { Aircraft } from '@/lib/types/aircraft';

interface FleetContentProps {
  user: User;
  aircraft: Aircraft[];
}

const SPEC_KEYS = [
  { key: 'engine', label_es: 'Motor', label_en: 'Engine' },
  { key: 'cruise_speed', label_es: 'Velocidad crucero', label_en: 'Cruise speed' },
  { key: 'range', label_es: 'Alcance', label_en: 'Range' },
  { key: 'ceiling', label_es: 'Techo de vuelo', label_en: 'Service ceiling' },
];

export default function FleetContent({ user, aircraft: initialAircraft }: FleetContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const [aircraft, setAircraft] = useState<Aircraft[]>(initialAircraft);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Omit<Aircraft, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    slug: '',
    max_passengers: 5,
    description_es: '',
    description_en: '',
    image_url: '',
    gallery_images: [],
    specs: {},
    is_active: true,
    display_order: 0,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      slug: '',
      max_passengers: 5,
      description_es: '',
      description_en: '',
      image_url: '',
      gallery_images: [],
      specs: {},
      is_active: true,
      display_order: aircraft.length,
    });
    setEditingId(null);
    setIsCreating(true);
    setDrawerOpen(true);
    setError('');
  };

  const handleEdit = (item: Aircraft) => {
    setFormData({
      name: item.name,
      slug: item.slug,
      max_passengers: item.max_passengers,
      description_es: item.description_es || '',
      description_en: item.description_en || '',
      image_url: item.image_url || '',
      gallery_images: item.gallery_images || [],
      specs: item.specs || {},
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setEditingId(item.id);
    setIsCreating(false);
    setDrawerOpen(true);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    setError('');

    const slug = formData.slug || generateSlug(formData.name);

    const dataToSave = {
      name: formData.name.trim(),
      slug,
      max_passengers: formData.max_passengers,
      description_es: formData.description_es || null,
      description_en: formData.description_en || null,
      image_url: formData.image_url || null,
      gallery_images: formData.gallery_images,
      specs: formData.specs,
      is_active: formData.is_active,
      display_order: formData.display_order,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isCreating) {
        const { data, error: insertError } = await supabase
          .from('aircraft')
          .insert([dataToSave])
          .select()
          .single();

        if (insertError) throw insertError;
        setAircraft([...aircraft, data]);
        toast.success('Aeronave creada exitosamente');
      } else if (editingId) {
        const { data, error: updateError } = await supabase
          .from('aircraft')
          .update(dataToSave)
          .eq('id', editingId)
          .select()
          .single();

        if (updateError) throw updateError;
        setAircraft(aircraft.map(a => a.id === editingId ? data : a));
        toast.success('Aeronave actualizada exitosamente');
      }

      setDrawerOpen(false);
      setEditingId(null);
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    const { error: deleteError } = await supabase
      .from('aircraft')
      .delete()
      .eq('id', id);

    if (deleteError) {
      toast.error('Error al eliminar: ' + deleteError.message);
      return;
    }

    setAircraft(aircraft.filter(a => a.id !== id));
    toast.success('Aeronave eliminada');
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...aircraft].sort((a, b) => a.display_order - b.display_order);
    const index = sorted.findIndex(a => a.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sorted.length - 1)) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const updates = [
      { id: sorted[index].id, display_order: sorted[swapIndex].display_order },
      { id: sorted[swapIndex].id, display_order: sorted[index].display_order },
    ];

    for (const update of updates) {
      await supabase.from('aircraft').update({ display_order: update.display_order }).eq('id', update.id);
    }

    setAircraft(prev => prev.map(a => {
      const u = updates.find(u => u.id === a.id);
      return u ? { ...a, display_order: u.display_order } : a;
    }));
  };

  const sortedAircraft = [...aircraft].sort((a, b) => a.display_order - b.display_order);

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Flota</h1>
          <p className="text-navy-400 mt-1">Gestiona el catálogo de aeronaves</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={drawerOpen}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Aeronave
        </button>
      </div>

      {/* Aircraft List */}
      <div className="bg-navy-800/50 rounded-xl border border-navy-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Orden</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Aeronave</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Pasajeros</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-navy-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedAircraft.map((item, idx) => (
              <tr key={item.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-navy-400 w-4">{idx + 1}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleReorder(item.id, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 text-navy-500 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUpIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleReorder(item.id, 'down')}
                        disabled={idx === sortedAircraft.length - 1}
                        className="p-0.5 text-navy-500 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDownIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-navy-700 flex items-center justify-center">
                        <span className="text-navy-500 text-xs">Sin foto</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-navy-500">{item.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-navy-300">
                    <UserGroupIcon className="w-4 h-4" />
                    {item.max_passengers}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    item.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-navy-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-700 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedAircraft.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-navy-500">
                  No hay aeronaves registradas. Haz clic en &quot;Nueva Aeronave&quot; para agregar una.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setDrawerOpen(false); setEditingId(null); setIsCreating(false); }} />
          <div className="relative w-full max-w-lg bg-navy-900 border-l border-navy-700 overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-navy-900 border-b border-navy-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {isCreating ? 'Nueva Aeronave' : 'Editar Aeronave'}
              </h2>
              <button
                onClick={() => { setDrawerOpen(false); setEditingId(null); setIsCreating(false); }}
                className="p-2 text-navy-400 hover:text-white rounded-lg hover:bg-navy-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ ...formData, name, slug: generateSlug(name) });
                  }}
                  placeholder="Ej: Cessna 206"
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="cessna-206"
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Max Passengers */}
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Máx. pasajeros *</label>
                <input
                  type="number"
                  value={formData.max_passengers}
                  onChange={(e) => setFormData({ ...formData, max_passengers: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Image */}
              <ImageSelector
                value={formData.image_url || ''}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                category="fleet"
                label="Foto principal"
                description="Selecciona o sube una foto de la aeronave"
              />

              {/* Descriptions */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-1">
                    <span className="mr-1">ES</span> Descripción
                  </label>
                  <textarea
                    value={formData.description_es || ''}
                    onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                    rows={3}
                    placeholder="Descripción del avión en español..."
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-1">
                    <span className="mr-1">EN</span> Description
                  </label>
                  <textarea
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                    placeholder="Aircraft description in English..."
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>
              </div>

              {/* Specs */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Especificaciones técnicas</h3>
                <p className="text-xs text-navy-500 mb-3">Opcional - se pueden agregar después</p>
                <div className="space-y-3">
                  {SPEC_KEYS.map(spec => (
                    <div key={spec.key}>
                      <label className="block text-xs font-medium text-navy-400 mb-1">{spec.label_es}</label>
                      <input
                        type="text"
                        value={(formData.specs as Record<string, string>)[spec.key] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          specs: { ...formData.specs, [spec.key]: e.target.value },
                        })}
                        placeholder={`Ej: ${spec.key === 'engine' ? 'Continental IO-520' : spec.key === 'cruise_speed' ? '250 km/h' : spec.key === 'range' ? '1,200 km' : '5,500 m'}`}
                        className="w-full px-3 py-2 text-sm bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
                <span className="text-sm text-navy-300">Activo (visible en la página de flota)</span>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="sticky bottom-0 bg-navy-900 border-t border-navy-700 px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={() => { setDrawerOpen(false); setEditingId(null); setIsCreating(false); }}
                className="flex-1 px-4 py-2.5 border border-navy-600 text-navy-300 rounded-lg hover:bg-navy-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
