import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Loader2, ArrowLeft, Video, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MediaUploader from '../../components/MediaUploader';
import GalleryPickerModal from '../../components/GalleryPickerModal';

// ─── Types ────────────────────────────────────────────────────────────────────

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

const CATEGORY_OPTIONS: { value: PostCategory; label: string; badge: string }[] = [
  { value: 'NEWS',             label: 'News (NEWS)',                     badge: 'bg-blue-50 text-blue-700' },
  { value: 'PRESS_RELEASE',   label: 'Press Release (PRESS_RELEASE)',   badge: 'bg-purple-50 text-purple-700' },
  { value: 'IMPACT_STORY',    label: 'Impact Story (IMPACT_STORY)',     badge: 'bg-green-50 text-green-700' },
  { value: 'COMMUNITY_UPDATE',label: 'Community Update (COMMUNITY_UPDATE)', badge: 'bg-amber-50 text-amber-700' },
];

const MEDIA_TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: 'NONE',  label: 'No Additional Media' },
  { value: 'IMAGE', label: 'Image (Direct Upload or Link)' },
  { value: 'VIDEO', label: 'Video (YouTube / Vimeo / MP4 Link)' },
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

  const watchedTitle     = watch('title');
  const watchedContent   = watch('content');
  const watchedMediaType = watch('mediaType');
  const watchedCoverUrl  = watch('coverImageUrl');
  const watchedMediaUrl  = watch('mediaUrl');
  const watchedStatus    = watch('status');

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* API error banner */}
        {apiError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start space-x-2">
            <span className="font-semibold">Error:</span>
            <span>{apiError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column: Article Content & Media (2 cols) ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & Body */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-gray-100 pb-3 text-base">
                Article Details
              </h3>

              {/* Title Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Post Title <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${
                    (watchedTitle?.length || 0) > 255 ? 'text-red-500 font-bold' : 'text-gray-400'
                  }`}>
                    {watchedTitle?.length || 0}/255
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Empowerment Hub Launches Vocational Training..."
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                    maxLength: { value: 255, message: 'Title cannot exceed 255 characters' },
                  })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Content Body <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {watchedContent?.length || 0} characters
                  </span>
                </div>
                <textarea
                  rows={14}
                  placeholder="Write full article body or rich text markdown here..."
                  {...register('content', {
                    required: 'Content body is required',
                    minLength: { value: 10, message: 'Content must be at least 10 characters long' },
                  })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y leading-relaxed font-sans"
                />
                {errors.content && (
                  <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
                )}
              </div>
            </div>

            {/* Media Attachment Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">Media Attachment</h3>
                <span className="text-xs text-gray-400">Optional extra media</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Media Type
                </label>
                <select
                  {...register('mediaType')}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {MEDIA_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* If IMAGE: use direct MediaUploader */}
              {watchedMediaType === 'IMAGE' && (
                <div className="pt-2">
                  <MediaUploader
                    label="Attached Media Image"
                    value={watchedMediaUrl}
                    onChange={(url) => setValue('mediaUrl', url, { shouldValidate: true, shouldDirty: true })}
                    onChooseFromGallery={() => setPickerTarget('media')}
                    helperText="Upload image file directly to Cloudinary or paste web link"
                  />
                </div>
              )}

              {/* If VIDEO: URL input */}
              {watchedMediaType === 'VIDEO' && (
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Video Stream / Embed URL
                  </label>
                  <div className="relative">
                    <Video className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                      {...register('mediaUrl')}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Paste a direct YouTube, Vimeo, or MP4 video URL
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* ── Right column: Metadata & Direct Upload (1 col) ── */}
          <div className="space-y-6">
            
            {/* Publish & Status Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-gray-100 pb-3 text-base">
                Publish Settings
              </h3>

              {/* Status Radio Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Publication Status
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['DRAFT', 'PUBLISHED'] as PostStatus[]).map((s) => {
                    const isChecked = watchedStatus === s;
                    return (
                      <label
                        key={s}
                        className={`flex items-center justify-center gap-2 border rounded-xl py-2.5 px-3 cursor-pointer text-xs font-semibold transition-all ${
                          isChecked
                            ? s === 'PUBLISHED'
                              ? 'border-green-500 bg-green-50/60 text-green-700 ring-2 ring-green-500/20'
                              : 'border-slate-400 bg-slate-100 text-slate-800 ring-2 ring-slate-400/20'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          value={s}
                          {...register('status')}
                          className="sr-only"
                        />
                        <span className={`w-2 h-2 rounded-full ${
                          s === 'PUBLISHED' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span>{s === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Article Category
                </label>
                <select
                  {...register('category', { required: true })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct Cover Image Upload Dropzone */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-3">
              <MediaUploader
                label="Cover Image"
                value={watchedCoverUrl}
                onChange={(url) => setValue('coverImageUrl', url, { shouldValidate: true, shouldDirty: true })}
                onChooseFromGallery={() => setPickerTarget('cover')}
                helperText="Upload photo from phone/PC (Cloudinary) or choose from Gallery"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60 shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-accent" />
                )}
                <span>{mode === 'create' ? 'Create & Save Post' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/posts')}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-xs hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Posts List</span>
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
