'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface SiteImage {
  id: string;
  key: string;
  url: string;
  alt_es: string | null;
  alt_en: string | null;
  category: string | null;
}

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  category?: string; // Categoría sugerida para filtrar/subir
  label?: string;
  description?: string;
  placeholder?: string;
}

const categoryLabels: Record<string, string> = {
  hero: 'Hero / Principal',
  destinations: 'Destinos',
  tours: 'Tours Aéreos',
  gallery: 'Galería',
  about: 'Nosotros',
  fleet: 'Flota',
  other: 'Otros',
};

export default function ImageSelector({
  value,
  onChange,
  category,
  label = 'Imagen',
  description = 'Selecciona una imagen existente o sube una nueva',
  placeholder = 'https://ejemplo.com/imagen.jpg',
}: ImageSelectorProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const [mode, setMode] = useState<'gallery' | 'url'>('gallery');

  // Cargar imágenes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const uploadCategory = category || 'other';
      const filePath = `${uploadCategory}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Guardar en site_images para que aparezca en la galería
      const { data: newImage, error: insertError } = await supabase
        .from('site_images')
        .insert([{
          key: fileName.replace(`.${fileExt}`, ''),
          url: publicUrl,
          category: uploadCategory,
          alt_es: '',
          alt_en: '',
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Agregar a la lista local y seleccionar
      setImages([...images, newImage]);
      onChange(publicUrl);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectImage = (url: string) => {
    onChange(url);
    setIsOpen(false);
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = searchTerm === '' ||
      img.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.alt_es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.alt_en?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Object.keys(categoryLabels)];

  return (
    <div>
      <label className="block text-sm font-medium text-navy-300 mb-1">{label}</label>
      <p className="text-xs text-navy-500 mb-2">{description}</p>

      {/* Preview y botón de selección */}
      <div className="space-y-3">
        {value && (
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 rounded-lg object-cover border border-navy-700"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
              title="Quitar imagen"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
          >
            <PhotoIcon className="w-5 h-5" />
            {value ? 'Cambiar imagen' : 'Seleccionar imagen'}
          </button>
        </div>

        {/* Input URL directo (colapsado) */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white text-sm placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Modal de selección */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-4 md:inset-10 lg:inset-20 bg-navy-900 rounded-xl border border-navy-800 z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800">
              <h3 className="text-lg font-semibold text-white">Seleccionar imagen</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-navy-800">
              <button
                onClick={() => setMode('gallery')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  mode === 'gallery'
                    ? 'text-brand-400 border-b-2 border-brand-500 bg-navy-800/50'
                    : 'text-navy-400 hover:text-white'
                }`}
              >
                <PhotoIcon className="w-4 h-4 inline mr-2" />
                Galería de imágenes
              </button>
              <button
                onClick={() => setMode('url')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  mode === 'url'
                    ? 'text-brand-400 border-b-2 border-brand-500 bg-navy-800/50'
                    : 'text-navy-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline mr-2" />
                Ingresar URL
              </button>
            </div>

            {mode === 'gallery' ? (
              <>
                {/* Filtros */}
                <div className="px-6 py-4 border-b border-navy-800 space-y-3">
                  {/* Búsqueda */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar imagen..."
                      className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Categorías */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedCategory === cat
                            ? 'bg-brand-500 text-white'
                            : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
                        }`}
                      >
                        {cat === 'all' ? 'Todas' : categoryLabels[cat] || cat}
                        {cat !== 'all' && (
                          <span className="ml-1 opacity-70">
                            ({images.filter(i => i.category === cat).length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid de imágenes */}
                <div className="flex-1 overflow-y-auto p-6">
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-navy-400">Cargando imágenes...</div>
                    </div>
                  ) : filteredImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredImages.map((image) => (
                        <button
                          key={image.id}
                          onClick={() => handleSelectImage(image.url)}
                          className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            value === image.url
                              ? 'border-brand-500 ring-2 ring-brand-500/50'
                              : 'border-navy-700 hover:border-brand-500/50'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.alt_es || image.key}
                            className="w-full h-full object-cover"
                          />
                          {value === image.url && (
                            <div className="absolute inset-0 bg-brand-500/30 flex items-center justify-center">
                              <CheckIcon className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-xs text-white truncate">{image.key}</p>
                            <p className="text-xs text-navy-400 truncate">
                              {categoryLabels[image.category || 'other']}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-navy-500">
                      <PhotoIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No se encontraron imágenes</p>
                    </div>
                  )}
                </div>

                {/* Footer con opción de subir */}
                <div className="px-6 py-4 border-t border-navy-800 bg-navy-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-navy-400">
                      ¿No encuentras la imagen que buscas?
                    </p>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors"
                      >
                        <CloudArrowUpIcon className="w-5 h-5" />
                        {uploading ? 'Subiendo...' : 'Subir nueva imagen'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Mode URL */
              <div className="flex-1 p-6">
                <div className="max-w-xl mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1">
                      URL de la imagen
                    </label>
                    <p className="text-xs text-navy-500 mb-2">
                      Pega la URL directa de una imagen (debe terminar en .jpg, .png, .webp, etc.)
                    </p>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {value && (
                    <div>
                      <p className="text-sm text-navy-400 mb-2">Vista previa:</p>
                      <img
                        src={value}
                        alt="Preview"
                        className="w-full max-h-64 rounded-lg object-contain bg-navy-800 border border-navy-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={!value}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 disabled:text-navy-500 text-white rounded-lg transition-colors"
                  >
                    <CheckIcon className="w-5 h-5" />
                    Usar esta imagen
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
