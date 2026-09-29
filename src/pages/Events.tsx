import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Loader2, Calendar as CalendarIcon, 
  MapPin, Clock, Users, Edit2, Trash2, 
  AlertTriangle, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { 
  type EventItem, 
  type EventFormData,
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  EVENT_TYPES,
  EVENT_STATUSES
} from '../services/eventsService';
import EventFormModal from '../components/events/EventFormModal';
import AttendeesModal from '../components/events/AttendeesModal';

export default function Events() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [attendeesEvent, setAttendeesEvent] = useState<EventItem | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  // Fetch events from live backend API
  const { data: responseData, isLoading, isError, isFetching } = useQuery({
    queryKey: ['events', page, statusFilter, typeFilter, search],
    queryFn: () => getEvents({
      page,
      limit: 10,
      status: statusFilter,
      type: typeFilter,
      search,
    }),
  });

  const events = responseData?.data || [];
  const pagination = responseData?.pagination;

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (formData: EventFormData) => createEvent(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showToast('Event created successfully! 🎉');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create event.';
      showToast(msg, 'error');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventFormData }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showToast('Event updated successfully! ✨');
      setIsFormOpen(false);
      setEditingEvent(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update event.';
      showToast(msg, 'error');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showToast('Event deleted successfully.');
      setEventToDelete(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete event.';
      showToast(msg, 'error');
    },
  });

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (evt: EventItem) => {
    setEditingEvent(evt);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: EventFormData) => {
    if (editingEvent) {
      await updateMutation.mutateAsync({ id: editingEvent.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Events & Programs Management
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Organize workshops, bootcamps, and community initiatives, track registrations, and manage RSVPs.
          </p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-sm hover:shadow-md text-xs sm:text-sm whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or venue location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Past</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Type / Category Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Event Types</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {isFetching && !isLoading && (
            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin ml-1" />
          )}
        </div>
      </div>

      {/* Events Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 text-gray-400">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-xs sm:text-sm font-medium">Loading events and programs...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">Failed to load events from the server.</p>
            <p className="text-xs text-gray-400 mt-1">Please check your connection and try again.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-24 text-center text-gray-400 px-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-7 h-7 text-primary" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No events found</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-5">
              {search || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'No events match your current filter parameters.'
                : 'Get started by creating your organization’s first event or training program.'}
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
            >
              Create First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Pricing</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((evt) => {
                  const typeObj = EVENT_TYPES.find(t => t.value === evt.type) || {
                    label: evt.type,
                    badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
                  };

                  const statusObj = EVENT_STATUSES.find(s => s.value === evt.status) || {
                    label: evt.status,
                    badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
                  };

                  const formattedDate = evt.eventDate ? new Date(evt.eventDate).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }) : 'TBD';

                  return (
                    <tr key={evt.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Banner & Title */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-center space-x-3.5">
                          {evt.coverImageUrl ? (
                            <img
                              src={evt.coverImageUrl}
                              alt={evt.title}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-200 shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://placehold.co/100x100?text=Event';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate leading-snug">
                              {evt.title}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              {evt.seats || 'Open Seats'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeObj.badgeColor}`}>
                          {typeObj.label}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5 text-slate-800 font-semibold text-xs">
                            <CalendarIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>{formattedDate}</span>
                          </div>
                          {evt.time && (
                            <div className="flex items-center space-x-1.5 text-gray-500 text-[11px]">
                              <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[140px]">{evt.time}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4 text-gray-600 max-w-[180px]">
                        <div className="flex items-start space-x-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="truncate" title={evt.location}>{evt.location}</span>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {evt.isFree || (evt.fee && evt.fee.toLowerCase() === 'free') ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            FREE
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-800">
                            {evt.fee || 'Paid'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusObj.badgeColor}`}>
                          {statusObj.label}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Attendees Button */}
                          <button
                            type="button"
                            onClick={() => setAttendeesEvent(evt)}
                            className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                            title="View Attendees"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Attendees</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(evt)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setEventToDelete(evt)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-gray-500 bg-gray-50/50">
            <span className="text-center sm:text-left">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total events)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-xs"
              >
                Prev
              </button>
              <button className="px-3 py-1.5 bg-primary text-white rounded-lg font-bold shadow-xs">
                {page}
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Event Form Modal */}
      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleFormSubmit}
        eventToEdit={editingEvent}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Attendees Drawer / Modal */}
      <AttendeesModal
        event={attendeesEvent}
        isOpen={!!attendeesEvent}
        onClose={() => setAttendeesEvent(null)}
      />

      {/* Delete Confirmation Dialog */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">Delete Event</h4>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-800">"{eventToDelete.title}"</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(eventToDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors flex items-center space-x-1.5 disabled:opacity-60"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}