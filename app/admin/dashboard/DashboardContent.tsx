'use client';

import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PhotoIcon,
  DocumentTextIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  ServerIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// System version info
const SYSTEM_INFO = {
  version: '1.0.0',
  releaseDate: '5 de diciembre de 2025',
  releaseDateISO: '2025-12-05',
  codeName: 'Vuelatour Admin',
  framework: 'Next.js 15.5',
  database: 'Supabase',
};

interface StorageStats {
  totalSizeBytes: number;
  totalSizeMB: number;
  totalSizeGB: number;
  fileCount: number;
  limitGB: number;
  usagePercentage: number;
  buckets: {
    name: string;
    sizeBytes: number;
    sizeMB: number;
    fileCount: number;
  }[];
}

interface DatabaseStats {
  totalSizeBytes: number;
  totalSizeMB: number;
  totalSizeGB: number;
  limitMB: number;
  limitGB: number;
  usagePercentage: number;
  tables: {
    name: string;
    sizeBytes: number;
    sizeMB: number;
  }[];
}

interface DashboardStats {
  images: number;
  destinations: number;
  tours: number;
  messages: number;
  pendingMessages: number;
  storage: StorageStats;
  database: DatabaseStats;
}

interface DashboardContentProps {
  user: User;
  stats: DashboardStats;
}

export default function DashboardContent({ user, stats }: DashboardContentProps) {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Destinos',
      description: 'Gestiona vuelos privados',
      icon: MapPinIcon,
      color: 'text-blue-400',
      href: '/admin/destinations',
    },
    {
      title: 'Tours Aéreos',
      description: 'Administra tours',
      icon: PaperAirplaneIcon,
      color: 'text-green-400',
      href: '/admin/tours',
    },
    {
      title: 'Imágenes',
      description: 'Gestiona multimedia',
      icon: PhotoIcon,
      color: 'text-purple-400',
      href: '/admin/images',
    },
    {
      title: 'Contenido',
      description: 'Edita textos',
      icon: DocumentTextIcon,
      color: 'text-yellow-400',
      href: '/admin/content',
    },
    {
      title: 'Mensajes',
      description: 'Ver solicitudes',
      icon: EnvelopeIcon,
      color: 'text-brand-400',
      href: '/admin/messages',
      badge: stats.pendingMessages > 0 ? stats.pendingMessages : undefined,
    },
  ];

  // Determine storage status color
  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStorageTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <AdminLayout userEmail={user.email || ''}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-navy-400 mt-1">Bienvenido al panel de administración</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">{stats.images}</p>
          <p className="text-sm text-navy-400">Imágenes</p>
        </div>
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">{stats.destinations}</p>
          <p className="text-sm text-navy-400">Destinos</p>
        </div>
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">{stats.tours}</p>
          <p className="text-sm text-navy-400">Tours</p>
        </div>
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">{stats.messages}</p>
          <p className="text-sm text-navy-400">Mensajes</p>
        </div>
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">2</p>
          <p className="text-sm text-navy-400">Idiomas</p>
        </div>
      </div>

      {/* Storage & Database Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Storage Card */}
        <div className="bg-navy-900 rounded-xl border border-navy-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ServerIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg font-medium text-white">Storage</h2>
            </div>
            <span className={`text-sm font-medium ${getStorageTextColor(stats.storage.usagePercentage)}`}>
              {stats.storage.usagePercentage}% usado
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStorageColor(stats.storage.usagePercentage)} transition-all duration-500`}
                style={{ width: `${Math.min(stats.storage.usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Storage Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-400">Usado:</span>
              <span className="text-white font-medium">
                {stats.storage.totalSizeMB < 1
                  ? `${Math.round(stats.storage.totalSizeBytes / 1024)} KB`
                  : stats.storage.totalSizeMB < 1024
                  ? `${stats.storage.totalSizeMB} MB`
                  : `${stats.storage.totalSizeGB} GB`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Límite:</span>
              <span className="text-white font-medium">{stats.storage.limitGB} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Archivos:</span>
              <span className="text-white font-medium">{stats.storage.fileCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Disponible:</span>
              <span className="text-green-400 font-medium">
                {(stats.storage.limitGB * 1024 - stats.storage.totalSizeMB).toFixed(1)} MB
              </span>
            </div>
          </div>

          {/* Warning if storage is high */}
          {stats.storage.usagePercentage >= 70 && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              stats.storage.usagePercentage >= 90
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-yellow-500/10 border border-yellow-500/30'
            }`}>
              <ExclamationTriangleIcon className={`w-5 h-5 flex-shrink-0 ${
                stats.storage.usagePercentage >= 90 ? 'text-red-400' : 'text-yellow-400'
              }`} />
              <span className={`text-xs ${
                stats.storage.usagePercentage >= 90 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {stats.storage.usagePercentage >= 90
                  ? '¡Casi lleno! Elimina archivos o actualiza el plan.'
                  : 'Alcanzando el límite. Monitorea el uso.'}
              </span>
            </div>
          )}

          {/* Buckets breakdown */}
          {stats.storage.buckets.length > 0 && (
            <div className="mt-4 pt-4 border-t border-navy-800">
              <p className="text-xs text-navy-500 mb-2">Por bucket:</p>
              <div className="space-y-1">
                {stats.storage.buckets.map((bucket) => (
                  <div
                    key={bucket.name}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-navy-400">{bucket.name}</span>
                    <span className="text-white">
                      {bucket.sizeMB < 1
                        ? `${Math.round(bucket.sizeBytes / 1024)} KB`
                        : `${bucket.sizeMB} MB`}
                      <span className="text-navy-500 ml-1">({bucket.fileCount})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Database Card */}
        <div className="bg-navy-900 rounded-xl border border-navy-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CircleStackIcon className="w-6 h-6 text-brand-400" />
              <h2 className="text-lg font-medium text-white">Database</h2>
            </div>
            <span className={`text-sm font-medium ${getStorageTextColor(stats.database.usagePercentage)}`}>
              {stats.database.usagePercentage}% usado
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStorageColor(stats.database.usagePercentage)} transition-all duration-500`}
                style={{ width: `${Math.min(stats.database.usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Database Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-400">Usado:</span>
              <span className="text-white font-medium">
                {stats.database.totalSizeMB < 1
                  ? `${Math.round(stats.database.totalSizeBytes / 1024)} KB`
                  : `${stats.database.totalSizeMB} MB`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Límite:</span>
              <span className="text-white font-medium">{stats.database.limitMB} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Disponible:</span>
              <span className="text-green-400 font-medium">
                {(stats.database.limitMB - stats.database.totalSizeMB).toFixed(1)} MB
              </span>
            </div>
          </div>

          {/* Warning if database is high */}
          {stats.database.usagePercentage >= 70 && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              stats.database.usagePercentage >= 90
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-yellow-500/10 border border-yellow-500/30'
            }`}>
              <ExclamationTriangleIcon className={`w-5 h-5 flex-shrink-0 ${
                stats.database.usagePercentage >= 90 ? 'text-red-400' : 'text-yellow-400'
              }`} />
              <span className={`text-xs ${
                stats.database.usagePercentage >= 90 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {stats.database.usagePercentage >= 90
                  ? '¡Base de datos casi llena! Considera actualizar el plan.'
                  : 'Base de datos alcanzando el límite.'}
              </span>
            </div>
          )}

          {/* Tables breakdown */}
          {stats.database.tables.length > 0 && (
            <div className="mt-4 pt-4 border-t border-navy-800">
              <p className="text-xs text-navy-500 mb-2">Tablas principales:</p>
              <div className="space-y-1">
                {stats.database.tables.slice(0, 5).map((table) => (
                  <div
                    key={table.name}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-navy-400">{table.name}</span>
                    <span className="text-white">
                      {table.sizeMB < 1
                        ? `${Math.round(table.sizeBytes / 1024)} KB`
                        : `${table.sizeMB} MB`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="relative p-4 bg-navy-900 rounded-xl border border-navy-800 hover:border-brand-500/50 transition-all text-left group"
            >
              {item.badge && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
              <h3 className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-navy-500 mt-1">{item.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Plan Info & System Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Info */}
        <div className="bg-navy-900 rounded-xl border border-navy-800 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Plan Supabase</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-navy-800 rounded-lg">
              <p className="text-xs text-navy-400 mb-1">Plan actual</p>
              <p className="text-white font-semibold">Free</p>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg">
              <p className="text-xs text-navy-400 mb-1">Storage</p>
              <p className="text-white font-semibold">{stats.storage.limitGB} GB</p>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg">
              <p className="text-xs text-navy-400 mb-1">Database</p>
              <p className="text-white font-semibold">{stats.database.limitMB} MB</p>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg">
              <p className="text-xs text-navy-400 mb-1">Uso total</p>
              <p className={`font-semibold ${
                Math.max(stats.storage.usagePercentage, stats.database.usagePercentage) >= 70
                  ? Math.max(stats.storage.usagePercentage, stats.database.usagePercentage) >= 90
                    ? 'text-red-400'
                    : 'text-yellow-400'
                  : 'text-green-400'
              }`}>
                {Math.max(stats.storage.usagePercentage, stats.database.usagePercentage).toFixed(1)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-navy-500 mt-4">
            * Plan Pro: 8GB storage + 8GB database por $25/mes
          </p>
        </div>

        {/* System Info */}
        <div className="bg-navy-900 rounded-xl border border-navy-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <InformationCircleIcon className="w-6 h-6 text-brand-400" />
            <h2 className="text-lg font-medium text-white">Información del Sistema</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-navy-800 rounded-lg">
              <p className="text-xs text-navy-400 mb-1">Versión</p>
              <p className="text-white font-semibold">v{SYSTEM_INFO.version}</p>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg">
              <p className="text-xs text-navy-400 mb-1">Fecha de lanzamiento</p>
              <p className="text-white font-semibold">{SYSTEM_INFO.releaseDate}</p>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg">
              <p className="text-xs text-navy-400 mb-1">Framework</p>
              <p className="text-white font-semibold">{SYSTEM_INFO.framework}</p>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg">
              <p className="text-xs text-navy-400 mb-1">Base de datos</p>
              <p className="text-white font-semibold">{SYSTEM_INFO.database}</p>
            </div>
          </div>
          <p className="text-xs text-navy-500 mt-4">
            {SYSTEM_INFO.codeName} - Panel de administración
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
