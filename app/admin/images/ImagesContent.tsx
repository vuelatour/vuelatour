'use client';

import { useState, useRef, useEffect } from 'react';
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
  CloudArrowUpIcon,
  PhotoIcon,
  InformationCircleIcon,
  RectangleStackIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  StarIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface SiteImage {
  id: string;
  key: string;
  url: string;
  alt_es: string | null;
  alt_en: string | null;
  category: string | null;
  is_primary: boolean;
  file_size?: number | null; // Size in bytes
}

interface ImagesContentProps {
  user: User;
  images: SiteImage[];
  usedImageUrls: string[];
}

interface CategoryConfigItem {
  label: string;
  icon: string;
  color: string;
  description: string;
  location: string;
  hasCarousel: boolean;
  carouselInfo?: string;
  dimensions: string;
  tips: string;
  preview: {
    width: string;
    height: string;
    layout: string;
  };
}

// Configuración detallada de cada categoría con info de ubicación
const categoryConfig: Record<string, CategoryConfigItem> = {
  hero: {
    label: 'Hero / Principal',
    icon: '🏠',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Imagen principal de la página de inicio',
    location: 'Página de inicio - Sección superior',
    hasCarousel: false,
    dimensions: '1920x1080 recomendado',
    tips: 'Usa imágenes panorámicas de alta calidad. Aparece con overlay semi-transparente.',
    preview: {
      width: 'full',
      height: 'h-48',
      layout: 'single',
    },
  },
  destinations: {
    label: 'Destinos',
    icon: '🗺️',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Fotos de los destinos de vuelos privados',
    location: 'Página de inicio - Sección "Vuelos Privados"',
    hasCarousel: true,
    carouselInfo: 'Muestra tarjetas de destinos con imagen de fondo',
    dimensions: '800x600 recomendado',
    tips: 'Imágenes de playas, ciudades o zonas arqueológicas. Cada destino tiene su propia imagen.',
    preview: {
      width: 'w-48',
      height: 'h-32',
      layout: 'cards',
    },
  },
  tours: {
    label: 'Tours Aéreos',
    icon: '✈️',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Fotos de los tours aéreos panorámicos',
    location: 'Página de inicio - Sección "Tours Aéreos"',
    hasCarousel: true,
    carouselInfo: 'Tarjetas con duración y precio. Scroll horizontal en móvil.',
    dimensions: '800x600 recomendado',
    tips: 'Vistas aéreas impresionantes. Cada tour tiene su imagen destacada.',
    preview: {
      width: 'w-48',
      height: 'h-32',
      layout: 'cards',
    },
  },
  gallery: {
    label: 'Galería',
    icon: '🖼️',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    description: 'Galería de fotos del servicio y experiencias',
    location: 'Página de inicio - Sección galería (si existe)',
    hasCarousel: true,
    carouselInfo: 'Carrusel automático con lightbox al hacer clic',
    dimensions: '1200x800 recomendado',
    tips: 'Fotos de clientes, aviones, vistas panorámicas. Máximo 8-10 fotos.',
    preview: {
      width: 'w-32',
      height: 'h-24',
      layout: 'grid',
    },
  },
  about: {
    label: 'Nosotros',
    icon: '👥',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    description: 'Fotos del equipo, aviones y empresa',
    location: 'Sección "Sobre nosotros" / Footer',
    hasCarousel: false,
    dimensions: '800x600 recomendado',
    tips: 'Fotos del equipo, pilotos, aviones. Transmiten confianza y profesionalismo.',
    preview: {
      width: 'w-40',
      height: 'h-28',
      layout: 'single',
    },
  },
  fleet: {
    label: 'Flota',
    icon: '🛩️',
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    description: 'Fotos de los aviones de la flota',
    location: 'Hero cards - "Nuestra Flota"',
    hasCarousel: false,
    dimensions: '400x400 cuadrado',
    tips: 'Fotos profesionales de cada avión. Aparecen en tarjetas pequeñas.',
    preview: {
      width: 'w-20',
      height: 'h-20',
      layout: 'square',
    },
  },
  other: {
    label: 'Otros',
    icon: '📁',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    description: 'Imágenes misceláneas',
    location: 'Varios lugares del sitio',
    hasCarousel: false,
    dimensions: 'Variable',
    tips: 'Logos, iconos, imágenes decorativas.',
    preview: {
      width: 'w-32',
      height: 'h-24',
      layout: 'single',
    },
  },
};

const categories = Object.entries(categoryConfig).map(([value, config]) => ({
  value,
  ...config,
}));

const emptyImage: Omit<SiteImage, 'id'> = {
  key: '',
  url: '',
  alt_es: '',
  alt_en: '',
  category: 'other',
  is_primary: false,
  file_size: null,
};

// Helper para formatear el tamaño de archivo
const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Helper para determinar si una imagen es pesada (>150KB)
const isHeavyImage = (bytes: number | null | undefined): boolean => {
  return bytes ? bytes > 150 * 1024 : false;
};

// Helper para extraer el path del Storage de una URL de Supabase
const getStoragePathFromUrl = (url: string): string | null => {
  if (!url) return null;
  // URL format: https://xxx.supabase.co/storage/v1/object/public/images/category/filename.ext
  const match = url.match(/\/storage\/v1\/object\/public\/images\/(.+)$/);
  return match ? match[1] : null;
};

// Helper para extraer el formato de imagen de una URL
const getImageFormat = (url: string): string | null => {
  if (!url) return null;
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }
  } catch {
    // Fallback for relative URLs or invalid URLs
    const ext = url.split('.').pop()?.toLowerCase().split('?')[0];
    if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }
  }
  return null;
};

export default function ImagesContent({ user, images: initialImages, usedImageUrls }: ImagesContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const usedUrlsSet = new Set(usedImageUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<SiteImage, 'id'>>(emptyImage);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'sections'>('sections');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<SiteImage | null>(null);

  // Cerrar drawer/modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
        } else if (drawerOpen) {
          handleCancel();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [drawerOpen, previewImage]);

  const handleEdit = (image: SiteImage) => {
    setEditingId(image.id);
    setFormData({
      key: image.key,
      url: image.url,
      alt_es: image.alt_es || '',
      alt_en: image.alt_en || '',
      category: image.category || 'other',
      is_primary: image.is_primary || false,
    });
    setIsCreating(false);
    setDrawerOpen(true);
  };

  const handleSetPrimary = async (image: SiteImage) => {
    setLoading(true);
    try {
      // Primero, quitar is_primary de todas las imágenes de la misma categoría
      await supabase
        .from('site_images')
        .update({ is_primary: false })
        .eq('category', image.category);

      // Luego, marcar esta imagen como principal
      const { error: updateError } = await supabase
        .from('site_images')
        .update({ is_primary: true })
        .eq('id', image.id);

      if (updateError) throw updateError;

      // Actualizar estado local
      setImages(images.map(img => ({
        ...img,
        is_primary: img.id === image.id ? true : (img.category === image.category ? false : img.is_primary)
      })));

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al establecer imagen principal');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (category?: string) => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ ...emptyImage, category: category || 'other' });
    setDrawerOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData(emptyImage);
    setError('');
    setDrawerOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    // Store the old URL to delete after successful upload
    const oldUrl = formData.url;

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // Use the key as filename for better SEO and organization, fallback to timestamp if no key
      const baseFileName = formData.key
        ? formData.key.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-')
        : `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const fileName = `${baseFileName}.${fileExt}`;
      const filePath = `${formData.category || 'other'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Delete old image from Storage if it was a Supabase URL
      if (oldUrl) {
        const oldStoragePath = getStoragePathFromUrl(oldUrl);
        if (oldStoragePath) {
          const { error: deleteError } = await supabase.storage
            .from('images')
            .remove([oldStoragePath]);

          if (deleteError) {
            console.warn('Could not delete old image from storage:', deleteError);
            // Don't throw - the new upload was successful
          }
        }
      }

      setFormData({ ...formData, url: publicUrl });
    } catch (err: any) {
      setError(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      if (isCreating) {
        const { data, error: insertError } = await supabase
          .from('site_images')
          .insert([formData])
          .select()
          .single();

        if (insertError) throw insertError;
        setImages([...images, data]);
      } else if (editingId) {
        const { error: updateError } = await supabase
          .from('site_images')
          .update(formData)
          .eq('id', editingId);

        if (updateError) throw updateError;

        // Fetch the updated record to get fresh data including file_size
        const { data: updatedImage } = await supabase
          .from('site_images')
          .select()
          .eq('id', editingId)
          .single();

        if (updatedImage) {
          setImages(images.map(img =>
            img.id === editingId ? updatedImage : img
          ));
        } else {
          // Fallback to local update if fetch fails
          setImages(images.map(img =>
            img.id === editingId ? { ...img, ...formData } : img
          ));
        }
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
    // Find the image to get its URL for Storage deletion
    const imageToDelete = images.find(img => img.id === id);

    toast('¿Eliminar esta imagen?', {
      description: 'Esta acción no se puede deshacer. La imagen también se eliminará del almacenamiento.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setLoading(true);
          try {
            // First, delete from database
            const { error: deleteError } = await supabase
              .from('site_images')
              .delete()
              .eq('id', id);

            if (deleteError) throw deleteError;

            // Then, try to delete from Storage if it's a Supabase URL
            if (imageToDelete?.url) {
              const storagePath = getStoragePathFromUrl(imageToDelete.url);
              if (storagePath) {
                const { error: storageError } = await supabase.storage
                  .from('images')
                  .remove([storagePath]);

                if (storageError) {
                  console.warn('Could not delete from storage:', storageError);
                  // Don't throw - the DB record is already deleted
                }
              }
            }

            setImages(images.filter(img => img.id !== id));
            toast.success('Imagen eliminada completamente');
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

  const getImagesByCategory = (category: string) => {
    return images.filter(img => img.category === category);
  };

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category === selectedCategory);

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.other;
  };

  // Componente para renderizar la sección de cada categoría
  const CategorySection = ({ category }: { category: typeof categories[0] }) => {
    const categoryImages = getImagesByCategory(category.value);
    const config = getCategoryConfig(category.value);
    const heavyImages = categoryImages.filter(img => isHeavyImage(img.file_size));
    const missingAltImages = categoryImages.filter(img => !img.alt_es || !img.alt_en);
    const unusedImages = categoryImages.filter(img => !usedUrlsSet.has(img.url));

    return (
      <div className="bg-navy-900 rounded-xl border border-navy-800 overflow-hidden">
        {/* Header de categoría */}
        <div className={`p-4 border-b border-navy-800 ${config.color.replace('text-', 'bg-').replace('400', '500/5')}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-white">{category.label}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
                    {categoryImages.length} {categoryImages.length === 1 ? 'imagen' : 'imágenes'}
                  </span>
                  {heavyImages.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      ⚠️ {heavyImages.length} pesada{heavyImages.length > 1 ? 's' : ''} (&gt;150KB)
                    </span>
                  )}
                  {missingAltImages.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      📝 {missingAltImages.length} sin ALT
                    </span>
                  )}
                  {unusedImages.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                      🔗 {unusedImages.length} sin uso
                    </span>
                  )}
                  {config.hasCarousel && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <RectangleStackIcon className="w-3 h-3" />
                      Carrusel
                    </span>
                  )}
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
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-navy-400">
              <ComputerDesktopIcon className="w-4 h-4" />
              <span>{config.location}</span>
            </div>
            <div className="flex items-center gap-2 text-navy-400">
              <PhotoIcon className="w-4 h-4" />
              <span>{config.dimensions}</span>
            </div>
            {config.hasCarousel && config.carouselInfo && (
              <div className="flex items-center gap-2 text-yellow-400">
                <RectangleStackIcon className="w-4 h-4" />
                <span>{config.carouselInfo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Preview visual de cómo se verá */}
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
              <div className="relative h-20 bg-navy-700 rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {categoryImages[0] ? (
                    <img src={categoryImages[0].url} alt="" className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <PhotoIcon className="w-8 h-8 text-navy-500" />
                  )}
                </div>
                <div className="absolute inset-0 bg-navy-900/70" />
                <div className="relative p-2">
                  <div className="w-20 h-2 bg-white/20 rounded mb-1" />
                  <div className="w-32 h-3 bg-white/30 rounded" />
                </div>
              </div>
            )}

            {(category.value === 'destinations' || category.value === 'tours') && (
              <div className="flex gap-2 overflow-hidden py-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-20 h-16 bg-navy-700 rounded overflow-hidden">
                    {categoryImages[i] ? (
                      <img src={categoryImages[i].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-navy-600" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex-shrink-0 w-4 h-16 bg-navy-800/80" />
              </div>
            )}

            {category.value === 'gallery' && (
              <div className="grid grid-cols-6 gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-navy-700 rounded overflow-hidden">
                    {categoryImages[i] ? (
                      <img src={categoryImages[i].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-4 h-4 text-navy-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {category.value === 'fleet' && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-navy-700 rounded overflow-hidden">
                  {categoryImages[0] ? (
                    <img src={categoryImages[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-5 h-5 text-navy-600" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="w-16 h-2 bg-navy-600 rounded mb-1" />
                  <div className="w-12 h-2 bg-navy-700 rounded" />
                </div>
              </div>
            )}

            {(category.value === 'about' || category.value === 'other') && (
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 bg-navy-700 rounded overflow-hidden">
                  {categoryImages[0] ? (
                    <img src={categoryImages[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-5 h-5 text-navy-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="w-full h-2 bg-navy-700 rounded mb-1" />
                  <div className="w-3/4 h-2 bg-navy-700 rounded" />
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-navy-500 mt-2 italic">
            💡 {config.tips}
          </p>
        </div>

        {/* Grid de imágenes de esta categoría */}
        <div className="p-4">
          {categoryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categoryImages.map((image) => (
                <div
                  key={image.id}
                  className={`group relative bg-navy-800 rounded-lg overflow-hidden border-2 transition-colors ${
                    image.is_primary
                      ? 'border-yellow-500 ring-2 ring-yellow-500/30'
                      : 'border-navy-700 hover:border-brand-500/50'
                  }`}
                >
                  <div className="aspect-video">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.alt_es || image.key}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy-800">
                        <PhotoIcon className="w-8 h-8 text-navy-600" />
                      </div>
                    )}
                  </div>

                  {/* Badge de imagen principal */}
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-md flex items-center gap-1">
                      <StarIconSolid className="w-3 h-3" />
                      Principal
                    </div>
                  )}

                  {/* Badge de tamaño de archivo */}
                  <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-md flex items-center gap-1 ${
                    isHeavyImage(image.file_size)
                      ? 'bg-red-500/90 text-white border border-red-400'
                      : 'bg-black/70 text-white'
                  }`}>
                    {formatFileSize(image.file_size)}
                    {isHeavyImage(image.file_size) && ' ⚠️'}
                  </div>

                  {/* Badge de formato de imagen */}
                  {getImageFormat(image.url) && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-navy-900/80 text-white text-[10px] font-bold rounded uppercase">
                      {getImageFormat(image.url)}
                    </div>
                  )}

                  {/* Badge de imagen sin uso */}
                  {!usedUrlsSet.has(image.url) && (
                    <div className="absolute bottom-14 left-2 px-2 py-1 bg-gray-500/90 text-white text-[10px] font-bold rounded-md flex items-center gap-1 border border-gray-400">
                      🔗 Sin uso
                    </div>
                  )}

                  {/* Badge de alt text faltante */}
                  {(!image.alt_es || !image.alt_en) && (
                    <div className="absolute bottom-8 left-2 px-2 py-1 bg-orange-500/90 text-white text-[10px] font-bold rounded-md flex items-center gap-1 border border-orange-400">
                      📝 {!image.alt_es && !image.alt_en ? 'Sin ALT' : !image.alt_es ? 'Sin ALT ES' : 'Sin ALT EN'}
                    </div>
                  )}

                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewImage(image)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Ver en grande"
                    >
                      <MagnifyingGlassPlusIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleSetPrimary(image)}
                      disabled={image.is_primary || loading}
                      className={`p-2 rounded-lg transition-colors ${
                        image.is_primary
                          ? 'bg-yellow-500/50 cursor-not-allowed'
                          : 'bg-white/20 hover:bg-yellow-500/70'
                      }`}
                      title={image.is_primary ? 'Ya es la imagen principal' : 'Establecer como principal'}
                    >
                      {image.is_primary ? (
                        <StarIconSolid className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(image)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 bg-white/20 hover:bg-red-500/70 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70">
                    <p className="text-xs text-white font-medium truncate">{image.key}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-navy-500">
              <PhotoIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay imágenes en esta categoría</p>
              <button
                onClick={() => handleCreate(category.value)}
                className="mt-2 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Agregar primera imagen
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalSize = images.reduce((acc, img) => acc + (img.file_size || 0), 0);
  const heavyImagesCount = images.filter(img => isHeavyImage(img.file_size)).length;
  const missingAltCount = images.filter(img => !img.alt_es || !img.alt_en).length;
  const unusedImagesCount = images.filter(img => !usedUrlsSet.has(img.url)).length;

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Imágenes del Sitio</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <p className="text-navy-400">
              Total: {images.length} imágenes
            </p>
            <span className="text-navy-600">•</span>
            <p className="text-navy-400">
              Peso total: {formatFileSize(totalSize)}
            </p>
            {heavyImagesCount > 0 && (
              <>
                <span className="text-navy-600">•</span>
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  ⚠️ {heavyImagesCount} pesada{heavyImagesCount > 1 ? 's' : ''} (&gt;150KB)
                </span>
              </>
            )}
            {missingAltCount > 0 && (
              <>
                <span className="text-navy-600">•</span>
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  📝 {missingAltCount} sin ALT
                </span>
              </>
            )}
            {unusedImagesCount > 0 && (
              <>
                <span className="text-navy-600">•</span>
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                  🔗 {unusedImagesCount} sin uso
                </span>
              </>
            )}
          </div>
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
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-brand-500 text-white'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              Todas
            </button>
          </div>
          <button
            onClick={() => handleCreate()}
            disabled={isCreating || editingId !== null}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-navy-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Imagen
          </button>
        </div>
      </div>

      {error && !drawerOpen && (
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

      {/* Vista grid tradicional */}
      {viewMode === 'grid' && (
        <>
          {/* Category Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
              }`}
            >
              Todas ({images.length})
            </button>
            {categories.map(cat => {
              const count = getImagesByCategory(cat.value).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.value
                      ? 'bg-brand-500 text-white'
                      : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image) => {
              const config = getCategoryConfig(image.category || 'other');
              return (
                <div
                  key={image.id}
                  className="bg-navy-900 rounded-xl border border-navy-800 overflow-hidden group"
                >
                  <div className="aspect-video bg-navy-800 relative">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.alt_es || image.key}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-navy-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(image)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Category badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-md border ${config.color}`}>
                      {config.icon} {config.label}
                    </div>

                    {/* Format badge */}
                    {getImageFormat(image.url) && (
                      <div className="absolute top-10 left-2 px-1.5 py-0.5 bg-navy-900/80 text-white text-[10px] font-bold rounded uppercase">
                        {getImageFormat(image.url)}
                      </div>
                    )}

                    {/* File size badge */}
                    <div className={`absolute bottom-2 right-2 px-2 py-1 text-xs font-bold rounded-md ${
                      isHeavyImage(image.file_size)
                        ? 'bg-red-500/90 text-white border border-red-400'
                        : 'bg-black/70 text-white'
                    }`}>
                      {formatFileSize(image.file_size)}
                      {isHeavyImage(image.file_size) && ' ⚠️'}
                    </div>

                    {/* Unused badge */}
                    {!usedUrlsSet.has(image.url) && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-gray-500/90 text-white text-[10px] font-bold rounded-md border border-gray-400">
                        🔗 Sin uso
                      </div>
                    )}

                    {/* Carousel indicator */}
                    {config.hasCarousel && (
                      <div className="absolute top-2 right-2 p-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
                        <RectangleStackIcon className="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate">{image.key}</p>
                    <p className="text-navy-500 text-xs mt-1 truncate">
                      📍 {config.location}
                    </p>
                  </div>
                </div>
              );
            })}
            {filteredImages.length === 0 && (
              <div className="col-span-full p-8 text-center text-navy-500 bg-navy-900 rounded-xl border border-navy-800">
                No hay imágenes en esta categoría
              </div>
            )}
          </div>
        </>
      )}

      {/* Drawer lateral */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={handleCancel}
          />

          {/* Panel lateral */}
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-navy-900 border-l border-navy-800 z-50 overflow-y-auto shadow-2xl animate-slide-in-right">
            {/* Header */}
            <div className="sticky top-0 bg-navy-900 border-b border-navy-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">
                {isCreating ? 'Nueva Imagen' : 'Editar Imagen'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del formulario */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Key */}
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">
                  Key (identificador único)
                </label>
                <p className="text-xs text-navy-500 mb-2">
                  Nombre único para identificar esta imagen en el código (sin espacios, usa guiones bajos)
                </p>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="ej: hero_background, destination_cozumel, tour_panoramico"
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Categoría</label>
                <p className="text-xs text-navy-500 mb-2">
                  Sección del sitio donde se usará esta imagen
                </p>
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
                {formData.category && (
                  <p className="text-xs text-navy-500 mt-2">
                    📍 {getCategoryConfig(formData.category).location}
                  </p>
                )}
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">Imagen</label>
                <p className="text-xs text-navy-500 mb-2">
                  Puedes pegar una URL directa o subir un archivo desde tu computadora
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="ej: https://example.com/imagen.jpg"
                    className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
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
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-lg transition-colors w-full justify-center"
                    >
                      <CloudArrowUpIcon className="w-5 h-5" />
                      {uploading ? 'Subiendo...' : 'Subir imagen'}
                    </button>
                  </div>
                  {formData.url && (
                    <div className="mt-3">
                      <img
                        src={formData.url}
                        alt="Preview"
                        className="w-full h-48 rounded-lg object-cover border border-navy-700"
                      />
                      {formData.category && (
                        <p className="text-xs text-navy-500 mt-2">
                          Dimensiones recomendadas: {getCategoryConfig(formData.category).dimensions}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Alt text Español */}
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">
                  <span className="mr-1">🇪🇸</span> Alt text (Español)
                </label>
                <p className="text-xs text-navy-500 mb-2">
                  Descripción de la imagen para accesibilidad y SEO (lectores de pantalla)
                </p>
                <input
                  type="text"
                  value={formData.alt_es || ''}
                  onChange={(e) => setFormData({ ...formData, alt_es: e.target.value })}
                  placeholder="ej: Vista aérea de la laguna Nichupté al atardecer"
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Alt text Inglés */}
              <div>
                <label className="block text-sm font-medium text-navy-300 mb-1">
                  <span className="mr-1">🇺🇸</span> Alt text (Inglés)
                </label>
                <p className="text-xs text-navy-500 mb-2">
                  Image description for accessibility and SEO (screen readers)
                </p>
                <input
                  type="text"
                  value={formData.alt_en || ''}
                  onChange={(e) => setFormData({ ...formData, alt_en: e.target.value })}
                  placeholder="ej: Aerial view of Nichupté lagoon at sunset"
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Footer con botones */}
            <div className="sticky bottom-0 bg-navy-900 border-t border-navy-800 px-6 py-4 flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !formData.key || !formData.url}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de vista previa en grande */}
      {previewImage && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/90 z-50"
            onClick={() => setPreviewImage(null)}
          />

          {/* Modal */}
          <div className="fixed inset-4 md:inset-8 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between bg-navy-900/80 backdrop-blur-sm px-4 py-3 rounded-t-xl border-b border-navy-800">
              <div className="flex items-center gap-3">
                <h3 className="text-white font-medium">{previewImage.key}</h3>
                {previewImage.is_primary && (
                  <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-md flex items-center gap-1">
                    <StarIconSolid className="w-3 h-3" />
                    Principal
                  </span>
                )}
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getCategoryConfig(previewImage.category || 'other').color}`}>
                  {getCategoryConfig(previewImage.category || 'other').icon} {getCategoryConfig(previewImage.category || 'other').label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!previewImage.is_primary && (
                  <button
                    onClick={() => {
                      handleSetPrimary(previewImage);
                      setPreviewImage(null);
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg transition-colors text-sm"
                  >
                    <StarIcon className="w-4 h-4" />
                    Establecer como principal
                  </button>
                )}
                <button
                  onClick={() => {
                    handleEdit(previewImage);
                    setPreviewImage(null);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 border border-brand-500/30 rounded-lg transition-colors text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 text-navy-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Imagen */}
            <div className="flex-1 flex items-center justify-center bg-navy-950/50 backdrop-blur-sm overflow-hidden rounded-b-xl">
              <img
                src={previewImage.url}
                alt={previewImage.alt_es || previewImage.key}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Info inferior */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-navy-800">
              <div className="flex items-center gap-4 text-sm">
                {previewImage.alt_es && (
                  <div className="flex items-center gap-2 text-navy-400">
                    <span>🇪🇸</span>
                    <span className="max-w-xs truncate">{previewImage.alt_es}</span>
                  </div>
                )}
                {previewImage.alt_en && (
                  <div className="flex items-center gap-2 text-navy-400">
                    <span>🇺🇸</span>
                    <span className="max-w-xs truncate">{previewImage.alt_en}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
