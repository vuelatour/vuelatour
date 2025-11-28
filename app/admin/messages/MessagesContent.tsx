'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import AdminLayout from '@/components/admin/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  TrashIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service_type: string | null;
  destination: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface MessagesContentProps {
  user: User;
  messages: ContactRequest[];
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400', icon: ClockIcon },
  contacted: { label: 'Contactado', color: 'bg-blue-500/20 text-blue-400', icon: EnvelopeOpenIcon },
  completed: { label: 'Completado', color: 'bg-green-500/20 text-green-400', icon: CheckCircleIcon },
};

const serviceTypes = {
  charter: 'Vuelo Charter',
  tour: 'Tour Aéreo',
  general: 'Consulta General',
};

export default function MessagesContent({ user, messages: initialMessages }: MessagesContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('contact_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;
      setMessages(messages.map(m =>
        m.id === id ? { ...m, status: newStatus } : m
      ));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast('¿Eliminar este mensaje?', {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setLoading(true);
          try {
            const { error: deleteError } = await supabase
              .from('contact_requests')
              .delete()
              .eq('id', id);

            if (deleteError) throw deleteError;
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage?.id === id) {
              setSelectedMessage(null);
            }
            toast.success('Mensaje eliminado');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredMessages = filterStatus === 'all'
    ? messages
    : messages.filter(m => m.status === filterStatus);

  const pendingCount = messages.filter(m => m.status === 'pending').length;

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Mensajes</h1>
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-navy-400 mt-1">Solicitudes de contacto recibidas</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-brand-500 text-white'
              : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
          }`}
        >
          Todos ({messages.length})
        </button>
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = messages.filter(m => m.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === key
                  ? 'bg-brand-500 text-white'
                  : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-2">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-navy-500 bg-navy-900 rounded-xl border border-navy-800">
              No hay mensajes
            </div>
          ) : (
            filteredMessages.map((message) => {
              const status = statusConfig[message.status as keyof typeof statusConfig] || statusConfig.pending;
              const isSelected = selectedMessage?.id === message.id;

              return (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-navy-800 border-brand-500'
                      : 'bg-navy-900 border-navy-800 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{message.name}</p>
                      <p className="text-navy-500 text-sm truncate">{message.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-navy-400 text-sm mt-2 line-clamp-2">
                    {message.message || 'Sin mensaje'}
                  </p>
                  <p className="text-navy-600 text-xs mt-2">
                    {formatDate(message.created_at)}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-navy-900 rounded-xl border border-navy-800 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-navy-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white">{selectedMessage.name}</h2>
                  <p className="text-navy-400 text-sm">{selectedMessage.email}</p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden p-2 text-navy-400 hover:text-white rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2 text-navy-300">
                      <PhoneIcon className="w-4 h-4 text-navy-500" />
                      <a href={`tel:${selectedMessage.phone}`} className="hover:text-brand-400">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  {selectedMessage.service_type && (
                    <div className="flex items-center gap-2 text-navy-300">
                      <EnvelopeIcon className="w-4 h-4 text-navy-500" />
                      <span>{serviceTypes[selectedMessage.service_type as keyof typeof serviceTypes] || selectedMessage.service_type}</span>
                    </div>
                  )}
                </div>

                {selectedMessage.destination && (
                  <div className="p-3 bg-navy-800 rounded-lg">
                    <p className="text-navy-500 text-xs uppercase mb-1">Destino de interés</p>
                    <p className="text-white">{selectedMessage.destination}</p>
                  </div>
                )}

                {/* Message */}
                <div className="p-4 bg-navy-800 rounded-lg">
                  <p className="text-navy-500 text-xs uppercase mb-2">Mensaje</p>
                  <p className="text-white whitespace-pre-wrap">
                    {selectedMessage.message || 'Sin mensaje adicional'}
                  </p>
                </div>

                {/* Date */}
                <p className="text-navy-500 text-sm">
                  Recibido: {formatDate(selectedMessage.created_at)}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-navy-800">
                  <p className="text-navy-500 text-sm mr-2">Estado:</p>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(selectedMessage.id, key)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedMessage.status === key
                          ? config.color
                          : 'bg-navy-800 text-navy-400 hover:bg-navy-700'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center bg-navy-900 rounded-xl border border-navy-800">
              <div className="text-center">
                <EnvelopeIcon className="w-12 h-12 text-navy-700 mx-auto mb-3" />
                <p className="text-navy-500">Selecciona un mensaje para ver los detalles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
