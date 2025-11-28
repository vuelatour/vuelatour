'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import AdminLayout from '@/components/admin/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  KeyIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

interface SettingsContentProps {
  user: User;
  settings: SiteSetting[];
}

export default function SettingsContent({ user, settings: initialSettings }: SettingsContentProps) {
  const router = useRouter();
  const supabase = createClient();

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Currency settings state
  const [siteCurrency, setSiteCurrency] = useState(
    initialSettings.find(s => s.key === 'site_currency')?.value || 'USD'
  );
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [currencyError, setCurrencyError] = useState('');
  const [currencySuccess, setCurrencySuccess] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess('Contraseña actualizada correctamente');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Error al actualizar contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCurrencySettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrencyError('');
    setCurrencySuccess('');
    setCurrencyLoading(true);

    try {
      // Actualizar moneda del sitio
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'site_currency',
          value: siteCurrency,
          description: 'Moneda en la que se muestran los precios del sitio'
        }, { onConflict: 'key' });

      if (error) throw error;

      setCurrencySuccess('Moneda del sitio actualizada');
      router.refresh();
    } catch (err: any) {
      setCurrencyError(err.message || 'Error al guardar configuración');
    } finally {
      setCurrencyLoading(false);
    }
  };

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Configuración</h1>
        <p className="text-navy-400 mt-1">Ajustes del sitio y preferencias de cuenta</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Currency Settings */}
        <div className="bg-navy-900 rounded-xl border border-navy-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-medium text-white">Moneda del sitio</h2>
          </div>

          <p className="text-navy-400 text-sm mb-4">
            Selecciona en qué moneda se mostrarán los precios en el sitio web.
          </p>

          {currencyError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {currencyError}
            </div>
          )}

          {currencySuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
              <CheckIcon className="w-4 h-4" />
              {currencySuccess}
            </div>
          )}

          <form onSubmit={handleCurrencySettingsSave} className="space-y-4">
            <div className="flex gap-4">
              <label
                className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  siteCurrency === 'USD'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-navy-700 hover:border-navy-600'
                }`}
              >
                <input
                  type="radio"
                  name="currency"
                  value="USD"
                  checked={siteCurrency === 'USD'}
                  onChange={(e) => setSiteCurrency(e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">$</span>
                  <p className="text-white font-medium mt-1">USD</p>
                  <p className="text-navy-400 text-xs">Dólar estadounidense</p>
                </div>
              </label>

              <label
                className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  siteCurrency === 'MXN'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-navy-700 hover:border-navy-600'
                }`}
              >
                <input
                  type="radio"
                  name="currency"
                  value="MXN"
                  checked={siteCurrency === 'MXN'}
                  onChange={(e) => setSiteCurrency(e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">$</span>
                  <p className="text-white font-medium mt-1">MXN</p>
                  <p className="text-navy-400 text-xs">Peso mexicano</p>
                </div>
              </label>
            </div>

            <p className="text-xs text-navy-500">
              Los precios que ingreses en Tours y Destinos se mostrarán en esta moneda.
            </p>

            <button
              type="submit"
              disabled={currencyLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors"
            >
              {currencyLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-navy-900 rounded-xl border border-navy-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cog6ToothIcon className="w-5 h-5 text-navy-400" />
            <h2 className="text-lg font-medium text-white">Información de la cuenta</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-400 mb-1">Email</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-400 mb-1">ID de usuario</label>
              <p className="text-navy-500 text-sm font-mono">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-400 mb-1">Último inicio de sesión</label>
              <p className="text-navy-300">
                {user.last_sign_in_at
                  ? new Intl.DateTimeFormat('es-MX', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    }).format(new Date(user.last_sign_in_at))
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-navy-900 rounded-xl border border-navy-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <KeyIcon className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-medium text-white">Cambiar contraseña</h2>
          </div>

          {passwordError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
              <CheckIcon className="w-4 h-4" />
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">
                Nueva contraseña
              </label>
              <p className="text-xs text-navy-500 mb-2">
                Mínimo 6 caracteres. Usa letras, números y símbolos para mayor seguridad.
              </p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="ej: MiContraseña123!"
                required
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">
                Confirmar nueva contraseña
              </label>
              <p className="text-xs text-navy-500 mb-2">
                Escribe la misma contraseña para confirmar que es correcta.
              </p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-lg transition-colors"
            >
              {passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-navy-900 rounded-xl border border-red-500/30 p-6">
          <h2 className="text-lg font-medium text-red-400 mb-4">Zona de peligro</h2>
          <p className="text-navy-400 text-sm mb-4">
            Estas acciones son irreversibles. Procede con precaución.
          </p>
          <button
            onClick={() => {
              toast('¿Cerrar sesión?', {
                description: 'Se cerrará tu sesión en todos los dispositivos',
                action: {
                  label: 'Cerrar sesión',
                  onClick: async () => {
                    await supabase.auth.signOut();
                    router.push('/admin/login');
                    router.refresh();
                  },
                },
                cancel: {
                  label: 'Cancelar',
                  onClick: () => {},
                },
              });
            }}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
          >
            Cerrar sesión en todos los dispositivos
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
