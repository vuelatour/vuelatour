'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import AdminLayout from '@/components/admin/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Testimonial {
  id: string;
  author_name: string;
  author_location: string | null;
  rating: number;
  text_es: string;
  text_en: string;
  service_type: string;
  source: string;
  review_date: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

interface TestimonialsContentProps {
  user: User;
  testimonials: Testimonial[];
}

export default function TestimonialsContent({ user, testimonials: initial }: TestimonialsContentProps) {
  const supabase = createClient();
  const [testimonials, setTestimonials] = useState(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const empty = {
    author_name: '', author_location: '', rating: 5,
    text_es: '', text_en: '', service_type: 'general',
    source: 'tripadvisor', review_date: '', is_featured: false, is_active: true, display_order: 0,
  };
  const [formData, setFormData] = useState(empty);

  const handleCreate = () => { setFormData({ ...empty, display_order: testimonials.length }); setEditingId(null); setIsCreating(true); setDrawerOpen(true); };

  const handleEdit = (t: Testimonial) => {
    setFormData({
      author_name: t.author_name, author_location: t.author_location || '', rating: t.rating,
      text_es: t.text_es, text_en: t.text_en, service_type: t.service_type,
      source: t.source, review_date: t.review_date || '', is_featured: t.is_featured,
      is_active: t.is_active, display_order: t.display_order,
    });
    setEditingId(t.id); setIsCreating(false); setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!formData.author_name.trim() || !formData.text_es.trim()) { toast.error('Nombre y texto en español son obligatorios'); return; }
    setSaving(true);
    const payload = { ...formData, author_location: formData.author_location || null, review_date: formData.review_date || null };
    try {
      if (isCreating) {
        const { data, error } = await supabase.from('testimonials').insert([payload]).select().single();
        if (error) throw error;
        setTestimonials([...testimonials, data]);
        toast.success('Testimonio creado');
      } else if (editingId) {
        const { data, error } = await supabase.from('testimonials').update(payload).eq('id', editingId).select().single();
        if (error) throw error;
        setTestimonials(testimonials.map(t => t.id === editingId ? data : t));
        toast.success('Testimonio actualizado');
      }
      setDrawerOpen(false);
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este testimonio?')) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setTestimonials(testimonials.filter(t => t.id !== id));
    toast.success('Testimonio eliminado');
  };

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Testimonios</h1>
          <p className="text-navy-400 mt-1">Gestiona los testimonios de clientes</p>
        </div>
        <button onClick={handleCreate} disabled={drawerOpen} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 text-white rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" /> Nuevo Testimonio
        </button>
      </div>

      <div className="bg-navy-800/50 rounded-xl border border-navy-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Autor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Fuente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Destacado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-navy-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map(t => (
              <tr key={t.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                <td className="px-4 py-3">
                  <p className="text-sm text-white">{t.author_name}</p>
                  <p className="text-xs text-navy-500">{t.author_location || '-'}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      i < t.rating
                        ? <StarIconSolid key={i} className="w-3.5 h-3.5 text-yellow-400" />
                        : <StarIcon key={i} className="w-3.5 h-3.5 text-navy-600" />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-navy-700 text-navy-300 px-2 py-1 rounded capitalize">{t.source}</span></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${t.is_featured ? 'bg-yellow-500/20 text-yellow-400' : 'text-navy-500'}`}>{t.is_featured ? 'Destacado' : '-'}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(t)} className="p-2 text-navy-400 hover:text-white hover:bg-navy-700 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-700 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-navy-900 border-l border-navy-700 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-navy-900 border-b border-navy-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{isCreating ? 'Nuevo Testimonio' : 'Editar Testimonio'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-navy-400 hover:text-white rounded-lg"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-1">Nombre *</label>
                  <input type="text" value={formData.author_name} onChange={e => setFormData({ ...formData, author_name: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-1">Ubicación</label>
                  <input type="text" value={formData.author_location} onChange={e => setFormData({ ...formData, author_location: e.target.value })} placeholder="Ej: Texas, USA" className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-1">Rating</label>
                  <select value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} estrellas</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-1">Fuente</label>
                  <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="tripadvisor">TripAdvisor</option>
                    <option value="google">Google</option>
                    <option value="direct">Directo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-1">Fecha</label>
                  <input type="date" value={formData.review_date} onChange={e => setFormData({ ...formData, review_date: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Texto (ES) *</label>
                <textarea value={formData.text_es} onChange={e => setFormData({ ...formData, text_es: e.target.value })} rows={4} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Text (EN)</label>
                <textarea value={formData.text_en} onChange={e => setFormData({ ...formData, text_en: e.target.value })} rows={4} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded border-navy-600 bg-navy-800 text-brand-500 focus:ring-brand-500" />
                  <span className="text-sm text-navy-300">Destacado (homepage)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded border-navy-600 bg-navy-800 text-brand-500 focus:ring-brand-500" />
                  <span className="text-sm text-navy-300">Activo</span>
                </label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-navy-900 border-t border-navy-700 px-6 py-4 flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 px-4 py-2.5 border border-navy-600 text-navy-300 rounded-lg hover:bg-navy-800">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-lg">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
