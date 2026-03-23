'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import AdminLayout from '@/components/admin/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FAQ {
  id: string;
  question_es: string;
  question_en: string;
  answer_es: string;
  answer_en: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

interface FAQsContentProps {
  user: User;
  faqs: FAQ[];
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'pricing', label: 'Precios' },
  { value: 'charter', label: 'Vuelos Privados' },
  { value: 'tours', label: 'Tours Aéreos' },
  { value: 'safety', label: 'Seguridad' },
];

export default function FAQsContent({ user, faqs: initialFaqs }: FAQsContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    question_es: '', question_en: '', answer_es: '', answer_en: '',
    category: 'general', display_order: 0, is_active: true,
  });

  const handleCreate = () => {
    setFormData({ question_es: '', question_en: '', answer_es: '', answer_en: '', category: 'general', display_order: faqs.length, is_active: true });
    setEditingId(null);
    setIsCreating(true);
    setDrawerOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question_es: faq.question_es, question_en: faq.question_en,
      answer_es: faq.answer_es, answer_en: faq.answer_en,
      category: faq.category, display_order: faq.display_order, is_active: faq.is_active,
    });
    setEditingId(faq.id);
    setIsCreating(false);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question_es.trim() || !formData.answer_es.trim()) {
      toast.error('La pregunta y respuesta en español son obligatorias');
      return;
    }
    setSaving(true);
    try {
      if (isCreating) {
        const { data, error } = await supabase.from('faqs').insert([formData]).select().single();
        if (error) throw error;
        setFaqs([...faqs, data]);
        toast.success('FAQ creada');
      } else if (editingId) {
        const { data, error } = await supabase.from('faqs').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', editingId).select().single();
        if (error) throw error;
        setFaqs(faqs.map(f => f.id === editingId ? data : f));
        toast.success('FAQ actualizada');
      }
      setDrawerOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta FAQ?')) return;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setFaqs(faqs.filter(f => f.id !== id));
    toast.success('FAQ eliminada');
  };

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Preguntas Frecuentes</h1>
          <p className="text-navy-400 mt-1">Gestiona las FAQs del sitio</p>
        </div>
        <button onClick={handleCreate} disabled={drawerOpen} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 text-white rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" /> Nueva FAQ
        </button>
      </div>

      <div className="bg-navy-800/50 rounded-xl border border-navy-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Pregunta</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-navy-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map(faq => (
              <tr key={faq.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                <td className="px-4 py-3">
                  <p className="text-sm text-white truncate max-w-md">{faq.question_es}</p>
                  <p className="text-xs text-navy-500 truncate max-w-md">{faq.question_en}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-navy-700 text-navy-300 px-2 py-1 rounded">{CATEGORIES.find(c => c.value === faq.category)?.label || faq.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${faq.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {faq.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(faq)} className="p-2 text-navy-400 hover:text-white hover:bg-navy-700 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-700 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-navy-900 border-l border-navy-700 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-navy-900 border-b border-navy-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{isCreating ? 'Nueva FAQ' : 'Editar FAQ'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-navy-400 hover:text-white rounded-lg"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Categoría</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Pregunta (ES) *</label>
                <input type="text" value={formData.question_es} onChange={e => setFormData({ ...formData, question_es: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Pregunta (EN)</label>
                <input type="text" value={formData.question_en} onChange={e => setFormData({ ...formData, question_en: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Respuesta (ES) *</label>
                <textarea value={formData.answer_es} onChange={e => setFormData({ ...formData, answer_es: e.target.value })} rows={4} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Respuesta (EN)</label>
                <textarea value={formData.answer_en} onChange={e => setFormData({ ...formData, answer_en: e.target.value })} rows={4} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
                  <div className="w-9 h-5 bg-navy-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
                <span className="text-sm text-navy-300">Activa</span>
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
