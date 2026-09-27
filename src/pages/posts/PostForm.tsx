import { useForm, type SubmitHandler } from 'react-hook-form';
import { Loader2, ArrowLeft, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Types (exported so pages can reuse) ─────────────────────────────────────

export type PostStatus   = 'DRAFT' | 'PUBLISHED';
export type MediaType    = 'NONE' | 'IMAGE' | 'VIDEO';
export type PostCategory = 'NEWS' | 'PRESS_RELEASE' | 'IMPACT_STORY' | 'COMMUNITY_UPDATE';

export interface PostFormValues {
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  mediaType: MediaType;
  mediaUrl: string;
  coverImageUrl: string;
}

interface PostFormProps {
  defaultValues?: Partial<PostFormValues>;
  onSubmit: SubmitHandler<PostFormValues>;
  isSubmitting: boolean;
  apiError?: string;
  mode: 'create' | 'edit';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: PostCategory; label: string }[] = [
  { value: 'NEWS',             label: 'News' },
  { value: 'PRESS_RELEASE',   label: 'Press Release' },
  { value: 'IMPACT_STORY',    label: 'Impact Story' },
  { value: 'COMMUNITY_UPDATE',label: 'Community Update' },
];

const MEDIA_TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: 'NONE',  label: 'No Media' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PostForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  apiError,
  mode,
}: PostFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    defaultValues: {
      title: '',
      content: '',
      category: 'NEWS',
      status: 'DRAFT',
      mediaType: 'NONE',
      mediaUrl: '',
      coverImageUrl: '',
      ...defaultValues,
    },
  });

  const watchedMediaType = watch('mediaType');
  const watchedCoverUrl  = watch('coverImageUrl');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* API error banner */}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (main fields) ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-gray-100 pb-3">Post Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter post title…"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={14}
                placeholder="Write your post content here…"
                {...register('content', { required: 'Content is required' })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-gray-100 pb-3">Media</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
              <select
                {...register('mediaType')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {MEDIA_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {watchedMediaType !== 'NONE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {watchedMediaType === 'IMAGE' ? 'Image URL' : 'Video URL'}
                </label>
                <input
                  type="url"
                  placeholder={`https://…`}
                  {...register('mediaUrl')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Right column (meta) ── */}
        <div className="space-y-5">
          {/* Publish settings */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-gray-100 pb-3">Publish</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex gap-3">
                {(['DRAFT', 'PUBLISHED'] as PostStatus[]).map((s) => (
                  <label
                    key={s}
                    className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 cursor-pointer text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary"
                  >
                    <input
                      type="radio"
                      value={s}
                      {...register('status')}
                      className="sr-only"
                    />
                    <span className={`w-2 h-2 rounded-full ${s === 'PUBLISHED' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {s === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...register('category', { required: true })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-gray-100 pb-3">Cover Image</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input
                type="url"
                placeholder="https://…"
                {...register('coverImageUrl')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
              {watchedCoverUrl ? (
                <img
                  src={watchedCoverUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="flex flex-col items-center text-gray-300 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <p className="text-xs">No cover image</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'create' ? 'Create Post' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/posts')}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Posts
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
