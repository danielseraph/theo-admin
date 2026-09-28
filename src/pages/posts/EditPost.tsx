import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import apiClient from '../../apiClient';
import { useToast } from '../../context/ToastContext';
import PostForm, { type PostFormValues } from './PostForm';

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState('');

  // ── Fetch existing post ──
  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await apiClient.get(`/v1/admin/posts/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // ── Update mutation ──
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: PostFormValues) => {
      const body = {
        title:         payload.title,
        content:       payload.content,
        category:      payload.category,
        status:        payload.status,
        mediaType:     payload.mediaType,
        mediaUrl:      payload.mediaUrl || undefined,
        coverImageUrl: payload.coverImageUrl || undefined,
      };
      const res = await apiClient.put(`/v1/admin/posts/${id}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      showToast('Post updated successfully.');
      navigate('/posts');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update post. Please try again.';
      setApiError(msg);
      showToast(msg, 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500 text-sm">
        Failed to load post. It may have been deleted.
      </div>
    );
  }

  // Map API response → form default values
  const defaultValues: Partial<PostFormValues> = {
    title:         data.title ?? '',
    content:       data.content ?? '',
    category:      data.category ?? 'NEWS',
    status:        data.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
    mediaType:     data.mediaType ?? 'NONE',
    mediaUrl:      data.mediaUrl ?? '',
    coverImageUrl: data.coverImageUrl ?? '',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Edit Post</h2>
        <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xl">{data.title}</p>
      </div>

      <PostForm
        mode="edit"
        defaultValues={defaultValues}
        onSubmit={(values) => {
          setApiError('');
          if (values.coverImageUrl?.startsWith('data:')) {
            const err = 'Cover image cannot be a raw base64 data string. Please provide an image web URL (https://...).';
            setApiError(err);
            showToast(err, 'error');
            return;
          }
          if (values.mediaUrl?.startsWith('data:')) {
            const err = 'Media URL cannot be a raw base64 data string. Please provide an image web URL (https://...).';
            setApiError(err);
            showToast(err, 'error');
            return;
          }
          mutate(values);
        }}
        isSubmitting={isPending}
        apiError={apiError}
      />
    </div>
  );
}
