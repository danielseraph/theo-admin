import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { useToast } from '../../context/ToastContext';
import PostForm, { type PostFormValues } from './PostForm';

export default function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState('');

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
      const res = await apiClient.post('/v1/admin/posts', body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showToast('Post created successfully! 🎉');
      navigate('/posts');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create post. Please try again.';
      setApiError(msg);
      showToast(msg, 'error');
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Create New Post</h2>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to publish or save a draft.</p>
      </div>

      <PostForm
        mode="create"
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
