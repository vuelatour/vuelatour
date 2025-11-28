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
} from '@heroicons/react/24/outline';

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
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
    },
  ];

  return (
    <AdminLayout userEmail={user.email || ''}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-navy-400 mt-1">Bienvenido al panel de administración</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">0</p>
          <p className="text-sm text-navy-400">Imágenes</p>
        </div>
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">2</p>
          <p className="text-sm text-navy-400">Idiomas</p>
        </div>
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">3</p>
          <p className="text-sm text-navy-400">Destinos</p>
        </div>
        <div className="p-4 bg-navy-900 rounded-xl border border-navy-800">
          <p className="text-2xl font-semibold text-white">3</p>
          <p className="text-sm text-navy-400">Tours</p>
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
              className="p-4 bg-navy-900 rounded-xl border border-navy-800 hover:border-brand-500/50 transition-all text-left group"
            >
              <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
              <h3 className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-navy-500 mt-1">{item.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-navy-900 rounded-xl border border-navy-800 p-6">
        <h2 className="text-lg font-medium text-white mb-4">Actividad reciente</h2>
        <div className="text-center py-8">
          <p className="text-navy-500 text-sm">No hay actividad reciente</p>
        </div>
      </div>
    </AdminLayout>
  );
}
