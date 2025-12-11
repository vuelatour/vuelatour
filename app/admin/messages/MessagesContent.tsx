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
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  PencilIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface TourData {
  name_es: string;
  name_en: string;
  slug: string;
}

interface DestinationData {
  name_es: string;
  name_en: string;
  slug: string;
}

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
  // New quote fields
  travel_date: string | null;
  departure_time: string | null;
  return_date: string | null;
  return_time: string | null;
  departure_location: string | null;
  departure_location_other: string | null;
  destination_other: string | null;
  number_of_passengers: number | null;
  tour_id: string | null;
  destination_id: string | null;
  aircraft_selected: string | null;
  // Joined data
  air_tours: TourData | null;
  destinations: DestinationData | null;
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
  charter: 'Vuelo Privado',
  tour: 'Tour Aéreo',
  general: 'Consulta General',
};

export default function MessagesContent({ user, messages: initialMessages }: MessagesContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Edit mode state
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [editTravelDate, setEditTravelDate] = useState('');
  const [editDepartureTime, setEditDepartureTime] = useState('');
  const [editReturnDate, setEditReturnDate] = useState('');
  const [editReturnTime, setEditReturnTime] = useState('');
  const [savingDates, setSavingDates] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('contact_requests')
        .select(`
          *,
          air_tours:tour_id(name_es, name_en, slug),
          destinations:destination_id(name_es, name_en, slug)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setMessages(data || []);
      toast.success('Mensajes actualizados');
    } catch (err) {
      toast.error('Error al actualizar mensajes');
    } finally {
      setRefreshing(false);
    }
  };

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

  // Format travel/return dates without timezone conversion issues
  const formatTravelDate = (dateString: string | null) => {
    if (!dateString) return null;
    // Extract just the date part (YYYY-MM-DD) to avoid timezone shifts
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Extract date part from ISO string for input value
  const getDateInputValue = (dateString: string | null) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  // Start editing dates
  const handleStartEditDates = () => {
    if (!selectedMessage) return;
    setEditTravelDate(getDateInputValue(selectedMessage.travel_date));
    setEditDepartureTime(selectedMessage.departure_time || '');
    setEditReturnDate(getDateInputValue(selectedMessage.return_date));
    setEditReturnTime(selectedMessage.return_time || '');
    setIsEditingDates(true);
  };

  // Cancel editing
  const handleCancelEditDates = () => {
    setIsEditingDates(false);
    setEditTravelDate('');
    setEditDepartureTime('');
    setEditReturnDate('');
    setEditReturnTime('');
  };

  // Save edited dates
  const handleSaveDates = async () => {
    if (!selectedMessage) return;
    setSavingDates(true);

    try {
      // Format dates with timezone offset to prevent shift
      const formatDateForDB = (dateStr: string | null) => {
        if (!dateStr) return null;
        return `${dateStr}T12:00:00+00:00`;
      };

      const updateData = {
        travel_date: formatDateForDB(editTravelDate || null),
        departure_time: editDepartureTime || null,
        return_date: formatDateForDB(editReturnDate || null),
        return_time: editReturnTime || null,
      };

      const { error: updateError } = await supabase
        .from('contact_requests')
        .update(updateData)
        .eq('id', selectedMessage.id);

      if (updateError) throw updateError;

      // Update local state
      const updatedMessage = {
        ...selectedMessage,
        travel_date: updateData.travel_date,
        departure_time: updateData.departure_time,
        return_date: updateData.return_date,
        return_time: updateData.return_time,
      };

      setMessages(messages.map(m =>
        m.id === selectedMessage.id ? updatedMessage : m
      ));
      setSelectedMessage(updatedMessage);
      setIsEditingDates(false);
      toast.success('Fechas y horarios actualizados');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar';
      toast.error(errorMessage);
    } finally {
      setSavingDates(false);
    }
  };

  const filteredMessages = filterStatus === 'all'
    ? messages
    : messages.filter(m => m.status === filterStatus);

  const pendingCount = messages.filter(m => m.status === 'pending').length;

  return (
    <AdminLayout userEmail={user.email || ''}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">Mensajes</h1>
            {pendingCount > 0 && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
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
                {/* Contact Info Section */}
                <div className="p-4 bg-navy-800 rounded-lg">
                  <p className="text-navy-400 text-xs font-semibold uppercase mb-3">Información de Contacto</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-navy-300">
                      <EnvelopeIcon className="w-4 h-4 text-navy-500" />
                      <a href={`mailto:${selectedMessage.email}`} className="hover:text-brand-400">
                        {selectedMessage.email}
                      </a>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center gap-2 text-navy-300">
                        <PhoneIcon className="w-4 h-4 text-navy-500" />
                        <a href={`tel:${selectedMessage.phone}`} className="hover:text-brand-400">
                          {selectedMessage.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Type */}
                {selectedMessage.service_type && (
                  <div className="p-4 bg-navy-800 rounded-lg">
                    <p className="text-navy-400 text-xs font-semibold uppercase mb-2">Tipo de Servicio</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PaperAirplaneIcon className="w-5 h-5 text-brand-400" />
                        <span className="text-white font-medium">
                          {serviceTypes[selectedMessage.service_type as keyof typeof serviceTypes] || selectedMessage.service_type}
                        </span>
                      </div>
                      {/* Show Tour Name */}
                      {selectedMessage.service_type === 'tour' && selectedMessage.air_tours && (
                        <div className="pl-7">
                          <p className="text-navy-500 text-xs mb-1">Tour seleccionado</p>
                          <p className="text-brand-400 font-medium">{selectedMessage.air_tours.name_es}</p>
                        </div>
                      )}
                      {/* Show Destination Name */}
                      {selectedMessage.service_type === 'charter' && selectedMessage.destinations && (
                        <div className="pl-7">
                          <p className="text-navy-500 text-xs mb-1">Destino seleccionado</p>
                          <p className="text-brand-400 font-medium">{selectedMessage.destinations.name_es}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flight Details Section - Charter */}
                {selectedMessage.service_type === 'charter' && (
                  <div className="p-4 bg-navy-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-navy-400 text-xs font-semibold uppercase">Detalles del Vuelo Privado</p>
                      {!isEditingDates ? (
                        <button
                          onClick={handleStartEditDates}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-navy-400 hover:text-white hover:bg-navy-700 rounded transition-colors"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                          Editar fechas
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCancelEditDates}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-navy-400 hover:text-white hover:bg-navy-700 rounded transition-colors"
                          >
                            <XMarkIcon className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveDates}
                            disabled={savingDates}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-brand-500 hover:bg-brand-600 text-white rounded transition-colors disabled:opacity-50"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                            {savingDates ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Travel Date */}
                      <div>
                        <p className="text-navy-500 text-xs mb-1">Fecha de viaje</p>
                        {isEditingDates ? (
                          <input
                            type="date"
                            value={editTravelDate}
                            onChange={(e) => setEditTravelDate(e.target.value)}
                            className="admin-dark-input w-full px-3 py-1.5 bg-navy-900 border border-navy-700 rounded text-white text-sm focus:outline-none focus:border-brand-500 [color-scheme:dark]"
                          />
                        ) : selectedMessage.travel_date ? (
                          <div className="flex items-center gap-2 text-white">
                            <CalendarIcon className="w-4 h-4 text-navy-500" />
                            <span>{formatTravelDate(selectedMessage.travel_date)}</span>
                          </div>
                        ) : (
                          <span className="text-navy-600 text-sm">No especificada</span>
                        )}
                      </div>

                      {/* Departure Time */}
                      <div>
                        <p className="text-navy-500 text-xs mb-1">Hora de salida</p>
                        {isEditingDates ? (
                          <input
                            type="time"
                            value={editDepartureTime}
                            onChange={(e) => setEditDepartureTime(e.target.value)}
                            className="admin-dark-input w-full px-3 py-1.5 bg-navy-900 border border-navy-700 rounded text-white text-sm focus:outline-none focus:border-brand-500 [color-scheme:dark]"
                          />
                        ) : selectedMessage.departure_time ? (
                          <div className="flex items-center gap-2 text-white">
                            <ClockIcon className="w-4 h-4 text-navy-500" />
                            <span>{selectedMessage.departure_time}</span>
                          </div>
                        ) : (
                          <span className="text-navy-600 text-sm">No especificada</span>
                        )}
                      </div>

                      {/* Return Date */}
                      <div>
                        <p className="text-navy-500 text-xs mb-1">Fecha de regreso</p>
                        {isEditingDates ? (
                          <input
                            type="date"
                            value={editReturnDate}
                            onChange={(e) => setEditReturnDate(e.target.value)}
                            className="admin-dark-input w-full px-3 py-1.5 bg-navy-900 border border-navy-700 rounded text-white text-sm focus:outline-none focus:border-brand-500 [color-scheme:dark]"
                          />
                        ) : selectedMessage.return_date ? (
                          <div className="flex items-center gap-2 text-white">
                            <ArrowPathIcon className="w-4 h-4 text-navy-500" />
                            <span>{formatTravelDate(selectedMessage.return_date)}</span>
                          </div>
                        ) : (
                          <span className="text-navy-600 text-sm">No especificada</span>
                        )}
                      </div>

                      {/* Return Time */}
                      <div>
                        <p className="text-navy-500 text-xs mb-1">Hora de regreso</p>
                        {isEditingDates ? (
                          <input
                            type="time"
                            value={editReturnTime}
                            onChange={(e) => setEditReturnTime(e.target.value)}
                            className="admin-dark-input w-full px-3 py-1.5 bg-navy-900 border border-navy-700 rounded text-white text-sm focus:outline-none focus:border-brand-500 [color-scheme:dark]"
                          />
                        ) : selectedMessage.return_time ? (
                          <div className="flex items-center gap-2 text-white">
                            <ClockIcon className="w-4 h-4 text-navy-500" />
                            <span>{selectedMessage.return_time}</span>
                          </div>
                        ) : (
                          <span className="text-navy-600 text-sm">No especificada</span>
                        )}
                      </div>

                      {/* Departure Location */}
                      {selectedMessage.departure_location && (
                        <div>
                          <p className="text-navy-500 text-xs mb-1">Saliendo desde</p>
                          <div className="flex items-center gap-2 text-white">
                            <MapPinIcon className="w-4 h-4 text-navy-500" />
                            <span>{selectedMessage.departure_location_other || selectedMessage.departure_location}</span>
                          </div>
                        </div>
                      )}

                      {/* Destination */}
                      {selectedMessage.destination && (
                        <div>
                          <p className="text-navy-500 text-xs mb-1">Destino</p>
                          <div className="flex items-center gap-2 text-white">
                            <MapPinIcon className="w-4 h-4 text-brand-400" />
                            <span className="font-medium">{selectedMessage.destination_other || selectedMessage.destination}</span>
                          </div>
                        </div>
                      )}

                      {/* Number of Passengers */}
                      {selectedMessage.number_of_passengers && (
                        <div>
                          <p className="text-navy-500 text-xs mb-1">Número de pasajeros</p>
                          <div className="flex items-center gap-2 text-white">
                            <UserGroupIcon className="w-4 h-4 text-navy-500" />
                            <span>{selectedMessage.number_of_passengers} pasajero{selectedMessage.number_of_passengers > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}

                      {/* Aircraft Selected */}
                      {selectedMessage.aircraft_selected && (
                        <div>
                          <p className="text-navy-500 text-xs mb-1">Aeronave seleccionada</p>
                          <div className="flex items-center gap-2 text-white">
                            <PaperAirplaneIcon className="w-4 h-4 text-navy-500" />
                            <span>{selectedMessage.aircraft_selected}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flight Details Section - Tour */}
                {selectedMessage.service_type === 'tour' && (
                  <div className="p-4 bg-navy-800 rounded-lg space-y-3">
                    <p className="text-navy-400 text-xs font-semibold uppercase mb-3">Detalles del Tour Aéreo</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Travel Date */}
                      {selectedMessage.travel_date && (
                        <div>
                          <p className="text-navy-500 text-xs mb-1">Fecha de viaje</p>
                          <div className="flex items-center gap-2 text-white">
                            <CalendarIcon className="w-4 h-4 text-navy-500" />
                            <span>{formatTravelDate(selectedMessage.travel_date)}</span>
                          </div>
                        </div>
                      )}

                      {/* Departure Time */}
                      {selectedMessage.departure_time && (
                        <div>
                          <p className="text-navy-500 text-xs mb-1">Hora de salida</p>
                          <div className="flex items-center gap-2 text-white">
                            <ClockIcon className="w-4 h-4 text-navy-500" />
                            <span>{selectedMessage.departure_time}</span>
                          </div>
                        </div>
                      )}

                      {/* Number of Passengers */}
                      {selectedMessage.number_of_passengers && (
                        <div>
                          <p className="text-navy-500 text-xs mb-1">Número de pasajeros</p>
                          <div className="flex items-center gap-2 text-white">
                            <UserGroupIcon className="w-4 h-4 text-navy-500" />
                            <span>{selectedMessage.number_of_passengers} pasajero{selectedMessage.number_of_passengers > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                {selectedMessage.message && (
                  <div className="p-4 bg-navy-800 rounded-lg">
                    <p className="text-navy-400 text-xs font-semibold uppercase mb-2">
                      {selectedMessage.service_type === 'tour' ? 'Comentarios Personales' : 'Mensaje'}
                    </p>
                    <p className="text-white whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                )}

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
