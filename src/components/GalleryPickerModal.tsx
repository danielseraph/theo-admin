import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  X, Search, Image as ImageIcon, Upload, Check, 
  Loader2, Plus, Sparkles, AlertCircle 
} from 'lucide-react';
import apiClient from '../apiClient';

export interface GalleryItem {
  id: string | number;
  title?: string;
  url: string;
  category?: string;
  createdAt?: string;
}

interface GalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  title?: string;
  initialSelectedUrl?: string;
}

export default function GalleryPickerModal({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Select Image from Gallery',
  initialSelectedUrl = '',
}: GalleryPickerModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [selectedUrl, setSelectedUrl] = useState<string>(initialSelectedUrl);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Direct upload tab states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('General');
  const [directUrl, setDirectUrl] = useState('');

  // Fetch gallery items from backend API
  const { data: apiItems, isLoading } = useQuery({
    queryKey: ['galleryItems'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/v1/gallery');
        const items = response.data?.data;
        if (Array.isArray(items)) {
          return items as GalleryItem[];
        }
      } catch (err) {
        console.warn('Could not fetch from /v1/gallery:', err);
      }
      return [] as GalleryItem[];
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // Pure live items strictly from API
  const allItems: GalleryItem[] = Array.isArray(apiItems) ? apiItems : [];

  // Categories list
  const categories = [
    'ALL',
    ...Array.from(new Set(allItems.map((item) => item.category || 'General'))),
  ];

  // Filtered items
  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadPreview(result);
        setSelectedUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add / Save image mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const imageUrl = uploadPreview || directUrl;
      if (!imageUrl) throw new Error('Please select an image');

      // Attempt to save to backend /v1/admin/gallery if authenticated
      try {
        await apiClient.post('/v1/admin/gallery', {
          title: uploadTitle || uploadFile?.name || 'Uploaded Media',
          url: imageUrl,
          mediaUrl: imageUrl,
          category: uploadCategory,
          mediaType: 'IMAGE',
        });
      } catch (err) {
        console.info('Backend admin gallery save skipped, using image locally:', err);
      }
      return imageUrl;
    },
    onSuccess: (url) => {
      queryClient.invalidateQueries({ queryKey: ['galleryItems'] });
      onSelectImage(url);
      onClose();
    },
    onError: () => {
      // Still select image even if backend gallery sync had issues
      if (uploadPreview || directUrl) {
        onSelectImage(uploadPreview || directUrl);
        onClose();
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-gray-500">
                Browse existing media or upload new pictures for your post
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'gallery'
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Organization Gallery</span>
            <span className="ml-1 text-xs py-0.5 px-2 rounded-full bg-primary/10 text-primary">
              {allItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'upload'
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload from Device</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'url'
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Direct Web Link</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[380px]">
          
          {/* TAB 1: BROWSE GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search photos by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-sm">Loading gallery media...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No media found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try another search term or upload a new photo
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredItems.map((item) => {
                    const isSelected = selectedUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedUrl(item.url)}
                        className={`group relative rounded-xl overflow-hidden aspect-video bg-gray-100 cursor-pointer border-2 transition-all ${
                          isSelected
                            ? 'border-primary ring-4 ring-primary/20 scale-[0.98]'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.title || 'Gallery image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Overlay info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                          <p className="text-white text-xs font-semibold truncate">
                            {item.title || 'Untitled'}
                          </p>
                          {item.category && (
                            <span className="text-[10px] text-amber-300 font-medium">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FROM DEVICE */}
          {activeTab === 'upload' && (
            <div className="max-w-xl mx-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Photo File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary transition-colors bg-gray-50/50">
                  {uploadPreview ? (
                    <div className="space-y-4">
                      <img
                        src={uploadPreview}
                        alt="Upload preview"
                        className="max-h-56 mx-auto rounded-xl shadow-md object-contain"
                      />
                      <label className="inline-block cursor-pointer px-4 py-2 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20">
                        Choose Another File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <div className="p-4 rounded-full bg-primary/10 text-primary mb-3">
                        <Upload className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        Click to browse or drag and drop image
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PNG, JPG, WEBP, GIF up to 10MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {uploadPreview && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Outreach Event 2026"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="Community">Community</option>
                      <option value="Events">Events</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIRECT WEB LINK */}
          {activeTab === 'url' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={directUrl}
                  onChange={(e) => {
                    setDirectUrl(e.target.value);
                    setSelectedUrl(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste any hosted image URL (Unsplash, Cloudinary, AWS S3, etc.)
                </p>
              </div>

              {directUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center">
                  <img
                    src={directUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/600x400?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate max-w-sm">
            {selectedUrl ? (
              <span className="flex items-center text-slate-700 font-medium">
                <Check className="w-3.5 h-3.5 text-green-600 mr-1.5" />
                Image selected
              </span>
            ) : (
              <span>Click on any image to select it</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            {activeTab === 'upload' && uploadPreview ? (
              <button
                type="button"
                disabled={uploadMutation.isPending}
                onClick={() => uploadMutation.mutate()}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all flex items-center space-x-2 disabled:opacity-60"
              >
                {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                <span>Use & Add to Gallery</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!selectedUrl}
                onClick={() => {
                  if (selectedUrl) {
                    onSelectImage(selectedUrl);
                    onClose();
                  }
                }}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Use Selected Image</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
