import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { 
  UploadCloud, Loader2, X, Link as LinkIcon, 
  FolderOpen, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { uploadMediaFile } from '../services/uploadService';
import { useToast } from '../context/ToastContext';

interface MediaUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  accept?: string;
  onChooseFromGallery?: () => void;
  helperText?: string;
}

export default function MediaUploader({
  value = '',
  onChange,
  label = 'Cover Image',
  required = false,
  accept = 'image/*',
  onChooseFromGallery,
  helperText = 'PNG, JPG, WEBP, or GIF up to 25MB',
}: MediaUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [pastedUrl, setPastedUrl] = useState('');

  // Handle actual file upload to POST /api/v1/admin/upload
  const handleUpload = async (file: File) => {
    // Show immediate local preview thumbnail while upload runs
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setUploadError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const cloudinaryUrl = await uploadMediaFile(file, (percent) => {
        setUploadProgress(percent);
      });
      onChange(cloudinaryUrl);
      setLocalPreview('');
      showToast('Media uploaded to Cloudinary successfully! ✨');
    } catch (err: any) {
      const message = err?.message || 'Upload failed. Please try again.';
      setUploadError(message);
      showToast(message, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setLocalPreview('');
    setUploadError('');
    setPastedUrl('');
  };

  const handleApplyUrl = () => {
    const trimmed = pastedUrl.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('data:')) {
      showToast('Please provide a public web URL, not a base64 string.', 'error');
      return;
    }
    onChange(trimmed);
    setShowUrlInput(false);
    setPastedUrl('');
  };

  const activeImage = localPreview || value;

  return (
    <div className="space-y-3">
      {/* Label and Toolbar actions */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center space-x-2">
          {onChooseFromGallery && (
            <button
              type="button"
              onClick={onChooseFromGallery}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>From Gallery</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowUrlInput((prev) => !prev)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL' : 'Paste URL'}</span>
          </button>
        </div>
      </div>

      {/* Optional URL Paste Bar */}
      {showUrlInput && (
        <div className="flex gap-2 animate-in fade-in duration-150">
          <input
            type="url"
            placeholder="https://res.cloudinary.com/... or https://..."
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            disabled={!pastedUrl.trim()}
            className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Upload Dropzone or Image Preview */}
      {activeImage ? (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center group shadow-sm">
          <img
            src={activeImage}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x400?text=Invalid+Image+URL';
            }}
          />

          {/* Uploading progress overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-white z-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-2" />
              <p className="text-xs font-semibold">Uploading to Cloudinary...</p>
              <div className="w-48 bg-white/20 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[11px] text-gray-300 mt-1 font-mono">{uploadProgress}%</span>
            </div>
          )}

          {/* Hover Action Controls (when not uploading) */}
          {!isUploading && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>Change File</span>
              </button>
              {onChooseFromGallery && (
                <button
                  type="button"
                  onClick={onChooseFromGallery}
                  className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition-colors flex items-center space-x-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-primary" />
                  <span>Gallery</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors flex items-center space-x-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}

          {/* Secure Cloudinary badge indicator */}
          {!isUploading && value && (
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md flex items-center space-x-1 font-medium z-10">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className="truncate max-w-[200px]">Cloudinary Uploaded</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
              : 'border-gray-300 hover:border-primary/60 hover:bg-gray-50/70 bg-white'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-xs font-semibold text-slate-800">Uploading to server...</p>
              <div className="w-40 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2.5">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Click to browse or drag & drop file
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{helperText}</p>
            </div>
          )}
        </div>
      )}

      {/* Error state if upload failed */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{uploadError}</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="font-bold underline ml-2 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
