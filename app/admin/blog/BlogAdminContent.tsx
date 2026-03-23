'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import AdminLayout from '@/components/admin/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ImageSelector from '@/components/admin/ImageSelector';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

interface BlogPost {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  excerpt_es: string | null;
  excerpt_en: string | null;
  content_es: string;
  content_en: string;
  image_url: string | null;
  category: string;
  meta_title_es: string | null;
  meta_title_en: string | null;
  meta_description_es: string | null;
  meta_description_en: string | null;
  is_published: boolean;
  published_at: string | null;
}

interface BlogAdminContentProps {
  user: User;
  posts: BlogPost[];
}

const CATEGORIES = [
  { value: 'guides', label: 'Guías' },
  { value: 'destinations', label: 'Destinos' },
  { value: 'tips', label: 'Consejos' },
  { value: 'news', label: 'Noticias' },
];

type TabKey = 'basic' | 'content_es' | 'content_en' | 'seo';

export default function BlogAdminContent({ user, posts: initialPosts }: BlogAdminContentProps) {
  const supabase = createClient();
  const [posts, setPosts] = useState(initialPosts);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  const empty = {
    slug: '', title_es: '', title_en: '', excerpt_es: '', excerpt_en: '',
    content_es: '', content_en: '', image_url: '', category: 'guides',
    meta_title_es: '', meta_title_en: '', meta_description_es: '', meta_description_en: '',
    is_published: false,
  };
  const [formData, setFormData] = useState(empty);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleCreate = () => { setFormData(empty); setEditingId(null); setIsCreating(true); setActiveTab('basic'); setDrawerOpen(true); };

  const handleEdit = (p: BlogPost) => {
    setFormData({
      slug: p.slug, title_es: p.title_es, title_en: p.title_en,
      excerpt_es: p.excerpt_es || '', excerpt_en: p.excerpt_en || '',
      content_es: p.content_es, content_en: p.content_en,
      image_url: p.image_url || '', category: p.category,
      meta_title_es: p.meta_title_es || '', meta_title_en: p.meta_title_en || '',
      meta_description_es: p.meta_description_es || '', meta_description_en: p.meta_description_en || '',
      is_published: p.is_published,
    });
    setEditingId(p.id); setIsCreating(false); setActiveTab('basic'); setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title_es.trim()) { toast.error('El título en español es obligatorio'); return; }
    setSaving(true);
    const slug = formData.slug || generateSlug(formData.title_es);
    const payload = {
      ...formData, slug,
      image_url: formData.image_url || null,
      excerpt_es: formData.excerpt_es || null, excerpt_en: formData.excerpt_en || null,
      meta_title_es: formData.meta_title_es || null, meta_title_en: formData.meta_title_en || null,
      meta_description_es: formData.meta_description_es || null, meta_description_en: formData.meta_description_en || null,
      published_at: formData.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    try {
      if (isCreating) {
        const { data, error } = await supabase.from('blog_posts').insert([payload]).select().single();
        if (error) throw error;
        setPosts([data, ...posts]);
        toast.success('Artículo creado');
      } else if (editingId) {
        const { data, error } = await supabase.from('blog_posts').update(payload).eq('id', editingId).select().single();
        if (error) throw error;
        setPosts(posts.map(p => p.id === editingId ? data : p));
        toast.success('Artículo actualizado');
      }
      setDrawerOpen(false);
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setPosts(posts.filter(p => p.id !== id));
    toast.success('Artículo eliminado');
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'basic', label: 'Básico' },
    { key: 'content_es', label: 'Contenido ES' },
    { key: 'content_en', label: 'Content EN' },
    { key: 'seo', label: 'SEO' },
  ];

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Blog</h1>
          <p className="text-navy-400 mt-1">Gestiona los artículos del blog</p>
        </div>
        <button onClick={handleCreate} disabled={drawerOpen} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 text-white rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" /> Nuevo Artículo
        </button>
      </div>

      <div className="bg-navy-800/50 rounded-xl border border-navy-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Título</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-navy-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                <td className="px-4 py-3">
                  <p className="text-sm text-white truncate max-w-md">{p.title_es}</p>
                  <p className="text-xs text-navy-500">/{p.slug}</p>
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-navy-700 text-navy-300 px-2 py-1 rounded">{CATEGORIES.find(c => c.value === p.category)?.label || p.category}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${p.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {p.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(p)} className="p-2 text-navy-400 hover:text-white hover:bg-navy-700 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-700 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-navy-500">No hay artículos. Crea el primero.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-2xl bg-navy-900 border-l border-navy-700 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-navy-900 border-b border-navy-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{isCreating ? 'Nuevo Artículo' : 'Editar Artículo'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-navy-400 hover:text-white rounded-lg"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            {/* Tabs */}
            <div className="border-b border-navy-700 px-6">
              <div className="flex gap-1">
                {tabs.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'text-brand-400 border-b-2 border-brand-400' : 'text-navy-400 hover:text-white'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'basic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Título (ES) *</label>
                    <input type="text" value={formData.title_es} onChange={e => setFormData({ ...formData, title_es: e.target.value, slug: formData.slug || generateSlug(e.target.value) })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Title (EN)</label>
                    <input type="text" value={formData.title_en} onChange={e => setFormData({ ...formData, title_en: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Slug</label>
                    <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">Categoría</label>
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({ ...formData, is_published: e.target.checked })} className="w-4 h-4 rounded border-navy-600 bg-navy-800 text-brand-500 focus:ring-brand-500" />
                        <span className="text-sm text-navy-300">Publicado</span>
                      </label>
                    </div>
                  </div>
                  <ImageSelector value={formData.image_url} onChange={url => setFormData({ ...formData, image_url: url })} category="other" label="Imagen destacada" />
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Extracto (ES)</label>
                    <textarea value={formData.excerpt_es} onChange={e => setFormData({ ...formData, excerpt_es: e.target.value })} rows={2} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Excerpt (EN)</label>
                    <textarea value={formData.excerpt_en} onChange={e => setFormData({ ...formData, excerpt_en: e.target.value })} rows={2} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                  </div>
                </>
              )}

              {activeTab === 'content_es' && (
                <MarkdownEditor value={formData.content_es} onChange={val => setFormData({ ...formData, content_es: val })} label="Contenido (ES)" rows={20} />
              )}

              {activeTab === 'content_en' && (
                <MarkdownEditor value={formData.content_en} onChange={val => setFormData({ ...formData, content_en: val })} label="Content (EN)" rows={20} />
              )}

              {activeTab === 'seo' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Meta Title (ES)</label>
                    <input type="text" value={formData.meta_title_es} onChange={e => setFormData({ ...formData, meta_title_es: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Meta Title (EN)</label>
                    <input type="text" value={formData.meta_title_en} onChange={e => setFormData({ ...formData, meta_title_en: e.target.value })} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Meta Description (ES)</label>
                    <textarea value={formData.meta_description_es} onChange={e => setFormData({ ...formData, meta_description_es: e.target.value })} rows={2} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">Meta Description (EN)</label>
                    <textarea value={formData.meta_description_en} onChange={e => setFormData({ ...formData, meta_description_en: e.target.value })} rows={2} className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                  </div>
                </>
              )}
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
