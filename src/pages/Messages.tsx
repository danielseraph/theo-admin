import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Mail, RefreshCw, X, Phone } from 'lucide-react';
import apiClient from '../apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageStatus = 'NEW' | 'READ' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';

interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ContactMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<MessageStatus, string> = {
  NEW:         'bg-blue-100 text-blue-700',
  READ:        'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED:    'bg-green-100 text-green-700',
  ARCHIVED:    'bg-slate-100 text-slate-500',
};

const STATUS_OPTIONS: MessageStatus[] = ['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'];

const STATUS_LABELS: Record<MessageStatus, string> = {
  NEW:         'New',
  READ:        'Read',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
  ARCHIVED:    'Archived',
};

// ─── Message Detail Modal ─────────────────────────────────────────────────────

function MessageModal({
  message,
  onClose,
}: {
  message: ContactMessage;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async (status: MessageStatus) => {
      await apiClient.patch(`/v1/admin/contact-messages/${message.id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{message.subject}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sender Info */}
        <div className="px-6 py-4 bg-gray-50/60 border-b border-gray-100 space-y-1">
          <div className="flex items-center space-x-2 text-sm text-slate-700">
            <span className="font-semibold">{message.fullName}</span>
            <span className="text-gray-400">·</span>
            <a href={`mailto:${message.email}`} className="text-primary hover:underline">
              {message.email}
            </a>
          </div>
          {message.phone && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Phone className="w-3.5 h-3.5" />
              <span>{message.phone}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{message.message}</p>
        </div>

        {/* Status Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                disabled={isPending || message.status === s}
                onClick={() => updateStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  message.status === s
                    ? `${STATUS_STYLES[s]} border-transparent ring-2 ring-offset-1 ring-current`
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                {isPending && message.status !== s ? (
                  <RefreshCw className="w-3 h-3 animate-spin inline" />
                ) : (
                  STATUS_LABELS[s]
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Messages() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MessageStatus | ''>('');
  const [sort, setSort] = useState<'createdAt' | 'fullName' | 'status'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const queryClient = useQueryClient();

  const buildUrl = () => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    params.set('sort', sort);
    params.set('order', order);
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    return `/v1/admin/contact-messages?${params.toString()}`;
  };

  const { data: result, isLoading, isError, isFetching } = useQuery({
    queryKey: ['messages', page, search, statusFilter, sort, order],
    queryFn: async () => {
      const response = await apiClient.get(buildUrl());
      return response.data as ApiResponse;
    },
  });

  // When user opens a message that is NEW, auto-mark it READ
  const { mutate: markRead } = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/v1/admin/contact-messages/${id}/status`, { status: 'READ' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });

  const handleOpen = (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === 'NEW') markRead(msg.id);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm w-56"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as MessageStatus | ''); setPage(1); }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="createdAt">Sort: Date</option>
              <option value="fullName">Sort: Name</option>
              <option value="status">Sort: Status</option>
            </select>

            {/* Order */}
            <button
              onClick={() => setOrder(o => o === 'desc' ? 'asc' : 'desc')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 font-medium text-gray-600"
            >
              {order === 'desc' ? '↓ Newest' : '↑ Oldest'}
            </button>

            {/* Fetching indicator */}
            {isFetching && <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />}
          </div>
        </div>

        {/* List */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex h-64 items-center justify-center text-red-500 text-sm">
              Failed to load messages. Please try again.
            </div>
          ) : result?.data.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center text-gray-400">
              <Mail className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {result?.data.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpen(msg)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    msg.status === 'NEW' ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {msg.fullName.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className={`truncate text-sm ${msg.status === 'NEW' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {msg.fullName}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className={`truncate text-xs mb-0.5 ${msg.status === 'NEW' ? 'font-semibold text-slate-800' : 'text-gray-600'}`}>
                      {msg.subject}
                    </p>
                    <p className="truncate text-xs text-gray-400">{msg.email}</p>
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[msg.status]}`}>
                      {STATUS_LABELS[msg.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {result && result.pagination && result.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing page {result.pagination.page} of {result.pagination.totalPages} ({result.pagination.total} total)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded">{page}</button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= result.pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selected && (
        <MessageModal
          message={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}