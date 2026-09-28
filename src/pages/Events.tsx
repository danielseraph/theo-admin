import { useState } from 'react';
import { Plus, Loader2, X, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../apiClient';
import { useToast } from '../context/ToastContext';

interface EventData {
  id: string | number;
  title: string;
  date: string;
  description: string;
  venue: string;
  virtualLink?: string;
  status: 'Upcoming' | 'Completed';
}

export default function Events() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    description: '',
    venue: '',
    virtualLink: '',
    status: 'Upcoming',
  });

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/events');
      const items = response.data?.data;
      if (Array.isArray(items)) {
        return items as EventData[];
      }
      return [] as EventData[];
    }
  });

  const eventList = Array.isArray(events) ? events : [];

  const createMutation = useMutation({
    mutationFn: async (eventData: typeof newEvent) => {
      await apiClient.post('/v1/admin/events', eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showToast('Event created successfully! 🎉');
      setIsModalOpen(false);
      setNewEvent({ title: '', date: '', description: '', venue: '', virtualLink: '', status: 'Upcoming' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create event.';
      showToast(msg, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      await apiClient.delete(`/v1/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showToast('Event deleted successfully.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete event.';
      showToast(msg, 'error');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newEvent);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Events Management</h2>
          <p className="text-xs sm:text-sm text-gray-500">Schedule and monitor community events, workshops, and galas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>Create Event</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : isError ? (
          <div className="p-6 text-red-500 text-center text-sm">Failed to load events.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Venue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eventList.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{event.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {event.date ? new Date(event.date).toLocaleDateString(undefined, {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{event.venue}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'Upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                            deleteMutation.mutate(event.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:underline font-medium text-xs disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {eventList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-600">No events found</p>
                      <p className="text-xs text-gray-400 mt-0.5">Click "Create Event" to schedule your first event.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-slate-800">Create New Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="e.g. Annual Community Assembly" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date & Time <span className="text-red-500">*</span></label>
                <input required type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Venue <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="e.g. City Hall or Virtual" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Virtual Link (Optional)</label>
                <input type="url" placeholder="https://zoom.us/..." value={newEvent.virtualLink} onChange={e => setNewEvent({...newEvent, virtualLink: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required rows={3} placeholder="Event description, agenda, and speakers..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select value={newEvent.status} onChange={e => setNewEvent({...newEvent, status: e.target.value as any})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center space-x-1.5 disabled:opacity-60">
                  {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                  <span>Create Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}