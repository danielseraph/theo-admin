import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Loader2, ArrowLeft, ImageIcon, FolderOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GalleryPickerModal from '../../components/GalleryPickerModal';

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
  const [pickerTarget, setPickerTarget] = useState<'cover' | 'media' | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
  const watchedMediaUrl  = watch('mediaUrl');

  return (
    <>
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
              <h3 className="font-semibold text-slate-800 border-b border-gray-100 pb-3">Media (Optional)</h3>

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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {watchedMediaType === 'IMAGE' ? 'Image URL' : 'Video URL'}
                    </label>
                    {watchedMediaType === 'IMAGE' && (
                      <button
                        type="button"
                        onClick={() => setPickerTarget('media')}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Choose from Gallery</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder={watchedMediaType === 'IMAGE' ? "https://… or select from gallery" : "https://youtube.com/…"}
                      {...register('mediaUrl')}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {watchedMediaType === 'IMAGE' && (
                      <button
                        type="button"
                        onClick={() => setPickerTarget('media')}
                        className="px-3 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Gallery</span>
                      </button>
                    )}
                  </div>

                  {/* Media preview if image */}
                  {watchedMediaType === 'IMAGE' && watchedMediaUrl && (
                    <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 max-h-48 aspect-video flex items-center justify-center group">
                      <img
                        src={watchedMediaUrl}
                        alt="Media preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setValue('mediaUrl', '', { shouldDirty: true })}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-semibold text-slate-800">Cover Image</h3>
                <button
                  type="button"
                  onClick={() => setPickerTarget('cover')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Choose from Gallery</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://… or select from gallery"
                    {...register('coverImageUrl')}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerTarget('cover')}
                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    title="Browse Gallery"
                  >
                    <FolderOpen className="w-4 h-4 text-primary" />
                    <span className="hidden sm:inline">Gallery</span>
                  </button>
                </div>
              </div>

              {/* Preview with overlay controls */}
              <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center group">
                {watchedCoverUrl ? (
                  <>
                    <img
                      src={watchedCoverUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => setPickerTarget('cover')}
                        className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-100 flex items-center gap-1.5"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-primary" />
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('coverImageUrl', '', { shouldDirty: true })}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-red-700 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => setPickerTarget('cover')}
                    className="flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:text-primary transition-colors p-4 w-full h-full border-2 border-dashed border-gray-200 hover:border-primary/40 rounded-xl m-1"
                  >
                    <div className="p-2.5 rounded-full bg-primary/5 text-primary">
                      <ImageIcon className="w-6 h-6 stroke-1.5" />
                    </div>
                    <p className="text-xs font-medium text-slate-600">Choose from Gallery or paste URL</p>
                    <span className="text-[11px] text-primary font-semibold hover:underline">
                      Click to Browse Gallery
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60 shadow-sm"
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

      {/* Gallery Picker Modal */}
      <GalleryPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        title={pickerTarget === 'cover' ? 'Choose Post Cover Image' : 'Choose Media Image'}
        initialSelectedUrl={pickerTarget === 'cover' ? watchedCoverUrl : watchedMediaUrl}
        onSelectImage={(url) => {
          if (pickerTarget === 'cover') {
            setValue('coverImageUrl', url, { shouldValidate: true, shouldDirty: true });
          } else if (pickerTarget === 'media') {
            setValue('mediaUrl', url, { shouldValidate: true, shouldDirty: true });
          }
          setPickerTarget(null);
        }}
      />
    </>
  );
}
