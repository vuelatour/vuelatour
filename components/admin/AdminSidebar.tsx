'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  HomeIcon,
  PhotoIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  InboxIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

// System version info
const SYSTEM_VERSION = '1.0.0';
const RELEASE_DATE = '05/12/2025';

interface AdminSidebarProps {
  userEmail: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: HomeIcon,
    href: '/admin/dashboard',
  },
  {
    title: 'Destinos',
    icon: MapPinIcon,
    href: '/admin/destinations',
  },
  {
    title: 'Tours Aéreos',
    icon: PaperAirplaneIcon,
    href: '/admin/tours',
  },
  {
    title: 'Servicios',
    icon: WrenchScrewdriverIcon,
    href: '/admin/services',
  },
  {
    title: 'Imágenes',
    icon: PhotoIcon,
    href: '/admin/images',
  },
  {
    title: 'Contenido',
    icon: DocumentTextIcon,
    href: '/admin/content',
  },
  {
    title: 'Contacto',
    icon: PhoneIcon,
    href: '/admin/contact',
  },
  {
    title: 'Legal',
    icon: ShieldCheckIcon,
    href: '/admin/legal',
  },
  {
    title: 'Mensajes',
    icon: InboxIcon,
    href: '/admin/messages',
  },
  {
    title: 'Configuración',
    icon: Cog6ToothIcon,
    href: '/admin/settings',
  },
];

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-navy-800">
        <Link href="/admin/dashboard" className="block">
          <Image
            src="/images/logo/logo-vuelatour-dark.webp"
            alt="Vuelatour"
            width={130}
            height={35}
            className="h-8 w-auto"
          />
          <p className="text-xs italic mt-1">
            <span className="text-navy-400">flying is </span>
            <span className="text-brand-500">wonderful!</span>
          </p>
          <p className="text-xs text-navy-500 mt-2">Panel de Administración</p>
        </Link>
        <div className="mt-3 pt-3 border-t border-navy-800/50">
          <p className="text-[10px] text-navy-600">
            v{SYSTEM_VERSION} • {RELEASE_DATE}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-navy-800">
        <div className="px-4 py-2 mb-2">
          <p className="text-xs text-navy-500">Sesión iniciada como</p>
          <p className="text-sm text-navy-300 truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-all"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy-900 border-b border-navy-800">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/admin/dashboard">
            <Image
              src="/images/logo/logo-vuelatour-dark.webp"
              alt="Vuelatour"
              width={120}
              height={32}
              className="h-7 w-auto"
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-navy-300 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-16 left-0 bottom-0 z-30 w-[85vw] max-w-64 bg-navy-900 border-r border-navy-800 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-navy-900 border-r border-navy-800">
        <SidebarContent />
      </aside>
    </>
  );
}
