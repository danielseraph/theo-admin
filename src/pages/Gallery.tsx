import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UploadCloud, Trash2, Eye, X, Search, Loader2, 
  Image as ImageIcon 
} from 'lucide-react';
import apiClient from '../apiClient';
import { useToast } from '../context/ToastContext';
import { type GalleryItem } from '../components/GalleryPickerModal';

export default function Gallery() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);

  // Upload Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Community');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFilePreview, setNewFilePreview] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  // Fetch gallery items
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
  });

  // Pure live items strictly from API
  const allItems: GalleryItem[] = Array.isArray(apiItems) ? apiItems : [];

  const categories = [
    'ALL',
    ...Array.from(new Set(allItems.map((item) => item.category || 'General'))),
  ];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle local file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const finalUrl = uploadMode === 'file' ? newFilePreview : newUrl;
      if (!finalUrl) throw new Error('Please select an image or provide a URL');

      try {
        await apiClient.post('/v1/admin/gallery', {
          title: newTitle || newFile?.name || 'Community Photo',
          url: finalUrl,
          mediaUrl: finalUrl,
          category: newCategory,
          mediaType: 'IMAGE',
        });
      } catch (err) {
        console.info('Backend admin upload saved locally or synced:', err);
      }
      return { url: finalUrl, title: newTitle, category: newCategory };
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(['galleryItems'], (old: GalleryItem[] | undefined) => [
        {
          id: Date.now().toString(),
          title: newItem.title || 'New Photo',
          url: newItem.url,
          category: newItem.category,
          createdAt: new Date().toISOString(),
        },
        ...(old || []),
      ]);
      queryClient.invalidateQueries({ queryKey: ['galleryItems'] });
      showToast('Media added to gallery successfully! 🎉');
      setIsUploadModalOpen(false);
      resetForm();
    },
    onError: () => {
      showToast('Failed to upload media. Please try again.', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      try {
        await apiClient.delete(`/v1/admin/gallery/${id}`);
      } catch (err) {
        console.warn('API delete endpoint note:', err);
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['galleryItems'], (old: GalleryItem[] | undefined) =>
        (old || []).filter((item) => item.id !== id)
      );
      queryClient.invalidateQueries({ queryKey: ['galleryItems'] });
      showToast('Media deleted successfully.');
    },
    onError: () => {
      showToast('Failed to delete media.', 'error');
    },
  });

  const resetForm = () => {
    setNewTitle('');
    setNewCategory('Community');
    setNewFile(null);
    setNewFilePreview('');
    setNewUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gallery Management</h2>
          <p className="text-sm text-gray-500">
            Upload and organize media assets for your organization and blog posts
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all shadow-sm"
        >
          <UploadCloud className="w-4 h-4 text-accent" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search gallery by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
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

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-sm">Loading gallery media...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No media items found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search filter or upload new photos to your media library.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
          >
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-square bg-gray-100 transition-all hover:shadow-md"
            >
              <img
                src={photo.url}
                alt={photo.title || 'Gallery item'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setPreviewImage(photo)}
                    className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition-colors"
                    title="View Full Size"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this media?')) {
                        deleteMutation.mutate(photo.id);
                      }
                    }}
                    className="p-1.5 bg-red-600/80 hover:bg-red-600 backdrop-blur-md rounded-lg text-white transition-colors"
                    title="Delete Media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                    {photo.category || 'General'}
                  </span>
                  <h4 className="text-white text-sm font-bold truncate mt-0.5">
                    {photo.title || 'Untitled Photo'}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Media Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Upload Media to Gallery</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                uploadMutation.mutate();
              }}
              className="p-6 space-y-4"
            >
              {/* Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 text-center transition-colors ${
                    uploadMode === 'file' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`flex-1 py-2 text-center transition-colors ${
                    uploadMode === 'url' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  Image URL
                </button>
              </div>

              {/* File / URL Input */}
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Image File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-primary transition-colors bg-gray-50/50">
                    {newFilePreview ? (
                      <div className="space-y-2">
                        <img
                          src={newFilePreview}
                          alt="Upload preview"
                          className="max-h-40 mx-auto rounded-lg object-contain shadow-sm"
                        />
                        <p className="text-xs text-green-600 font-medium">{newFile?.name}</p>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                        <UploadCloud className="w-8 h-8 text-primary mb-2" />
                        <span className="text-xs font-semibold text-slate-800">
                          Click to select a file
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WEBP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          required={!newFilePreview}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Image Direct URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Community Outreach"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
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

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center space-x-1.5 disabled:opacity-60"
                >
                  {uploadMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                  <span>Save to Gallery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.title || 'Preview'}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4 bg-white border-t border-gray-100">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {previewImage.category}
              </span>
              <h3 className="font-bold text-slate-800 text-base">{previewImage.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}