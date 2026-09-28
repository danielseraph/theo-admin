import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Loader2, Trash2, Edit2,
  Eye, EyeOff, RefreshCw, AlertTriangle,
} from 'lucide-react';
import apiClient from '../../apiClient';
import { useToast } from '../../context/ToastContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type PostCategory = 'NEWS' | 'PRESS_RELEASE' | 'IMPACT_STORY' | 'COMMUNITY_UPDATE';

interface Author {
  id: string;
  firstName: string;
  lastName: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  category: PostCategory;
  status: PostStatus;
  coverImageUrl?: string;
  publishedAt?: string;
  createdAt: string;
  author: Author;
}

interface PostsApiResponse {
  success: boolean;
  data: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<PostStatus, string> = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  ARCHIVED:  'bg-amber-100 text-amber-700',
};

const STATUS_DOT: Record<PostStatus, string> = {
  PUBLISHED: 'bg-green-500',
  DRAFT:     'bg-gray-400',
  ARCHIVED:  'bg-amber-400',
};

const CATEGORY_LABELS: Record<PostCategory, string> = {
  NEWS:             'News',
  PRESS_RELEASE:    'Press Release',
  IMPACT_STORY:     'Impact Story',
  COMMUNITY_UPDATE: 'Community Update',
};

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteDialog({
  post,
  onConfirm,
  onCancel,
  isPending,
}: {
  post: Post;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Delete Post</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold">"{post.title}"</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PostsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>('');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  // ── Fetch ──
  const { data: result, isLoading, isError, isFetching } = useQuery({
    queryKey: ['posts', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiClient.get(`/v1/admin/posts?${params.toString()}`);
      return res.data as PostsApiResponse;
    },
  });

  // ── Publish / Unpublish ──
  const { mutate: togglePublish, isPending: isToggling } = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'publish' | 'unpublish' }) => {
      await apiClient.patch(`/v1/admin/posts/${id}/${action}`);
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showToast(`Post ${action === 'publish' ? 'published' : 'unpublished'} successfully.`);
    },
    onError: () => showToast('Failed to update post status.', 'error'),
  });

  // ── Delete ──
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/admin/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setDeleteTarget(null);
      showToast('Post deleted successfully.');
    },
    onError: () => showToast('Failed to delete post.', 'error'),
  });

  return (
    <>
      <div className="space-y-5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none sm:w-60 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs sm:text-sm"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as PostStatus | ''); setPage(1); }}
              className="text-xs sm:text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {isFetching && !isLoading && (
              <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          <button
            onClick={() => navigate('/posts/new')}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-accent" />
            <span>New Post</span>
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex h-64 items-center justify-center text-red-500 text-sm">
                Failed to load posts. Please try again.
              </div>
            ) : result?.data.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
                No posts found.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result?.data.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Title */}
                      <td className="px-6 py-4 max-w-[280px]">
                        <p className="font-medium text-slate-800 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{post.slug}</p>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {CATEGORY_LABELS[post.category] ?? post.category}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[post.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[post.status]}`} />
                          {post.status}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {post.author?.firstName} {post.author?.lastName}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => navigate(`/posts/${post.id}/edit`)}
                            className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Publish / Unpublish */}
                          <button
                            onClick={() =>
                              togglePublish({
                                id: post.id,
                                action: post.status === 'PUBLISHED' ? 'unpublish' : 'publish',
                              })
                            }
                            disabled={isToggling}
                            className={`p-2 rounded-lg transition-colors ${
                              post.status === 'PUBLISHED'
                                ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          >
                            {post.status === 'PUBLISHED' ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {result && result.pagination && result.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
              <span>
                Page {result.pagination.page} of {result.pagination.totalPages} &mdash; {result.pagination.total} total posts
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button className="px-3 py-1 bg-primary text-white rounded">{page}</button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= result.pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          post={deleteTarget}
          onConfirm={() => deletePost(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
