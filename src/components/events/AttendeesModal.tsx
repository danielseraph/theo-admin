import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  X, Download, Search, Users, Loader2, 
  Mail, Phone, Calendar, AlertCircle 
} from 'lucide-react';
import { 
  type EventItem, 
  getEventAttendees, 
  exportAttendeesToCSV 
} from '../../services/eventsService';

interface AttendeesModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AttendeesModal({
  event,
  isOpen,
  onClose,
}: AttendeesModalProps) {
  const [search, setSearch] = useState('');

  const { data: attendees = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['eventAttendees', event?.id],
    queryFn: () => (event ? getEventAttendees(event.id) : Promise.resolve([])),
    enabled: !!event && isOpen,
  });

  if (!isOpen || !event) return null;

  const filteredAttendees = attendees.filter((a) => {
    const name = (a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.name || '').toLowerCase();
    const email = (a.email || '').toLowerCase();
    const phone = (a.phoneNumber || a.phone || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const handleExport = () => {
    exportAttendeesToCSV(event.title, attendees);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex items-start justify-between">
          <div className="flex items-start space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                  Event Attendees & RSVPs
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                  {attendees.length} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {event.title} &bull; {event.eventDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Export CSV */}
        <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={attendees.length === 0}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:border-gray-400 text-slate-700 hover:text-primary rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-xs sm:text-sm">Fetching attendee list...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-400" />
              <p className="text-sm font-semibold">Failed to load attendees</p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-slate-700 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No attendees found</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                {search ? 'No results matched your search query.' : 'No one has registered for this event yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-5 py-3.5">Attendee</th>
                    <th className="px-5 py-3.5">Contact Details</th>
                    <th className="px-5 py-3.5">Date Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendees.map((a, idx) => {
                    const name = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.name || 'Attendee';
                    const email = a.email;
                    const phone = a.phoneNumber || a.phone;
                    const rawDate = a.registeredAt || a.createdAt;
                    const regDate = rawDate ? new Date(rawDate).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }) : 'N/A';

                    return (
                      <tr key={a.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800">{name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          <div className="space-y-0.5">
                            {email && (
                              <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span>{email}</span>
                              </div>
                            )}
                            {phone && (
                              <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{regDate}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
