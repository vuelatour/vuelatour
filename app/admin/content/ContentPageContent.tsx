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
  DocumentTextIcon,
  InformationCircleIcon,
  ComputerDesktopIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

interface SiteContent {
  id: string;
  key: string;
  value_es: string;
  value_en: string;
  category: string | null;
}

interface ContentPageContentProps {
  user: User;
  content: SiteContent[];
}

// Configuración detallada de cada categoría con info de ubicación
const categoryConfig = {
  hero: {
    label: 'Hero / Principal',
    icon: '🏠',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Textos principales de la sección hero',
    location: 'Página de inicio - Sección superior',
    tips: 'Incluye títulos principales, subtítulos y badges que capturan la atención del visitante.',
    fields: [
      { key: 'hero_title', label: 'Título principal', placeholder_es: 'Vuela sobre el paraíso', placeholder_en: 'Fly over paradise' },
      { key: 'hero_subtitle', label: 'Subtítulo destacado', placeholder_es: 'del Caribe', placeholder_en: 'of the Caribbean' },
      { key: 'hero_description', label: 'Descripción', placeholder_es: 'Descripción del servicio...', placeholder_en: 'Service description...' },
      { key: 'hero_badge', label: 'Badge/Etiqueta', placeholder_es: '15+ años de experiencia', placeholder_en: '15+ years of experience' },
    ],
  },
  services: {
    label: 'Servicios',
    icon: '✈️',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Textos de la sección de servicios',
    location: 'Página de inicio - Sección de servicios',
    tips: 'Títulos y descripciones para las secciones de Vuelos Privados y Tours Aéreos.',
    fields: [
      { key: 'services_title', label: 'Título de sección', placeholder_es: 'Nuestros Servicios', placeholder_en: 'Our Services' },
      { key: 'charter_title', label: 'Título Vuelos Privados', placeholder_es: 'Vuelos Privados', placeholder_en: 'Charter Flights' },
      { key: 'charter_description', label: 'Descripción Charter', placeholder_es: 'Viaja a tu destino...', placeholder_en: 'Travel to your destination...' },
      { key: 'tours_title', label: 'Título Tours Aéreos', placeholder_es: 'Tours Aéreos', placeholder_en: 'Air Tours' },
      { key: 'tours_description', label: 'Descripción Tours', placeholder_es: 'Experiencias panorámicas...', placeholder_en: 'Panoramic experiences...' },
    ],
  },
  about: {
    label: 'Nosotros',
    icon: '👥',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Información sobre la empresa',
    location: 'Sección "Sobre Nosotros"',
    tips: 'Historia, misión, visión y valores de la empresa. Genera confianza en los visitantes.',
    fields: [
      { key: 'about_title', label: 'Título', placeholder_es: 'Sobre Nosotros', placeholder_en: 'About Us' },
      { key: 'about_description', label: 'Descripción', placeholder_es: 'Somos una empresa...', placeholder_en: 'We are a company...' },
      { key: 'about_mission', label: 'Misión', placeholder_es: 'Nuestra misión es...', placeholder_en: 'Our mission is...' },
      { key: 'about_experience', label: 'Experiencia', placeholder_es: '15+ años volando', placeholder_en: '15+ years flying' },
    ],
  },
  contact: {
    label: 'Contacto',
    icon: '📞',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    description: 'Textos de la página de contacto',
    location: 'Página de Contacto',
    tips: 'Títulos, subtítulos y llamados a la acción para el formulario de contacto.',
    fields: [
      { key: 'contact_title', label: 'Título', placeholder_es: 'Contáctanos', placeholder_en: 'Contact Us' },
      { key: 'contact_subtitle', label: 'Subtítulo', placeholder_es: '¿Listo para volar?', placeholder_en: 'Ready to fly?' },
      { key: 'contact_cta', label: 'Llamado a la acción', placeholder_es: 'Enviar mensaje', placeholder_en: 'Send message' },
    ],
  },
  cta: {
    label: 'Llamados a la Acción',
    icon: '🎯',
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    description: 'Botones y CTAs del sitio',
    location: 'Varios lugares del sitio',
    tips: 'Textos de botones importantes que motivan al usuario a tomar acción.',
    fields: [
      { key: 'cta_primary', label: 'CTA Principal', placeholder_es: 'Reservar ahora', placeholder_en: 'Book now' },
      { key: 'cta_secondary', label: 'CTA Secundario', placeholder_es: 'Ver servicios', placeholder_en: 'View services' },
      { key: 'cta_quote', label: 'CTA Cotización', placeholder_es: 'Solicitar cotización', placeholder_en: 'Request quote' },
      { key: 'cta_whatsapp', label: 'CTA WhatsApp', placeholder_es: 'Escríbenos', placeholder_en: 'Message us' },
    ],
  },
  footer: {
    label: 'Footer',
    icon: '📋',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    description: 'Textos del pie de página',
    location: 'Footer de todas las páginas',
    tips: 'Descripción de la empresa, enlaces legales y derechos de autor.',
    fields: [
      { key: 'footer_description', label: 'Descripción', placeholder_es: 'Vuelos privados...', placeholder_en: 'Private charter flights...' },
      { key: 'footer_rights', label: 'Derechos', placeholder_es: 'Todos los derechos reservados', placeholder_en: 'All rights reserved' },
    ],
  },
  seo: {
    label: 'SEO / Meta',
    icon: '🔍',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    description: 'Textos para SEO y metadatos',
    location: 'Etiquetas meta de cada página',
    tips: 'Títulos y descripciones que aparecen en Google y redes sociales.',
    fields: [
      { key: 'meta_title', label: 'Título Meta', placeholder_es: 'Vuelatour - Vuelos Privados', placeholder_en: 'Vuelatour - Charter Flights' },
      { key: 'meta_description', label: 'Descripción Meta', placeholder_es: 'Vuelos privados y tours...', placeholder_en: 'Charter flights and tours...' },
    ],
  },
  other: {
    label: 'Otros',
    icon: '📁',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    description: 'Textos misceláneos',
    location: 'Varios lugares del sitio',
    tips: 'Contenido adicional que no encaja en otras categorías.',
    fields: [],
  },
};

const categories = Object.entries(categoryConfig).map(([value, config]) => ({
  value,
  ...config,
}));

const emptyContent: Omit<SiteContent, 'id'> = {
  key: '',
  value_es: '',
  value_en: '',
  category: 'other',
};

export default function ContentPageContent({ user, content: initialContent }: ContentPageContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [content, setContent] = useState(initialContent);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<SiteContent, 'id'>>(emptyContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'sections' | 'list'>('sections');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cerrar drawer con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [drawerOpen]);

  const handleEdit = (item: SiteContent) => {
    setEditingId(item.id);
    setFormData({
      key: item.key,
      value_es: item.value_es,
      value_en: item.value_en,
      category: item.category || 'other',
    });
    setIsCreating(false);
    setDrawerOpen(true);
  };

  const handleCreate = (category?: string) => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ ...emptyContent, category: category || 'other' });
    setDrawerOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(emptyContent);
    setError('');
    setDrawerOpen(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      if (isCreating) {
        const { data, error: insertError } = await supabase
          .from('site_content')
          .insert([formData])
          .select()
          .single();

        if (insertError) throw insertError;
        setContent([...content, data]);
      } else if (editingId) {
        const { error: updateError } = await supabase
          .from('site_content')
          .update(formData)
          .eq('id', editingId);

        if (updateError) throw updateError;
        setContent(content.map(c =>
          c.id === editingId ? { ...c, ...formData } : c
        ));
      }

      handleCancel();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast('¿Eliminar este contenido?', {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setLoading(true);
          try {
            const { error: deleteError } = await supabase
              .from('site_content')
              .delete()
              .eq('id', id);

            if (deleteError) throw deleteError;
            setContent(content.filter(c => c.id !== id));
            toast.success('Contenido eliminado');
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

  const getContentByCategory = (category: string) => {
    return content.filter(c => c.category === category);
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.other;
  };

  // Componente para renderizar la sección de cada categoría
  const CategorySection = ({ category }: { category: typeof categories[0] }) => {
    const categoryContent = getContentByCategory(category.value);
    const config = getCategoryConfig(category.value);

    return (
      <div className="bg-navy-900 rounded-xl border border-navy-800 overflow-hidden">
        {/* Header de categoría */}
        <div className={`p-4 border-b border-navy-800`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{category.label}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
                    {categoryContent.length} {categoryContent.length === 1 ? 'texto' : 'textos'}
                  </span>
                </div>
                <p className="text-sm text-navy-400 mt-1">{config.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleCreate(category.value)}
              disabled={isCreating || editingId !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Agregar
            </button>
          </div>

          {/* Info de ubicación */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-navy-400">
              <ComputerDesktopIcon className="w-4 h-4" />
              <span>{config.location}</span>
            </div>
          </div>
        </div>

        {/* Preview visual */}
        <div className="p-4 bg-navy-950/50 border-b border-navy-800">
          <div className="flex items-center gap-2 mb-2">
            <InformationCircleIcon className="w-4 h-4 text-navy-500" />
            <span className="text-xs text-navy-500 font-medium">Vista previa de ubicación:</span>
          </div>
          <div className="relative bg-navy-800/50 rounded-lg p-3 overflow-hidden">
            {/* Mockup del sitio */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="ml-2 flex-1 h-3 bg-navy-700 rounded text-[8px] text-navy-500 flex items-center justify-center">
                vuelatour.com
              </div>
            </div>

            {/* Layout según categoría */}
            {category.value === 'hero' && (
              <div className="relative h-24 bg-navy-700 rounded overflow-hidden p-3">
                <div className="space-y-1">
                  <div className="w-16 h-2 bg-brand-500/50 rounded" />
                  <div className="w-40 h-4 bg-white/30 rounded" />
                  <div className="w-32 h-4 bg-brand-500/40 rounded" />
                  <div className="w-48 h-2 bg-white/20 rounded mt-2" />
                </div>
                <div className="absolute bottom-2 left-3 flex gap-2">
                  <div className="w-20 h-5 bg-brand-500/50 rounded" />
                  <div className="w-16 h-5 bg-navy-600 rounded" />
                </div>
              </div>
            )}

            {category.value === 'services' && (
              <div className="space-y-2">
                <div className="w-24 h-3 bg-white/20 rounded mx-auto" />
                <div className="flex gap-2">
                  <div className="flex-1 h-16 bg-navy-700 rounded p-2">
                    <div className="w-full h-2 bg-white/20 rounded mb-1" />
                    <div className="w-3/4 h-2 bg-white/10 rounded" />
                  </div>
                  <div className="flex-1 h-16 bg-navy-700 rounded p-2">
                    <div className="w-full h-2 bg-white/20 rounded mb-1" />
                    <div className="w-3/4 h-2 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            )}

            {category.value === 'about' && (
              <div className="flex gap-3">
                <div className="w-20 h-16 bg-navy-700 rounded" />
                <div className="flex-1 space-y-1">
                  <div className="w-20 h-3 bg-white/20 rounded" />
                  <div className="w-full h-2 bg-white/10 rounded" />
                  <div className="w-full h-2 bg-white/10 rounded" />
                  <div className="w-3/4 h-2 bg-white/10 rounded" />
                </div>
              </div>
            )}

            {category.value === 'contact' && (
              <div className="space-y-2">
                <div className="w-24 h-3 bg-white/20 rounded mx-auto" />
                <div className="w-40 h-2 bg-white/10 rounded mx-auto" />
                <div className="max-w-[120px] mx-auto space-y-1 mt-2">
                  <div className="w-full h-4 bg-navy-700 rounded" />
                  <div className="w-full h-4 bg-navy-700 rounded" />
                  <div className="w-full h-6 bg-brand-500/30 rounded" />
                </div>
              </div>
            )}

            {category.value === 'cta' && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="px-4 py-2 bg-brand-500/40 rounded text-[10px] text-white/70">Reservar</div>
                <div className="px-4 py-2 bg-navy-600 rounded text-[10px] text-white/70">Ver más</div>
                <div className="px-4 py-2 bg-green-500/40 rounded text-[10px] text-white/70">WhatsApp</div>
              </div>
            )}

            {category.value === 'footer' && (
              <div className="bg-navy-700 rounded p-2 mt-2">
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <div className="w-12 h-2 bg-white/20 rounded" />
                    <div className="w-20 h-1 bg-white/10 rounded" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-12 h-2 bg-white/20 rounded" />
                    <div className="w-16 h-1 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="w-32 h-1 bg-white/10 rounded mt-2" />
              </div>
            )}

            {category.value === 'seo' && (
              <div className="bg-white/10 rounded p-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-blue-400/50 rounded" />
                  <div className="w-32 h-2 bg-blue-400/30 rounded" />
                </div>
                <div className="w-48 h-2 bg-white/20 rounded mb-1" />
                <div className="w-40 h-1 bg-green-400/30 rounded" />
              </div>
            )}

            {category.value === 'other' && (
              <div className="flex items-center justify-center h-12 text-navy-500 text-xs">
                Contenido adicional
              </div>
            )}
          </div>

          <p className="text-xs text-navy-500 mt-2 italic">
            💡 {config.tips}
          </p>
        </div>

        {/* Campos sugeridos */}
        {config.fields.length > 0 && (
          <div className="p-4 border-b border-navy-800 bg-navy-900/50">
            <div className="flex items-center gap-2 mb-3">
              <DocumentTextIcon className="w-4 h-4 text-navy-500" />
              <span className="text-xs text-navy-500 font-medium">Campos sugeridos:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.fields.map((field) => {
                const exists = categoryContent.some(c => c.key === field.key);
                return (
                  <div
                    key={field.key}
                    className={`px-2 py-1 text-xs rounded border ${
                      exists
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-navy-800 border-navy-700 text-navy-400'
                    }`}
                  >
                    {field.label}
                    {exists && <span className="ml-1">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de contenido de esta categoría */}
        <div className="p-4">
          {categoryContent.length > 0 ? (
            <div className="space-y-3">
              {categoryContent.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 bg-navy-800/50 rounded-lg border border-navy-700 ${
                    editingId === item.id ? 'ring-2 ring-brand-500' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <code className="text-brand-400 text-sm font-mono bg-navy-900 px-2 py-0.5 rounded">
                          {item.key}
                        </code>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-700 rounded transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-navy-400 hover:text-red-400 hover:bg-navy-700 rounded transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-navy-500">🇪🇸 Español</span>
                        </div>
                        <p className="text-sm text-navy-300 bg-navy-900/50 p-2 rounded">
                          {item.value_es || <span className="text-navy-600 italic">Sin contenido</span>}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-navy-500">🇺🇸 Inglés</span>
                        </div>
                        <p className="text-sm text-navy-300 bg-navy-900/50 p-2 rounded">
                          {item.value_en || <span className="text-navy-600 italic">No content</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-navy-500">
              <DocumentTextIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay contenido en esta categoría</p>
              <button
                onClick={() => handleCreate(category.value)}
                className="mt-2 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Agregar primer contenido
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Contenido del Sitio</h1>
          <p className="text-navy-400 mt-1">
            Gestiona los textos organizados por sección. Total: {content.length} textos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle de vista */}
          <div className="flex items-center bg-navy-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('sections')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'sections'
                  ? 'bg-brand-500 text-white'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              Por Sección
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-500 text-white'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              Lista
            </button>
          </div>
          <button
            onClick={() => handleCreate()}
            disabled={isCreating || editingId !== null}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Contenido
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Vista por secciones */}
      {viewMode === 'sections' && (
        <div className="space-y-6">
          {categories.map((category) => (
            <CategorySection key={category.value} category={category} />
          ))}
        </div>
      )}

      {/* Vista lista tradicional */}
      {viewMode === 'list' && (
        <div className="bg-navy-900 rounded-xl border border-navy-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-navy-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase hidden md:table-cell">Español</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase hidden lg:table-cell">Inglés</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-navy-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {content.map((item) => {
                const config = getCategoryConfig(item.category || 'other');
                return (
                  <tr key={item.id} className={`hover:bg-navy-800/30 ${editingId === item.id ? 'bg-navy-800/50 ring-1 ring-brand-500' : ''}`}>
                    <td className="px-4 py-4">
                      <code className="text-brand-400 text-sm font-mono">{item.key}</code>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
                        {categoryConfig[item.category as keyof typeof categoryConfig]?.icon || '📁'}
                        {categoryConfig[item.category as keyof typeof categoryConfig]?.label || 'Otros'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-navy-300 text-sm truncate max-w-xs">{item.value_es}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-navy-300 text-sm truncate max-w-xs">{item.value_en}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {content.length === 0 && (
            <div className="p-8 text-center text-navy-500">
              No hay contenido registrado
            </div>
          )}
        </div>
      )}

      {/* Drawer lateral */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCancel}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-navy-900 border-l border-navy-800 z-50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800 bg-navy-900 sticky top-0">
              <h2 className="text-lg font-semibold text-white">
                {isCreating ? 'Nuevo Contenido' : 'Editar Contenido'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">
                      Key (identificador único)
                    </label>
                    <p className="text-xs text-navy-500 mb-2">Clave única para identificar este contenido en el código (sin espacios, usa guiones bajos)</p>
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="ej: hero_title, about_description, cta_button"
                      className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  {isCreating && (
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-1">Categoría</label>
                      <p className="text-xs text-navy-500 mb-2">Sección del sitio donde se usará este contenido</p>
                      <select
                        value={formData.category || 'other'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-300 mb-1">
                    <span>🇪🇸</span> Valor (Español)
                  </label>
                  <p className="text-xs text-navy-500 mb-2">Texto que se mostrará a los usuarios en español</p>
                  <textarea
                    value={formData.value_es}
                    onChange={(e) => setFormData({ ...formData, value_es: e.target.value })}
                    rows={4}
                    placeholder={getCategoryConfig(formData.category || 'other').fields?.find(f => f.key === formData.key)?.placeholder_es || 'ej: Vuela sobre el paraíso del Caribe...'}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-300 mb-1">
                    <span>🇺🇸</span> Valor (Inglés)
                  </label>
                  <p className="text-xs text-navy-500 mb-2">Texto que se mostrará a los visitantes internacionales</p>
                  <textarea
                    value={formData.value_en}
                    onChange={(e) => setFormData({ ...formData, value_en: e.target.value })}
                    rows={4}
                    placeholder={getCategoryConfig(formData.category || 'other').fields?.find(f => f.key === formData.key)?.placeholder_en || 'ej: Fly over the Caribbean paradise...'}
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer con botones */}
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
                  disabled={loading || !formData.key}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
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

interface ContentFormProps {
  formData: Omit<SiteContent, 'id'>;
  setFormData: (data: Omit<SiteContent, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  categoryConfig: typeof categoryConfig.hero;
  isNew?: boolean;
}

function ContentForm({ formData, setFormData, onSave, onCancel, loading, categoryConfig, isNew }: ContentFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy-300 mb-1">
            Key (identificador único)
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="hero_title, about_description, etc."
            className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {isNew && (
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Categoría</label>
            <select
              value={formData.category || 'other'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-300 mb-1">
            <span>🇪🇸</span> Valor (Español)
          </label>
          <textarea
            value={formData.value_es}
            onChange={(e) => setFormData({ ...formData, value_es: e.target.value })}
            rows={3}
            placeholder={categoryConfig.fields?.find(f => f.key === formData.key)?.placeholder_es || 'Contenido en español...'}
            className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-300 mb-1">
            <span>🇺🇸</span> Valor (Inglés)
          </label>
          <textarea
            value={formData.value_en}
            onChange={(e) => setFormData({ ...formData, value_en: e.target.value })}
            rows={3}
            placeholder={categoryConfig.fields?.find(f => f.key === formData.key)?.placeholder_en || 'Content in English...'}
            className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={onSave}
          disabled={loading || !formData.key}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <CheckIcon className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
          Cancelar
        </button>
      </div>
    </div>
  );
}
