import apiClient from '../apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventType = 
  | 'TRAINING'
  | 'WORKSHOP'
  | 'COMMUNITY_OUTREACH'
  | 'FUNDRAISING'
  | 'WEBINAR'
  | 'CONFERENCE'
  | 'CEREMONY'
  | 'OTHER';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventItem {
  id: string;
  title: string;
  slug?: string;
  description: string;
  type: EventType;
  status: EventStatus;
  eventDate: string; // YYYY-MM-DD
  time: string;      // e.g. "9:00 AM – 5:00 PM WAT"
  location: string;
  seats: string;     // e.g. "50 seats available"
  isFree: boolean;
  fee: string;       // e.g. "Free" or "₦5,000"
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  attendeesCount?: number;
}

export interface EventAttendee {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  registeredAt?: string;
  createdAt?: string;
}

export interface EventsResponse {
  success: boolean;
  message?: string;
  data: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventFormData {
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  eventDate: string;
  time: string;
  location: string;
  seats: string;
  isFree: boolean;
  fee: string;
  coverImageUrl?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const EVENT_TYPES: { value: EventType; label: string; badgeColor: string }[] = [
  { value: 'TRAINING',           label: 'Training',           badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'WORKSHOP',           label: 'Workshop',           badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'COMMUNITY_OUTREACH', label: 'Community Outreach', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'FUNDRAISING',        label: 'Fundraising',        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'WEBINAR',            label: 'Webinar',            badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { value: 'CONFERENCE',         label: 'Conference',         badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'CEREMONY',           label: 'Ceremony',           badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { value: 'OTHER',              label: 'Other',              badgeColor: 'bg-slate-100 text-slate-800 border-slate-200' },
];

export const EVENT_STATUSES: { value: string; label: string; badgeColor: string }[] = [
  { value: 'UPCOMING',  label: 'Upcoming',  badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'ONGOING',   label: 'Ongoing',   badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'COMPLETED', label: 'Past',      badgeColor: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'CANCELLED', label: 'Cancelled', badgeColor: 'bg-red-50 text-red-700 border-red-200' },
];

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getEvents(params: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}): Promise<EventsResponse> {
  const query = new URLSearchParams();
  query.set('page', String(params.page || 1));
  query.set('limit', String(params.limit || 10));

  // Map "PAST" to "COMPLETED" as expected by the backend enum validator
  if (params.status && params.status !== 'ALL') {
    const backendStatus = params.status === 'PAST' ? 'COMPLETED' : params.status;
    query.set('status', backendStatus);
  }

  if (params.type && params.type !== 'ALL') {
    query.set('type', params.type);
  }

  if (params.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }

  const response = await apiClient.get<EventsResponse>(`/events?${query.toString()}`);
  return response.data;
}

export async function getEventById(id: string): Promise<EventItem> {
  const response = await apiClient.get<{ success: boolean; data: EventItem }>(`/events/${id}`);
  return response.data.data;
}

export async function createEvent(payload: EventFormData): Promise<EventItem> {
  const response = await apiClient.post<{ success: boolean; data: EventItem }>('/events', payload);
  return response.data.data;
}

export async function updateEvent(id: string, payload: EventFormData): Promise<EventItem> {
  const response = await apiClient.put<{ success: boolean; data: EventItem }>(`/events/${id}`, payload);
  return response.data.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(`/events/${id}`);
}

export async function getEventAttendees(id: string): Promise<EventAttendee[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: EventAttendee[] }>(`/v1/admin/events/${id}/attendees`);
    return response.data.data || [];
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // Try alternate endpoint path if /v1/admin/events/:id/attendees was 404
      const fallback = await apiClient.get<{ success: boolean; data: EventAttendee[] }>(`/events/${id}/attendees`);
      return fallback.data.data || [];
    }
    throw err;
  }
}

// ─── CSV Export Helper ────────────────────────────────────────────────────────

export function exportAttendeesToCSV(eventTitle: string, attendees: EventAttendee[]): void {
  const headers = ['Full Name', 'Email', 'Phone Number', 'Date Registered'];
  
  const rows = attendees.map((a) => {
    const name = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.name || 'Anonymous';
    const email = a.email || '';
    const phone = a.phoneNumber || a.phone || 'N/A';
    const rawDate = a.registeredAt || a.createdAt;
    const date = rawDate ? new Date(rawDate).toLocaleString() : 'N/A';

    return [
      `"${name.replace(/"/g, '""')}"`,
      `"${email.replace(/"/g, '""')}"`,
      `"${phone.replace(/"/g, '""')}"`,
      `"${date.replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
  link.setAttribute('download', `${safeTitle}-attendees-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
